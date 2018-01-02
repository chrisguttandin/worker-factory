import { createMessageHandler } from './helpers/create-message-handler';
import { extendWorkerImplementation } from './helpers/extend-worker-implementation';
import { IReceiver, IWorkerDefinition } from './interfaces';
import { TWorkerImplementation } from './types';

export * from './interfaces';
export * from './types';

export const createWorker = <T extends IWorkerDefinition>(receiver: IReceiver, workerImplementation: TWorkerImplementation<T>) => {
    const fullWorkerImplementation = extendWorkerImplementation<T>(createWorker, workerImplementation);

    receiver.addEventListener('message', createMessageHandler(receiver, fullWorkerImplementation));
};
