import { IValueArray, IValueMap } from '../interfaces';
import { TTransferable } from './transferable';
import { TTypedArray } from './typed-array';

export type TValue = boolean | null | number | string | RegExp | TTypedArray | TTransferable | IValueArray | IValueMap;
