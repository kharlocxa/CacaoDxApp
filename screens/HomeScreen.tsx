import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "./layout/BottomNav";
import { useNavigation } from "@react-navigation/native";

const Homepage: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔝 Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.smallText}>Current Location</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={18} color="#1FA498" />
              <Text style={styles.locationText}>
                Dumaguete, Negros Oriental
              </Text>
              <Ionicons name="chevron-down" size={16} color="#333" />
            </View>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* 🔍 Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <Text style={styles.searchPlaceholder}>Search here</Text>
        </View>

         {/* Section Title */}
        <Text style={styles.sectionTitle}>All Features</Text>


        {/* 🃏 Feature Cards */}
        <View style={styles.card}>
          <Image
            // source={require("./image-11.png")}
            style={styles.cardImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.cardTitle}>Pest Diseases</Text>
            <Text style={styles.cardDesc}>
              Identify and learn about major pests
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Image
            // source={require("./image-12.png")}
            style={styles.cardImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.cardTitle}>Diagnose</Text>
            <Text style={styles.cardDesc}>
              Quickly detect cacao plant issues and discover solutions.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Image
            // source={require("./image-13.png")}
            style={styles.cardImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.cardTitle}>Reminders</Text>
            <Text style={styles.cardDesc}>
              Keep your cacao plant healthy with smart reminders.
            </Text>
          </View>
        </View>

        {/* 🍫 Cacao Icon */}
        <Image
          // source={require("./cacao-icons-1-removebg-preview-2.png")}
          style={styles.cacaoIcon}
        />
      </ScrollView>

      {/* 🔽 Bottom Navigation */}
      <BottomNav active="Home" onNavigate={(screen) => navigation.navigate(screen as never)} />
    </View>
  );
};

export default Homepage;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  container: {
    padding: 16,
    paddingBottom: 100, // space above nav
  },
  // 🔝 Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  smallText: {
    fontSize: 12,
    color: "#666",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  // 🔍 Search
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
  // 🃏 Cards
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1FA498",
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: "#f0f0f0",
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginVertical: 20,
  },
  cacaoIcon: {
    width: 50,
    height: 50,
    alignSelf: "flex-end",
  },
});
