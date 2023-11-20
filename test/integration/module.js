import { spy } from 'sinon';

describe('module', () => {
    let worker;

    describe('with the default implementation', () => {
        beforeEach(() => {
            worker = new Worker('base/test/fixtures/default-worker.js');
        });

        describe('connect()', () => {
            let connectRequestId;
            let ports;

            beforeEach(() => {
                connectRequestId = 723;

                const messageChannel = new MessageChannel();

                ports = [messageChannel.port1, messageChannel.port2];
            });

            it('should connect a port', function (done) {
                this.timeout(6000);

                worker.addEventListener('message', ({ data }) => {
                    expect(data.result).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: data.result
                    });

                    done();
                });

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );
            });
        });

        describe('disconnect()', () => {
            let disconnectRequestId;
            let portId;

            beforeEach((done) => {
                const connectRequestId = 723;
                const eventListener = ({ data }) => {
                    worker.removeEventListener('message', eventListener);

                    portId = data.result;

                    done();
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
            });

            it('should disconnect a port', function (done) {
                this.timeout(6000);

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: disconnectRequestId,
                        result: null
                    });

                    done();
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });
            });
        });

        describe('isSupported()', () => {
            let isSupportedRequestId;

            beforeEach(() => {
                isSupportedRequestId = 2123;
            });

            it('should return true', function (done) {
                this.timeout(6000);

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: isSupportedRequestId,
                        result: true
                    });

                    done();
                });

                worker.postMessage({
                    id: isSupportedRequestId,
                    method: 'isSupported'
                });
            });
        });
    });

    describe('with an additional implementation of a subtraction', () => {
        beforeEach(() => {
            worker = new Worker('base/test/fixtures/subtract-worker.js');
        });

        describe('connect()', () => {
            let connectRequestId;
            let ports;

            beforeEach(() => {
                connectRequestId = 723;

                const messageChannel = new MessageChannel();

                ports = [messageChannel.port1, messageChannel.port2];
            });

            it('should connect a port', function (done) {
                this.timeout(6000);

                worker.addEventListener('message', ({ data }) => {
                    expect(data.result).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: data.result
                    });

                    done();
                });

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );
            });

            it('should communicate via a connected port', function (done) {
                this.timeout(6000);

                const minuend = 178;
                const subtractRequestId = 1982;
                const subtrahend = 67;

                ports[1].start();
                ports[1].addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: subtractRequestId,
                        result: minuend - subtrahend
                    });

                    done();
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
            });
        });

        describe('disconnect()', () => {
            let disconnectRequestId;
            let portId;
            let ports;

            beforeEach((done) => {
                const connectRequestId = 723;
                const eventListener = ({ data }) => {
                    worker.removeEventListener('message', eventListener);

                    portId = data.result;

                    done();
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
            });

            it('should disconnect a port', function (done) {
                this.timeout(6000);

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: disconnectRequestId,
                        result: null
                    });

                    done();
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });
            });

            it('should not communicate via a disconnected port', function (done) {
                this.timeout(6000);

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

                        done();
                    }, 1000);
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });
            });
        });
    });

    describe('with an additional implementation using transferables', () => {
        beforeEach(() => {
            worker = new Worker('base/test/fixtures/transfer-worker.js');
        });

        describe('connect()', () => {
            let connectRequestId;
            let ports;

            beforeEach(() => {
                connectRequestId = 723;

                const messageChannel = new MessageChannel();

                ports = [messageChannel.port1, messageChannel.port2];
            });

            it('should connect a port', function (done) {
                this.timeout(6000);

                worker.addEventListener('message', ({ data }) => {
                    expect(data.result).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: data.result
                    });

                    done();
                });

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );
            });

            it('should communicate via a connected port', function (done) {
                this.timeout(6000);

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

                    done();
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
            });
        });

        describe('disconnect()', () => {
            let disconnectRequestId;
            let portId;
            let ports;

            beforeEach((done) => {
                const connectRequestId = 723;
                const eventListener = ({ data }) => {
                    worker.removeEventListener('message', eventListener);

                    portId = data.result;

                    done();
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
            });

            it('should disconnect a port', function (done) {
                this.timeout(6000);

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: disconnectRequestId,
                        result: null
                    });

                    done();
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });
            });

            it('should not communicate via a disconnected port', function (done) {
                this.timeout(6000);

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

                        done();
                    }, 1000);
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });
            });
        });
    });

    describe('with an additional implementation without any params', () => {
        beforeEach(() => {
            worker = new Worker('base/test/fixtures/constant-worker.js');
        });

        describe('connect()', () => {
            let connectRequestId;
            let ports;

            beforeEach(() => {
                connectRequestId = 723;

                const messageChannel = new MessageChannel();

                ports = [messageChannel.port1, messageChannel.port2];
            });

            it('should connect a port', function (done) {
                this.timeout(6000);

                worker.addEventListener('message', ({ data }) => {
                    expect(data.result).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: data.result
                    });

                    done();
                });

                worker.postMessage(
                    {
                        id: connectRequestId,
                        method: 'connect',
                        params: { port: ports[0] }
                    },
                    [ports[0]]
                );
            });

            it('should communicate via a connected port', function (done) {
                this.timeout(6000);

                const askRequestId = 1982;

                ports[1].start();
                ports[1].addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: askRequestId,
                        result: 42
                    });

                    done();
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
            });
        });

        describe('disconnect()', () => {
            let disconnectRequestId;
            let portId;
            let ports;

            beforeEach((done) => {
                const connectRequestId = 723;
                const eventListener = ({ data }) => {
                    worker.removeEventListener('message', eventListener);

                    portId = data.result;

                    done();
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
            });

            it('should disconnect a port', function (done) {
                this.timeout(6000);

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: disconnectRequestId,
                        result: null
                    });

                    done();
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });
            });

            it('should not communicate via a disconnected port', function (done) {
                this.timeout(6000);

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

                        done();
                    }, 1000);
                });

                worker.postMessage({
                    id: disconnectRequestId,
                    method: 'disconnect',
                    params: { portId }
                });
            });
        });
    });

    describe('with an additional implementation with an unsupported worker', () => {
        beforeEach(() => {
            worker = new Worker('base/test/fixtures/unsupported-worker.js');
        });

        describe('isSupported()', () => {
            let isSupportedRequestId;

            beforeEach(() => {
                isSupportedRequestId = 2123;
            });

            it('should return a false', function (done) {
                this.timeout(6000);

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: isSupportedRequestId,
                        result: false
                    });

                    done();
                });

                worker.postMessage({
                    id: isSupportedRequestId,
                    method: 'isSupported'
                });
            });
        });
    });
});
