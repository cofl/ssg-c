import { DataTreeNode, DataInternalNode } from "./DataTreeInternalNode";
import { basename } from "path";
import { Template } from "./Template";
import { read } from "fs";

export enum DataLeafNodeType
{
    Static,
    File,
    Generated
}

export interface DataLeafNode extends DataTreeNode
{
    readonly isInternalNode: false;
    readonly nodeType: DataLeafNodeType;
    readonly data: any;
    readonly path: string;
    readonly name: string; // for use in data tree
    readonly permalink: string;
}

export function isDataLeafNode(item: any): item is DataLeafNode
{
    return item.isInternalNode === false && item.nodeType !== undefined;
}

export class StaticContentItem implements DataLeafNode
{
    readonly isInternalNode: false = false;
    readonly nodeType: DataLeafNodeType.Static = DataLeafNodeType.Static;
    readonly name: string;

    constructor(public readonly parent: DataInternalNode,
                public readonly path: string,
                public readonly filePath: string,
                public readonly data: any = {})
    {
        this.name = basename(filePath);
    }

    get permalink(): string
    {
        return this.data?.permalink || this.path;
    }
}

export function isStaticContentItem(item: any): item is StaticContentItem
{
    return isDataLeafNode(item) && item.nodeType === DataLeafNodeType.Static;
}

export interface ContentItem extends DataLeafNode
{
    readonly nodeType: DataLeafNodeType.File | DataLeafNodeType.Generated;
    content: string;
    template?: Template;
}
