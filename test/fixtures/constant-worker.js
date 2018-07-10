import { createWorker } from '../../src/module.ts';

createWorker(self, {
    ask: () => ({ result: 42 })
});
