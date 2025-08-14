import { MutationKey, QueryKey, useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query"
import { generateClient } from "aws-amplify/api"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Schema } from "../amplify/data/resource";
import { Constants } from "@/constants/constants";

export const queryGetDashBoardsAccessByUserId = (key: QueryKey, userId: string) => {

    const client = generateClient<Schema>({
        authMode: "userPool",
    });
    const dashboardsAccessByUserId = useQuery({
        queryKey: [key],
        enabled: (
            (key.toString().indexOf(Constants.serviceKeys.queryGetDashboardsAccessByUserId) > -1) &&
            userId?.trim() !== ''),
        networkMode: "always",
        queryFn: async () => {
            const { data: dashboardsAccess, errors: errors } = await client.models.DashboardsAccess.get({
                userId: userId
            });
            if (errors) {
                throw new Error(JSON.stringify(errors));
            }
            return dashboardsAccess;
        },
    })
    return dashboardsAccessByUserId;
};

export const mutationCreateDashboardsAccess = (
    setError: React.Dispatch<React.SetStateAction<any>>,
    setCreateDashboardAccessDone: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const queryClient = useQueryClient();
    const client = generateClient<Schema>({
        authMode: "userPool",
    });
    const createDashboardsAccessByUserId = useMutation({
        networkMode: "always",
        mutationFn: async (input: any) => {
            const { data: createDashboardsAccessResponse, errors: createDashboardsAccessErrors } = await client.models.DashboardsAccess.create(input);
            if (createDashboardsAccessErrors) {
                throw new Error(JSON.stringify(createDashboardsAccessErrors));
            }
            return createDashboardsAccessResponse;
        },
        onSettled: async (data, variables, context) => {
            setCreateDashboardAccessDone(true);
        },
        onSuccess: async (data, variables, context) => {
            queryClient.removeQueries();
        },
        onError: async (error, variables, context) => {
            if (error.toString().indexOf("network error") > -1) {
                // Some logic to handle network error    
            }
            await AsyncStorage.setItem("IOT" + variables.userId, JSON.stringify({
                [Constants.CREATE_DASHBOARDS_ACCESS]: variables
            }));
            queryClient.setQueryData([Constants.serviceKeys.queryGetDashboardsAccessByUserId + variables.userId] as QueryKey, (old: any) => {
                return {
                    variables
                }
            });
        }
    });
    return { createDashboardsAccessByUserId };
};

export const mutationUpdateDashboardsAccess = (
    setError: React.Dispatch<React.SetStateAction<any>>,
    setUpdateDashboardAccessDone: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const queryClient = useQueryClient();
    const client = generateClient<Schema>({
        authMode: "userPool",
    });
    const updateDashboardsAccessByUserId = useMutation({
        networkMode: "always",
        mutationFn: async (input: any) => {
            const { data: updateDashboardsAccessResponse, errors: updateDashboardsAccessErrors } = await client.models.DashboardsAccess.update(input);
            if (updateDashboardsAccessErrors) {
                throw new Error(JSON.stringify(updateDashboardsAccessErrors));
            }
            return updateDashboardsAccessResponse;
        },
        onSuccess: async (data, variables, context) => {
            queryClient.removeQueries();
        },
        onSettled: async (data, variables, context) => {
            setUpdateDashboardAccessDone(true);
        },
        onError: async (error, variables, context) => {
            if (error.toString().indexOf("network error") > -1) {
                // Some logic to handle network error
            }

            const getExistingDashboardsAccess = await AsyncStorage.getItem("IOT" + variables.userId);
            if (getExistingDashboardsAccess) {
                const existingDashboardsAccess = JSON.parse(getExistingDashboardsAccess);
                if (existingDashboardsAccess && existingDashboardsAccess.CREATE_DASHBOARDS_ACCESS) {
                    await AsyncStorage.setItem("IOT" + variables.userId, JSON.stringify({
                        [Constants.CREATE_DASHBOARDS_ACCESS]: variables
                    }));
                } else {
                    await AsyncStorage.setItem("IOT" + variables.userId, JSON.stringify({
                        [Constants.UPDATE_DASHBOARDS_ACCESS]: variables
                    }));
                }
            }
            queryClient.setQueryData([Constants.serviceKeys.queryGetDashboardsAccessByUserId + variables.userId] as QueryKey, (old: any) => {
                return {
                    ...old,
                    variables
                }
            });
        }
    })
    return { updateDashboardsAccessByUserId };
};

