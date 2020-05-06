import { ContentRoot, ContentTree } from "./ContentItem";

export interface ContentProvider
{
    populate(root: ContentRoot, base: ContentTree): void;
}
