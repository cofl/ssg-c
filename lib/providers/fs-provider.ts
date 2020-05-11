import { StaticContentFile, ContentFile, ContentTree, ContentRoot } from "../ContentItem";
import { ContentProvider, ContentProviderMapping } from "../ContentProvider";
import { Options, ignoreWalk } from "../util/ignore-recursive";
import { join, relative, extname, isAbsolute, resolve } from "path";

import graymatter from "gray-matter";
import { Config } from "../Config";
import { DataTree } from "../DataTree";
import { existsSync, statSync } from "fs";

export class FileSystemProvider implements ContentProvider
{
    readonly path: string;
    readonly ignoreOptions: Options;
    constructor(basePath: string, config: Config, ignoreOptions?: Options)
    {
        if(!isAbsolute(basePath))
            throw `Path must be absolute: ${basePath}`;
        this.path = basePath;
        this.ignoreOptions = ignoreOptions || {
            ignoreFiles: [ `.${config.configTokenFragment}-ignore` ]
        };
    }

    static fromOptions(options: any, config: Config): FileSystemProvider
    {
        const root = options.basePath || options.root;
        if(!root)
            throw "Missing required option \"basePath\", or alias \"root\".";
        const resolved = resolve(root);
        if(!existsSync(resolved))
            throw `Path must exist: ${resolved}`;
        if(!statSync(resolved).isDirectory())
            throw `Path must be a directory: ${resolved}`;
        return new FileSystemProvider(resolved, config, options.ignoreOptions);
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
                const item = new ContentFile(new DataTree(data), root, permalink, filePath, content);
                root.addItem(item);
            } else
            {
                const item = new StaticContentFile(root, permalink, filePath);
                root.addItem(item);
            }
        }

        return [];
    }
}
