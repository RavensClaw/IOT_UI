export default interface ParamsModel{
    dashboardId?: string;
    widgetId?: string;
    userId?: string;
    widgetType?: "OnOffButton" | "OnOffSwitch" | "slider" |  "PushButton";
}
