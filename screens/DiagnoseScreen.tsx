import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Modal, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "./layout/BottomNav";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { API_ENDPOINTS } from '../config/api';
import DateTimePicker from '@react-native-community/datetimepicker';

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

type FilterOption = 'all' | 'today' | 'week' | 'month' | 'custom';

const DiagnosticHistory: React.FC = () => {
  const navigation = useNavigation();
  const [history, setHistory] = useState<Diagnosis[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  
  // Custom date range states
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [dateRangeModalVisible, setDateRangeModalVisible] = useState(false);

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
            const historyArray = Array.isArray(historyData) ? historyData : [];
            setHistory(historyArray);
            applyFilter('all', historyArray);
            console.log("Loaded", historyArray.length, "records");
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

  const applyFilter = (filter: FilterOption, data?: Diagnosis[], startDate?: Date, endDate?: Date) => {
    const historyData = data || history;
    const now = new Date();
    let filtered: Diagnosis[] = [];

    switch (filter) {
      case 'today':
        filtered = historyData.filter(item => {
          const itemDate = new Date(item.diagnosis_date);
          return (
            itemDate.getDate() === now.getDate() &&
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear()
          );
        });
        break;

      case 'week':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = historyData.filter(item => {
          const itemDate = new Date(item.diagnosis_date);
          return itemDate >= oneWeekAgo;
        });
        break;

      case 'month':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = historyData.filter(item => {
          const itemDate = new Date(item.diagnosis_date);
          return itemDate >= oneMonthAgo;
        });
        break;

      case 'custom':
        if (startDate && endDate) {
          // Set start date to beginning of day (00:00:00)
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          
          // Set end date to end of day (23:59:59)
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);

          filtered = historyData.filter(item => {
            const itemDate = new Date(item.diagnosis_date);
            return itemDate >= start && itemDate <= end;
          });
        } else {
          filtered = historyData;
        }
        break;

      case 'all':
      default:
        filtered = historyData;
        break;
    }

    setFilteredHistory(filtered);
    setSelectedFilter(filter);
  };

  const handleFilterSelect = (filter: FilterOption) => {
    if (filter === 'custom') {
      setFilterModalVisible(false);
      setDateRangeModalVisible(true);
    } else {
      applyFilter(filter);
      setFilterModalVisible(false);
    }
  };

  const handleApplyCustomDateRange = () => {
    if (customStartDate > customEndDate) {
      Alert.alert("Invalid Date Range", "Start date must be before or equal to end date");
      return;
    }
    applyFilter('custom', undefined, customStartDate, customEndDate);
    setDateRangeModalVisible(false);
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate && event.type !== 'dismissed') {
      setCustomStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate && event.type !== 'dismissed') {
      setCustomEndDate(selectedDate);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate && event.type !== 'dismissed') {
      if (datePickerMode === 'start') {
        setCustomStartDate(selectedDate);
      } else {
        setCustomEndDate(selectedDate);
      }
    }
  };

  const openStartDatePicker = () => {
    setDatePickerMode('start');
    setShowDatePicker(true);
  };

  const openEndDatePicker = () => {
    setDatePickerMode('end');
    setShowDatePicker(true);
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getFilterLabel = () => {
    switch (selectedFilter) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'custom': return `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`;
      case 'all': return 'All Time';
      default: return 'All Time';
    }
  };

  const handleCardPress = (item: Diagnosis) => {
    const pestInfo = item.pest_name ? {
      name: item.pest_name,
      scientific_name: item.pest_scientific_name || '',
      description: item.pest_description || '',
      damage: item.pest_damage || ''
    } : null;

    const confidenceValue = typeof item.confidence === 'string' 
      ? parseFloat(item.confidence) 
      : item.confidence;

    navigation.navigate('DiagnosisResult' as never, {
      imageUri: `${API_ENDPOINTS.DIAGNOSIS_HISTORY.replace('/api/diagnosis/history', '')}${item.image_path}`,
      diagnosisId: item.id,
      diseaseId: item.disease_name,
      diseaseName: item.disease_name,
      diseaseType: item.disease_type,
      affectedPart: item.plant_part_name,
      confidence: confidenceValue,
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

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <View style={styles.filterInfo}>
          <Ionicons name="filter" size={20} color="#666" />
          <Text style={styles.filterText} numberOfLines={1}>
            Showing: <Text style={styles.filterValue}>{getFilterLabel()}</Text>
          </Text>
          <Text style={styles.countBadge}>({filteredHistory.length})</Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={20} color="#b63c3e" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#b63c3e" />
          </View>
        ) : filteredHistory.length > 0 ? (
          <FlatList
            data={filteredHistory}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all' 
                ? 'No diagnostic history found'
                : `No diagnoses found for ${selectedFilter === 'custom' ? 'selected date range' : getFilterLabel().toLowerCase()}`
              }
            </Text>
            {selectedFilter !== 'all' && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => handleFilterSelect('all')}
              >
                <Text style={styles.clearFilterText}>Show All</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Date Range</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.filterOption, selectedFilter === 'all' && styles.filterOptionActive]}
              onPress={() => handleFilterSelect('all')}
            >
              <Ionicons 
                name="calendar-outline" 
                size={22} 
                color={selectedFilter === 'all' ? "#b63c3e" : "#666"} 
              />
              <Text style={[styles.filterOptionText, selectedFilter === 'all' && styles.filterOptionTextActive]}>
                All Time
              </Text>
              {selectedFilter === 'all' && (
                <Ionicons name="checkmark-circle" size={22} color="#b63c3e" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, selectedFilter === 'today' && styles.filterOptionActive]}
              onPress={() => handleFilterSelect('today')}
            >
              <Ionicons 
                name="today-outline" 
                size={22} 
                color={selectedFilter === 'today' ? "#b63c3e" : "#666"} 
              />
              <Text style={[styles.filterOptionText, selectedFilter === 'today' && styles.filterOptionTextActive]}>
                Today
              </Text>
              {selectedFilter === 'today' && (
                <Ionicons name="checkmark-circle" size={22} color="#b63c3e" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, selectedFilter === 'week' && styles.filterOptionActive]}
              onPress={() => handleFilterSelect('week')}
            >
              <Ionicons 
                name="calendar" 
                size={22} 
                color={selectedFilter === 'week' ? "#b63c3e" : "#666"} 
              />
              <Text style={[styles.filterOptionText, selectedFilter === 'week' && styles.filterOptionTextActive]}>
                Last 7 Days
              </Text>
              {selectedFilter === 'week' && (
                <Ionicons name="checkmark-circle" size={22} color="#b63c3e" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, selectedFilter === 'month' && styles.filterOptionActive]}
              onPress={() => handleFilterSelect('month')}
            >
              <Ionicons 
                name="calendar-sharp" 
                size={22} 
                color={selectedFilter === 'month' ? "#b63c3e" : "#666"} 
              />
              <Text style={[styles.filterOptionText, selectedFilter === 'month' && styles.filterOptionTextActive]}>
                Last 30 Days
              </Text>
              {selectedFilter === 'month' && (
                <Ionicons name="checkmark-circle" size={22} color="#b63c3e" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, selectedFilter === 'custom' && styles.filterOptionActive]}
              onPress={() => handleFilterSelect('custom')}
            >
              <Ionicons 
                name="calendar-number-outline" 
                size={22} 
                color={selectedFilter === 'custom' ? "#b63c3e" : "#666"} 
              />
              <Text style={[styles.filterOptionText, selectedFilter === 'custom' && styles.filterOptionTextActive]}>
                Custom Date Range
              </Text>
              {selectedFilter === 'custom' && (
                <Ionicons name="checkmark-circle" size={22} color="#b63c3e" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Custom Date Range Modal */}
      <Modal
        visible={dateRangeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDateRangeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setDateRangeModalVisible(false)}
          />
          <View style={styles.dateRangeModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity onPress={() => setDateRangeModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.dateRangeContainer}>
              {/* Start Date */}
              <View style={styles.datePickerSection}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={openStartDatePicker}
                >
                  <Ionicons name="calendar-outline" size={20} color="#b63c3e" />
                  <Text style={styles.dateButtonText}>{formatDate(customStartDate)}</Text>
                </TouchableOpacity>
              </View>

              {/* End Date */}
              <View style={styles.datePickerSection}>
                <Text style={styles.dateLabel}>End Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={openEndDatePicker}
                >
                  <Ionicons name="calendar-outline" size={20} color="#b63c3e" />
                  <Text style={styles.dateButtonText}>{formatDate(customEndDate)}</Text>
                </TouchableOpacity>
              </View>

              {/* Date Picker (iOS inline) */}
              {showDatePicker && Platform.OS === 'ios' && (
                <View style={styles.datePickerWrapper}>
                  <Text style={styles.datePickerTitle}>
                    {datePickerMode === 'start' ? 'Select Start Date' : 'Select End Date'}
                  </Text>
                  <DateTimePicker
                    value={datePickerMode === 'start' ? customStartDate : customEndDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={datePickerMode === 'end' ? customStartDate : undefined}
                    style={styles.iosDatePicker}
                    textColor="#000000"
                  />
                  <TouchableOpacity
                    style={styles.datePickerDoneButton}
                    onPress={closeDatePicker}
                  >
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Apply Button */}
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyCustomDateRange}
              >
                <Text style={styles.applyButtonText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Pickers (Android native dialog) */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={datePickerMode === 'start' ? customStartDate : customEndDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={datePickerMode === 'end' ? customStartDate : undefined}
        />
      )}

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
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  filterValue: {
    fontWeight: "bold",
    color: "#000",
  },
  countBadge: {
    fontSize: 14,
    color: "#b63c3e",
    fontWeight: "600",
    marginLeft: 4,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b63c3e",
  },
  filterButtonText: {
    color: "#b63c3e",
    fontWeight: "600",
    marginLeft: 6,
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
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },
  clearFilterButton: {
    marginTop: 20,
    backgroundColor: "#b63c3e",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFilterText: {
    color: "#fff",
    fontWeight: "600",
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  dateRangeModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterOptionActive: {
    backgroundColor: "#fff5f5",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  filterOptionTextActive: {
    color: "#b63c3e",
    fontWeight: "600",
  },
  // Custom Date Range Styles
  dateRangeContainer: {
    padding: 20,
  },
  datePickerSection: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    fontWeight: "500",
  },
  applyButton: {
    backgroundColor: "#b63c3e",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // iOS Date Picker Styles
  datePickerWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    padding: 12,
    backgroundColor: "#f8f8f8",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  iosDatePicker: {
    height: 200,
    backgroundColor: "#ffffff",
  },
  datePickerDoneButton: {
    backgroundColor: "#b63c3e",
    padding: 12,
    alignItems: "center",
  },
  datePickerDoneText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});