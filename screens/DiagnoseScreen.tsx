import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "./layout/BottomNav";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { API_ENDPOINTS } from '../config/api';

const DiagnosticHistory: React.FC = () => {
  const navigation = useNavigation();

  interface Treatment {
    id: number;
    description: string;
    treatment: string;
    prevention: string;
    recommended_action: string;
  }

  interface Diagnosis {
    id: number;
    disease_name: string;
    disease_type: string;
    plant_part_name: string;
    confidence: number;
    diagnosis_date: Date;
    disease_cause?: string;
    pest_name?: string;
    pest_scientific_name?: string;
    pest_description?: string;
    pest_damage?: string;
    notes?: string;
    image_path?: string;
    treatments?: Treatment[];
  }

  const [history, setHistory] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchHistory = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) {
            console.log("No token found");
            return;
          }

          const response = await fetch(API_ENDPOINTS.DIAGNOSIS_HISTORY, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!isActive) return;

          const data = await response.json();

          if (response.ok) {
            const historyData = data.data || data;
            setHistory(Array.isArray(historyData) ? historyData : []);
            console.log("Loaded", historyData.length, "records");
          } else {
            console.error("API Error:", data.message || data);
            Alert.alert("Error", data.message || "Failed to fetch history");
          }
        } catch (error) {
          if (!isActive) return;
          console.error("Error fetching history:", error);
          Alert.alert("Error", "Failed to load diagnostic history");
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchHistory();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleCardPress = (item: Diagnosis) => {
    // Build pest info object
    const pestInfo = item.pest_name ? {
      name: item.pest_name,
      scientific_name: item.pest_scientific_name || '',
      description: item.pest_description || '',
      damage: item.pest_damage || ''
    } : null;

    // Convert confidence to number
    const confidenceValue = typeof item.confidence === 'string' 
      ? parseFloat(item.confidence) 
      : item.confidence;

    // Navigate to DiagnosisResult screen with history data
    navigation.navigate('DiagnosisResult' as never, {
      imageUri: `${API_ENDPOINTS.DIAGNOSIS_HISTORY.replace('/api/diagnosis/history', '')}${item.image_path}`,
      diagnosisId: item.id,
      diseaseId: item.disease_name,
      diseaseName: item.disease_name,
      diseaseType: item.disease_type,
      affectedPart: item.plant_part_name,
      confidence: confidenceValue,  // ← Now a number
      cause: item.disease_cause || item.notes || 'No information available',
      pestInfo: pestInfo,
      treatments: item.treatments || [],
      message: item.disease_type === 'None' ? 'Your cacao plant appears to be healthy!' : undefined,
    } as never);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handleCardPress(item)}
    >
      {item.image_path ? (
        <Image
          source={{ uri: `${API_ENDPOINTS.DIAGNOSIS_HISTORY.replace('/api/diagnosis/history', '')}${item.image_path}` }}
          style={styles.image}
        />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.disease_name || "Unknown Disease"}</Text>
        <Text style={styles.text}>
          Affected Part: {item.plant_part_name || "N/A"}
        </Text>
        <Text style={styles.text}>
          Confidence: {item.confidence || "N/A"}%
        </Text>
        <Text style={styles.text}>
          Date: {new Date(item.diagnosis_date).toLocaleString()}
        </Text>
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>Tap to view details</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Diagnostic History</Text>
      </View>

      {/* Content Section */}
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#b63c3e" />
          </View>
        ) : history.length > 0 ? (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No diagnostic history found</Text>
          </View>
        )}
      </View>

      {/* Bottom Navigation */}
      <BottomNav
        active="History"
        onNavigate={(screen) => navigation.navigate(screen as never)}
      />
    </SafeAreaView>
  );
};

export default DiagnosticHistory;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#b63c3e",
  },
  headerContainer: {
    backgroundColor: "#b63c3e",
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fafafa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  text: {
    color: "#555",
    fontSize: 14,
    marginBottom: 2,
  },
  tapHint: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  tapHintText: {
    fontSize: 12,
    color: "#b63c3e",
    fontStyle: "italic",
    fontWeight: "500",
  },
});