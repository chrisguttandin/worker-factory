import { createWorker } from '../../../src/module';
import { extendWorkerImplementation } from '../../../src/helpers/extend-worker-implementation';

describe('extendWorkerImplementation', () => {
    describe('without any additional implementation', () => {
        it('should return the default implementation', () => {
            const fullWorkerImplementation = extendWorkerImplementation(createWorker, {});

            expect(fullWorkerImplementation).to.have.keys(['connect', 'disconnect', 'isSupported']);
        });
    });

    describe('with an additional implementation', () => {
        it('should return the extended implementation', () => {
            const fullWorkerImplementation = extendWorkerImplementation(createWorker, { subtract: () => {} });

            expect(fullWorkerImplementation).to.have.keys(['connect', 'disconnect', 'isSupported', 'subtract']);
        });
    });
});
