import { TemplateProvider, Template, ContentItem } from "../Providers";
import { Context_0 } from "../Caisson";
import ignoreWalk from "../util/IngoreWalk";

export class FileSystemTemplateProvider implements TemplateProvider
{
    private readonly rootPath: string;
    constructor(path: string)
    {
        this.rootPath = path;
    }

    async *getTemplates({ caisson: context }: Context_0): AsyncGenerator<Template, void, undefined>
    {
        for await(const item of ignoreWalk(this.rootPath, { ignoreFiles: [ '.caisson-ignore' ] }))
        {
            yield {
                data: {},
                name: item,
                process(item: ContentItem){  }
            }
        }
    }
}
