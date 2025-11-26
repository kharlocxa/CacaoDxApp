import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Dashboard() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [topDiseasesVisible, setTopDiseasesVisible] = useState(false);
  const [recentDetailVisible, setRecentDetailVisible] = useState(false);

  const handleLogout = () => {
    setMenuVisible(false);
    router.replace("/login-type");
  };

  // Launch phone camera
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

  const riceDiseases = [
    { name: "Rice Blast", img: require("../assets/images/rice_blast.png") },
    { name: "Sheath Blight", img: require("../assets/images/sheath_blight.png") },
    { name: "Bacterial Blight", img: require("../assets/images/bacterial_blight.png") },
    { name: "Tungro Virus", img: require("../assets/images/tungro.png") },
    { name: "Brown Spot", img: require("../assets/images/brown_spot.png") },
  ];

  return (
    <LinearGradient
      colors={["#18B949", "#1D492D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.bg}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.heading}>Dashboard</Text>

        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => setNotificationsVisible(true)}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Feather name="menu" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Dashboard */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Recent Diagnosis</Text>

        {/* Recent Diagnosis Card */}
        <TouchableOpacity
          style={styles.cardWide}
          onPress={() => setRecentDetailVisible(true)}
          activeOpacity={0.9}
        >
          <Image
            source={require("../assets/images/sheath_blight.png")}
            style={styles.recentImg}
          />
          <View style={{ flex: 1, paddingHorizontal: 14, gap: 6 }}>
            <Text style={styles.rdTitle}>Sheath Blight</Text>
            <Text style={styles.rdMeta}>Category: Fungal disease</Text>
            <Text style={styles.rdMeta}>Apr 24, 2024</Text>
            <Text style={styles.rdMeta}>Confidence 90%</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={{ flex: 1, gap: 12 }}>
            <TouchableOpacity
              style={styles.topDiseaseCard}
              onPress={() => setTopDiseasesVisible(true)}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeader}>Top Disease</Text>
                <MaterialCommunityIcons name="virus-outline" size={16} color={DARK} />
              </View>
              <Text style={styles.bigText}>Rice Blast</Text>
            </TouchableOpacity>

            <View style={styles.alertCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeader}>Regional Alert</Text>
                <Ionicons name="alert-circle-outline" size={16} color={DARK} />
              </View>
              <Text style={styles.bigText}>Moderate</Text>
            </View>
          </View>

          <View style={styles.diagnosisCard}>
            <Text style={styles.cardHeaderCenter}>Diagnosis{"\n"}Made</Text>
            <Text style={styles.hugeNumber}>7</Text>
          </View>
        </View>

        {/* Scrollable Rice Diseases Gallery */}
        <Text style={styles.sectionTitle}>Common Rice Diseases</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {riceDiseases.map((disease, index) => (
            <View key={index} style={styles.diseaseCard}>
              <Image source={disease.img} style={styles.diseaseImage} />
              <Text style={styles.diseaseLabel}>{disease.name}</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Floating Scan CTA */}
      <TouchableOpacity style={styles.cta} activeOpacity={0.9}>
        <View style={styles.ctaIconWrap}>
          <Ionicons name="scan-outline" size={20} color={DARK} />
        </View>
        <Text style={styles.ctaText}>Scan and identify the disease</Text>
      </TouchableOpacity>

      {/* Bottom Nav */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/chatbot")}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={DARK} />
          <Text style={styles.tabLabel}>Chatbot</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.tabItem, styles.tabCenter]} onPress={openCamera}>
          <Ionicons name="camera-outline" size={24} color={DARK} />
          <Text style={styles.tabLabel}>Capture</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/history")}>
          <Ionicons name="time-outline" size={22} color={DARK} />
          <Text style={styles.tabLabel}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Overlay */}
      {notificationsVisible && (
        <TouchableWithoutFeedback onPress={() => setNotificationsVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.notificationContainer}>
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={() => setNotificationsVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.notificationTitle}>Notifications</Text>

                {[
                  { disease: "Rice Blast", location: "Mabinay", status: "Alert", time: "10m ago" },
                  { disease: "Sheath Blight", location: "Tanjay", status: "Moderate", time: "2h ago" },
                  { disease: "Bacterial Blight", location: "Siaton", status: "Safe", time: "1d ago" },
                ].map((n, i) => (
                  <View key={i} style={styles.notificationCard}>
                    <Text style={styles.notifType}>Common disease</Text>
                    <Text style={styles.notifDisease}>{n.disease}</Text>
                    <Text style={styles.notifText}>Location: {n.location}</Text>
                    <Text style={styles.notifText}>Status: {n.status}</Text>
                    <Text style={styles.notifTime}>{n.time}</Text>
                  </View>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Dropdown Menu Overlay */}
      {menuVisible && (
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/profile");
                  }}
                >
                  <Text style={styles.dropdownText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/settings");
                  }}
                >
                  <Text style={styles.dropdownText}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/feedback");
                  }}
                >
                  <Text style={styles.dropdownText}>Submit Feedback</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                  <Text style={styles.dropdownText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
    </LinearGradient>
  );
}

const CARD_BG = "#E8F5EC";
const DARK = "#143B28";

const styles = StyleSheet.create({
  bg: { flex: 1 },
  sectionTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 12 },
  topBar: {
    paddingTop: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: { color: "#fff", fontSize: 32, fontWeight: "800" },
  scroll: { paddingHorizontal: 16, paddingBottom: 240, paddingTop: 25 },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  cardWide: {
    backgroundColor: "#ffffff22",
    borderRadius: 16,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#ffffff66",
    marginBottom: 16,
  },
  recentImg: { width: 120, height: 120, borderRadius: 12, backgroundColor: "#fff" },
  rdTitle: { color: "#fff", fontWeight: "800", fontSize: 22 },
  rdMeta: { color: "#E8FFE8", fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  topDiseaseCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ffffffaa",
    height: 90,
    width: 165,
    justifyContent: "space-between",
  },
  alertCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ffffffaa",
    height: 90,
    width: 165,
    justifyContent: "space-between",
  },
  diagnosisCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ffffffaa",
    minHeight: 192,
    width: 150,
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardHeader: { color: DARK, opacity: 0.9, fontWeight: "700" },
  bigText: { color: DARK, fontWeight: "900", fontSize: 26, marginTop: 8 },
  cardHeaderCenter: {
    color: DARK,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 18,
    lineHeight: 24,
  },
  hugeNumber: {
    color: DARK,
    fontWeight: "900",
    fontSize: 60,
    textAlign: "center",
    marginTop: 6,
  },
  horizontalScroll: { flexDirection: "row", gap: 14, paddingVertical: 6 },
  diseaseCard: {
    backgroundColor: "#ffffff33",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff55",
  },
  diseaseImage: { width: 120, height: 120, borderRadius: 10, marginBottom: 6 },
  diseaseLabel: { color: "#fff", fontWeight: "700", fontSize: 14 },
  cta: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 110,
    backgroundColor: "#E8F5EC",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    zIndex: 1500,
  },
  ctaIconWrap: {
    backgroundColor: "#CDE9D4",
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: DARK, fontWeight: "800", fontSize: 16 },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 14,
    paddingTop: 10,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tabItem: { alignItems: "center", gap: 4, flex: 1 },
  tabCenter: { backgroundColor: "#D9F1DF", paddingVertical: 8, borderRadius: 12 },
  tabLabel: { color: DARK, fontSize: 12, fontWeight: "700" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1900,
    paddingHorizontal: 20,
  },
  notificationContainer: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxHeight: "80%",
  },
  closeIcon: { position: "absolute", top: 12, right: 12, zIndex: 10 },
  notificationTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 14,
    marginTop: 4,
  },
  notificationCard: { backgroundColor: "#333", borderRadius: 12, padding: 12, marginBottom: 12 },
  notifType: { color: "#bbb", fontSize: 13 },
  notifDisease: { color: "#fff", fontSize: 18, fontWeight: "800" },
  notifText: { color: "#ddd", fontSize: 14 },
  notifTime: { color: "#aaa", fontSize: 12, marginTop: 4 },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },
  dropdownMenu: {
    position: "absolute",
    top: 56 + 8,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 6,
    width: 170,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 2100,
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownText: { fontSize: 16, color: DARK, fontWeight: "700" },
});