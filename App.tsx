import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AccountChoice from "./screens/AccountChoice";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import CameraScreen from "./screens/CameraScreen";
import LoadingScreen from "./screens/LoadingScreen"; // IMPORT LOADING
import ProfileScreen from "./screens/ProfileScreen";
import PestClassification from "./screens/PestClassification";
import PestDetails from "./screens/PestDetails";
import RemindersScreen from "./screens/RemindersScreen";
import ChatBot from "./screens/ChatBotScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true); // state for loading

  if (isLoading) {
    // Show loading screen before navigator
    return <LoadingScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AccountChoice" // ✅ After loading, go here first
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="AccountChoice" component={AccountChoice} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          // Forward accountType so LoginScreen can use it
          initialParams={{ accountType: "student" }}
        />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="CameraScreen" component={CameraScreen} />
        <Stack.Screen name="RemindersScreen" component={RemindersScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="PestClassification" component={PestClassification} />
        <Stack.Screen name="PestDetails" component={PestDetails} />
        <Stack.Screen name="ChatBotScreen" component={ChatBot} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
