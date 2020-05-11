import ignore, { Ignore } from 'ignore';
import { opendirSync, Dir, Dirent, statSync, readFileSync, realpathSync, existsSync } from 'fs';
import { join, resolve, relative, isAbsolute, posix } from 'path';

export interface Options
{
    ignoreFiles: string[];
    follow?: boolean;
    defaultIgnoreRules?: string[];
    ignoreRules?: string[];
    encoding?: string;
}

export async function* ignoreWalk(root: string, options: Options): AsyncGenerator<string, void, undefined>
{
    if(!isAbsolute(root))
        throw `Path must be absolute: ${root}`;
    options.defaultIgnoreRules = options.defaultIgnoreRules || [
        '.*.swp',
        '._*',
        '.DS_Store',
        '.git',
        'node_modules'
    ];
    options.encoding = options.encoding || 'utf-8';

    const baseIgnore = ignore().add(options.defaultIgnoreRules)
                                .add(options.ignoreRules || [])
                                .add(options.ignoreFiles);
    const stack: { ignore: Ignore | null, path: string, dir: Dir }[] = [
        {
            ignore: null,
            path: relative(root, root),
            dir: opendirSync(root)
        }
    ];

    outer: while(stack.length > 0)
    {
        const top = stack[stack.length - 1];
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
                const path = join(root, top.path, name);
                if(existsSync(path) && statSync(path).isFile())
                    top.ignore.add(readFileSync(path, options.encoding));
            }
        }
        for(;null != entry; entry = top.dir.readSync())
        {
            const path = posix.join(top.path, entry.name) + (entry.isDirectory() ? '/' : '');
            if(top.ignore.ignores(path))
                continue;
            const absPath = resolve(root, path);
            if(entry.isDirectory())
            {
                stack.push({ path, dir: opendirSync(absPath), ignore: null });
                continue outer;
            }
            if(!entry.isFile())
                throw `unknown entry type: ${absPath}`;
            yield absPath;
        }
        stack.pop();
    }
};
