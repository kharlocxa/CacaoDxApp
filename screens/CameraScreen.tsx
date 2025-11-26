import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "./layout/BottomNav";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";



const CameraPage: React.FC = () => {
  const navigation = useNavigation();

  const openCamera = async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Camera access is needed to capture images.");
        return;
      }
  
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled) {
        console.log("Captured image:", result.assets[0].uri);
        // router.push({ pathname: "/capture-result", params: { uri: result.assets[0].uri } });
      }
    };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.topBanner}>
          <Text style={styles.bannerTitle}>Cao</Text>
          <Image
            source={require("../assets/homepics/cacaoAI.png")}
            style={styles.bannerIcon}
          />
        </View>

        {/* Upload Box */}
        <View style={styles.uploadBox}>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>

          <View style={styles.uploadDetails}>
            <Ionicons name="image-outline" size={24} color="#000" />
            <Text style={styles.uploadText}>or drop a file,</Text>
            <Text style={styles.uploadLink}>paste image or URL</Text>
          </View>
        </View>

        {/* Capture Button */}
        <View style={styles.captureBox}>
          <TouchableOpacity style={styles.captureButton} onPress={openCamera}>
            <Ionicons name="camera-outline" size={40} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.captureText}>capture image</Text>
        </View>

        {/* Info Text */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Scan cacao plants to diagnose diseases, detect pests, and get
            treatment advice.
          </Text>
        </View>
      </View>

      {/* Floating AI Icon */}
      <TouchableOpacity
        style={styles.floatingAI}
        onPress={() => navigation.navigate("ChatBotScreen" as never)}
      >
        <Image
          style={styles.cacaoIcon}
          source={require("../assets/homepics/cacaoAI.png")}
        />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <BottomNav
        active="Camera"
        onNavigate={(screen) => navigation.navigate(screen as never)}
      />
    </SafeAreaView>
  );
};

export default CameraPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  container: {
    padding: 16,
    paddingBottom: 140,
  },
  // Top Banner
  topBanner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
    gap: 1,
  },
  bannerTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#d34c4e",
    textShadowColor: "#00000040",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerIcon: {
    width: 60,
    height: 60,
    marginLeft: 8,
    resizeMode: "contain",
  },
  uploadBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  uploadButton: {
    backgroundColor: "#b63c3e",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  uploadButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  uploadDetails: {
    alignItems: "center",
  },
  uploadText: {
    fontSize: 16,
    marginTop: 8,
    color: "#000",
  },
  uploadLink: {
    fontSize: 14,
    color: "#b63c3e",
    textDecorationLine: "underline",
    marginTop: 4,
  },
  captureBox: {
    alignItems: "center",
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: "#b63c3e",
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  captureText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginTop: 12,
    textTransform: "capitalize",
  },
  infoSection: {
    alignItems: "center",
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    color: "#333",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  floatingAI: {
    position: "absolute",
    bottom: 80,
    right: 15,
    zIndex: 20,
  },
  cacaoIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
});
