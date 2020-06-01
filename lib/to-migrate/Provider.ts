import { SSGC } from "./SSGC";
import { Config } from "./Config";
import { DataTree } from "./DataTree";
import { Page } from "./Page";

export type ProviderMapping = Record<string, Provider>[];
export type ProviderProviderFn = (options: any, config: Config) => Provider;
export interface Provider
{
    getItems(ssgc: SSGC, basePath: string): AsyncGenerator<DataTree, void, undefined>;
    process(ssgc: SSGC, basePath: string): AsyncGenerator<Page, void, undefined>;
}
