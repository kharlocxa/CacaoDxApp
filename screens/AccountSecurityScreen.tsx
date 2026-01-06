import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../config/api";

const AccountSecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: "None", color: "#ccc", width: 0 };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { strength: "Weak", color: "#d9534f", width: "33%" };
    if (score <= 3) return { strength: "Fair", color: "#f0ad4e", width: "66%" };
    return { strength: "Strong", color: "#5cb85c", width: "100%" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Error", "New password must be different from current password");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session expired", "Please log in again");
        navigation.navigate("Login" as never);
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.PROFILE}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to change password");
        return;
      }

      Alert.alert(
        "Success",
        "Password changed successfully. Please log in again.",
        [
          {
            text: "OK",
            onPress: async () => {
              await AsyncStorage.multiRemove(["token", "userToken", "user"]);
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" as never }],
              });
            },
          },
        ]
      );

      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Account Security</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Security Status */}
          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <Ionicons name="shield-checkmark" size={48} color="#5cb85c" />
            </View>
            <Text style={styles.securityTitle}>Account Protected</Text>
            <Text style={styles.securitySubtitle}>
              Your account is secured with a password
            </Text>
          </View>

          {/* Change Password Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>

            {/* Current Password */}
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowCurrent(!showCurrent)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showCurrent ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNew(!showNew)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showNew ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: passwordStrength.width,
                        backgroundColor: passwordStrength.color,
                      } as any,
                    ]}
                  />
                </View>
                <Text
                  style={[styles.strengthText, { color: passwordStrength.color }]}
                >
                  {passwordStrength.strength}
                </Text>
              </View>
            )}

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirm ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <Text style={styles.requirementItem}>• At least 6 characters</Text>
              <Text style={styles.requirementItem}>
                • Mix of uppercase and lowercase (recommended)
              </Text>
              <Text style={styles.requirementItem}>
                • Include numbers (recommended)
              </Text>
              <Text style={styles.requirementItem}>
                • Include special characters (recommended)
              </Text>
            </View>

            {/* Change Password Button */}
            <TouchableOpacity
              style={[styles.changeButton, loading && styles.disabledButton]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.changeButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AccountSecurityScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#b63c3e",
  },
  container: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  header: {
    backgroundColor: "#b63c3e",
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  securityCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  securityIcon: {
    marginBottom: 15,
  },
  securityTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  securitySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  strengthContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  strengthBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 5,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  requirements: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  changeButton: {
    backgroundColor: "#b63c3e",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  changeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});