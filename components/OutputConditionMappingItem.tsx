import ConditionModel from "@/models/ConditionModel";
import { Dropdown } from "react-native-element-dropdown";
import { IconButton, MD2Colors, TextInput, Text } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import ObjectID from "bson-objectid";
import { useState } from "react";
import WidgetModel from "@/models/WidgetModel";
import config from '../constants/config.json'

const LOGICAL_OPERATORS = config['LOGICAL_OPERATORS'];
const CONDITIONS = config['CONDITIONS'];

export type Props = {
    widget: WidgetModel;
    inputStateName: string;
    outputStateName: string;
    responseDropDown: any[];
    edit: boolean;
    outputConditionModelItem: ConditionModel;
    setWidget: React.Dispatch<React.SetStateAction<WidgetModel>>;
    index: number;
};


const OutputConditionMappingItem: React.FC<Props> = ({
    widget,
    inputStateName,
    outputStateName,
    responseDropDown,
    edit,
    outputConditionModelItem,
    setWidget,
    index }) => {


    const [outputConditionItem, setOutputConditionItem] = useState(outputConditionModelItem);


    return <View style={{ width: "98%",paddingBottom:10, marginBottom: 10, alignSelf: "center", borderWidth: 1, borderColor: MD2Colors.grey500, borderRadius: 5 }}>
        <View style={index !== 0 ? { flexDirection: "row" } : { flexDirection: "row", marginLeft: "auto" }}>
            {index !== 0 && <Dropdown
                disable={!edit}
                style={[styles.dropdown, { margin: "auto" }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={LOGICAL_OPERATORS}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="OPERATOR"
                value={outputConditionItem.conditionWithPrevious ? outputConditionItem.conditionWithPrevious : "AND"}
                onChange={item => {

                    let modifiedWidget = { ...widget };
                    if (modifiedWidget &&
                        modifiedWidget.inputStates &&
                        modifiedWidget.inputStates[inputStateName] && 
                        modifiedWidget.inputStates[inputStateName].outputStates &&
                        modifiedWidget.inputStates[inputStateName].outputStates[outputStateName] &&
                        modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions) {
                        let modifiedOutputConditionModelItems = [...modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions];
                        for (let i = 0; i < modifiedOutputConditionModelItems.length; i++) {
                            if (modifiedOutputConditionModelItems[i].id === outputConditionModelItem.id) {
                                modifiedOutputConditionModelItems[i].conditionWithPrevious = item;
                                break;
                            }
                        }
                        modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions = modifiedOutputConditionModelItems;

                        setWidget({
                            ...modifiedWidget,
                        });
                    }
                }}
            />}
            <IconButton
                style={{ marginTop: 15 }}
                size={16}
                mode="outlined"
                iconColor={MD2Colors.black}
                onPress={() => {
                    const item = {
                        id: new ObjectID().toHexString(),
                        key: "",
                        condition: "",
                        value1: "",
                        value2: "",
                    }
                    let modifiedWidget = { ...widget };
                    if (modifiedWidget &&
                        modifiedWidget.inputStates &&
                        modifiedWidget.inputStates[inputStateName] && 
                        modifiedWidget.inputStates[inputStateName].outputStates &&
                        modifiedWidget.inputStates[inputStateName].outputStates[outputStateName] &&
                        modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions) {
                        setOutputConditionItem(item);
                        modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions = [...modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions, item];
                        setWidget({
                            ...modifiedWidget,
                        });
                    }
                }}
                disabled={!edit}
                icon={"plus"} />
            <IconButton
                style={{ marginTop: 15 }}
                size={16}
                mode="outlined"
                iconColor={MD2Colors.black}
                onPress={() => {

                    let modifiedWidget = { ...widget };
                    if (modifiedWidget &&
                        modifiedWidget.inputStates &&
                        modifiedWidget.inputStates[inputStateName] && 
                        modifiedWidget.inputStates[inputStateName].outputStates &&
                        modifiedWidget.inputStates[inputStateName].outputStates[outputStateName] &&
                        modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions) {
                        let modifiedConditions = [...modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions];
                        modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions = [...modifiedConditions];

                        for (let i = 0; i < modifiedConditions.length; i++) {
                            if (modifiedConditions[i].id === outputConditionItem.id) {
                                modifiedConditions.splice(i, 1);
                                modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions = modifiedConditions;
                                break;
                            }
                        }
                       setWidget(modifiedWidget);
                    }
                }}
                disabled={!edit}
                icon={"delete"} />
        </View>
        <Dropdown
            disable={!edit}
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            itemTextStyle={styles.selectedTextStyle}
            data={responseDropDown}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="RESPONSE KEYS"
            value={outputConditionItem.key}
            onChange={item => {
                let modifiedWidget = { ...widget };
                if (modifiedWidget &&
                    modifiedWidget.inputStates &&
                    modifiedWidget.inputStates[inputStateName].outputStates &&
                    modifiedWidget.inputStates[inputStateName].outputStates[outputStateName] &&
                    modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions) {
                        let modifiedOutputConditionModelItems = [...modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions];


                    for (let i = 0; i < modifiedOutputConditionModelItems.length; i++) {
                        if (modifiedOutputConditionModelItems[i].id === outputConditionModelItem.id) {
                            modifiedOutputConditionModelItems[i].key = item.value;
                            setOutputConditionItem(modifiedOutputConditionModelItems[i]);
                            break;
                        }
                    }
                    modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions = modifiedOutputConditionModelItems;
                    setWidget({
                        ...modifiedWidget,
                    });
                }

            }}
        />

        <Dropdown
            disable={!edit}
            style={[styles.dropdown, { minWidth: 160, }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            itemTextStyle={styles.selectedTextStyle}
            data={CONDITIONS}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Conditions"
            value={outputConditionItem.condition}
            onChange={item => {
                let modifiedWidget = { ...widget };
                if (modifiedWidget &&
                    modifiedWidget.inputStates &&
                    modifiedWidget.inputStates[inputStateName].outputStates &&
                    modifiedWidget.inputStates[inputStateName].outputStates[outputStateName] &&
                    modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions) {
                    let modifiedOutputConditionModelItems = [...modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions];



                    for (let i = 0; i < modifiedOutputConditionModelItems.length; i++) {
                        if (modifiedOutputConditionModelItems[i].id === outputConditionModelItem.id) {
                            modifiedOutputConditionModelItems[i].condition = item.value;
                            setOutputConditionItem(modifiedOutputConditionModelItems[i]);
                            break;
                        }
                    }
                    modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions = modifiedOutputConditionModelItems;
                    setWidget({
                        ...modifiedWidget,
                    });
                }
            }}
        />
        <TextInput
            readOnly={!edit}
            label="Value"
            value={outputConditionItem.value1}
            style={{ fontSize: 12, width: "90%", margin: "auto" }}
            mode="outlined"
            onChangeText={text => {
                let modifiedWidget = { ...widget };
                if (modifiedWidget &&
                    modifiedWidget.inputStates &&
                    modifiedWidget.inputStates[inputStateName].outputStates &&
                    modifiedWidget.inputStates[inputStateName].outputStates[outputStateName] &&
                    modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions) {
                    let modifiedOutputConditionModelItems = [...modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions];



                    for (let i = 0; i < modifiedOutputConditionModelItems.length; i++) {
                        if (modifiedOutputConditionModelItems[i].id === outputConditionModelItem.id) {
                            modifiedOutputConditionModelItems[i].value1 = text;
                            setOutputConditionItem(modifiedOutputConditionModelItems[i]);
                            break;
                        }
                    }
                    modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions = modifiedOutputConditionModelItems;

                    setWidget({
                        ...modifiedWidget,
                    });
                }
            }}
        />
        {outputConditionItem.condition === 'Between' &&
            <TextInput
                readOnly={!edit}
                label="Value"
                value={outputConditionItem.value2}
                style={{ fontSize: 12, width: "90%", margin: "auto" }}
                mode="outlined"
                onChangeText={text => {
                    let modifiedWidget = { ...widget };
                    if (modifiedWidget &&
                        modifiedWidget.inputStates &&
                        modifiedWidget.inputStates[inputStateName].outputStates &&
                        modifiedWidget.inputStates[inputStateName].outputStates[outputStateName] &&
                        modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions) {
                        let modifiedOutputConditionModelItems = [...modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions];



                        for (let i = 0; i < modifiedOutputConditionModelItems.length; i++) {
                            if (modifiedOutputConditionModelItems[i].id === outputConditionModelItem.id) {
                                modifiedOutputConditionModelItems[i].value2 = text;
                                setOutputConditionItem(modifiedOutputConditionModelItems[i]);
                                break;
                            }
                        }
                        modifiedWidget.inputStates[inputStateName].outputStates[outputStateName].conditions = modifiedOutputConditionModelItems;

                        setWidget({
                            ...modifiedWidget,
                        });
                    }
                }}
            />}
    </View>
}

export default OutputConditionMappingItem;

const styles = StyleSheet.create({
    dropdown: {
        margin: 16,
        height: 50,
        minWidth: 100,
        maxWidth: 400,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 2,
    },
    icon: {
        marginRight: 5,
    },
    item: {
        padding: 17,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textItem: {
        flex: 1,
        fontSize: 12,
    },
    placeholderStyle: {
        fontSize: 12,
        fontWeight: "700"
    },
    selectedTextStyle: {
        fontSize: 12,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
});