import { Config } from "./Config";

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
        this.computedData = config.merge(parentData, this.ownData);
        return this.computedData;
    }

    importData(config: Config, newData: object | DataTree): void
    {
        this.computedData = null;
        if(newData instanceof DataTree)
        {
            console.log(newData);
            this.ownData = config.merge(this.ownData, newData.ownData);
            this.page = this.page || newData.page;
        } else
        {
            this.ownData = config.merge(this.ownData, newData);
        }
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
