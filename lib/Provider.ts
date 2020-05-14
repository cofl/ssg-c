import { SSGC } from "./SSGC";
import { Config } from "./Config";
import { DataTree } from "./DataTree";

export type ProviderMapping = Record<string, Provider>[];
export type ProviderProviderFn = (options: any, config: Config) => Provider;
export type ProviderItemType = DataTree | any;
export interface Provider
{
    getItems(ssgc: SSGC, basePath: string): AsyncGenerator<ProviderItemType, void, undefined>;
}
