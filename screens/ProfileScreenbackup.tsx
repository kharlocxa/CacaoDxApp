import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "./layout/BottomNav";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({
    name: "Loading...",
    email: "Loading...",
  });
  const [securityLevel, setSecurityLevel] = useState({
    score: 0,
    level: "Checking...",
    color: "#999",
  });
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [securityDetails, setSecurityDetails] = useState({
    hasEmail: false,
    hasPhone: false,
    isActive: false,
    isComplete: false,
    hasStrongPassword: false,
  });

  useEffect(() => {
    loadUserData();
    checkAccountSecurity();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setUserInfo({
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const checkAccountSecurity = async () => {
    try {
      let score = 0;
      const details = {
        hasEmail: false,
        hasPhone: false,
        isActive: false,
        isComplete: false,
        hasStrongPassword: false,
      };

      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);

      // 1. Check if email exists and is valid (20 points)
      if (user.email && user.email.includes("@")) {
        score += 20;
        details.hasEmail = true;
      }

      // 2. Check if contact number exists (20 points)
      if (user.contact_number && user.contact_number.length >= 10) {
        score += 20;
        details.hasPhone = true;
      }

      // 3. Check if account is active (20 points)
      if (user.status === "active") {
        score += 20;
        details.isActive = true;
      }

      // 4. Check if profile is complete (20 points)
      if (user.first_name && user.last_name && user.contact_number) {
        score += 20;
        details.isComplete = true;
      }

      // 5. Check password strength metadata if available (20 points)
      const passwordMeta = await AsyncStorage.getItem("password_strength");
      if (passwordMeta) {
        const meta = JSON.parse(passwordMeta);
        if (meta.isStrong) {
          score += 20;
          details.hasStrongPassword = true;
        }
      } else {
        // Default points if no metadata (assume password exists)
        score += 10;
        details.hasStrongPassword = true; // Assume basic password exists
      }

      setSecurityDetails(details);

      // Determine security level based on score
      let level, color;
      if (score >= 80) {
        level = "Excellent";
        color = "#4CAF50";
      } else if (score >= 60) {
        level = "Good";
        color = "#8BC34A";
      } else if (score >= 40) {
        level = "Fair";
        color = "#FF9800";
      } else {
        level = "Weak";
        color = "#F44336";
      }

      setSecurityLevel({ score, level, color });
    } catch (error) {
      console.error("Error checking security:", error);
      setSecurityLevel({ score: 0, level: "Unknown", color: "#999" });
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      navigation.navigate("Login" as never);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header / Top Banner */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Profile</Text>
        </View>

        {/* Profile Picture + Info */}
        <View style={styles.profileInfo}>
          <Image style={styles.avatar} />
          <Text style={styles.name}>{userInfo.name}</Text>
          <Text style={styles.email}>{userInfo.email}</Text>
        </View>

        {/* Options List */}
        <View style={styles.options}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => setSecurityModalVisible(true)}
          >
            <View style={styles.optionRow}>
              <Text style={styles.optionText}>Account Security</Text>
              <View style={styles.securityBadge}>
                <View
                  style={[
                    styles.securityDot,
                    { backgroundColor: securityLevel.color },
                  ]}
                />
                <Text style={[styles.subText, { color: securityLevel.color }]}>
                  {securityLevel.level}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("SavedReports" as never)}
          >
            <Text style={styles.optionText}>Saved Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("SettingsScreen" as never)}
          >
            <Text style={styles.optionText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate("Feedback" as never)}
          >
            <Text style={styles.optionText}>Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, styles.logout]}
            onPress={handleLogout}
          >
            <Text style={[styles.optionText, { color: "#d9534f" }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={securityModalVisible}
        onRequestClose={() => setSecurityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Security</Text>
              <TouchableOpacity onPress={() => setSecurityModalVisible(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Security Score Card */}
              <View style={styles.scoreCard}>
                <View style={styles.scoreCircle}>
                  <Text style={[styles.scoreNumber, { color: securityLevel.color }]}>
                    {securityLevel.score}
                  </Text>
                  <Text style={styles.scoreOutOf}>/ 100</Text>
                </View>
                <Text style={[styles.levelBadge, { color: securityLevel.color }]}>
                  {securityLevel.level}
                </Text>
              </View>

              {/* Security Checks */}
              <View style={styles.checksContainer}>
                <Text style={styles.sectionTitle}>Security Checks</Text>

                <View style={styles.checkItem}>
                  <Ionicons
                    name={securityDetails.hasEmail ? "checkmark-circle" : "close-circle"}
                    size={24}
                    color={securityDetails.hasEmail ? "#4CAF50" : "#F44336"}
                  />
                  <View style={styles.checkTextContainer}>
                    <Text style={styles.checkTitle}>Valid Email</Text>
                    <Text style={styles.checkSubtitle}>
                      {securityDetails.hasEmail
                        ? "Email verified and valid"
                        : "Add a valid email address"}
                    </Text>
                  </View>
                </View>

                <View style={styles.checkItem}>
                  <Ionicons
                    name={securityDetails.hasPhone ? "checkmark-circle" : "close-circle"}
                    size={24}
                    color={securityDetails.hasPhone ? "#4CAF50" : "#F44336"}
                  />
                  <View style={styles.checkTextContainer}>
                    <Text style={styles.checkTitle}>Phone Number</Text>
                    <Text style={styles.checkSubtitle}>
                      {securityDetails.hasPhone
                        ? "Contact number added"
                        : "Add your phone number"}
                    </Text>
                  </View>
                </View>

                <View style={styles.checkItem}>
                  <Ionicons
                    name={securityDetails.isActive ? "checkmark-circle" : "close-circle"}
                    size={24}
                    color={securityDetails.isActive ? "#4CAF50" : "#F44336"}
                  />
                  <View style={styles.checkTextContainer}>
                    <Text style={styles.checkTitle}>Active Account</Text>
                    <Text style={styles.checkSubtitle}>
                      {securityDetails.isActive
                        ? "Your account is active"
                        : "Account needs activation"}
                    </Text>
                  </View>
                </View>

                <View style={styles.checkItem}>
                  <Ionicons
                    name={securityDetails.isComplete ? "checkmark-circle" : "close-circle"}
                    size={24}
                    color={securityDetails.isComplete ? "#4CAF50" : "#F44336"}
                  />
                  <View style={styles.checkTextContainer}>
                    <Text style={styles.checkTitle}>Complete Profile</Text>
                    <Text style={styles.checkSubtitle}>
                      {securityDetails.isComplete
                        ? "Profile information complete"
                        : "Complete your profile"}
                    </Text>
                  </View>
                </View>

                <View style={styles.checkItem}>
                  <Ionicons
                    name={securityDetails.hasStrongPassword ? "checkmark-circle" : "close-circle"}
                    size={24}
                    color={securityDetails.hasStrongPassword ? "#4CAF50" : "#F44336"}
                  />
                  <View style={styles.checkTextContainer}>
                    <Text style={styles.checkTitle}>Strong Password</Text>
                    <Text style={styles.checkSubtitle}>
                      {securityDetails.hasStrongPassword
                        ? "Password meets requirements"
                        : "Use a stronger password"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Recommendations */}
              <View style={styles.recommendationsContainer}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                <View style={styles.recommendationCard}>
                  <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                  <Text style={styles.recommendationText}>
                    Change your password every 3 months
                  </Text>
                </View>
                <View style={styles.recommendationCard}>
                  <Ionicons name="lock-closed" size={20} color="#4CAF50" />
                  <Text style={styles.recommendationText}>
                    Use at least 12 characters with numbers and symbols
                  </Text>
                </View>
                <View style={styles.recommendationCard}>
                  <Ionicons name="finger-print" size={20} color="#4CAF50" />
                  <Text style={styles.recommendationText}>
                    Keep your contact information up to date
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSecurityModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav
        active="Profile"
        onNavigate={(screen) => navigation.navigate(screen as never)}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#376F6A",
  },
  container: {
    flex: 1,
    backgroundColor: "#faf8f8",
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
  header: {
    backgroundColor: "#376F6A",
    paddingVertical: 20,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  profileInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    backgroundColor: "#ddd",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  email: {
    fontSize: 14,
    color: "#555",
  },
  options: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  option: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  securityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  subText: {
    fontSize: 14,
    fontWeight: "600",
  },
  logout: {
    backgroundColor: "#ffe5e5",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  scoreCard: {
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 30,
    borderRadius: 15,
    marginBottom: 25,
  },
  scoreCircle: {
    alignItems: "center",
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "bold",
  },
  scoreOutOf: {
    fontSize: 16,
    color: "#666",
    marginTop: -10,
  },
  levelBadge: {
    fontSize: 20,
    fontWeight: "600",
  },
  checksContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 15,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  checkTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  checkTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  checkSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  closeButton: {
    backgroundColor: "#376F6A",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});