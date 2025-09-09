import { makeApiCall } from '@/libs/apicall';
import WidgetModel from '@/models/WidgetModel';
import { styles } from '@/assets/styles/styles';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    View, Text,
} from 'react-native';
import { ActivityIndicator, Button, Chip, Dialog, Icon, IconButton, MD2Colors, Portal, Switch, TextInput } from 'react-native-paper';
import { makeBluetoothCall } from '@/libs/bluetoothcall';

export type Props = {
    widget: WidgetModel;
    dashboard: any;
    updateDashboard: any;//Mutation function to update the dashboard
    updateDashboardDone: boolean;//Flag to indicate if the dashboard update is done
};


const OnOffButtonWidget: React.FC<Props> = ({
    widget,
    dashboard,
    updateDashboard,
    updateDashboardDone }) => {

    // State to track if the card is being dragged
    const init: string = '';
    const [inputState, setInputState] = useState(init);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [outputState, setOutputState] = useState(init);
    const [edit, setEdit] = useState(false);
    const [loadingRequest, setLoadingRequest] = useState(true);
    const [actionRequest, setActionRequest] = useState(true);
    const [widgetCopy, setWidget] = useState(widget);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    useFocusEffect(useCallback(() => {
        if (widget.inputStates && widget.inputStates['CHECK_STATUS'] &&
            (widget.connectionType === "WIFI" && widget.inputStates['CHECK_STATUS'].apiUrl ||
                widget.connectionType === "BLUETOOTH"
            )) {
            const state = widget.inputStates['CHECK_STATUS'];
            if (widget.connectionType === "BLUETOOTH") {
                makeBluetoothCall(
                    widget,
                    state,
                    setInputState,
                    setOutputState,
                    setActionRequest,
                    setHasError,
                    setErrorMessage,
                    "ON",
                    "OFF")
            } else {
                makeApiCall(
                    state,
                    setInputState,
                    setOutputState,
                    setActionRequest,
                    setHasError,
                    setErrorMessage,
                    "ON",
                    "OFF");

            }
            setLoadingRequest(false);

        } else {
            setLoadingRequest(false);
            setActionRequest(false);
        }
    }, []));

    useEffect(() => {
        if (updateDashboardDone) {
            setEdit(false);
            setLoadingRequest(false);
        }
    }, [updateDashboardDone])

    return (<View style={{ backgroundColor: MD2Colors.white, margin: 10, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: MD2Colors.lightGreenA700 }}>
        <Portal>
            <Dialog
                visible={showConfirmDelete} onDismiss={() => { setShowConfirmDelete(false) }}
                style={styles.deleteDialogue}>
                <View style={{}}>
                    <View style={styles.deleteMessageContainer}>
                        <Text style={styles.size12Font}>Are you sure you want to delete the widget {widget.label}?</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignSelf: "center" }}>
                        <Chip
                            textStyle={styles.size12Font}
                            style={{ backgroundColor: MD2Colors.red200 }} onPress={() => {
                                setShowConfirmDelete(false);
                            }}>No</Chip>
                        <Chip mode='outlined'
                            textStyle={styles.size12Font}
                            style={{ marginLeft: 10 }} onPress={async () => {
                                if (dashboard && dashboard.widgets) {
                                    setLoadingRequest(true);
                                    let modifiedWidgets = { ...dashboard.widgets }
                                    delete modifiedWidgets[widgetCopy.widgetId];
                                    const modifiedDashboardObjectAfterDeletingWidget: any = {
                                        ...dashboard,
                                        widgets: modifiedWidgets
                                    };
                                    updateDashboard.mutate(modifiedDashboardObjectAfterDeletingWidget);
                                }
                                setShowConfirmDelete(false);
                            }}>Yes</Chip>
                    </View>
                </View>
            </Dialog>
        </Portal>

        {loadingRequest ? <ActivityIndicator style={{ marginTop: 50 }}></ActivityIndicator> :
            <View>
                <View style={{ flexDirection: "row", borderBottomWidth: 1, marginBottom: 5, borderColor: MD2Colors.grey300 }}>
                    <View style={{ marginLeft: 20 }}>
                        {edit ?
                            <TextInput
                                label="Label"
                                mode='outlined'
                                value={widgetCopy.label}
                                style={styles.widgetNameTextInput}
                                onChangeText={(text) => {
                                    if (text) {
                                        let modifiedWidget = { ...widgetCopy }
                                        modifiedWidget.label = text;
                                        setWidget(modifiedWidget);
                                    }
                                }}
                            /> : <Text style={styles.widgetTitle}>{widgetCopy.label ? widgetCopy.label : 'Add Label'}</Text>}
                    </View>

                    <View style={styles.widgetHeaderButtons}>
                        {(widgetCopy.connectionType === 'BLUETOOTH' && widgetCopy.bluetoothDevice && widgetCopy.bluetoothDevice.device) && <Text style={{fontSize: 12, marginTop: 14, fontWeight:600}}>{widgetCopy.bluetoothDevice.device.name}</Text>}
                        {edit && (widgetCopy.connectionType === 'BLUETOOTH' || !widgetCopy.connectionType) && <IconButton mode='outlined' style={styles.widgetConfigureIcon} size={16} icon={() => <Icon source='bluetooth-settings' size={16} color={MD2Colors.blue600} />}
                            onPress={() => {
                                router.push(`/screens/bluetoothscreen?widgetId=${widgetCopy.widgetId}&userId=${widgetCopy.userId}&dashboardId=${dashboard.dashboardId}`)
                            }}></IconButton>}
                        {edit && (widgetCopy.connectionType === 'WIFI' || !widgetCopy.connectionType) && <IconButton mode='outlined' style={styles.widgetConfigureIcon} size={16} icon={() => <Icon source='wifi-settings' size={16} color={MD2Colors.grey900} />}
                            onPress={() => {
                                router.push(`/screens/configure?widgetId=${widgetCopy.widgetId}&userId=${widgetCopy.userId}&dashboardId=${dashboard.dashboardId}`)
                            }}></IconButton>}
                        {edit && <IconButton mode='outlined' style={styles.widgetDeleteIcon} size={16} icon={() => <Icon source='delete' size={16} color={MD2Colors.grey900} />}
                            onPress={() => {
                                setShowConfirmDelete(true);
                            }}></IconButton>}
                        {!edit && !widgetCopy.readOnly && <IconButton mode='outlined' style={styles.widgetEditIcon} size={16} icon={() => <Icon source='application-edit' size={16} color={MD2Colors.grey900} />}
                            onPress={() => {
                                setEdit(true);
                            }}></IconButton>}
                    </View>
                </View>
                {hasError && <Chip mode="outlined"
                    style={styles.errorMessageContainer}
                    textStyle={styles.errorMessageText}
                    icon={() => <Icon source='information-outline' size={20} color={MD2Colors.red400} />}>{errorMessage}</Chip>}

                {actionRequest ? <ActivityIndicator style={{ marginTop: 50 }}></ActivityIndicator> :

                    <View style={{ flexDirection: "row" }}>
                        <View style={{ margin: 'auto' }}>
                            <Button mode='elevated'
                                style={{
                                    borderRadius: 5,
                                    backgroundColor: inputState === 'ON' ? MD2Colors.green400 : inputState === 'OFF' ? MD2Colors.red300 : MD2Colors.grey300,
                                }}
                                textColor={MD2Colors.white}
                                onPress={() => {
                                    setActionRequest(true);
                                    setHasError(false);
                                    if (inputState === 'ON') {
                                        if (widget.inputStates && widget.inputStates['OFF'] &&
                                            (widget.connectionType === "WIFI" && widget.inputStates['OFF'].apiUrl ||
                                                widget.connectionType === "BLUETOOTH"
                                            )) {
                                            const stateOFF = widget.inputStates['OFF'];

                                            if (widget.connectionType === 'BLUETOOTH') {
                                                makeBluetoothCall(
                                                    widget,
                                                    stateOFF,
                                                    setInputState,
                                                    setOutputState,
                                                    setActionRequest,
                                                    setHasError,
                                                    setErrorMessage,
                                                    "",
                                                    "")
                                            } else {

                                                makeApiCall(
                                                    stateOFF,
                                                    setInputState,
                                                    setOutputState,
                                                    setActionRequest,
                                                    setHasError,
                                                    setErrorMessage,
                                                    "",
                                                    "");
                                            }
                                        } else {
                                            setActionRequest(false);
                                            setOutputState('ERROR');
                                            setHasError(true);
                                            setErrorMessage('Please configure OFF state');
                                        }
                                    } else {
                                        if (widget.inputStates && widget.inputStates['ON'] &&
                                            (widget.connectionType === "WIFI" && widget.inputStates['ON'].apiUrl ||
                                                widget.connectionType === "BLUETOOTH"
                                            )) {
                                            const stateON = widget.inputStates['ON'];
                                            if (widget.connectionType === 'BLUETOOTH') {
                                                makeBluetoothCall(
                                                    widget,
                                                    stateON,
                                                    setInputState,
                                                    setOutputState,
                                                    setActionRequest,
                                                    setHasError,
                                                    setErrorMessage,
                                                    "",
                                                    "")
                                            } else {
                                                makeApiCall(
                                                    stateON,
                                                    setInputState,
                                                    setOutputState,
                                                    setActionRequest,
                                                    setHasError,
                                                    setErrorMessage,
                                                    "",
                                                    "");
                                            }
                                        } else {
                                            setActionRequest(false);
                                            setHasError(true);
                                            setErrorMessage('Please configure ON state');
                                        }

                                    }
                                }}
                                disabled={dashboard ? false : true}>{inputState ? inputState : "ON/OFF"}</Button>
                        </View>
                        <View style={styles.onOffIconContainer}>
                            <Text style={styles.onOffText}>{outputState}</Text>
                            <View style={styles.onOffIcon}>
                                <Icon source="circle" size={24} color={
                                    outputState === 'ON' ? MD2Colors.green400 : outputState === 'OFF' ? MD2Colors.red400 : outputState === 'ERROR' ? MD2Colors.orange400 : MD2Colors.grey400
                                } />
                            </View>
                        </View>
                    </View>}
                {edit && <View style={styles.saveCancelContainer}>
                    <Chip icon={() => <Icon source="cancel" size={14} color={MD2Colors.red400} />} mode="outlined"
                        style={{
                            marginLeft: 5,
                        }}
                        textStyle={{ fontSize: 12 }}
                        onPress={() => {
                            setEdit(false)
                        }}>
                        Cancel
                    </Chip>
                    <Chip icon={() => <Icon source="content-save" size={14} color={MD2Colors.grey800} />} mode="flat"
                        disabled={!edit}
                        style={{
                            marginLeft: 5,
                            backgroundColor: MD2Colors.amber500
                        }}
                        textStyle={{ fontSize: 12 }}
                        onPress={async () => {
                            if (dashboard) {
                                setLoadingRequest(true);
                                const modifiedDashboardObject: any = {
                                    ...dashboard,
                                    widgets: {
                                        ...dashboard.widgets,
                                        [widgetCopy.widgetId]: widgetCopy
                                    }
                                };
                                updateDashboard.mutate(modifiedDashboardObject);
                            }
                        }}>
                        Save
                    </Chip>
                </View>}
            </View>}
    </View>
    );
};

export default OnOffButtonWidget;
