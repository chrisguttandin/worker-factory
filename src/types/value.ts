import { IValueArray, IValueMap } from '../interfaces';
import { TTypedArray } from './typed-array';

export type TValue = boolean | null | number | string | RegExp | TTypedArray | Transferable | IValueArray | IValueMap;
