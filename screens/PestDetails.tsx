import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders } from "../config/api";

interface Pest {
  id: number;
  name: string;
  scientific_name: string;
  family: string;
  description: string;
  damage: string;
  plant_part: string;
  image: string;
}

const PestDetails: React.FC = () => {
  const route = useRoute<RouteProp<any>>();
  const navigation = useNavigation();
  const { pestId } = route.params as any;
  const [pest, setPest] = useState<Pest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPestDetails();
  }, [pestId]);

  const fetchPestDetails = async () => {
    try {
      // Get authentication headers
      const headers = await getAuthHeaders();
      
      // Use the correct endpoint with ID
      const response = await fetch(`${API_ENDPOINTS.PEST_DETAIL}/${pestId}`, {
        method: 'GET',
        headers: headers,
      });
      
      const data = await response.json();
      
      console.log("Pest Details Response:", data);
      
      if (response.ok) {
        setPest(data);
        setError(null);
      } else {
        console.error("Failed to fetch pest details:", data);
        setError(data.message || "Failed to load pest details");
        
        if (response.status === 401) {
          setError("Authentication failed. Please log in again.");
          // Optionally navigate to login
          // navigation.navigate("Login" as never);
        }
      }
    } catch (error) {
      console.error("Error fetching pest:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b63c3e" />
        <Text style={styles.loadingText}>Loading pest information...</Text>
      </View>
    );
  }

  if (error || !pest) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>
          {error || "Pest information not found"}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
        {error && (
          <TouchableOpacity
            style={[styles.backButton, { marginTop: 10, backgroundColor: "#666" }]}
            onPress={fetchPestDetails}
          >
            <Text style={styles.backButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pest Details</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pest Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${API_BASE_URL}/uploads/pests/${pest.image}` }}
            style={styles.pestImage}
            resizeMode="cover"
          />
        </View>

        {/* Pest Name Section */}
        <View style={styles.section}>
          <View style={styles.nameHeader}>
            <Ionicons name="bug" size={28} color="#FF6B6B" />
            <View style={styles.nameContainer}>
              <Text style={styles.pestName}>{pest.name}</Text>
              <Text style={styles.scientificName}>{pest.scientific_name}</Text>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Ionicons name="information-circle" size={16} color="#666" />
              <Text style={styles.badgeText}>{pest.family}</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="leaf" size={16} color="#4CAF50" />
              <Text style={styles.badgeText}>Affects: {pest.plant_part}</Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={22} color="#1FA498" />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.contentText}>
            {pest.description.replace(/\n/g, ' ').trim()}
          </Text>
        </View>

        {/* Damage Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={22} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Damage & Impact</Text>
          </View>
          <View style={styles.damageCard}>
            <Text style={styles.damageText}>
              {pest.damage.replace(/\n/g, ' ').trim()}
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#856404" />
          <Text style={styles.infoText}>
            For detailed treatment and prevention methods, please consult with an
            agricultural expert or refer to the diagnosis section.
          </Text>
        </View>

        {/* Action Button */}
        {/* <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("CameraScreen" as never)}
        >
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Scan for Diagnosis</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </View>
  );
};

export default PestDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#b63c3e",
    paddingTop: 50,  
    paddingBottom: 12,  
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#faf8f8",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#faf8f8",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#b63c3e",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
  flexGrow: 1,
  },
  imageContainer: {
    backgroundColor: "#fff",
    padding: 16,
    alignItems: "center",
    width: '100%',  // Add this
  },
  pestImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  section: {
  backgroundColor: "#fff",
  marginTop: 12,
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 16,
  paddingBottom: 16,
  },
  nameHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  nameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  pestName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
  },
  badgeContainer: {
    flexDirection: "row",
    marginTop: 8,
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    marginLeft: 8,
  },
  contentText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    textAlign: 'auto',  // Try 'auto' instead of 'justify'
  },
  damageCard: {
    backgroundColor: "#FFF5F5",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
    alignSelf: 'stretch',  // Add this
  },
  damageText: {
    fontSize: 15,
    color: "#d32f2f",
    lineHeight: 20,
    fontWeight: "500",
    textAlign: 'auto',  // Try 'auto' instead of 'justify'  
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff3cd",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
    marginLeft: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#b63c3e",
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});