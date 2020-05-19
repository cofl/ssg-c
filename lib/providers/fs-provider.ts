import { StaticContentFile, ContentFile, ContentTree } from "../ContentItem";
import { Provider, ProviderMapping, ProviderItemType } from "../Provider";
import { Options, ignoreWalk } from "../util/ignore-recursive";
import { join, relative, extname, isAbsolute, resolve, basename } from "path";

import graymatter from "gray-matter";
import { Config } from "../Config";
import { existsSync, statSync } from "fs";
import { SSGC } from "../SSGC";
import { DataTree } from "../DataTree";

export class FileSystemProvider implements Provider
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

    async *getItems(ssgc: SSGC, basePath: string): AsyncGenerator<ProviderItemType, void, undefined>
    {
        for await(const filePath of ignoreWalk(this.path, this.ignoreOptions))
        {
            const relativePath = relative(this.path, filePath);
            const dataPath = join(basePath, relativePath).replace(/\\/g, '/');
            // TODO: use content providers to generate a data or content item from a file.
            const fileName = basename(filePath);
            const transformer = ssgc.config.fileTransformers[extname(fileName)];
            if(transformer?.fileType === 'TextWithFrontmatter')
            {
                //TODO: expose gray-matter options in provider or something
                const { data, content } = graymatter.read(filePath);
                yield new DataTree(dataPath, data);
                yield { filePath, content };
            } else
            {
                yield { filePath };
            }
        }
    }
}
