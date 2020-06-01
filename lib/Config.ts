import { DataProvider, TemplateProvider } from "./Providers";
import { FileSystemProvider } from "./Providers/FileSystemProvider";
import { join } from "path";
import { FileSystemTemplateProvider } from "./Providers/FileSystemTemplateProvider";

export default class Config
{
    readonly rootDirectory: string;
    readonly defaultEncoding: BufferEncoding;
    readonly locale: string | undefined;

    dataProviders: Record<string, DataProvider>[] = [];
    templateProviders: TemplateProvider[] = [];
    doDeepMerge: boolean = false;

    constructor(path: string, defaultEncoding?: BufferEncoding, locale?: string)
    {
        this.rootDirectory = path || process.cwd();
        this.defaultEncoding = defaultEncoding || 'utf-8';
        this.locale = locale;
    }
    // TODO

    normalizeAndUseConventionIfNotConfigured(): Config
    {
        this.dataProviders = this.dataProviders.filter((value) => Object.keys(value).length > 0);
        if(this.dataProviders.length == 0)
        {
            this.dataProviders.push({ '': new FileSystemProvider(join(this.rootDirectory, 'content')) });
            this.dataProviders.push({ 'inner': new FileSystemProvider(join(this.rootDirectory, 'other')) });
        }
        if(this.templateProviders.length == 0)
        {
            // TODO: actually register a template provider, not this weird fake one
            // TODO: a template provider should provide templates of a specific type
            this.templateProviders.push(new FileSystemTemplateProvider(join(this.rootDirectory, 'templates')));
        }
        return this;
    }
}
