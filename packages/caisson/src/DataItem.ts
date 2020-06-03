import { DataContext } from "./Caisson";
import { MaybePromise, PartialBy } from "./util/Util";
import { Config } from "./Config";
import { DataInternalNode } from "./DataTreeInternalNode";
import { ContentItem, StaticContentItem } from "./DataTreeLeafNode";

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
