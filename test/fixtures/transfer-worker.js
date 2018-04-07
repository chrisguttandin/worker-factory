import { createWorker } from '../../src/module.ts';

createWorker(self, {
    transfer: (arrayBuffer) => ({ result: arrayBuffer, transferables: [ arrayBuffer ] })
});
