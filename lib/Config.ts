import { FileContentTransformer } from "./ContentTransformer";
import MarkdownContentTransformer from "./transformers/md-transformer";
import { ContentProviderMapping } from "./ContentProvider";

export class Config
{
    private parent: Config | null; // does config need a parent?
    constructor(parent: Config | null = null)
    {
        this.parent = parent;
    }

    dataDeepMerge: true | false = false;
    contentProviders: ContentProviderMapping = [];

    // TODO: ditch this, it's bad.
    get fileTransformers(): Record<string, FileContentTransformer> {
        return {
            "md": new MarkdownContentTransformer()
        };
    }
}
