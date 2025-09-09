// components/BottomNav.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BottomNavProps {
  active: "Home" | "Diagnose" | "Reminders" | "Profile";
  onNavigate: (screen: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate }) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("Home")}>
        <Ionicons name="home" size={22} color={active === "Home" ? "#1FA498" : "#777"} />
        <Text style={active === "Home" ? styles.navTextActive : styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("PestClassification")}>
        <Ionicons name="compass-outline" size={22} color={active === "Diagnose" ? "#1FA498" : "#777"} />
        <Text style={active === "Diagnose" ? styles.navTextActive : styles.navText}>Diagnose</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("Reminders")}>
        <Ionicons name="alarm-outline" size={22} color={active === "Reminders" ? "#1FA498" : "#777"} />
        <Text style={active === "Reminders" ? styles.navTextActive : styles.navText}>Reminders</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("Profile")}>
        <Ionicons name="person-outline" size={22} color={active === "Profile" ? "#1FA498" : "#777"} />
        <Text style={active === "Profile" ? styles.navTextActive : styles.navText}>Profile</Text>
      </TouchableOpacity>

      {/* Floating Camera Button */}
      <TouchableOpacity style={styles.cameraButton} onPress={() => console.log("Camera pressed")}>
        <Ionicons name="camera-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  navItem: {
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
    alignSelf: "center",
    backgroundColor: "#1FA498",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
