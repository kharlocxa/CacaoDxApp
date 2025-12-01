// components/BottomNav.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BottomNavProps {
  active: "Home" | "History" | "Camera" | "Reminders" | "Profile";
  onNavigate: (screen: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bottomNav}>
        {/* Home */}
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("HomeScreen")}>
          <Ionicons name="home" size={22} color={active === "Home" ? "#b63c3e" : "#777"} />
          <Text style={active === "Home" ? styles.navTextActive : styles.navText}>Home</Text>
        </TouchableOpacity>

        {/* History */}
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("DiagnosticHistory")}>
          <Ionicons
            name="compass-outline"
            size={22}
            color={active === "History" ? "#b63c3e" : "#777"}
          />
          <Text style={active === "History" ? styles.navTextActive : styles.navText}>
            History
          </Text>
        </TouchableOpacity>

        {/* Empty space for floating camera button */}
        <View style={styles.navItem} />

        {/* Reminders */}
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("RemindersScreen")}>
          <Ionicons
            name="alarm-outline"
            size={22}
            color={active === "Reminders" ? "#b63c3e" : "#777"}
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
            color={active === "Profile" ? "#b63c3e" : "#777"}
          />
          <Text style={active === "Profile" ? styles.navTextActive : styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Camera Button (always visible on all screens) */}
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => onNavigate("CameraScreen")}
      >
        <Ionicons name="camera-outline" size={28} color="#fff" />
      </TouchableOpacity>
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
    color: "#b63c3e",
    fontWeight: "bold",
  },
  cameraButton: {
    position: "absolute",
    top: -30,
    backgroundColor: "#b63c3e",
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  cameraButtonActive: {
    backgroundColor: "#b63c3e",
    transform: [{ scale: 1.1 }],
  },
});
