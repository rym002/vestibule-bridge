import { registerModule } from "../src";
export let fakeLoaded = false;

export async function startModule(){
    return registerModule({
        name:'testModule',
        init:async ()=>{
            fakeLoaded = true;
        }
    })
}