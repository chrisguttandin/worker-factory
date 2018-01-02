import { IValueMap } from '../interfaces';
import { TTransferable } from './transferable';

export type TValue = boolean | null | number | string | TTransferable | IValueMap;
