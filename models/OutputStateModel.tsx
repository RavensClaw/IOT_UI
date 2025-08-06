import ConditionModel from "./ConditionModel";
import ListModel from "./ListModel";

export default interface OutputStateModel {
    conditions?: ConditionModel[];
}

export interface OutputState {
    [s: string]: OutputStateModel;
}