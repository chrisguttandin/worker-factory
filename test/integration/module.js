import { beforeEach, describe, expect, it } from 'vitest';
import { spy } from 'sinon';

describe('module', () => {
    let worker;

    describe('with the default implementation', () => {
        beforeEach(() => {
            worker = new Worker(new URL('../fixtures/default-worker', import.meta.url), { type: 'module' });
        });

        describe('connect()', () => {
            let connectRequestId;
            let ports;

            beforeEach(() => {
                connectRequestId = 723;

                const messageChannel = new MessageChannel();

                ports = [messageChannel.port1, messageChannel.port2];
            });

            it('should connect a port', () => {
                const { promise, resolve } = Promise.withResolvers();

                worker.addEventListener('message', ({ data }) => {
                    expect(data.result).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: data.result
                    });

                    resolve();
                });

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );

                return promise;
            });
        });

        describe('disconnect()', () => {
            let disconnectRequestId;
            let portId;

            beforeEach(() => {
                const { promise, resolve } = Promise.withResolvers();
                const connectRequestId = 723;
                const eventListener = ({ data }) => {
                    worker.removeEventListener('message', eventListener);

                    portId = data.result;

                    resolve();
                };
                const messageChannel = new MessageChannel();
                const ports = [messageChannel.port1, messageChannel.port2];

                disconnectRequestId = 823;

                worker.addEventListener('message', eventListener);

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );

                return promise;
            });

            it('should disconnect a port', () => {
                const { promise, resolve } = Promise.withResolvers();

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: disconnectRequestId,
                        result: null
                    });

                    resolve();
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });

                return promise;
            });
        });

        describe('isSupported()', () => {
            let isSupportedRequestId;

            beforeEach(() => {
                isSupportedRequestId = 2123;
            });

            it('should return true', () => {
                const { promise, resolve } = Promise.withResolvers();

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: isSupportedRequestId,
                        result: true
                    });

                    resolve();
                });

                worker.postMessage({
                    id: isSupportedRequestId,
                    method: 'isSupported'
                });

                return promise;
            });
        });
    });

    describe('with an additional implementation of a subtraction', () => {
        beforeEach(() => {
            worker = new Worker(new URL('../fixtures/subtract-worker', import.meta.url), { type: 'module' });
        });

        describe('connect()', () => {
            let connectRequestId;
            let ports;

            beforeEach(() => {
                connectRequestId = 723;

                const messageChannel = new MessageChannel();

                ports = [messageChannel.port1, messageChannel.port2];
            });

            it('should connect a port', () => {
                const { promise, resolve } = Promise.withResolvers();

                worker.addEventListener('message', ({ data }) => {
                    expect(data.result).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: data.result
                    });

                    resolve();
                });

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );

                return promise;
            });

            it('should communicate via a connected port', () => {
                const { promise, resolve } = Promise.withResolvers();
                const minuend = 178;
                const subtractRequestId = 1982;
                const subtrahend = 67;

                ports[1].start();
                ports[1].addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: subtractRequestId,
                        result: minuend - subtrahend
                    });

                    resolve();
                });

                worker.addEventListener('message', ({ data }) => {
                    expect(data.result).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: data.result
                    });

                    ports[1].postMessage({
                        id: subtractRequestId,
                        method: 'subtract',
                        params: { minuend, subtrahend }
                    });
                });

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );

                return promise;
            });
        });

        describe('disconnect()', () => {
            let disconnectRequestId;
            let portId;
            let ports;

            beforeEach(() => {
                const { promise, resolve } = Promise.withResolvers();
                const connectRequestId = 723;
                const eventListener = ({ data }) => {
                    worker.removeEventListener('message', eventListener);

                    portId = data.result;

                    resolve();
                };
                const messageChannel = new MessageChannel();

                disconnectRequestId = 823;
                ports = [messageChannel.port1, messageChannel.port2];

                worker.addEventListener('message', eventListener);

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );

                return promise;
            });

            it('should disconnect a port', () => {
                const { promise, resolve } = Promise.withResolvers();

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: disconnectRequestId,
                        result: null
                    });

                    resolve();
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });

                return promise;
            });

            it('should not communicate via a disconnected port', () => {
                const { promise, resolve } = Promise.withResolvers();
                const minuend = 178;
                const portMessageListener = spy();
                const subtractRequestId = 1982;
                const subtrahend = 67;

                ports[1].start();
                ports[1].addEventListener('message', portMessageListener);

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: disconnectRequestId,
                        result: null
                    });

                    ports[1].postMessage({
                        id: subtractRequestId,
                        method: 'subtract',
                        params: { minuend, subtrahend }
                    });

                    setTimeout(() => {
                        expect(portMessageListener).to.have.not.been.called;

                        resolve();
                    }, 1000);
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });

                return promise;
            });
        });
    });

    describe('with an additional implementation using transferables', () => {
        beforeEach(() => {
            worker = new Worker(new URL('../fixtures/transfer-worker', import.meta.url), { type: 'module' });
        });

        describe('connect()', () => {
            let connectRequestId;
            let ports;

            beforeEach(() => {
                connectRequestId = 723;

                const messageChannel = new MessageChannel();

                ports = [messageChannel.port1, messageChannel.port2];
            });

            it('should connect a port', () => {
                const { promise, resolve } = Promise.withResolvers();

                worker.addEventListener('message', ({ data }) => {
                    expect(data.result).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: data.result
                    });

                    resolve();
                });

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );

                return promise;
            });

            it('should communicate via a connected port', () => {
                const { promise, resolve } = Promise.withResolvers();
                const arrayBuffer = new ArrayBuffer(32);
                const transferRequestId = 1982;

                ports[1].start();
                ports[1].addEventListener('message', ({ data }) => {
                    const result = data.result;

                    expect(result.byteLength).to.equal(32);

                    expect(data).to.deep.equal({
                        id: transferRequestId,
                        result
                    });

                    resolve();
                });

                worker.addEventListener('message', ({ data }) => {
                    expect(data.result).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: data.result
                    });

                    ports[1].postMessage({
                        id: transferRequestId,
                        method: 'transfer',
                        params: arrayBuffer
                    });
                });

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );

                return promise;
            });
        });

        describe('disconnect()', () => {
            let disconnectRequestId;
            let portId;
            let ports;

            beforeEach(() => {
                const { promise, resolve } = Promise.withResolvers();
                const connectRequestId = 723;
                const eventListener = ({ data }) => {
                    worker.removeEventListener('message', eventListener);

                    portId = data.result;

                    resolve();
                };
                const messageChannel = new MessageChannel();

                disconnectRequestId = 823;
                ports = [messageChannel.port1, messageChannel.port2];

                worker.addEventListener('message', eventListener);

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );

                return promise;
            });

            it('should disconnect a port', () => {
                const { promise, resolve } = Promise.withResolvers();

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: disconnectRequestId,
                        result: null
                    });

                    resolve();
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });

                return promise;
            });

            it('should not communicate via a disconnected port', () => {
                const { promise, resolve } = Promise.withResolvers();
                const arrayBuffer = new ArrayBuffer(32);
                const portMessageListener = spy();
                const transferRequestId = 1982;

                ports[1].start();
                ports[1].addEventListener('message', portMessageListener);

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: disconnectRequestId,
                        result: null
                    });

                    ports[1].postMessage({
                        id: transferRequestId,
                        method: 'transfer',
                        params: arrayBuffer
                    });

                    setTimeout(() => {
                        expect(portMessageListener).to.have.not.been.called;

                        resolve();
                    }, 1000);
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });

                return promise;
            });
        });
    });

    describe('with an additional implementation without any params', () => {
        beforeEach(() => {
            worker = new Worker(new URL('../fixtures/constant-worker', import.meta.url), { type: 'module' });
        });

        describe('connect()', () => {
            let connectRequestId;
            let ports;

            beforeEach(() => {
                connectRequestId = 723;

                const messageChannel = new MessageChannel();

                ports = [messageChannel.port1, messageChannel.port2];
            });

            it('should connect a port', () => {
                const { promise, resolve } = Promise.withResolvers();

                worker.addEventListener('message', ({ data }) => {
                    expect(data.result).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: data.result
                    });

                    resolve();
                });

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );

                return promise;
            });

            it('should communicate via a connected port', () => {
                const { promise, resolve } = Promise.withResolvers();
                const askRequestId = 1982;

                ports[1].start();
                ports[1].addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: askRequestId,
                        result: 42
                    });

                    resolve();
                });

                worker.addEventListener('message', ({ data }) => {
                    expect(data.result).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: data.result
                    });

                    ports[1].postMessage({
                        id: askRequestId,
                        method: 'ask'
                    });
                });

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );

                return promise;
            });
        });

        describe('disconnect()', () => {
            let disconnectRequestId;
            let portId;
            let ports;

            beforeEach(() => {
                const { promise, resolve } = Promise.withResolvers();
                const connectRequestId = 723;
                const eventListener = ({ data }) => {
                    worker.removeEventListener('message', eventListener);

                    portId = data.result;

                    resolve();
                };
                const messageChannel = new MessageChannel();

                disconnectRequestId = 823;
                ports = [messageChannel.port1, messageChannel.port2];

                worker.addEventListener('message', eventListener);

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );

                return promise;
            });

            it('should disconnect a port', () => {
                const { promise, resolve } = Promise.withResolvers();

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: disconnectRequestId,
                        result: null
                    });

                    resolve();
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });

                return promise;
            });

            it('should not communicate via a disconnected port', () => {
                const { promise, resolve } = Promise.withResolvers();
                const askRequestId = 1982;
                const portMessageListener = spy();

                ports[1].start();
                ports[1].addEventListener('message', portMessageListener);

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: disconnectRequestId,
                        result: null
                    });

                    ports[1].postMessage({
                        id: askRequestId,
                        method: 'ask'
                    });

                    setTimeout(() => {
                        expect(portMessageListener).to.have.not.been.called;

                        resolve();
                    }, 1000);
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });

                return promise;
            });
        });
    });

    describe('with an additional implementation with an unsupported worker', () => {
        beforeEach(() => {
            worker = new Worker(new URL('../fixtures/unsupported-worker', import.meta.url), { type: 'module' });
        });

        describe('isSupported()', () => {
            let isSupportedRequestId;

            beforeEach(() => {
                isSupportedRequestId = 2123;
            });

            it('should return a false', () => {
                const { promise, resolve } = Promise.withResolvers();

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: isSupportedRequestId,
                        result: false
                    });

                    resolve();
                });

                worker.postMessage({
                    id: isSupportedRequestId,
                    method: 'isSupported'
                });

                return promise;
            });
        });
    });
});
