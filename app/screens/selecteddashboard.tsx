import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Dimensions, SafeAreaView, View, Text, FlatList } from "react-native";
import { ActivityIndicator, Button, Chip, Divider, FAB, Icon, IconButton, List, MD2Colors, Modal, Portal, Props } from "react-native-paper";
import { ReactNode, useCallback, useEffect, useState } from "react";
import ObjectID from "bson-objectid";
import OnOffSwitchWidget from "@/components/OnOffSwitchWidget";
import { StackScreenHeader } from "@/components/StackScreenHeader";
import OnOffButtonWidget from "@/components/OnOffButtonWidget";
import PushButtonWidget from "@/components/PushButtonWidget";
import ParamsModel from "@/models/ParamsModel";
import { getCurrentUser } from "aws-amplify/auth/cognito";
import { Constants } from "@/constants/constants";
import { mutationDeleteDashboardByDashboardId, mutationUpdateDashboard, queryGetDashBoardByDashBoardId, queryGetDashBoardsAccessByUserId, queryGetMultipleDashboardsByDashboardIds } from "@/service/servicehook";
import { Dropdown } from "react-native-element-dropdown";
import { styles } from "@/assets/styles/styles";

const elementsList = [
    {
        title: "On Off Switch",
        widgetType: "OnOffSwitch",
        node: <OnOffSwitchWidget widget={{
            widgetId: "",
            userId: "",
            readOnly: true,
            widgetType: "OnOffSwitch",
        }} dashboard={undefined} updateDashboard={undefined} updateDashboardDone={false}></OnOffSwitchWidget>
    },
    {
        title: "On Off Button",
        widgetType: "OnOffButton",
        node: <OnOffButtonWidget widget={{
            widgetId: "",
            userId: "",
            readOnly: true,
            widgetType: "OnOffButton",
        }} dashboard={undefined} updateDashboard={undefined} updateDashboardDone={false}></OnOffButtonWidget>
    },
    {
        title: "Push Button",
        widgetType: "PushButton",
        node: <PushButtonWidget widget={{
            widgetId: "",
            userId: "",
            readOnly: true,
            widgetType: "PushButton",
        }} dashboard={undefined} updateDashboard={undefined} updateDashboardDone={false}></PushButtonWidget>
    }
]

