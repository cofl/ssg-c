import { DataProvider, StaticDataTransformer } from "../DataItem";
import ignoreWalk from "../util/IngoreWalk";
import { relative, join, dirname, basename, resolve } from "path";
import { existsSync, statSync, realpathSync } from "fs";
import { DataContext } from "../Caisson";
import { DataInternalNode } from "../InternalDataNodes";
import Config from "../Config";

export class FileSystemProvider implements DataProvider
{
    private rootPath: string;
    constructor(path: string)
    {
        if(!existsSync(path))
            throw `Path must exist: ${path}`;
        if(!statSync(realpathSync(path)).isDirectory())
            throw `Path must be a directory or a link to a directory: ${path}`;
        this.rootPath = path;
    }

    configure(config: Config): void
    {
        this.rootPath = resolve(config.rootDirectory, this.rootPath);
    }

    async populate({ templates, dataTransformers }: DataContext, root: DataInternalNode): Promise<void>
    {
        for await(const filePath of ignoreWalk(this.rootPath, { ignoreFiles: [ '.caisson-ignore' ] }))
        {
            const relativePath = relative(this.rootPath, filePath).replace(/\\/g, '/');
            const dataPath = join(root.dataPath, relativePath).replace(/\\/g, '/');
            const parent = root.getInternalNodeAtPath(dirname(relativePath));

            const transformer = dataTransformers.find(transformer => transformer.applies(basename(filePath))) || StaticDataTransformer;
            const child = await transformer.transform(parent, dataPath, filePath);
            if(!child.isStatic && 'template' in child.data)
            {
                const templateName = child.data['template'];
                if(templateName in templates)
                    child.template = templates[templateName];
                else
                    console.error(`Reference to unknown template "${templateName}" in: ${filePath}`);
            }
            parent.children[child.name] = child;
        }
    }
}
