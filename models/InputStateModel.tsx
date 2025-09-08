import ListModel from "./ListModel";
import OutputStateModel, { Service } from "./OutputStateModel";

export default interface InputStateModel {
    method?: string;
    stateName: string;
    apiUrl?: string;
    params?: ListModel[];
    headers?: ListModel[];
    body?: any;
    wifiResponse?: any;
    responseType?: string;
    service?: Service;
    wifiOutputStates?: OutputState;
}



export interface OutputState {
    [s: string]: OutputStateModel;
}
