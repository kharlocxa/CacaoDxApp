import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";

interface RouteParams {
  imageUri: string;
  diagnosis: string;
  confidence: number;
  diseaseName: string;
  recommendations: string[];
  diagnosisId: number;
}

const DiagnosisResult: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as RouteParams;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "#4CAF50";
    if (confidence >= 60) return "#FF9800";
    return "#F44336";
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnosis Result</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Display */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: params.imageUri }} style={styles.image} />
        </View>

        {/* Disease Name */}
        <View style={styles.section}>
          <View style={styles.diseaseHeader}>
            <Ionicons name="medical" size={24} color="#b63c3e" />
            <Text style={styles.diseaseName}>{params.diseaseName}</Text>
          </View>
          
          {/* Confidence Score */}
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence Score</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    width: `${params.confidence}%`,
                    backgroundColor: getConfidenceColor(params.confidence)
                  }
                ]} 
              />
            </View>
            <Text 
              style={[
                styles.confidenceText,
                { color: getConfidenceColor(params.confidence) }
              ]}
            >
              {params.confidence.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Diagnosis Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnosis</Text>
          <Text style={styles.diagnosisText}>{params.diagnosis}</Text>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {params.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate("History" as never)}
          >
            <Ionicons name="time-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>View History</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Camera" as never)}
          >
            <Ionicons name="camera-outline" size={20} color="#b63c3e" />
            <Text style={styles.secondaryButtonText}>New Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            This diagnosis is based on AI analysis. For serious cases, please consult with an agricultural expert.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiagnosisResult;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#b63c3e",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#b63c3e",
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 15,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  imageContainer: {
    backgroundColor: "#fff",
    padding: 16,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    resizeMode: "cover",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 16,
  },
  diseaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  diseaseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 12,
    flex: 1,
  },
  confidenceContainer: {
    marginTop: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  confidenceBar: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 5,
  },
  confidenceText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  diagnosisText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingLeft: 8,
  },
  recommendationText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#b63c3e",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#b63c3e",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#b63c3e",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff3cd",
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#856404",
    lineHeight: 18,
  },
});