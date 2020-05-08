import { dirname, isAbsolute } from "path";
import { DataTree } from "./DataTree";

export abstract class ContentItem
{
    private _permalink: string;
    private _parent: ContentTree | null = null;
    readonly root: ContentRoot;
    readonly data: DataTree;

    constructor(data: DataTree, root: ContentRoot | null, permalink: string)
    {
        this.data = data;
        this._permalink = permalink;
        if(this instanceof ContentRoot)
            this.root = this;
        else if(null === root)
            throw "Must supply argument root to ContentItem constructor if not a ContentRoot."
        else
        {
            this.root = root;
            this._parent = root.getOrCreateTree(dirname(permalink));
        }
        if(!this.data.parent && this._parent)
            this.data.parent = this._parent.data;
    }

    abstract render(): void;

    get permalink(): string { return this._permalink; }
    set permalink(newLink: string){
        // TODO: handle moving
        this._permalink = newLink;
    }
    get parent(): ContentTree | null { return this._parent; }
}

export class ContentTree extends ContentItem
{
    constructor(data: DataTree, root: ContentRoot | null, permalink: string)
    {
        super(data, root, permalink);
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
        super(data, null, '/');
    }
    private subtrees: Record<string, ContentTree> = {};
    getOrCreateTree(link: string): ContentTree
    {
        if(!isAbsolute(link))
            throw `Link must be absolute: ${link}`;
        if(link === '/')
            return this;
        let tree = this.subtrees[link];
        if(!tree)
        {
            tree = this.subtrees[link] = new ContentTree(new DataTree(), this, link);
            tree.parent!.children.push(tree);
            tree.data.parent = tree.parent!.data;
        }
        return tree;
    }
    addItem(item: ContentItem): void
    {
        if(!item.permalink)
            throw "Item must have a valid permalink."
        const tree = this.getOrCreateTree(item.permalink);
        tree.children.push(item);
    }
}

export class ContentFile extends ContentItem
{
    readonly filePath: string;
    content: string;
    constructor(data: DataTree, root: ContentRoot, permalink: string, filePath: string, content: string)
    {
        super(data, root, permalink);
        this.filePath = filePath;
        this.parent?.children.push(this);
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
