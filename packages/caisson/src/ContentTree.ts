import { DataTree, DataContentNode } from "./DataTree";
import { getPathAsComponents } from "./util/Util";
import { parse, posix } from "path";

export function isContentTree(candidate: any): candidate is ContentTree
{
    return candidate instanceof ContentTree;
}

export function isContentFile(candidate: any): candidate is ContentFile
{
    return candidate instanceof ContentFile;
}

export class ContentTree
{
    readonly children: Record<string, ContentTree | ContentFile> = {};
    readonly permalink: string;
    constructor(public readonly name: string = '/',
                public readonly parent?: ContentTree | undefined)
    {
        this.permalink = parent ? posix.join(parent.permalink, name) : name;
    }

    static fromData(data: DataTree): [ ContentTree, Record<string, ContentTree> ]
    {
        const root = new ContentTree();
        const lookupMap: Record<string, ContentTree> = { [root.permalink]: root};
        for(const item of data.leaves())
        {
            const permalink = item.permalink;
            if(permalink.endsWith('/') || permalink === '')
                throw `File name cannot be empty for permalink "${item.permalink}" from path "${item.path}"`;
            const { dir: directoryName, base: fileName } = parse(permalink);
            let current = root;
            if(directoryName in lookupMap)
                current = lookupMap[directoryName];
            else for(const name of getPathAsComponents(directoryName))
            {
                if(name in current.children)
                {
                    const child = current.children[name];
                    if(!isContentTree(child))
                        throw `Child ${name} of ${current.permalink} is not a directory.`;
                    current = child;
                } else
                {
                    // if it doesn't exist, create it.
                    const child = new ContentTree(name, current);
                    current.children[name] = child;
                    lookupMap[child.permalink] = child;
                    current = child;
                }
            }
            current.children[fileName] = new ContentFile(current, fileName, item);
        }
        return [ root, lookupMap ];
    }
}

export class ContentFile
{
    constructor(public readonly parent: ContentTree,
                public readonly name: string,
                public readonly item: DataContentNode)
    {
        // nop
    }

    get data(): any
    {
        return this.item.getComputedData();
    }

    get permalink(): string
    {
        return this.item.permalink;
    }

    siblingFiles(): ContentFile[]
    {
        return Object.values(this.parent.children).filter(isContentFile).filter(a => a.name != this.name);
    }
}
