import { ContentFile } from "./ContentItem";

export type FileType = 'TextWithFrontmatter' | 'Text' | 'Binary';

export interface FileContentTransformer
{
    readonly fileType: FileType;
    transform(file: ContentFile): void;
}
