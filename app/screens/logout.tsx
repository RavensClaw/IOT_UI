import GoogleSignInButton from "@/components/GoogleSignin"
import { StackScreenHeader } from "@/components/StackScreenHeader";
import { cognitoUserPoolsTokenProvider, signOut } from "aws-amplify/auth/cognito";
import { router } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView, View } from "react-native"
import { MD2Colors } from "react-native-paper";

const Logout = () => {

  useEffect(() => {

    cognitoUserPoolsTokenProvider.authTokenStore.clearTokens().then(() => {
      console.log("Tokens cleared successfully");
      signOut().then(() => {
        console.log("User signed out successfully");
      }).catch((error) => {
        router.push("/screens/login");
        console.error("Error signing out: ", error);
      });
    });

  }, [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MD2Colors.grey200 }}>
      <StackScreenHeader showHeader={false} title={"Logout"} showBackButton={false}></StackScreenHeader>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      </View>
    </SafeAreaView>)

}

export default Logout;