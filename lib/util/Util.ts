import Config from "../Config";
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

export function validateIsBufferEncoding(string: string | undefined): BufferEncoding | undefined
{
    if(!string)
        return undefined;
    if(Buffer.isEncoding(string))
        return string;
    throw `Unrecognized encoding type "${string}" provided.`;
}

export function asMaybeArray<T>(a: T | T[] | undefined): T[]
{
    if(Array.isArray(a))
        return a;
    if(a === undefined)
        return [];
    return [ a ];
}
