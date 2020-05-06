import ignore, { Ignore } from 'ignore';
import { opendirSync, Dir, Dirent, statSync, readFileSync, realpathSync } from 'fs';
import { join, resolve, relative } from 'path';

export interface Options
{
    ignoreFiles: string[];
    follow?: boolean;
    defaultIgnoreRules?: string[];
    encoding?: string;
}

export async function* ignoreWalk(root: string, options: Options): AsyncGenerator<string, void, undefined>
{
    options.defaultIgnoreRules = options.defaultIgnoreRules || [
        '.*.swp',
        '._*',
        '.DS_Store',
        '.git',
        'node_modules'
    ];
    options.encoding = options.encoding || 'utf-8';

    let baseIgnore = ignore().add(options.defaultIgnoreRules).add(options.ignoreFiles);
    let stack: { ignore: Ignore | null, path: string, dir: Dir }[] = [
        {
            ignore: null,
            path: relative(root, root),
            dir: opendirSync(root)
        }
    ];

    outer: while(stack.length > 0)
    {
        let top = stack[stack.length - 1];
        let entry: Dirent | null = top.dir.readSync();
        if(null === entry)
        {
            // skip empty directories
            stack.pop();
            continue;
        }
        if(null === top.ignore)
        {
            top.ignore = ignore().add(stack.length > 1
                                        ? (stack[stack.length - 2].ignore || baseIgnore)
                                        : baseIgnore);
            for(const name of options.ignoreFiles)
            {
                try
                {
                    let path = join(top.path, name);
                    if(statSync(path).isFile())
                        top.ignore.add(readFileSync(path, options.encoding));
                } catch
                {
                    // don't do anything if the file doesn't exist
                }
            }
        }
        for(;null != entry; entry = top.dir.readSync())
        {
            let path = join(top.path, entry.name);
            if(top.ignore.ignores(path))
                continue;
            if(entry.isSymbolicLink())
                path = realpathSync(path);
            if(entry.isDirectory())
            {
                stack.push({
                    dir: opendirSync(path),
                    path: relative(root, path),
                    ignore: null
                });
                continue outer;
            }
            if(!entry.isFile())
                throw `unknown entry type: ${path}`;
            yield resolve(root, path);
        }
        stack.pop();
    }
};
