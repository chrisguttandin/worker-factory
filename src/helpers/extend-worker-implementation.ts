import { generateUniqueNumber } from 'fast-unique-numbers';
import { IDefaultWorkerDefinition, IReceiver, IWorkerDefinition } from '../interfaces';
import { TWorkerImplementation } from '../types';
import { renderUnknownPortIdError } from './error-renderers';

const CLEAN_UP_FUNCTIONS: Map<number, () => void> = new Map();

export const extendWorkerImplementation = <T extends IWorkerDefinition>(
    createWorker: (receiver: IReceiver, workerImplementation: TWorkerImplementation<T>) => () => void,
    partialWorkerImplementation: TWorkerImplementation<T>
): TWorkerImplementation<T & IDefaultWorkerDefinition> => {
    // @todo The spread operator can't be used here because TypeScript does not believe that partialWorkerImplementation is an object.
    return Object.assign({ }, partialWorkerImplementation, <TWorkerImplementation<IDefaultWorkerDefinition>> {
        connect: ({ port }) => {
            port.start();

            const destroyWorker = createWorker(port, partialWorkerImplementation);
            const portId = generateUniqueNumber(CLEAN_UP_FUNCTIONS);

            CLEAN_UP_FUNCTIONS.set(portId, () => {
                destroyWorker();
                port.close();
                CLEAN_UP_FUNCTIONS.delete(portId);
            });

            return { result: portId };
        },
        disconnect: ({ portId }) => {
            const cleanUp = CLEAN_UP_FUNCTIONS.get(portId);

            if (cleanUp === undefined) {
                throw renderUnknownPortIdError({ portId: portId.toString() });
            }

            cleanUp();

            return { result: null };
        }
    });
};
