import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "./layout/BottomNav";
import { useNavigation } from "@react-navigation/native";
import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders } from "../config/api";

type Pest = {
  id: number;
  name: string;
  image: string;
};

const PestClassification: React.FC = () => {
  const navigation = useNavigation();
  const [pests, setPests] = useState<Pest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPests();
  }, []);

  const fetchPests = async () => {
    try {
      console.log("Fetching from:", API_ENDPOINTS.PESTS);
      
      // Get authentication headers
      const headers = await getAuthHeaders();
      
      const res = await fetch(API_ENDPOINTS.PESTS, {
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
        setPests([]);
        setLoading(false);
        return;
      }

      // Check for authentication errors
      if (!res.ok) {
        if (res.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError(result.message || "Failed to load pests");
        }
        setPests([]);
        setLoading(false);
        return;
      }

      // Handle different response formats
      if (result.status === 'success' && Array.isArray(result.data)) {
        console.log("Setting pests from result.data");
        setPests(result.data);
        setError(null);
      } else if (Array.isArray(result)) {
        console.log("Result is array, setting pests");
        setPests(result);
        setError(null);
      } else {
        console.warn("Unexpected response format:", result);
        setError("Unexpected data format from server");
        setPests([]);
      }
    } catch (error) {
      console.error("Failed to load pests:", error);
      setError("Network error. Please check your connection.");
      setPests([]);
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Major Insect Pest Classification</Text>
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
              onPress={fetchPests}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : pests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bug-outline" size={64} color="#999" />
            <Text style={styles.emptyText}>No pests available</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {pests.map((pest) => (
              <TouchableOpacity
                key={pest.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("PestDetails" as never, { pestId: pest.id } as never)
                }
              >
                <Image
                  source={{ uri: `${API_BASE_URL}/uploads/pests/${pest.image}` }}
                  style={styles.cardImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{pest.name}</Text>
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

export default PestClassification;

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
    paddingTop: 50,  // Manual padding for status bar
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
    backgroundColor: "#b63c3e",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
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