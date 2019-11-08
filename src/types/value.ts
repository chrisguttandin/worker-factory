import { TTypedArray } from './typed-array';

export type TValue = boolean | null | number | string | RegExp | TTypedArray | TValue[] | Transferable | { [ key: string ]: TValue };
