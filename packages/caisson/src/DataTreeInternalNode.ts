import { posix } from "path";
import { DataLeafNode } from "./DataTreeLeafNode";
import { getPathAsComponents } from "./util/Util";

export interface DataTreeNode
{
    readonly isInternalNode: boolean;
    readonly path: string;
}

export interface DataInternalNode extends DataTreeNode
{
    readonly isInternalNode: true;
    readonly children: Record<string, DataInternalNode | DataLeafNode>;
    readonly data: any;
    readonly path: string;
    leaves(): Generator<DataLeafNode, void, undefined>;
    getInternalNodeAtPath(path: string): DataInternalNode;
}

export function isDataInternalNode(item: any): item is DataInternalNode
{
    return item.path !== undefined &&
            item.children !== undefined &&
            item.isInternalNode === true;
}

export class DataRoot implements DataInternalNode
{
    readonly isInternalNode: true = true;
    readonly children: Record<string, DataInternalNode | DataLeafNode> = {};
    readonly data: any;
    readonly path: string;

    constructor(path: string, data?: any)
    {
        this.data = data || {};
        this.path = path;
    }

    *leaves(this: DataInternalNode): Generator<DataLeafNode, void, undefined> {
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

    getInternalNodeAtPath(this: DataInternalNode, path: string): DataInternalNode
    {
        const components = getPathAsComponents(posix.resolve(this.path, path).substring(this.path.length));
        let current: DataInternalNode = this;
        for(const name of components)
        {
            if(name in current.children)
            {
                const child: DataTreeNode | DataLeafNode = current.children[name];
                if(isDataInternalNode(child))
                    current = child;
                else
                    throw `Child "${name}" of "${current.path}" is not an internal node.`
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
}

export class DataTree extends DataRoot
{
    readonly parent: DataInternalNode;
    readonly name: string;

    constructor(parent: DataInternalNode, name: string, data?: any)
    {
        super(posix.join(parent.path, name), data);
        this.parent = parent;
        this.name = name;
    }
}
