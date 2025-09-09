import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import BottomNav from "./layout/BottomNav";
import { useNavigation } from "@react-navigation/native";

const pests = [
  { name: "Mealybugs", img: require("../assets/rectangle-4182.png") },
  { name: "Cacao Pod Borer", img: require("../assets/rectangle-4183.png") },
  { name: "Cacao Mirid", img: require("../assets/rectangle-4184.png") },
  { name: "Cacao Weevil", img: require("../assets/rectangle-4185.png") },
];

const PestClassification: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Major Insect Pest Classification</Text>

        <View style={styles.grid}>
          {pests.map((pest) => (
            <View key={pest.name} style={styles.card}>
              <Image source={pest.img} style={styles.cardImage} />
              <View style={styles.overlay}>
                <Text style={styles.cardText}>{pest.name}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ✅ Reusable Bottom Nav */}
      <BottomNav active="Diagnose" onNavigate={(screen) => navigation.navigate(screen as never)} />
    </View>
  );
};

export default PestClassification;

const styles = StyleSheet.create({
  page: { flex: 1, 
    backgroundColor: "#faf8f8" 
  },
  container: { padding: 16, 
    paddingBottom: 100 
  },
  title: { fontSize: 20, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 20 
  },
  grid: { flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between" 
  },
  card: { width: "48%", 
    height: 160, 
    borderRadius: 10, 
    overflow: "hidden", 
    marginBottom: 16 
  },
  cardImage: { width: "100%", 
    height: "100%" 
  },
  overlay: { position: "absolute", 
    bottom: 0, left: 0, right: 0, 
    backgroundColor: "rgba(0,0,0,0.4)", 
    padding: 6 
  },
  cardText: { color: "#fff", 
    fontWeight: "bold", 
    fontSize: 14 
  },
});