import React, {useState, useEffect} from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "./layout/BottomNav";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

import { API_ENDPOINTS } from '../config/api';

const Homepage: React.FC = () => {
  const navigation = useNavigation();
  const [locationText, setLocationText] = useState("Detecting location...");
  const [locationLoading, setLocationLoading] = useState(true);
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
        console.error('Failed to fetch stats:', err);
      }
    };
    
    fetchStats();
  }, []);

  useEffect(() => {
    const getLocation = async () => {
      try {
        // Check if we have cached location (less than 1 hour old)
        const cachedLocation = await AsyncStorage.getItem("cachedLocation");
        const cachedTime = await AsyncStorage.getItem("cachedLocationTime");
        
        if (cachedLocation && cachedTime) {
          const timeDiff = Date.now() - parseInt(cachedTime);
          const oneHour = 60 * 60 * 1000;
          
          if (timeDiff < oneHour) {
            setLocationText(cachedLocation);
            setLocationLoading(false);
            return;
          }
        }

        // Request permission
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationText("Location access denied");
          setLocationLoading(false);
          return;
        }

        // Get current location with timeout
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Location timeout')), 10000)
        );

        const location = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;

        // Reverse geocode
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (address.length > 0) {
          const place = address[0];
          const city = place.city || place.subregion || place.district || "Unknown City";
          const region = place.region || "Unknown Region";
          const locationString = `${city}, ${region}`;

          setLocationText(locationString);
          
          // Cache the location
          await AsyncStorage.setItem("cachedLocation", locationString);
          await AsyncStorage.setItem("cachedLocationTime", Date.now().toString());
        } else {
          setLocationText("Location unavailable");
        }
      } catch (error) {
        console.error("Location error:", error);
        setLocationText("Location unavailable");
      } finally {
        setLocationLoading(false);
      }
    };

    getLocation();
  }, []);

  const refreshLocation = async () => {
    setLocationLoading(true);
    setLocationText("Detecting location...");
    
    // Clear cache to force refresh
    await AsyncStorage.removeItem("cachedLocation");
    await AsyncStorage.removeItem("cachedLocationTime");
    
    // Trigger location fetch by re-mounting the effect
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationText("Location access denied");
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const place = address[0];
        const city = place.city || place.subregion || place.district || "Unknown City";
        const region = place.region || "Unknown Region";
        const locationString = `${city}, ${region}`;

        setLocationText(locationString);
        await AsyncStorage.setItem("cachedLocation", locationString);
        await AsyncStorage.setItem("cachedLocationTime", Date.now().toString());
      } else {
        setLocationText("Location unavailable");
      }
    } catch (error) {
      console.error("Location refresh error:", error);
      setLocationText("Location unavailable");
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.locationContainer}>
            <Text style={styles.smallText}>Current Location</Text>
            <TouchableOpacity 
              style={styles.locationRow}
              onPress={refreshLocation}
              disabled={locationLoading}
            >
              <Ionicons name="location-sharp" size={18} color="#b63c3e" />
              {locationLoading ? (
                <ActivityIndicator size="small" color="#b63c3e" style={styles.locationLoader} />
              ) : (
                <>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {locationText}
                  </Text>
                  <Ionicons name="refresh" size={14} color="#666" style={styles.refreshIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>
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
        <Text style={styles.sectionTitle}>Features</Text>

        {/* Feature Cards */}
        <TouchableOpacity onPress={() => navigation.navigate("DiseaseClassification" as never)}>
          <ImageBackground
            source={require("../assets/homepics/pest.png")}
            style={styles.card}
            imageStyle={styles.cardImageBackground}
          >
            <View style={styles.overlay} />
            <View style={styles.cardContent}>
              <Ionicons name="bug-outline" size={24} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Major Diseases</Text>
              <Text style={styles.cardDesc}>Identify and learn about major diseases</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("CameraScreen" as never)}>
          <ImageBackground
            source={require("../assets/homepics/diagnose.png")}
            style={styles.card}
            imageStyle={styles.cardImageBackground}
          >
            <View style={styles.overlay} />
            <View style={styles.cardContent}>
              <Ionicons name="medkit-outline" size={24} color="#fff" style={styles.cardIcon} />
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
            <View style={styles.overlay} />
            <View style={styles.cardContent}>
              <Ionicons name="alarm-outline" size={24} color="#fff" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Reminders</Text>
              <Text style={styles.cardDesc}>
                Keep your cacao plant healthy with smart reminders.
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  locationContainer: {
    flex: 1,
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
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginHorizontal: 4,
    flex: 1,
  },
  locationLoader: {
    marginLeft: 8,
  },
  refreshIcon: {
    marginLeft: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#b63c3e",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
  },
  cardImage: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  }, 
  cardImageBackground: {
    borderRadius: 10,
  },
  cardContent: {
    padding: 16,
    zIndex: 1,
  },
  cardDesc: {
    fontSize: 14,
    color: "#fff",
    flexShrink: 1,
    marginTop: 2,
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardIcon: {
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
    position: "absolute",
    bottom: 30,
    right: 2,
    resizeMode: "contain",
    zIndex: 10,
  },
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