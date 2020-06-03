import { DataContext } from "./Caisson";
import { PartialBy } from "./util/Util";
import { Config } from "./Config";
import { DataInternalNode } from "./DataTreeInternalNode";
import { ContentItem, StaticContentItem } from "./DataTreeLeafNode";

export interface DataProvider
{
    populate(context: DataContext, root: DataInternalNode): void | Promise<void>;
    configure(config: Config): void | Promise<void>;
}

export type DataTransformerReturnType = PartialBy<ContentItem, 'template'> | StaticContentItem;
export interface DataTransformer
{
    applies(fileName: string): boolean,
    transform(parent: DataInternalNode, path: string, filePath: string): DataTransformerReturnType | Promise<DataTransformerReturnType>;
}

export const StaticDataTransformer: DataTransformer =
{
    applies(_fileName: string) { return true; },
    transform(parent: DataInternalNode, path: string, filePath: string): StaticContentItem {
        return new StaticContentItem(parent, path, filePath);
    }
};
