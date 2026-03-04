import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; 
 

const AccountChoice: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="bug" size={64} color="#b63c3e" />
        </View>
      </View>

      {/* App Title */}
      <Text style={styles.title}>CacaoDX</Text>
      <Text style={styles.subtitle}>Cacao Disease Detection System</Text>

      {/* Description */}
      <Text style={styles.description}>
        Detect cacao plant diseases using AI technology.{"\n"}
        Get instant diagnosis and treatment recommendations.
      </Text>

      {/* Student Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("Login" as never, {
            accountType: "student",
            openTab: "register",
          } as never)
        }
      >
        <Text style={styles.buttonText}>Student</Text>
      </TouchableOpacity>

      {/* Farmer Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("Login" as never, {
            accountType: "farmer",
            openTab: "register",
          } as never)
        }
      >
        <Text style={styles.buttonText}>Farmer</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footer}>© 2025 CacaoDX. All rights reserved.</Text>
    </View>
  );
};

export default AccountChoice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    paddingBottom: 75,
    backgroundColor: "#faf8f8",
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    backgroundColor: "#fff",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 48,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 64,
    paddingHorizontal: 20,
  },
  button: {
    width: "80%",
    backgroundColor: "#b63c3e",
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
  footer: {
    position: "absolute",
    bottom: 32,
    fontSize: 14,
    color: "#666",
  },
});