export const mutationDeleteDashboardsAccessByUserId = (
    setError: React.Dispatch<React.SetStateAction<any>>,
    setDeleteDashboardAccessDone: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const queryClient = useQueryClient();

    const client = generateClient<Schema>({
        authMode: "userPool",
    });
    const deleteDashboardsAccessByUserId = useMutation({
        networkMode: "always",
        mutationFn: async ({ userId }: { userId: string }) => {
            setDeleteDashboardAccessDone(false);
            const { data: deleteDashboardsAccessByUserId, errors: deleteDashboardsAccessErrors } = await client.models.DashboardsAccess.delete({
                userId: userId,
            });
            if (deleteDashboardsAccessErrors) {
                throw new Error(JSON.stringify(deleteDashboardsAccessErrors));
            }
        },
        onError: async (error, variables, context) => {
            if (error.toString().indexOf("network error") > -1) {

            }

            await AsyncStorage.setItem("IOT" + variables.userId, JSON.stringify({
                [Constants.DELETE_DASHBOARDS_ACCESS]: variables
            }));
        },
        onSuccess: async (data, variables, context) => {
            queryClient.removeQueries();
        },
        onSettled: async (data, variables, context) => {
            setDeleteDashboardAccessDone(true);
        },
    })
    return { deleteDashboardsAccessByUserId };
};

export const queryGetDashBoardByDashBoardId = (key: QueryKey, dashboardId: string) => {
    const client = generateClient<Schema>({
        authMode: "userPool",
    });
    const { data: dashboard, error: errors } = useQuery({
        queryKey: [key],
        enabled: (
            (key.toString().indexOf(Constants.serviceKeys.queryGetDashBoardByDashBoardId) > -1) &&
            dashboardId?.trim() !== ''),
        networkMode: "always",
        queryFn: async () => {
            const { data: dashboard, errors: errors } = await client.models.Dashboard.get({
                dashboardId: dashboardId
            });
            if (errors) {
                throw new Error(JSON.stringify(errors));
            }
            return dashboard;
        }
    });
    return { dashboard };
};

export const queryGetMultipleDashboardsByDashboardIds = (key: QueryKey, dashboardIds: string[]) => {
    const client = generateClient<Schema>({
        authMode: "userPool",
    });
    const { data: accessibleDashboards, error: errors } = useQuery({
        queryKey: [key],
        enabled: (
            (key.toString().indexOf(Constants.serviceKeys.queryGetMultipleDashboardsByDashboardIds) > -1) &&
            dashboardIds.length > 0),
        networkMode: "always",
        queryFn: async () => {
            const { data: dashboards, errors: errors } = await client.queries.getMultipleDashboardsByDashboardIds({
                dashboardIds: dashboardIds
            });
            return dashboards;
        },
    });
    return { accessibleDashboards };
};

export const mutationCreateDashboard = (
    setError: React.Dispatch<React.SetStateAction<any>>,
    setCreateDashboardDone: React.Dispatch<React.SetStateAction<boolean>>,
    userId: string
) => {
    const queryClient = useQueryClient();
    const client = generateClient<Schema>({
        authMode: "userPool",
    });
    const createDashboard = useMutation({
        networkMode: "always",
        mutationFn: async (input: any) => {
            setCreateDashboardDone(false);
            const { data: createDashboardResponse, errors: createDashboardErrors } = await client.models.Dashboard.create(input);
            if (createDashboardErrors) {
                throw new Error(JSON.stringify(createDashboardErrors));

            }
            return createDashboardResponse;
        },
        onSuccess: async (data, variables, context) => {
            await queryClient.resetQueries({
                queryKey: [
                    Constants.serviceKeys.queryGetMultipleDashboardsByDashboardIds + userId] as QueryKey,
                exact: true,
            });
            await queryClient.resetQueries({
                queryKey: [
                    Constants.serviceKeys.queryGetDashBoardByDashBoardId + variables.dashboardId] as QueryKey,
                exact: true,
            });
        },
        onError: async (error, variables, context) => {
            if (error.toString().indexOf("network error") > -1) {
                // Some logic to handle network error
            }

            await AsyncStorage.setItem("IOT" + variables.dashboardId, JSON.stringify({
                [Constants.CREATE_DASHBOARD]: variables
            }));
            queryClient.setQueryData([Constants.serviceKeys.queryGetDashBoardByDashBoardId + variables.dashboardId] as QueryKey, (old: any) => {
                return variables;
            });

            queryClient.setQueryData([Constants.serviceKeys.queryGetMultipleDashboardsByDashboardIds + userId] as QueryKey, (old: any) => {
                return {
                    ...old,
                    variables
                };
            });
        },
        onSettled: async (data, variables, context) => {
            setCreateDashboardDone(true);
        },
    })
    return { createDashboard };
};

