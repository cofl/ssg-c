import path from "path";
import arg from "arg";
import { ContentRoot } from "./ContentItem";
import { FileSystemProvider } from "./providers/fs-provider";
import { Config } from "./Config";
import { SSGC } from "./SSGC";


const args = arg({ /* TODO: options */ });
const cwd = path.resolve(args._[0] ?? '.');
(async function(){
    const config = new Config();
    config.contentProviders.push({ "/": new FileSystemProvider(cwd) });
    const ssgc = new SSGC(config);
    await ssgc.build();
})();
