import { Platform, View } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { Button, Divider, IconButton, MD2Colors, MD3Colors } from 'react-native-paper';
import { Menu } from 'react-native-paper';
import { useState, useEffect, ReactElement, useCallback } from "react";
import { useRouter, useNavigation } from 'expo-router';
import { cognitoUserPoolsTokenProvider, signOut } from 'aws-amplify/auth/cognito';

export type Props = {
  title?: undefined | string[] | string;
  showHeader?: boolean;
  showBackButton?: boolean;
};

export const StackScreenHeader: React.FC<Props> = ({ title, showHeader = true, showBackButton = true }) => {
  const isWeb = Platform.OS === 'web';
  const [hasLoggerInUser, setHasLoggedInUser] = useState(true);
  const router = useRouter();
  const initIsInternetAvailable: any = false;
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const [internetAvailable, isInternetAvailable] = useState(initIsInternetAvailable);



  useFocusEffect(useCallback(() => {
  }, []))

  useEffect(() => {
  }, []);

  return (
    <View style={{ zIndex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: title ? title.toString() : "",
          headerTintColor: MD2Colors.white,
          //headerStyle: { backgroundColor: MD2Colors.indigoA400  },
          headerStyle: { backgroundColor: MD2Colors.blueGrey900 },
          headerTitleStyle: {
            color: MD2Colors.white,
            fontSize: 16
          },
          headerShown: showHeader,
          headerBackVisible: showBackButton,
          headerRight: () => {
            return hasLoggerInUser && <View style={{ flexDirection: "row" }}>
              {
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>

                  <Menu
                    mode="elevated"
                    contentStyle={{ backgroundColor: MD2Colors.white, borderWidth: 1, borderColor: MD2Colors.grey400 }}
                    style={{ marginTop: 50, backgroundColor: MD2Colors.white }}
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={<IconButton onPress={openMenu} icon={'menu'} iconColor={MD2Colors.white}></IconButton>}>
                    <Menu.Item leadingIcon={"home"} onPress={() => {
                      closeMenu();
                      router.push('/screens/dashboards');
                    }} title="Home" />
                    <Divider />
                    {/*<Menu.Item onPress={() => { }} title="Item 2" />
                    <Divider />*/}
                    <Menu.Item leadingIcon={"logout"} onPress={() => {
                        closeMenu();
                        router.push('/screens/logout');
                    }} title="Logout" />
                  </Menu>
                </View>
              }
            </View>
          }
        }}
      />
    </View>
  )
}
