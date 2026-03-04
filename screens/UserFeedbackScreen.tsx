import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../config/api";

interface Feedback {
  id: number;
  rating: number;
  comments: string;
  created_at: string;
}

const UserFeedbackScreen: React.FC = () => {
  const navigation = useNavigation();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserFeedbacks();
  }, []);

  const fetchUserFeedbacks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Please log in again");
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.FEEDBACK}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setFeedbacks(data.data || data || []);
        setError(null);
      } else {
        setError(data.message || "Failed to load feedbacks");
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserFeedbacks();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={20}
            color={star <= rating ? "#FFD700" : "#ccc"}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b63c3e" />
        <Text style={styles.loadingText}>Loading your feedbacks...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>My Feedbacks</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={64} color="#d32f2f" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchUserFeedbacks}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : feedbacks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
              <Text style={styles.emptyTitle}>No Feedbacks Yet</Text>
              <Text style={styles.emptyText}>
                You haven't submitted any feedback. Share your experience with us!
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate("FeedbackScreen" as never)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Feedback</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Summary Card */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Feedback Summary</Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{feedbacks.length}</Text>
                    <Text style={styles.summaryLabel}>Total</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>
                      {feedbacks.length > 0
                        ? (
                            feedbacks.reduce((sum, f) => sum + f.rating, 0) /
                            feedbacks.length
                          ).toFixed(1)
                        : "0"}
                    </Text>
                    <Text style={styles.summaryLabel}>Avg Rating</Text>
                  </View>
                </View>
              </View>

              {/* Feedback List */}
              {feedbacks.map((feedback) => (
                <View key={feedback.id} style={styles.feedbackCard}>
                  <View style={styles.feedbackHeader}>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ratingText}>{feedback.rating}.0</Text>
                    </View>
                    <Text style={styles.dateText}>
                      {formatDate(feedback.created_at)}
                    </Text>
                  </View>

                  {renderStars(feedback.rating)}

                  {feedback.comments && (
                    <View style={styles.commentsContainer}>
                      <Text style={styles.commentsLabel}>Your Comments:</Text>
                      <Text style={styles.commentsText}>{feedback.comments}</Text>
                    </View>
                  )}
                </View>
              ))}

              {/* Add More Button */}
              {/* <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => navigation.navigate("FeedbackScreen" as never)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.floatingButtonText}>Add New Feedback</Text>
              </TouchableOpacity> */}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default UserFeedbackScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#b63c3e",
  },
  container: {
    flex: 1,
    backgroundColor: "#faf8f8",
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
  header: {
    backgroundColor: "#b63c3e",
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#b63c3e",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  feedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  commentsContainer: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  commentsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  commentsText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#b63c3e",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  floatingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#b63c3e",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
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
});