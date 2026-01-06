import React, {useState, useEffect} from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet,  } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "./layout/BottomNav";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";


import { API_ENDPOINTS } from '../config/api';  // ← Add this import


const Homepage: React.FC = () => {
  const navigation = useNavigation();
  const [locationText, setLocationText] = useState("Fetching location...");
  const [stats, setStats] = useState({ 
    total_users: 0, 
    total_diagnoses: 0, 
    total_diseases: 0 
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        
        const response = await fetch(API_ENDPOINTS.STATS, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchStats();
  }, []);

  useEffect(() => {
  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setLocationText("Location permission denied");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (address.length > 0) {
      const place = address[0];
      const city =
        place.city ||
        place.subregion ||
        place.district ||
        "Unknown City";

      const region = place.region || "Unknown Region";

      setLocationText(`${city}, ${region}`);
    }
  })();
}, []);


  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.smallText}>Current Location</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={18} color="#b63c3e" />
              <Text style={styles.locationText}>{locationText}</Text>
              <Ionicons name="chevron-down" size={16} color="#333" />
            </View>
          </View>
          {/* <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={20} color="#333" />
          </TouchableOpacity> */}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total_users}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total_diagnoses}</Text>
            <Text style={styles.statLabel}>Diagnoses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total_diseases}</Text>
            <Text style={styles.statLabel}>Diseases</Text>
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>All Features</Text>


        {/* Feature Cards */}
        <TouchableOpacity onPress={() => navigation.navigate("PestClassification" as never)}>
          <ImageBackground
            source={require("../assets/homepics/pest.png")}
            style={styles.card}
            imageStyle={styles.cardImageBackground}
          >
            {/* <View style={styles.overlay} /> */}
            <View style={styles.cardContent}>
              <Ionicons name="bug-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Pest Diseases</Text>
              <Text style={styles.cardDesc}>Identify and learn about major pests</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("CameraScreen" as never)}>
          <ImageBackground
            source={require("../assets/homepics/diagnose.png")}
            style={styles.card}
            imageStyle={styles.cardImageBackground}
          >
            {/* <View style={styles.overlay} /> */}
            <View style={styles.cardContent}>
              <Ionicons name="medkit-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Diagnose</Text>
              <Text style={styles.cardDesc}>
                Quickly detect cacao plant issues and discover solutions.
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("RemindersScreen" as never)}>
          <ImageBackground
            source={require("../assets/homepics/reminders.png")}
            style={styles.card}
            imageStyle={styles.cardImageBackground}
          >
            {/* <View style={styles.overlay} /> */}
            <View style={styles.cardContent}>
              <Ionicons name="notifications-outline" size={20} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Reminders</Text>
              <Text style={styles.cardDesc}>
                Keep your cacao plant healthy with smart reminders.
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>


        {/* Cacao Icon
       <TouchableOpacity
          style={{ position: "absolute", bottom: 10, right: 10, zIndex: 10 }}
          onPress={() => navigation.navigate("ChatBotScreen" as never)}
        >
          <Image
            style={styles.cacaoIcon}
            source={require("../assets/homepics/cacaoAI.png")}
          />
        </TouchableOpacity> */}

      </View>

      {/* Bottom Navigation */}
      <BottomNav
        active="Home"
        onNavigate={(screen) => navigation.navigate(screen as never)}
      />
    </SafeAreaView>
  );
};

export default Homepage;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20, // Add extra top padding for notch safety
    paddingBottom: 100, // space above nav
  },
  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  smallText: {
    paddingLeft: 4,
    fontSize: 12,
    color: "#666",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4, //Move location text slightly lower
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginHorizontal: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: "#888",
  },
  // Cards
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#b63c3e",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  cardImage: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  }, 
  cardImageBackground: {
    borderRadius: 10,
  },
  cardContent: {
    padding: 16,
  },
  cardDesc: {
    fontSize: 13,
    color: "#f0f0f0",
    flexShrink: 1,
    marginTop: 2,
  },
  cardIcon: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginVertical: 20,
  },
  cacaoIcon: {
    width: 60,
    height: 60,
    position: "absolute", // makes it independent of other layout
    bottom: 30,           // adjust this so it sits just above your BottomNav
    right: 2,            // move it to the right side
    resizeMode: "contain",
    zIndex: 10,           // keep it above other elements
  },
   //Stats
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#b63c3e",
  },
  statLabel: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
});
