import { Provider } from "../Provider";
import { Options, ignoreWalk } from "../util/ignore-recursive";
import { join, relative, isAbsolute, resolve } from "path";

import { Config } from "../Config";
import { existsSync, statSync } from "fs";
import { SSGC } from "../SSGC";
import { DataTree } from "../DataTree";

export class FileSystemProvider implements Provider
{
    readonly path: string;
    readonly ignoreOptions: Options;
    constructor(basePath: string, config: Config, ignoreOptions?: Options)
    {
        if(!isAbsolute(basePath))
            throw `Path must be absolute: ${basePath}`;
        this.path = basePath;
        this.ignoreOptions = ignoreOptions || {
            ignoreFiles: [ `.${config.configTokenFragment}-ignore` ]
        };
    }

    static fromOptions(options: any, config: Config): FileSystemProvider
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
                    yield provider.process(filePath, dataPath, ssgc.config);
                    break;
                }
            }
        }
    }
}
