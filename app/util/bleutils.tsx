import { PermissionsAndroid, Platform } from "react-native";

export const requestBlePermissions = async () => {
    if (Platform.OS === "android") {
        if (Platform.Version >= 31) {
            // Android 12+
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);
            return (
                granted["android.permission.BLUETOOTH_SCAN"] === PermissionsAndroid.RESULTS.GRANTED &&
                granted["android.permission.BLUETOOTH_CONNECT"] === PermissionsAndroid.RESULTS.GRANTED &&
                granted["android.permission.ACCESS_FINE_LOCATION"] === PermissionsAndroid.RESULTS.GRANTED
            );
        } else {
            // Android 6-11
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
    }
    return true; // iOS asks in system popup
}

export default { requestBlePermissions }