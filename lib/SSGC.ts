import { Config } from "./Config";
import { ContentRoot, ContentItem, ContentTree } from "./ContentItem";
import { DataTree } from "./DataTree";

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
    private collator: Intl.Collator;

    constructor(config: Config)
    {
        this.config = config;
        this.collator = new Intl.Collator(config.locale);
        this.dataRoot = new DataTree('/'); // TODO: inject global data.
        this.contentRoot = new ContentRoot(this.dataRoot);
        this.contentMap['/'] = this.contentRoot;
        // TODO: register plugins/transformers from config
    }

    private async gatherItems()
    {
        const providerMappings = this.config.contentProvidersOrDefault.slice();
        for(const mapping of providerMappings)
            for(const basePath in mapping)
                mapping[basePath].process(this, basePath);
    }

    async build()
    {
        const contentList = await this.gatherItems();
        // TODO: populate layouts
        // TODO: build content tree
        // TODO: apply tree transformers
        this.contentRoot.render(); // TODO: pass layouts, content transformers?
                                   // TODO: use processing stack instead of recursion?
    }
}
