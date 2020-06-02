import { TemplateContext } from "./Caisson";
import { ContentItem } from "./ContentItem";
import Config from "./Config";
import { MaybePromise } from "./util/Util";

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
    configure(config: Config): MaybePromise<void>
}

export interface TemplateTransformer
{
    applies(fileName: string): boolean,
    transform(filePath: string): MaybePromise<Template>
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
