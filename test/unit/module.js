import * as workerFactory from '../../src/module';

describe('module', () => {
    describe('createWorker()', () => {
        it('should export a function', () => {
            expect(workerFactory.createWorker).to.be.a('function');
        });
    });

    describe('isSupported()', () => {
        it('should export a function', () => {
            expect(workerFactory.isSupported).to.be.a('function');
        });
    });
});
