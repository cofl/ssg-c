import { dirname, isAbsolute } from "path";

export abstract class ContentItem
{
    private _permalink: string;
    private _parent: ContentTree | null = null;
    readonly root: ContentRoot;

    ownData: any = {};
    private _data: any = null; // cached data

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
    set permalink(newLink: string){
        // TODO: handle moving
        this._permalink = newLink;
    }
    get parent(): ContentTree | null { return this._parent; }
    get data(): any { return this.resolveData(/* recompute: */ false); }

    resolveData(recompute: true | false = false): any
    {
        if(null !== this._data && !recompute)
            return this._data;
        this._data = { ...this.parent?.data, ...this.ownData }; // just a shallow merge is ok.
        for(let key in this._data)
        {
            if(typeof this._data[key] === 'function')
            {
                // TODO: emulate 11ty's data cascade
            }
        }
        return this._data;
    }
}

export class ContentTree extends ContentItem
{
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
        const tree = this.getOrCreateTree(item.permalink);
        tree.children.push(item);
    }
}

export class ContentFile extends ContentItem
{
    readonly filePath: string;
    content: string;
    constructor(root: ContentRoot, permalink: string, filePath: string, ownData: any, content: string)
    {
        super(root, permalink);
        this.filePath = filePath;
        this.parent?.children.push(this);
        this.ownData = ownData;
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
