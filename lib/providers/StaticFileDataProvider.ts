import DataProvider from "../DataProvider";
import { DataTree } from "../DataTree";
import { Config } from "../Config";
import { Page } from "../Page";

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