const SelectedDashBoard: React.FC<Props> = () => {

    const INIT_USERNAME = "";
    const [userId, setUserId] = useState(INIT_USERNAME);
    const [loading, setLoading] = useState(true);
    const inputParams: Partial<ParamsModel> = useLocalSearchParams();
    const [dashboardId, setDashboardId] = useState("");


    const router = useRouter();
    const INIT: any = {};
    const [selectedDashboard, setSelectedDashboard] = useState(INIT);
    const [nonModifiableDashboard, setNonModifiableDashboard] = useState(INIT);
    const [dashboardError, setDashboardError] = useState(INIT);

    const [dashboardsAccess, setDashboardsAccess] = useState(INIT);
    const [dashboardsAccessIds, setDashboardsAccessIds] = useState(INIT);

    const initDashboards: any = undefined;
    const [dashboards, setDashboards] = useState(initDashboards);


    const INIT_QUERY_KEY: any = Constants.serviceKeys.INIT_QUERY_KEY;
    const [callQueryGetDashBoardByDashBoardId, setCallQueryGetDashBoardByDashBoardId] = useState(INIT_QUERY_KEY);
    const dashboard = queryGetDashBoardByDashBoardId(callQueryGetDashBoardByDashBoardId, dashboardId ? dashboardId : '');
    const [callQueryGetDashBoardsAccessByUserId, setCallQueryGetDashBoardsAccessByUserId] = useState(INIT_QUERY_KEY);
    const [callQueryGetMultipleDashboardsByDashboardIds, setCallQueryGetMultipleDashboardsByDashboardIds] = useState(INIT_QUERY_KEY);
    const dashboardsAccessByUserId = queryGetDashBoardsAccessByUserId(callQueryGetDashBoardsAccessByUserId, userId);
    const { accessibleDashboards } = queryGetMultipleDashboardsByDashboardIds(callQueryGetMultipleDashboardsByDashboardIds, dashboardsAccessIds);

    const [updateDashboardError, setUpdateDashboardError] = useState(INIT);
    const [updateDashboardDone, setUpdateDashboardDone] = useState(false);

    const [deleteDashboardError, setDeleteDashboardError] = useState(INIT);
    const [deleteDashboardDone, setDeleteDashboardDone] = useState(false);

    const { updateDashboard } = mutationUpdateDashboard(setUpdateDashboardError, setUpdateDashboardDone, userId);
    const { deleteDashboardByDashboardId } = mutationDeleteDashboardByDashboardId(setDeleteDashboardError, setDeleteDashboardDone, userId);


    useFocusEffect(useCallback(() => {
        //AsyncStorage.clear();
        const dashboardIdInput: any = inputParams.dashboardId;
        if (!dashboardIdInput) {
            router.push({ pathname: '/screens/dashboards' });
        }
        setDashboardId(dashboardIdInput);
    }, []));

    useEffect(() => {
        if (dashboardId) {
            getCurrentUser().then((user) => {
                setUserId(user.userId);
                setCallQueryGetDashBoardByDashBoardId(Constants.serviceKeys.queryGetDashBoardByDashBoardId + dashboardId);
                setCallQueryGetDashBoardsAccessByUserId(Constants.serviceKeys.queryGetDashboardsAccessByUserId + user.userId);
            });
        }

    }, [dashboardId]);


    useEffect(() => {
        if (dashboard.dashboard !== undefined) {
            let toModifyDashboard: any = dashboard.dashboard;
            if (toModifyDashboard && toModifyDashboard.widgets) {
                const jsonWidgets = JSON.parse(toModifyDashboard.widgets);
                toModifyDashboard = {
                    ...dashboard.dashboard,
                    widgets: jsonWidgets
                }
            }
            setSelectedDashboard(toModifyDashboard);
            setCallQueryGetDashBoardByDashBoardId(INIT_QUERY_KEY);
        }
    }, [dashboard]);


    useEffect(() => {
        //  console.log("############################## dashboardsAccessByUserId ##############################");
        //console.log(dashboardsAccessByUserId);
        if (dashboardsAccessByUserId && dashboardsAccessByUserId.data) {
            const data: any = dashboardsAccessByUserId.data;
            if (data.dashboardIds && data.dashboardIds.length > 0) {
                let modifiedDashboards = [];
                if (dashboards && dashboards.length > 0) {
                    modifiedDashboards = [...dashboards];
                }

                data?.dashboardIds.forEach((dashboardId: any) => {
                    if (dashboardId == null) return;
                    modifiedDashboards.push(
                        {
                            dashboardId: dashboardId,
                            label: `Dashboard ${dashboardId}`,
                            userId: userId,
                            readOnly: false,
                            widgets: {}
                        }
                    );

                });

                setDashboardsAccess(data);
                setDashboardsAccessIds(data.dashboardIds);
                setCallQueryGetDashBoardsAccessByUserId(INIT_QUERY_KEY);
            } else if (dashboardsAccessByUserId && !dashboardsAccessByUserId.data) {
                console.log("No dashboards access found for userId: " + userId);
            }
        }
    }, [dashboardsAccessByUserId]);

    useEffect(() => {
        if (dashboardsAccessIds && dashboardsAccessIds.length > 0) {
            setCallQueryGetMultipleDashboardsByDashboardIds(Constants.serviceKeys.queryGetMultipleDashboardsByDashboardIds + userId);
        }
    }, [dashboardsAccessIds]);

    useEffect(() => {
        console.log(accessibleDashboards)
        if (callQueryGetMultipleDashboardsByDashboardIds !== INIT_QUERY_KEY.toString() && accessibleDashboards && accessibleDashboards.length > 0) {
            setDashboards(accessibleDashboards);
            setCallQueryGetMultipleDashboardsByDashboardIds(INIT_QUERY_KEY);
        }
    }, [accessibleDashboards]);

    useEffect(() => {
        //  console.log("############################## dashboardsAccessByUserId ##############################");
        //console.log(dashboardsAccessByUserId);
        if (dashboardsAccessByUserId && dashboardsAccessByUserId.data) {
            const data: any = dashboardsAccessByUserId.data;
            if (data.dashboardIds &&
                data.dashboardIds.length > 0) {
                let modifiedDashboards = [];
                if (dashboards && dashboards.length > 0) {
                    modifiedDashboards = [...dashboards];
                }

                data?.dashboardIds.forEach((dashboardId: any) => {
                    if (dashboardId == null) return;
                    modifiedDashboards.push(
                        {
                            dashboardId: dashboardId,
                            label: `Dashboard ${dashboardId}`,
                            userId: userId,
                            readOnly: false,
                            widgets: {}
                        }
                    );

                });
                setDashboardsAccess(data);
                setDashboardsAccessIds(data.dashboardIds);
                setCallQueryGetDashBoardsAccessByUserId(INIT_QUERY_KEY);
            } else if (dashboardsAccessByUserId && !dashboardsAccessByUserId.data) {
                console.log("No dashboards access found for userId: " + userId);
            }
        }
    }, [dashboardsAccessByUserId]);

    useEffect(() => {
        if (dashboardsAccessIds && dashboardsAccessIds.length > 0) {
            setCallQueryGetMultipleDashboardsByDashboardIds(Constants.serviceKeys.queryGetMultipleDashboardsByDashboardIds + userId);
        }
    }, [dashboardsAccessIds]);

    useEffect(() => {
        if (callQueryGetMultipleDashboardsByDashboardIds !== INIT_QUERY_KEY.toString() && accessibleDashboards && accessibleDashboards.length > 0) {
            setDashboards(accessibleDashboards);
            setCallQueryGetMultipleDashboardsByDashboardIds(INIT_QUERY_KEY);
        }
    }, [accessibleDashboards]);

    useEffect(() => {
        if (selectedDashboard !== undefined) {
            setLoading(false);
        }
    }, [selectedDashboard]);

    useEffect(() => {
        if (updateDashboardDone
        ) {
            setCallQueryGetDashBoardByDashBoardId(Constants.serviceKeys.queryGetDashBoardByDashBoardId + dashboardId);
            setVisible(false);
            setLoading(false);
            setUpdateDashboardDone(false);
        }
    }, [updateDashboardDone]);

    const [visible, setVisible] = useState(false);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: MD2Colors.grey200 }}>
            <StackScreenHeader title={"SelectedDashBoard"} showBackButton={false}></StackScreenHeader>
            {loading ? <ActivityIndicator style={{ margin: 'auto' }} size={"large"}></ActivityIndicator> :

                <View style={{ width: "100%" }}>
                    <View style={{ flexDirection: "row" }}>
                        {dashboards && dashboards.length > 0 && <Dropdown
                            style={[styles.dropdown, { width: "90%", margin: "auto", marginTop: 25 }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            iconStyle={styles.iconStyle}
                            itemTextStyle={styles.selectedTextStyle}
                            data={dashboards}
                            maxHeight={300}
                            labelField="label"
                            valueField="dashboardId"
                            placeholder="Method"
                            value={dashboardId}
                            onChange={(item: any) => {
                                setDashboardId(item.dashboardId);
                            }}
                        />}
                    </View>

                    {!loading && (!selectedDashboard || !selectedDashboard.widgets || Object.keys(selectedDashboard.widgets)?.length <= 0) && <View style={{ margin: "auto", alignSelf: "center", marginTop: 150 }}>
                        <Chip textStyle={{ color: MD2Colors.white, fontSize: 12 }} style={{
                            backgroundColor: MD2Colors.redA200
                        }} onPress={() => {
                            setVisible(true);
                        }}>Add Widgets</Chip>
                    </View>}

                    <Portal>
                        <Modal visible={visible} onDismiss={() => { setVisible(false) }} style={{

                        }} contentContainerStyle={{
                            margin: "auto",
                            backgroundColor: MD2Colors.white,
                            borderRadius: 5,
                            padding: 5,
                            maxHeight: "90%"
                        }}>

                            <View style={{ alignItems: "center", flexDirection: "row", marginBottom: 20, margin: "auto", width: "95%" }}>
                                <View style={{ alignSelf: 'flex-start', marginLeft: 10 }}>
                                    <Text style={{ color: MD2Colors.white, borderRadius: 5, fontSize: 14, fontWeight: "600", backgroundColor: MD2Colors.grey700, padding: 8 }}>Add Widget</Text>
                                </View>


                                <IconButton
                                    size={12}
                                    style={{
                                        borderRadius: 5,
                                        margin: 1,
                                        backgroundColor: MD2Colors.red500,
                                        marginBottom: 'auto', marginLeft: "auto"
                                    }}
                                    icon={() => <Icon source='close' size={14} color={MD2Colors.white} />}
                                    onPress={() => {
                                        setVisible(false);
                                    }}></IconButton>
                            </View>

                            <Divider />

                            <FlatList
                                key={Math.random()}
                                scrollEnabled={true}
                                data={elementsList}
                                style={{ maxHeight: 430, }}
                                renderItem={({ item }) => <View style={{ alignSelf: "center" }}>
                                    <Text style={{ marginTop: 5, marginLeft: 20, fontWeight: 500 }}>{item.title}</Text>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <View style={{ minWidth: 250 }}>
                                            {item.node}
                                        </View>
                                        <View>
                                            <IconButton
                                                size={14}
                                                style={{
                                                    backgroundColor: MD2Colors.blue400
                                                }}
                                                icon={() => <Icon source='plus' size={18} color={MD2Colors.white} />}
                                                onPress={async () => {
                                                    console.log("Adding widget: ");
                                                    if (dashboardId) {
                                                        let toModifyDashboard = selectedDashboard;

                                                        const widgetID = new ObjectID().toHexString();
                                                        const newWidget = {
                                                            widgetId: widgetID,
                                                            userId: userId,
                                                            readOnly: false,
                                                            widgetType: item.widgetType,
                                                            inputStates: {}
                                                        }

                                                        let modifiedWidgets = {};
                                                        if (selectedDashboard.widgets) {
                                                            modifiedWidgets = selectedDashboard.widgets;
                                                        }
                                                        updateDashboard.mutate(
                                                            {
                                                                ...toModifyDashboard,
                                                                widgets: {
                                                                    ...modifiedWidgets,
                                                                    [newWidget.widgetId]: newWidget
                                                                }
                                                            });
                                                    }

                                                }}></IconButton>
                                        </View>

                                    </View>
                                    <Divider />
                                </View>}
                                keyExtractor={item => item.widgetType}
                            />

                        </Modal>
                    </Portal>


                    <View style={{ alignSelf: "center", marginTop: 10, width: "100%" }}>

                        <View style={{ width: "100%" }}>
                            {selectedDashboard && selectedDashboard.widgets && Object.keys(selectedDashboard.widgets)?.map((widgetId) => {
                                <Text>{widgetId}</Text>
                                if (selectedDashboard.widgets[widgetId].widgetType === "OnOffButton") {
                                    return <OnOffButtonWidget key={widgetId}
                                        widget={selectedDashboard.widgets[widgetId]}
                                        dashboard={selectedDashboard}
                                        updateDashboard={updateDashboard}
                                        updateDashboardDone={updateDashboardDone}></OnOffButtonWidget>
                                } else if (selectedDashboard.widgets[widgetId].widgetType === "PushButton") {
                                    return <PushButtonWidget key={widgetId}
                                        widget={selectedDashboard.widgets[widgetId]}
                                        dashboard={selectedDashboard}
                                        updateDashboard={updateDashboard}
                                        updateDashboardDone={updateDashboardDone}></PushButtonWidget>
                                } else if (selectedDashboard.widgets[widgetId].widgetType === "OnOffSwitch") {
                                    return <OnOffSwitchWidget key={widgetId}
                                        widget={selectedDashboard.widgets[widgetId]}
                                        dashboard={selectedDashboard}
                                        updateDashboard={updateDashboard}
                                        updateDashboardDone={updateDashboardDone}></OnOffSwitchWidget>
                                }
                            })}
                        </View>
                    </View>
                </View>}
            {selectedDashboard && selectedDashboard.widgets && Object.keys(selectedDashboard.widgets)?.length > 0 && <FAB
                icon={() => <Icon source='plus' size={25} color={MD2Colors.white} />}
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 0,
                    bottom: 0,
                    backgroundColor: MD2Colors.redA200
                }}
                onPress={() => setVisible(true)}
            />}
        </SafeAreaView>
    );
};

export default SelectedDashBoard;