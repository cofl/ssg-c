import path from "path";
import arg from "arg";
import { Config } from "./Config";
import { SSGC } from "./SSGC";


const args = arg({ /* TODO: options */ });
const cwd = path.resolve(args._[0] ?? '.');
(async function(){
    const config = new Config({ rootDirectory: cwd });
    const ssgc = new SSGC(config);
    await ssgc.build();
})();
