import InputStateModel from "../models/InputStateModel";
import WidgetModel from "@/models/WidgetModel";
import { OutputState } from "@/models/OutputStateModel";
import { Buffer } from "buffer";
import ManageBluetooth from 'react-native-ble-manager';
import bleManager from '../app/util/blemanagerutil';
import { Constants } from "@/constants/constants";
import BLEPermissionsManager from "@/app/util/blepermissionsmanager";

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// Helper function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to cleanup BLE connection
const cleanupBLEConnection = async (deviceId: string, subscription: any) => {
    try {
        if (subscription) {
            subscription.remove();
        }
    } catch (err) {
        console.log("Error removing subscription:", err);
    }

    try {
        await bleManager.cancelDeviceConnection(deviceId);
    } catch (err) {
        console.log("Error canceling connection:", err);
    }
};

// Export function to check if a Bluetooth device is connected
export const checkBluetoothConnection = async (deviceId: string): Promise<boolean> => {
    try {
        if (!deviceId) {
            console.log("Device ID is missing");
            return false;
        }

        try {
            // Check if device is connected
            const isConnected = await bleManager.isDeviceConnected(deviceId);
            console.log(`Device ${deviceId} connection status: ${isConnected}`);
            return isConnected;
        } catch (err) {
            console.log("Error checking device connection:", err);
            return false;
        }
    } catch (err) {
        console.log("Error in checkBluetoothConnection:", err);
        return false;
    }
};

// Export function to connect to a Bluetooth device
export const connectToBluetoothDevice = async (deviceId: string): Promise<boolean> => {
    try {
        if (!deviceId) {
            console.log("Device ID is missing");
            return false;
        }

        console.log(`Attempting to connect to device: ${deviceId}`);
        
        try {
            await bleManager.connectToDevice(deviceId, {
                timeout: Constants.BLUETOOTH_CONNECTION_TIMEOUT_IN_MS
            });
            console.log(`✓ Successfully connected to device: ${deviceId}`);
            
            // Wait for connection to stabilize
            await sleep(500);
            
            // Try to discover services
            try {
                await bleManager.discoverAllServicesAndCharacteristicsForDevice(deviceId);
                console.log(`✓ Services discovered for device: ${deviceId}`);
            } catch (discoverErr: any) {
                console.log(`⚠️ Service discovery failed (may be cached): ${discoverErr.message}`);
                // Continue anyway as services might be cached
            }
            
            return true;
        } catch (err: any) {
            console.log(`❌ Failed to connect to device: ${err.message}`);
            return false;
        }
    } catch (err) {
        console.log("Error in connectToBluetoothDevice:", err);
        return false;
    }
};

// Helper function to evaluate a single condition
const evaluateCondition = (
    condition: string,
    responseValue: any,
    value1: any,
    value2?: any
): boolean => {
    switch (condition) {
        case "LessThan":
            return responseValue < value1;
        case "LessEqualsTO":
            return responseValue <= value1;
        case "GreaterThan":
            return responseValue > value1;
        case "GreaterThanEqualsTO":
            return responseValue >= value1;
        case "Equals":
            return responseValue === value1;
        case "Contains":
            if (Array.isArray(responseValue)) {
                return responseValue.includes(value1);
            } else if (typeof responseValue === "object") {
                return JSON.stringify(responseValue).indexOf(value1) !== -1;
            } else if (typeof responseValue === "string") {
                return responseValue.indexOf(value1) !== -1;
            }
            return false;
        case "DoesNotContains":
            if (Array.isArray(responseValue)) {
                return !responseValue.includes(value1);
            } else if (typeof responseValue === "object") {
                return JSON.stringify(responseValue).indexOf(value1) === -1;
            } else if (typeof responseValue === "string") {
                return responseValue.indexOf(value1) === -1;
            }
            return false;
        case "Between":
            return value2 && responseValue > value1 && responseValue < value2;
        default:
            return false;
    }
};

// Helper function to check if all conditions for a state are satisfied
const areConditionsSatisfied = (
    conditions: any[],
    responseData: any
): boolean => {
    if (!conditions || conditions.length === 0) {
        return true; // No conditions means always satisfied
    }

    for (const condition of conditions) {
        const { key, value1, value2, condition: conditionType } = condition;
        const responseValue = responseData[key];

        if (value1 && !evaluateCondition(conditionType, responseValue, value1, value2)) {
            return false;
        }
    }

    return true;
};

