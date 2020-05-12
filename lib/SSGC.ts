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

const defaultPageSlugs: string[] = [
    "index.html"
];

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

    async build()
    {
        // TODO: populate layouts
        // TODO: populate content tree
        /*
         * Populate content tree.
         */
        const contentProviders = this.config.contentProvidersOrDefault.slice();
        for(let i = 0; i < contentProviders.length; i += 1)
        {
            const providerMapping = contentProviders[i];
            for(const basePath in providerMapping)
            {
                const provider = providerMapping[basePath];
                const base = this.getOrCreateTree(basePath);
                if(null === base)
                    throw `Cannot find tree at: ${basePath}`;
                const newProviders = await provider.populate(this, base);
                contentProviders.push(...newProviders);
            }
        }

        // TODO: apply tree transformers
        this.contentRoot.render(); // TODO: pass layouts, content transformers?
                                   // TODO: use processing stack instead of recursion?
    }

    getOrCreateData(dataPath: string, ownData: any = {}): DataTree
    {
        if(dataPath in this.dataMap)
            return this.dataMap[dataPath];
        const stack = [ dataPath ];
        do
            stack.push(dirname(stack[stack.length - 1]));
        while(!(stack[stack.length - 1] in this.dataMap));
        for(let i = stack.length - 1; i > 0; i -= 1)
            this.dataMap[stack[i - 1]] = new DataTree(stack[i - 1], ownData, this.dataMap[stack[i]])
        return this.dataMap[dataPath];
    }

    private getParentTree(path: string): ContentTree | null
    {
        return this.getOrCreateTree(dirname(path));
    }

    getOrCreateTree(path: string): ContentTree | null
    {
        if(path in this.contentMap)
        {
            const tree = this.contentMap[path];
            return tree instanceof ContentTree ? tree : null;
        }
        const pathStack = [ path ];
        for(;;)
        {
            let parent = dirname(pathStack[pathStack.length - 1]);
            if(parent in this.contentMap)
                break;
            pathStack.push(parent);
        }
        for(let i = pathStack.length - 1; i >= 0; i -= 1)
            this.addItem(new ContentTree(new DataTree(pathStack[i]), pathStack[i]));
        return this.contentMap[path] as ContentTree;
    }

    addItem(item: ContentItem)
    {
        if(item.permalink in this.contentMap)
            throw new DuplicatePermalinkError(item);
        this.contentMap[item.permalink] = item;
        const parent = this.getParentTree(item.permalink);
        if(null === parent)
            throw `Can't find parent tree for "${item.permalink}"`
        parent.children.push(item);
        // insertion sort to keep things orderly.
        for(let i = parent.children.length - 1; i > 0; i -= 1)
        {
            // TODO: sort on slugs when I have them
            if(this.collator.compare(parent.children[i - 1].permalink, parent.children[i].permalink) <= 0)
                break;
            const temp = parent.children[i - 1];
            parent.children[i - 1] = parent.children[i];
            parent.children[i] = temp;
        }
    }

    getItem(path: string): ContentItem | null
    {
        return this.contentMap[path] || null;
    }
}
