import { dirname, isAbsolute } from "path";

export abstract class ContentItem
{
    private _permalink: string;
    private _parent: ContentTree | null = null;
    readonly root: ContentRoot;

    constructor(root: ContentRoot | null, permalink: string)
    {
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
    }

    abstract render(): void;

    get permalink(): string { return this._permalink; }
    get parent(): ContentTree | null { return this._parent; }
}
export class ContentTree extends ContentItem {
    constructor(root: ContentRoot | null, permalink: string)
    {
        super(root, permalink);
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
    constructor()
    {
        super(null, '/');
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
            tree = this.subtrees[link] = new ContentTree(this, link);
            tree.parent!.children.push(tree);
        }
        return tree;
    }
    addItem(item: ContentItem): void
    {
        if(!item.permalink)
            throw "Item must have a valid permalink."
        let tree = this.getOrCreateTree(item.permalink);
        tree.children.push(item);
    }
}
