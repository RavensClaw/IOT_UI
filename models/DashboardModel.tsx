import WidgetModel from "./WidgetModel";
export default interface DashboardModel {
    dashboardId: string;
    label: string;
    description?: string | null;
    widgets?: Widgets;
    lastModifiedBy?: string;
    readonly createdAt?: string;
    readonly updatedAt?: string;
}

export interface Widgets {
    [s: string]: WidgetModel;
}
