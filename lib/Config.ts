import { FileContentTransformer } from "./ContentTransformer";
import MarkdownContentTransformer from "./transformers/md-transformer";
import { ContentProviderMapping } from "./ContentProvider";
import { FileSystemProvider } from "./providers/fs-provider";

export class Config
{
    readonly rootDirectory: string;
    constructor(options: {
        rootDirectory?: string
    } = {})
    {
        this.rootDirectory = options.rootDirectory || process.cwd();
    }

    dataDeepMerge: true | false = false;
    contentProviders: ContentProviderMapping = [];

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
}
