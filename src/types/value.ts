import { TTypedArray } from './typed-array';
import { TValueMap } from './value-map';

export type TValue = boolean | null | number | string | RegExp | TTypedArray | TValue[] | TValueMap | Transferable;
