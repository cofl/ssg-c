//import { DataTransformer } from "./DataItem";

export interface CaissonPluginLoader
{
    //registerDataTransformer(transformer: DataTransformer): void | Promise<void>;
}

export type CaissonPlugin = (loader: CaissonPluginLoader, options?: any) => void | Promise<void>;
