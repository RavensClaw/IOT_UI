import ConditionModel from "./ConditionModel";

export default interface OutputStateModel {
    conditions?: ConditionModel[];
}

export interface OutputState {
    [s: string]: OutputStateModel;
}

export interface Service {

    [s: string]: Characteristics;
}

export interface Characteristics {

    [s: string]: CharacteristicsOption;
}

export interface CharacteristicsOption {

    [s: string]: {
        outputState: OutputState,
        input?: string
        bluetoothResponse?: string
    };
}
