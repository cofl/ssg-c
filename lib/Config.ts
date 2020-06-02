import { DataProvider, TemplateProvider, TemplateTransformer, DataTransformer } from "./Providers";
import { FileSystemProvider } from "./Providers/FileSystemProvider";
import { join } from "path";
import { FileSystemTemplateProvider } from "./Providers/FileSystemTemplateProvider";
import { asMaybeArray } from "./util/Util";

interface Paths
{
    content?: string | string[];
    templates?: string | string[];
}

export interface ConfigObjectOptions
{
    providers?: Record<string, DataProvider> | Record<string, DataProvider>[];
    paths?: Paths;
    templateTransformers?: TemplateTransformer | TemplateTransformer[];
    doDeepMerge?: boolean;
    locale?: string;
    defaultEncoding?: BufferEncoding;
}

export default class Config
{
    readonly rootDirectory: string;
    readonly dataProviders: Record<string, DataProvider>[] = [];
    readonly dataTransformers: DataTransformer[] = [];
    readonly templateProviders: TemplateProvider[] = [];
    readonly templateTransformers: TemplateTransformer[] = [];

    defaultEncoding: BufferEncoding;
    doDeepMerge: boolean = false;
    locale: string | undefined;

    constructor(config: Partial<Config>)
    {
        this.rootDirectory = config.rootDirectory || process.cwd();
        this.defaultEncoding = config.defaultEncoding || 'utf-8';
        this.locale = config.locale;
        if(config.dataProviders)
            this.dataProviders.push(...config.dataProviders);
        if(config.dataTransformers)
            this.dataTransformers.push(...config.dataTransformers);
        if(config.templateProviders)
            this.templateProviders.push(...config.templateProviders);
        if(config.templateTransformers)
            this.templateTransformers.push(...config.templateTransformers);

        this.doDeepMerge = config.doDeepMerge || false;
    }

    normalizeAndUseConventionIfNotConfigured(): Config
    {
        if(this.dataProviders.length == 0)
        {
            this.dataProviders.push({ '/': new FileSystemProvider(join(this.rootDirectory, 'content')) });
            this.dataProviders.push({ '/inner': new FileSystemProvider(join(this.rootDirectory, 'other')) });
        }
        if(this.templateProviders.length === 0)
        {
            // TODO: actually register a template provider, not this weird fake one
            // TODO: a template provider should provide templates of a specific type
                    // or should it... should there be "template" providers that this uses
                    // to match by extension a template file to an application function
            this.templateProviders.push(new FileSystemTemplateProvider(join(this.rootDirectory, 'templates')));
        }
        return this;
    }

    importOptions(options: ConfigObjectOptions): Config
    {
        this.dataProviders.push(...asMaybeArray(options.providers));
        this.dataProviders.unshift(...asMaybeArray(options.paths?.content)
            .map(path => ({ '/': new FileSystemProvider(join(this.rootDirectory, path)) })));
        this.templateProviders.unshift(...asMaybeArray(options.paths?.templates)
            .map(path => new FileSystemTemplateProvider(join(this.rootDirectory, path))));
        this.templateTransformers.unshift(...asMaybeArray(options.templateTransformers));
        if('defaultEncoding' in options)
            this.defaultEncoding = options.defaultEncoding!;
        if('doDeepMerge' in options)
            this.doDeepMerge = options.doDeepMerge!;
        if('locale' in options)
            this.locale = options.locale;
        return this;
    }
}
