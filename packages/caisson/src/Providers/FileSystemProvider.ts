import ignoreWalk from "../util/IngoreWalk";
import { relative, join, dirname, resolve } from "path";
import { existsSync, statSync, realpathSync, readFileSync } from "fs";
import { DataContext } from "../Caisson";
import { Config } from "../Config";
import graymatter from "gray-matter";
import { DataContentNode, DataTree, DataProvider } from "../DataTree";
import { StaticContentItem, SomeContentItem } from "../ContentItem";

export class FileSystemProvider implements DataProvider
{
    private rootPath: string;
    constructor(path: string)
    {
        this.rootPath = path;
    }

    configure(config: Config): void
    {
        this.rootPath = resolve(config.rootDirectory, this.rootPath);

        if(!existsSync(this.rootPath))
            throw `Path must exist: ${this.rootPath}`;
        if(!statSync(realpathSync(this.rootPath)).isDirectory())
            throw `Path must be a directory or a link to a directory: ${this.rootPath}`;
    }

    async populate({ caisson }: DataContext, root: DataTree): Promise<void>
    {
        for await(const filePath of ignoreWalk(this.rootPath, { ignoreFiles: [ '.caisson-ignore' ] }))
        {
            const relativePath = relative(this.rootPath, filePath).replace(/\\/g, '/');
            const dataPath = join(root.path, relativePath).replace(/\\/g, '/');
            const parent = root.getOrCreateTreeAtPath(dirname(relativePath));

            if(caisson.hasMatter(filePath))
            {
                const { data, content } = graymatter(readFileSync(filePath, { encoding: caisson.encoding }));
                const child = new DataContentNode(dataPath, parent, SomeContentItem(filePath, content), data);
                parent.children[child.name] = child;
            } else
            {
                const child = new DataContentNode(dataPath, parent, StaticContentItem(filePath));
                parent.children[child.name] = child;
            }
        }
    }
}
