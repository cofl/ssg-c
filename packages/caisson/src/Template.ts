import { TemplateContext } from "./Caisson";
import { Config } from "./Config";
import { ContentItem } from "./DataTreeLeafNode";

export interface Template
{
    parent?: Template;
    readonly data: any;
    readonly name: string;
    process(item: ContentItem): void;
}

export interface TemplateProvider
{
    getTemplates(context: TemplateContext): AsyncGenerator<Template, void, undefined>;
    configure(config: Config): void | Promise<void>
}

export interface TemplateTransformer
{
    applies(fileName: string): boolean,
    transform(filePath: string): Template | Promise<Template>
}

export class DefaultTemplate implements Template
{
    data: any = {};
    name: string = '';
    path: string = '';
    process(item: ContentItem): void {
        // nop
    }
}
