import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ChatBot: React.FC = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>

        {/* Back Button */}
        <TouchableOpacity onPress ={() => navigation.goBack()}
        style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#376F6A" />
        </TouchableOpacity>

        {/* Title + Cacao Icon */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Cao</Text>
          <Image
            source={require("../assets/homepics/cacaoAI.png")}
            style={styles.cacaoIcon}
          />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              Remembers what user said earlier in the conversation
            </Text>
          </View>

          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              Allows user to provide follow-up corrections with AI
            </Text>
          </View>

          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>FAQ</Text>
          </View>
        </View>

        {/* Send Message Input */}
        <View style={styles.sendMessageContainer}>
          <View style={styles.inputBox}>
            <Text style={styles.placeholder}>Send a message.</Text>
            <TouchableOpacity style={styles.sendButton}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatBot;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#faf8f8",
  },
  container: {
    flex: 1,
    backgroundColor: "#faf8f8",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 20,
  },
  backIcon: {
    width: 12,
    height: 12,
    resizeMode: "contain",
  },
  titleContainer: {
    marginTop: 40,
    flexDirection: "row", // ✅ make them side by side
    alignItems: "center", // ✅ vertically align text and image
    justifyContent: "center", // ✅ keep them centered horizontally
    gap: 1, // ✅ add spacing between text and image (React Native 0.71+)
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1EA498",
    textShadowColor: "#00000040",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  cacaoIcon: {
    width: 66,
    height: 62,
    resizeMode: "contain",
    marginTop: 10,
  },
  instructions: {
    marginTop: 30,
    width: "85%",
  },
  instructionBox: {
    backgroundColor: "#f7f7f8",
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: {
    fontSize: 14,
    textAlign: "center",
    color: "#1e1e1e9e",
  },
  sendMessageContainer: {
    position: "absolute",
    bottom: 30,
    width: "85%",
  },
  inputBox: {
    backgroundColor: "#fff",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  placeholder: {
    color: "#888",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#1FA498",
    borderRadius: 20,
    padding: 6,
  },
  sendIcon: {
    width: 18,
    height: 18,
    tintColor: "#fff",
    resizeMode: "contain",
  },
});
