import { Config } from "./Config";
import { ContentRoot } from "./ContentItem";
import { DataTree } from "./DataTree";
import util from "util";

export class SSGC
{
    config: Config;
    contentRoot: ContentRoot;
    dataRoot: DataTree;

    constructor(config: Config)
    {
        this.config = config;
        this.dataRoot = new DataTree(); // TODO: inject global data.
        this.contentRoot = new ContentRoot(this.dataRoot);
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
                const base = this.contentRoot.getOrCreateTree(basePath);
                const newProviders = await provider.populate(this.contentRoot, base, this.config);
                contentProviders.push(...newProviders);
            }
        }

        // TODO: apply tree transformers
        this.contentRoot.render(); // TODO: pass layouts, content transformers?
                                   // TODO: use processing stack instead of recursion?
        console.log(util.inspect(this.contentRoot, false, null, true));
    }
}
