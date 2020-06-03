import { Config } from "./Config";
import { DataTransformer } from "./DataItem";
import util from "util";
import { TemplateTransformer, Template } from "./Template";
import { DataRoot } from "./DataTreeInternalNode";
import { ContentTree } from "./ContentTree";
import { resolve, dirname } from "path";

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
export interface RenderContext
{
    readonly caisson: Caisson;
    readonly contentTree: ContentTree;
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

        const [, contentTreeMap] = ContentTree.fromData(data);
        const outputPromises: Promise<void>[] = [];
        for(const item of data.leaves())
        {
            const permalink = item.permalink;
            const outputPath = resolve(this.config.outputDirectory, permalink.slice(1))
            outputPromises.push(item.render({ caisson: this, contentTree: contentTreeMap[dirname(permalink)] }, outputPath));
        }
    }
}
