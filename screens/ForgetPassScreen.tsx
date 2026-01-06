import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { API_ENDPOINTS } from "../config/api";

const ForgotPasswordScreen: React.FC = () => {
  const [step, setStep] = useState<"contact" | "reset">("contact");
  const [contactType, setContactType] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  /* STEP 1 — SEND CODE */
  const handleRequestCode = async () => {
    if (contactType === "email" && !email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (contactType === "phone" && !phone.trim()) {
      Alert.alert("Error", "Please enter your contact number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_ENDPOINTS.LOGIN.replace("/api/login", "")}/api/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact: contactType === "email" ? email : phone,
            type: contactType,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Contact not found");
        return;
      }

      Alert.alert("Success", "Reset code sent!");
      setStep("reset");
    } catch {
      Alert.alert("Error", "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  /* STEP 2 — RESET PASSWORD */
  const handleResetPassword = async () => {
    if (!resetCode || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_ENDPOINTS.LOGIN.replace("/api/login", "")}/api/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact: contactType === "email" ? email : phone,
            type: contactType,
            code: resetCode,
            new_password: newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Invalid reset code");
        return;
      }

      Alert.alert("Success", "Password reset successfully!");
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#b63c3e" />
        </TouchableOpacity>

        <Text style={styles.title}>Reset Password</Text>

        {/* STEP 1 */}
        {step === "contact" && (
          <>
            <Text style={styles.stepLabel}>Choose Contact Method</Text>
            <Text style={styles.stepDescription}>
              Where should we send the reset code?
            </Text>

            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.contactTab, contactType === "email" && styles.activeContactTab]}
                onPress={() => setContactType("email")}
              >
                <Ionicons name="mail-outline" size={20} color="#b63c3e" />
                <Text>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactTab, contactType === "phone" && styles.activeContactTab]}
                onPress={() => setContactType("phone")}
              >
                <Ionicons name="phone-portrait-outline" size={20} color="#b63c3e" />
                <Text>Phone</Text>
              </TouchableOpacity>
            </View>

            {contactType === "email" && (
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            )}

            {contactType === "phone" && (
              <TextInput
                style={styles.input}
                placeholder="Contact Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={handleRequestCode}>
              <Text style={styles.buttonText}>Send Code</Text>
            </TouchableOpacity>
          </>
        )}

        {/* STEP 2 */}
        {step === "reset" && (
          <>
            <Text style={styles.stepLabel}>Enter Code & New Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Reset Code"
              value={resetCode}
              onChangeText={setResetCode}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={{ flex: 1 }}
                placeholder="New Password"
                secureTextEntry={secure}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Ionicons name={secure ? "eye-off-outline" : "eye-outline"} size={22} />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={{ flex: 1 }}
                placeholder="Confirm Password"
                secureTextEntry={confirmSecure}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setConfirmSecure(!confirmSecure)}>
                <Ionicons name={confirmSecure ? "eye-off-outline" : "eye-outline"} size={22} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;


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
  backButton: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
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
  primaryButton: {
    backgroundColor: "#b63c3e",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
  },
  backLink: {
    color: "#b63c3e",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  tabRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  contactTab: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeContactTab: {
    borderColor: "#b63c3e",
    backgroundColor: "#fff5f5",
  },
  contactTabText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  activeContactTabText: {
    color: "#b63c3e",
    fontWeight: "600",
  },
});