import { TTransferable, TValue } from '../types';
import { IValueMap } from './value-map';

export interface IRequest {

    params: IValueMap | TValue[];

    response: {

        result: TValue;

        transferables?: TTransferable[]

    };

    transferables?: TTransferable[];

}
