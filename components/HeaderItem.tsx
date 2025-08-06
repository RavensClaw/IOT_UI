import ListModel from "@/models/ListModel";
import WidgetModel, { InputStates } from "@/models/WidgetModel";
import ObjectID from "bson-objectid";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Checkbox, IconButton, MD2Colors, TextInput } from "react-native-paper";

export type Props = {
    inputStateName: string;
    listModelItem: ListModel;
    widget: WidgetModel;
    edit: boolean;
    setWidget: React.Dispatch<React.SetStateAction<WidgetModel>>
};


const HeaderItem: React.FC<Props> = ({
    inputStateName,
    listModelItem,
    widget,
    edit,
    setWidget }) => {

    const [name, setName] = useState(listModelItem.name ? listModelItem.name : "");
    const [value, setValue] = useState(listModelItem.value ? listModelItem.value : "");
    const [enabled, setEnabled] = useState(listModelItem.enabled);

    useEffect(() => {

    }, [name, value, enabled])

    return <View style={{ flexDirection: "row" }}>
        <View style={{ marginTop: 15 }}>
            <Checkbox status={enabled ? "checked" : "unchecked"}
                disabled={!edit}
                onPress={() => {
                    if (enabled) {
                        setEnabled(false);
                    } else {
                        setEnabled(true);
                    }
                }}></Checkbox>
        </View>

        <TextInput
            label="NAME"
            value={name}
            style={{ fontSize: 12, minWidth: 140, maxWidth: 140 }}
            mode="outlined"
            onChangeText={text => {
                setName(text)
                
                let modifiedInputStates: InputStates = { ...widget.inputStates };
                const modifiedInputStatesKeys = Object.keys(modifiedInputStates);

                for (let i = 0; i < modifiedInputStatesKeys.length; i++) {
                    if (modifiedInputStates[inputStateName] && modifiedInputStates[inputStateName].headers) {
                        const listModelItems: ListModel[] = [...modifiedInputStates[inputStateName].headers]
                        for (let i = 0; i < listModelItems?.length; i++) {
                            if (listModelItems[i].id === listModelItem.id) {
                                listModelItems[i].name = text;
                                break;
                            }
                        }
                        modifiedInputStates[inputStateName].headers = listModelItems;
                        const widgetModified = {...widget,modifiedInputStates}
                        setWidget(widgetModified);
                        break;
                    }
                }

            }}
            disabled={!edit}
        />
        <TextInput
            label="VALUE"
            value={value}
            style={{ fontSize: 12, minWidth: 140, maxWidth: 140, marginLeft: 10 }}
            mode="outlined"
            onChangeText={text => {
                setValue(text)
                let modifiedInputStates: InputStates = { ...widget.inputStates };
                const modifiedInputStatesKeys = Object.keys(modifiedInputStates);

                for (let i = 0; i < modifiedInputStatesKeys.length; i++) {
                    if (modifiedInputStates[inputStateName] && modifiedInputStates[inputStateName].headers) {
                        const listModelItems: ListModel[] = [...modifiedInputStates[inputStateName].headers]
                        for (let i = 0; i < listModelItems?.length; i++) {
                            if (listModelItems[i].id === listModelItem.id) {
                                listModelItems[i].value = text;
                                break;
                            }
                        }
                        modifiedInputStates[inputStateName].headers = listModelItems;
                        const widgetModified = {...widget,modifiedInputStates}
                        setWidget(widgetModified);
                        break;
                    }
                }
            }}
            disabled={!edit}
        />
        <IconButton
            style={{ marginTop: 15 }}
            size={16}
            iconColor={MD2Colors.black}
            onPress={() => {
                let modifiedInputStates: InputStates = { ...widget.inputStates };
                const modifiedInputStatesKeys = Object.keys(modifiedInputStates);

                for (let i = 0; i < modifiedInputStatesKeys.length; i++) {
                    if (modifiedInputStates[inputStateName] && modifiedInputStates[inputStateName].headers) {
                        const listModelItems: ListModel[] = [...modifiedInputStates[inputStateName].headers]
                        listModelItems.push({
                            enabled: true,
                            id: new ObjectID().toHexString(),
                            name: '',
                            value: '',
                            widgetId: widget.widgetId,
                            userId: widget.userId
                        });
                        modifiedInputStates[inputStateName].headers = listModelItems;
                        const widgetModified = {...widget,modifiedInputStates}
                        setWidget(widgetModified);
                        break;
                    }
                }
            }}
            disabled={!edit}
            icon={"plus"} />
        <IconButton
            style={{ marginTop: 15 }}
            size={16}
            iconColor={MD2Colors.black}
            onPress={() => {
                let modifiedInputStates: InputStates = { ...widget.inputStates };
                const inputStateKeys = Object.keys(modifiedInputStates);
                for(let i=0;i<inputStateKeys.length;i++){
                    if(inputStateKeys[i] === inputStateName){
                        const headers = modifiedInputStates[inputStateName].headers;
                        if(headers?.length === 1){
                            setName('');
                            setValue('');
                            modifiedInputStates[inputStateName].headers = [{
                                enabled: true,
                                id: new ObjectID().toHexString(),
                                name: '',
                                value: '',
                                widgetId: widget.widgetId,
                                userId: widget.userId
                            }];        
                        }else{
                            const listModelItems = modifiedInputStates[inputStateName].headers 
                            if(listModelItems){
                                let listModelItemsTemp = [...listModelItems];
                                for (let i = 0; i < listModelItems.length; i++) {
                                    if (listModelItems[i].id === listModelItem.id) {
                                        listModelItemsTemp.splice(i, 1);
                                        break;
                                    }
                                }
                                modifiedInputStates[inputStateName].headers = listModelItemsTemp;
                            }
                        }
                        const widgetModified = {...widget,modifiedInputStates}
                        setWidget(widgetModified);
                        break;
                    }
                    
                }

            }}
            disabled={!edit}
            icon={"delete"} />
    </View>
}

export default HeaderItem;