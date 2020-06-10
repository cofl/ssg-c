import { basename, posix } from "path";
import { DataContext, RenderContext } from "./Caisson";
import { Config } from "./Config";
import { ContentItem } from "./ContentItem";
const { isAbsolute, resolve, relative } = posix;

export interface DataProvider
{
    populate(context: DataContext, root: DataTree): void | Promise<void>;
    configure(config: Config): void | Promise<void>;
}

export enum DataNodeType
{
    Internal,
    Configuration,
    Content
}

export interface DataNode
{
    readonly nodeType: DataNodeType;
    readonly path: string;
    readonly name: string;
    readonly data?: object;
    parent?: DataInternalNode;

    getComputedData(): object;
}

export type DataInternalNode = DataTree | DataConfigurationNode;

export class DataTree implements DataNode
{
    readonly nodeType: DataNodeType.Internal = DataNodeType.Internal;
    readonly name: string;
    readonly children: Record<string, DataNode> = {};

    constructor(public readonly path: string,
                public readonly parent: DataInternalNode | undefined,
                public readonly data: object = {})
    {
        this.name = basename(path);
    }

    getComputedData(): object
    {
        return this.data; // TODO: merge with parent
    }

    *leaves(): Generator<DataContentNode, void, undefined>
    {
        const queue: DataTree[] = [ this ];
        while(queue.length > 0)
        {
            const current = queue.shift()!;
            for(const key in current.children)
            {
                const item = current.children[key];
                if(item instanceof DataTree)
                    queue.push(item);
                else if(item instanceof DataContentNode)
                    yield item;
                else if(item instanceof DataConfigurationNode)
                {
                    let node = item.child;
                    while(node instanceof DataConfigurationNode)
                        node = node.child;
                    if(node instanceof DataTree)
                        queue.push(node);
                    else if(node instanceof DataContentNode)
                        yield node;
                    else throw `Unknown data tree node type at path: ${node.path}`;
                } else throw `Unknown data tree node type at path: ${item.path}`;
            }
        }
    }

    getOrCreateTreeAtPath(path: string): DataTree
    {
        const absolutePath = isAbsolute(path) ? path : resolve(this.path, path);
        const relativePath = relative(this.path, absolutePath);
        const components = relativePath.split('/');
        let node: DataInternalNode = this;
        while(components.length > 0 && components[0] === '..')
        {
            components.shift(); // discard ..
            if(undefined === node.parent)
                throw `Cannot find node at: ${resolve(this.path, path)}`
            let parent: DataInternalNode = node.parent;
            while(parent instanceof DataConfigurationNode)
                parent = parent.parent;
            node = parent;
        }
        for(const name of components)
        {
            if(name in node.children)
            {
                let child: DataNode = node.children[name];
                if(child instanceof DataTree)
                    node = child;
                else if(child instanceof DataContentNode)
                    throw `Child "${name}" of "${node.path}" is not an internal node.`
                else if(child instanceof DataConfigurationNode)
                {
                    while(child instanceof DataConfigurationNode)
                        child = child.child;
                    if(child instanceof DataTree)
                        node = child;
                    else throw `Child "${name}" of "${node.path}" is not an internal node.`;
                } else throw `Unknown data tree node type at path: ${node.path}`;
            } else
            {
                // if it doesn't exist, create it.
                const child: DataTree = new DataTree(absolutePath, node);
                node.children[child.name] = child;
                node = child;
            }
        }
        return node;
    }
}

export class DataConfigurationNode implements DataNode
{
    readonly nodeType: DataNodeType.Configuration = DataNodeType.Configuration;
    readonly name: string;

    constructor(public readonly path: string,
                public parent: DataInternalNode,
                public child: DataNode,
                public readonly data: object)
    {
        this.name = basename(path);
    }

    getComputedData(): object
    {
        return this.data; // TODO: merge with parent
    }
}

export class DataContentNode implements DataNode
{
    readonly nodeType: DataNodeType.Content = DataNodeType.Content;
    readonly name: string;

    constructor(public readonly path: string,
                public parent: DataInternalNode,
                public readonly content: ContentItem,
                public readonly data: object = {})
    {
        this.name = basename(path);
    }

    getComputedData(): object
    {
        return this.data; // TODO: merge with parent
    }

    get permalink(): string
    {
        return (this.getComputedData() as Record<string, string>).permalink || this.path;
    }

    render(context: RenderContext, outputPath: string): void | Promise<void>
    {
        return this.content.render(context, this, outputPath)
    }
}
