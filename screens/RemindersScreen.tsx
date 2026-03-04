import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Alert, TextInput, ScrollView, Modal, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import BottomNav from "./layout/BottomNav";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface Task {
  id: string;
  text: string;
  completed: boolean;
  color: string;
  date: string;
  time: string;
  timeOfDay: 'morning' | 'midday' | 'afternoon';
  notificationId?: string; // Store notification ID for cancellation
}

const defaultTasksWithTime = [
  { text: "Water the cacao plants thoroughly", time: "07:00 AM", timeOfDay: 'morning' as const },
  { text: "Inspect cacao leaves for signs of disease", time: "08:00 AM", timeOfDay: 'morning' as const },
  { text: "Check soil moisture and adjust watering schedule", time: "08:30 AM", timeOfDay: 'morning' as const },
  { text: "Manually remove the mealybugs", time: "11:00 AM", timeOfDay: 'midday' as const },
  { text: "Apply neem oil or insecticidal soap", time: "11:30 AM", timeOfDay: 'midday' as const },
  { text: "Prune severely infested pods or branches if needed", time: "12:00 PM", timeOfDay: 'midday' as const },
  { text: "Remove dead leaves and branches", time: "01:00 PM", timeOfDay: 'midday' as const },
  { text: "Apply fungicide to affected areas", time: "01:30 PM", timeOfDay: 'midday' as const },
  { text: "Clear weeds around the base of trees", time: "03:00 PM", timeOfDay: 'afternoon' as const },
  { text: "Trim overgrown branches for better air circulation", time: "03:30 PM", timeOfDay: 'afternoon' as const },
  { text: "Check for and remove any diseased pods", time: "04:00 PM", timeOfDay: 'afternoon' as const },
  { text: "Apply organic fertilizer to soil", time: "04:30 PM", timeOfDay: 'afternoon' as const },
  { text: "Monitor for pest infestations", time: "05:00 PM", timeOfDay: 'afternoon' as const },
  { text: "Inspect for scale insects and treat if necessary", time: "05:30 PM", timeOfDay: 'afternoon' as const },
];

const colors = ["#FF6B6B", "#FF9F43", "#6C63FF", "#1EA498", "#FF5E78"];

const generateTasksForDate = (dateString: string): Task[] => {
  const dateNum = new Date(dateString).getTime();
  let seed = dateNum % 1000;
  
  const shuffled = [...defaultTasksWithTime].sort(() => {
    const random = Math.sin(seed++) * 10000;
    return random - Math.floor(random);
  });
  
  const selectedTasks = shuffled.slice(0, 4);
  
  return selectedTasks.map((task, index) => ({
    id: `${dateString}-${index}`,
    text: task.text,
    time: task.time,
    timeOfDay: task.timeOfDay,
    completed: false,
    color: colors[index % colors.length],
    date: dateString,
  }));
};

// Helper function to parse time string to minutes for sorting
const parseTimeToMinutes = (timeString: string): number => {
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;
  
  if (period === 'PM' && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }
  
  return hour24 * 60 + minutes; // Convert to total minutes for easy comparison
};

