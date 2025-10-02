import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet,  } from "react-native";
import BottomNav from "./layout/BottomNav";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
{/* Header / Top Banner */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Profile</Text>
        </View>

{/* Profile Picture + Info */}
        <View style={styles.profileInfo}>
          <Image
            // source={require("../assets/images/profile-placeholder.png")}
            style={styles.avatar}
          />
          <Text style={styles.name}>Jonas Baluyot</Text>
          <Text style={styles.email}>baluyotjonas@foundationu.com</Text>
        </View>

{/* Options List */}
        <View style={styles.options}>
          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Account Security</Text>
            <Text style={styles.subText}>Excellent</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Saved Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress ={() => navigation.navigate("SettingsScreen" as never)}>
            <Text style={styles.optionText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, styles.logout]}
            onPress={() => navigation.navigate("Login" as never)}
          >
            <Text style={[styles.optionText, { color: "#d9534f" }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ Move BottomNav outside of container so it stays fixed at bottom */}
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
    backgroundColor: "#376F6A", // Match header background for notch area
  },
  container: {
    flex: 1,
    backgroundColor: "#faf8f8",
    paddingHorizontal: 0,
    paddingBottom: 16, // slight bottom padding so last option doesn't touch nav
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
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
  },
  subText: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 5,
  },
  logout: {
    backgroundColor: "#ffe5e5",
  },
});
