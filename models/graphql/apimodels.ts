/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateDashboardsAccessInput = {
  userId: string,
  dashboardIds?: Array< string | null > | null,
  lastModifiedBy?: string | null,
};

export type ModelDashboardsAccessConditionInput = {
  dashboardIds?: ModelStringInput | null,
  lastModifiedBy?: ModelStringInput | null,
  and?: Array< ModelDashboardsAccessConditionInput | null > | null,
  or?: Array< ModelDashboardsAccessConditionInput | null > | null,
  not?: ModelDashboardsAccessConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type DashboardsAccess = {
  __typename: "DashboardsAccess",
  userId: string,
  dashboardIds?: Array< string | null > | null,
  lastModifiedBy?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateDashboardsAccessInput = {
  userId: string,
  dashboardIds?: Array< string | null > | null,
  lastModifiedBy?: string | null,
};

export type DeleteDashboardsAccessInput = {
  userId: string,
};

export type CreateDashboardInput = {
  dashboardId: string,
  data: string,
  lastModifiedBy?: string | null,
};

export type ModelDashboardConditionInput = {
  data?: ModelStringInput | null,
  lastModifiedBy?: ModelStringInput | null,
  and?: Array< ModelDashboardConditionInput | null > | null,
  or?: Array< ModelDashboardConditionInput | null > | null,
  not?: ModelDashboardConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type Dashboard = {
  __typename: "Dashboard",
  dashboardId: string,
  data: string,
  lastModifiedBy?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateDashboardInput = {
  dashboardId: string,
  data?: string | null,
  lastModifiedBy?: string | null,
};

export type DeleteDashboardInput = {
  dashboardId: string,
};

export type ModelDashboardsAccessFilterInput = {
  userId?: ModelIDInput | null,
  dashboardIds?: ModelStringInput | null,
  lastModifiedBy?: ModelStringInput | null,
  id?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelDashboardsAccessFilterInput | null > | null,
  or?: Array< ModelDashboardsAccessFilterInput | null > | null,
  not?: ModelDashboardsAccessFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelDashboardsAccessConnection = {
  __typename: "ModelDashboardsAccessConnection",
  items:  Array<DashboardsAccess | null >,
  nextToken?: string | null,
};

export type ModelDashboardFilterInput = {
  dashboardId?: ModelIDInput | null,
  data?: ModelStringInput | null,
  lastModifiedBy?: ModelStringInput | null,
  id?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelDashboardFilterInput | null > | null,
  or?: Array< ModelDashboardFilterInput | null > | null,
  not?: ModelDashboardFilterInput | null,
};

export type ModelDashboardConnection = {
  __typename: "ModelDashboardConnection",
  items:  Array<Dashboard | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionDashboardsAccessFilterInput = {
  userId?: ModelSubscriptionIDInput | null,
  dashboardIds?: ModelSubscriptionStringInput | null,
  lastModifiedBy?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionDashboardsAccessFilterInput | null > | null,
  or?: Array< ModelSubscriptionDashboardsAccessFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionDashboardFilterInput = {
  dashboardId?: ModelSubscriptionIDInput | null,
  data?: ModelSubscriptionStringInput | null,
  lastModifiedBy?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionDashboardFilterInput | null > | null,
  or?: Array< ModelSubscriptionDashboardFilterInput | null > | null,
};

export type CreateDashboardsAccessMutationVariables = {
  input: CreateDashboardsAccessInput,
  condition?: ModelDashboardsAccessConditionInput | null,
};

export type CreateDashboardsAccessMutation = {
  createDashboardsAccess?:  {
    __typename: "DashboardsAccess",
    userId: string,
    dashboardIds?: Array< string | null > | null,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateDashboardsAccessMutationVariables = {
  input: UpdateDashboardsAccessInput,
  condition?: ModelDashboardsAccessConditionInput | null,
};

export type UpdateDashboardsAccessMutation = {
  updateDashboardsAccess?:  {
    __typename: "DashboardsAccess",
    userId: string,
    dashboardIds?: Array< string | null > | null,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteDashboardsAccessMutationVariables = {
  input: DeleteDashboardsAccessInput,
  condition?: ModelDashboardsAccessConditionInput | null,
};

export type DeleteDashboardsAccessMutation = {
  deleteDashboardsAccess?:  {
    __typename: "DashboardsAccess",
    userId: string,
    dashboardIds?: Array< string | null > | null,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateDashboardMutationVariables = {
  input: CreateDashboardInput,
  condition?: ModelDashboardConditionInput | null,
};

export type CreateDashboardMutation = {
  createDashboard?:  {
    __typename: "Dashboard",
    dashboardId: string,
    data: string,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateDashboardMutationVariables = {
  input: UpdateDashboardInput,
  condition?: ModelDashboardConditionInput | null,
};

export type UpdateDashboardMutation = {
  updateDashboard?:  {
    __typename: "Dashboard",
    dashboardId: string,
    data: string,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteDashboardMutationVariables = {
  input: DeleteDashboardInput,
  condition?: ModelDashboardConditionInput | null,
};

export type DeleteDashboardMutation = {
  deleteDashboard?:  {
    __typename: "Dashboard",
    dashboardId: string,
    data: string,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetDashboardsAccessQueryVariables = {
  userId: string,
};

export type GetDashboardsAccessQuery = {
  getDashboardsAccess?:  {
    __typename: "DashboardsAccess",
    userId: string,
    dashboardIds?: Array< string | null > | null,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListDashboardsAccessesQueryVariables = {
  userId?: string | null,
  filter?: ModelDashboardsAccessFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListDashboardsAccessesQuery = {
  listDashboardsAccesses?:  {
    __typename: "ModelDashboardsAccessConnection",
    items:  Array< {
      __typename: "DashboardsAccess",
      userId: string,
      dashboardIds?: Array< string | null > | null,
      lastModifiedBy?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetDashboardQueryVariables = {
  dashboardId: string,
};

export type GetDashboardQuery = {
  getDashboard?:  {
    __typename: "Dashboard",
    dashboardId: string,
    data: string,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListDashboardsQueryVariables = {
  dashboardId?: string | null,
  filter?: ModelDashboardFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListDashboardsQuery = {
  listDashboards?:  {
    __typename: "ModelDashboardConnection",
    items:  Array< {
      __typename: "Dashboard",
      dashboardId: string,
      data: string,
      lastModifiedBy?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateDashboardsAccessSubscriptionVariables = {
  filter?: ModelSubscriptionDashboardsAccessFilterInput | null,
};

export type OnCreateDashboardsAccessSubscription = {
  onCreateDashboardsAccess?:  {
    __typename: "DashboardsAccess",
    userId: string,
    dashboardIds?: Array< string | null > | null,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateDashboardsAccessSubscriptionVariables = {
  filter?: ModelSubscriptionDashboardsAccessFilterInput | null,
};

export type OnUpdateDashboardsAccessSubscription = {
  onUpdateDashboardsAccess?:  {
    __typename: "DashboardsAccess",
    userId: string,
    dashboardIds?: Array< string | null > | null,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteDashboardsAccessSubscriptionVariables = {
  filter?: ModelSubscriptionDashboardsAccessFilterInput | null,
};

export type OnDeleteDashboardsAccessSubscription = {
  onDeleteDashboardsAccess?:  {
    __typename: "DashboardsAccess",
    userId: string,
    dashboardIds?: Array< string | null > | null,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateDashboardSubscriptionVariables = {
  filter?: ModelSubscriptionDashboardFilterInput | null,
};

export type OnCreateDashboardSubscription = {
  onCreateDashboard?:  {
    __typename: "Dashboard",
    dashboardId: string,
    data: string,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateDashboardSubscriptionVariables = {
  filter?: ModelSubscriptionDashboardFilterInput | null,
};

export type OnUpdateDashboardSubscription = {
  onUpdateDashboard?:  {
    __typename: "Dashboard",
    dashboardId: string,
    data: string,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteDashboardSubscriptionVariables = {
  filter?: ModelSubscriptionDashboardFilterInput | null,
};

export type OnDeleteDashboardSubscription = {
  onDeleteDashboard?:  {
    __typename: "Dashboard",
    dashboardId: string,
    data: string,
    lastModifiedBy?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
