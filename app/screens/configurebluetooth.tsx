import { styles } from '@/assets/styles/styles';
import { StackScreenHeader } from '@/components/StackScreenHeader';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Device } from "react-native-ble-plx";
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
import ManageBluetooth from 'react-native-ble-manager';
import BLEPermissionsManager from '../util/blepermissionsmanager';
import bleManager from '../util/blemanagerutil';

const ConfigureBluetooth: React.FC = () => {
  const [deviceMap, setDeviceMap] = useState<any>({});
  const [devices, setDevices] = useState<any[]>([]);
  const [devicesDropdown, setDevicesDropdown] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isConnectingDone, setIsConnectingDone] = useState<boolean>(false);
  const [connectButtonClicked, setConnectButtonClicked] = useState<boolean>(false);
  const [servicesDropdown, setServicesDropdown] = useState<any[]>([]);
  const [characteristicDropdown, setCharacteristicDropdown] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<any>(null);
  const [readActionTypes, setReadActionTypes] = useState<any[]>([]);
  const [writeActionTypes, setWriteActionTypes] = useState<any[]>([]);
  const [selectedCharacteristicsOption, setSelectedCharacteristicsOption] = useState<any>(null);

  const [read, setRead] = useState<boolean>(false);
  const [readLoading, setReadLoading] = useState<boolean>(false);
  const [write, setWrite] = useState<boolean>(false);
  const [writeLoading, setWriteLoading] = useState<boolean>(false);
  const [showDeviceScan, setShowDeviceScan] = useState<boolean>(true);
  const [logs, setLogs] = useState<string[]>([]);

  const INIT_USERNAME = "";
  const [userId, setUserId] = useState(INIT_USERNAME);
  const [hasError, setHasError] = useState(false);
  const [hasBluetoothError, setHasBluetoothError] = useState(false);
  const [generalErrorMessage, setGeneralErrorMessage] = useState<any>(null);
  const [bluetoothErrorMessage, setBluetoothErrorMessage] = useState<any>(null);;
  const [edit, setEdit] = useState(false);
  let initState: string = '';
  const [inputStateName, setInputStateName] = useState(initState);
  const [outputStateName, setOutputStateName] = useState(initState);
  const inputParams: Partial<ParamsModel> = useLocalSearchParams();

  //widgetId=68bd1f9699e5085b3dec3827&userId=31f3edda-3071-7042-8de5-fb93b2f7df84&dashboardId=68b55c305680d63089c0bb03
  const dashboardId = inputParams.dashboardId;
  const widgetId = inputParams.widgetId;
  const initWidget: WidgetModel = {
    widgetId: inputParams.widgetId ? inputParams.widgetId : new ObjectID().toHexString(),
    userId: userId,
    widgetType: inputParams.widgetType ? inputParams.widgetType : "OnOffSwitch",
    readOnly: false
  }

  const INIT: any = {};

  const [selectedDashboard, setSelectedDashboard] = useState(INIT);
  const INIT_QUERY_KEY: any = Constants.serviceKeys.INIT_QUERY_KEY;
  const [callQueryGetDashBoardByDashBoardId, setCallQueryGetDashBoardByDashBoardId] = useState(INIT_QUERY_KEY);
  const dashboard = queryGetDashBoardByDashBoardId(callQueryGetDashBoardByDashBoardId, dashboardId ? dashboardId : '');
  const [updateDashboardError, setUpdateDashboardError] = useState(INIT);
  const [updateDashboardDone, setUpdateDashboardDone] = useState(false);
  const { updateDashboard } = mutationUpdateDashboard(setUpdateDashboardError, setUpdateDashboardDone, userId);

  const [startScan, setStartScan] = useState(false);
  const [connectToDevice, setConnectToDevice] = useState(false);
  const [widget, setWidget] = useState(initWidget);
  const [responseOutput, setResponseOutput] = useState(initState);
  const initStatesArray: any = []
  const [possibleInputStates, setPossibleInputStates] = useState(initStatesArray);
  const [possibleOutputStates, setPossibleOutputStates] = useState(initStatesArray);
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (selectedDevice?.device?.id) {
        try {
          const connected = await bleManager.isDeviceConnected(selectedDevice.device.id);
          console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
          console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
          console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
          console.log("Is Device Connected: " + connected);
          setIsDeviceConnected(connected);
        } catch {
          setIsDeviceConnected(false);
        }
      } else {
        setIsDeviceConnected(false);
      }
    };
    checkConnection();
  }, [selectedDevice, connectToDevice]);

  useEffect(() => {

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
        let servicesDropdownTemp: any[] = [];

        for (let i = 0; i < keys.length; i++) {
          if (keys[i] === widgetId) {
            let modifyWidget = jsonWidgets[keys[i]];
            modifyWidget.connectionType = "BLUETOOTH";
            setWidget(modifyWidget);
            if (modifyWidget.bluetoothDevice && modifyWidget.bluetoothDevice.id) {
              let deviceTemp: any = {};
              deviceTemp[modifyWidget.bluetoothDevice.id] = {};
              if (modifyWidget.bluetoothDevice.services) {
                Object.keys(modifyWidget.bluetoothDevice.services).forEach((key: any) => {
                  servicesDropdownTemp.push({ label: key ? key : "Service", value: key });
                  deviceTemp[modifyWidget.bluetoothDevice.id][key] = {}
                  deviceTemp[modifyWidget.bluetoothDevice.id][key] = deviceTemp[modifyWidget.bluetoothDevice.id][key];
                  Object.keys(modifyWidget.bluetoothDevice.services[key]).forEach((charKey: any) => {
                    deviceTemp[modifyWidget.bluetoothDevice.id][key][charKey] = modifyWidget.bluetoothDevice.services[key][charKey]
                    Object.keys(modifyWidget.bluetoothDevice.services[key][charKey]).forEach((optionKey: any) => {
                      deviceTemp[modifyWidget.bluetoothDevice.id][key][charKey][optionKey] = modifyWidget.bluetoothDevice.services[key][charKey][optionKey]
                    });
                  });
                });
                setDeviceMap({ ...deviceTemp });
                setSelectedDevice(modifyWidget.bluetoothDevice);
                setDevices((existing: any) => {
                  return {
                    ...existing,
                    [modifyWidget.bluetoothDevice.id]: modifyWidget.bluetoothDevice
                  };
                });
                setDevicesDropdown([{ label: modifyWidget.bluetoothDevice.name, value: modifyWidget.bluetoothDevice.id }]);
                setShowDeviceScan(false);
                setServicesDropdown(servicesDropdownTemp);
              }
              widgetFound = true;
              break;
            }
          }

        }
        console.log(servicesDropdownTemp)

      }

      if (widgetFound) {
        console.log("widgetFound >>>>>> " + widgetFound)
        console.log(selectedDevice)
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
        setHasError(true);
      }
      setSelectedDashboard(toModifyDashboard);
      setCallQueryGetDashBoardByDashBoardId(INIT_QUERY_KEY);
    }
  }, [dashboard]);

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
      setUpdateDashboardDone(false);
    }
  }, [updateDashboardDone]);


  useEffect(() => {
    if (startScan) {
      ManageBluetooth.enableBluetooth().then(async () => {
        setHasError(false);

        const hasPermissions = await BLEPermissionsManager.ensureBLEPermissions();

        if (!hasPermissions) {
          log("❌ Permission denied. Please enable Bluetooth & Location.");
          setHasError(true);
          setGeneralErrorMessage('Please enable Bluetooth & Location.');
          return;
        } else {


          setDevices([]);
          setLoading(true);
          bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
              log("❌ Scan error: " + error.message);
              setHasError(true);
              setGeneralErrorMessage(error.message);
              setLoading(false);
              return;
            }
            if (device && device.name) {
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
          }).catch((e) => {
            setHasError(true);
            console.log(e);
            setGeneralErrorMessage(e.message);
          })

        }
      }).catch((error) => {
        // Failure code
        setHasError(true);
        console.log(error);
        setGeneralErrorMessage('Bluetooth is not enabled');
      });
    }
  }, [startScan]);



  useEffect(() => {
    if (connectToDevice) {
      bleManager.stopDeviceScan();
      setHasError(false);
      setGeneralErrorMessage(null);
      ManageBluetooth.enableBluetooth().then(async () => {
        setIsConnectingDone(false);
        setConnectButtonClicked(true);
        try {
          let deviceMapTemp: any = {}
          setLoading(false);
          const isConnected = await bleManager.isDeviceConnected(selectedDevice.id);
          let connectedDevice: Device = selectedDevice;
          if (!isConnected) {
            log(`🔗 Connecting to ${selectedDevice.name}...${selectedDevice.id}`);
            connectedDevice = await bleManager.connectToDevice(selectedDevice.id, {
              timeout: Constants.BLUETOOTH_CONNECTION_TIMEOUT_IN_MS
            });
            console.log("Connected >>>> " + connectedDevice)
          }
          await bleManager.discoverAllServicesAndCharacteristicsForDevice(connectedDevice.id);
          deviceMapTemp[connectedDevice.id] = {}
          const services = await bleManager.servicesForDevice(connectedDevice.id);
          for (const service of services) {
            deviceMapTemp[connectedDevice.id][service.uuid] = {}
            const characteristics = await service.characteristics();
            for (const char of characteristics) {
              deviceMapTemp[connectedDevice.id][service.uuid][char.uuid] = char
            }
          }
          setDeviceMap(deviceMapTemp);
        } catch (e: any) {
          setHasError(true);
          setGeneralErrorMessage(selectedDevice.name + " " + e.message);
          log("❌ Connection error: " + e.message);
        } finally {
          setConnectToDevice(false);
          setConnectButtonClicked(false);
        }
      }).catch((error) => {
        // Failure code
        setHasError(true);
        console.log(error);
        setGeneralErrorMessage('Bluetooth is not enabled');
        setConnectToDevice(false);
      });
    }
  }, [connectToDevice]);

  const log = (msg: any) => {
    console.log(msg);
    setLogs((prev) => [...prev, msg]);
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

      Object.keys(deviceMap[selectedDevice.device.id]).forEach((key: any) => {
        servicesDropdownTemp.push({ label: key ? key : "Service", value: key });

      });
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
      const characteristicsOptions = deviceMap[selectedDevice.device.id][selectedService.value][selectedCharacteristic.value]
      let enabledActionTypes: any[] = [];
      Object.keys(characteristicsOptions).map((key: any) => {
        if (characteristicsOptions[key] === true) {
          enabledActionTypes.push({ label: key, value: key });
        }
      });
      setReadActionTypes(enabledActionTypes.filter((type: any) => type.label.startsWith('isReadable')));
      setWriteActionTypes(enabledActionTypes.filter((type: any) => type.label.startsWith('isWritable')));
    }
  }, [selectedCharacteristic]);

  useEffect(() => {
    setBluetoothErrorMessage('');
    setHasBluetoothError(false);
    bleManager?.isDeviceConnected(selectedDevice.device.id).then(async (connected) => {
      if (!connected) {
        await bleManager?.connectToDevice(selectedDevice.device.id);
      }
      if (read && deviceMap &&
        selectedDevice &&
        selectedDevice.device &&
        selectedDevice.device.id &&
        selectedCharacteristic &&
        selectedCharacteristic.value) {

        const characteristicsOptions = deviceMap[selectedDevice.device.id][selectedService.value][selectedCharacteristic.value]
        if (characteristicsOptions && characteristicsOptions.isReadable) {
          try {
            if (!bleManager?.isDeviceConnected(selectedDevice.device.id)) {
              bleManager?.connectToDevice(selectedDevice.device.id);
            }
            bleManager?.readCharacteristicForDevice(selectedDevice.device.id,
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
              setReadLoading(false);
            });
          } catch (e: any) {
            setRead(false);
            setReadLoading(false);
            log(`❌ Read error from ${characteristicsOptions.uuid}: ${e.message}`);
            setHasBluetoothError(true);
            console.log(e);
            setBluetoothErrorMessage(`Read error from ${characteristicsOptions.uuid}: ${e.message}`);
          }
        }
      } else {
        setRead(false);
        setReadLoading(false);
      }
    }).catch((e) => {
      setBluetoothErrorMessage(e.message);
      setHasBluetoothError(true);
      setIsDeviceConnected(false);
    });
  }, [read]);


  useEffect(() => {
    setBluetoothErrorMessage('');
    setHasBluetoothError(false);

    bleManager?.isDeviceConnected(selectedDevice.device.id).then(async (connected) => {
      if (!connected) {
        await bleManager?.connectToDevice(selectedDevice.device.id);
      }
      if (
        widget &&
        widget.inputStates &&
        widget.inputStates[inputStateName] &&
        widget.inputStates[inputStateName].service &&
        write &&
        deviceMap &&
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
              bleManager?.writeCharacteristicWithResponseForDevice(selectedDevice.device.id,
                characteristicsOptions.serviceUUID,
                characteristicsOptions.uuid,
                btoa(input)
              ).then((response: any) => {
                if (response?.value) {
                  let decoded = '';
                  try {
                    decoded = Buffer.from(response?.value, "base64").toString("utf-8");
                    const json = JSON.parse(decoded);
                    setResponseOutput(JSON.stringify(json, null, 4));
                  } catch (err) {
                    setResponseOutput(JSON.stringify({ "response": decoded }, null, 4));
                  }
                  log(`📖 Write with response from ${characteristicsOptions.uuid}: ${decoded}`);
                }
              }).catch((error: any) => {
                setHasBluetoothError(true);
                console.log(error);
                setBluetoothErrorMessage(`Read error from ${characteristicsOptions.uuid}: ${error.message}`);
              }).finally(() => {
                setWrite(false);
              })


            } else if (characteristicsOptions.isWritableWithResponse) {
              if (!bleManager?.isDeviceConnected(selectedDevice.device.id)) {
                bleManager?.connectToDevice(selectedDevice.device.id);
              }
              bleManager?.writeCharacteristicWithoutResponseForDevice(selectedDevice.device.id,
                characteristicsOptions.serviceUUID,
                characteristicsOptions.uuid,
                btoa(input)
              ).then(() => {
                setResponseOutput(JSON.stringify({ executed: true }, null, 4));
              }).catch((error: any) => {
                setHasBluetoothError(true);
                console.log(error);
                setBluetoothErrorMessage(`Read error from ${characteristicsOptions.uuid}: ${error.message}`);
              }).finally(() => {
                setWrite(false);
                setWriteLoading(false);
              })
            }
          } else {
            setWrite(false);
            setWriteLoading(false);
          }
        } else {
          setWrite(false);
          setWriteLoading(false);
        }
      } else {
        setWrite(false);
        setWriteLoading(false);
      }
    }).catch((e) => {
      setBluetoothErrorMessage(e.message);
      setHasBluetoothError(true);
      setIsDeviceConnected(false);
    });



  }, [write]);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MD2Colors.grey200 }}>
      <StackScreenHeader title={"Configure Widget " + (widget.label ? widget.label : '')}></StackScreenHeader>
      <ScrollView>
        <View style={{ marginTop: 20, margin: 10, padding: 10, borderRadius: 10, borderColor: MD2Colors.grey400, backgroundColor: MD2Colors.white, borderWidth: 1 }}>
          {(!selectedDevice || (selectedDevice && showDeviceScan)) && <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
            {loading && (
              <ActivityIndicator animating={true} color={MD2Colors.grey800} style={{ paddingRight: 10, }} size="small" />
            )}
            <Button icon={() => <Icon color={MD2Colors.white} source="magnify-scan" size={20} />}
              onPress={() => {
                setStartScan(true);
              }} mode='outlined' style={{
                borderRadius: 5,
                backgroundColor: MD2Colors.grey800,
                borderWidth: 0,
                alignSelf: 'center',
              }}
              textColor={MD2Colors.white}
            >Scan for Devices
            </Button>
            {loading && <IconButton mode='outlined' style={{ borderRadius: 5 }} icon={() => <Icon color={MD2Colors.red500} source="stop" size={28} />} onPress={() => {
              bleManager && bleManager.stopDeviceScan().finally(() => {
                setStartScan(false);
                setLoading(false);
              });
            }}></IconButton>}
          </View>}

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
                if (selectedDevice.device && selectedDevice.device.id === item.value) {
                  return;
                } else {
                  setGeneralErrorMessage(null);
                  setHasError(false);
                  setBluetoothErrorMessage(null);
                  setHasBluetoothError(false);
                  setLoading(false);
                  setIsConnectingDone(false);
                  setConnectButtonClicked(false);
                  setServicesDropdown([]);
                  setCharacteristicDropdown([]);
                  setSelectedService(null);
                  setSelectedCharacteristic(null);
                  console.log
                  setSelectedDevice(devices[item.value]);
                }
              }}
            />}

          {devicesDropdown && !isDeviceConnected && Object.keys(devicesDropdown).length > 0 && selectedDevice && <View style={{ flexDirection: 'row', alignSelf: "center", alignItems: "center" }}><Button
            icon={() => <Icon color={MD2Colors.white} source="bluetooth-connect" size={20} />}
            onPress={() => setConnectToDevice(true)} mode='outlined' style={{
              borderRadius: 5,
              backgroundColor: MD2Colors.blue500,
              borderWidth: 0,
              alignSelf: 'center',
            }}
            textColor={MD2Colors.white}
          >Connect</Button>
            {connectButtonClicked && selectedDevice && <View style={{ flexDirection: 'row' }}>
              <ActivityIndicator animating={true} color={MD2Colors.blue500} style={{ paddingLeft: 10, }} size="small" />
              <Text style={{ marginLeft: 10, marginTop: 7, fontSize: 10 }}>Connecting...</Text>
            </View>}
          </View>}
        </View>

        {hasError && <Chip mode="outlined"
          style={styles.errorMessageContainer}
          textStyle={styles.errorMessageText}
          icon={() => <Icon source='information-outline' size={20} color={MD2Colors.red400} />}>{generalErrorMessage}</Chip>}

        <Chip
          textStyle={{ fontSize: 12, color: MD2Colors.grey800 }}
          mode='outlined'
          style={{ width: 180, marginLeft: 15, marginTop: 5, backgroundColor: MD2Colors.white, borderColor: isDeviceConnected ? MD2Colors.green500 : MD2Colors.red500 }}
          disabled={true}
        >
          <Icon source='bluetooth' size={16} color={MD2Colors.blue600} /> Device Connected: {
            selectedDevice?.device?.id
              ? (isDeviceConnected ? "Yes" : "No")
              : "No device selected"
          }
        </Chip>

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
        {widget.inputStates &&
          widget.inputStates[inputStateName] &&
          <View>
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
              {!edit && devicesDropdown && Object.keys(devicesDropdown).length > 0 && selectedDevice &&
                <IconButton mode="outlined" style={{
                  margin: "auto", marginTop: 10, marginRight: 20, marginBottom: 10,
                }} iconColor={MD2Colors.grey900} size={15}
                  icon={"application-edit"}
                  onPress={() => {
                    setEdit(true);
                  }}></IconButton>}

              {hasBluetoothError && <Chip mode="outlined"
                style={styles.errorMessageContainer}
                textStyle={styles.errorMessageText}
                icon={() => <Icon source='information-outline' size={20} color={MD2Colors.red400} />}>{bluetoothErrorMessage}</Chip>}

              {selectedDevice && inputStateName !== 'CHECK_STATUS' &&
                selectedService &&
                selectedService.value &&
                selectedCharacteristic &&
                selectedCharacteristic.value &&
                selectedCharacteristicsOption &&
                selectedCharacteristicsOption.value
                && <View style={{ backgroundColor: MD2Colors.white, margin: 10, padding: 10, borderRadius: 10, borderColor: MD2Colors.grey400, borderWidth: 1 }}>
                  <TextInput
                    disabled={!edit}
                    label="Input"
                    value={
                      widget.inputStates[inputStateName].service &&
                        widget.inputStates[inputStateName].service[selectedService.value] &&
                        widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value] &&
                        widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value] &&
                        widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].input ?
                        widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].input : ''
                    }
                    textColor={MD2Colors.black}
                    style={{
                      backgroundColor: edit ? MD2Colors.white : MD2Colors.grey100,
                      width: "100%",
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
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                    <Button
                      disabled={!edit && !isDeviceConnected}
                      onPress={() => {
                        setWriteLoading(true);
                        setWrite(true)
                      }} mode='outlined' style={{
                        borderRadius: 5,
                        marginTop: 10,
                        backgroundColor: MD2Colors.green400,
                        borderWidth: 0,
                        alignSelf: 'center',
                      }}
                      textColor={MD2Colors.white}
                    >WRITE</Button>
                    {writeLoading && (
                      <ActivityIndicator animating={true} color={MD2Colors.green400} style={{ paddingLeft: 10, }} size="small" />
                    )}
                  </View>
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

                {selectedDevice &&
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                    <Button
                      disabled={!edit && !isDeviceConnected}
                      onPress={() => {
                        setRead(true);
                        setReadLoading(true);
                      }} mode='outlined' style={{
                        borderRadius: 5,
                        backgroundColor: MD2Colors.green400,
                        borderWidth: 0,
                        alignSelf: 'center',
                      }}
                      textColor={MD2Colors.white}
                    >READ</Button>
                    {readLoading && (
                      <ActivityIndicator animating={true} color={MD2Colors.green400} style={{ paddingLeft: 10, }} size="small" />
                    )}
                  </View>}
              </View>}

              <Divider></Divider>

              {inputStateName &&
                outputStateName &&
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


              {inputStateName !== '' &&
                widget &&
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
                  {<IconButton style={{ marginLeft: "auto" }} iconColor={MD2Colors.grey800} size={20}
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
                widget.inputStates[inputStateName].service[selectedService.value][selectedCharacteristic.value][selectedCharacteristicsOption.value].outputState[outputStateName].conditions && <ScrollView style={{ maxHeight: 300 }}>
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
                selectedService &&
                selectedCharacteristic &&
                selectedCharacteristicsOption &&
                outputStateName &&
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

              {edit && <View style={{ flexDirection: "row", alignSelf: "center", margin: "auto", marginBottom: 20, marginTop: 20 }}>
                <Divider></Divider>
                <Chip icon={() => <Icon source="cancel" size={20} color={MD2Colors.red400} />} mode="outlined"
                  style={{
                    marginLeft: 5,
                  }}
                  onPress={() => {
                    setHasBluetoothError(false);
                    setBluetoothErrorMessage('');
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

                    let modifiedWidget = { ...widget };
                    if (selectedDevice) {
                      modifiedWidget.bluetoothDevice = {
                        ...selectedDevice,
                        services: deviceMap[selectedDevice.device.id],
                      };
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
                    setEdit(false);
                  }}>
                  Save
                </Chip>
              </View>}
            </View>
          </View>}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConfigureBluetooth;
