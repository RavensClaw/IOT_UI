import { styles } from '@/assets/styles/styles';
import { StackScreenHeader } from '@/components/StackScreenHeader';
import React, { use, useEffect, useState } from 'react';
import {
  View,
  Text,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { BleManager } from "react-native-ble-plx";
import { Dropdown } from 'react-native-element-dropdown';
import { ActivityIndicator, Button, Chip, Divider, Icon, IconButton, MD2Colors, TextInput } from 'react-native-paper';
import { Buffer } from "buffer";
import { Constants } from '@/constants/constants';
import WidgetModel from '@/models/WidgetModel';
import ObjectID from 'bson-objectid';
import config from '../../constants/config.json'
import { useLocalSearchParams } from 'expo-router';
import ParamsModel from '@/models/ParamsModel';
import { mutationUpdateDashboard, queryGetDashBoardByDashBoardId } from '@/service/servicehook';
import { getCurrentUser } from 'aws-amplify/auth';
import OutputConditionsMappingList from '@/components/OutputConditionsMappingList';

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
  const [readActionTypes, setReadActionTypes] = useState<any[]>([]);
  const [writeActionTypes, setWriteActionTypes] = useState<any[]>([]);
  const [selectedCharacteristicsOption, setSelectedCharacteristicsOption] = useState<any>(null);
  const [connected, setConnected] = useState<any>(null);
  const [read, setRead] = useState<boolean>(false);
  const [write, setWrite] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const manager = new BleManager();



  const INIT_USERNAME = "";
  const [userId, setUserId] = useState(INIT_USERNAME);
  const [generalErrorVisible, setGeneralErrorVisible] = useState(false);
  const [generalErrorMessage, setGeneralErrorMessage] = useState('');
  const [apiErrorVisible, setApiErrorVisible] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [edit, setEdit] = useState(false);
  let initState: string = '';
  const [inputStateName, setInputStateName] = useState(initState);
  const [outputStateName, setOutputStateName] = useState(initState);
  const inputParams: Partial<ParamsModel> = useLocalSearchParams();

  //widgetId=68bd1f9699e5085b3dec3827&userId=31f3edda-3071-7042-8de5-fb93b2f7df84&dashboardId=68b55c305680d63089c0bb03
  const dashboardId = inputParams.dashboardId || '68b55c305680d63089c0bb03';
  const widgetId = inputParams.widgetId || '68bd1f9699e5085b3dec3827';
  const initWidget: WidgetModel = {
    widgetId: inputParams.widgetId ? inputParams.widgetId : new ObjectID().toHexString(),
    userId: userId,
    widgetType: inputParams.widgetType ? inputParams.widgetType : "OnOffSwitch",
    readOnly: false
  }

  const INIT: any = {};

  const [selectedDashboard, setSelectedDashboard] = useState(INIT);
  const [nonModifiableDashboard, setNonModifiableDashboard] = useState(INIT);
  const [dashboardError, setDashboardError] = useState(INIT);

  const INIT_QUERY_KEY: any = Constants.serviceKeys.INIT_QUERY_KEY;
  const [callQueryGetDashBoardByDashBoardId, setCallQueryGetDashBoardByDashBoardId] = useState(INIT_QUERY_KEY);
  const dashboard = queryGetDashBoardByDashBoardId(callQueryGetDashBoardByDashBoardId, dashboardId ? dashboardId : '');

  const [updateDashboardError, setUpdateDashboardError] = useState(INIT);
  const [updateDashboardDone, setUpdateDashboardDone] = useState(false);
  const { updateDashboard } = mutationUpdateDashboard(setUpdateDashboardError, setUpdateDashboardDone, userId);


  const [widget, setWidget] = useState(initWidget);
  const [bodyInput, setBodyInput] = useState(initState);
  const [responseOutput, setResponseOutput] = useState(initState);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const initStatesArray: any = []
  const [possibleInputStates, setPossibleInputStates] = useState(initStatesArray);
  const [possibleOutputStates, setPossibleOutputStates] = useState(initStatesArray);

  useEffect(() => {
    setLoadingPage(true);

    if (dashboardId && widgetId) {
      getCurrentUser().then((user) => {
        const userId: any = user.userId;
        setUserId(userId);
        setCallQueryGetDashBoardByDashBoardId(Constants.serviceKeys.queryGetDashBoardByDashBoardId + dashboardId);
      });
    }
  }, [])

  useEffect(() => {
    if (dashboard.dashboard !== undefined) {
      let widgetFound = false;
      let toModifyDashboard: any = dashboard.dashboard;
      if (toModifyDashboard && toModifyDashboard.widgets) {
        const jsonWidgets = JSON.parse(toModifyDashboard.widgets);
        toModifyDashboard = {
          ...dashboard.dashboard,
          widgets: jsonWidgets
        }

        let keys = Object.keys(jsonWidgets);
        for (let i = 0; i < keys.length; i++) {
          if (keys[i] === widgetId) {
            let modifyWidget = jsonWidgets[keys[i]];
            modifyWidget.connectionType = "BLUETOOTH";
            setWidget(modifyWidget);
            if (modifyWidget.bluetoothDevice) {
              setSelectedDevice(modifyWidget.bluetoothDevice)
            }

            widgetFound = true;
            break;
          }
        }
      }

      if (widgetFound) {
        setPossibleInputStates(config[widget.widgetType].possible_states);
        let outputStates: any = [];
        config[widget.widgetType]?.possible_states?.map((state) => {
          if (state?.value && state.value?.trim() !== 'CHECK_STATUS') {
            outputStates.push(state);
          }
        });
        setPossibleOutputStates(outputStates);
      } else {
        setGeneralErrorMessage('Widget not found');
        setGeneralErrorVisible(true);
      }
      setLoadingPage(false);
      setSelectedDashboard(toModifyDashboard);
      setCallQueryGetDashBoardByDashBoardId(INIT_QUERY_KEY);
    }
  }, [dashboard]);

  useEffect(() => {
    if (generalErrorVisible) {
      setLoadingPage(false);
    }
  }, [generalErrorVisible]);

  /*
let paramsConstruction = '';
          listQueryParamModelItems.map((paramItem: ListModel) => {
              if (paramItem.name?.trim() !== '' && paramItem.value?.trim() !== '') {
                  paramsConstruction = paramsConstruction + paramItem.name + "=" + paramItem.value + "&"
              }
          });
  */

  useEffect(() => {
    if (inputStateName && inputStateName?.trim() != '') {
      const widgetToModify: WidgetModel = { ...widget };
      if (widgetToModify.inputStates) {
        const inputStates = Object.keys(widgetToModify.inputStates);
        let noInputState = true;
        for (let i = 0; i < inputStates.length; i++) {
          if (widgetToModify.inputStates[inputStates[i]].stateName === inputStateName) {
            noInputState = false;
            break;
          }
        }
        if (noInputState) {
          widgetToModify.inputStates[inputStateName] = {
            stateName: inputStateName,
            apiUrl: '',
            method: '',
            params: [
              {
                enabled: true,
                id: new ObjectID().toHexString()
              }
            ],
            headers: [
              {
                enabled: true,
                id: new ObjectID().toHexString()
              }
            ]
          }
        } else {
          if (!widgetToModify?.inputStates[inputStateName]?.params) {
            widgetToModify.inputStates[inputStateName] = {
              ...widgetToModify.inputStates[inputStateName],
              params: [
                {
                  enabled: true,
                  id: new ObjectID().toHexString()
                }
              ]
            }
          }

          if (!widgetToModify?.inputStates[inputStateName]?.headers) {
            widgetToModify.inputStates[inputStateName] = {
              ...widgetToModify.inputStates[inputStateName],
              headers: [
                {
                  enabled: true,
                  id: new ObjectID().toHexString()
                }
              ]
            }
          }
        }
        setWidget(widgetToModify);
      }
    }
  }, [inputStateName])


  useEffect(() => {
    const widgetToModify: WidgetModel = { ...widget };
    if (inputStateName &&
      outputStateName && 
      widgetToModify.inputStates &&
      widgetToModify.inputStates[inputStateName] &&
      widgetToModify.inputStates[inputStateName].service &&
      selectedService &&
      selectedCharacteristic &&
      selectedCharacteristicsOption &&
      widgetToModify.inputStates[inputStateName].service[selectedService.value] &&
      widgetToModify.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value] &&
      widgetToModify.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value]) {

      const inputStates = Object.keys(widgetToModify.inputStates);
      for (let i = 0; i < inputStates.length; i++) {
        if (widgetToModify.inputStates[inputStates[i]].stateName === inputStateName) {
          widgetToModify.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].bluetoothResponse = responseOutput;
          break;
        }
      }
      setWidget(widgetToModify);
    }
  }, [responseOutput]);

  useEffect(() => {
    if (!updateDashboardDone
    ) {
      setCallQueryGetDashBoardByDashBoardId(Constants.serviceKeys.queryGetDashBoardByDashBoardId + dashboardId);
      setLoadingPage(false);
      setUpdateDashboardDone(false);
    }
  }, [updateDashboardDone]);



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

      let modifiedWidget = { ...widget };

      if (modifiedWidget.inputStates && modifiedWidget.inputStates[inputStateName]) {
      } else if (modifiedWidget.inputStates && modifiedWidget.inputStates[inputStateName]) {
      } else if (modifiedWidget.inputStates && modifiedWidget.inputStates[inputStateName]) {
      }


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
      console.log("IN HERE >>>>>>>>>>>>>>>>>>>>>>>")
      const characteristicsOptions = deviceMap[selectedDevice.device.id][selectedService.value][selectedCharacteristic.value]
      let enabledActionTypes: any[] = [];
      Object.keys(characteristicsOptions).map((key: any) => {
        if (characteristicsOptions[key] === true) {
          enabledActionTypes.push({ label: key, value: key });
        }
        //console.log(key + " : " + deviceMap[selectedDevice.device.id][selectedService.value][selectedCharacteristic.value][key]);
      });


      setReadActionTypes(enabledActionTypes.filter((type: any) => type.label.startsWith('isReadable')));
      setWriteActionTypes(enabledActionTypes.filter((type: any) => type.label.startsWith('isWritable')));
    }
  }, [selectedCharacteristic]);

  useEffect(() => {

    if (read && deviceMap &&
      selectedDevice &&
      selectedDevice.device &&
      selectedDevice.device.id &&
      selectedCharacteristic &&
      selectedCharacteristic.value) {

      const characteristicsOptions = deviceMap[selectedDevice.device.id][selectedService.value][selectedCharacteristic.value]
      if (characteristicsOptions && characteristicsOptions.isReadable) {
        try {
          connected.readCharacteristicForService(
            characteristicsOptions.serviceUUID,
            characteristicsOptions.uuid
          ).then((readValue: any) => {
            if (readValue?.value) {
              console.log("*********************************************")
              console.log(readValue?.value)
              console.log("*********************************************")

              const decoded = Buffer.from(readValue.value, "base64").toString("utf-8");
              try {
                const json = JSON.parse(decoded);
                setResponseOutput(JSON.stringify(json, null, 4));
              } catch (err) {
                setResponseOutput(JSON.stringify({ "response": decoded }, null, 4));
              }
              log(`📖 Read from ${characteristicsOptions.uuid}: ${decoded}`);
            }
          }).finally(() => {
            setRead(false);
          });
        } catch (e: any) {
          log(`❌ Read error from ${characteristicsOptions.uuid}: ${e.message}`);
        }
      }
    }
  }, [read]);


  useEffect(() => {

    console.log("-----------------------------------------------");
    console.log(widget &&
      widget.inputStates &&
      widget.inputStates[inputStateName].service &&
      write && deviceMap &&
      selectedService &&
      selectedService.value &&
      selectedCharacteristicsOption &&
      selectedCharacteristicsOption.value &&
      selectedDevice &&
      selectedDevice.device &&
      selectedDevice.device.id &&
      selectedCharacteristic &&
      selectedCharacteristic.value)
    console.log("-----------------------------------------------");

    if (
      widget &&
      widget.inputStates &&
      widget.inputStates[inputStateName].service &&
      write && deviceMap &&
      selectedService &&
      selectedService.value &&
      selectedCharacteristicsOption &&
      selectedCharacteristicsOption.value &&
      selectedDevice &&
      selectedDevice.device &&
      selectedDevice.device.id &&
      selectedCharacteristic &&
      selectedCharacteristic.value) {
      const characteristicsOptions = deviceMap[selectedDevice.device.id][selectedService.value][selectedCharacteristic.value]
      if (characteristicsOptions &&
        (characteristicsOptions.isWritableWithResponse ||
          characteristicsOptions.isWritableWithoutResponse)) {
        const input = widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].input;
        if (input) {
          if (characteristicsOptions.isWritableWithResponse) {
            connected.writeCharacteristicWithResponseForService(
              characteristicsOptions.serviceUUID,
              characteristicsOptions.uuid,
              btoa(input)
            ).then((response: any) => {
              if (response?.value) {
                console.log("*********************************************")
                console.log(response?.value)
                console.log("*********************************************")
                try {
                  const json = JSON.parse(response?.value);
                  setResponseOutput(JSON.stringify(json, null, 4));
                } catch (err) {
                  setResponseOutput(JSON.stringify({ "response": response?.value }, null, 4));
                }
                log(`📖 Write with response from ${characteristicsOptions.uuid}: ${response?.value}`);
              }
            }).catch((error: any) => {
              console.log(error)
            }).finally(() => {
              setWrite(false);
            })


          } else if (characteristicsOptions.isWritableWithResponse) {
            connected.writeCharacteristicWithoutResponseForService(
              characteristicsOptions.serviceUUID,
              characteristicsOptions.uuid,
              btoa(input)
            ).then((response: any) => {
              //response.value
            }).catch((error: any) => {
              console.log(error)
            }).finally(() => {
              setWrite(false);
            })
          }
        } else {
          setWrite(false);
        }
      } else {
        setWrite(false);
      }
    } else {
      setWrite(false);
    }
  }, [write]);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MD2Colors.grey200 }}>
      <StackScreenHeader title={"Configure Bluetooth"}></StackScreenHeader>

      <ScrollView>
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
              value={selectedDevice && selectedDevice.device && selectedDevice.device.id ? selectedDevice.device.id : ''}
              onChange={item => {
                console.log("<><><><><><><><><><><><><><><><><><><><><><><><><><><><>");
                console.log(item);
                console.log(devices)
                setSelectedDevice(devices[item.value]);
                console.log(devices[item.value])
                console.log("<><><><><><><><><><><><><><><><><><><><><><><><><><><><>");
              }}
            />}

          {devicesDropdown && Object.keys(devicesDropdown).length > 0 && selectedDevice && <Button
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
      
      {devicesDropdown && Object.keys(devicesDropdown).length > 0 && selectedDevice && <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "center" }}>
        <Chip textStyle={{ fontSize: 12, fontWeight: "900", color: MD2Colors.white }}
          style={{ marginLeft: 5, marginTop: 5, backgroundColor: MD2Colors.pinkA200 }} disabled={true}>INPUT STATE</Chip>
        {<Dropdown
          //disable={!edit}
          style={[styles.dropdown, { width: 200 }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          iconStyle={styles.iconStyle}
          itemTextStyle={styles.selectedTextStyle}
          data={possibleInputStates}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select"
          value={inputStateName}
          onChange={item => {
            if (item.value && item.value.trim() !== 'CHECK_STATUS') {
              setOutputStateName(item.value);
            }
            setInputStateName(item.value);
          }}
        />}
      </View>}
      
        <View style={{ marginBottom: 100 }}>
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

          {inputStateName !== 'CHECK_STATUS' && writeActionTypes && writeActionTypes.length > 0 && <View style={{ backgroundColor: MD2Colors.white, margin: 10, padding: 10, borderRadius: 10, borderColor: MD2Colors.grey400, borderWidth: 1 }}>
            <Text style={{ marginLeft: 20, fontSize: 12, fontWeight: 500 }}>Write Action Type</Text>
            <Dropdown
              //disable={!edit}
              style={[styles.dropdown, { width: "90%" }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              itemTextStyle={styles.selectedTextStyle}
              data={writeActionTypes}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select"
              value={selectedCharacteristicsOption ? selectedCharacteristicsOption.value : ''}
              onChange={item => {
                setSelectedCharacteristicsOption(item);
              }}
            />
          </View>}
          {!edit && <IconButton mode="outlined" style={{ margin: "auto", marginTop: 10, marginRight:20, marginBottom: 10 }} iconColor={MD2Colors.yellow700} size={15}
            icon={"circle-edit-outline"}
            onPress={() => {
              setEdit(true);
            }}></IconButton>}
          {selectedDevice && inputStateName !== 'CHECK_STATUS' &&
            widget.inputStates &&
            widget.inputStates[inputStateName] &&
            selectedService &&
            selectedService.value &&
            selectedCharacteristic &&
            selectedCharacteristic.value &&
            selectedCharacteristicsOption &&
            selectedCharacteristicsOption.value
            && <View style={{ backgroundColor: MD2Colors.white, margin: 10, padding: 10, borderRadius: 10, borderColor: MD2Colors.grey400, borderWidth: 1 }}>
              <TextInput
                //disabled={!edit}
                label="Input"
                readOnly={!edit}
                value={
                  widget.inputStates[inputStateName].service && widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].input ?
                    widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].input : ''
                }
                style={{
                  color: MD2Colors.black,
                  fontSize: 12, minWidth: 300, height: 50, marginLeft: 10, marginRight: 10
                }}
                mode="outlined"
                onChangeText={inputText => {
                  const widgetToModify: WidgetModel = { ...widget };
                  if (widgetToModify.inputStates && inputStateName) {
                    const inputStates = Object.keys(widgetToModify.inputStates);
                    for (let i = 0; i < inputStates.length; i++) {
                      if (widgetToModify.inputStates[inputStates[i]].stateName === inputStateName) {
                        if (widgetToModify.inputStates[inputStateName].service && widgetToModify.inputStates[inputStateName].service[selectedService.value]) {
                          if (widgetToModify.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value]) {
                            if (widgetToModify.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value]) {
                              widgetToModify.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].input = inputText;
                            } else {
                              widgetToModify.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value] = {
                                [selectedCharacteristicsOption.value]: {
                                  outputState: {},
                                  input: inputText
                                }
                              }

                            }
                          } else {
                            widgetToModify.inputStates[inputStateName].service[selectedService.value] = {
                              [selectedCharacteristic.value]: {
                                [selectedCharacteristicsOption.value]: {
                                  outputState: {},
                                  input: inputText
                                }
                              }
                            }
                          }
                        } else {
                          widgetToModify.inputStates[inputStateName].service = {
                            [selectedService.value]: {
                              [selectedCharacteristic.value]: {
                                [selectedCharacteristicsOption.value]: {
                                  outputState: {},
                                  input: inputText
                                }
                              }
                            }
                          }
                        }
                        break;
                      }
                    }
                    setWidget(widgetToModify);
                  }
                }}
              />
              <Button
                disabled={!edit}
                onPress={() => setWrite(true)} mode='outlined' style={{
                  borderRadius: 5,
                  marginTop: 10,
                  backgroundColor: MD2Colors.green400,
                  borderWidth: 0,
                  alignSelf: 'center',
                }}
                textColor={MD2Colors.white}
              >WRITE</Button>
            </View>
          }
          {inputStateName === 'CHECK_STATUS' && readActionTypes && readActionTypes.length > 0 && <View style={{ backgroundColor: MD2Colors.white, margin: 10, padding: 10, borderRadius: 10, borderColor: MD2Colors.grey400, borderWidth: 1 }}>
            <Text style={{ marginLeft: 20, fontSize: 12, fontWeight: 500 }}>Read Action Type</Text>
            <Dropdown
              //disable={!edit}
              style={[styles.dropdown, { width: "90%" }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              itemTextStyle={styles.selectedTextStyle}
              data={readActionTypes}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select"
              value={selectedCharacteristicsOption ? selectedCharacteristicsOption.value : ''}
              onChange={item => {
                setSelectedCharacteristicsOption(item);
              }}
            />
          </View>}
          {inputStateName === 'CHECK_STATUS' && selectedDevice && <View style={{ flexDirection: 'row', alignSelf: "center" }}>
            <Dropdown
              //disable={!edit}
              //style={[styles.dropdown, { width: 200, backgroundColor: !edit ? MD2Colors.grey200 : MD2Colors.white }]}
              style={[styles.dropdown, { width: 200, backgroundColor: MD2Colors.white }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              itemTextStyle={styles.selectedTextStyle}
              data={possibleOutputStates}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select For State"
              value={outputStateName}
              onChange={item => {
                setOutputStateName(item.value);
              }}
            />

            {selectedDevice && <Button
              onPress={() => setRead(true)} mode='outlined' style={{
                borderRadius: 5,
                backgroundColor: MD2Colors.green400,
                borderWidth: 0,
                alignSelf: 'center',
              }}
              textColor={MD2Colors.white}
            >READ</Button>}

          </View>}

          <Divider></Divider>

          {inputStateName &&
      outputStateName && 
      widget.inputStates &&
      widget.inputStates[inputStateName] &&
      widget.inputStates[inputStateName].service &&
      selectedService &&
      selectedCharacteristic &&
      selectedCharacteristicsOption &&
      widget.inputStates[inputStateName].service[selectedService.value] &&
      widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value] &&
      widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value] &&
      widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value]?.bluetoothResponse && <View style={{ backgroundColor: MD2Colors.white, margin: 10, padding: 10, borderRadius: 10, borderColor: MD2Colors.grey400, borderWidth: 1 }}>
            <Text>{widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value]?.bluetoothResponse}</Text>
          </View>}
          

          {inputStateName !== '' && !loadingRequest && 
                widget && 
                widget.inputStates && 
                widget.inputStates[inputStateName] &&
                widget.inputStates[inputStateName].service &&
                selectedService &&
                selectedCharacteristic &&
                selectedCharacteristicsOption &&
                outputStateName &&
                widget.inputStates[inputStateName].service[selectedService.value] &&
                widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value] &&
                widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value] &&
                widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value]?.bluetoothResponse && <View style={{ width: "100%", alignSelf: "center", margin: "auto", flexDirection: "row" }}>
              <Text style={{ fontSize: 12, fontWeight: 700, marginRight: "auto", marginTop: 15, margin: 5 }}>Output Condition</Text>
              { <IconButton style={{ marginLeft: "auto" }} iconColor={MD2Colors.grey800} size={20}
                  icon={"plus"}
                  disabled={!edit}
                  onPress={() => {
                    let modifiedWidget = { ...widget };
                    if (modifiedWidget.inputStates &&
                      modifiedWidget.inputStates[inputStateName] &&
                      modifiedWidget.inputStates[inputStateName].service
                    ) {

                      if (modifiedWidget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].outputState) {
                        modifiedWidget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].outputState = {
                          ...modifiedWidget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].outputState,
                          [outputStateName]: {
                            conditions: [{
                              id: new ObjectID().toHexString(),
                              key: "",
                              condition: "",
                              value1: "",
                              value2: "",
                            }]
                          }
                        }
                      } else {
                        modifiedWidget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value] = {
                          outputState: {
                            [outputStateName]: {
                              conditions: [{
                                id: new ObjectID().toHexString(),
                                key: "",
                                condition: "",
                                value1: "",
                                value2: "",
                              }]
                            }
                          }
                        }
                      }
                      console.log(JSON.stringify(modifiedWidget))
                      setWidget(modifiedWidget);
                    }
                  }
                  }></IconButton>}
            </View>}
          {inputStateName?.trim() !== '' &&
            !loadingRequest &&
            widget.inputStates &&
            widget.inputStates[inputStateName] &&
            widget.inputStates[inputStateName]?.service &&
            selectedService &&
            selectedCharacteristic &&
            selectedCharacteristicsOption &&
            outputStateName &&
            widget.inputStates[inputStateName]?.service[selectedService.value] &&
            widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value] &&
            widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value] &&
            widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].outputState[outputStateName] &&
            widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value]?.bluetoothResponse &&
            widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].outputState[outputStateName].conditions &&
            widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].outputState[outputStateName].conditions?.length > 0 &&<ScrollView style={{ maxHeight: 300 }}>
              <View style={{ width: "100%", alignSelf: "center" }}>
                <OutputConditionsMappingList
                  edit={edit}
                  inputStateName={inputStateName}
                  outputStateName={outputStateName}
                  selectedServiceType={selectedService.value}
                  selectedCharacteristicType={selectedCharacteristic.value}
                  selectedCharacteristicsOptionType={selectedCharacteristicsOption.value}
                  widget={widget}
                  setWidget={setWidget} />
              </View>

            </ScrollView>}
          {(inputStateName?.trim() !== '' &&
            !loadingRequest &&
            widget.inputStates &&
            selectedService &&
            selectedCharacteristic &&
            selectedCharacteristicsOption &&
            outputStateName &&
            widget.inputStates[inputStateName] &&
            widget.inputStates[inputStateName].service &&
            widget.inputStates[inputStateName].service[selectedService] &&
            widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value] &&
            (
              !widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].outputState[outputStateName] ||
              !widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].outputState[outputStateName].conditions ||
              widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].outputState[outputStateName].conditions?.length === 0))
            && <View style={{ alignSelf: "center", alignContent: "center" }}>
              <Text style={{ fontSize: 12, margin: 10 }}>No Conditions</Text>
            </View>}

          {edit && !loadingRequest && <View style={{ flexDirection: "row", alignSelf: "center", margin: "auto", marginBottom: 20, marginTop: 20 }}>
            <Divider></Divider>
            <Chip icon={() => <Icon source="cancel" size={20} color={MD2Colors.red400} />} mode="outlined"
              style={{
                marginLeft: 5,
              }}
              onPress={() => {
                setApiErrorVisible(false);
                setApiErrorMessage('');
                setEdit(false)
              }}>
              Cancel
            </Chip>
            <Chip icon={() => <Icon source="content-save" size={20} color={MD2Colors.grey800} />} mode="flat"
              disabled={!edit}
              style={{
                marginLeft: 5,
                backgroundColor: MD2Colors.amber500
              }}
              onPress={async () => {
                setLoadingPage(true);

                let modifiedWidget = { ...widget };
                if (selectedDevice) {
                  modifiedWidget.bluetoothDevice = selectedDevice;
                }
                if (selectedDashboard.widgets) {
                  updateDashboard.mutate(
                    {
                      ...selectedDashboard,
                      widgets: {
                        ...selectedDashboard.widgets,
                        [modifiedWidget.widgetId]: modifiedWidget
                      }

                    });
                }
                setLoadingPage(false);
                setEdit(false);
              }}>
              Save
            </Chip>
          </View>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BluetoothScreen;
