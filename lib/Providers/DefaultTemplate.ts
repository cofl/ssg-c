import { Template, ContentItem } from "../Providers";

export class DefaultTemplate implements Template
{
    data: any = {};
    name: string = '';
    path: string = '';
    process(item: ContentItem): void {
        // nop
    }
}
