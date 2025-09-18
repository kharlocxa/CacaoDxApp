import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import BottomNav from "./layout/BottomNav";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const Reminders: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* Calendar */}
        <View style={styles.calendarWrapper}>
          <Calendar
            current={new Date().toISOString().split("T")[0]}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#1EA498",
              },
            }}
            theme={{
              selectedDayBackgroundColor: "#1EA498",
              todayTextColor: "#D34C4E",
              arrowColor: "#1EA498",
              textMonthFontWeight: "bold",
              monthTextColor: "#171718",
            }}
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>To-Do List</Text>
        </View>

        {/* To-Do List */}
        <View style={styles.todoContainer}>
          <Text style={styles.todoTitle}>Task</Text>

          <View style={styles.todoItem}>
            <Ionicons name="ellipse" size={8} color="#FF6B6B" style={styles.bullet} />
            <Ionicons name="checkbox-outline" size={20} color="#fff" style={styles.checkbox} />
            <Text style={styles.todoText}>Manually remove the mealybugs</Text>
          </View>

          <View style={styles.todoItem}>
            <Ionicons name="ellipse" size={8} color="#FF9F43" style={styles.bullet} />
            <Ionicons name="square-outline" size={20} color="#fff" style={styles.checkbox} />
            <Text style={styles.todoText}>Prune severely infested pods or branches if needed.</Text>
          </View>

          <View style={styles.todoItem}>
            <Ionicons name="ellipse" size={8} color="#6C63FF" style={styles.bullet} />
            <Ionicons name="checkbox-outline" size={20} color="#fff" style={styles.checkbox} />
            <Text style={styles.todoText}>Apply neem oil or insecticidal soap</Text>
          </View>

        </View>

        {/* Bottom Nav */}
        <BottomNav
          active="Reminders"
          onNavigate={(screen) => navigation.navigate(screen as never)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  container: {
    flex: 1,
    backgroundColor: "#faf8f8",
    width: "100%",
    alignItems: "center",
  },
  calendarWrapper: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 3,
    marginTop: 10,
  },
  titleContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: "center",
    right: 120,
  },
  title: {
    fontSize: 24,
    // fontWeight: "bold",
    color: "#171718",
  },
  todoContainer: {
    width: "90%",
    backgroundColor: "#1EA498",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  todoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bullet: {
    marginRight: 6,
  },
  checkbox: {
    marginRight: 8,
  },
  todoText: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
  },
});

export default Reminders;
