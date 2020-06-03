import { DataTransformer } from "./DataItem";

export interface CaissonPluginLoader
{
    registerDataTransformer(transformer: DataTransformer): void | Promise<void>;
}

export interface CaissonPlugin
{
    register(loader: CaissonPluginLoader, options?: any): void | Promise<void>
}
