import ListModel from "./ListModel";
import OutputStateModel from "./OutputStateModel";

export default interface InputStateModel {
    method: string;
    stateName: string;
    apiUrl: string;
    params?: ListModel[];
    headers?: ListModel[];
    body?: any;
    response?: any;
    responseType?: string;
    outputStates?: OutputState;
}

export interface OutputState {
    [s: string]: OutputStateModel;
}
