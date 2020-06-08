import { Config } from "./Config";
import { DataTransformer } from "./DataItem";
import { TemplateTransformer, Template } from "./Template";
import { DataRoot } from "./DataTreeInternalNode";
import { ContentTree } from "./ContentTree";
import { resolve, dirname } from "path";
import { CaissonPluginLoader } from "./CaissonPlugin";
import mkdirp from "mkdirp";
import ignore, { Ignore } from "ignore";

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
    private readonly config: Config;
    private readonly pluginLoader = new Caisson.PluginLoader(this);
    constructor(config: Config)
    {
        this.config = config.normalizeAndUseConventionIfNotConfigured();
        this.fileExtensionsWithMatter = ignore().add(this.config.fileExtensionsWithMatter.map(a => `*${a[0] === '.' ? a : `.${a}`}`));
    }

    // Accessors for things in config that may be needed in contexts
    get rootDirectory(): string { return this.config.rootDirectory; }
    get locale(): string | undefined { return this.config.locale; }
    get encoding(): BufferEncoding { return this.config.defaultEncoding; }
    readonly fileExtensionsWithMatter: Ignore;

    // Plugin registration/loading
    private static readonly PluginLoader = class PluginLoader implements CaissonPluginLoader
    {
        constructor(public readonly caisson: Caisson){}
        registerDataTransformer(transformer: DataTransformer)
        {
            this.caisson.config.dataTransformers.push(transformer);
        }
    };

    async build()
    {
        // register plugins from config
        for(const plugin of this.config.pluginList)
            plugin(this.pluginLoader);

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
            const outputPath = resolve(this.config.outputDirectory, permalink.slice(1));
            outputPromises.push(
                mkdirp(dirname(outputPath))
                    .then(() => item.render({ caisson: this, contentTree: contentTreeMap[dirname(permalink)] }, outputPath))
            );
        }
        await Promise.all(outputPromises);
        console.log("done!");
    }
}
