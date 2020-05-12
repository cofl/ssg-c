import { Config } from "./Config";
import deepmerge from "deepmerge";

export class DataTree
{
    parent: DataTree | null;
    readonly path: string;
    private ownData: any;
    private computedData: any = null;

    constructor(path: string, ownData: any = {}, parent: DataTree | null = null)
    {
        this.path = path;
        this.ownData = ownData;
        this.parent = parent;
    }

    clearComputed(alsoClearParents : true | false = true)
    {
        this.computedData = null;
        if(alsoClearParents)
            this.parent?.clearComputed(alsoClearParents);
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

    importData(newData: any, behaviour: 'shallowMerge' | 'deepMerge' | 'replace' = 'replace'): void
    {
        switch(behaviour)
        {
            case 'shallowMerge': this.ownData = { ...this.ownData, ...newData }; break;
            case 'deepMerge': this.ownData = deepmerge(this.ownData, newData); break;
            default:
                this.ownData = newData;
        }
        this.clearComputed(false);
    }
}
