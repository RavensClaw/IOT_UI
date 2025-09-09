import InputStateModel from "../models/InputStateModel";
import ListModel from "../models/ListModel";

export const makeApiCall = (
    state: InputStateModel,
    setInputState: React.Dispatch<React.SetStateAction<string>>,
    setOutputState: React.Dispatch<React.SetStateAction<string>>,
    setActionRequest: React.Dispatch<React.SetStateAction<boolean>>,
    setHasError: React.Dispatch<React.SetStateAction<boolean>>,
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    outputState1: string,//ON
    outputState2: string//OFF
) => {

    let isStatusCheck = false;
    if (state.stateName === "CHECK_STATUS") {
        isStatusCheck = true;
    } else {
        outputState1 = state.stateName;
    }
    let apiURL: string = state.apiUrl?state.apiUrl: '';
    if (apiURL && apiURL?.trim() !== '') {

        const method = state.method;
        const headers = state.headers;
        const params = state.params;
        const body = state.body;
        let optionsHeaders: any = {};

        if (headers) {
            headers.map((headerItem: ListModel) => {
                if (headerItem.name &&
                    headerItem.name?.trim() !== "" &&
                    headerItem.value &&
                    headerItem.value?.trim() !== "") {
                    optionsHeaders[headerItem.name] = headerItem.value;
                }
            });
        }

        let options: any = {
            method: method,
            headers: optionsHeaders
        }

        if (params) {
            let alreadyHasParams: boolean = false;
            if (apiURL?.indexOf("?") != -1) {
                alreadyHasParams = true;
            }
            let toAppendUrl = '';
            params.map((paramItem: ListModel) => {
                if (paramItem.name &&
                    paramItem.name?.trim() !== "" &&
                    paramItem.value &&
                    paramItem.value?.trim() !== "") {
                    if (alreadyHasParams) {
                        toAppendUrl += "&" + paramItem.name + "=" + paramItem.value
                    } else {
                        toAppendUrl += "?" + paramItem.name + "=" + paramItem.value
                        alreadyHasParams = true;
                    }
                }
            });
            apiURL += toAppendUrl;
        }

        if (body) {
            options["body"] = JSON.stringify(body)
        }


        fetch(apiURL, options).then(async (response: any) => {

            let responseData = await response.text();
            try {
                responseData = JSON.parse(responseData)
            } catch (err) {
                responseData = { "response": responseData }
            }

            let state1ConditionStatified = false;
            let state2ConditionStatified = false;

            let outputConditions: any = [];
            if (state.wifiOutputStates) {
                if (state.wifiOutputStates[outputState1] &&
                    state.wifiOutputStates[outputState1].conditions) {
                    outputConditions = state.wifiOutputStates[outputState1].conditions;

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

                    if (state.wifiOutputStates[outputState2] &&
                        state.wifiOutputStates[outputState2].conditions) {

                        outputConditions = state.wifiOutputStates[outputState2].conditions;

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
        }).catch((error) => {
            console.log(error)
            setActionRequest(false);
            setHasError(true);
            setErrorMessage(error.message);
        });

    }
}
