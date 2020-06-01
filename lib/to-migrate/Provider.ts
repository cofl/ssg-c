import { SSGC } from "./SSGC";
import { Config } from "./Config";
import { DataTree, Page } from "./DataTree";

export type ProviderMapping = Record<string, Provider>[];
export type ProviderProviderFn = (options: any, config: Config) => Provider;
export interface Provider
{
    getItems(ssgc: SSGC, basePath: string): AsyncGenerator<DataTree, void, undefined>;
    process(ssgc: SSGC, basePath: string): AsyncGenerator<Page, void, undefined>;
}

export interface DataProvider
{
    shouldProcess(filePath: string, dataPath: string, config: Config): boolean;
    process(filePath: string, dataPath: string, config: Config): DataTree;
}
