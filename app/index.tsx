import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";
import amplify_outputs from './amplify_outputs.json'
import { Amplify } from 'aws-amplify';
import { Platform } from "react-native";
import { cognitoUserPoolsTokenProvider, getCurrentUser } from "@aws-amplify/auth/cognito";
import { CookieStorage, defaultStorage } from "aws-amplify/utils";
import { useCallback, useEffect, useState } from "react";
import { StackScreenHeader } from "@/components/StackScreenHeader";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import { syncOffline } from "@/service/servicehook";
import { onlineManager } from '@tanstack/react-query'
import AsyncStorage from "@react-native-async-storage/async-storage";

const isWeb = Platform.OS === 'web';

Amplify.configure(amplify_outputs);
if (isWeb) {
  cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage({
    expires: 1
  }));
} else {
  cognitoUserPoolsTokenProvider.setKeyValueStorage(defaultStorage);
}


export default function Index() {

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);

  const isOnline = onlineManager.isOnline();

  useEffect(() => {
      setLoading(true);
      /*AsyncStorage.clear().catch((error) => {
        console.error("Error clearing AsyncStorage:", error);
      });*/
      getCurrentUser().then((user) => {
        if (user) {
          console.log('User is logged in:', user);
          setLoggedIn(true);
          if (isOnline) {
            //setAppIsReady(true);
            syncOffline().catch((error) => {
            }).finally(() => {
              setAppIsReady(true);
            });
          }
        } else {
          setLoggedIn(false);
        }
      }).catch(() => {
        setAppIsReady(true);
        setLoggedIn(false);
      }).finally(() => {
        setLoading(false);
      })
    }, [])//[] here means called only once as nothing changes

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MD2Colors.grey100 }}>
      <StackScreenHeader showBackButton={false} showHeader={false}></StackScreenHeader>
      {loading ? <ActivityIndicator animating={loading} size="large" color={MD2Colors.blue800} style={{ margin: 'auto', marginTop:350 }} /> :
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', width: '100%',minHeight:100 }}>
          {appIsReady ? isLoggedIn ? <Redirect href='/screens/dashboards' /> : <Redirect href='/screens/login' />
            : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', margin: 'auto' }}>
              <ActivityIndicator animating={true} size="large" color={MD2Colors.blue800} />
              <Text style={{ marginTop: 20, fontSize: 16, color: MD2Colors.blue800 }}>Syncing...</Text>
            </View>}
        </View>}
    </SafeAreaView>

  );
}

