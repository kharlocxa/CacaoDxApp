import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Modal, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_ENDPOINTS } from '../config/api';

const SettingsScreen: React.FC = ({ navigation }: any) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"name" | "email" | "contact" | "password">("name");
  const [modalValue, setModalValue] = useState("");
  const [modalValue2, setModalValue2] = useState(""); // For first/last name
  const [secure, setSecure] = useState(true);

  // Load current profile info
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        console.log("Fetching profile from:", API_ENDPOINTS.PROFILE);

        const response = await fetch(API_ENDPOINTS.PROFILE, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Response status:", response.status);

        const data = await response.json();
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setEmail(data.email || "");
        setContactNumber(data.contact_number || "");
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Open edit modal
  const openModal = (type: "name" | "email" | "contact" | "password") => {
    setModalType(type);
    if (type === "name") {
      setModalValue(firstName);
      setModalValue2(lastName);
    } else if (type === "email") {
      setModalValue(email);
    } else if (type === "contact") {
      setModalValue(contactNumber);
    } else {
      setModalValue("");
    }
    setShowModal(true);
    setSecure(true);
  };

  // Handle Save from modal
  const handleModalSave = async () => {
    if (modalType === "name" && (!modalValue || !modalValue2)) {
      Alert.alert("Error", "Both first and last name are required.");
      return;
    }
    if ((modalType === "email" || modalType === "contact") && !modalValue) {
      Alert.alert("Error", "This field is required.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Session expired. Please log in again.");
        return;
      }

      const updateData: any = {};
      
      if (modalType === "name") {
        updateData.first_name = modalValue;
        updateData.last_name = modalValue2;
      } else if (modalType === "email") {
        updateData.email = modalValue;
      } else if (modalType === "contact") {
        updateData.contact_number = modalValue;
      } else if (modalType === "password") {
        if (!modalValue) {
          Alert.alert("Error", "Password cannot be empty.");
          return;
        }
        updateData.password = modalValue;
      }

      const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update");
      }

      // Update local state
      if (modalType === "name") {
        setFirstName(modalValue);
        setLastName(modalValue2);
      } else if (modalType === "email") {
        setEmail(modalValue);
      } else if (modalType === "contact") {
        setContactNumber(modalValue);
      }

      Alert.alert("Success", "Updated successfully.");
      setShowModal(false);
    } catch (error: any) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("userToken");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  if (loading && !firstName) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#b63c3e" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          {/* Name */}
          <TouchableOpacity style={styles.settingItem} onPress={() => openModal("name")}>
            <View style={styles.settingLeft}>
              <Ionicons name="person-outline" size={22} color="#666" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Name</Text>
                <Text style={styles.settingValue}>
                  {firstName} {lastName}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity style={styles.settingItem} onPress={() => openModal("email")}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={22} color="#666" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Email</Text>
                <Text style={styles.settingValue}>{email}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* Contact Number */}
          <TouchableOpacity style={styles.settingItem} onPress={() => openModal("contact")}>
            <View style={styles.settingLeft}>
              <Ionicons name="call-outline" size={22} color="#666" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Contact Number</Text>
                <Text style={styles.settingValue}>{contactNumber || "Not set"}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* Password */}
          <TouchableOpacity style={styles.settingItem} onPress={() => openModal("password")}>
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed-outline" size={22} color="#666" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Password</Text>
                <Text style={styles.settingValue}>••••••••</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {modalType === "name" ? "Name" : modalType === "email" ? "Email" : modalType === "contact" ? "Contact Number" : "Password"}
            </Text>

            {modalType === "name" ? (
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="First Name"
                  value={modalValue}
                  onChangeText={setModalValue}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Last Name"
                  value={modalValue2}
                  onChangeText={setModalValue2}
                />
              </>
            ) : modalType === "password" ? (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.modalInput, styles.passwordInput]}
                  placeholder="New Password"
                  value={modalValue}
                  onChangeText={setModalValue}
                  secureTextEntry={secure}
                />
                <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeButton}>
                  <Ionicons name={secure ? "eye-off-outline" : "eye-outline"} size={22} color="#666" />
                </TouchableOpacity>
              </View>
            ) : (
              <TextInput
                style={styles.modalInput}
                placeholder={modalType === "email" ? "Email" : "Contact Number"}
                value={modalValue}
                onChangeText={setModalValue}
                keyboardType={modalType === "email" ? "email-address" : "phone-pad"}
                autoCapitalize="none"
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleModalSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#b63c3e",
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 15,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 13,
    color: "#65676b",
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d32f2f",
  },
  logoutText: {
    color: "#d32f2f",
    fontSize: 16,
    fontWeight: "600",
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 13,
    color: "#65676b",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 15,
    color: "#000",
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 8,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f2f5",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#b63c3e",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});