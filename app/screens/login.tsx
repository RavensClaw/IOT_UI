import GoogleSignInButton from "@/components/GoogleSignin"
import { StackScreenHeader } from "@/components/StackScreenHeader";
import { getCurrentUser } from "aws-amplify/auth";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { SafeAreaView, View } from "react-native"
import { ActivityIndicator, MD2Colors, Text } from "react-native-paper";

const Login = () => {

  // This is the login screen that will be shown when the user is not logged in

   const [loading, setLoading] = useState(true);

    useFocusEffect(
    useCallback(() => { 
      // This will be called when the screen is focused
      console.log("Login screen focused");  
      getCurrentUser().then((user) => {
        if (user) {
          router.push('/screens/dashboards');
        } 
        else {
          console.log("User is not logged in, showing login screen");
        setLoading(false);
        } 
      }).catch((error) => {
        setLoading(false);
        //console.error("Error getting current user:", error);
      });
      return () => {
        // This will be called when the screen is unfocused 
         console.log("Login screen unfocused");
      }
    }, [])
  );  
        return (
      <SafeAreaView style={{ flex: 1, backgroundColor: MD2Colors.grey200 }}>
                <StackScreenHeader showHeader={false} title={"Login"} showBackButton={false}></StackScreenHeader>
                {loading ? <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator animating={true} color={MD2Colors.blue500} size="large" />
                </View> :
               <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text  variant="headlineLarge" style={{fontWeight: 600,color:MD2Colors.grey700, backgroundColor: MD2Colors.amber300, marginBottom:30, padding:20,
                  borderRadius:10
                 }}>IoT Connect</Text>
            <GoogleSignInButton setLoading={setLoading} />
        </View>}
          </SafeAreaView>)
  
}

export default Login;