export default interface ConditionModel {
    id: string;
    key: string;
    condition: string;
    value1?: string;
    value2?: string;
    conditionWithPrevious?: string | null;
    userId?: string | null;
    widgetId?: string | null;
}
