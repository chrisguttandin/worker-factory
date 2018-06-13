import { generateUniqueNumber } from 'fast-unique-numbers';
import { IDefaultWorkerDefinition, IReceiver, IWorkerDefinition } from '../interfaces';
import { TDestroyWorkerFunction, TWorkerImplementation } from '../types';
import { renderUnknownPortIdError } from './error-renderers';

const DESTROY_WORKER_FUNCTIONS: Map<number, TDestroyWorkerFunction> = new Map();

export const extendWorkerImplementation = <T extends IWorkerDefinition>(
    createWorker: (receiver: IReceiver, workerImplementation: TWorkerImplementation<T>) => TDestroyWorkerFunction,
    partialWorkerImplementation: TWorkerImplementation<T>
): TWorkerImplementation<T & IDefaultWorkerDefinition> => {
    // @todo The spread operator can't be used here because TypeScript does not believe that partialWorkerImplementation is an object.
    return Object.assign({ }, partialWorkerImplementation, <TWorkerImplementation<IDefaultWorkerDefinition>> {
        connect: ({ port }) => {
            port.start();

            const destroyWorker = createWorker(port, partialWorkerImplementation);
            const portId = generateUniqueNumber(DESTROY_WORKER_FUNCTIONS);

            DESTROY_WORKER_FUNCTIONS.set(portId, () => {
                destroyWorker();
                port.close();
                DESTROY_WORKER_FUNCTIONS.delete(portId);
            });

            return { result: portId };
        },
        disconnect: ({ portId }) => {
            const destroyWorker = DESTROY_WORKER_FUNCTIONS.get(portId);

            if (destroyWorker === undefined) {
                throw renderUnknownPortIdError({ portId: portId.toString() });
            }

            destroyWorker();

            return { result: null };
        }
    });
};
