import { ContentItem, ContentTree, ContentRoot } from "../ContentItem";
import { ContentProvider } from "../ContentProvider";
import { Options, ignoreWalk } from "../util/ignore-recursive";
import { join, relative } from "path";

export class ContentFile extends ContentItem
{
    readonly filePath: string;
    constructor(root: ContentRoot, permalink: string, filePath: string)
    {
        super(root, permalink);
        this.filePath = filePath;
        this.parent?.children.push(this);
    }

    render()
    {
        console.log(this.permalink);
    }
}

export class FileSystemProvider implements ContentProvider
{
    readonly path: string;
    readonly ignoreOptions: Options;
    constructor(basePath: string, ignoreOptions?: Options)
    {
        this.path = basePath;
        this.ignoreOptions = ignoreOptions || {
            ignoreFiles: [ '.gitignore' ]
        };
    }

    async populate(root: ContentRoot, base: ContentTree)
    {
        for await (const filePath of ignoreWalk(this.path, this.ignoreOptions))
        {
            let permalink = join(base.permalink, relative(this.path, filePath)).replace(/\\/g, '/');
            new ContentFile(root, permalink, filePath);
        }
    }
}
