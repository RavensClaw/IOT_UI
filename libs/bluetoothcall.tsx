import { BleManager } from "react-native-ble-plx";
import InputStateModel from "../models/InputStateModel";
import WidgetModel from "@/models/WidgetModel";
import { OutputState } from "@/models/OutputStateModel";
import { Buffer } from "buffer";
import ManageBluetooth from 'react-native-ble-manager';

export const makeBluetoothCall = async (
    widget: WidgetModel,
    state: InputStateModel,
    setInputState: React.Dispatch<React.SetStateAction<string>>,
    setOutputState: React.Dispatch<React.SetStateAction<string>>,
    setActionRequest: React.Dispatch<React.SetStateAction<boolean>>,
    setHasError: React.Dispatch<React.SetStateAction<boolean>>,
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    outputState1: string,//ON
    outputState2: string//OFF
) => {

ManageBluetooth.enableBluetooth().then(async ()=>{

    const bleManager = new BleManager();
    console.log("BREAK POINT 3");

    console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::::::");


    if (bleManager && widget && widget.bluetoothDevice && widget.bluetoothDevice.device) {

        let isStatusCheck = false;
        if (state.stateName === "CHECK_STATUS") {
            isStatusCheck = true;
        } else {
            outputState1 = state.stateName;
        }

        let serviceIdKey = null;
        let characteristics = null;
        let characteristicsOptions = null;
        if (state.service) {
            if (Object.keys(state.service).length > 0) {
                serviceIdKey = Object.keys(state.service)[0];
                if (Object.keys(state.service[serviceIdKey]).length > 0) {
                    characteristics = Object.keys(state.service[serviceIdKey])[0]
                    if (Object.keys(state.service[serviceIdKey][characteristics]).length > 0) {
                        characteristicsOptions = Object.keys(state.service[serviceIdKey][characteristics])[0]
                    }
                }
            }
        }
        if (state.service && serviceIdKey && characteristics && characteristicsOptions) {
            //const bluetoothResponse = state.service[serviceIdKey][characteristics][characteristicsOptions].bluetoothResponse;
            const input = state.service[serviceIdKey][characteristics][characteristicsOptions].input;
            //const outputState = state.service[serviceIdKey][characteristics][characteristicsOptions].outputState;
            try {
                let bleResponse = null;
                let hasResponse = false;
                console.log(widget.bluetoothDevice.device.id)
                const connected = await bleManager.connectToDevice(widget.bluetoothDevice.device.id, { autoConnect: true });
                
                // Important: discover services/characteristics
                await connected.discoverAllServicesAndCharacteristics();

                // Monitor disconnection
                connected.onDisconnected((error, dev) => {
                console.log(`❌ Disconnected from ${dev?.id}`);
                if (error) {
                        console.log("Reason: " + error.message);
                    }
                });

                console.log(connected.isConnected());
                console.log(connected)
                if (characteristicsOptions === 'isReadable') {
                    bleResponse = await connected.readCharacteristicForService(
                        serviceIdKey,
                        characteristics);
                    hasResponse = true;
                } else if (characteristicsOptions === 'isWritableWithResponse') {
                    console.log("INSIDE isWritableWithResponse");
                    bleResponse = await connected.writeCharacteristicWithResponseForService(
                        serviceIdKey,
                        characteristics,
                        btoa(input ? input : ''))
                    hasResponse = true;
                } else if (characteristicsOptions === 'isWritableWithoutResponse') {
                    bleResponse = await connected.writeCharacteristicWithoutResponseForService(
                        serviceIdKey,
                        characteristics,
                        btoa(input ? input : ''))
                }
                if (hasResponse) {
                    if (bleResponse?.value) {
                        console.log("*********************************************")
                        console.log(bleResponse?.value)
                        console.log("*********************************************")

                        const decoded = Buffer.from(bleResponse.value, "base64").toString("utf-8");
                        
                        let responseData = null;

                        try {
                            responseData = JSON.parse(decoded);
                        } catch (err) {
                            responseData = { "response": decoded }
                        }

                        console.log("WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW");
                        console.log(responseData);

                        let state1ConditionStatified = false;
                        let state2ConditionStatified = false;

                        let outputConditions: any = [];
                        if (state.service && state.service[serviceIdKey][characteristics][characteristicsOptions]) {
                            console.log("IN HERE 1")
                            const outputState: OutputState = state.service[serviceIdKey][characteristics][characteristicsOptions].outputState;
                            if (state.service[serviceIdKey][characteristics][characteristicsOptions].outputState[outputState1] &&
                                outputState[outputState1].conditions) {
                                    console.log("IN HERE 2")

                                outputConditions = outputState[outputState1].conditions;
                                            console.log(outputConditions)
                                if (outputConditions && outputConditions.length > 0) {
                                    for (let i = 0; i < outputConditions?.length; i++) {
                                        const key = outputConditions[i].key;
                                        const value1 = outputConditions[i].value1;
                                        const value2 = outputConditions[i].value2;
                                        const responseValue = responseData[key];

                                        if (value1) {
                                            if (outputConditions[i].condition === "LessThan") {
                                                if (responseValue < value1) {
                                                    state1ConditionStatified = true;
                                                }
                                            } else if (outputConditions[i].condition === "LessEqualsTO") {
                                                if (responseValue <= value1) {
                                                    state1ConditionStatified = true;
                                                }
                                            } else if (outputConditions[i].condition === "GreaterThan") {
                                                if (responseValue > value1) {
                                                    state1ConditionStatified = true;
                                                }
                                            } else if (outputConditions[i].condition === "GreaterThanEqualsTO") {
                                                if (responseValue >= value1) {
                                                    state1ConditionStatified = true;
                                                }
                                            } else if (outputConditions[i].condition === "Equals") {
                                                console.log("INSIDE EQUALS")
                                                console.log(responseValue)
                                                console.log(value1)
                                                

                                                if (responseValue == value1) {
                                                    state1ConditionStatified = true;
                                                }
                                            } else if (outputConditions[i].condition === "Contains") {
                                                if (Array.isArray(responseValue) && responseValue.includes(value1)) {
                                                    state1ConditionStatified = true;
                                                } else if (typeof responseValue == "object" && JSON.stringify(responseValue).indexOf(value1) !== -1) {
                                                    state1ConditionStatified = true;
                                                } else if (typeof responseValue == "string" && responseValue.indexOf(value1) !== -1) {
                                                    state1ConditionStatified = true;
                                                }
                                            } else if (outputConditions[i].condition === "DoesNotContains") {
                                                if (Array.isArray(responseValue) && !responseValue.includes(value1)) {
                                                    state1ConditionStatified = true;
                                                } else if (typeof responseValue == "object" && JSON.stringify(responseValue).indexOf(value1) === -1) {
                                                    state1ConditionStatified = true;
                                                } else if (typeof responseValue == "string" && responseValue.indexOf(value1) === -1) {
                                                    state1ConditionStatified = true;
                                                }
                                            } else if (outputConditions[i].condition === "Between" && value2) {
                                                if (responseValue > value1 && responseValue < value2) {
                                                    state1ConditionStatified = true;
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    state1ConditionStatified = true;
                                }

                            }

                            if (isStatusCheck && !state1ConditionStatified) {

                                if (outputState[outputState2] &&
                                    outputState[outputState2].conditions) {

                                    outputConditions = outputState[outputState2].conditions;

                                    if (outputConditions && outputConditions.length > 0) {
                                        for (let i = 0; i < outputConditions?.length; i++) {
                                            const key = outputConditions[i].key;
                                            const value1 = outputConditions[i].value1;
                                            const value2 = outputConditions[i].value2;
                                            const responseValue = responseData[key];

                                            if (value1) {
                                                if (outputConditions[i].condition === "LessThan") {
                                                    if (responseValue < value1) {
                                                        state2ConditionStatified = true;
                                                    }
                                                } else if (outputConditions[i].condition === "LessEqualsTO") {
                                                    if (responseValue <= value1) {
                                                        state2ConditionStatified = true;
                                                    }
                                                } else if (outputConditions[i].condition === "GreaterThan") {
                                                    if (responseValue > value1) {
                                                        state2ConditionStatified = true;
                                                    }
                                                } else if (outputConditions[i].condition === "GreaterThanEqualsTO") {
                                                    if (responseValue >= value1) {
                                                        state2ConditionStatified = true;
                                                    }
                                                } else if (outputConditions[i].condition === "Equals") {
                                                    if (responseValue == value1) {
                                                        state2ConditionStatified = true;
                                                    }
                                                } else if (outputConditions[i].condition === "Contains") {
                                                    if (Array.isArray(responseValue) && responseValue.includes(value1)) {
                                                        state2ConditionStatified = true;
                                                    } else if (typeof responseValue == "object" && JSON.stringify(responseValue).indexOf(value1) !== -1) {
                                                        state2ConditionStatified = true;
                                                    } else if (typeof responseValue == "string" && responseValue.indexOf(value1) !== -1) {
                                                        state2ConditionStatified = true;
                                                    }
                                                } else if (outputConditions[i].condition === "DoesNotContains") {
                                                    if (Array.isArray(responseValue) && !responseValue.includes(value1)) {
                                                        state2ConditionStatified = true;
                                                    } else if (typeof responseValue == "object" && JSON.stringify(responseValue).indexOf(value1) === -1) {
                                                        state2ConditionStatified = true;
                                                    } else if (typeof responseValue == "string" && responseValue.indexOf(value1) === -1) {
                                                        state2ConditionStatified = true;
                                                    }
                                                } else if (outputConditions[i].condition === "Between" && value2) {
                                                    if (responseValue > value1 && responseValue < value2) {
                                                        state2ConditionStatified = true;
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        state2ConditionStatified = true;
                                    }
                                }

                            }
                            console.log(state1ConditionStatified)
                            console.log(state2ConditionStatified)
                            console.log("Q Q Q QQ QQ QQ QQ QQ QQ QQ QQ QQ QQ QQ QQ QQ QQ QQ Q");
                            if (state1ConditionStatified) {
                                setInputState(outputState1);
                                setOutputState(outputState1);
                            } else if (isStatusCheck && state2ConditionStatified) {
                                setInputState(outputState2);
                                setOutputState(outputState2);
                            }
                            setActionRequest(false);
                        } else {
                            if (!isStatusCheck) {
                                setInputState(outputState1);
                                setOutputState(outputState1);
                            }
                            console.log("No output states defined for this input state: " + state.stateName);
                            setActionRequest(false);
                        }
                    }
                } else {
                    console.log("Without response")
                }
            } catch (e: any) {
                console.log(e)
                setHasError(true);
                setErrorMessage(e.message);
                setActionRequest(false);
            }
        } else {
            setHasError(true);
            setErrorMessage("no device found");
            setActionRequest(false);
        }

    } else {
        setHasError(true);
        setErrorMessage("no bleManager found");
        setActionRequest(false);
    }
    }).catch((error) => {
    // Failure code
      setHasError(true);
      console.log(error);
      setErrorMessage("no bleManager found");
      setActionRequest(false);
  });

}
