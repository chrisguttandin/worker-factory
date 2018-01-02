import { TTransferable, TValue } from '../types';

export interface INotification {

    params: TValue;

    response: {

        result: void;

    };

    transferables?: TTransferable[];

}
