import { DataContext } from "./Caisson";
import { DataInternalNode } from "./InternalDataNodes";
import { StaticContentItem, ContentItem } from "./ContentItem";
import { MaybePromise, PartialBy } from "./util/Util";
import Config from "./Config";

export interface DataItem
{
    readonly parent: DataInternalNode;
    readonly data: any;
    readonly name: string;
    readonly dataPath: string;
}

export interface FileContentItem extends ContentItem
{
    readonly filePath: string;
}

export interface DataProvider
{
    populate(context: DataContext, root: DataInternalNode): MaybePromise<void>;
    configure(config: Config): MaybePromise<void>;
}

export interface DataTransformer
{
    applies(fileName: string): boolean,
    transform(parent: DataInternalNode, path: string, filePath: string): MaybePromise<PartialBy<ContentItem, 'template'> | StaticContentItem>
}

export const StaticDataTransformer: DataTransformer =
{
    applies(_fileName: string) { return true; },
    transform(parent: DataInternalNode, path: string, filePath: string): StaticContentItem {
        return new StaticContentItem(parent, path, filePath);
    }
};
