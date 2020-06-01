import { Provider, ProviderMapping, ProviderProviderFn, DataProvider } from "./Provider";
import path from "path";
import fs from "fs";
import { MarkdownFileDataProvider, StaticFileDataProvider } from "./DataProvider";
import NewConfig from "../Config";

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

export class SSGC
{
    config: Config;
    readonly collator: Intl.Collator;

    constructor(config: Config)
    {
        this.config = config;
        this.collator = new Intl.Collator(config.locale);
    }

    async build()
    {
        // TODO: remove
    }
}

export class Config
{
    private readonly newConfig: NewConfig;
    asNewConfig(): NewConfig { return this.newConfig; }
    get rootDirectory(): string { return this.newConfig.rootDirectory }
    readonly configTokenFragment: string;
    get defaultEncoding(): BufferEncoding { return this.newConfig.defaultEncoding; }
    get locale(): string | undefined { return this.newConfig.locale; }

    constructor(options: {
        rootDirectory?: string,
        configTokenFragment?: string,
        defaultEncoding?: BufferEncoding,
        locale?: string
    } = {})
    {
        this.newConfig = new NewConfig(options.rootDirectory || process.cwd(), options.defaultEncoding, options.locale);
        this.configTokenFragment = options.configTokenFragment || 'ssgc';
    }

    dataDeepMerge: true | false = false;
    contentProviders: ProviderMapping = [];
    providerTypes: Record<string, ProviderProviderFn> = {
        //"FileSystemProvider": FileSystemProvider.fromOptions,
        //"fs": FileSystemProvider.fromOptions
    };
    globalData: any = {};
    dataProviders: DataProvider[] = [
        MarkdownFileDataProvider,
        StaticFileDataProvider
    ];

    get contentProvidersOrDefault(): ProviderMapping
    {
        if(this.contentProviders.length > 0)
            return this.contentProviders;
        return [
            //{ "/": new FileSystemProvider(this.rootDirectory, this) }
        ]
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
        this.contentProviders.push({ [permalink]: provider });
        return this;
    }

    registerDataProvider(...provider: DataProvider[]): Config
    {
        this.dataProviders.unshift(...provider);
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
