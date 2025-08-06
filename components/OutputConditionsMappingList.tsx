import { List } from "react-native-paper";
import ConditionModel from "@/models/ConditionModel";
import WidgetModel from "@/models/WidgetModel";
import { useEffect, useState } from "react";
import OutputConditionMappingItem from "./OutputConditionMappingItem";

export type Props = {
    widget: WidgetModel;
    inputStateName: string;
    outputStateName: string;
    edit: boolean;
    setWidget: React.Dispatch<React.SetStateAction<WidgetModel>>;
};

const populateResponseArray = (input: string) => {
    try {
        let keysArray: any[] = [];
        const inputAsJson = JSON.parse(input);
        extractKeys(inputAsJson, keysArray, '')
        return keysArray;
    } catch (e) {
        return [{
            "label": 'responseText',
            "value": input
        }];
    }
}

const extractKeys = (jsonObject: any, keysArray: any[], keyPath: string) => {
    const keys = Object.keys(jsonObject);
    keys.map((key: any) => {
        if (typeof jsonObject[key] === 'object') {
            let nextkeyPath = key;
            if (keyPath !== "") {
                nextkeyPath = keyPath + "." + key
            }

            extractKeys(jsonObject[key], keysArray, nextkeyPath);
        } else {
            if (keyPath !== "") {
                keysArray.push({
                    "label": keyPath + "." + key,
                    "value": keyPath + "." + key
                });
            } else {
                keysArray.push({
                    "label": key,
                    "value": key
                });
            }

        }
    })
}

const OutputConditionsMappingList: React.FC<Props> = ({
    inputStateName,
    outputStateName,
    widget,
    edit,
    setWidget }) => {
    const init: any[] = []
    const [responseDropDown, setResponseDropDown] = useState(init);

    useEffect(() => {
         if (widget &&
            widget.inputStates &&
            widget.inputStates[inputStateName] &&
            widget.inputStates[inputStateName].response) {
            let populateDropDown: any =  populateResponseArray(widget.inputStates[inputStateName].response);
            setResponseDropDown(populateDropDown);
        }
    }, [widget])

    return <List.Section>
        {
            widget &&
            widget.inputStates &&
            widget.inputStates[inputStateName] && 
            widget.inputStates[inputStateName].outputStates &&
            widget.inputStates[inputStateName].outputStates[outputStateName] &&
            widget.inputStates[inputStateName].outputStates[outputStateName].conditions?.map((item: ConditionModel, index: number) => {
                return <OutputConditionMappingItem
                    responseDropDown={responseDropDown}
                    inputStateName={inputStateName}
                    outputStateName={outputStateName}
                    edit={edit}
                    key={item.id}
                    outputConditionModelItem={item}
                    setWidget={setWidget}
                    index={index} widget={widget}></OutputConditionMappingItem>
            })}
    </List.Section>
}

export default OutputConditionsMappingList;