// Helper function to map error messages based on error details
const getErrorMessageFromError = (error: any): string => {
    const errorMessage = (error.message || error.reason || "").toLowerCase();

    if (errorMessage.includes("disconnected") || errorMessage.includes("147") || errorMessage.includes("gatt")) {
        return "Device disconnected after multiple retries. Please check device connection and try again.";
    } else if (errorMessage.includes("timeout")) {
        return "Connection timeout. Device may be out of range or unresponsive.";
    } else if (errorMessage.includes("write")) {
        return "Failed to write to device. Please check device compatibility.";
    } else if (errorMessage.includes("read")) {
        return "Failed to read from device. Please try again.";
    } else {
        return "Bluetooth operation failed. Please reconnect and try again.";
    }
};

// Helper function to extract service details from widget state
const extractServiceDetails = (state: InputStateModel): {
    serviceIdKey: string | null;
    characteristics: string | null;
    characteristicsOptions: string | null;
} => {
    let serviceIdKey = null;
    let characteristics = null;
    let characteristicsOptions = null;

    if (state.service) {
        const serviceKeys = Object.keys(state.service);
        if (serviceKeys.length > 0) {
            serviceIdKey = serviceKeys[0];
            const characteristicKeys = Object.keys(state.service[serviceIdKey]);
            if (characteristicKeys.length > 0) {
                characteristics = characteristicKeys[0];
                const optionKeys = Object.keys(state.service[serviceIdKey][characteristics]);
                if (optionKeys.length > 0) {
                    characteristicsOptions = optionKeys[0];
                }
            }
        }
    }

    return { serviceIdKey, characteristics, characteristicsOptions };
};

