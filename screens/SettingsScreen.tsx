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
  const [modalType, setModalType] = useState<"name" | "email" | "contact">("name");
  const [modalValue, setModalValue] = useState("");
  const [modalValue2, setModalValue2] = useState(""); // For first/last name

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
  const openModal = (type: "name" | "email" | "contact") => {
    setModalType(type);
    if (type === "name") {
      setModalValue(firstName);
      setModalValue2(lastName);
    } else if (type === "email") {
      setModalValue(email);
    } else if (type === "contact") {
      setModalValue(contactNumber);
    }
    setShowModal(true);
  };

  // Handle Save from modal
  const handleModalSave = async () => {
    // Validate Name
    if (modalType === "name") {
      const trimmedFirstName = modalValue.trim();
      const trimmedLastName = modalValue2.trim();
      
      if (!trimmedFirstName || !trimmedLastName) {
        Alert.alert("Error", "Both first and last name are required and cannot be empty or contain only spaces.");
        return;
      }
      
      // Update the values to trimmed versions
      setModalValue(trimmedFirstName);
      setModalValue2(trimmedLastName);
    }
    
    // Validate Email
    if (modalType === "email") {
      const trimmedEmail = modalValue.trim();
      if (!trimmedEmail) {
        Alert.alert("Error", "Email is required and cannot be empty or contain only spaces.");
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        Alert.alert("Error", "Please enter a valid email address.");
        return;
      }
      
      setModalValue(trimmedEmail);
    }
    
    // Validate Contact Number
    if (modalType === "contact") {
      const trimmedContact = modalValue.trim();
      if (!trimmedContact) {
        Alert.alert("Error", "Contact number is required and cannot be empty or contain only spaces.");
        return;
      }
      setModalValue(trimmedContact);
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
        updateData.first_name = modalValue.trim();
        updateData.last_name = modalValue2.trim();
      } else if (modalType === "email") {
        updateData.email = modalValue.trim();
      } else if (modalType === "contact") {
        updateData.contact_number = modalValue.trim();
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

      // Update local state with trimmed values
      if (modalType === "name") {
        setFirstName(modalValue.trim());
        setLastName(modalValue2.trim());
      } else if (modalType === "email") {
        setEmail(modalValue.trim());
      } else if (modalType === "contact") {
        setContactNumber(modalValue.trim());
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
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          {/* Account Security - Navigate to AccountSecurityScreen */}
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => navigation.navigate("AccountSecurityScreen" as never)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed-outline" size={22} color="#666" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Account Security</Text>
                <Text style={styles.settingValue}>Change password and security settings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal - Slides from bottom */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit {modalType === "name" ? "Name" : modalType === "email" ? "Email" : "Contact Number"}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {modalType === "name" ? (
                <>
                  {/* First Name Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Enter first name"
                      value={modalValue}
                      onChangeText={setModalValue}
                    />
                  </View>

                  {/* Last Name Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Enter last name"
                      value={modalValue2}
                      onChangeText={setModalValue2}
                    />
                  </View>
                </>
              ) : modalType === "email" ? (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter email address"
                    value={modalValue}
                    onChangeText={setModalValue}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter phone number"
                    value={modalValue}
                    onChangeText={setModalValue}
                    keyboardType="phone-pad"
                  />
                </View>
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
          </TouchableOpacity>
        </TouchableOpacity>
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
  // Modal styles - Bottom sheet style
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    fontSize: 15,
    color: "#000",
    borderWidth: 1,
    borderColor: "transparent",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f2f5",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#b63c3e",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});