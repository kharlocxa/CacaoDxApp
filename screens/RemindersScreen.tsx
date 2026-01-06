import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Alert, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import BottomNav from "./layout/BottomNav";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  color: string;
  date: string;
}

const defaultTasks = [
  "Manually remove the mealybugs",
  "Prune severely infested pods or branches if needed.",
  "Apply neem oil or insecticidal soap",
  "Inspect cacao leaves for signs of disease",
  "Water the cacao plants thoroughly",
  "Check soil moisture and adjust watering schedule",
  "Remove dead leaves and branches",
  "Apply fungicide to affected areas",
  "Monitor for pest infestations",
  "Clear weeds around the base of trees",
  "Trim overgrown branches for better air circulation",
  "Check for and remove any diseased pods",
  "Apply organic fertilizer to soil",
  "Inspect for scale insects and treat if necessary",
  "Prune lower branches for easier harvesting",
];

const colors = ["#FF6B6B", "#FF9F43", "#6C63FF", "#1EA498", "#FF5E78"];

// Function to generate consistent random tasks for a date
const generateTasksForDate = (dateString: string): Task[] => {
  const dateNum = new Date(dateString).getTime();
  let seed = dateNum % 1000;
  
  // Use date as seed to get consistent tasks for same date
  const shuffled = [...defaultTasks].sort(() => {
    const random = Math.sin(seed++) * 10000;
    return random - Math.floor(random);
  });
  
  // Pick 3 random tasks for this date
  const selectedTasks = shuffled.slice(0, 3);
  
  return selectedTasks.map((text, index) => ({
    id: `${dateString}-${index}`,
    text,
    completed: false,
    color: colors[index % colors.length],
    date: dateString,
  }));
};

const Reminders: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const navigation = useNavigation();

  // Get tasks for selected date - generate if not exists
  const tasksForDate = userTasks.filter(task => task.date === selectedDate);
  
  // If no tasks for this date, generate them
  if (tasksForDate.length === 0 && selectedDate) {
    const generatedTasks = generateTasksForDate(selectedDate);
    setUserTasks([...userTasks, ...generatedTasks]);
  }

  // Toggle task completion
  const toggleTask = (id: string) => {
    setUserTasks(userTasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete task
  const deleteTask = (id: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      { text: "Delete", onPress: () => setUserTasks(userTasks.filter(task => task.id !== id)), style: "destructive" },
    ]);
  };

  // Add new task
  const addTask = () => {
    if (newTask.trim() === "") {
      Alert.alert("Empty Task", "Please enter a task description");
      return;
    }

    const newTaskObj: Task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      color: colors[Math.floor(Math.random() * colors.length)],
      date: selectedDate,
    };

    setUserTasks([...userTasks, newTaskObj]);
    setNewTask("");
    setShowAddTask(false);
  };

  // Get marked dates (days with tasks)
  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: "#b63c3e",
    },
  };

  // Mark all dates with tasks
  userTasks.forEach(task => {
    if (markedDates[task.date]) {
      markedDates[task.date].marked = true;
    } else {
      markedDates[task.date] = { marked: true, dotColor: "#1EA498" };
    }
  });

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.todoItem}
      onLongPress={() => deleteTask(item.id)}
    >
      <View style={[styles.bullet, { backgroundColor: item.color }]} />
      <TouchableOpacity
        onPress={() => toggleTask(item.id)}
        style={styles.checkboxContainer}
      >
        <Ionicons
          name={item.completed ? "checkbox" : "square-outline"}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>
      <Text
        style={[
          styles.todoText,
          item.completed && styles.completedText,
        ]}
      >
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Calendar */}
          <View style={styles.calendarWrapper}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: "#1EA498",
                todayTextColor: "#D34C4E",
                arrowColor: "#1EA498",
                textMonthFontWeight: "bold",
                monthTextColor: "#171718",
                dotColor: "#1EA498",
                selectedDotColor: "#fff",
              }}
            />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>To-Do List</Text>
            <Text style={styles.dateText}>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
          </View>

          {/* To-Do List */}
          <View style={styles.todoContainer}>
            <View style={styles.todoHeader}>
              <Text style={styles.todoTitle}>Tasks ({tasksForDate.length})</Text>
              <TouchableOpacity
                onPress={() => setShowAddTask(!showAddTask)}
                style={styles.addButton}
              >
                <Ionicons name={showAddTask ? "close" : "add"} size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Add Task Input */}
            {showAddTask && (
              <View style={styles.addTaskContainer}>
                <TextInput
                  style={styles.taskInput}
                  placeholder="Enter new task..."
                  placeholderTextColor="#ccc"
                  value={newTask}
                  onChangeText={setNewTask}
                  onSubmitEditing={addTask}
                />
                <TouchableOpacity onPress={addTask} style={styles.submitButton}>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Task List */}
            {tasksForDate.length > 0 ? (
              <FlatList
                data={tasksForDate}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-done-outline" size={40} color="#fff" />
                <Text style={styles.emptyText}>No tasks for this day</Text>
              </View>
            )}

            {/* Progress Bar */}
            {tasksForDate.length > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(tasksForDate.filter(t => t.completed).length / tasksForDate.length) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {tasksForDate.filter(t => t.completed).length}/{tasksForDate.length} completed
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNav
        active="Reminders"
        onNavigate={(screen) => navigation.navigate(screen as never)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  container: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 30,
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
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#171718",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  todoContainer: {
    width: "90%",
    backgroundColor: "#b63c3e",
    borderRadius: 16,
    padding: 12,
    marginTop: 16,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  todoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  todoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  addTaskContainer: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  taskInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#171718",
  },
  submitButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxContainer: {
    marginRight: 8,
    padding: 4,
  },
  todoText: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#fff",
    marginTop: 8,
    opacity: 0.8,
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
  },
});

export default Reminders;