const Reminders: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("09:00 AM");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const navigation = useNavigation();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Ask user on mount if they want notifications
    askForNotifications();

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    return () => {
      // Clean up subscriptions properly
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const askForNotifications = async () => {
    if (!Device.isDevice) {
      console.log('Not a physical device, skipping notifications');
      return;
    }

    // Check if we already have permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      setNotificationsEnabled(true);
      return;
    }

    // Ask user if they want notifications
    Alert.alert(
      "Enable Notifications?",
      "Would you like to receive reminders for your cacao farm tasks?",
      [
        {
          text: "Not Now",
          style: "cancel",
          onPress: () => setNotificationsEnabled(false)
        },
        {
          text: "Enable",
          onPress: async () => {
            await registerForPushNotifications();
          }
        }
      ]
    );
  };

  const registerForPushNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied', 
        'You can enable notifications later in your device settings.'
      );
      setNotificationsEnabled(false);
      return;
    }
    
    setNotificationsEnabled(true);
    Alert.alert('Success!', 'You will now receive task reminders.');
  };

  const scheduleNotification = async (task: Task): Promise<string | null> => {
    if (!notificationsEnabled) {
      return null;
    }

    try {
      // Parse time
      const [timeStr, period] = task.time.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      let hour24 = hours;
      
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }

      // Create notification date
      const taskDate = new Date(task.date);
      taskDate.setHours(hour24, minutes, 0, 0);

      // Don't schedule if time has passed
      if (taskDate <= new Date()) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌱 Cacao Farm Reminder",
          body: task.text,
          data: { taskId: task.id },
          sound: true,
        },
        trigger: taskDate,
      });

      console.log('Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  const cancelNotification = async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  };

  const tasksForDate = userTasks.filter(task => task.date === selectedDate);
  
  if (tasksForDate.length === 0 && selectedDate) {
    const generatedTasks = generateTasksForDate(selectedDate);
    
    // Schedule notifications for generated tasks
    Promise.all(generatedTasks.map(async (task) => {
      const notificationId = await scheduleNotification(task);
      return { ...task, notificationId };
    })).then(tasksWithNotifications => {
      setUserTasks([...userTasks, ...tasksWithNotifications]);
    });
  }

  const sortedTasks = [...tasksForDate].sort((a, b) => {
    return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
  });

  const toggleTask = (id: string) => {
    setUserTasks(userTasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    const task = userTasks.find(t => t.id === id);
    
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        onPress: () => {
          // Cancel notification if exists
          if (task?.notificationId) {
            cancelNotification(task.notificationId);
          }
          setUserTasks(userTasks.filter(task => task.id !== id));
        }, 
        style: "destructive" 
      },
    ]);
  };

  const addTask = async () => {
    if (newTask.trim() === "") {
      Alert.alert("Empty Task", "Please enter a task description");
      return;
    }

    const hour = parseInt(selectedTime.split(':')[0]);
    const isPM = selectedTime.includes('PM');
    let timeOfDay: 'morning' | 'midday' | 'afternoon' = 'morning';
    
    if (hour >= 10 && hour < 15) timeOfDay = 'midday';
    else if (hour >= 15 || (isPM && hour >= 3)) timeOfDay = 'afternoon';

    const newTaskObj: Task = {
      id: Date.now().toString(),
      text: newTask,
      time: selectedTime,
      timeOfDay: timeOfDay,
      completed: false,
      color: colors[Math.floor(Math.random() * colors.length)],
      date: selectedDate,
    };

    // Schedule notification
    const notificationId = await scheduleNotification(newTaskObj);
    if (notificationId) {
      newTaskObj.notificationId = notificationId;
    }

    // Add new task and sort all tasks by date and time
    const updatedTasks = [...userTasks, newTaskObj];
    
    // Sort tasks by date first, then by time within the same date
    const sortedUpdatedTasks = updatedTasks.sort((a, b) => {
      // First sort by date
      if (a.date !== b.date) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      
      // Then sort by time within the same date
      return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
    });
    
    setUserTasks(sortedUpdatedTasks);
    setNewTask("");
    setShowAddTask(false);

    if (notificationsEnabled) {
      // Don't show alert every time, just schedule silently
      console.log('Task added with notification');
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      await registerForPushNotifications();
    } else {
      Alert.alert(
        "Disable Notifications",
        "This will cancel all scheduled notifications. You can re-enable them in settings.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Disable", 
            onPress: () => {
              Notifications.cancelAllScheduledNotificationsAsync();
              setNotificationsEnabled(false);
            }
          }
        ]
      );
    }
  };

  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return 'sunny';
      case 'midday': return 'partly-sunny';
      case 'afternoon': return 'moon';
      default: return 'time';
    }
  };

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: "#b63c3e",
    },
  };

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
      <View style={styles.taskLeft}>
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
        <View style={styles.taskContent}>
          <Text style={[styles.todoText, item.completed && styles.completedText]}>
            {item.text}
          </Text>
          <View style={styles.timeRow}>
            <Ionicons name={getTimeOfDayIcon(item.timeOfDay)} size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.timeText}>{item.time}</Text>
            {item.notificationId && (
              <Ionicons name="notifications" size={12} color="rgba(255,255,255,0.7)" style={{ marginLeft: 8 }} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const timeOptions = [
    "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
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

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Daily Schedule</Text>
            <Text style={styles.dateText}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          </View>

          <View style={styles.todoContainer}>
            <View style={styles.todoHeader}>
              <Text style={styles.todoTitle}>Tasks ({sortedTasks.length})</Text>
              <TouchableOpacity
                onPress={() => setShowAddTask(!showAddTask)}
                style={styles.addButton}
              >
                <Ionicons name={showAddTask ? "close" : "add"} size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {showAddTask && (
              <View style={styles.addTaskContainer}>
                <TextInput
                  style={styles.taskInput}
                  placeholder="Enter new task..."
                  placeholderTextColor="#ccc"
                  value={newTask}
                  onChangeText={setNewTask}
                />
                <TouchableOpacity 
                  onPress={() => setShowTimePicker(true)}
                  style={styles.timeButton}
                >
                  <Ionicons name="time-outline" size={16} color="#b63c3e" />
                  <Text style={styles.timeButtonText}>{selectedTime}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addTask} style={styles.submitButton}>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {sortedTasks.length > 0 ? (
              <FlatList
                data={sortedTasks}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-done-outline" size={40} color="#fff" />
                <Text style={styles.emptyText}>No tasks scheduled</Text>
              </View>
            )}

            {sortedTasks.length > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(sortedTasks.filter(t => t.completed).length / sortedTasks.length) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {sortedTasks.filter(t => t.completed).length}/{sortedTasks.length} completed
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimePicker(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.timeList}>
              {timeOptions.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    selectedTime === time && styles.timeOptionActive
                  ]}
                  onPress={() => {
                    setSelectedTime(time);
                    setShowTimePicker(false);
                  }}
                >
                  <Text style={[
                    styles.timeOptionText,
                    selectedTime === time && styles.timeOptionTextActive
                  ]}>
                    {time}
                  </Text>
                  {selectedTime === time && (
                    <Ionicons name="checkmark-circle" size={22} color="#b63c3e" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  timeButtonText: {
    fontSize: 12,
    color: "#b63c3e",
    fontWeight: "600",
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
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  taskContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
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
  timeList: {
    maxHeight: 300,
  },
  timeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  timeOptionActive: {
    backgroundColor: "#fff5f5",
  },
  timeOptionText: {
    fontSize: 16,
    color: "#333",
  },
  timeOptionTextActive: {
    color: "#b63c3e",
    fontWeight: "600",
  },
});

export default Reminders;