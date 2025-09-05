import { styles } from '@/assets/styles/styles';
import { StackScreenHeader } from '@/components/StackScreenHeader';
import React, { use, useEffect, useState } from 'react';
import {
  View,
  Text,
  PermissionsAndroid,
  Platform,
  SafeAreaView
} from 'react-native';
import { BleManager } from "react-native-ble-plx";
import { Dropdown } from 'react-native-element-dropdown';
import { ActivityIndicator, Button, Icon, IconButton, MD2Colors } from 'react-native-paper';
import { Buffer } from "buffer";


async function requestBlePermissions() {
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

const BluetoothScreen: React.FC = () => {
  const [deviceMap, setDeviceMap] = useState<any>({});
  const [devices, setDevices] = useState<any[]>([]);
  const [devicesDropdown, setDevicesDropdown] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isConnectingDone, setIsConnectingDone] = useState<boolean>(false);
  const [servicesDropdown, setServicesDropdown] = useState<any[]>([]);
  const [characteristicDropdown, setCharacteristicDropdown] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<any>(null);
  const [actionTypes, setActionTypes] = useState<any[]>([]);
  const [selectedActionType, setSelectedActionType] = useState<any>(null);
  const [connected, setConnected] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const manager = new BleManager();

  useEffect(() => {
    // Request BLE permissions when screen mounts
    requestBlePermissions();

    return () => {
      manager.destroy();
    };
  }, []);

  const log = (msg: any) => {
    console.log(msg);
    setLogs((prev) => [...prev, msg]);
  };

  const startScan = async () => {
    const hasPermission = await requestBlePermissions();
    if (!hasPermission) {
      log("❌ Permission denied. Please enable Bluetooth & Location.");
      return;
    }

    setDevices([]);
    setLoading(true);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        log("❌ Scan error: " + error.message);
        setLoading(false);
        return;
      }
      if (device && device.name) {
        console.log(JSON.stringify(device));
        setDevicesDropdown((existing: any) => {
          const exists = existing.find((d: any) => d.value === device.id);
          if (exists) return existing;
          return [
            ...existing,
            { label: device.name, value: device.id }
          ];
        });

        setDevices((existing: any) => {
          return {
            ...existing,
            [device.id]: {
              id: device.id,
              name: device.name,
              device: device
            }
          };
        });
      }
    });
  };

  const connectToDevice = async (device: any) => {
    try {
      let deviceMapTemp: any = {}
      setLoading(false);
      manager.stopDeviceScan();
      log(`🔗 Connecting to ${device.name}...`);
      const connected = await manager.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      setConnected(connected);
      log(`✅ Connected to ${connected.name}`);
      deviceMapTemp[connected.id] = {}
      const services = await connected.services();
      for (const service of services) {
        deviceMapTemp[connected.id][service.uuid] = {}
        log(service);
        log(`🔹 Service: ${service.uuid}`);
        const characteristics = await service.characteristics();
        for (const char of characteristics) {
          log(char);
          deviceMapTemp[connected.id][service.uuid][char.uuid] = char


          log(
            `   ↳ Char: ${char.uuid} [read:${char.isReadable} write:${char.isWritableWithResponse} notify:${char.isNotifiable}]`
          );

          /* if (char.isNotifiable) {
             connected.monitorCharacteristicForService(
               service.uuid,
               char.uuid,
               (err: any, c: any) => {
                 if (err) {
                   log("❌ Notify error: " + err.message);
                   return;
                 }
                 if (c?.value) {
                   const raw = Buffer.from(c.value, "base64").toString("hex");
                   log(`🔔 Notify from ${char.uuid}: ${raw}`);
                 }
               }
             );
           }*/
        }
      }
      setDeviceMap({
        ...deviceMap,
        ...deviceMapTemp
      });
    } catch (e: any) {
      log("❌ Connection error: " + e.message);
    }
  };

  useEffect(() => {
    if (!isConnectingDone && deviceMap && Object.keys(deviceMap).length > 0) {
      console.log("Device Map Updated:", deviceMap);
      setIsConnectingDone(true);
    }
  }, [deviceMap]);

  useEffect(() => {

    if (isConnectingDone &&
      deviceMap &&
      selectedDevice &&
      selectedDevice.device &&
      deviceMap[selectedDevice.device.id] &&
      Object.keys(deviceMap[selectedDevice.device.id]).length > 0) {
      let servicesDropdownTemp: any[] = [];

      console.log("Device Map:", deviceMap);
      Object.keys(deviceMap[selectedDevice.device.id]).forEach((key: any) => {
        console.log("Service Key:", key);
        servicesDropdownTemp.push({ label: key ? key : "Service", value: key });

      });
      console.log("..............................................");
      console.log(servicesDropdownTemp)
      console.log("..............................................");
      setServicesDropdown(servicesDropdownTemp);

    }
    setIsConnectingDone(false);
  }, [isConnectingDone]);

  useEffect(() => {
    if (deviceMap && selectedDevice && selectedDevice.device && selectedDevice.device.id && selectedService) {
      let characteristicsDropdownTemp: any[] = [];
      Object.keys(deviceMap[selectedDevice.device.id][selectedService.value]).forEach((key: any) => {
        characteristicsDropdownTemp.push({ label: key, value: key });
      });
      setCharacteristicDropdown(characteristicsDropdownTemp);
    }
  }, [selectedService]);


  useEffect(() => {
    if (deviceMap && 
      selectedDevice && 
      selectedDevice.device && 
      selectedDevice.device.id && 
      selectedCharacteristic && 
      selectedCharacteristic.value) {
      
      const actionType = deviceMap[selectedDevice.device.id][selectedService.value][selectedCharacteristic.value]
      let enabledActionTypes: any[] = [];
      Object.keys(actionType).map((key: any) => {
        if(actionType[key] === true){
          enabledActionTypes.push({label: key, value: key});
        }
        //console.log(key + " : " + deviceMap[selectedDevice.device.id][selectedService.value][selectedCharacteristic.value][key]);
      });
      setActionTypes(enabledActionTypes);
      if (actionType.isReadable) {
    try {
      connected.readCharacteristicForService(
        actionType.serviceUUID,
        actionType.uuid
      ).then((readValue:any) => {
        if (readValue?.value) {
        console.log("*********************************************")
        console.log(readValue?.value)
        console.log("*********************************************")
        
          const decoded = Buffer.from(readValue.value, "base64").toString("utf-8");
          log(`📖 Read from ${actionType.uuid}: ${decoded}`);
        }
      });
    } catch (e: any) {
      log(`❌ Read error from ${actionType.uuid}: ${e.message}`);
    }
  }

      
    
    }
  }, [selectedCharacteristic]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MD2Colors.grey200 }}>
      <StackScreenHeader title={"Configure Bluetooth"}></StackScreenHeader>
      <View style={{ marginTop: 20, margin: 10, padding: 10, borderRadius: 10, borderColor: MD2Colors.grey400, backgroundColor: MD2Colors.white, borderWidth: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
          {loading && (
            <ActivityIndicator animating={true} color={MD2Colors.grey800} style={{ paddingRight: 10, }} size="small" />
          )}
          <Button icon={() => <Icon color={MD2Colors.white} source="magnify-scan" size={20} />} onPress={startScan} mode='outlined' style={{
            borderRadius: 5,
            backgroundColor: MD2Colors.grey800,
            borderWidth: 0,
            alignSelf: 'center',
          }}
            textColor={MD2Colors.white}
          >Scan for Devices
          </Button>
          {loading && <IconButton mode='outlined' style={{ borderRadius: 5 }} icon={() => <Icon color={MD2Colors.red500} source="stop" size={28} />} onPress={() => {
            manager.stopDeviceScan().finally(() => {
              setLoading(false);
            });
          }}></IconButton>}
        </View>
        
        {devicesDropdown && Object.keys(devicesDropdown).length > 0 && 
        <Dropdown
          //disable={!edit}
          style={[styles.dropdown, { width: "80%" }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          iconStyle={styles.iconStyle}
          itemTextStyle={styles.selectedTextStyle}
          data={devicesDropdown}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select Device"
          value={selectedDevice ? selectedDevice.value : ''}
          onChange={item => {
            console.log(item);
            setSelectedDevice(devices[item.value]);
          }}
        />}

        {selectedDevice && <Button
          icon={() => <Icon color={MD2Colors.white} source="bluetooth-connect" size={20} />}
          onPress={() => connectToDevice(selectedDevice)} mode='outlined' style={{
            borderRadius: 5,
            backgroundColor: MD2Colors.blue500,
            borderWidth: 0,
            alignSelf: 'center',
          }}
          textColor={MD2Colors.white}
        >Connect</Button>}
      </View>
      <View>
        {servicesDropdown && Object.keys(servicesDropdown).length > 0 && <View style={{ backgroundColor: MD2Colors.white, margin: 10, padding: 10, borderRadius: 10, borderColor: MD2Colors.grey400, borderWidth: 1 }}>
          <Text style={{ marginLeft: 20, fontSize: 12, fontWeight: 500 }}>Service</Text>
          <Dropdown
            //disable={!edit}
            style={[styles.dropdown, { width: "90%" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            itemTextStyle={styles.selectedTextStyle}
            data={servicesDropdown}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select"
            value={selectedService ? selectedService.value : ''}
            onChange={item => {
              setSelectedService(item);
            }}
          />
        </View>}

        {characteristicDropdown && Object.keys(characteristicDropdown).length > 0 && <View style={{ backgroundColor: MD2Colors.white, margin: 10, padding: 10, borderRadius: 10, borderColor: MD2Colors.grey400, borderWidth: 1 }}>
          <Text style={{ marginLeft: 20, fontSize: 12, fontWeight: 500 }}>Characteristics</Text>
          <Dropdown
            //disable={!edit}
            style={[styles.dropdown, { width: "90%" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            itemTextStyle={styles.selectedTextStyle}
            data={characteristicDropdown}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select"
            value={selectedCharacteristic ? selectedCharacteristic.value : ''}
            onChange={item => {
              setSelectedCharacteristic(item);
            }}
          />
        </View>}
        {actionTypes && actionTypes.length > 0 && <View style={{ backgroundColor: MD2Colors.white, margin: 10, padding: 10, borderRadius: 10, borderColor: MD2Colors.grey400, borderWidth: 1 }}>
          <Text style={{ marginLeft: 20, fontSize: 12, fontWeight: 500 }}>Action Type</Text>
          <Dropdown
            //disable={!edit}
            style={[styles.dropdown, { width: "90%" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            itemTextStyle={styles.selectedTextStyle}
            data={actionTypes}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select"
            value={selectedActionType ? selectedActionType.value : ''}
            onChange={item => {
              setSelectedActionType(item);
            }}
          />
        </View>}
      </View>
    </SafeAreaView>
  );
};


export default BluetoothScreen;
