import path from "path";
import fs from "fs";
import arg from "arg";
import { Config } from "./Config";
import { SSGC } from "./SSGC";

const args = arg({ /* TODO: options */ });
const cwd = path.resolve(args._[0] ?? '.');
(async function(){
    const config = new Config({ rootDirectory: cwd });
    const jsConfigPath = config.resolveRealFile(`.${config.configTokenFragment}.js`);
    if(jsConfigPath)
    {
        const jsConfigurer = require(jsConfigPath);
        const jsConfig = ((typeof jsConfigurer === 'function') ? jsConfigurer(config) : jsConfigurer) || {};
        config.importOptions(jsConfig);
    }
    const jsonConfigPath = config.resolveRealFile(`.${config.configTokenFragment}.json`);
    if(jsonConfigPath){
        const jsonContent = fs.readFileSync(jsonConfigPath, { encoding: config.defaultEncoding });
        const jsonConfig = JSON.parse(jsonContent);
        config.importOptions(jsonConfig);
    }
    const ssgc = new SSGC(config);
    await ssgc.build();
})();
