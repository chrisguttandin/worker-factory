import { IAugmentedError } from 'compilerr';
import { IBrokerEvent, IErrorNotification, IErrorResponse, IReceiver, IRequest, IWorkerDefinition } from '../interfaces';
import { TWorkerImplementation } from '../types';
import { renderMethodNotFoundError, renderMissingResponseError, renderUnexpectedResultError } from './error-renderers';

export const createMessageHandler = <T extends IWorkerDefinition>(
    receiver: IReceiver,
    workerImplementation: TWorkerImplementation<T>,
    isSupportingTransferables: Promise<boolean>
) => {
    return async ({ data: { id, method, params } }: IBrokerEvent<T>) => {
        const messageHandler = workerImplementation[method];

        try {
            if (messageHandler === undefined) {
                // @todo The variable method is of type keyof T which is actually a string but TypeScript (v2.9.1) doesn't accept that.
                throw renderMethodNotFoundError({ method: <string> method });
            }

            const response = messageHandler(params);

            if (response === undefined) {
                // @todo The variable method is of type keyof T which is actually a string but TypeScript (v2.9.1) doesn't accept that.
                throw renderMissingResponseError({ method: <string> method });
            }

            const synchronousResponse = (response instanceof Promise) ? await response : response;

            if (id === null) {
                if (synchronousResponse.result !== undefined) {
                    // @todo The variable method is of type keyof T which is actually a string but TypeScript (v2.9.1) doesn't accept that.
                    throw renderUnexpectedResultError({ method: <string> method });
                }
            } else {
                if (synchronousResponse.result === undefined) {
                    // @todo The variable method is of type keyof T which is actually a string but TypeScript (v2.9.1) doesn't accept that.
                    throw renderUnexpectedResultError({ method: <string> method });
                }

                const { result, transferables = [ ] } = <IRequest['response']> synchronousResponse;

                receiver.postMessage({ id, result }, (await isSupportingTransferables) ? transferables : [ ]);
            }
        } catch (err) {
            const { message, status = -32603 } = <IAugmentedError> err;

            receiver.postMessage(<IErrorNotification | IErrorResponse> { error: { code: status, message }, id });
        }
    };
};
