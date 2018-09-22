import { createMessageHandler } from '../../../src/helpers/create-message-handler';
import { spy } from 'sinon';

describe('createMessageHandler', () => {

    let receiver;

    after((done) => {
        // @todo This is an optimistic fix to prevent the famous 'Some of your tests did a full page reload!' error.
        setTimeout(done, 1000);
    });

    beforeEach(() => {
        receiver = { postMessage: spy() };
    });

    describe('without any implementation', () => {

        let messageHandler;

        beforeEach(() => {
            messageHandler = createMessageHandler(receiver, { });
        });

        describe('with an unknown message', () => {

            it('should call postMessage with an error', () => {
                messageHandler({ data: { id: null, method: 'explode' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32601,
                        message: 'The requested method called "explode" is not supported.'
                    },
	                id: null
                });
            });

        });

    });

    describe('with a synchronous broken implementation', () => {

        let messageHandler;

        beforeEach(() => {
            messageHandler = createMessageHandler(receiver, {
                fail: () => {
                    // This message will throw an anonymous error to test the behaviour in case of an unexpected error.
                    throw new Error('This is a random error message.');
                }
            });
        });

        describe('with an unknown message', () => {

            it('should call postMessage with an error', () => {
                messageHandler({ data: { id: null, method: 'explode' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32601,
                        message: 'The requested method called "explode" is not supported.'
                    },
	                id: null
                });
            });

        });

        describe('with a known message', () => {

            it('should call postMessage with an error', () => {
                messageHandler({ data: { id: null, method: 'fail' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32603,
                        message: 'This is a random error message.'
                    },
	                id: null
                });
            });

        });

    });

    describe('with an asynchronous broken implementation', () => {

        let messageHandler;

        beforeEach(() => {
            messageHandler = createMessageHandler(receiver, {
                /*
                 * This message will return a promise which gets rejected with an anonymous error to test the behaviour in case of an
                 * unexpected error.
                 */
                fail: () => Promise.reject(new Error('This is a random error message.'))
            });
        });

        describe('with an unknown message', () => {

            it('should call postMessage with an error', async () => {
                await messageHandler({ data: { id: null, method: 'explode' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32601,
                        message: 'The requested method called "explode" is not supported.'
                    },
                    id: null
                });
            });

        });

        describe('with a known message', () => {

            it('should call postMessage with an error', async () => {
                await messageHandler({ data: { id: null, method: 'fail' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32603,
                        message: 'This is a random error message.'
                    },
                    id: null
                });
            });

        });

    });

    describe('with a notification implementation', () => {

        let messageHandler;

        beforeEach(() => {
            messageHandler = createMessageHandler(receiver, {
                accept: () => {
                    // Just accept the notification.

                    return { result: undefined };
                }
            });
        });

        describe('with an unknown message', () => {

            it('should call postMessage with an error', () => {
                messageHandler({ data: { id: null, method: 'explode' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32601,
                        message: 'The requested method called "explode" is not supported.'
                    },
	                id: null
                });
            });

        });

        describe('with a known message', () => {

            it('should not call postMessage', () => {
                messageHandler({ data: { id: null, method: 'accept' } });

                expect(receiver.postMessage).to.have.not.been.called;
            });

        });

    });

    describe('with a chatty notification implementation', () => {

        let messageHandler;

        beforeEach(() => {
            messageHandler = createMessageHandler(receiver, {
                respond: () => {
                    // Return an unexpected result to a notification.

                    return { result: 'anything' };
                }
            });
        });

        describe('with an unknown message', () => {

            it('should call postMessage with an error', () => {
                messageHandler({ data: { id: null, method: 'explode' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32601,
                        message: 'The requested method called "explode" is not supported.'
                    },
	                id: null
                });
            });

        });

        describe('with a known message', () => {

            it('should call postMessage with an error', () => {
                messageHandler({ data: { id: null, method: 'respond' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32603,
                        message: 'The handler of the method called "respond" returned an unexpected result.'
                    },
	                id: null
                });
            });

        });

    });

    describe('with a synchronous request implementation', () => {

        let id;
        let messageHandler;

        beforeEach(() => {
            id = 982;

            messageHandler = createMessageHandler(receiver, {
                respond: () => {
                    // Return an expected result.

                    return { result: 'anything', transferables: [ 'anything' ] };
                }
            });
        });

        describe('with an unknown message', () => {

            it('should call postMessage with an error', () => {
                messageHandler({ data: { id, method: 'explode' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32601,
                        message: 'The requested method called "explode" is not supported.'
                    },
                    id
                });
            });

        });

        describe('with a known message', () => {

            it('should call postMessage with the result', (done) => {
                messageHandler({ data: { id, method: 'respond' } });

                setTimeout(() => {
                    expect(receiver.postMessage).to.have.been.calledOnce;
                    expect(receiver.postMessage).to.have.been.calledWithExactly({
                        id,
                        result: 'anything'
                    }, [ 'anything' ]);

                    done();
                });
            });

        });

    });

    describe('with an asynchronous request implementation', () => {

        let id;
        let messageHandler;

        beforeEach(() => {
            id = 982;

            messageHandler = createMessageHandler(receiver, {
                delay: () => {
                    // Return an expected result wrapped in a promise.

                    return Promise.resolve({ result: 'anything', transferables: [ 'anything' ] });
                }
            });
        });

        describe('with an unknown message', () => {

            it('should call postMessage with an error', () => {
                messageHandler({ data: { id, method: 'explode' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32601,
                        message: 'The requested method called "explode" is not supported.'
                    },
                    id
                });
            });

        });

        describe('with a known message', () => {

            it('should call postMessage with the result', (done) => {
                messageHandler({ data: { id, method: 'delay' } });

                setTimeout(() => {
                    expect(receiver.postMessage).to.have.been.calledOnce;
                    expect(receiver.postMessage).to.have.been.calledWithExactly({
                        id,
                        result: 'anything'
                    }, [ 'anything' ]);

                    done();
                });
            });

        });

    });

    describe('with a synchronous but silent request implementation', () => {

        let id;
        let messageHandler;

        beforeEach(() => {
            id = 982;

            messageHandler = createMessageHandler(receiver, {
                swallow: () => {
                    // This request handler doesn't return a result.

                    return { result: undefined };
                }
            });
        });

        describe('with an unknown message', () => {

            it('should call postMessage with an error', () => {
                messageHandler({ data: { id, method: 'explode' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32601,
                        message: 'The requested method called "explode" is not supported.'
                    },
                    id
                });
            });

        });

        describe('with a known message', () => {

            it('should call postMessage with an error', () => {
                messageHandler({ data: { id, method: 'swallow' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32603,
                        message: 'The handler of the method called "swallow" returned an unexpected result.'
                    },
                    id
                });
            });

        });

    });

    describe('with an asynchronous but silent request implementation', () => {

        let id;
        let messageHandler;

        beforeEach(() => {
            id = 982;

            messageHandler = createMessageHandler(receiver, {
                swallow: () => {
                    // This request handler doesn't return a result.

                    return Promise.resolve({ result: undefined });
                }
            });
        });

        describe('with an unknown message', () => {

            it('should call postMessage with an error', () => {
                messageHandler({ data: { id, method: 'explode' } });

                expect(receiver.postMessage).to.have.been.calledOnce;
                expect(receiver.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32601,
                        message: 'The requested method called "explode" is not supported.'
                    },
                    id
                });
            });

        });

        describe('with a known message', () => {

            it('should call postMessage with an error', (done) => {
                messageHandler({ data: { id, method: 'swallow' } });

                setTimeout(() => {
                    expect(receiver.postMessage).to.have.been.calledOnce;
                    expect(receiver.postMessage).to.have.been.calledWithExactly({
                        error: {
                            code: -32603,
                            message: 'The handler of the method called "swallow" returned an unexpected result.'
                        },
                        id
                    });

                    done();
                });
            });

        });

    });

});
