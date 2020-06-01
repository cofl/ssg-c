import { DataProvider, DataTree, ContentItem, FileContentItem } from "../Providers";
import ignoreWalk from "../util/IngoreWalk";
import { relative, join, dirname, basename } from "path";
import { existsSync, statSync, realpathSync } from "fs";

export class FileSystemProvider implements DataProvider
{
    readonly rootPath: string;
    constructor(path: string)
    {
        if(!existsSync(path))
            throw `Path must exist: ${path}`;
        if(statSync(realpathSync(path)).isDirectory())
            throw `Path must be a directory or a link to a directory: ${path}`;
        this.rootPath = path;
    }

    async populate(context: any, root: DataTree): Promise<void>
    {
        for await(const filePath of ignoreWalk(this.rootPath, { ignoreFiles: [ '.caisson-ignore' ] }))
        {
            const relativePath = relative(this.rootPath, filePath).replace(/\\/g, '/');
            const dataPath = join(root.path, relativePath).replace(/\\/g, '/');
            const parentRelativePath = dirname(relativePath);
            const parent = root.getInternalNodeAtPath(parentRelativePath);

            const slug = basename(filePath);
            parent.children[slug] = {
                parent,
                data: {},
                name: slug,
                path: dataPath,
                filePath,
                content: ''
            } as FileContentItem;
        }
    }
}
