import { posix } from "path";
import { DataItem } from "./DataItem";

function getPathAsComponents(path: string): string[]
{
    if(path[0] === '/')
        path = path.slice(1);
    const components = path.split('/');
    if(components[0].length === 0)
        components.shift();
    return components;
}

export interface DataInternalNode
{
    readonly dataPath: string;
    readonly children: Record<string, DataItem>;
    leaves(): Generator<DataItem, void, undefined>;
    getInternalNodeAtPath(path: string): DataInternalNode;
}
export function isDataInternalNode(item: any): item is DataInternalNode
{
    return item.dataPath !== undefined &&
            item.children !== undefined &&
            typeof item.leaves === 'function';
}

const leaves = function*(this: DataInternalNode): Generator<DataItem, void, undefined> {
    const queue: DataInternalNode[] = [ this ];
    while(queue.length > 0)
    {
        const current = queue.shift()!;
        for(const key in current.children)
        {
            const item = current.children[key];
            if(isDataInternalNode(item))
                queue.push(item);
            else
                yield item;
        }
    }
};

const getInternalNodeAtPath = function(this: DataInternalNode, path: string): DataInternalNode
{
    const components = getPathAsComponents(posix.resolve(this.dataPath, path).substring(this.dataPath.length));
    let current: DataInternalNode = this;
    for(const name of components)
    {
        if(name in current.children)
        {
            const child: any = current.children[name];
            if(isDataInternalNode(child))
                current = child;
            else
                throw `Child "${name}" of "${current.dataPath}" is not an internal node.`
        } else
        {
            // if it doesn't exist, create it.
            const child: DataTree = new DataTree(current, name);
            current.children[name] = child;
            current = child;
        }
    }
    return current;
};

export class DataRoot implements DataInternalNode
{
    readonly data: any;
    readonly dataPath: string;
    readonly children: Record<string, DataItem> = {};

    constructor(data: any, path: string)
    {
        this.data = data;
        this.dataPath = path;
    }

    leaves: typeof leaves = leaves.bind(this);
    getInternalNodeAtPath: typeof getInternalNodeAtPath = getInternalNodeAtPath.bind(this);
}

export class DataTree implements DataItem, DataInternalNode
{
    readonly parent: DataInternalNode;
    readonly data: any;
    readonly name: string;
    readonly dataPath: string;
    readonly children: Record<string, DataItem> = {};

    constructor(parent: DataInternalNode, name: string, data: any = {})
    {
        this.parent = parent;
        this.name = name;
        this.data = data;
        this.dataPath = posix.join(parent.dataPath, name);
    }

    leaves: typeof leaves = leaves.bind(this);
    getInternalNodeAtPath: typeof getInternalNodeAtPath = getInternalNodeAtPath.bind(this);
}
