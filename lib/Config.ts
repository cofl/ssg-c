import { FileContentTransformer } from "./ContentTransformer";
import MarkdownContentTransformer from "./transformers/md-transformer";

export class Config
{
    private parent: Config | null;
    constructor(parent: Config | null = null)
    {
        this.parent = parent;
    }

    get fileTransformers(): Record<string, FileContentTransformer> {
        return {
            "md": new MarkdownContentTransformer()
        };
    }
}
