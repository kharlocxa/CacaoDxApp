import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "./layout/BottomNav";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders, getMultipartHeaders } from "../config/api";

interface Farm {
  id: number;
  farm_name: string;
  barangay: string;
  municipality: string;
}

const CameraPage: React.FC = () => {
  const navigation = useNavigation();
  const [uploading, setUploading] = useState(false);
  const [noCacaoModal, setNoCacaoModal] = useState(false);
  const [noCacaoMessage, setNoCacaoMessage] = useState("");
  const [lastSource, setLastSource] = useState<"camera" | "gallery">("camera");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);
  const [loadingFarms, setLoadingFarms] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    setLoadingFarms(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/farms`, { method: "GET", headers });
      const rawText = await response.text();
      let data: any;
      try { data = JSON.parse(rawText); } catch { return; }
      if (response.ok && data.status === "success" && Array.isArray(data.farms)) {
        const normalized: Farm[] = data.farms.map((f: any) => ({
          id:           Number(f.id),
          farm_name:    String(f.farm_name),
          barangay:     String(f.barangay),
          municipality: String(f.municipality),
        }));
        setFarms(normalized);
      }
    } catch (e) {
      console.error("fetchFarms error:", e);
    } finally {
      setLoadingFarms(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") getCurrentLocation();
    } catch {}
  };

  const getCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      const [addr] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (addr) setLocationName([addr.city || addr.district, addr.region, addr.country].filter(Boolean).join(", ") || "Unknown Location");
    } catch {}
  };

  const saveImageToFolder = async (uri: string, filename: string) => {
    const dir = `${FileSystem.documentDirectory}cacao_images/`;
    try { await FileSystem.makeDirectoryAsync(dir, { intermediates: true }); } catch {}
    const path = `${dir}${filename}`;
    await FileSystem.copyAsync({ from: uri, to: path });
    return path;
  };

  const uploadImageForDiagnosis = async (imageUri: string, source: "camera" | "gallery") => {
    setUploading(true);
    setLastSource(source);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) { Alert.alert("Error", "Please log in."); return; }
      const multipartHeaders = await getMultipartHeaders();
      const filename = `cacao_${Date.now()}.jpg`;
      const savedPath = await saveImageToFolder(imageUri, filename);
      const formData = new FormData();
      formData.append("image", { uri: imageUri, name: filename, type: "image/jpeg" } as any);
      formData.append("source", source);
      if (location) {
        formData.append("latitude", location.latitude.toString());
        formData.append("longitude", location.longitude.toString());
      }
      if (locationName) formData.append("location_name", locationName);
      if (selectedFarm)  formData.append("farm_id", selectedFarm.id.toString());

      const response = await fetch(API_ENDPOINTS.DIAGNOSIS_UPLOAD, { method: "POST", headers: multipartHeaders, body: formData });
      const responseText = await response.text();
      let data: any;
      try { data = JSON.parse(responseText); } catch { throw new Error(`Server returned: ${responseText}`); }

      if (data.status === "no_cacao") { setNoCacaoMessage(data.message || "No cacao pod detected."); setNoCacaoModal(true); return; }
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);

      if (data.status === "success") {
        const pestInfo = data.pest_info ? { name: data.pest_info.name, scientific_name: data.pest_info.scientific_name || "", description: data.pest_info.description || "", damage: data.pest_info.damage || "" } : null;
        const confidence = typeof data.confidence === "string" ? parseFloat(data.confidence) : data.confidence ?? 0;
        navigation.navigate("DiagnosisResult" as never, {
          imageUri: savedPath, diagnosisId: data.diagnosis_id, diseaseId: data.disease_id,
          diseaseName: data.disease_name, diseaseType: data.disease_type, affectedPart: data.affected_part,
          confidence, cause: data.cause || "No information available", pestInfo, treatments: data.treatments || [],
          message: data.disease_type === "None" ? "Your cacao plant appears to be healthy!" : undefined,
          locationName: locationName || null, latitude: location?.latitude ?? null, longitude: location?.longitude ?? null,
          farmId: selectedFarm?.id ?? null, farmName: selectedFarm?.farm_name ?? null,
        } as never);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  const openCamera = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (!p.granted) { Alert.alert("Permission required", "Camera access is needed."); return; }
    const r = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 1 });
    if (!r.canceled && r.assets[0]) await uploadImageForDiagnosis(r.assets[0].uri, "camera");
  };

  const openGallery = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) { Alert.alert("Permission required", "Photo library access is needed."); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 1 });
    if (!r.canceled && r.assets[0]) await uploadImageForDiagnosis(r.assets[0].uri, "gallery");
  };

  const handleRetry = () => {
    setNoCacaoModal(false);
    if (lastSource === "camera") openCamera(); else openGallery();
  };

  // ── Dropdown item renderer for FlatList ────────────────────────────────
  const renderFarmItem = ({ item }: { item: Farm | null }) => {
    // null = "No farm selected" option
    if (item === null) {
      const isSelected = selectedFarm === null;
      return (
        <TouchableOpacity
          style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
          onPress={() => { setSelectedFarm(null); setFarmDropdownOpen(false); }}
        >
          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
            — No farm selected —
          </Text>
        </TouchableOpacity>
      );
    }
    const isSelected = selectedFarm?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
        onPress={() => { setSelectedFarm(item); setFarmDropdownOpen(false); }}
      >
        <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]} numberOfLines={1}>
          {item.farm_name}
        </Text>
        {isSelected && <Ionicons name="checkmark-circle" size={16} color="#b63c3e" />}
      </TouchableOpacity>
    );
  };

  const dropdownData: (Farm | null)[] = [null, ...farms];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Banner */}
        <View style={styles.topBanner}>
          <Text style={styles.bannerTitle}>Cao</Text>
          <Image source={require("../assets/homepics/cacaoAI.png")} style={styles.bannerIcon} />
        </View>

        {/* ── Farm Dropdown ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>🌿  Select Farm (optional)</Text>

          {/* Trigger */}
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setFarmDropdownOpen((v) => !v)}
            activeOpacity={0.8}
          >
            {loadingFarms ? (
              <ActivityIndicator size="small" color="#b63c3e" style={{ flex: 1 }} />
            ) : (
              <Text style={[styles.dropdownTriggerText, !selectedFarm && { color: "#aaa" }]} numberOfLines={1}>
                {selectedFarm ? selectedFarm.farm_name : "— No farm selected —"}
              </Text>
            )}
            <Ionicons name={farmDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#666" />
          </TouchableOpacity>

          {/* ── FlatList dropdown (avoids nested ScrollView issues) ── */}
          {farmDropdownOpen && (
            <View style={styles.dropdownListContainer}>
              <ScrollView
                style={styles.dropdownList}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {dropdownData.length === 0 ? (
                  <Text style={styles.dropdownEmpty}>No farms found.</Text>
                ) : (
                  dropdownData.map((item) => (
                    <View key={item === null ? "none" : item.id}>
                      {renderFarmItem({ item })}
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Upload Box */}
        <View style={styles.uploadBox}>
          <TouchableOpacity style={styles.uploadButton} onPress={openGallery} disabled={uploading}>
            {uploading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.uploadButtonText}>Upload Image</Text>}
          </TouchableOpacity>
          <View style={styles.uploadDetails}>
            <Ionicons name="image-outline" size={24} color="#000" />
            <Text style={styles.uploadText}>Select from gallery</Text>
            <Text style={styles.uploadSubText}>Photos will be analyzed for disease detection</Text>
          </View>
        </View>

        {/* Capture Button */}
        <View style={styles.captureBox}>
          <TouchableOpacity style={styles.captureButton} onPress={openCamera} disabled={uploading}>
            {uploading ? <ActivityIndicator color="#fff" size="large" /> : <Ionicons name="camera-outline" size={40} color="#fff" />}
          </TouchableOpacity>
          <Text style={styles.captureText}>capture image</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>Scan cacao plants to diagnose diseases, detect pests, and get treatment advice.</Text>
        </View>
      </ScrollView>

      {/* No Cacao Modal */}
      <Modal visible={noCacaoModal} transparent animationType="fade" onRequestClose={() => setNoCacaoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="image-outline" size={48} color="#b63c3e" />
            </View>
            <Text style={styles.modalTitle}>No Cacao Detected</Text>
            <Text style={styles.modalMessage}>{noCacaoMessage}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Ionicons name="camera-outline" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setNoCacaoModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav active="Camera" onNavigate={(screen) => navigation.navigate(screen as never)} />
    </SafeAreaView>
  );
};

export default CameraPage;

const styles = StyleSheet.create({
  /* =======================
     LAYOUT
  ======================== */
  safeArea: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  container: {
    padding: 16,
    paddingBottom: 140,
  },

  /* =======================
     HEADER / BANNER
  ======================== */
  topBanner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
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

  /* =======================
     FARM SECTION
  ======================== */
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* =======================
     DROPDOWN
  ======================== */
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fafafa",
  },
  dropdownTriggerText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginRight: 8,
  },

  // FIXED VERSION (no more height issue)
  dropdownListContainer: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    maxHeight: 220,   // ✅ changed from height to maxHeight
  },
  dropdownList: {
    width: "100%",
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemSelected: {
    backgroundColor: "#fff5f5",
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginRight: 8,
  },
  dropdownItemTextSelected: {
    color: "#b63c3e",
    fontWeight: "700",
  },
  dropdownEmpty: {
    padding: 14,
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },

  /* =======================
     UPLOAD SECTION
  ======================== */
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

  /* =======================
     CAMERA SECTION
  ======================== */
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

  /* =======================
     INFO SECTION
  ======================== */
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

  /* =======================
     MODAL
  ======================== */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  modalIconContainer: {
    backgroundColor: "#fff0f0",
    borderRadius: 50,
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#b63c3e",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
    width: "100%",
    gap: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: "#999",
    fontSize: 15,
  },
});