import { TouchableOpacity, View, Text } from "react-native";
import "../global.css";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TouchableOpacity
        onPress={() => alert("test")}
        className="bg-red-500 p-4 rounded-lg"
      >
        <Text className="text-white">Welcome to Life Companion!!!</Text>
      </TouchableOpacity>
    </View>
  );
}
