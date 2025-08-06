import GoogleSignInButton from "@/components/GoogleSignin"
import { StackScreenHeader } from "@/components/StackScreenHeader";
import { SafeAreaView, View } from "react-native"
import { MD2Colors } from "react-native-paper";

const Login = () => {

        return (
      <SafeAreaView style={{ flex: 1, backgroundColor: MD2Colors.grey200 }}>
                <StackScreenHeader showHeader={false} title={"Login"} showBackButton={false}></StackScreenHeader>
               <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <GoogleSignInButton />
        </View>
          </SafeAreaView>)
  
}

export default Login;