// Helper function to perform BLE read/write operation with retry logic
const performBLEOperation = async (
    deviceId: string,
    serviceIdKey: string,
    characteristics: string,
    characteristicsOptions: string,
    input: string
): Promise<any> => {
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        let isConnected = false;
        
        try {
            console.log(`\n=== Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} ===`);

            // Always try to disconnect first to ensure clean state
            if (attempt > 1) {
                try {
                    await bleManager.cancelDeviceConnection(deviceId);
                    await sleep(500); // Wait before reconnecting
                } catch (err) {
                    console.log("Disconnect before retry:", err);
                }
            }

            // Connect with longer timeout
            try {
                console.log(`Connecting to device: ${deviceId}`);
                await bleManager.connectToDevice(deviceId, {
                    timeout: Constants.BLUETOOTH_CONNECTION_TIMEOUT_IN_MS
                });
                isConnected = true;
                console.log("✓ Connected successfully");
                
                // Wait a bit for connection to stabilize
                await sleep(500);
            } catch (connectErr: any) {
                console.log("❌ Connection failed:", connectErr.message);
                isConnected = false;
                throw connectErr;
            }

            // Discover services
            try {
                console.log("Discovering services...");
                await bleManager.discoverAllServicesAndCharacteristicsForDevice(deviceId);
                console.log("✓ Services discovered");
            } catch (discoverErr: any) {
                console.log("⚠️  Service discovery failed:", discoverErr.message);
                // For cached services, this might fail - that's okay
            }

            // Small delay before operation
            await sleep(200);

            // Perform the operation
            console.log(`Performing ${characteristicsOptions} operation...`);
            let bleResponse = null;

            if (characteristicsOptions === 'isReadable') {
                bleResponse = await bleManager.readCharacteristicForDevice(
                    deviceId,
                    serviceIdKey,
                    characteristics
                );
                console.log("✓ Read successful");
            } else if (characteristicsOptions === 'isWritableWithResponse') {
                bleResponse = await bleManager.writeCharacteristicWithResponseForDevice(
                    deviceId,
                    serviceIdKey,
                    characteristics,
                    btoa(input ? input : '')
                );
                console.log("✓ Write with response successful");
            } else if (characteristicsOptions === 'isWritableWithoutResponse') {
                await bleManager.writeCharacteristicWithoutResponseForDevice(
                    deviceId,
                    serviceIdKey,
                    characteristics,
                    btoa(input ? input : '')
                );
                console.log("✓ Write without response successful");
            }

            console.log("=== Operation completed successfully ===\n");
            return { success: true, data: bleResponse };

        } catch (error: any) {
            lastError = error;
            console.log(`❌ Attempt ${attempt} failed:`, error.message);

            if (attempt < MAX_RETRY_ATTEMPTS) {
                const waitTime = RETRY_DELAY_MS * attempt;
                console.log(`Waiting ${waitTime}ms before retry...`);
                await sleep(waitTime);
            }
        }
    }

    // All retries failed
    console.log(`\n❌ All ${MAX_RETRY_ATTEMPTS} attempts failed`);
    throw lastError;
};

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

    const permissions = await BLEPermissionsManager.ensureBLEPermissions();

    if (permissions) {

        ManageBluetooth.enableBluetooth().then(async () => {

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
                    const input = state.service[serviceIdKey][characteristics][characteristicsOptions].input;
                    
                    // Safety check for device ID
                    if (!widget?.bluetoothDevice?.device?.id) {
                        console.error("Device ID is missing or null");
                        setHasError(true);
                        setErrorMessage("Device information is missing. Please reconnect the device.");
                        setActionRequest(false);
                        return;
                    }
                    
                    const deviceId = widget.bluetoothDevice.device.id;
                    let subscription: any = null;
                    
                    try {
                        console.log(`Starting BLE operation for device: ${deviceId}`);
                        
                        // Setup disconnection listener
                        const handleDisconnect = (device: any) => {
                            if (device?.id) {
                                console.log(`⚠️  Device ${device.id} was disconnected during operation`);
                            } else {
                                console.log(`⚠️  Device was disconnected during operation`);
                            }
                            // Don't set error here as the operation might complete successfully
                        };

                        subscription = bleManager.onDeviceDisconnected(deviceId, handleDisconnect);

                        // Perform operation with retry logic
                        const result = await performBLEOperation(
                            deviceId,
                            serviceIdKey,
                            characteristics,
                            characteristicsOptions,
                            input || ''
                        );

                        const bleResponse = result.data;
                        let hasResponse = result.data !== undefined && result.data !== null;
                        
                        if (hasResponse && characteristicsOptions === 'isReadable') {
                            // Only isReadable has responses
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

                                let state1ConditionStatified = false;
                                let state2ConditionStatified = false;

                                let outputConditions: any = [];
                                if (state.service && state.service[serviceIdKey][characteristics][characteristicsOptions]) {
                                    const outputState: OutputState = state.service[serviceIdKey][characteristics][characteristicsOptions].outputState;
                                    if (state.service[serviceIdKey][characteristics][characteristicsOptions].outputState[outputState1] &&
                                        outputState[outputState1].conditions) {
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
                            console.log("Write operation completed successfully")
                            setActionRequest(false);
                        }

                        // Clean disconnect after successful operation
                        await cleanupBLEConnection(deviceId, subscription);

                    } catch (e: any) {
                        console.log("❌ BLE Call Error:", e)
                        console.log("Error reason:", e.reason || e.message)
                        
                        // Clean up subscription and connection in case of error
                        await cleanupBLEConnection(deviceId, subscription);
                        
                        // Specific error handling for disconnection
                        const errorMessage = (e.message || e.reason || "").toLowerCase();
                        if (errorMessage.includes("disconnected") || errorMessage.includes("147") || errorMessage.includes("gatt")) {
                            setHasError(true);
                            setErrorMessage("Device disconnected after multiple retries. Please check device connection and try again.");
                        } else if (errorMessage.includes("timeout")) {
                            setHasError(true);
                            setErrorMessage("Connection timeout. Device may be out of range or unresponsive.");
                        } else if (errorMessage.includes("write")) {
                            setHasError(true);
                            setErrorMessage("Failed to write to device. Please check device compatibility.");
                        } else if (errorMessage.includes("read")) {
                            setHasError(true);
                            setErrorMessage("Failed to read from device. Please try again.");
                        } else {
                            setHasError(true);
                            setErrorMessage("Bluetooth operation failed. Please reconnect and try again.");
                        }
                        
                        setActionRequest(false);
                    }
                } else {
                    console.log("ERROR HERE 3");
                    setHasError(true);
                    setErrorMessage("no device found");
                    setActionRequest(false);
                }

            } else {
                console.log("ERROR HERE 2");
                setHasError(true);
                setErrorMessage("no bleManager found");
                setActionRequest(false);
            }
        }).catch((error) => {
            console.log("ERROR HERE 1");
            setHasError(true);
            console.log(error);
            setErrorMessage("Bluetooth is not available");
            setActionRequest(false);
        });
    } else {
        setHasError(true);
        setErrorMessage("❌ Permission denied. Please enable Bluetooth & Location.");
        setActionRequest(false);
    }
}
