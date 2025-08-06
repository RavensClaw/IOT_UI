import { makeApiCall } from '@/libs/apicall';
import WidgetModel from '@/models/WidgetModel';
import { styles } from '@/assets/styles/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    View, Text,
} from 'react-native';
import { ActivityIndicator, Button, Chip, Dialog, Icon, IconButton, MD2Colors, Portal, Switch, TextInput } from 'react-native-paper';

export type Props = {
    widget: WidgetModel;
    dashboard: any;
    
    updateDashboard: any;
updateDashboardDone: boolean;
};


const PushButtonWidget: React.FC<Props> = ({
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
    const [widgetCopy, setWidget] = useState(widget);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    useFocusEffect(useCallback(() => {
        console.log(widget.inputStates)
        if (widget.inputStates && widget.inputStates['CHECK_STATUS'] && widget.inputStates['CHECK_STATUS'].apiUrl) {
            const state = widget.inputStates['CHECK_STATUS'];
            console.log("CHECK_STATUS", state);
            makeApiCall(
                state,
                setInputState,
                setOutputState,
                setLoadingRequest,
                setHasError,
                setErrorMessage,
                "PRESSIN",
                "PRESSOUT");
        } else {
            setLoadingRequest(false);
        }
    }, []));

    
        useEffect(() => {
                if(updateDashboardDone){
                    setEdit(false);
                }
            }, [updateDashboardDone])

    return (<View style={[styles.container, { borderColor: MD2Colors.purple300 }]}>
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

                                    let modifiedWidgets = { ...dashboard.widgets }
                                    delete modifiedWidgets[widgetCopy.widgetId];

                                    const modifiedDashboardObject: any = {
                                        ...dashboard,
                                        widgets: modifiedWidgets
                                    };
                                    updateDashboard.mutate(modifiedDashboardObject);

                                }

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
                        {edit && <IconButton mode='outlined' style={styles.widgetConfigureIcon} size={16} icon={() => <Icon source='cog-outline' size={16} color={MD2Colors.grey900} />}
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

                <View style={{ flexDirection: "row" }}>
                    <View style={{ margin: 'auto' }}>
                        <Button mode='elevated'
                            style={{
                                borderRadius: 5,
                                backgroundColor: inputState === 'PRESSIN' ? MD2Colors.green400 : inputState === 'PRESSOUT' ? MD2Colors.red300 : MD2Colors.grey300
                            }}

                            textColor={MD2Colors.white}
                            onPressIn={() => {
                                setLoadingRequest(true);
                                setHasError(false);
                                if (widget.inputStates && widget.inputStates['PRESSIN'] && widget.inputStates['PRESSIN'].apiUrl) {
                                    const statePRESSIN = widget.inputStates['PRESSIN'];
                                    makeApiCall(
                                        statePRESSIN,
                                        setInputState,
                                        setOutputState,
                                        setLoadingRequest,
                                        setHasError,
                                        setErrorMessage,
                                        "",
                                        "");
                                } else {
                                    setLoadingRequest(false);
                                    setOutputState('ERROR');
                                    setHasError(true);
                                    setErrorMessage('Please configure PRESSIN state');
                                }

                            }}
                            onPressOut={() => {
                                setLoadingRequest(true);
                                setHasError(false);
                                if (widget.inputStates && widget.inputStates['PRESSOUT'] && widget.inputStates['PRESSOUT'].apiUrl) {
                                    const statePRESSOUT = widget.inputStates['PRESSOUT'];
                                    makeApiCall(
                                        statePRESSOUT,
                                        setInputState,
                                        setOutputState,
                                        setLoadingRequest,
                                        setHasError,
                                        setErrorMessage,
                                        "",
                                        "");
                                } else {
                                    setLoadingRequest(false);
                                    setOutputState('ERROR');
                                    setHasError(true);
                                    setErrorMessage('Please configure PRESSOUT state');
                                }
                            }}
                            disabled={dashboard ? false : true}>{inputState ? inputState : "PRESS IN/PRESS OUT"}</Button>
                    </View>
                    <View style={styles.onOffIconContainer}>
                        <Text style={styles.onOffText}>{outputState}</Text>
                        <View style={styles.onOffIcon}>
                            <Icon source="circle" size={24} color={
                                outputState === 'PRESSIN' ? MD2Colors.green400 : outputState === 'PRESSOUT' ? MD2Colors.red400 : outputState === 'ERROR' ? MD2Colors.orange400 : MD2Colors.grey400
                            } />
                        </View>
                    </View>
                </View>
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
                                const modifiedDashboardObject: any = {
                                    ...dashboard,
                                    widgets: {
                                        ...dashboard.widgets,
                                        [widgetCopy.widgetId]: widgetCopy
                                    }
                                };
                                updateDashboard.mutate(modifiedDashboardObject);

                            }
                            console.log("PRESSED")
                        }}>
                        Save
                    </Chip>
                </View>}
            </View>}
    </View>
    );
};

export default PushButtonWidget;
