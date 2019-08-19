import 'mocha';
import { listenInit, registerModule } from '../src';

describe('Module Init', function () {
    it('should execute the callback when the module loads after a listener is added', function (done) {
        listenInit('testModule', async () => {
            done();
        })
        registerModule({
            name: 'testModule',
            init: async () => {
                await new Promise((resolve, reject) => {
                    process.nextTick(() => {
                        resolve();
                    })
                })
            }
        });
    })
    it('should execute the callback when the module has loaded already', function (done) {
        registerModule({
            name: 'testModule',
            init: async () => {
            }
        }).then(() => {
            listenInit('testModule', async () => {
                process.nextTick(() => {
                    done();
                })
            })
        });
    })
})