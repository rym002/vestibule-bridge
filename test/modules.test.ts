import 'mocha';
import { registerModule, startModules } from '../src';
import { expect } from 'chai'
import { fakeLoaded } from './fakeModule'

describe('Module Init', function () {
    it('should call init after all dependencies are loaded', async function () {
        let childLoaded1 = false;
        const childModule1 = registerModule({
            name: 'childModule1',
            init: async () => {
                childLoaded1 = true
            }
        })
        let childLoaded2 = false;
        const childModule2 = registerModule({
            name: 'childModule2',
            init: async () => {
                childLoaded2 = true
            }
        })
        let testLoaded = new Promise((resolve, reject) => {
            process.nextTick(() => {
                expect(childLoaded1).to.be.true
                expect(childLoaded2).to.be.true
                resolve()
            })
        })
        registerModule({
            name: 'testModule',
            init: async () => {
                await testLoaded
            },
            depends: [childModule1, childModule2]
        });
        await testLoaded
    })
    it('should start modules', async function () {
        await startModules(['../test/fakeModule'])
        expect(fakeLoaded).to.be.true
    })
})