import { IDefaultWorkerDefinition, IReceiver, IWorkerDefinition } from '../interfaces';
import { TWorkerImplementation } from '../types';

export const extendWorkerImplementation = <T extends IWorkerDefinition>(
    createWorker: (receiver: IReceiver, workerImplementation: TWorkerImplementation<T>) => void,
    partialWorkerImplementation: TWorkerImplementation<T>
): TWorkerImplementation<T & IDefaultWorkerDefinition> => {
    // @todo The spread operator can't be used here because TypeScript does not believe that partialWorkerImplementation is an object.
    return Object.assign({ }, partialWorkerImplementation, <TWorkerImplementation<IDefaultWorkerDefinition>> {
        connect: ({ port }) => {
            port.start();

            createWorker(port, partialWorkerImplementation);

            return { result: null };
        },
        disconnect: ({ port }) => {
            port.close();

            // @todo Delete the eventhandler.

            return { result: null };
        }
    });
};
