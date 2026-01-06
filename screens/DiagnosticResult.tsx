import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";

interface Treatment {
  id: number;
  description: string;
  treatment: string;
  prevention: string;
  recommended_action: string;
}

interface PestInfo {
  name: string;
  scientific_name: string;
  description: string;
  damage: string;
}

interface RouteParams {
  imageUri: string;
  diagnosisId: number;
  diseaseId: number;
  diseaseName: string;
  diseaseType: string;
  affectedPart: string;
  confidence: number;
  cause: string;
  pestInfo: PestInfo | null;
  treatments: Treatment[];
  message?: string;
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

  const getDiseaseTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'fungal':
        return 'leaf-outline';
      case 'insect-related':
        return 'bug-outline';
      case 'virus':
        return 'warning-outline';
      case 'none':
        return 'checkmark-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getDiseaseTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'fungal':
        return '#8B4513';
      case 'insect-related':
        return '#FF6B6B';
      case 'virus':
        return '#9B59B6';
      case 'none':
        return '#4CAF50';
      default:
        return '#666';
    }
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

          {/* Disease Type Badge */}
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: getDiseaseTypeColor(params.diseaseType) + '20' }]}>
              <Ionicons 
                name={getDiseaseTypeIcon(params.diseaseType)} 
                size={16} 
                color={getDiseaseTypeColor(params.diseaseType)} 
              />
              <Text style={[styles.badgeText, { color: getDiseaseTypeColor(params.diseaseType) }]}>
                {params.diseaseType}
              </Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="leaf-outline" size={16} color="#2E7D32" />
              <Text style={styles.badgeText}>{params.affectedPart}</Text>
            </View>
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

        {/* Special Message for Healthy/Unknown */}
        {params.message && (
          <View style={[
            styles.messageBox,
            { backgroundColor: params.diseaseType === 'None' ? '#d4edda' : '#fff3cd' }
          ]}>
            <Ionicons 
              name={params.diseaseType === 'None' ? 'checkmark-circle' : 'information-circle'} 
              size={24} 
              color={params.diseaseType === 'None' ? '#155724' : '#856404'} 
            />
            <Text style={[
              styles.messageText,
              { color: params.diseaseType === 'None' ? '#155724' : '#856404' }
            ]}>
              {params.message}
            </Text>
          </View>
        )}

        {/* Cause/Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color="#b63c3e" />
            <Text style={styles.sectionTitle}>About This Condition</Text>
          </View>
          <Text style={styles.descriptionText}>{params.cause}</Text>
        </View>

        {/* Pest Information (if available) */}
        {params.pestInfo && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bug" size={20} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Pest Information</Text>
            </View>
            <View style={styles.pestCard}>
              <Text style={styles.pestName}>{params.pestInfo.name}</Text>
              <Text style={styles.pestScientific}>({params.pestInfo.scientific_name})</Text>
              <Text style={styles.pestDescription}>{params.pestInfo.description}</Text>
              <View style={styles.damageContainer}>
                <Ionicons name="warning" size={16} color="#FF6B6B" />
                <Text style={styles.damageText}>{params.pestInfo.damage}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Treatments */}
        {params.treatments && params.treatments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical-outline" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Treatment & Management</Text>
            </View>
            {params.treatments.map((treatment, index) => (
              <View key={index} style={styles.treatmentCard}>
                {treatment.description && (
                  <View style={styles.treatmentItem}>
                    <Text style={styles.treatmentLabel}>Description:</Text>
                    <Text style={styles.treatmentText}>{treatment.description}</Text>
                  </View>
                )}
                
                {treatment.treatment && (
                  <View style={styles.treatmentItem}>
                    <View style={styles.iconLabel}>
                      <Ionicons name="fitness" size={18} color="#2196F3" />
                      <Text style={styles.treatmentLabel}>Treatment:</Text>
                    </View>
                    <Text style={styles.treatmentText}>{treatment.treatment}</Text>
                  </View>
                )}

                {treatment.prevention && (
                  <View style={styles.treatmentItem}>
                    <View style={styles.iconLabel}>
                      <Ionicons name="shield-checkmark" size={18} color="#4CAF50" />
                      <Text style={styles.treatmentLabel}>Prevention:</Text>
                    </View>
                    <Text style={styles.treatmentText}>{treatment.prevention}</Text>
                  </View>
                )}

                {treatment.recommended_action && (
                  <View style={styles.treatmentItem}>
                    <View style={styles.iconLabel}>
                      <Ionicons name="flash" size={18} color="#FF9800" />
                      <Text style={styles.treatmentLabel}>Action Required:</Text>
                    </View>
                    <Text style={styles.treatmentText}>{treatment.recommended_action}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate("DiagnosticHistory" as never)}
          >
            <Ionicons name="time-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>View History</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("CameraScreen" as never)}
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
    marginBottom: 12,
  },
  diseaseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 12,
    flex: 1,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
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
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  descriptionText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
  },
  pestCard: {
    backgroundColor: "#FFF5F5",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  pestName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  pestScientific: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 8,
  },
  pestDescription: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  damageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  damageText: {
    flex: 1,
    fontSize: 14,
    color: "#d32f2f",
    fontWeight: "500",
  },
  treatmentCard: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  treatmentItem: {
    marginBottom: 12,
  },
  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  treatmentLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  treatmentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    marginTop: 4,
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