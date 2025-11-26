import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AccountChoice from "./screens/AccountChoice";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import CameraScreen from "./screens/CameraScreen";
import LoadingScreen from "./screens/LoadingScreen";
import ProfileScreen from "./screens/ProfileScreen";
import PestClassification from "./screens/PestClassification";
import PestDetails from "./screens/PestDetails";
import RemindersScreen from "./screens/RemindersScreen";
import ChatBot from "./screens/ChatBotScreen";
import SettingsScreen from "./screens/SettingsScreen";

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
        initialRouteName="AccountChoice"
        screenOptions={{
          headerShown: false,
          // 👇 Transition style (try which feels best)
          animation: "fade", // fade + slight slide, very similar to GCash
          // animation: "fade",          // clean fade in/out
          // animation: "slide_from_bottom", // good for modals
          animationDuration: 250, // shorter = snappier feel (default is ~350ms)
          gestureEnabled: true,   // allows swipe back on iOS
        }}
      >
        <Stack.Screen name="AccountChoice" component={AccountChoice} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          initialParams={{ accountType: "student" }}
        />
              <Stack.Screen name="HomeScreen" component={HomeScreen} />
              <Stack.Screen name="CameraScreen" component={CameraScreen} />
              <Stack.Screen name="RemindersScreen" component={RemindersScreen} />
              <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
              <Stack.Screen name="PestClassification" component={PestClassification} />
              <Stack.Screen name="PestDetails" component={PestDetails} />
              <Stack.Screen name="ChatBotScreen" component={ChatBot} />
              <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
