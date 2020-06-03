import { DataTreeNode, DataInternalNode } from "./DataTreeInternalNode";
import { basename } from "path";
import { Template } from "./Template";
import { writeFile, copyFile } from "fs";
import { RenderContext } from "./Caisson";
import { promisify } from "util";

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

    render(context: RenderContext, outputPath: string): Promise<void>;
}

export function isDataLeafNode(item: any): item is DataLeafNode
{
    return item.isInternalNode === false && item.nodeType !== undefined;
}

const copyFilePromisfied = promisify(copyFile);
const writeFilePromisified = promisify(writeFile);

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

    render(context: RenderContext, outputPath: string)
    {
        return copyFilePromisfied(this.filePath, outputPath);
    }
}

export function isStaticContentItem(item: any): item is StaticContentItem
{
    return isDataLeafNode(item) && item.nodeType === DataLeafNodeType.Static;
}

export abstract class ContentItem implements DataLeafNode
{
    readonly isInternalNode: false = false;
    name: string;
    template?: Template;
    constructor(public readonly nodeType: DataLeafNodeType.File | DataLeafNodeType.Generated,
                public readonly path: string,
                public readonly data: any,
                public readonly content: string)
    {
        this.name = basename(path);
    }

    get permalink(): string
    {
        return this.data?.permalink || this.path;
    }

    render(_context: RenderContext, outputPath: string): Promise<void> {
        return writeFilePromisified(outputPath, this.content);
    }
}
