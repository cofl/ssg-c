import { DataTree } from "./DataTree";
import { Config } from "./Config";

export default interface DataProvider
{
    shouldProcess(filePath: string, dataPath: string, config: Config): boolean;
    process(filePath: string, dataPath: string, config: Config): DataTree;
}
