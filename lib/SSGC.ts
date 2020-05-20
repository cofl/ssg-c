import { Config } from "./Config";
import { ContentRoot, ContentItem, ContentTree } from "./ContentItem";
import { DataTree } from "./DataTree";
import { dirname } from "path";
import { pathToFileURL } from "url";

export class DuplicatePermalinkError extends Error
{
    readonly item: ContentItem;
    constructor(item: ContentItem)
    {
        super(item.permalink);
        this.item = item;
    }
}

export class SSGC
{
    config: Config;
    contentRoot: ContentRoot;
    dataRoot: DataTree;

    private contentMap: Record<string, ContentItem> = {};
    private dataMap: Record<string, DataTree> = {};
    private collator: Intl.Collator;

    constructor(config: Config)
    {
        this.config = config;
        this.collator = new Intl.Collator(config.locale);
        this.dataRoot = new DataTree('/'); // TODO: inject global data.
        this.contentRoot = new ContentRoot(this.dataRoot);
        this.dataMap['/'] = this.dataRoot;
        this.contentMap['/'] = this.contentRoot;
        // TODO: register plugins/transformers from config
    }

    private async gatherItems()
    {
        const providerMappings = this.config.contentProvidersOrDefault.slice();
        for(const mapping of providerMappings)
        for(const basePath in mapping)
        {
            const provider = mapping[basePath];
            for await (const item of provider.getItems(this, basePath))
            {
                if(item.path in this.dataMap)
                    this.dataMap[item.path].importData(this.config, item);
                else
                    this.dataMap[item.path] = item;
            }
        }
    }

    private async linkDataTree()
    {
        for(const path of Object.keys(this.dataMap))
        {
            if(path === '/')
                continue;
            const pathStack = [ path ];
            while(pathStack.length > 0)
            {
                const path = pathStack.pop()!;
                const parentPath = dirname(path);
                if(!(parentPath in this.dataMap))
                {
                    pathStack.push(path);
                    pathStack.push(parentPath);
                    continue;
                }
                if(path in this.dataMap)
                    this.dataMap[path].parent = this.dataMap[parentPath];
                else
                    this.dataMap[path] = new DataTree(path, {}, this.dataMap[parentPath]);
            }
        }
    }

    async build()
    {
        const contentList = await this.gatherItems();
        // TODO: populate layouts
        await this.linkDataTree();
        console.log(this.dataMap);
        // TODO: build content tree
        // TODO: apply tree transformers
        this.contentRoot.render(); // TODO: pass layouts, content transformers?
                                   // TODO: use processing stack instead of recursion?
    }
}
