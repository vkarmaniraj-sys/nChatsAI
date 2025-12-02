import { getSocket } from "./socket_service";

export const SendInputText = (value:string,model:string) => {
    // send value to socket to return vlaue in socket only ..
    getSocket().emit("input",{ message: value, model });
}

