import { ContentTree } from "./ContentItem";
import { SSGC } from "./SSGC";

export type ContentProviderMapping = Record<string, ContentProvider>[];

export interface ContentProvider
{
    populate(ssgc: SSGC, base: ContentTree): Promise<ContentProviderMapping>;
}
