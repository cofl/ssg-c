import { ContentRoot, ContentTree } from "./ContentItem";
import { Config } from "./Config";

export type ContentProviderMapping = Record<string, ContentProvider>[];

export interface ContentProvider
{
    populate(root: ContentRoot, base: ContentTree, config: Config): Promise<ContentProviderMapping>;
}
