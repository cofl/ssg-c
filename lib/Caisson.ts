import Config from "./Config";
import { Template, TemplateProvider, ContentItem, DataTree, DataRoot } from "./Providers";
import util from "util";

export interface Context_0
{
    readonly caisson: Caisson;
}
export interface Context_1 extends Context_0
{
    readonly templates: Record<string, Template>;
}

export class Caisson
{
    private readonly config: Config;
    // TODO
    constructor(config: Config)
    {
        this.config = config.normalizeAndUseConventionIfNotConfigured();
        // TODO
    }

    // Accessors for things in config that may be needed in contexts
    get rootDirectory(): string { return this.config.rootDirectory; }

    async build()
    {
        // load and link templates
        const templates: Record<string, Template> = {};
        {
            const context: Context_0 = { caisson: this };
            for(const provider of this.config.templateProviders)
                for await(const template of provider.getTemplates(context))
                    templates[template.name] = template;
        }
        for(const templateName in templates)
        {
            const template = templates[templateName];
            if(!template.parent && ('template' in template.data))
            {
                const parentName = template.data['template'];
                if(parentName in templates)
                    template.parent = templates[parentName];
                else
                    throw `Unrecognized template name "${parentName}".`;
            }
        }
        console.log(templates);

        // inject into the data tree. The provider needs to do the linking itself.
        const data: DataRoot = new DataRoot({}, '/');
        {
            const context: Context_1 = { caisson: this, templates };
            for(const mappingElement of this.config.dataProviders)
                for(const basePath in mappingElement)
                    await mappingElement[basePath].populate(context, data.getInternalNodeAtPath(basePath));
        }
        console.log(util.inspect(data, false, null, true));
    }
}
