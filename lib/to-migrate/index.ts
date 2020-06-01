import fs from "fs";
import arg from "arg";
import { Config } from "./Config";
import { SSGC } from "./SSGC";

/* args */
const args = arg({
    // Types
    '--default-encoding': String,
    '--config-token-fragment': String,
    '--json-configuration': String,
    '--js-configuration': String
    // TODO

    // Aliases
    // TODO
});

function validateEncodingArgument(string: string | undefined): BufferEncoding | undefined
{
    if(!string)
        return undefined;
    if(Buffer.isEncoding(string))
        return string;
    throw `Unrecognized encoding type "${args["--default-encoding"]}" provided.`;
}

/* config */
const config = new Config({
    rootDirectory: args._[0],
    configTokenFragment: args["--config-token-fragment"],
    defaultEncoding: validateEncodingArgument(args["--default-encoding"])
});
const jsConfigPath = config.resolveRealFile(args["--js-configuration"] || `.${config.configTokenFragment}-config.js`);
if(jsConfigPath)
{
    const jsConfigurer = require(jsConfigPath);
    const jsConfig = ((typeof jsConfigurer === 'function') ? jsConfigurer(config) : jsConfigurer) || {};
    config.importOptions(jsConfig);
}
const jsonConfigPath = config.resolveRealFile(args["--json-configuration"] || `.${config.configTokenFragment}-config.json`);
if(jsonConfigPath){
    const jsonContent = fs.readFileSync(jsonConfigPath, { encoding: config.defaultEncoding });
    const jsonConfig = JSON.parse(jsonContent);
    config.importOptions(jsonConfig);
}

/* build */
const ssgc = new SSGC(config);
ssgc.build();
