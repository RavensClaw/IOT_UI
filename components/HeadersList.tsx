import ListModel from "@/models/ListModel";
import { List } from "react-native-paper";
import WidgetModel from "@/models/WidgetModel";
import HeaderItem from "./HeaderItem";

export type Props = {
    inputStateName: string;
    widget: WidgetModel;
    edit: boolean;
    setWidget: React.Dispatch<React.SetStateAction<WidgetModel>>
};

const HeadersList: React.FC<Props> = ({ 
    inputStateName,
    widget,
    edit,
    setWidget }) => {

    return <List.Section>
        {widget && 
        widget.inputStates && 
        widget.inputStates[inputStateName] && 
        widget.inputStates[inputStateName].headers && 
        widget.inputStates[inputStateName].headers.map((item: ListModel) => {
            return <HeaderItem
                edit={edit}
                inputStateName={inputStateName}
                key={item.id}
                listModelItem={item}
                widget={widget}
                setWidget={setWidget} 
                ></HeaderItem>
        })}
    </List.Section>
}

export default HeadersList;
