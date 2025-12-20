import { createWorker, isSupported } from '../../src/module';
import { describe, expect, it } from 'vitest';

describe('module', () => {
    describe('createWorker()', () => {
        it('should export a function', () => {
            expect(createWorker).to.be.a('function');
        });
    });

    describe('isSupported()', () => {
        it('should export a function', () => {
            expect(isSupported).to.be.a('function');
        });
    });
});
