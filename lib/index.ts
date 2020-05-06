import path from "path";
import arg from "arg";
import { ignoreWalk } from "./ignore-recursive";

interface ContentItem {
    render(): void;
}

class Directory implements ContentItem {
    constructor(root: string, directoryPath: string){
        this.path = directoryPath;
        this.relativePath = path.relative(root, directoryPath);
    }
    children: ContentItem[] = [];
    readonly path: string;
    readonly relativePath: string;

    render(){
        for (const child of this.children)
            child.render();
    }
}

class File implements ContentItem {
    readonly path: string
    readonly parent: Directory;
    readonly relativePath: string;
    constructor(parent: Directory, file: string){
        this.path = file;
        this.parent = parent;
        this.relativePath = path.relative(parent.path, this.path);
    }
    render(){
        console.log(path.join(this.parent.relativePath, this.relativePath));
    }
}

const args = arg({
    // TODO: options
});
const cwd = path.resolve(args._[0] ?? '.');
let directories: Record<string, Directory> = {};
function getDirectory(root: string, filePath: string): Directory
{
    let key = path.dirname(filePath);
    let directory = directories[key];
    if(!directory)
    {
        directory = directories[key] = new Directory(root, key);
        directories[path.dirname(key)]?.children.push(directory);
    }
    return directory;
}

(async function(){
    for await (const path of ignoreWalk(cwd, { ignoreFiles: [ '.gitignore' ] }))
    {
        let dir = getDirectory(cwd, path);
        dir.children.push(new File(dir, path));
    }
    directories[cwd].render();
})();
