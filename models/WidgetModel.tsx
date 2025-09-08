import InputStateModel from "./InputStateModel";
export default interface WidgetModel {
    widgetId: string;
    label?: string;
    widgetType: "OnOffButton" | "OnOffSwitch" | "slider" | "PushButton";
    description?: string | null;
    userId: string;
    inputStates?: InputStates;
    readOnly: false | true;
    connectionType?: "WIFI" | "BLUETOOTH";
    bluetoothDevice?: any;
}


export interface InputStates {
    [s: string]: InputStateModel;
  }
