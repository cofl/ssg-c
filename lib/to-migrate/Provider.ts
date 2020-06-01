import { SSGC, Config } from "./Config";
import { merge } from "../util/Util";

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

export class DataTree
{
    parent?: DataTree;
    page?: Page;
    children: DataTree[] = [];
    readonly path: string;
    private ownData: any;
    private computedData: any = null;

    constructor(path: string, ownData: any = {}, parent?: DataTree)
    {
        this.path = path;
        this.ownData = ownData;
        if(undefined !== parent)
            this.parent = parent;
    }

    get(config: Config): any
    {
        if(null !== this.computedData)
            return this.computedData;
        const parentData = this.parent?.get(config) || {};
        this.computedData = merge(config.asNewConfig(), parentData, this.ownData);
        return this.computedData;
    }

    withContent(page: Page): DataTree
    {
        this.page = page;
        this.page.data = this;
        return this;
    }
}

export class Page
{
    data?: DataTree;
}
