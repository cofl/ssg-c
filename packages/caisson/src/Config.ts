import { DataProvider, DataTransformer } from "./DataItem";
import { FileSystemProvider } from "./Providers/FileSystemProvider";
import { join, resolve } from "path";
import { FileSystemTemplateProvider } from "./Providers/FileSystemTemplateProvider";
import { asMaybeArray, MaybeArray } from "./util/Util";
import { TemplateTransformer, TemplateProvider } from "./Template";

interface Paths
{
    content?: string | string[];
    templates?: string | string[];
    output?: string;
}

export interface ConfigObjectOptions
{
    providers?: MaybeArray<Record<string, string | DataProvider>>;
    paths?: Paths;
    templateTransformers?: TemplateTransformer | TemplateTransformer[];
    doDeepMerge?: boolean;
    locale?: string;
    defaultEncoding?: BufferEncoding;
}

export class Config
{
    readonly rootDirectory: string;
    readonly dataProviders: Record<string, DataProvider>[] = [];
    readonly dataTransformers: DataTransformer[] = [];
    readonly templateProviders: TemplateProvider[] = [];
    readonly templateTransformers: TemplateTransformer[] = [];

    defaultEncoding: BufferEncoding;
    doDeepMerge: boolean = false;
    locale: string | undefined;
    private _outputDirectory: string;

    get outputDirectory(): string { return this._outputDirectory; }

    constructor(config: Partial<Config> = {})
    {
        this.rootDirectory = config.rootDirectory || process.cwd();
        this._outputDirectory = config.outputDirectory || join(this.rootDirectory, 'build')
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
        if(undefined !== config.doDeepMerge)
            this.doDeepMerge = config.doDeepMerge;
    }

    normalizeAndUseConventionIfNotConfigured(): Config
    {
        if(this.dataProviders.length == 0)
            this.dataProviders.push({ '/': new FileSystemProvider('content') });
        for(const mapping of this.dataProviders)
            for(const provider of Object.values(mapping))
                provider.configure(this);
        if(this.templateProviders.length === 0)
            this.templateProviders.push(new FileSystemTemplateProvider('templates'));
        for(const provider of this.templateProviders)
            provider.configure(this);
        return this;
    }

    importOptions(options: ConfigObjectOptions): Config
    {
        const newProviders = asMaybeArray(options.providers).map(mapping => {
            for(const basePath in mapping)
            {
                const value = mapping[basePath];
                if(typeof value === 'string')
                    mapping[basePath] = new FileSystemProvider(value);
            }
            return mapping as Record<string, DataProvider>;
        });
        this.dataProviders.push(...newProviders);
        if(options.paths)
        {
            this.dataProviders.unshift(...asMaybeArray(options.paths.content)
                .map(path => ({ '/': new FileSystemProvider(join(this.rootDirectory, path)) })));
            this.templateProviders.unshift(...asMaybeArray(options.paths.templates)
                .map(path => new FileSystemTemplateProvider(join(this.rootDirectory, path))));
            if(options.paths.output)
                this._outputDirectory = resolve(this.rootDirectory, options.paths.output);
        }
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
