import ListModel from "@/models/ListModel";
import { List } from "react-native-paper";
import QueryParamItem from "./QueryParamItem";
import WidgetModel from "@/models/WidgetModel";

export type Props = {
    inputStateName: string;
    widget: WidgetModel;
    edit: boolean;
    setWidget: React.Dispatch<React.SetStateAction<WidgetModel>>
};

const QueryParamsList: React.FC<Props> = ({ 
    inputStateName,
    widget,
    edit,
    setWidget }) => {
   
    return <List.Section>
        {widget && 
        widget.inputStates && 
        widget.inputStates[inputStateName] && 
        widget.inputStates[inputStateName].params && 
        widget.inputStates[inputStateName].params.map((item: ListModel) => {
            return <QueryParamItem
                edit={edit}
                inputStateName={inputStateName}
                key={item.id}
                listModelItem={item}
                widget={widget}
                setWidget={setWidget} 
                ></QueryParamItem>
        })}
    </List.Section>
}

export default QueryParamsList;
