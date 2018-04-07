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
                throw renderMethodNotFoundError({ method });
            }

            const response = messageHandler(params);

            if (response === undefined) {
                throw renderMissingResponseError({ method });
            }

            if (id === null) {
                if (response.result !== undefined) {
                    throw renderUnexpectedResultError({ method });
                }
            } else if (response instanceof Promise) {
                const asynchronousResponse = await response;

                if (asynchronousResponse.result === undefined) {
                    throw renderUnexpectedResultError({ method });
                }

                const { result, transferables = [ ] } = <IRequest['response']> asynchronousResponse;

                receiver.postMessage({ id, result }, (await isSupportingTransferables) ? transferables : [ ]);
            } else {
                if (response.result === undefined) {
                    throw renderUnexpectedResultError({ method });
                }

                const { result, transferables = [ ] } = <IRequest['response']> response;

                receiver.postMessage({ id, result }, (await isSupportingTransferables) ? transferables : [ ]);
            }
        } catch (err) {
            const { message, status = -32603 } = <IAugmentedError> err;

            receiver.postMessage(<IErrorNotification | IErrorResponse> { error: { code: status, message }, id });
        }
    };
};
