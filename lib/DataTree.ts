import { Config } from "./Config";
import deepmerge from "deepmerge";

export class DataTree
{
    parent: DataTree | null;
    // TODO: associated page/content item?
    // TODO: children?
    readonly path: string;
    private ownData: any;
    private computedData: any = null;

    constructor(path: string, ownData: any = {}, parent: DataTree | null = null)
    {
        this.path = path;
        this.ownData = ownData;
        this.parent = parent;
    }

    get(config: Config): any
    {
        if(null !== this.computedData)
            return this.computedData;
        const parentData = this.parent?.get(config) || {};
        if(config.dataDeepMerge)
            this.computedData = deepmerge(parentData, this.ownData);
        else
            this.computedData = { ...parentData, ...this.ownData };
        return this.computedData;
    }

    importData(config: Config, newData: object | DataTree): void
    {
        this.ownData = config.merge(this.ownData, newData instanceof DataTree ? newData.ownData : newData);
        this.computedData = null;
    }
}
