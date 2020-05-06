import path from "path";
import arg from "arg";
import { ContentRoot } from "./ContentItem";
import { FileSystemProvider } from "./providers/fs-provider";


const args = arg({ /* TODO: options */ });
const cwd = path.resolve(args._[0] ?? '.');
(async function(){
    const root = new ContentRoot();
    const provider = new FileSystemProvider(cwd);
    await provider.populate(root, root);
    root.render();
})();
