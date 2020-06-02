import { DataContext } from "./Caisson";
import { basename } from "path";
import { DataInternalNode } from "./InternalDataNodes";
import { Template } from "./Template";

export interface DataItem
{
    parent: DataInternalNode;
    readonly data: any;
    readonly name: string;
    readonly path: string;
}

export interface StaticContentItem extends DataItem
{
    readonly isStatic: true;
    readonly filePath: string;
}

export interface ContentItem extends DataItem
{
    readonly isStatic: false;
    content: string;
    template?: Template;
}

export interface FileContentItem extends ContentItem
{
    readonly filePath: string;
}

export interface DataProvider
{
    populate(context: DataContext, root: DataInternalNode): void | Promise<void>;
}

export interface DataTransformer
{
    applies(fileName: string): boolean,
    transform(parent: DataInternalNode, path: string, filePath: string): ContentItem | StaticContentItem | Promise<ContentItem | StaticContentItem>
}

export const StaticDataTransformer: DataTransformer =
{
    applies(_fileName: string) { return true; },
    transform(parent: DataInternalNode, path: string, filePath: string): StaticContentItem {
        return {
            isStatic: true,
            path, parent, filePath,
            data: {},
            name: basename(filePath)
        };
    }
};
