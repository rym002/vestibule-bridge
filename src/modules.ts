import { EventEmitter } from "events";

class InitEmitter extends EventEmitter {
    private completedModules = new Set<string>();
    constructor() {
        super();
        this.on('error', this.errorHandler);
    }
    completeModule(moduleName: string) {
        this.completedModules.add(moduleName)
    }
    isComplete(moduleName: string): boolean {
        return this.completedModules.has(moduleName)
    }
    errorHandler(err: Error) {
        console.log("Init Error", err)
    }
}

const initEmitter = new InitEmitter();

export interface VestibuleInit {
    name: string
    init: () => Promise<void>
}

export async function registerModule(moduleInit: VestibuleInit) {
    try{
        await moduleInit.init();
        initEmitter.completeModule(moduleInit.name);
        initEmitter.emit(moduleInit.name);    
    }catch(err){
        initEmitter.errorHandler(err);
    }
}

export function listenInit(moduleName: string, callback: () => Promise<void>) {
    if (initEmitter.isComplete(moduleName)) {
        callback()
            .catch(err => {
                initEmitter.errorHandler(err);
            });
    } else {
        initEmitter.once(moduleName, callback);
    }
}