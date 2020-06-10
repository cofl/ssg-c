import { RenderContext } from "./Caisson";
import { lookup as lookupMime } from "mime-types";
import { promisify } from "util";
import { constants as fsConstants, copyFile, writeFile } from "fs";
import { DataContentNode } from "./DataTree";
const { COPYFILE_FICLONE } = fsConstants;

export type ContentItem = FileContentItem | GeneratedContentItem;

interface ContentItemCommon
{
    contentType: string;
    // TODO: separate rendering from content items
    render(context: RenderContext, node: DataContentNode, outputPath: string): void | Promise<void>
}

export interface FileContentItem extends ContentItemCommon
{
    readonly filePath: string;
    content?: Buffer | string;
}

export interface GeneratedContentItem extends ContentItemCommon
{
    readonly source: string;
    content: Buffer | string;
}

const copyFilePromisified = promisify(copyFile);
const writeFilePromisified = promisify(writeFile);
export function StaticContentItem(filePath: string): FileContentItem
{
    return {
        filePath, contentType: lookupMime(filePath) || 'application/octet-stream',
        render: (_context: RenderContext, _node: DataContentNode, outputPath: string): Promise<void> =>
            copyFilePromisified(filePath, outputPath, COPYFILE_FICLONE)
    }
}

export function SomeContentItem(filePath: string, content: Buffer | string): FileContentItem
{
    return {
        filePath, content, contentType: lookupMime(filePath) || 'application/octet-stream',
        render: (_context: RenderContext, _node: DataContentNode, outputPath: string): Promise<void> =>
            writeFilePromisified(outputPath, content)
    }
}
