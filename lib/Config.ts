import { FileContentTransformer } from "./ContentTransformer";
import MarkdownContentTransformer from "./transformers/md-transformer";
import { Provider, ProviderMapping, ProviderProviderFn } from "./Provider";
import { FileSystemProvider } from "./providers/fs-provider";
import path from "path";
import fs from "fs";
import deepmerge from "deepmerge";

export interface ObjectProviderOptions
{
    type: string;
}

export function isObjectProviderOptions(options: any): options is ObjectProviderOptions
{
    return options.type !== undefined;
}

export type ObjectProviderMapping = Record<string, ObjectProviderOptions>;

export interface ObjectOptions
{
    providers?: ObjectProviderMapping | ObjectProviderMapping[];
}

export interface PathOptions
{
    content?: string;
    data?: string;
}

export class Config
{
    readonly rootDirectory: string;
    readonly configTokenFragment: string;
    readonly defaultEncoding: BufferEncoding;
    readonly pathPrefix: string;
    readonly locale: string | undefined;

    constructor(options: {
        rootDirectory?: string,
        configTokenFragment?: string,
        defaultEncoding?: BufferEncoding,
        pathPrefix?: string,
        locale?: string
    } = {})
    {
        this.rootDirectory = options.rootDirectory || process.cwd();
        this.configTokenFragment = options.configTokenFragment || 'ssgc';
        this.defaultEncoding = options.defaultEncoding || 'utf-8';
        this.pathPrefix = options.pathPrefix || '';
        this.locale = options.locale;
    }

    dataDeepMerge: true | false = false;
    providers: ProviderMapping = [];
    providerTypes: Record<string, ProviderProviderFn> = {
        "FileSystemProvider": FileSystemProvider.fromOptions,
        "fs": FileSystemProvider.fromOptions
    };
    globalData: any = {};

    // TODO: ditch this, it's bad.
    get fileTransformers(): Record<string, FileContentTransformer> {
        return {
            ".md": new MarkdownContentTransformer()
        };
    }

    get providersOrDefault(): ProviderMapping
    {
        if(this.providers.length > 0)
            return this.providers;
        return [
            { "/": new FileSystemProvider(this.rootDirectory, this) }
        ]
    }

    merge(...objects: object[])
    {
        if(!this.dataDeepMerge)
            return Object.assign({}, objects);
        let result = {};
        for(const obj of objects)
            result = deepmerge(result, obj);
        return result;
    }

    registerProviderType(providerName: string, providerFn: ProviderProviderFn): Config
    {
        if(providerName in this.providerTypes)
            throw `Cannot register duplicate provider type ${providerName}`;
        this.providerTypes[providerName] = providerFn;
        return this;
    }

    registerContentProvider(permalink: string, provider: Provider): Config
    {
        this.providers.push({ [permalink]: provider });
        return this;
    }

    resolveRealFile(pathRelativeToRoot: string): string | null
    {
        pathRelativeToRoot = './' + path.normalize(pathRelativeToRoot);
        pathRelativeToRoot = path.resolve(this.rootDirectory, pathRelativeToRoot);
        if(fs.existsSync(pathRelativeToRoot) && fs.statSync(pathRelativeToRoot).isFile())
            return pathRelativeToRoot;
        return null;
    }

    importOptions(objectOptions: ObjectOptions): Config
    {
        if(typeof objectOptions !== 'object')
            throw "Imported options parameter was not an object.";
        if(objectOptions.providers)
        {
            const providers = Array.isArray(objectOptions.providers) ? objectOptions.providers : [ objectOptions.providers ];
            for(const providerMapping of providers)
            {
                for(const permalink in providerMapping)
                {
                    const providerOptions = providerMapping[permalink];
                    if(!isObjectProviderOptions(providerOptions))
                        throw `Missing provider type from mapping for permalink "${permalink}"`;
                    if(!(providerOptions.type in this.providerTypes))
                        throw `Provider type "${providerOptions.type}" is not registered.`;
                    this.registerContentProvider(permalink, this.providerTypes[providerOptions.type](providerOptions, this));
                }
            }
        }
        // TODO: options
        // TODO: global data (resolving paths and merging according to options)
        return this;
    }
}
