import { Config } from "./Config";

export class SSGC
{
    config: Config;
    readonly collator: Intl.Collator;

    constructor(config: Config)
    {
        this.config = config;
        this.collator = new Intl.Collator(config.locale);
    }

    async build()
    {
        // TODO: remove
    }
}
