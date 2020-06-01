import { DataProvider, DataTree, ContentItem } from "../Providers";
import { Context_1 } from "../Caisson";

export class FileSystemProvider implements DataProvider
{
    readonly rootPath: string;
    constructor(path: string)
    {
        this.rootPath = path;
    }

    populate(context: Context_1, root: DataTree): void
    {
        throw new Error("Method not implemented.");
    }
}
