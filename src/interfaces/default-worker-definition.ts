import { IWorkerDefinition } from './worker-definition';

export interface IDefaultWorkerDefinition extends IWorkerDefinition {

    connect: {

        params: {

            port: MessagePort;

        };

        response: {

            result: null;

        };

    };

    disconnect: {

        params: {

            port: MessagePort;

        };

        response: {

            result: null;

        };

    };

}
