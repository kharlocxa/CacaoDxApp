import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import BottomNav from "./layout/BottomNav";
import { useNavigation } from "@react-navigation/native";

const pests = [
  { name: "Mealybugs", img: require("../assets/pests/mealybugs.jpg") },
  { name: "Cacao Pod Borer", img: require("../assets/pests/cacao-pod-borer.jpeg") },
  { name: "Cacao Mirid", img: require("../assets/pests/cacao-mirids.jpg") },
  { name: "Cacao Weevil", img: require("../assets//pests/cacao-weevil.jpg") },
];

const PestClassification: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Title */}
        <Text style={styles.title}>Major Insect Pest Classification</Text>

        {/* 2x2 Grid */}
        <View style={styles.grid}>
          {pests.map((pest) => (
            <TouchableOpacity
              key={pest.name}
              style={styles.card}
              onPress={() => navigation.navigate("PestDetails" as never, { pest } as never)}
              activeOpacity={0.8}
            >
              <Image source={pest.img} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{pest.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNav
        active="Diagnose"
        onNavigate={(screen) => navigation.navigate(screen as never)}
      />
    </View>
  );
};

export default PestClassification;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%", // Two per row with spacing
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardImage: {
    width: "100%",
    height: 120,
  },
  cardContent: {
    padding: 8,
    backgroundColor: "#1FA498", // matches your feature cards
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
});
