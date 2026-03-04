import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders } from "../config/api";

interface Disease {
  id: number;
  name: string;
  type: string;
  cause: string;
  plant_part: string;
  image_path?: string;
  treatment?: string;
  prevention?: string;
  recommended_action?: string;
  pest_id?: number;
  pest_name?: string;
  pest_scientific_name?: string;
}

const DiseaseDetails: React.FC = () => {
  const route = useRoute<RouteProp<any>>();
  const navigation = useNavigation();
  const { diseaseId } = route.params as any;
  const [disease, setDisease] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiseaseDetails();
  }, [diseaseId]);

  const fetchDiseaseDetails = async () => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_ENDPOINTS.DISEASE_DETAIL}/${diseaseId}`, {
        method: 'GET',
        headers: headers,
      });
      
      const data = await response.json();
      
      console.log("Disease Details Response:", data);
      
      if (response.ok) {
        setDisease(data);
        setError(null);
      } else {
        console.error("Failed to fetch disease details:", data);
        setError(data.message || "Failed to load disease details");
        
        if (response.status === 401) {
          setError("Authentication failed. Please log in again.");
        }
      }
    } catch (error) {
      console.error("Error fetching disease:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

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
        return '#b63c3e';
    }
  };

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

  // Function to get image URL
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    // If the path is already a full URL, return it
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, prepend the base URL
    return `${API_BASE_URL}/${imagePath}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b63c3e" />
        <Text style={styles.loadingText}>Loading disease information...</Text>
      </View>
    );
  }

  if (error || !disease) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>
          {error || "Disease information not found"}
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
            onPress={fetchDiseaseDetails}
          >
            <Text style={styles.backButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const diseaseColor = getDiseaseColor(disease.type);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: diseaseColor }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disease Details</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Disease Image or Icon Section */}
        {disease.image_path ? (
          <Image
            source={{ uri: getImageUrl(disease.image_path) }}
            style={styles.diseaseImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: diseaseColor }]}>
            <Ionicons 
              name={getDiseaseIcon(disease.type) as any} 
              size={80} 
              color="#fff" 
            />
          </View>
        )}

        {/* Disease Name Section */}
        <View style={styles.section}>
          <View style={styles.nameHeader}>
            <View style={styles.nameContainer}>
              <Text style={styles.diseaseName}>{disease.name}</Text>
              <View style={styles.typeTagLarge}>
                <Text style={styles.typeTextLarge}>{disease.type}</Text>
              </View>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Ionicons name="leaf" size={16} color="#4CAF50" />
              <Text style={styles.badgeText}>Affects: {disease.plant_part}</Text>
            </View>
          </View>
        </View>

        {/* Cause Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={22} color="#1FA498" />
            <Text style={styles.sectionTitle}>Cause</Text>
          </View>
          <Text style={styles.contentText}>
            {disease.cause?.replace(/\n/g, ' ').trim() || 'Information not available'}
          </Text>
          
          {/* Pest Info if available */}
          {disease.pest_id && disease.pest_name && (
            <TouchableOpacity
              style={styles.pestLinkCard}
              onPress={() => navigation.navigate("PestDetails" as never, { pestId: disease.pest_id } as never)}
            >
              <View style={styles.pestLinkHeader}>
                <Ionicons name="bug" size={24} color="#FF6B6B" />
                <View style={styles.pestLinkContent}>
                  <Text style={styles.pestLinkLabel}>Caused by pest:</Text>
                  <Text style={styles.pestLinkName}>{disease.pest_name}</Text>
                  {disease.pest_scientific_name && (
                    <Text style={styles.pestLinkScientific}>{disease.pest_scientific_name}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </View>
              <Text style={styles.pestLinkHint}>Tap to view pest details</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Treatment Section */}
        {disease.treatment && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={22} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Treatment</Text>
            </View>
            <View style={styles.treatmentCard}>
              <Text style={styles.treatmentText}>
                {disease.treatment.replace(/\n/g, ' ').trim()}
              </Text>
            </View>
          </View>
        )}

        {/* Prevention Section */}
        {disease.prevention && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={22} color="#2196F3" />
              <Text style={styles.sectionTitle}>Prevention</Text>
            </View>
            <View style={styles.preventionCard}>
              <Text style={styles.preventionText}>
                {disease.prevention.replace(/\n/g, ' ').trim()}
              </Text>
            </View>
          </View>
        )}

        {/* Recommended Action Section */}
        {disease.recommended_action && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={22} color="#FF9800" />
              <Text style={styles.sectionTitle}>Recommended Action</Text>
            </View>
            <View style={styles.actionCard}>
              <Text style={styles.actionText}>
                {disease.recommended_action.replace(/\n/g, ' ').trim()}
              </Text>
            </View>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#856404" />
          <Text style={styles.infoText}>
            For accurate diagnosis and treatment, please use the camera feature to scan affected cacao plants or consult with an agricultural expert.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DiseaseDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  diseaseImage: {
    width: "100%",
    height: 250,
  },
  iconContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
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
    flex: 1,
  },
  diseaseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  typeTagLarge: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeTextLarge: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
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
  },
  treatmentCard: {
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  treatmentText: {
    fontSize: 15,
    color: "#2E7D32",
    lineHeight: 22,
    fontWeight: "500",
  },
  preventionCard: {
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  preventionText: {
    fontSize: 15,
    color: "#1565C0",
    lineHeight: 22,
    fontWeight: "500",
  },
  actionCard: {
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  actionText: {
    fontSize: 15,
    color: "#E65100",
    lineHeight: 22,
    fontWeight: "500",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff3cd",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
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
  pestLinkCard: {
    backgroundColor: "#FFF5F5",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  pestLinkHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  pestLinkContent: {
    flex: 1,
    marginLeft: 12,
  },
  pestLinkLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  pestLinkName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 2,
  },
  pestLinkScientific: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
  },
  pestLinkHint: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },
});