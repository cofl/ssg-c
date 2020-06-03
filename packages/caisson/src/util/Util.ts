import { Config } from "../Config";
import deepmerge from "deepmerge";

export function mergeCurry(config: Config): (...objects: object[]) => object
{
    return (...objects: object[]) => config.doDeepMerge
                ? objects.reduce((a, b) => deepmerge(a, b), {})
                : Object.assign({}, objects);
}

export function merge(config: Config, ...objects: object[]): object
{
    if(config.doDeepMerge)
        return objects.reduce((a, b) => deepmerge(a, b), {});
    return Object.assign({}, objects);
}

export function asMaybeArray<T>(a: T | T[] | undefined): T[]
{
    if(Array.isArray(a))
        return a;
    if(a === undefined)
        return [];
    return [ a ];
}

export function getPathAsComponents(path: string): string[]
{
    if(path[0] === '/')
        path = path.slice(1);
    const components = path.split('/');
    if(components[0].length === 0)
        components.shift();
    return components;
}

export type MaybeArray<T> = T | T[];
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<T>;
