import { MutationKey, QueryKey } from "@tanstack/react-query";

export class Constants {
  
  // 🔒 Prevent instantiation
  private constructor() { }

  static readonly CREATE_DASHBOARDS_ACCESS = 'CREATE_DASHBOARDS_ACCESS';
  static readonly UPDATE_DASHBOARDS_ACCESS = 'UPDATE_DASHBOARDS_ACCESS';
  static readonly DELETE_DASHBOARDS_ACCESS = 'DELETE_DASHBOARDS_ACCESS';
  static readonly CREATE_DASHBOARD = 'CREATE_DASHBOARD';
  static readonly UPDATE_DASHBOARD = 'UPDATE_DASHBOARD';
  static readonly DELETE_DASHBOARD = 'DELETE_DASHBOARD';
  static readonly BLUETOOTH_CONNECTION_TIMEOUT_IN_MS: 15000;
  static readonly serviceKeys = {
      queryGetDashboardsAccessByUserId: "queryGetDashboardsAccessByUserId",
      queryGetDashBoardByDashBoardId: "queryGetDashBoardByDashBoardId",
      queryGetMultipleDashboardsByDashboardIds: "queryGetMultipleDashboardsByDashboardIds",
      INIT_QUERY_KEY: "initquery",
      INIT_MUTATION_KEY: "initmutation",

      
  }
}

