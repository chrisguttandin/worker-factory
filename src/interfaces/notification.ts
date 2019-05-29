import { TValue } from '../types';

export interface INotification {

    params: TValue;

    response: {

        result: void;

    };

    transferables?: Transferable[];

}
