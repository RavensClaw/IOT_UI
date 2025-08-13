import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView, View, Text } from "react-native";
import { ActivityIndicator, Chip, Dialog, Divider, FAB, Icon, IconButton, BottomNavigation, MD2Colors, Modal, Portal, TextInput } from "react-native-paper";
import { useCallback, useEffect, useState } from "react";
import { StackScreenHeader } from "@/components/StackScreenHeader";
import DashboardModel from "@/models/DashboardModel";
import ObjectID from "bson-objectid";
import { getCurrentUser } from "aws-amplify/auth/cognito";
import { Constants } from "@/constants/constants";
import {
    mutationCreateDashboard, mutationCreateDashboardsAccess,
    mutationDeleteDashboardByDashboardId,
    mutationUpdateDashboard,
    mutationUpdateDashboardsAccess,
    queryGetDashBoardsAccessByUserId,
    queryGetMultipleDashboardsByDashboardIds
} from "@/service/servicehook";

const Dashboards = () => {

    const INIT_USERNAME = "";
    const initDashboards: any = undefined;
    const [userId, setUserId] = useState(INIT_USERNAME);
    const [dashboardLabel, setDashboardLabel] = useState('');
    const [editedDashboardLabel, setEditedDashboardLabel] = useState('');
    const [editDasboard, setEditDasboard] = useState('');
    const INIT: any = {};
    const INIT_ARRAY: any = [];
    const [dashboardsAccess, setDashboardsAccess] = useState(INIT);
    const [dashboardsAccessIds, setDashboardsAccessIds] = useState(INIT);
    const [nonModifiableDashboardAccess, setNonModifiableDashboardAccess] = useState(INIT);
    const [dashboardsAccessErrors, setDashboardsAccessErrors] = useState(INIT);
    const [dashboardsAccessLoading, setDashboardsAccessLoading] = useState(true);

    const [newDashboard, setNewDashboard] = useState(initDashboards);
    const [dashboards, setDashboards] = useState(initDashboards);
    const [nonModifiableDashboards, setNonModifiableDashboards] = useState(initDashboards);

    const [loading, setLoading] = useState(true);
    const [addDashboardHasError, setAddDashboardHasError] = useState(false);

    const [createDashboardError, setCreateDashboardError] = useState(INIT);
    const [createDashboardDone, setCreateDashboardDone] = useState(false);
    const [createDashboardAccessDone, setCreateDashboardAccessDone] = useState(false);

    const [updateDashboardError, setUpdateDashboardError] = useState(INIT);
    const [updateDashboardDone, setUpdateDashboardDone] = useState(false);
    const [updateDashboardAccessDone, setUpdateDashboardAccessDone] = useState(false);

    const [deleteDashboardError, setDeleteDashboardError] = useState(INIT);
    const [deleteDashboardDone, setDeleteDashboardDone] = useState(false);

    const [addDashboardErrorMessage, setAddDashboardErrorMessage] = useState('');
    const [editDashboardHasError, setEditDashboardHasError] = useState(false);
    const [editDashboardErrorMessage, setEditDashboardErrorMessage] = useState('');

    const INIT_QUERY_KEY: any = Constants.serviceKeys.INIT_QUERY_KEY;
    const [callQueryGetDashBoardsAccessByUserId, setCallQueryGetDashBoardsAccessByUserId] = useState(INIT_QUERY_KEY);
    const [callQueryGetMultipleDashboardsByDashboardIds, setCallQueryGetMultipleDashboardsByDashboardIds] = useState(INIT_QUERY_KEY);
    const dashboardsAccessByUserId: any = queryGetDashBoardsAccessByUserId(callQueryGetDashBoardsAccessByUserId, userId);

    const { createDashboardsAccessByUserId } = mutationCreateDashboardsAccess(setDashboardsAccessErrors, setCreateDashboardAccessDone);
    const { updateDashboardsAccessByUserId } = mutationUpdateDashboardsAccess(setDashboardsAccessErrors, setUpdateDashboardAccessDone);
    const { accessibleDashboards } = queryGetMultipleDashboardsByDashboardIds(callQueryGetMultipleDashboardsByDashboardIds, dashboardsAccessIds);
    const { createDashboard } = mutationCreateDashboard(setCreateDashboardError, setCreateDashboardDone, userId);
    const { updateDashboard } = mutationUpdateDashboard(setUpdateDashboardError, setUpdateDashboardDone, userId);
    const { deleteDashboardByDashboardId } = mutationDeleteDashboardByDashboardId(setDeleteDashboardError, setDeleteDashboardDone, userId);


    const router = useRouter();
    useFocusEffect(
        useCallback(() => {
            //AsyncStorage.clear();
            setUserId(INIT_USERNAME);
            setCallQueryGetDashBoardsAccessByUserId(INIT_QUERY_KEY);
            setCallQueryGetMultipleDashboardsByDashboardIds(INIT_QUERY_KEY);

            setDashboardsAccess(null);
            setNonModifiableDashboardAccess(null);
            setDashboardsAccessIds([]);

            setLoading(true);
            getCurrentUser().then((user) => {
                const userId: any = user.userId;
                setUserId(userId);
            })

        }, [])
    );

    useEffect(() => {
        if(userId && userId !== INIT_USERNAME) {
            setCallQueryGetDashBoardsAccessByUserId(Constants.serviceKeys.queryGetDashboardsAccessByUserId + userId);
        }
    },[userId])

    useEffect(() => {
        if(callQueryGetDashBoardsAccessByUserId !== INIT_QUERY_KEY.toString()) {
        if (dashboardsAccessByUserId && dashboardsAccessByUserId?.data) {
            let data: any = dashboardsAccessByUserId.data
            if (data.dashboardIds &&
                data.dashboardIds.length > 0) {
                let modifiedDashboards = [];
                if (dashboards && dashboards.length > 0) {
                    modifiedDashboards = [...dashboards];
                }

                data.dashboardIds.forEach((dashboardId: any) => {
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

                setDashboardsAccess(dashboardsAccessByUserId.data);
                setNonModifiableDashboardAccess(dashboardsAccessByUserId.data);
                setDashboardsAccessIds(data.dashboardIds);
                setCallQueryGetDashBoardsAccessByUserId(INIT_QUERY_KEY);
            }
        } else {
            console.log("No dashboards access found for userId: " + userId);
           // setLoading(false);
        }}

    }, [dashboardsAccessByUserId]);

    useEffect(() => {
        if (dashboardsAccessIds && dashboardsAccessIds.length > 0) {
            setCallQueryGetMultipleDashboardsByDashboardIds(Constants.serviceKeys.queryGetMultipleDashboardsByDashboardIds + userId);
        }
    }, [dashboardsAccessIds]);

    useEffect(() => {
        if (callQueryGetMultipleDashboardsByDashboardIds !== INIT_QUERY_KEY.toString()) {
            setDashboards(accessibleDashboards);
            setCallQueryGetMultipleDashboardsByDashboardIds(INIT_QUERY_KEY);
            setLoading(false);
        }
    }, [accessibleDashboards]);



    useEffect(() => {
        if (createDashboardAccessDone) {
            console.log("Creating Dashboard Access: " + newDashboard.dashboardId);
            setCallQueryGetMultipleDashboardsByDashboardIds(INIT_QUERY_KEY);
            createDashboard.mutate(newDashboard);
            console.log("DONE CREATE DASHBOARD ACCESS: " + newDashboard.dashboardId);
            setNewDashboard(INIT);
            setCreateDashboardAccessDone(false);
        }
    }, [createDashboardAccessDone]);


    useEffect(() => {
        if (createDashboardDone) {
            setDashboardLabel('');
            console.log("********************************************");
            console.log("Create Dashboard Done: " + createDashboardDone);
            console.log("CallQueryGetDashBoardsAccessByUserId: " + callQueryGetDashBoardsAccessByUserId);
            console.log("callQueryGetMultipleDashboardsByDashboardIds: " + callQueryGetMultipleDashboardsByDashboardIds);
            setCallQueryGetDashBoardsAccessByUserId(Constants.serviceKeys.queryGetDashboardsAccessByUserId + userId);
            setCreateDashboardDone(false);
            setVisible(false);
            //setLoading(false);
        }
    }, [createDashboardDone]);


    useEffect(() => {
        console.log('....................................................');
        if (updateDashboardAccessDone) {
            console.log(':::::::::::::::::::::::::::::::::::::::::::::::');

            if (newDashboard && Object.keys(newDashboard).length > 0) {
                console.log("INSIDE IF CONDITION");
                console.log("Update Dashboard Access: " + newDashboard.dashboardId);
                createDashboard.mutate(newDashboard);
                console.log("DONE UPDATE DASHBOARD ACCESS: " + newDashboard.dashboardId);
                setNewDashboard(INIT);
                setCreateDashboardAccessDone(false);
            } else {
                console.log("INSIDE ELSE CONDITION");
                let modifiedDashboards: any[] = []
                dashboards?.map((dashboard: DashboardModel) => {
                    if (dashboard.dashboardId === deleteDashboard.dashboardId) {
                        console.log("Deleting Dashboard: " + dashboard.dashboardId);
                    } else {
                        modifiedDashboards.push(dashboard);
                    }
                });
                setDashboards(modifiedDashboards);
                setDeleteDashboard(null);
                setShowConfirmDelete(false);
            }
            setCallQueryGetDashBoardsAccessByUserId(Constants.serviceKeys.queryGetDashboardsAccessByUserId + userId);
            setUpdateDashboardAccessDone(false);
        }
    }, [updateDashboardAccessDone]);

    useEffect(() => {
        if (updateDashboardDone) {
            setCallQueryGetDashBoardsAccessByUserId(Constants.serviceKeys.queryGetDashboardsAccessByUserId + userId);
            setUpdateDashboardDone(false);
            setLoading(false);
        }
    }, [updateDashboardDone]);

    useEffect(() => {
        if (dashboardsAccessIds &&
            dashboardsAccessIds.length > 0 &&
            deleteDashboardDone
        ) {
            updateDashboardsAccessByUserId.mutate({
                dashboardIds: dashboardsAccess.dashboardIds.filter((id: string) => id !== deleteDashboard.dashboardId),
                userId: userId,
            });

            setDeleteDashboardDone(false);
        }
    }, [deleteDashboardDone]);

    const [visible, setVisible] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [deleteDashboard, setDeleteDashboard] = useState(INIT);


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: MD2Colors.grey200 }}>
            <StackScreenHeader title={"Dashboards"} showBackButton={false}></StackScreenHeader>
            {loading ? <ActivityIndicator style={{ margin: 'auto' }} size={"large"}></ActivityIndicator> :

                <View style={{ width: "100%" }}>

                    <Portal>
                        <Dialog
                            visible={showConfirmDelete} onDismiss={() => { setShowConfirmDelete(false) }}
                            style={{ padding: 10, backgroundColor: MD2Colors.white, minWidth: 300, alignContent: "center", alignSelf: "center" }}>
                            <View style={{}}>
                                <View style={{ flexDirection: "row", alignSelf: "center", marginBottom: 30 }}>
                                    <Text style={{ fontSize: 12 }}>Are you sure you want to delete the dashboard {deleteDashboard?.label}</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignSelf: "center" }}>
                                    <Chip
                                        textStyle={{ fontSize: 12 }}
                                        style={{ backgroundColor: MD2Colors.red200 }} onPress={() => {
                                            setShowConfirmDelete(false);
                                        }}>No</Chip>
                                    <Chip mode='outlined'
                                        textStyle={{ fontSize: 12 }}
                                        style={{ marginLeft: 10 }} onPress={async () => {
                                            setLoading(true);
                                            deleteDashboardByDashboardId.mutate({
                                                dashboardId: deleteDashboard.dashboardId,
                                            });
                                        }}>Yes</Chip>
                                </View>
                            </View>
                        </Dialog>
                    </Portal>

                    <Portal>
                        <Modal visible={visible} onDismiss={() => { setVisible(false) }} style={{

                        }} contentContainerStyle={{
                            margin: "auto",
                            backgroundColor: MD2Colors.white,
                            borderRadius: 5,
                            padding: 5,
                            maxHeight: "90%",
                        }}>
                            <View style={{ alignItems: "center", flexDirection: "row", marginBottom: 20, margin: "auto", width: "100%" }}>
                                <View style={{ alignSelf: 'flex-start', }}>
                                    <Text style={{ color: MD2Colors.grey800, borderRadius: 5, fontSize: 12, padding: 8, fontWeight: "600" }}>Add Dashboard</Text>
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
                            <Divider style={{ marginTop: 5 }} />

                            {addDashboardHasError && <Chip mode="outlined"
                                style={{ margin: 5, borderColor: MD2Colors.red300, padding: 5 }}
                                textStyle={{ color: MD2Colors.grey700, fontSize: 12 }}
                                icon={() => <Icon source='information-outline' size={20} color={MD2Colors.red400} />}>{addDashboardErrorMessage}</Chip>}


                            <View style={{ margin: "auto", flexDirection: "row" }}>
                                <TextInput
                                    label="Dashboard Name"
                                    mode='outlined'
                                    value={dashboardLabel ? dashboardLabel : ''}
                                    style={{
                                        width: 200,
                                        marginBottom: 5,
                                        fontSize: 12,
                                        color: MD2Colors.black
                                    }}
                                    onChangeText={(text) => {
                                        if (text) {
                                            setDashboardLabel(text);
                                            //setWidget(modifiedWidget);
                                        }
                                    }}
                                />
                                <IconButton
                                    size={14}
                                    style={{
                                        backgroundColor: MD2Colors.blue400,
                                        marginTop: 15
                                    }}
                                    icon={() => <Icon source='plus' size={18} color={MD2Colors.white} />}
                                    onPress={async () => {
                                        setLoading(true);
                                        if (dashboardLabel && dashboardLabel?.trim() !== '') {
                                            const dashboardId: string = new ObjectID().toHexString();

                                            const newDashboard: DashboardModel = {
                                                dashboardId: dashboardId,
                                                label: dashboardLabel,
                                                description: null,
                                                lastModifiedBy: userId
                                            }
                                            setNewDashboard(newDashboard);

                                            if (dashboardsAccess && dashboardsAccess.dashboardIds && dashboardsAccess.dashboardIds.length > 0) {
                                                updateDashboardsAccessByUserId.mutate({
                                                    dashboardIds: [...dashboardsAccess.dashboardIds, dashboardId],
                                                    userId: userId,
                                                });
                                            } else {
                                                createDashboardsAccessByUserId.mutate({
                                                    dashboardIds: [dashboardId],
                                                    userId: userId,
                                                });
                                            }
                                        } else {
                                            setAddDashboardHasError(true);
                                            setAddDashboardErrorMessage('Please enter dashboard name.');
                                        }
                                    }}></IconButton>
                            </View>

                        </Modal>
                    </Portal>


                    {!loading && (!dashboards || dashboards?.length === 0) && <View style={{
                        margin: 'auto',
                        marginTop: 200,

                    }}>
                        <Chip textStyle={{ color: MD2Colors.white, fontSize: 12 }} style={{
                            backgroundColor: MD2Colors.indigoA200
                        }} onPress={() => {
                            setVisible(true);
                        }}>Add Dashboard</Chip></View>}

                    <View style={{ alignSelf: "center", marginTop: 10, width: "100%" }}>
                        <View style={{ width: "100%", }}>
                            {dashboards && dashboards?.length > 0 && dashboards?.map((dashboard: any) => {
                                return <View key={dashboard.dashboardId} style={{ margin: 10, marginBottom: 5, marginTop: 5 }}>

                                    <View style={{
                                        width: "100%", minHeight: 140, backgroundColor: MD2Colors.white,
                                        shadowColor: "#000",
                                        shadowOffset: {
                                            width: 0,
                                            height: 2,
                                        },
                                        borderRadius: 5,
                                        shadowOpacity: 0.25,
                                        shadowRadius: 3,
                                        elevation: 1,
                                    }}>
                                        {editDashboardHasError && <Chip mode="outlined"
                                            style={{ margin: 5, borderColor: MD2Colors.red300, padding: 5 }}
                                            textStyle={{ color: MD2Colors.grey700, fontSize: 10, }}
                                            icon={() => <Icon source='information-outline' size={20} color={MD2Colors.red400} />}>{editDashboardErrorMessage}</Chip>}
                                        <View style={{ flexDirection: "row", width: "100%" }}>
                                            {editDasboard === dashboard.dashboardId ? <TextInput
                                                label="Dashboard Name"
                                                mode='outlined'
                                                value={editedDashboardLabel ? editedDashboardLabel : ''}
                                                style={{
                                                    width: 170,
                                                    margin: 5,
                                                    marginTop: 0,
                                                    fontSize: 12,
                                                    color: MD2Colors.black
                                                }}
                                                onChangeText={(text) => {
                                                    if (text) {
                                                        setEditedDashboardLabel(text);
                                                    } else {
                                                        setEditedDashboardLabel('');
                                                    }
                                                }}
                                            /> : <Text style={{ textAlign: "center", fontSize: 16, marginRight: "auto", margin: 10 }}>{dashboard.label}</Text>}
                                            {editDasboard === dashboard.dashboardId ? <IconButton mode='outlined' style={{ marginLeft: "auto", borderColor: MD2Colors.red300 }} size={16} icon={() => <Icon source='delete' size={16} color={MD2Colors.grey800} />}
                                                onPress={() => {
                                                    setDeleteDashboard(dashboard);
                                                    setShowConfirmDelete(true);
                                                }}></IconButton> :
                                                <IconButton mode='outlined' style={{ marginLeft: "auto", borderColor: MD2Colors.yellow800 }} size={16} icon={() => <Icon source='application-edit' size={16} color={MD2Colors.grey800} />}
                                                    onPress={() => {
                                                        setEditDasboard(dashboard.dashboardId);
                                                        setEditedDashboardLabel(dashboard.label);
                                                    }}></IconButton>}
                                        </View>

                                        <View style={{ margin: "auto", marginTop: 40, flexDirection: "row", }}>
                                            {dashboard.widgets && Object.keys(JSON.parse(dashboard.widgets)).length > 0 ?
                                                <Chip mode="outlined" style={{
                                                    borderColor: MD2Colors.lightGreen500,
                                                }}
                                                    textStyle={{ color: MD2Colors.grey800, fontSize: 12, fontWeight: 600 }}
                                                    onPress={() => {
                                                        console.log(":::::::::::::::::::::: " + dashboard.dashboardId);
                                                        router.push({
                                                            pathname: `/screens/selecteddashboard`, params: {
                                                                "dashboardId": dashboard.dashboardId
                                                            }
                                                        }); // Remove the braces in params
                                                    }}
                                                >Widgets: {dashboard.widgets && Object.keys(JSON.parse(dashboard.widgets)).length}</Chip>
                                                : <Chip mode="outlined" style={{
                                                    width: 120,
                                                    borderColor: MD2Colors.redA200,
                                                }}
                                                    textStyle={{ color: MD2Colors.grey800, fontSize: 12, fontWeight: 600 }}
                                                    icon={() => <Icon source='plus' size={18} color={MD2Colors.grey800} />}
                                                    onPress={() => {
                                                        console.log(":::::::::::::::::::::: " + dashboard.dashboardId);
                                                        router.push({
                                                            pathname: `/screens/selecteddashboard`, params: {
                                                                "dashboardId": dashboard.dashboardId
                                                            }
                                                        }); // Remove the braces in params
                                                    }}
                                                >Add Widget</Chip>
                                            }

                                        </View>

                                        {editDasboard === dashboard.dashboardId && <View style={{ margin: 30 }}>
                                            <View style={{ flexDirection: "row", alignSelf: "center" }}>
                                                {/*<Chip icon={() => <Icon source="cancel" size={14} color={MD2Colors.red400} />} mode="outlined"
                                                    style={{

                                                    }}
                                                    textStyle={{ fontSize: 12 }}
                                                    onPress={() => {
                                                        setEditDashboardHasError(false);
                                                        setEditDashboardErrorMessage('');
                                                        setNonModifiableDashboards(nonModifiableDashboards);
                                                        setEditedDashboardLabel('');
                                                        setEditDasboard('');
                                                    }}>
                                                    Cancel
                                                </Chip>
                                                <Chip icon={() => <Icon source="content-save" size={14} color={MD2Colors.grey800} />} mode="flat"
                                                    style={{
                                                        marginLeft: 5,
                                                        backgroundColor: MD2Colors.amber500
                                                    }}
                                                    textStyle={{ fontSize: 12 }}
                                                    onPress={async () => {
                                                        setEditDashboardHasError(false);
                                                        setEditDashboardErrorMessage('');

                                                        if (editedDashboardLabel && editedDashboardLabel?.trim() !== '') {

                                                            if (dashboards) {
                                                                let toModifyDashboard = dashboards[dashboardId];
                                                                if (toModifyDashboard) {
                                                                    toModifyDashboard = {
                                                                        ...toModifyDashboard,
                                                                        label: editedDashboardLabel
                                                                    }
                                                                }
                                                                //await AsyncStorage.setItem(dashboardId, JSON.stringify(toModifyDashboard));

                                                            }
                                                            setEditDasboard('');
                                                            setEditedDashboardLabel('');
                                                            console.log("PRESSED")
                                                        } else {
                                                            setEditDashboardHasError(true);
                                                            setEditDashboardErrorMessage('Please enter dashboard name.');
                                                        }

                                                    }}>
                                                    Save
                                                </Chip>*/}
                                                <Chip mode="flat"
                                                    style={{
                                                        marginLeft: 5,
                                                        backgroundColor: MD2Colors.blue500
                                                    }}
                                                    textStyle={{ color: MD2Colors.white, fontSize: 12 }}
                                                    onPress={async () => {
                                                        setEditDashboardHasError(false);
                                                        setEditDashboardErrorMessage('');
                                                        if (editedDashboardLabel && editedDashboardLabel?.trim() !== '') {
                                                            if (dashboards) {
                                                                let toModifyDashboard = dashboard;
                                                                if (toModifyDashboard) {
                                                                    toModifyDashboard = {
                                                                        ...toModifyDashboard,
                                                                        label: editedDashboardLabel
                                                                    }
                                                                    if (toModifyDashboard.widgets) {
                                                                        try {
                                                                            toModifyDashboard.widgets = JSON.parse(toModifyDashboard.widgets);
                                                                        } catch (e) {
                                                                            console.log(e);
                                                                        }

                                                                    }

                                                                    updateDashboard.mutate(
                                                                        toModifyDashboard
                                                                    );
                                                                    setLoading(true);
                                                                }

                                                                /*const modifiedDashboardsObject: any = {
                                                                    ...dashboards,
                                                                    [dashboardId]: toModifyDashboard
                                                                };
                                                                setDashboards(modifiedDashboardsObject);*/

                                                            }
                                                            setEditDasboard('');
                                                            setEditedDashboardLabel('');
                                                        } else {
                                                            setEditDashboardHasError(true);
                                                            setEditDashboardErrorMessage('Please enter dashboard name.');
                                                        }
                                                    }}>
                                                    Done
                                                </Chip>
                                            </View>
                                        </View>}
                                    </View>

                                </View>

                            })}
                        </View>
                    </View>
                </View>}
            {dashboards && dashboards?.length > 0 && <FAB
                icon={() => <Icon source='plus' size={25} color={MD2Colors.white} />}
                size={'medium'}
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 0,
                    bottom: 80,
                    backgroundColor: MD2Colors.indigoA200
                }}
                onPress={() => setVisible(true)}
            />}

        </SafeAreaView>
    );
};

export default Dashboards;