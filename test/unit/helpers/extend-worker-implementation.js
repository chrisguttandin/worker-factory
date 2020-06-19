import { createWorker } from '../../../src/module';
import { extendWorkerImplementation } from '../../../src/helpers/extend-worker-implementation';

describe('extendWorkerImplementation', () => {
    after((done) => {
        // @todo This is an optimistic fix to prevent the famous 'Some of your tests did a full page reload!' error.
        setTimeout(done, 1000);
    });

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
