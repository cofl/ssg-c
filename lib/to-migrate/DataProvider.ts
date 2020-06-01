import { DataTree, Page } from "./DataTree";
import graymatter from "gray-matter";
import { Config } from "./Config";
import { DataProvider } from "./Provider";

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

export const MarkdownFileDataProvider: DataProvider = {
    shouldProcess: (filePath: string, dataPath: string, config: Config) =>
        (/\.(md|markdown)$/i).test(filePath),
    process: (filePath: string, dataPath: string, config: Config) =>
    {
        const { data, content } = graymatter.read(filePath);
        return new DataTree(dataPath, data).withContent(new MarkdownPage(filePath, content));
    }
};

export class StaticFilePage extends Page
{
    readonly filePath: string;
    constructor(filePath: string)
    {
        super();
        this.filePath = filePath;
    }
}

export const StaticFileDataProvider: DataProvider = {
    shouldProcess: (filePath: string, dataPath: string, config: Config) => true,
    process: (filePath: string, dataPath: string, config: Config) =>
        new DataTree(dataPath).withContent(new StaticFilePage(filePath)),
};
