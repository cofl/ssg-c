import { DataItem } from "./DataItem";
import { DataInternalNode } from "./InternalDataNodes";
import { basename } from "path";
import { Template } from "./Template";

export interface DataLeafNode
{
    readonly isStatic: boolean;
    readonly permalink: string;
}

export class StaticContentItem implements DataItem, DataLeafNode
{
    readonly isStatic: true = true;
    readonly name: string;

    constructor(public readonly parent: DataInternalNode,
                public readonly dataPath: string,
                public readonly filePath: string,
                public readonly data: any = {})
    {
        this.name = basename(filePath);
    }

    get permalink(): string
    {
        return this.data?.permalink || this.dataPath;
    }
}

export interface ContentItem extends DataItem, DataLeafNode
{
    readonly isStatic: false;
    content: string;
    template?: Template;
}
