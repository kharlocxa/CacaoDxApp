import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, } from "react-native";
import Checkbox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS, getAuthHeaders } from "../config/api";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [secure, setSecure] = useState(true);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [farmLocation, setFarmLocation] = useState(""); //NEW: farm location input

  const navigation = useNavigation();
  const route = useRoute();

  // Get accountType from navigation params (passed from your account choice screen)
  const accountType = (route.params as { accountType?: "student" | "farmer" })
    ?.accountType || "student";

  // const API_URL = "http://192.168.137.1:5000/api";

  // const API_URL = "https://Kharlo.local:5000/api"; 

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.LOGIN}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Login failed", data.message || "Invalid credentials");
        return;
      }

      await AsyncStorage.setItem("token", data.token);
      navigation.navigate("HomeScreen" as never);
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong, try again.");
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    if (accountType === "farmer" && !farmLocation.trim()) {
      Alert.alert("Error", "Please enter your farm location.");
      return;
    }

    try {
      const res = await fetch(`${API_ENDPOINTS.REGISTER}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: "Test",
          last_name: "User",
          email,
          password,
          contact_number: "0000000000",
          user_type_id: accountType === "farmer" ? 2 : 1, // auto-assign farmer
          farm_location: accountType === "farmer" ? farmLocation : null, // send farm location if farmer
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Register failed", data.message || "Try again");
        return;
      }

      Alert.alert("Success", "Account created. Please login.");
      setActiveTab("login");
    } catch (error) {
      console.error("Register error:", error);
      Alert.alert("Error", "Something went wrong, try again.");
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "login" && styles.activeTab]}
            onPress={() => setActiveTab("login")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "login" && styles.activeTabText,
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "register" && styles.activeTab]}
            onPress={() => setActiveTab("register")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "register" && styles.activeTabText,
              ]}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabUnderline}>
          <View
            style={[styles.indicator, activeTab === "register" && { left: "50%" }]}
          />
        </View>

        {/* LOGIN FORM */}
        {activeTab === "login" && (
          <>
            <Text style={styles.title}>
              Sign In ({accountType === "farmer" ? "Farmer" : "Student"})
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
              />
              <TouchableOpacity
                onPress={() => setSecure(!secure)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={secure ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#444"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.options}>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  color={rememberMe ? "#1FA498" : undefined}
                  style={styles.checkbox}
                />
                <Text style={styles.checkboxLabel}>Remember Me</Text>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert("Forgot password pressed")}
              >
                <Text style={styles.link}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* REGISTER FORM */}
        {activeTab === "register" && (
          <>
            <Text style={styles.title}>
              Create Account ({accountType === "farmer" ? "Farmer" : "Student"})
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
              />
              <TouchableOpacity
                onPress={() => setSecure(!secure)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={secure ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#444"
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* Show Farm Location field only for Farmer */}
            {accountType === "farmer" && (
              <TextInput
                style={styles.input}
                placeholder="Farm Location"
                value={farmLocation}
                onChangeText={setFarmLocation}
              />
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRegister}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default LoginScreen;

// (styles unchanged — keep your original)

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#faf8f8",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "100%",
    maxWidth: 400,
    padding: 20,
    elevation: 3,
  },
  // Tabs
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: "#777",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#018241",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#018241",
  },
  tabUnderline: {
    height: 2,
    backgroundColor: "#ccc",
    marginBottom: 20,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "50%",
    height: 2,
    backgroundColor: "#018241",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 15,
    textAlign: "center",
  },
  signupLink: {
    color: "#018241",
    marginBottom: 20,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  eyeButton: {
    padding: 10,
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  link: {
    color: "#018241",
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: "#018241",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    
  },
});
