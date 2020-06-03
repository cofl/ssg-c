import { Config } from "./Config";
import { DataTransformer } from "./DataItem";
import util from "util";
import { TemplateTransformer, Template } from "./Template";
import { DataRoot } from "./DataTreeInternalNode";

export interface TemplateContext
{
    readonly caisson: Caisson;
    readonly templateTransformers: TemplateTransformer[];
}
export interface DataContext
{
    readonly caisson: Caisson;
    readonly templates: Record<string, Template>;
    readonly dataTransformers: DataTransformer[];
}

export class Caisson
{
    readonly config: Config;
    // TODO
    constructor(config: Config)
    {
        this.config = config.normalizeAndUseConventionIfNotConfigured();
        // TODO
    }

    // Accessors for things in config that may be needed in contexts
    get rootDirectory(): string { return this.config.rootDirectory; }
    get locale(): string | undefined { return this.config.locale; }

    async build()
    {
        // load and link templates
        const templates: Record<string, Template> = {};
        {
            const context: TemplateContext = {
                caisson: this,
                templateTransformers: this.config.templateTransformers
            };
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

        // inject into the data tree. The provider needs to do the linking itself.
        const data: DataRoot = new DataRoot('/');
        {
            const context: DataContext = { caisson: this, templates, dataTransformers: this.config.dataTransformers };
            for(const mappingElement of this.config.dataProviders)
                for(const basePath in mappingElement)
                    await mappingElement[basePath].populate(context, data.getInternalNodeAtPath(basePath));
        }
        console.log(util.inspect(data, false, null, true));
    }
}
