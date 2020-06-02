import { ContentItem } from "./DataItem";
import { TemplateContext } from "./Caisson";

export interface Template
{
    parent?: Template;
    readonly data: any;
    readonly name: string;
    process(item: ContentItem): void;
    // TODO
}

export interface TemplateProvider
{
    getTemplates(context: TemplateContext): AsyncGenerator<Template, void, undefined>;
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
