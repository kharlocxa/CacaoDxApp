import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "./layout/BottomNav";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from '../config/api';

const CameraPage: React.FC = () => {
  const navigation = useNavigation();
  const [uploading, setUploading] = useState(false);

  // Function to save image to a dedicated folder
  const saveImageToFolder = async (uri: string, filename: string) => {
    try {
      // Create a directory for cacao images if it doesn't exist
      const directory = `${FileSystem.documentDirectory}cacao_images/`;
      
      try {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      } catch (error) {
        // Directory might already exist, ignore error
      }

      // Copy the image to the new location
      const newPath = `${directory}${filename}`;
      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });

      return newPath;
    } catch (error) {
      console.error("Error saving image:", error);
      throw error;
    }
  };

  // Function to upload image and get diagnosis
  const uploadImageForDiagnosis = async (imageUri: string, source: 'camera' | 'gallery') => {
    setUploading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please log in to use this feature.");
        setUploading(false);
        return;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `cacao_${timestamp}.jpg`;

      // Save image locally first
      const savedPath = await saveImageToFolder(imageUri, filename);
      console.log("Image saved locally at:", savedPath);

      // Prepare form data for upload
      const formData = new FormData();
      
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
      } as any);

      formData.append('source', source);

      // Upload to your backend API for ML diagnosis
      console.log("Uploading to:", API_ENDPOINTS.DIAGNOSIS_UPLOAD);
      console.log("Token:", token.substring(0, 20) + "...");
      
      const response = await fetch(API_ENDPOINTS.DIAGNOSIS_UPLOAD, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Response status:", response.status);
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log("Failed to parse JSON:", e);
        throw new Error(`Server returned: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}: Failed to upload image`);
      }

      // Navigate to results screen with diagnosis data
      const pestInfo = data.pest_info ? {
        name: data.pest_info.name,
        scientific_name: data.pest_info.scientific_name || '',
        description: data.pest_info.description || '',
        damage: data.pest_info.damage || ''
      } : null;

      navigation.navigate('DiagnosisResult' as never, {
        imageUri: savedPath,
        diagnosisId: data.diagnosis_id,
        diseaseId: data.disease_id,
        diseaseName: data.disease_name,
        diseaseType: data.disease_type,
        affectedPart: data.affected_part,
        confidence: data.confidence,
        cause: data.cause || 'No information available',
        pestInfo: pestInfo,
        treatments: data.treatments || [],
        message: data.disease_type === 'None' ? 'Your cacao plant appears to be healthy!' : undefined,
      } as never);

    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Error", error.message || "Failed to process image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Open Camera
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access is needed to capture images.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],  // ← Fixed: Use array instead of deprecated MediaTypeOptions
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImageForDiagnosis(result.assets[0].uri, 'camera');
    }
  };

  // Open Gallery/Photos
  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Photo library access is needed to select images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],  // ← Fixed: Use array instead of deprecated MediaTypeOptions
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImageForDiagnosis(result.assets[0].uri, 'gallery');
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
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={openGallery}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            )}
          </TouchableOpacity>

          <View style={styles.uploadDetails}>
            <Ionicons name="image-outline" size={24} color="#000" />
            <Text style={styles.uploadText}>Select from gallery</Text>
            <Text style={styles.uploadSubText}>Photos will be analyzed for disease detection</Text>
          </View>
        </View>

        {/* Capture Button */}
        <View style={styles.captureBox}>
          <TouchableOpacity 
            style={styles.captureButton} 
            onPress={openCamera}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <Ionicons name="camera-outline" size={40} color="#fff" />
            )}
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

      {/* Floating AI Icon
      <TouchableOpacity
        style={styles.floatingAI}
        onPress={() => navigation.navigate("ChatBotScreen" as never)}
      >
        <Image
          style={styles.cacaoIcon}
          source={require("../assets/homepics/cacaoAI.png")}
        />
      </TouchableOpacity> */}

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
    minWidth: 150,
    alignItems: "center",
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
    fontWeight: "500",
  },
  uploadSubText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
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