export const mutationUpdateDashboard = (
    setError: React.Dispatch<React.SetStateAction<any>>,
    setUpdateDashboardDone: React.Dispatch<React.SetStateAction<boolean>>,
    userId: string
) => {
    const queryClient = useQueryClient();
    const client = generateClient<Schema>({
        authMode: "userPool",
    });
    const updateDashboard = useMutation({
        networkMode: "always",
        mutationFn: async (input: any) => {
            userId = userId;
            setUpdateDashboardDone(false);
            if (input.widgets) {
                input = {
                    ...input,
                    widgets: JSON.stringify(input.widgets)
                }
            }

            const { data: updateDashboardResponse, errors: updateDashboardErrors } = await client.models.Dashboard.update(input);
            if (updateDashboardErrors) {
                throw new Error(JSON.stringify(updateDashboardErrors));
            }
            return updateDashboardResponse;
        },
        onSuccess: async (data, variables, context) => {
            await queryClient.resetQueries({
                queryKey: [
                    Constants.serviceKeys.queryGetMultipleDashboardsByDashboardIds + userId] as QueryKey,
                exact: true,
            });
            await queryClient.resetQueries({
                queryKey: [
                    Constants.serviceKeys.queryGetDashBoardByDashBoardId + variables.dashboardId] as QueryKey,
                exact: true,
            });
            //queryClient.clear();
            /*await queryClient.invalidateQueries({ queryKey: [
                Constants.serviceKeys.queryGetMultipleDashboardsByDashboardIds+userId,
                Constants.serviceKeys.queryGetDashBoardByDashBoardId+variables.dashboardId
            ] });*/

        },
        onError: async (error, variables, context) => {
            if (error.toString().indexOf("network error") > -1) {
                // Some logic to handle network error
            }

            const getExistingDashboard = await AsyncStorage.getItem("IOT" + variables.dashboardId);
            if (getExistingDashboard) {
                const existingDashboard = JSON.parse(getExistingDashboard);
                if (existingDashboard && existingDashboard.CREATE_DASHBOARD) {
                    await AsyncStorage.setItem("IOT" + variables.dashboardId, JSON.stringify({
                        [Constants.CREATE_DASHBOARD]: variables
                    }));
                } else {
                    await AsyncStorage.setItem("IOT" + variables.dashboardId, JSON.stringify({
                        [Constants.UPDATE_DASHBOARD]: variables
                    }));
                }
            }
            queryClient.setQueryData([Constants.serviceKeys.queryGetDashBoardByDashBoardId + variables.dashboardId] as QueryKey, (old: any) => {
                return {
                    ...old,
                    variables
                }
            });

            queryClient.setQueryData([Constants.serviceKeys.queryGetMultipleDashboardsByDashboardIds + userId] as QueryKey, (old: any) => {
                let allDashboards: any[] = [];
                if (old && old.length > 0) {

                    old.map((dashboard: any) => {
                        if (dashboard.dashboardId === variables.dashboardId) {
                            allDashboards.push(variables);
                        } else {
                            allDashboards.push(dashboard);
                        }
                    });
                }
                return allDashboards;
            });
        },
        onSettled: async (data, variables, context) => {
            setUpdateDashboardDone(true);
        },

    })
    return { updateDashboard };
};

