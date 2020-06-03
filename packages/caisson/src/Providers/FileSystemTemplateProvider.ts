import { TemplateContext } from "../Caisson";
import ignoreWalk from "../util/IngoreWalk";
import { basename, resolve } from "path";
import { TemplateProvider, Template } from "../Template";
import { Config } from "../Config";

export class FileSystemTemplateProvider implements TemplateProvider
{
    private rootPath: string;
    constructor(path: string)
    {
        this.rootPath = path;
    }

    configure(config: Config): void
    {
        this.rootPath = resolve(config.rootDirectory, this.rootPath);
    }

    async *getTemplates({ templateTransformers }: TemplateContext): AsyncGenerator<Template, void, undefined>
    {
        for await(const item of ignoreWalk(this.rootPath, { ignoreFiles: [ '.caisson-ignore' ] }))
        {
            const baseName = basename(item);
            const transformer = templateTransformers.find(transformer => transformer.applies(baseName));
            if(!transformer)
            {
                console.warn(`Could not identify template transformer for ${item}`);
                continue;
            }
            yield transformer.transform(item);
        }
    }
}
