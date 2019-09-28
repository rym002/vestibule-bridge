import { EventEmitter } from "events";

class InitEmitter extends EventEmitter {
    private completedModules = new Set<symbol>();
    constructor() {
        super();
        this.on('error', this.errorHandler);
    }
    completeModule(moduleId: symbol) {
        this.completedModules.add(moduleId)
    }
    isComplete(moduleId: symbol): boolean {
        return this.completedModules.has(moduleId)
    }
    errorHandler(err: Error) {
        console.error(err, err.stack)
    }
}

const initEmitter = new InitEmitter();

export interface VestibuleInit {
    name: string
    init: () => Promise<void>
    depends?: symbol[]
}

async function initModule(moduleInit: VestibuleInit, moduleId: symbol) {
    try {
        console.log('Init Module %s Started', moduleInit.name)
        await moduleInit.init();
        initEmitter.completeModule(moduleId);
        initEmitter.emit(moduleId);
        console.log('Init Module %s Complete', moduleInit.name)
    } catch (err) {
        console.error('Init Module %s Error %O', moduleInit.name, err)
        initEmitter.errorHandler(err);
    }

}
export function registerModule(moduleInit: VestibuleInit): symbol {
    const moduleId = Symbol(moduleInit.name);
    if (moduleInit.depends) {
        moduleInit.depends = moduleInit.depends.filter(dependId => {
            return !initEmitter.isComplete(dependId)
        })
    }

    if (moduleInit.depends && moduleInit.depends.length) {
        moduleInit.depends.forEach(dependId => {
            initEmitter.once(dependId, async () => {
                const moduleDepends = moduleInit.depends;
                if (moduleDepends) {
                    moduleDepends.splice(moduleDepends.indexOf(dependId), 1)
                    if (!moduleDepends.length) {
                        await initModule(moduleInit, moduleId)
                    }
                }
            })
        })
    } else {
        initModule(moduleInit, moduleId)
    }
    return moduleId
}

export async function startModules(modules: string[]) {
    const imports = modules.map(async modulePath => {
        const importedModule = await import(modulePath)
        if (importedModule.startModule) {
            importedModule.startModule()
        } else {
            throw new Error('Module ' + modulePath + ' missing exported startModule function')
        }
    })
    await Promise.all(imports)
}
