import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import "../global.css";

export default function Index() {
  return (
    <SafeAreaView className="flex bg-white">
      <View className="flex items-center justify-center">
        <View className="w-full h-full flex items-center justify-center">
          <Text className="text-primary text-4xl font-bold">Login here</Text>
          <Text className="text-black text-xl font-bold pt-8">
            {`Welcome back you 've `}
          </Text>
          <Text className="text-black text-xl font-bold">{`been missed!`}</Text>
          <TextInput
            className="w-10/12 h-16 border bg-[#F1F4FF] rounded-lg px-4 mt-8"
            placeholder="Phone"
            keyboardType="phone-pad"
            placeholderTextColor={"#626262"}
          />
          <TextInput
            className="w-10/12 h-16 bg-[#F1F4FF] rounded-lg px-4 mt-8"
            placeholder="Password"
            placeholderTextColor={"#626262"}
            keyboardType="visible-password"
          />
          <Text className="text-primary text-md text-right font-bold pt-4 w-10/12">
            {`Forgot your password? `}
          </Text>
          <TouchableOpacity className="w-10/12 h-16 bg-primary rounded-lg mt-4 items-center justify-center">
            <Text className="text-white text-lg font-bold">Login</Text>
          </TouchableOpacity>
          <Text className="text-black text-md text-center font-bold pt-8 w-3/4">
            {`Create new account? `}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
