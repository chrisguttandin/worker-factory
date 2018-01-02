import { createWorker } from '../../src/module.ts';

createWorker(self, {
    subtract: ({ minuend, subtrahend }) => ({ result: (minuend - subtrahend) })
});
