import {
    StyleSheet,
} from 'react-native';
import { MD2Colors } from 'react-native-paper';

export const styles = StyleSheet.create({
    container: {
        shadowColor: MD2Colors.grey800,
        shadowOffset: {
            width: 1,
            height: 1,
        },
        backgroundColor: MD2Colors.white,
        borderRadius: 4,
        shadowOpacity: 0.2,
        shadowRadius: 1,
        borderColor: MD2Colors.black,
        borderWidth: 1,
        margin: 10, padding: 10
    },
    deleteDialogue: {
        padding: 10,
        backgroundColor: MD2Colors.white,
        minWidth: 300,
        alignContent: "center",
        alignSelf: "center"
    },
    size12Font: {
        fontSize: 12,
    },
    widgetTitle: {
        fontWeight: 500, marginTop: 5
    },
    widgetNameTextInput: {
        width: 150,
        marginBottom: 5,
        fontSize: 12,
        color: MD2Colors.black
    },
    widgetHeaderButtons: {
        marginLeft: "auto", flexDirection: 'row'
    },
    widgetConfigureIcon: {
        left: 0, borderColor: MD2Colors.green200
    },
    widgetDeleteIcon: {
        left: 0, borderColor: MD2Colors.red200
    },
    widgetEditIcon: {
        left: 0, borderColor: MD2Colors.yellow300
    },
    deleteMessageContainer: {
        flexDirection: "row", alignSelf: "center", marginBottom: 30
    },
    errorMessageContainer: {
        margin: 5, borderColor: MD2Colors.red300, padding: 5
    },
    errorMessageText: {
        margin: 5, borderColor: MD2Colors.red300, padding: 5, fontSize: 12
    },
    onOffText: {
        fontSize: 10, margin: 'auto', fontWeight: "600", color: MD2Colors.grey700
    },
    onOffIcon: {
        marginLeft: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        borderRadius: 20,
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 1,
    },
    onOffIconContainer: {
        flexDirection: 'row', margin: "auto", padding: 10
    },
    saveCancelContainer: {
        flexDirection: "row", alignSelf: "center", margin: "auto", marginTop: 20, marginBottom: 20
    },

     dropdown: {
            margin: 16,
            height: 50,
            minWidth: 100,
            alignSelf: "center",
            maxWidth: 400,
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 12,
            shadowColor: MD2Colors.grey800,
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
