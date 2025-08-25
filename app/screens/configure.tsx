import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { List, Button, Chip, MD2Colors, Text, TextInput, MD3Colors, IconButton, Checkbox, ActivityIndicator, SegmentedButtons, Icon, Banner, Divider } from "react-native-paper";

import ObjectID from "bson-objectid";
import config from '../../constants/config.json'
import WidgetModel from "@/models/WidgetModel";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import ParamsModel from "@/models/ParamsModel";
import HeadersList from "@/components/HeadersList";
import QueryParamsList from "@/components/QueryParamsList";
import OutputConditionsMappingList from "@/components/OutputConditionsMappingList";
import { StackScreenHeader } from "@/components/StackScreenHeader";
import ListModel from "@/models/ListModel";
import { getCurrentUser } from "aws-amplify/auth/cognito";
import { Constants } from "@/constants/constants";
import { mutationUpdateDashboard, queryGetDashBoardByDashBoardId } from "@/service/servicehook";
import { styles } from "@/assets/styles/styles";
const QUERY_PARAMS_REGEX_FROM_URL = /(\?|\&)[a-zA-Z0-9-_]+=[a-zA-Z0-9-_]+/g
const METHODS = [
    { label: "GET", value: 'GET' },
    { label: "POST", value: 'POST' },
]

