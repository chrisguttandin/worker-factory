import { createMessageHandler } from './helpers/create-message-handler';
import { extendWorkerImplementation } from './helpers/extend-worker-implementation';
import { isSupportingTransferables } from './helpers/is-supporting-transferables';
import { IReceiver, IWorkerDefinition } from './interfaces';
import { TWorkerImplementation } from './types';

export * from './interfaces';
export * from './types';

export const createWorker = <T extends IWorkerDefinition>(
    receiver: IReceiver,
    workerImplementation: TWorkerImplementation<T>
): () => void => {
    const fullWorkerImplementation = extendWorkerImplementation<T>(createWorker, workerImplementation);
    const messageHandler = createMessageHandler(receiver, fullWorkerImplementation, isSupportingTransferables);

    receiver.addEventListener('message', messageHandler);

    return () => receiver.removeEventListener('message', messageHandler);
};
