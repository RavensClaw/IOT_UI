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


const QueryParamItem: React.FC<Props> = ({
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
            textColor={MD2Colors.black}
            style={{ fontSize: 12, minWidth: 140, maxWidth: 140 }}
            mode="outlined"
            onChangeText={text => {
                setName(text)
                
                let modifiedInputStates: InputStates = { ...widget.inputStates };
                const modifiedInputStatesKeys = Object.keys(modifiedInputStates);

                for (let i = 0; i < modifiedInputStatesKeys.length; i++) {
                    if (modifiedInputStates[inputStateName] && modifiedInputStates[inputStateName].params) {
                        const listModelItems: ListModel[] = [...modifiedInputStates[inputStateName].params]
                        for (let i = 0; i < listModelItems?.length; i++) {
                            if (listModelItems[i].id === listModelItem.id) {
                                listModelItems[i].name = text;
                                break;
                            }
                        }
                        modifiedInputStates[inputStateName].params = listModelItems;
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
            textColor={MD2Colors.black}
            style={{ fontSize: 12, minWidth: 140, maxWidth: 140, marginLeft: 10 }}
            mode="outlined"
            onChangeText={text => {
                setValue(text)
                let modifiedInputStates: InputStates = { ...widget.inputStates };
                const modifiedInputStatesKeys = Object.keys(modifiedInputStates);

                for (let i = 0; i < modifiedInputStatesKeys.length; i++) {
                    if (modifiedInputStates[inputStateName] && modifiedInputStates[inputStateName].params) {
                        const listModelItems: ListModel[] = [...modifiedInputStates[inputStateName].params]
                        for (let i = 0; i < listModelItems?.length; i++) {
                            if (listModelItems[i].id === listModelItem.id) {
                                listModelItems[i].value = text;
                                break;
                            }

                            /*if (listModelItems && listModelItems.length > 0) {
                                let appendParamsToUrl = '';
                                listModelItems.map((paramItem: ListModel, index) => {
                                    if (paramItem.name &&
                                        paramItem.name?.trim() !== "" &&
                                        paramItem.value &&
                                        paramItem.value?.trim() !== "") {
                                        if (index === 0) {
                                            appendParamsToUrl = "?" + paramItem.name + "=" + paramItem.value
                                        } else {
                                            appendParamsToUrl += "&" + paramItem.name + "=" + paramItem.value
                                        }
                                    }
                                });
                                modifiedInputStates[inputStateName].apiUrl += appendParamsToUrl;
                            }*/
                        }
                        modifiedInputStates[inputStateName].params = listModelItems;
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
                    if (modifiedInputStates[inputStateName] && modifiedInputStates[inputStateName].params) {
                        const listModelItems: ListModel[] = [...modifiedInputStates[inputStateName].params]
                        listModelItems.push({
                            enabled: true,
                            id: new ObjectID().toHexString(),
                            name: '',
                            value: '',
                            widgetId: widget.widgetId,
                            userId: widget.userId
                        });
                        modifiedInputStates[inputStateName].params = listModelItems;
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
                        const params = modifiedInputStates[inputStateName].params;
                        if(params?.length === 1){
                            setName('');
                            setValue('');
                            modifiedInputStates[inputStateName].params = [{
                                enabled: true,
                                id: new ObjectID().toHexString(),
                                name: '',
                                value: '',
                                widgetId: widget.widgetId,
                                userId: widget.userId
                            }];        
                        }else{
                            const listModelItems = modifiedInputStates[inputStateName].params 
                            if(listModelItems){
                                let listModelItemsTemp = [...listModelItems];
                                for (let i = 0; i < listModelItems.length; i++) {
                                    if (listModelItems[i].id === listModelItem.id) {
                                        listModelItemsTemp.splice(i, 1);
                                        break;
                                    }
                                }

                                /*if (listModelItemsTemp && listModelItemsTemp.length > 0) {
                                    let appendParamsToUrl = '';
                                    listModelItemsTemp.map((paramItem: ListModel, index) => {
                                        if (paramItem.name &&
                                            paramItem.name?.trim() !== "" &&
                                            paramItem.value &&
                                            paramItem.value?.trim() !== "") {
                                            if (index === 0) {
                                                appendParamsToUrl = "?" + paramItem.name + "=" + paramItem.value
                                            } else {
                                                appendParamsToUrl += "&" + paramItem.name + "=" + paramItem.value
                                            }
                                        }
                                    });
                                    modifiedInputStates[inputStateName].apiUrl = modifiedInputStates[inputStateName].apiUrl?.replaceAll(/\?+/,'');
                                    modifiedInputStates[inputStateName].apiUrl += appendParamsToUrl;
                                }*/

                                modifiedInputStates[inputStateName].params = listModelItemsTemp;
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

export default QueryParamItem;