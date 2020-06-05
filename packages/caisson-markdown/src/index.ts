import { CaissonPluginLoader, DataTransformer, DataInternalNode, ContentItem, DataLeafNodeType, RenderContext } from "@cofl/caisson";
import graymatter from "gray-matter";
import remark from "remark";
import { readFileSync } from "fs";

export = function register(loader: CaissonPluginLoader): void | Promise<void> {
    // TODO: options
    const processor: (file: string) => Promise<any> = remark().use(require("remark-html")).process;
    loader.registerDataTransformer(new MarkdownDataTransformer(processor));
}

class MarkdownContentItem extends ContentItem
{
    constructor(path: string,
                public readonly filePath: string,
                data: any,
                content: string)
    {
        super(DataLeafNodeType.File, path, data, content);
    }
}

class MarkdownDataTransformer implements DataTransformer
{
    constructor(private readonly processor: (file: string) => Promise<any>){}
    applies(fileName: string): boolean
    {
        return /\.(md|markdown)$/i.test(fileName);
    }

    async transform(parent: DataInternalNode, path: string, filePath: string): Promise<ContentItem>
    {
        const { data, content } = graymatter(readFileSync(filePath));
        return new MarkdownContentItem(path.replace(/\.(md|markdown)$/, '.html'), filePath, data, String(await this.processor(content)));
    }
}
