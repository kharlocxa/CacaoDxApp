// components/BottomNav.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BottomNavProps {
  active: "Home" | "Diagnose" | "Camera" | "Reminders" | "Profile";
  onNavigate: (screen: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate }) => {
  const isHome = active === "Home";

  return (
    <View style={styles.wrapper}>
      <View style={styles.bottomNav}>
        {/* Home */}
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("HomeScreen")}>
          <Ionicons name="home" size={22} color={active === "Home" ? "#1FA498" : "#777"} />
          <Text style={active === "Home" ? styles.navTextActive : styles.navText}>Home</Text>
        </TouchableOpacity>

        {/* Diagnose */}
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("CameraScreen")}>
          <Ionicons
            name="compass-outline"
            size={22}
            color={active === "Diagnose" ? "#1FA498" : "#777"}
          />
          <Text style={active === "Diagnose" ? styles.navTextActive : styles.navText}>
            Diagnose
          </Text>
        </TouchableOpacity>

        {/* Camera (special handling) */}
        {isHome ? (
          // Floating button when on Home
          <View style={styles.navItem} />
        ) : (
          // Normal button on other screens
          <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("CameraScreen")}>
            <Ionicons
              name="camera-outline"
              size={22}
              color={active === "Camera" ? "#1FA498" : "#777"}
            />
            <Text style={active === "Camera" ? styles.navTextActive : styles.navText}>Camera</Text>
          </TouchableOpacity>
        )}

        {/* Reminders */}
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("RemindersScreen")}>
          <Ionicons
            name="alarm-outline"
            size={22}
            color={active === "Reminders" ? "#1FA498" : "#777"}
          />
          <Text style={active === "Reminders" ? styles.navTextActive : styles.navText}>
            Reminders
          </Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("ProfileScreen")}>
          <Ionicons
            name="person-outline"
            size={22}
            color={active === "Profile" ? "#1FA498" : "#777"}
          />
          <Text style={active === "Profile" ? styles.navTextActive : styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Camera Button (only when Home is active) */}
      {isHome && (
        <TouchableOpacity
          style={[styles.cameraButton, active === "Camera" && styles.cameraButtonActive]}
          onPress={() => onNavigate("CameraScreen")}
        >
          <Ionicons name="camera-outline" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    justifyContent: "space-between",
    paddingVertical: 10,
    width: "100%",
    paddingHorizontal: 25,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#777",
  },
  navTextActive: {
    fontSize: 12,
    color: "#1FA498",
    fontWeight: "bold",
  },
  cameraButton: {
    position: "absolute",
    top: -30,
    backgroundColor: "#1FA498",
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  cameraButtonActive: {
    backgroundColor: "#168579",
    transform: [{ scale: 1.1 }],
  },
});
