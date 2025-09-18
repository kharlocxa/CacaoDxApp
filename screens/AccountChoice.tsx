import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const AccountChoice: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login As:</Text>

      {/* 👤 Normal User */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("Login" as never, {
            accountType: "student",  // ✅ Pass param
            openTab: "register",    // ✅ Tell LoginScreen to open register tab
          } as never)
        }
      >
        <Text style={styles.buttonText}>Student</Text>
      </TouchableOpacity>

      {/* 👨‍🌾 Farmer */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#1FA498" }]}
        onPress={() =>
          navigation.navigate("Login" as never, {
            accountType: "farmer",
            openTab: "register",
          } as never)
        }
      >
        <Text style={styles.buttonText}>Farmer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AccountChoice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  button: {
    width: "80%",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
