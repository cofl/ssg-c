import path from "path";
import arg from "arg";
import { ContentRoot } from "./ContentItem";
import { FileSystemProvider } from "./providers/fs-provider";
import { Config } from "./Config";


const args = arg({ /* TODO: options */ });
const cwd = path.resolve(args._[0] ?? '.');
(async function(){
    const root = new ContentRoot();
    const config = new Config();
    const provider = new FileSystemProvider(cwd);
    await provider.populate(root, root, config);
    root.render();
    console.log(root.children[0])
})();
