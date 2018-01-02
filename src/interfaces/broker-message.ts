import { IWorkerDefinition } from './worker-definition';

export interface IBrokerMessage<T extends IWorkerDefinition> {

    id: null | number;

    method: keyof T;

    params: T[keyof T]['params'];

}
