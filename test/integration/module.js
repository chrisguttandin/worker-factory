describe('module', () => {

    let worker;

    after((done) => {
        // @todo This is a optimistic fix to prevent the famous 'Some of your tests did a full page reload!' error.
        setTimeout(done, 1000);
    });

    describe('with the default implementation', () => {

        beforeEach(() => {
            worker = new Worker('base/test/fixtures/default-worker.js');
        });

        describe('connect()', () => {

            let connectRequestId;
            let ports;

            beforeEach(() => {
                connectRequestId = 823;

                const messageChannel = new MessageChannel();

                ports = [ messageChannel.port1, messageChannel.port2 ];
            });

            it('should connect a port', function (done) {
                this.timeout(6000);

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: null
                    });

                    done();
                });

                worker.postMessage({
                    id: connectRequestId,
                    method: 'connect',
                    params: { port: ports[0] }
                }, [
                    ports[0]
                ]);
            });

        });

        describe('disconnect()', () => {

            let disconnectRequestId;
            let ports;

            beforeEach(() => {
                disconnectRequestId = 823;

                const messageChannel = new MessageChannel();

                ports = [ messageChannel.port1, messageChannel.port2 ];
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
                    params: { port: ports[0] }
                }, [
                    ports[0]
                ]);
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
                connectRequestId = 823;

                const messageChannel = new MessageChannel();

                ports = [ messageChannel.port1, messageChannel.port2 ];
            });

            it('should connect a port', function (done) {
                this.timeout(6000);

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: null
                    });

                    done();
                });

                worker.postMessage({
                    id: connectRequestId,
                    method: 'connect',
                    params: { port: ports[0] }
                }, [
                    ports[0]
                ]);
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
                        result: (minuend - subtrahend)
                    });

                    done();
                });

                worker.addEventListener('message', ({ data }) => {
                    expect(data).to.deep.equal({
                        id: connectRequestId,
                        result: null
                    });

                    ports[1].postMessage({
                        id: subtractRequestId,
                        method: 'subtract',
                        params: { minuend, subtrahend }
                    });
                });

                worker.postMessage({
                    id: connectRequestId,
                    method: 'connect',
                    params: { port: ports[0] }
                }, [
                    ports[0]
                ]);
            });

        });

        describe('disconnect()', () => {

            let disconnectRequestId;
            let ports;

            beforeEach(() => {
                disconnectRequestId = 823;

                const messageChannel = new MessageChannel();

                ports = [ messageChannel.port1, messageChannel.port2 ];
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
                    params: { port: ports[0] }
                }, [
                    ports[0]
                ]);
            });

        });

    });

});
