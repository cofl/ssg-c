import { TemplateContext } from "./Caisson";
import { Config } from "./Config";
import { DataContentNode } from "./DataTree";
import { basename } from "path";

export interface Template
{
    parent?: Template;
    readonly data: any;
    readonly name: string;
    readonly path?: string;
    process(item: DataContentNode): void;
}

export interface TemplateProvider
{
    getTemplates(context: TemplateContext): AsyncGenerator<Template, void, undefined>;
    configure(config: Config): void | Promise<void>
}

export interface TemplateTransformer
{
    // TODO: should this take a MIME type?
    applies(fileName: string): boolean,
    transform(filePath: string): Template | Promise<Template>
}

export class DefaultTemplate implements Template
{
    data: any = {};
    name: string = '';
    path: string = '';
    process(item: DataContentNode): void {
        // nop
    }
}

export const JSTemplateTransformer: TemplateTransformer = {
    applies(fileName: string): boolean
    {
        return /\.js$/i.test(fileName);
    },
    async transform(filePath: string): Promise<Template>
    {
        const template = require(filePath);
        if(typeof template === 'string' || template instanceof Buffer || template.then)
        {
            return {
                data: {}, name: basename(filePath), path: filePath,
                process(item: DataContentNode){ item.content.content = template; }
            };
        } else if(typeof template === 'function')
        {
            if(template.prototype && 'process' in template.prototype)
            {
                const instance = new template() as { process(item: DataContentNode): void | Promise<void>, data: object | Promise<object> };
                const data = 'data' in template.prototype
                                ? (typeof instance.data === 'function'
                                        ? await instance.data()
                                        : await instance.data)
                                : {};
                return {
                    data, name: basename(filePath), path: filePath,
                    process(item: DataContentNode){ return instance.process(item) }
                };
            } else
            {
                return {
                    data: {}, name: basename(filePath), path: filePath,
                    process: template as ((item: DataContentNode) => void | Promise<void>)
                };
            }
        } else
        {
            throw `Unrecognized template object type ${typeof template}`
        }
    }
};
