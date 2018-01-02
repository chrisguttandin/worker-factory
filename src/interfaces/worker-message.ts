import { TValue } from '../types';
import { IError } from './error';

export interface IWorkerMessage {

    error: null | IError;

    id: null | number;

    result: TValue;

}
