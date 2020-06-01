import DataProvider from "../DataProvider";
import { DataTree } from "../DataTree";
import { Page } from "../Page";
import graymatter from "gray-matter";
import { Config } from "../Config";

export class MarkdownPage extends Page {
    readonly filePath: string;
    content: string;
    constructor(filePath: string, content: string)
    {
        super();
        this.filePath = filePath;
        this.content = content;
    }
}

const MarkdownFileDataProvider: DataProvider = {
    shouldProcess: (filePath: string, dataPath: string, config: Config) =>
        (/\.(md|markdown)$/i).test(filePath),
    process: (filePath: string, dataPath: string, config: Config) =>
    {
        const { data, content } = graymatter.read(filePath);
        return new DataTree(dataPath, data).withContent(new MarkdownPage(filePath, content));
    }
};
export default MarkdownFileDataProvider;
