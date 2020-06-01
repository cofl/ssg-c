import { FileContentTransformer } from "../ContentTransformer";
import { ContentFile } from "../ContentItem";
import MarkdownIt from "markdown-it";

// TODO: replace all of this with layouts
export default class MarkdownContentTransformer implements FileContentTransformer
{
    readonly fileType = 'TextWithFrontmatter';
    private md = new MarkdownIt();

    transform(file: ContentFile): void
    {
        file.content = this.md.render(file.content);
        file.changeExtension('.html');
    }
}
