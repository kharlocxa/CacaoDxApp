import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "./layout/BottomNav";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { API_ENDPOINTS } from '../config/api';

const DiagnosticHistory: React.FC = () => {
  const navigation = useNavigation();

  interface Diagnosis {
    id: number;
    disease_name: string;
    plant_part_name: string;
    confidence: number;
    diagnosis_date: Date;
    notes?: string;
    image_path?: string;
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

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      {item.image_path ? (
        <Image
          source={{ uri: `${API_ENDPOINTS.DIAGNOSIS_HISTORY.replace('/api/diagnosis/history', '')}${item.image_path}` }}
          style={styles.image}
        />
      ) : null}
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
        <Text style={styles.text}>Notes: {item.notes || "No notes"}</Text>
      </View>
    </View>
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
    backgroundColor: "#b63c3e",  // Green color for header area only
  },
  headerContainer: {
    backgroundColor: "#b63c3e",  // Match the SafeAreaView color
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
    backgroundColor: "#fafafa",  // ← Added white/light background for content area
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
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  text: {
    color: "#555",
    fontSize: 14,
    marginBottom: 2,
  },
});