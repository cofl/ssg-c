import { dirname, isAbsolute } from "path";
import { DataTree } from "./DataTree";

export abstract class ContentItem
{
    private _permalink: string;
    private _parent: ContentTree | null = null;
    readonly data: DataTree;

    constructor(data: DataTree, permalink: string)
    {
        this.data = data;
        this._permalink = permalink;
    }

    abstract render(): void;

    get permalink(): string { return this._permalink; }
    set permalink(newLink: string){
        // TODO: handle moving
        this._permalink = newLink;
    }
    get parent(): ContentTree | null { return this._parent; }

    __setParentInternal(newParent: ContentTree)
    {
        this._parent = newParent;
    }
}

export class ContentTree extends ContentItem
{
    constructor(data: DataTree, permalink: string)
    {
        super(data, permalink);
    }
    children: ContentItem[] = [];

    render(): void
    {
        for(const child of this.children)
            child.render();
    }
}

export class ContentRoot extends ContentTree
{
    constructor(data: DataTree)
    {
        super(data, '/');
    }
}

export class ContentFile extends ContentItem
{
    readonly filePath: string;
    content: string;
    constructor(data: DataTree, permalink: string, filePath: string, content: string)
    {
        super(data, permalink);
        this.filePath = filePath;
        this.content = content;
    }

    render()
    {
        console.log(this.permalink);
    }

    changeExtension(newExtension: string): void
    {
        if(newExtension[0] !== '.')
            newExtension = '.' + newExtension;
        this.permalink = this.permalink.replace(/\.[^\.]+$/, newExtension);
    }
}

export class StaticContentFile extends ContentItem
{
    readonly filePath: string;
    constructor(data: DataTree, permalink: string, filePath: string)
    {
        super(data, permalink);
        this.filePath = filePath;
    }

    render()
    {
        console.log(this.permalink);
    }
}
