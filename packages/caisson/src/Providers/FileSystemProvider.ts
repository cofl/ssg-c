import { DataProvider, StaticDataTransformer } from "../DataItem";
import ignoreWalk from "../util/IngoreWalk";
import { relative, join, dirname, basename, resolve } from "path";
import { existsSync, statSync, realpathSync, readFileSync } from "fs";
import { DataContext } from "../Caisson";
import { DataInternalNode } from "../DataTreeInternalNode";
import { Config } from "../Config";
import { isStaticContentItem } from "../DataTreeLeafNode";
import graymatter from "gray-matter";

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

    async populate({ caisson, templates, dataTransformers }: DataContext, root: DataInternalNode): Promise<void>
    {
        for await(const filePath of ignoreWalk(this.rootPath, { ignoreFiles: [ '.caisson-ignore' ] }))
        {
            const relativePath = relative(this.rootPath, filePath).replace(/\\/g, '/');
            const dataPath = join(root.path, relativePath).replace(/\\/g, '/');
            const parent = root.getInternalNodeAtPath(dirname(relativePath));

            if(caisson.fileExtensionsWithMatter.test(filePath))
            {
                const { data, content } = graymatter(readFileSync(filePath, { encoding: caisson.encoding }))
                // TOOD: frontmatter
            } else
            {
                // TODO: static
            }
            const transformer = dataTransformers.find(transformer => transformer.applies(basename(filePath))) || StaticDataTransformer;
            const child = await transformer.transform(parent, dataPath, filePath);
            if(!isStaticContentItem(child) && 'template' in child.data)
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
