import { ContentRoot, ContentTree } from "./ContentItem";
import { Config } from "./Config";

export interface ContentProvider
{
    populate(root: ContentRoot, base: ContentTree, config: Config): void;
}