export const mutationDeleteDashboardByDashboardId = (
    setError: React.Dispatch<React.SetStateAction<any>>,
    setDeleteDashboardDone: React.Dispatch<React.SetStateAction<boolean>>,
    userId: string
) => {
    const queryClient = useQueryClient();

    const client = generateClient<Schema>({
        authMode: "userPool",
    });
    const deleteDashboardByDashboardId = useMutation({
        networkMode: "always",
        mutationFn: async ({ dashboardId }: { dashboardId: string }) => {
            setDeleteDashboardDone(false);
            const { data: deleteDashboardResponse, errors: deleteDashboardErrors } = await client.models.Dashboard.delete({
                dashboardId: dashboardId,
            });
            if (deleteDashboardErrors) {
                throw new Error(JSON.stringify(deleteDashboardErrors));
            }
        },
        onError: async (error, variables, context) => {
            if (error.toString().indexOf("network error") > -1) {
                //Some logic to handle network error
            }

            await AsyncStorage.setItem("IOT" + variables.dashboardId, JSON.stringify({
                [Constants.DELETE_DASHBOARD]: variables
            }));

            queryClient.setQueryData([Constants.serviceKeys.queryGetMultipleDashboardsByDashboardIds + userId] as QueryKey, (old: any) => {
                let allDashboards: any[] = [];
                if (old && old.length > 0) {

                    old.map((dashboard: any) => {
                        if (dashboard.dashboardId === variables.dashboardId) {
                        } else {
                            allDashboards.push(dashboard);
                        }
                    });
                }
                return allDashboards;
            });
        },
        onSuccess: async (data, variables, context) => {
            await queryClient.resetQueries({
                queryKey: [
                    Constants.serviceKeys.queryGetMultipleDashboardsByDashboardIds + userId] as QueryKey,
                exact: true,
            });
            await queryClient.resetQueries({
                queryKey: [
                    Constants.serviceKeys.queryGetDashBoardByDashBoardId + variables.dashboardId] as QueryKey,
                exact: true,
            });
        },
        onSettled: async (data, variables, context) => {
            setDeleteDashboardDone(true);
        },
    })
    return { deleteDashboardByDashboardId };
};

export const syncOffline = async () => {
    const client = generateClient<Schema>({
        authMode: "userPool",
    });
    const allCompleted: Promise<any>[] = [];
    let parsedKeys: string[] = [];
    AsyncStorage.getAllKeys().then(async (keys) => {
        keys.forEach(async (key) => {
            if (key.startsWith("IOT")) {
                try {
                    const jsonString = await AsyncStorage.getItem(key);
                    const jsonData = jsonString ? JSON.parse(jsonString) : null;
                    if (jsonData) {
                        parsedKeys.push(key);
                        console.log(`Processed data for key ${key}:`, jsonData);
                        Object.keys(jsonData).forEach(async (subKey) => {
                            console.log(`SubKey: ${subKey}, Value: ${jsonData[subKey]}`);
                            if (subKey === Constants.DELETE_DASHBOARDS_ACCESS) {
                                const deleteDashboardAccessInput = jsonData[subKey];
                                allCompleted.push(
                                    client.models.DashboardsAccess.delete(deleteDashboardAccessInput)
                                );
                            } else if (subKey === Constants.CREATE_DASHBOARDS_ACCESS) {
                                const createDashboardAccessInput = jsonData[subKey];
                                allCompleted.push(
                                    client.models.DashboardsAccess.create(createDashboardAccessInput)
                                );
                            } else if (subKey === Constants.UPDATE_DASHBOARDS_ACCESS) {
                                const updateDashboardAccessInput = jsonData[subKey];
                                allCompleted.push(
                                    client.models.DashboardsAccess.update(updateDashboardAccessInput)
                                );
                            } else if (subKey === Constants.DELETE_DASHBOARD) {
                                const deleteDashboardInput = jsonData[subKey];
                                allCompleted.push(
                                    client.models.Dashboard.delete(deleteDashboardInput)
                                );
                            } else if (subKey === Constants.CREATE_DASHBOARD) {
                                const createDashboardInput = jsonData[subKey];
                                allCompleted.push(
                                    client.models.Dashboard.create(createDashboardInput)
                                );
                            } else if (subKey === Constants.UPDATE_DASHBOARD) {
                                const updateDashboardInput = jsonData[subKey];
                                allCompleted.push(
                                    client.models.Dashboard.update(updateDashboardInput)
                                );
                            }
                            else {
                                console.log(`Unknown subKey: ${subKey}`);
                            }
                        });

                    } else {
                        console.log(`No data found for key ${key}`);
                    }
                } catch (error) {
                    console.error(`Error processing key ${key}:`, error);
                }
            }
        });
        await Promise.allSettled(allCompleted)
            allCompleted.forEach((item, index) => {
            const key = parsedKeys[index];
            console.log(`Removing key: ${key}`);
            Promise.resolve(item).then((result) => {
                if(result.data){
                    AsyncStorage.removeItem(key);
                }else if(result.errors)  {
                    console.error(`Operation for key: ${key} failed:`, result.errors);
                }
            });
        });
    }).catch((error) => {
        console.error('Error retrieving keys from AsyncStorage:', error);
    });
}