const Configure = () => {
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
    const [selectedParentTab, setSelectedParentTab] = useState(initState);
    const [selectedChildTab, setSelectedChildTab] = useState(initState);
    const [loadingPage, setLoadingPage] = useState(true);
    const [loadingQueryParams, setLoadingQueryParams] = useState(true);
    const [loadingHeaders, setLoadingHeaders] = useState(true);
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
                        setWidget(jsonWidgets[keys[i]]);
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
                setLoadingQueryParams(false);
                setLoadingHeaders(false);
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
            const widgetToMofidy: WidgetModel = { ...widget };
            if (widgetToMofidy.inputStates) {
                const inputStates = Object.keys(widgetToMofidy.inputStates);
                let noInputState = true;
                for (let i = 0; i < inputStates.length; i++) {
                    if (widgetToMofidy.inputStates[inputStates[i]].stateName === inputStateName) {
                        noInputState = false;
                        break;
                    }
                }
                if (noInputState) {
                    widgetToMofidy.inputStates[inputStateName] = {
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
                    if (!widgetToMofidy?.inputStates[inputStateName]?.params) {
                        widgetToMofidy.inputStates[inputStateName] = {
                            ...widgetToMofidy.inputStates[inputStateName],
                            params: [
                                {
                                    enabled: true,
                                    id: new ObjectID().toHexString()
                                }
                            ]
                        }
                    }

                    if (!widgetToMofidy?.inputStates[inputStateName]?.headers) {
                        widgetToMofidy.inputStates[inputStateName] = {
                            ...widgetToMofidy.inputStates[inputStateName],
                            headers: [
                                {
                                    enabled: true,
                                    id: new ObjectID().toHexString()
                                }
                            ]
                        }
                    }
                }
                setWidget(widgetToMofidy);
            }
        }
    }, [inputStateName])


    /*useEffect(() => {
        
    }, [widget])*/

    useEffect(() => {
        const widgetToMofidy: WidgetModel = { ...widget };
        if (widgetToMofidy.inputStates) {
            const inputStates = Object.keys(widgetToMofidy.inputStates);
            for (let i = 0; i < inputStates.length; i++) {
                if (widgetToMofidy.inputStates[inputStates[i]].stateName === inputStateName) {
                    widgetToMofidy.inputStates[inputStates[i]].body = bodyInput;
                    break;
                }
            }
            setWidget(widgetToMofidy);
        }
    }, [bodyInput])

    useEffect(() => {
        const widgetToMofidy: WidgetModel = { ...widget };
        if (widgetToMofidy.inputStates) {
            const inputStates = Object.keys(widgetToMofidy.inputStates);
            for (let i = 0; i < inputStates.length; i++) {
                if (widgetToMofidy.inputStates[inputStates[i]].stateName === inputStateName) {
                    widgetToMofidy.inputStates[inputStates[i]].response = responseOutput;
                    break;
                }
            }
            setWidget(widgetToMofidy);
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: MD2Colors.grey200, width: "100%" }}>
            <StackScreenHeader title={"Configure " + (widget.label ? widget.label : '')}></StackScreenHeader>
            <ScrollView style={{ backgroundColor: MD2Colors.grey200, marginBottom:50 }}>
                {loadingPage ? <ActivityIndicator style={{ marginTop: 50 }}></ActivityIndicator> :
                    <View style={{ alignSelf: "center", width: "100%" }}>
                        {generalErrorVisible && <Chip mode="outlined"
                            style={{ margin: 5, borderColor: MD2Colors.red300, padding: 5 }}
                            textStyle={{ color: MD2Colors.grey700 }}
                            icon={() => <Icon source='information-outline' size={20} color={MD2Colors.red400} />}>{generalErrorMessage}</Chip>}
                        <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "center" }}>
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
                        </View>
                        {loadingRequest ? <ActivityIndicator style={{ margin: 100 }}></ActivityIndicator> :
                            inputStateName?.trim() !== '' &&
                            <View>
                                {apiErrorVisible && <Chip mode="outlined"
                                    style={{ margin: 5, borderColor: MD2Colors.red300, padding: 5 }}
                                    textStyle={{ color: MD2Colors.grey700 }}
                                    icon={() => <Icon source='information-outline' size={20} color={MD2Colors.red400} />}>{apiErrorMessage}</Chip>}
                                {widget && widget.inputStates && widget.inputStates[inputStateName] && <View style={{ flexDirection: "row" }}>
                                    <Dropdown
                                        style={[styles.dropdown, { backgroundColor: !edit ? MD2Colors.grey200 : MD2Colors.white }]}
                                        placeholderStyle={styles.placeholderStyle}
                                        selectedTextStyle={styles.selectedTextStyle}
                                        iconStyle={styles.iconStyle}
                                        itemTextStyle={styles.selectedTextStyle}
                                        data={METHODS}
                                        maxHeight={300}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Method"
                                        value={widget.inputStates[inputStateName].method}
                                        onChange={(item) => {
                                            const widgetToMofidy: WidgetModel = { ...widget };
                                            if (widgetToMofidy.inputStates) {
                                                const inputStates = Object.keys(widgetToMofidy.inputStates);
                                                for (let i = 0; i < inputStates.length; i++) {
                                                    if (widgetToMofidy.inputStates[inputStates[i]].stateName === inputStateName) {
                                                        widgetToMofidy.inputStates[inputStates[i]].method = item.value;
                                                        break;
                                                    }
                                                }
                                                setWidget(widgetToMofidy);
                                            }
                                        }}
                                        disable={!edit}
                                    />
                                    <Button icon="send-circle-outline" mode="contained"
                                        disabled={!edit}
                                        style={{
                                            borderRadius: 3,
                                            width: 100,
                                            margin: "auto",
                                            marginLeft: 5,
                                            backgroundColor: MD2Colors.blue500
                                        }}

                                        onPress={() => {
                                            setLoadingRequest(true);
                                            setApiErrorVisible(false);
                                            setApiErrorMessage('');
                                            console.log("PRESSED")
                                            let headers: any = {};

                                            if (widget &&
                                                widget.inputStates &&
                                                widget.inputStates[inputStateName]) {

                                                if (widget.inputStates[inputStateName].method &&
                                                    widget.inputStates[inputStateName].apiUrl
                                                ) {
                                                    if (widget.inputStates[inputStateName].headers) {
                                                        widget.inputStates[inputStateName].headers.map((headerItem: ListModel) => {
                                                            if (headerItem.name &&
                                                                headerItem.name?.trim() !== "" &&
                                                                headerItem.value &&
                                                                headerItem.value?.trim() !== "") {
                                                                headers[headerItem.name] = headerItem.value;
                                                            }
                                                        });
                                                    }

                                                    let options: any = {
                                                        method: widget.inputStates[inputStateName].method,
                                                        headers: headers
                                                    }

                                                    let apiURL = widget.inputStates[inputStateName].apiUrl;

                                                    if (widget.inputStates[inputStateName].params) {
                                                        let alreadyHasParams: boolean = false;
                                                        if (apiURL?.indexOf("?") != -1) {
                                                            alreadyHasParams = true;
                                                        }
                                                        let toAppendUrl = '';
                                                        widget.inputStates[inputStateName].params.map((paramItem: ListModel) => {
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

                                                    if (widget.inputStates[inputStateName].body) {
                                                        options["body"] = JSON.stringify(widget.inputStates[inputStateName].body)
                                                    }

                                                    console.log(options)


                                                    fetch(apiURL, options).then(async (response: any) => {
                                                        console.log(response)
                                                        const contentType = response.headers['content-type']?.toLowerCase() || '';
                                                        console.log("@@@@@@@@@@@@@@@@ OVERRIDE @@@@@@@@@@@@@@@@@");
                                                        console.log(contentType)
                                                        const jsonResponse = await response.json();
                                                        console.log(JSON.stringify(jsonResponse))

                                                        setResponseOutput(JSON.stringify(jsonResponse, null, 4));
                                                    }).catch((error) => {
                                                        console.log(error)
                                                        setApiErrorMessage(error.message);
                                                        setApiErrorVisible(true);

                                                    }).finally(() => {
                                                        console.log("###########################");
                                                        setLoadingRequest(false);
                                                        console.log("###########################");
                                                    });

                                                }

                                            }

                                            /*{
                                                  'Accept': 'application/json',
                                                  'Content-Type': 'application/json',
                                                  'Origin': '',
                                                }
                                                  */




                                        }}>
                                        Send
                                    </Button>
                                    {!edit && <IconButton mode="outlined" style={{ margin: "auto" }} iconColor={MD2Colors.yellow700} size={15}
                                        icon={"circle-edit-outline"}
                                        onPress={() => {
                                            setEdit(true);
                                        }}></IconButton>}
                                </View>}
                                {widget && widget.inputStates && widget.inputStates[inputStateName] && <View style={{ height: 50 }}>
                                    <TextInput
                                        disabled={!edit}
                                        label="API URL"
                                        value={widget.inputStates[inputStateName].apiUrl}
                                        style={{
                                            color: MD2Colors.black,
                                            fontSize: 12, minWidth: 400, height: 50, margin: "auto", marginLeft: 5, marginRight: 5
                                        }}
                                        mode="outlined"
                                        onChangeText={apiUrlText => {
                                            const widgetToMofidy: WidgetModel = { ...widget };
                                            if (widgetToMofidy.inputStates) {
                                                const inputStates = Object.keys(widgetToMofidy.inputStates);
                                                for (let i = 0; i < inputStates.length; i++) {
                                                    if (widgetToMofidy.inputStates[inputStates[i]].stateName === inputStateName) {
                                                        /*if (apiUrlText && apiUrlText?.trim() !== '') {
                                                            const paramsListModelItems = widgetToMofidy.inputStates[inputStates[i]].params;
                                                            if (paramsListModelItems && paramsListModelItems.length > 0) {
                                                                let appendParamsToUrl = '';
                                                                paramsListModelItems.map((paramItem: ListModel, index) => {
                                                                    if (paramItem.name &&
                                                                        paramItem.name?.trim() !== "" &&
                                                                        paramItem.value &&
                                                                        paramItem.value?.trim() !== "") {
                                                                        if (index === 0) {
                                                                            appendParamsToUrl = "?" + paramItem.name + "=" + paramItem.value
                                                                        } else {
                                                                            appendParamsToUrl += "&" + paramItem.name + "=" + paramItem.value
                                                                        }
                                                                    }
                                                                });
                                                                widgetToMofidy.inputStates[inputStates[i]].apiUrl = apiUrlText + appendParamsToUrl;
                                                            }
                                                        } else if (apiUrlText &&
                                                            apiUrlText?.trim() !== '' &&
                                                            (apiUrlText.indexOf("?") !== -1 || apiUrlText.indexOf("&") !== -1)) {
        
                                                            let m;
        
                                                            do {
                                                                m = QUERY_PARAMS_REGEX_FROM_URL.exec(apiUrlText);
                                                                if (m) {
                                                                    console.log(m[0]);
                                                                }
                                                            } while (m);
        
                                                        }*/
                                                        widgetToMofidy.inputStates[inputStates[i]].apiUrl = apiUrlText;
                                                        break;
                                                    }
                                                }
                                                setWidget(widgetToMofidy);
                                            }
                                        }}
                                    />
                                </View>}
                                <SegmentedButtons
                                    theme={{ colors: { primary: 'green' } }}
                                    style={{ marginTop: 30, marginLeft: 4, marginRight: 4 }}
                                    density="small"
                                    value={selectedParentTab}
                                    onValueChange={() => { }}
                                    buttons={[
                                        {
                                            icon: () => <Icon source="alpha-i" size={24} color={selectedParentTab === 'i' ? MD2Colors.white : MD2Colors.grey800} />,
                                            value: 'i',
                                            label: 'Inputs',
                                            labelStyle: {
                                                color: selectedParentTab === 'i' ? MD2Colors.white : MD2Colors.grey800
                                            },
                                            style: {
                                                borderRadius: 2,
                                                backgroundColor: selectedParentTab === 'i' ? MD2Colors.grey800 : MD2Colors.white
                                            },
                                            onPress: (() => {
                                                setSelectedParentTab('i');
                                                setSelectedChildTab('p');
                                            })
                                        },
                                        {
                                            icon: () => <Icon source="alpha-r" size={24} color={selectedParentTab === 'r' ? MD2Colors.white : MD2Colors.grey800} />,
                                            value: 'r',
                                            label: 'Response',
                                            labelStyle: {
                                                color: selectedParentTab === 'r' ? MD2Colors.white : MD2Colors.grey800
                                            },
                                            style: {
                                                borderRadius: 2,
                                                backgroundColor: selectedParentTab === 'r' ? MD2Colors.grey800 : MD2Colors.white
                                            },
                                            onPress: (() => {
                                                setSelectedParentTab('r');
                                            })
                                        }
                                    ]}
                                />

                                {selectedParentTab === 'i' &&
                                    <View>
                                        <SegmentedButtons
                                            style={{ marginTop: 30, marginLeft: 4, marginRight: 4 }}
                                            density="small"
                                            value={selectedChildTab}
                                            onValueChange={() => { }}
                                            buttons={[
                                                {
                                                    icon: () => <Icon source="alpha-p" size={24} color={MD2Colors.grey800} />,
                                                    value: 'p',
                                                    label: 'Params',
                                                    labelStyle: {
                                                        //color:selectedChildTab === 'p' ? MD2Colors.white: MD2Colors.grey800
                                                    },
                                                    style: {
                                                        borderRadius: 2,
                                                        backgroundColor: selectedChildTab === 'p' ? MD2Colors.amber500 : MD2Colors.white
                                                    },
                                                    onPress: (() => {
                                                        setSelectedChildTab('p');
                                                    })
                                                },
                                                {
                                                    icon: () => <Icon source="alpha-h" size={24} color={MD2Colors.grey800} />,
                                                    value: 'h',
                                                    label: 'Headers',
                                                    labelStyle: {
                                                        //color:selectedChildTab === 'p' ? MD2Colors.white: MD2Colors.grey800
                                                    },
                                                    style: {
                                                        borderRadius: 2,
                                                        backgroundColor: selectedChildTab === 'h' ? MD2Colors.amber500 : MD2Colors.white
                                                    },
                                                    onPress: (() => {
                                                        setSelectedChildTab('h');
                                                    })
                                                },
                                                {
                                                    icon: () => <Icon source="alpha-b" size={24} color={MD2Colors.grey800} />,
                                                    value: 'b',
                                                    label: 'Body',
                                                    labelStyle: {
                                                        //color:selectedChildTab === 'p' ? MD2Colors.white: MD2Colors.grey800
                                                    },
                                                    style: {
                                                        borderRadius: 2,
                                                        backgroundColor: selectedChildTab === 'b' ? MD2Colors.amber500 : MD2Colors.white
                                                    },
                                                    onPress: (() => {
                                                        setSelectedChildTab('b');
                                                    })
                                                }
                                            ]}
                                        />
                                        <View>
                                            {selectedChildTab === 'p' && <View>
                                                {loadingQueryParams ? <ActivityIndicator style={{ marginTop: 50 }}></ActivityIndicator> :
                                                    <QueryParamsList
                                                        inputStateName={inputStateName}
                                                        edit={edit}
                                                        widget={widget}
                                                        setWidget={setWidget} />}
                                            </View>}
                                            {selectedChildTab === 'h' && <View>
                                                {loadingHeaders ? <ActivityIndicator style={{ marginTop: 50 }}></ActivityIndicator> :
                                                    <HeadersList
                                                        inputStateName={inputStateName}
                                                        edit={edit}
                                                        widget={widget}
                                                        setWidget={setWidget} />}
                                            </View>
                                            }
                                            {selectedChildTab === 'b' && <View style={{ alignSelf: "center", alignItems: "center", width: "100%", marginLeft: 5, marginRight: 5 }}>
                                                <TextInput
                                                    label="INPUT"
                                                    multiline={true}
                                                    disabled={!edit}
                                                    value={widget.inputStates ? widget.inputStates[inputStateName].body : ''}
                                                    style={{ fontSize: 12, width: "95%", minHeight: 300 }}
                                                    mode="outlined"
                                                    onChangeText={text => {
                                                        setBodyInput(text)
                                                    }}
                                                />
                                            </View>}
                                        </View>
                                    </View>}

                                {selectedParentTab === 'r' && <View style={{ marginTop: 10, marginLeft: 5, marginRight: 5, maxHeight: 300, width: 200, }}>
                                    <Text
                                        style={{ fontSize: 12, width: "100%", color: MD2Colors.black, margin: 20 }}>
                                        {widget && widget.inputStates && widget.inputStates[inputStateName] && widget.inputStates[inputStateName].response}
                                    </Text>
                                </View>}

                                <Divider></Divider>
                                {inputStateName !== '' && !loadingRequest && widget && widget.inputStates && widget?.inputStates[inputStateName] && widget?.inputStates[inputStateName].response &&
                                        widget.inputStates[inputStateName].response?.trim() !== '' && <View style={{ width: "100%", alignSelf: "center", margin: "auto", flexDirection: "row" }}>
                                    <Text style={{ fontSize: 12, fontWeight: 700, marginRight: "auto", marginTop: 15, margin: 5 }}>Output Conditions</Text>
                                    {inputStateName === 'CHECK_STATUS' && <Dropdown
                                        disable={!edit}
                                        style={[styles.dropdown, { width: 200, backgroundColor: !edit ? MD2Colors.grey200 : MD2Colors.white }]}
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
                                    />}
                                    {
                                    widget.inputStates &&
                                        widget.inputStates[inputStateName] &&
                                        widget.inputStates[inputStateName].response &&
                                        widget.inputStates[inputStateName].response?.trim() !== '' &&
                                        (
                                            !widget.inputStates[inputStateName].outputStates ||
                                            !widget.inputStates[inputStateName].outputStates[outputStateName] ||
                                            !widget.inputStates[inputStateName].outputStates[outputStateName].conditions ||
                                            widget.inputStates[inputStateName].outputStates[outputStateName].conditions.length === 0) &&
                                        <IconButton style={{ marginLeft: "auto" }} iconColor={MD2Colors.grey800} size={20}
                                            icon={"plus"}
                                            disabled={!edit}
                                            onPress={() => {
                                                if (widget.inputStates && widget.inputStates[inputStateName]) {

                                                    let modifiedWidget = { ...widget };
                                                    if (widget.inputStates[inputStateName].outputStates) {
                                                        widget.inputStates[inputStateName].outputStates = {
                                                            ...widget.inputStates[inputStateName].outputStates,
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
                                                        widget.inputStates[inputStateName].outputStates = {
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
                                                    setWidget(modifiedWidget);
                                                }



                                            }
                                            }></IconButton>}
                                </View>}
                            </View>}
                        {inputStateName?.trim() !== '' &&
                            !loadingRequest &&
                            widget.inputStates &&
                            widget.inputStates[inputStateName] &&
                            widget.inputStates[inputStateName].outputStates &&
                            widget.inputStates[inputStateName].outputStates[outputStateName] &&
                            widget.inputStates[inputStateName].outputStates[outputStateName].conditions &&
                            widget.inputStates[inputStateName].outputStates[outputStateName].conditions.length > 0 && <ScrollView style={{maxHeight:300}}>
                                <View style={{ width: "100%", alignSelf: "center" }}>
                                    <OutputConditionsMappingList
                                        edit={edit}
                                        inputStateName={inputStateName}
                                        outputStateName={outputStateName}
                                        widget={widget}
                                        setWidget={setWidget} />
                                </View>

                            </ScrollView>}
                        {(inputStateName?.trim() !== '' &&
                            !loadingRequest &&
                            widget.inputStates &&
                            widget.inputStates[inputStateName] &&
                            (!widget.inputStates[inputStateName].outputStates ||
                                !widget.inputStates[inputStateName].outputStates[outputStateName] ||
                                !widget.inputStates[inputStateName].outputStates[outputStateName].conditions ||
                                widget.inputStates[inputStateName].outputStates[outputStateName].conditions.length === 0))
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
                                    let apiURLBeforeSave = ''
                                    if (modifiedWidget &&
                                        modifiedWidget.inputStates &&
                                        modifiedWidget.inputStates[inputStateName] &&
                                        modifiedWidget.inputStates[inputStateName].apiUrl) {
                                        apiURLBeforeSave = modifiedWidget.inputStates[inputStateName].apiUrl;
                                        modifiedWidget.inputStates[inputStateName].apiUrl = apiURLBeforeSave;
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
                                    console.log("PRESSED")
                                }}>
                                Save
                            </Chip>
                        </View>}

                    </View>
                }
            </ScrollView>
        </SafeAreaView>);
}

export default Configure;

