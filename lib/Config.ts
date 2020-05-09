import { FileContentTransformer } from "./ContentTransformer";
import MarkdownContentTransformer from "./transformers/md-transformer";
import { ContentProviderMapping, ContentProvider } from "./ContentProvider";
import { FileSystemProvider } from "./providers/fs-provider";
import path from "path";
import fs from "fs";
import util from "util";

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

export class Config
{
    readonly rootDirectory: string;
    readonly configTokenFragment: string;
    readonly defaultEncoding: BufferEncoding;

    constructor(options: {
        rootDirectory?: string,
        configTokenFragment?: string,
        defaultEncoding?: BufferEncoding
    } = {})
    {
        this.rootDirectory = options.rootDirectory || process.cwd();
        this.configTokenFragment = options.configTokenFragment || 'ssgc';
        this.defaultEncoding = options.defaultEncoding || 'utf-8';
    }

    dataDeepMerge: true | false = false;
    contentProviders: ContentProviderMapping = [];
    contentProviderTypes: Record<string, (options: any) => ContentProvider> = {
        "FileSystemProvider": FileSystemProvider.fromOptions,
        "fs": FileSystemProvider.fromOptions
    };

    // TODO: ditch this, it's bad.
    get fileTransformers(): Record<string, FileContentTransformer> {
        return {
            "md": new MarkdownContentTransformer()
        };
    }

    get contentProvidersOrDefault(): ContentProviderMapping
    {
        if(this.contentProviders.length > 0)
            return this.contentProviders;
        return [
            { "/": new FileSystemProvider(this.rootDirectory) }
        ]
    }

    registerProviderType(providerName: string, constructorFn: (options: any) => ContentProvider): Config
    {
        if(providerName in this.contentProviderTypes)
            throw `Cannot register duplicate provider type ${providerName}`;
        this.contentProviderTypes[providerName] = constructorFn;
        return this;
    }

    registerContentProvider(permalink: string, provider: ContentProvider): Config
    {
        this.contentProviders.push({ [permalink]: provider });
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
                    if(!(providerOptions.type in this.contentProviderTypes))
                        throw `Provider type "${providerOptions.type}" is not registered.`;
                    this.registerContentProvider(permalink, this.contentProviderTypes[providerOptions.type](providerOptions));
                }
            }
        }
        // TODO: more options
        return this;
    }
}
