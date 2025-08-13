import GoogleSignInButton from "@/components/GoogleSignin"
import { StackScreenHeader } from "@/components/StackScreenHeader";
import { SafeAreaView, View } from "react-native"
import { MD2Colors, Text } from "react-native-paper";

const Login = () => {

        return (
      <SafeAreaView style={{ flex: 1, backgroundColor: MD2Colors.grey200 }}>
                <StackScreenHeader showHeader={false} title={"Login"} showBackButton={false}></StackScreenHeader>
               <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text  variant="headlineLarge" style={{fontWeight: 600,color:MD2Colors.grey700, backgroundColor: MD2Colors.amber300, marginBottom:30, padding:20,
                  borderRadius:10
                 }}>IOT Connect</Text>
            <GoogleSignInButton />
        </View>
          </SafeAreaView>)
  
}

export default Login;