import { Provider } from "../Provider";
import { Options, ignoreWalk } from "../util/ignore-recursive";
import { dirname, join, relative, isAbsolute, resolve } from "path";

import { Config } from "../Config";
import { existsSync, statSync } from "fs";
import { SSGC } from "../SSGC";
import { DataTree } from "../DataTree";
import { Page } from "../Page";

export interface FileSystemProviderFromOptionsType
{
    basePath?: string;
    root?: string; // alias for basePath
    ignoreOptions?: Options;
}

export class FileSystemProvider implements Provider
{
    readonly path: string;
    readonly ignoreOptions: Options;

    private hasBuiltDataMap: boolean = false;
    private readonly dataRoot: DataTree = new DataTree('/');
    private readonly dataMap: Record<string, DataTree> = {};

    constructor(basePath: string, config: Config, ignoreOptions?: Options)
    {
        if(!isAbsolute(basePath))
            throw `Path must be absolute: ${basePath}`;
        this.path = basePath;
        this.ignoreOptions = ignoreOptions || {
            ignoreFiles: [ `.${config.configTokenFragment}-ignore` ]
        };
        this.dataMap[this.dataRoot.path] = this.dataRoot;
    }

    static fromOptions(options: FileSystemProviderFromOptionsType, config: Config): FileSystemProvider
    {
        const root = options.basePath || options.root;
        if(!root)
            throw "Missing required option \"basePath\", or alias \"root\".";
        const resolved = resolve(root);
        if(!existsSync(resolved))
            throw `Path must exist: ${resolved}`;
        if(!statSync(resolved).isDirectory())
            throw `Path must be a directory: ${resolved}`;
        return new FileSystemProvider(resolved, config, options.ignoreOptions);
    }

    async *getItems(ssgc: SSGC, basePath: string): AsyncGenerator<DataTree, void, undefined>
    {
        for await(const filePath of ignoreWalk(this.path, this.ignoreOptions))
        {
            const relativePath = relative(this.path, filePath);
            const dataPath = join(basePath, relativePath).replace(/\\/g, '/');
            for(const provider of ssgc.config.dataProviders)
            {
                if(provider.shouldProcess(filePath, dataPath, ssgc.config))
                {
                    // delegate processing frontmatter/data to the file provider
                    yield provider.process(filePath, dataPath, ssgc.config);
                    break;
                }
            }
        }
    }

    async *process(ssgc: SSGC, basePath: string): AsyncGenerator<Page, void, undefined>
    {
        if(!this.hasBuiltDataMap)
        {
            for await(const item of this.getItems(ssgc, basePath))
            {
                // add the item to the data map
                if(item.path in this.dataMap)
                    this.dataMap[item.path].importData(ssgc.config, item);
                else
                    this.dataMap[item.path] = item;

                // if it's at the root, don't try to link to the parent.
                if(item.path === '/')
                    continue;

                // link to parent
                const pathStack = [ item.path ];
                while(pathStack.length > 0)
                {
                    const path = pathStack.pop()!;
                    const parentPath = dirname(path);
                    if(!(parentPath in this.dataMap))
                    {
                        // if the parent doesn't exist, push the current dir for re-visiting, and the parent.
                        pathStack.push(path);
                        pathStack.push(parentPath);
                        continue;
                    }
                    // if we're at a datatree that already exists, just link
                    if(path in this.dataMap)
                        this.dataMap[path].parent = this.dataMap[parentPath];
                    else
                        // otherwise create
                        this.dataMap[path] = new DataTree(path, {}, this.dataMap[parentPath]);
                    // and add the current path as a child of its parent.
                    this.dataMap[path].parent!.children.push(this.dataMap[path]);
                }
            }
            // TODO: pagination
            // TODO: all function-like properties have to be resolved to scalars before createPage
            this.hasBuiltDataMap = true;
        }
        // TODO: createPage
        const queue = [ this.dataRoot ];
        console.log(this.dataMap);
        while(queue.length > 0)
        {
            const current = queue.shift()!;
            if(current.page)
                yield current.page;
            for(const child of current.children.sort((a, b) => ssgc.collator.compare(a.path, b.path)))
                queue.push(child);
        }
    }
}
