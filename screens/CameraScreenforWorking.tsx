import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Linking, Alert, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "./layout/BottomNav";
import { useNavigation } from "@react-navigation/native";
import { Camera, CameraType } from "expo-camera";




const CameraPage: React.FC = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  // Ask for camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      setCameraOpen(false); // close camera after capture
    }
  };

  if (hasPermission === null) {
    return <View><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View><Text>No access to camera</Text></View>;
  }

  // Camera fullscreen view
  if (cameraOpen) {
    return (
      <View style={{ flex: 1 }}>
        <Camera style={{ flex: 1 }} type={CameraType.back} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
              <Ionicons name="radio-button-on" size={70} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCameraOpen(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔝 Top Banner */}
        <View style={styles.topBanner}>
          <Text style={styles.bannerTitle}>Cao</Text>
          <Image
            source={require("./cacao-icons-1-removebg-preview-1.png")}
            style={styles.bannerIcon}
          />
        </View>

        {/* 📤 Upload Box */}
        <View style={styles.uploadBox}>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>

          <View style={styles.uploadDetails}>
            <Ionicons name="image-outline" size={24} color="#000" />
            <Text style={styles.uploadText}>or drop a file</Text>
            <Text
              style={styles.uploadLink}
              onPress={() => Linking.openURL("https://www.remove.bg/#")}
            >
              paste image or URL
            </Text>
          </View>
        </View>

        {/* 📸 Capture Button */}
        <View style={styles.captureBox}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={() => setCameraOpen(true)}
          >
            <Ionicons name="camera-outline" size={40} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.captureText}>Capture Image</Text>
        </View>

        {/* Show captured photo preview */}
        {photoUri && (
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
        )}

        {/* ℹ️ Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Scan cacao plants to diagnose diseases, detect pests, and get
            treatment advice.
          </Text>
          <Image
            source={require("./cacao-icons-1-removebg-preview-2.png")}
            style={styles.cacaoIcon}
          />
        </View>
      </ScrollView>

      {/* 🔽 Bottom Navigation */}
      <BottomNav
        active="Diagnose"
        onNavigate={(screen) => navigation.navigate(screen as never)}
      />
    </View>
  );
};

export default CameraPage;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  container: {
    padding: 16,
    paddingBottom: 120,
  },
  topBanner: {
    backgroundColor: "#376F6A",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#1EA498",
  },
  bannerIcon: {
    width: 60,
    height: 60,
    marginLeft: 10,
    resizeMode: "contain",
  },
  uploadBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
    elevation: 3,
  },
  uploadButton: {
    backgroundColor: "#1EA498",
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
    color: "#1EA498",
    textDecorationLine: "underline",
    marginTop: 4,
  },
  captureBox: {
    alignItems: "center",
    marginBottom: 30,
  },
  captureButton: {
    backgroundColor: "#1EA498",
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  captureText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginTop: 12,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
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
  cacaoIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  // Camera controls overlay
  cameraControls: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
  },
  shutterButton: {
    alignSelf: "center",
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },
});
