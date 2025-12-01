import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, } from "react-native";
import Checkbox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from '../config/api';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [secure, setSecure] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
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

      console.log("Logging in with:", { email, password });
      console.log("API URL:", API_ENDPOINTS.LOGIN);

      const res = await fetch(API_ENDPOINTS.LOGIN, {  // ← Remove the /login
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", res.status);

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Login failed", data.message || "Invalid credentials");
        return;
      }

      await AsyncStorage.setItem("token", data.token);
      console.log("Login successful, token saved");
      console.log("Token saved:", data.token);
      navigation.reset({
        index: 0,
        routes: [{ name: "HomeScreen" as never }],
      });
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

    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !contactNumber.trim()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (accountType === "farmer" && !farmLocation.trim()) {
      Alert.alert("Error", "Please enter your farm location.");
      return;
    }

    try {
      const requestBody = {
        first_name: firstName,        
        last_name: lastName,          
        email,
        password,
        contact_number: contactNumber, 
        user_type_id: accountType === "farmer" ? 1 : 3,
        farm_location: accountType === "farmer" ? farmLocation : null,
      };

      console.log("Sending registration request:");
      console.log("API URL:", API_ENDPOINTS.REGISTER);
      console.log("Request body:", requestBody);

      const res = await fetch(API_ENDPOINTS.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", res.status);
      
      const data = await res.json();
      console.log("Response data:", data);

      if (!res.ok) {
        // console.error("Registration failed:", data);
        Alert.alert("Registration failed", data.message || JSON.stringify(data));
        return;
      }

      console.log("Registration successful!");
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
                  color={rememberMe ? "#b63c3e" : undefined}
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
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />

            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
            />

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
    color: "#b63c3e",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#b63c3e",
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
    backgroundColor: "#b63c3e",
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
    color: "#b63c3e",
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: "#b63c3e",
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
