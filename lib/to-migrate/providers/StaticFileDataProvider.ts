import { DataProvider } from "../Provider";
import { DataTree, Page } from "../DataTree";
import { Config } from "../Config";

export class StaticFilePage extends Page
{
    readonly filePath: string;
    constructor(filePath: string)
    {
        super();
        this.filePath = filePath;
    }
}

const StaticFileDataProvider: DataProvider = {
    shouldProcess: (filePath: string, dataPath: string, config: Config) => true,
    process: (filePath: string, dataPath: string, config: Config) =>
        new DataTree(dataPath).withContent(new StaticFilePage(filePath)),
};
export default StaticFileDataProvider;
