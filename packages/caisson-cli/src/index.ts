import { Caisson, Config } from "@cofl/caisson";
import { resolve } from "path";
import { Command } from "commander";
import { existsSync } from "fs";


function validateIsBufferEncoding(string: string | undefined): BufferEncoding | undefined
{
    if(!string)
        return undefined;
    if(Buffer.isEncoding(string))
        return string;
    throw `Unrecognized encoding type "${string}" provided.`;
}

const pkg = require(resolve(__dirname, '../package.json')) as {
    version: string,
    description: string
};

const args = new Command()
    .version(pkg.version)
    .description(pkg.description)
    .option('-C, --chdir <path>', 'Change working directory.')
    .option('--default-encoding', 'Default file encoding.')
    .option('--locale', 'Override locale to use for collation.')
    .option('-c, --config-file <file>', 'Configuration file to load.', '.caisson-config.js')
    .parse(process.argv);

if(args.chdir)
    process.chdir(args.chdir);

let config = new Config({
    rootDirectory: resolve(args.args[0] || process.cwd()),
    defaultEncoding: validateIsBufferEncoding(args.defaultEncoding),
    locale: args.locale
});

if(args.configFile)
{
    const configLocation = resolve(config.rootDirectory, args.configFile);
    if(existsSync(configLocation))
    {
        const jsConfigurer = require(configLocation);
        const jsConfig = (typeof jsConfigurer === 'function') ? jsConfigurer(config) : jsConfigurer;
        config = config.importOptions(jsConfig);
    }
}

const caisson = new Caisson(config);
caisson.build();
