import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import DiagnosticHistory from "./screens/DiagnoseScreen"; 
import FeedbackScreen from "./screens/FeedBack";
import DiagnosisResult from "./screens/DiagnosticResult";
import ForgetPassScreen from "./screens/ForgetPassScreen";
import AccountSecurityScreen from "./screens/AccountSecurityScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true); // For animation
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // For token check
  const [userToken, setUserToken] = useState<string | null>(null);

  // Check for saved token on startup
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          console.log("Found token:", token);
          setUserToken(token);
        } else {
          console.log("No token found, user must log in");
        }
      } catch (err) {
        console.error("Error checking token:", err);
      } finally {
        setIsCheckingAuth(false); // Auth check complete
      }
    };

    checkToken();
  }, []);

  // Show loading screen until both splash animation AND auth check are done
  if (showSplash || isCheckingAuth) {
    return <LoadingScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={userToken ? "HomeScreen" : "AccountChoice"}
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 150,
          gestureEnabled: true,
        }}
      >
        {/* Disable swipe back on auth screens */}
        <Stack.Screen 
          name="AccountChoice" 
          component={AccountChoice}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          initialParams={{ accountType: "student" }}
          options={{ gestureEnabled: true, animation: "slide_from_right" }}
        />

        <Stack.Screen
          name="ForgotPassScreen"
          component={ForgetPassScreen}
          options={{ gestureEnabled: true }}
        />

        
        {/* Disable swipe back on HomeScreen (main app entry) */}
        <Stack.Screen 
          name="HomeScreen" 
          component={HomeScreen}
          options={{ gestureEnabled: false }}
        />
        
        {/* These screens can have swipe back enabled */}
        <Stack.Screen name="DiagnosticHistory" component={DiagnosticHistory} />
        <Stack.Screen name="DiagnosisResult" component={DiagnosisResult} />
        <Stack.Screen name="CameraScreen" component={CameraScreen} />
        <Stack.Screen name="RemindersScreen" component={RemindersScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="AccountSecurityScreen" component={AccountSecurityScreen} />
        <Stack.Screen name="PestClassification" component={PestClassification} />
        <Stack.Screen name="PestDetails" component={PestDetails} />
        <Stack.Screen name="ChatBotScreen" component={ChatBot} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}