import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';

class BLEPermissionsManager {

    // Check if BLE permissions are granted
    static async checkBLEPermissions() {
        if (Platform.OS === 'android') {
            return await this.checkAndroidBLEPermissions();
        } else {
            return await this.checkiOSBLEPermissions();
        }
    }

    // Request BLE permissions
    static async requestBLEPermissions() {
         if (Platform.OS === 'android') {
            return await this.requestAndroidBLEPermissions();
        } else {
            return await this.requestiOSBLEPermissions();
        }
    }

    // Android BLE Permissions
    static async checkAndroidBLEPermissions() {
        const androidVersion = typeof Platform.Version === 'string'
            ? parseInt(Platform.Version, 10)
            : Platform.Version;

        try {
            if (androidVersion >= 31) {
                // Android 12+ (API 31+)
                const bluetoothScan = await check(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
                const bluetoothConnect = await check(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
                const fineLocation = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

                return (
                    bluetoothScan === RESULTS.GRANTED &&
                    bluetoothConnect === RESULTS.GRANTED &&
                    fineLocation === RESULTS.GRANTED
                );
            } else if (androidVersion >= 23) {
                // Android 6+ (API 23+)
                const fineLocation = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
                const coarseLocation = await check(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);

                return fineLocation === RESULTS.GRANTED && coarseLocation === RESULTS.GRANTED;
            } else {
                // Lower Android versions
                return true;
            }
        } catch (error) {
            console.error('Error checking Android BLE permissions:', error);
            return false;
        }
    }

    static async requestAndroidBLEPermissions() {
        const androidVersion = typeof Platform.Version === 'string'
            ? parseInt(Platform.Version, 10)
            : Platform.Version;

        try {
            if (androidVersion >= 31) {
                // Android 12+ (API 31+) - Request new Bluetooth permissions
                const permissions = [
                    PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
                    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
                    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                ];

                const granted = await PermissionsAndroid.requestMultiple(permissions);
            return (
                granted["android.permission.BLUETOOTH_SCAN"] === PermissionsAndroid.RESULTS.GRANTED &&
                granted["android.permission.BLUETOOTH_CONNECT"] === PermissionsAndroid.RESULTS.GRANTED &&
                granted["android.permission.ACCESS_FINE_LOCATION"] === PermissionsAndroid.RESULTS.GRANTED
            );

            } else if (androidVersion >= 23) {
                // Android 6+ (API 23+) - Request location permissions
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                ]);

                return (
                    granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
                    PermissionsAndroid.RESULTS.GRANTED
                );
            } else {
                // Lower Android versions - no runtime permissions needed
                return true;
            }
        } catch (error) {
            console.error('Error requesting Android BLE permissions:', error);
            return false;
        }
    }

    // iOS BLE Permissions
    static async checkiOSBLEPermissions() {
        try {
            // On iOS, BLE permissions are handled differently
            // The main permission is BLUETOOTH, but it's usually granted automatically
            const bluetoothPermission = await check(PERMISSIONS.IOS.BLUETOOTH);

            // For most BLE operations, no runtime permission is needed on iOS
            // The system will prompt automatically when BLE operations start
            return bluetoothPermission === RESULTS.GRANTED || bluetoothPermission === RESULTS.UNAVAILABLE;
        } catch (error) {
            console.error('Error checking iOS BLE permissions:', error);
            // If permission check fails, assume we can proceed (iOS handles this automatically)
            return true;
        }
    }

    static async requestiOSBLEPermissions() {
        try {
            // On iOS, BLE permissions are typically handled automatically by the system
            // when you start using BLE functionality. No explicit request needed.
            const result = await request(PERMISSIONS.IOS.BLUETOOTH);

            // Return true if granted or unavailable (meaning system handles it)
            return result === RESULTS.GRANTED || result === RESULTS.UNAVAILABLE;
        } catch (error) {
            console.error('Error requesting iOS BLE permissions:', error);
            // If request fails, assume we can proceed (iOS handles this automatically)
            return true;
        }
    }

    // Utility method to handle permission flow with user feedback
    static async ensureBLEPermissions() {
        const hasPermissions = await this.checkBLEPermissions();

        if (hasPermissions) {
            return true;
        }

        // Show explanation to user and request permissions
        return new Promise((resolve) => {
            Alert.alert(
                'Bluetooth Permission Required',
                'This app needs Bluetooth permissions to connect to devices.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => resolve(false),
                    },
                    {
                        text: 'Grant Permission',
                        onPress: async () => {
                            const granted = await this.requestBLEPermissions();
                            if (!granted) {
                                Alert.alert(
                                    'Permission Denied',
                                    'Bluetooth permissions are required for this feature to work.',
                                    [{ text: 'OK' }]
                                );
                            }
                            resolve(granted);
                        },
                    },
                ]
            );
        });
    }
}

export default BLEPermissionsManager;

// Usage example in a component:
/*
import BLEPermissionsManager from './BLEPermissionsManager';

const MyBLEComponent = () => {
  const initializeBLE = async () => {
    const hasPermissions = await BLEPermissionsManager.ensureBLEPermissions();
    
    if (hasPermissions) {
      // Start BLE operations
      console.log('BLE permissions granted, starting BLE operations...');
    } else {
      console.log('BLE permissions denied');
    }
  };

  return (
    <View>
      <Button title="Initialize BLE" onPress={initializeBLE} />
    </View>
  );
};
*/