import { ContentItem, ContentFile, ContentTree, ContentRoot } from "../ContentItem";
import { ContentProvider, ContentProviderMapping } from "../ContentProvider";
import { Options, ignoreWalk } from "../util/ignore-recursive";
import { join, relative, extname } from "path";

import graymatter from "gray-matter";
import { Config } from "../Config";
import { DataTree } from "../DataTree";

class StaticContentFile extends ContentItem
{
    readonly filePath: string;
    constructor(root: ContentRoot, permalink: string, filePath: string)
    {
        super(new DataTree(), root, permalink);
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

    async populate(root: ContentRoot, base: ContentTree, config: Config): Promise<ContentProviderMapping>
    {
        for await (const filePath of ignoreWalk(this.path, this.ignoreOptions))
        {
            const permalink = join(base.permalink, relative(this.path, filePath)).replace(/\\/g, '/');
            let transformer = config.fileTransformers[extname(permalink)];
            if(transformer?.fileType === 'TextWithFrontmatter')
            {
                //TODO: expose gray-matter options in provider or something
                const { data, content } = graymatter.read(filePath);
                const _ = new ContentFile(new DataTree(data), root, permalink, filePath, content);
            } else
            {
                const _ = new StaticContentFile(root, permalink, filePath);
            }
        }

        return [];
    }
}
