import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "./layout/BottomNav";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { API_ENDPOINTS } from '../config/api';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();

  const [user, setUser] = useState<{ 
    first_name: string; 
    last_name: string; 
    email: string;
    contact_number?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Session expired", "Please log in again.");
          navigation.navigate("Login" as never);
          return;
        }

        console.log("Fetching profile from:", API_ENDPOINTS.PROFILE);

        const response = await fetch(API_ENDPOINTS.PROFILE, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.log("Error:", errorText);
          throw new Error("Failed to load profile");
        }

        const data = await response.json();
        console.log("Profile data:", data);
        setUser(data);
      } catch (error) {
        console.error("Profile fetch error:", error);
        Alert.alert("Error", "Unable to fetch profile info");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const headers = { Authorization: `Bearer ${token}` };
              const response = await fetch(API_ENDPOINTS.LOGOUT, {
                method: "POST",
                headers,
              });

              if (!response.ok) {
                console.warn("Logout failed:", await response.text());
              }

              await AsyncStorage.multiRemove(["token", "userToken", "user"]);

              navigation.reset({
                index: 0,
                routes: [{ name: "Login" as never }],
              });
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Network Error", "Unable to reach the server. Check your internet or API URL.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#b63c3e" />
          </View>
        ) : (
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerText}>Profile</Text>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <View style={styles.avatar}>
                <Image
                  source={require("../assets/homepics/cacaopod.png")}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.name}>
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : "Unknown User"}
              </Text>
              <Text style={styles.email}>{user?.email || "No email"}</Text>
              {user?.contact_number && (
                <Text style={styles.contact}>{user.contact_number}</Text>
              )}
            </View>

            {/* Options */}
            <View style={styles.options}>
              <TouchableOpacity 
                style={styles.option}
                onPress={() => navigation.navigate("AccountSecurityScreen" as never)}
              >
                <Text style={styles.optionText}>Account Security</Text>
                <Text style={styles.subText}>Change your password</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option}>
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
                onPress={() => navigation.navigate("FeedbackScreen" as never)}
              >
                <Text style={styles.optionText}>Feedback</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, styles.logout]}
                onPress={handleLogout}
              >
                <Text style={[styles.optionText, { color: "#d9534f" }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Bottom navigation always visible */}
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
    backgroundColor: "#b63c3e",
  },
  container: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#faf8f8",
  },
  header: {
    backgroundColor: "#b63c3e",
    paddingVertical: 10,
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
    borderWidth: 3,
    borderColor: "#000000ff",
    overflow: "hidden",
    backgroundColor: "#2e2e2e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  email: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  contact: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
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
    color: "#999",
    marginTop: 5,
  },
  logout: {
    backgroundColor: "#ffe5e5",
  },
});