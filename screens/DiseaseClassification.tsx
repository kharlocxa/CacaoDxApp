import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "./layout/BottomNav";
import { useNavigation } from "@react-navigation/native";
import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders } from "../config/api";

type Disease = {
  id: number;
  name: string;
  type: string;
  image_path?: string;
};

const DiseaseClassification: React.FC = () => {
  const navigation = useNavigation();
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    try {
      console.log("Fetching from:", API_ENDPOINTS.DISEASES);
      
      const headers = await getAuthHeaders();
      
      const res = await fetch(API_ENDPOINTS.DISEASES, {
        method: 'GET',
        headers: headers,
      });
      
      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);
      
      const text = await res.text();
      console.log("Raw response text:", text);
      
      let result;
      try {
        result = JSON.parse(text);
        console.log("Parsed JSON:", result);
      } catch (e) {
        console.log("Failed to parse JSON:", e);
        setError("Failed to parse server response");
        setDiseases([]);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        if (res.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError(result.message || "Failed to load diseases");
        }
        setDiseases([]);
        setLoading(false);
        return;
      }

      if (result.status === 'success' && Array.isArray(result.data)) {
        console.log("Setting diseases from result.data");
        // Filter out Unknown and Healthy diseases
        const filteredDiseases = result.data.filter(
          (disease: Disease) => disease.name !== 'Unknown' && disease.name !== 'Healthy'
        );
        setDiseases(filteredDiseases);
        setError(null);
      } else if (Array.isArray(result)) {
        console.log("Result is array, setting diseases");
        // Filter out Unknown and Healthy diseases
        const filteredDiseases = result.filter(
          (disease: Disease) => disease.name !== 'Unknown' && disease.name !== 'Healthy'
        );
        setDiseases(filteredDiseases);
        setError(null);
      } else {
        console.warn("Unexpected response format:", result);
        setError("Unexpected data format from server");
        setDiseases([]);
      }
    } catch (error) {
      console.error("Failed to load diseases:", error);
      setError("Network error. Please check your connection.");
      setDiseases([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to get disease icon based on type
  const getDiseaseIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'fungal':
        return 'water';
      case 'bacterial':
        return 'fitness';
      case 'viral':
        return 'bug';
      case 'insect-related':
        return 'bug-outline';
      case 'normal':
        return 'checkmark-circle';
      default:
        return 'alert-circle';
    }
  };

  // Function to get color based on disease type
  const getDiseaseColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'fungal':
        return '#8B4513';
      case 'bacterial':
        return '#FF6B6B';
      case 'viral':
        return '#9C27B0';
      case 'insect-related':
        return '#FF9800';
      case 'normal':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  // Function to get image URL
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    // If the path is already a full URL, return it
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, prepend the base URL
    return `${API_BASE_URL}/${imagePath}`;
  };

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
        <Text style={styles.headerTitle}>Major Diseases of Cacao</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#b63c3e" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#d32f2f" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchDiseases}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : diseases.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color="#999" />
            <Text style={styles.emptyText}>No diseases available</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {diseases.map((disease) => (
              <TouchableOpacity
                key={disease.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("DiseaseDetails" as never, { diseaseId: disease.id } as never)
                }
              >
                {disease.image_path ? (
                  <Image
                    source={{ uri: getImageUrl(disease.image_path) }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.cardIcon, { backgroundColor: getDiseaseColor(disease.type) }]}>
                    <Ionicons 
                      name={getDiseaseIcon(disease.type) as any} 
                      size={48} 
                      color="#fff" 
                    />
                  </View>
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{disease.name}</Text>
                  <View style={styles.typeTag}>
                    <Text style={styles.typeText}>{disease.type || 'Unknown'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNav active="Diagnose" onNavigate={(screen) => navigation.navigate(screen as never)} />
    </View>
  );
};

export default DiseaseClassification;

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
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 120,
  },
  cardIcon: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 6,
    lineHeight: 18,
  },
  typeTag: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#b63c3e",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
  },
});