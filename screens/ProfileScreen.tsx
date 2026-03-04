import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "./layout/BottomNav";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as ImagePicker from "expo-image-picker";
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();

  const [user, setUser] = useState<{ 
    first_name: string; 
    last_name: string; 
    email: string;
    contact_number?: string;
    profile_picture?: string;
    profile_picture_url?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [checkingNotifications, setCheckingNotifications] = useState(true);

  // Fetch profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
      checkNotificationStatus();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session expired", "Please log in again.");
        navigation.navigate("Login" as never);
        return;
      }

      console.log("Fetching profile from:", API_ENDPOINTS.PROFILE);

      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error:", errorText);
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      console.log("Profile data:", data);
      console.log("Profile picture path:", data.profile_picture);
      console.log("Profile picture URL:", data.profile_picture_url);
      
      setUser(data);
      setImageError(false); // Reset error state
    } catch (error) {
      console.error("Profile fetch error:", error);
      Alert.alert("Error", "Unable to fetch profile info");
    } finally {
      setLoading(false);
    }
  };

  const checkNotificationStatus = async () => {
    try {
      if (!Device.isDevice) {
        setNotificationsEnabled(false);
        setCheckingNotifications(false);
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === 'granted');
    } catch (error) {
      console.error("Error checking notification status:", error);
      setNotificationsEnabled(false);
    } finally {
      setCheckingNotifications(false);
    }
  };

  const showImageOptions = () => {
    const options = [
      { text: 'Take Photo', onPress: openCamera },
      { text: 'Choose from Library', onPress: openGallery },
    ];

    if (user?.profile_picture_url) {
      options.push({ 
        text: 'Remove Photo', 
        onPress: deleteProfilePicture, 
        style: 'destructive' as const 
      });
    }

    options.push({ text: 'Cancel', style: 'cancel' as const });

    Alert.alert(
      'Profile Picture',
      'Choose an option',
      options
    );
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access is needed to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadProfilePicture(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Photo library access is needed to select photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadProfilePicture(result.assets[0].uri);
    }
  };

  const uploadProfilePicture = async (imageUri: string) => {
    setUploadingImage(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please log in again.");
        return;
      }

      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'profile.jpg';
      
      let fileType = 'image/jpeg';
      if (filename.toLowerCase().endsWith('.png')) {
        fileType = 'image/png';
      } else if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) {
        fileType = 'image/jpeg';
      }

      formData.append('profile_picture', {
        uri: imageUri,
        name: filename,
        type: fileType,
      } as any);

      const uploadUrl = `${API_ENDPOINTS.PROFILE}/upload-picture`;
      console.log('=== UPLOAD DEBUG ===');
      console.log('Upload URL:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log('Response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid server response: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Upload failed with status ${response.status}`);
      }

      console.log('Upload successful!');
      console.log('New profile_picture_url:', data.profile_picture_url);

      // Refresh profile
      await fetchProfile();
      Alert.alert('Success', 'Profile picture updated successfully!');

    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Upload Error", error.message || "Failed to upload profile picture");
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteProfilePicture = async () => {
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert("Error", "Please log in again.");
                return;
              }

              const response = await fetch(`${API_ENDPOINTS.PROFILE}/delete-picture`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Failed to delete profile picture');
              }

              await fetchProfile();
              Alert.alert('Success', 'Profile picture removed successfully!');

            } catch (error: any) {
              console.error("Delete error:", error);
              Alert.alert("Error", error.message || "Failed to delete profile picture");
            }
          }
        }
      ]
    );
  };

  const toggleNotifications = async () => {
    if (!Device.isDevice) {
      Alert.alert('Not Available', 'Notifications are only available on physical devices');
      return;
    }

    if (!notificationsEnabled) {
      Alert.alert(
        "Enable Notifications",
        "Would you like to receive reminders for your cacao farm tasks?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            onPress: async () => {
              const { status } = await Notifications.requestPermissionsAsync();
              
              if (status === 'granted') {
                setNotificationsEnabled(true);
                Alert.alert('Success', 'Notifications have been enabled!');
              } else {
                Alert.alert(
                  'Permission Denied',
                  'Please enable notifications in your device settings.'
                );
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        "Disable Notifications",
        "This will cancel all scheduled notifications. You can re-enable them later.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: async () => {
              await Notifications.cancelAllScheduledNotificationsAsync();
              setNotificationsEnabled(false);
              Alert.alert('Disabled', 'Notifications have been turned off.');
            }
          }
        ]
      );
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const headers = { Authorization: `Bearer ${token}` };
              const response = await fetch(API_ENDPOINTS.LOGOUT, {
                method: "POST",
                headers,
              });

              if (!response.ok) {
                console.warn("Logout failed:", await response.text());
              }

              await AsyncStorage.multiRemove(["token", "userToken", "user"]);

              navigation.reset({
                index: 0,
                routes: [{ name: "Login" as never }],
              });
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Network Error", "Unable to reach the server. Check your internet or API URL.");
            }
          },
        },
      ]
    );
  };

  // Build proper image URL
  const getProfileImageUrl = () => {
    if (!user?.profile_picture_url && !user?.profile_picture) {
      return null;
    }

    // Use profile_picture_url if available
    if (user.profile_picture_url) {
      console.log('Using profile_picture_url:', user.profile_picture_url);
      return user.profile_picture_url;
    }

    // Fallback: construct URL from profile_picture path
    const imagePath = user.profile_picture;
    const imageUrl = `${API_BASE_URL}${imagePath}`;
    console.log('Constructed URL from path:', imageUrl);
    return imageUrl;
  };

  const profileImageUrl = getProfileImageUrl();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#b63c3e" />
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.headerText}>Profile</Text>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.avatarWrapper}>
                <TouchableOpacity 
                  style={styles.avatar}
                  onPress={showImageOptions}
                  disabled={uploadingImage}
                  activeOpacity={0.8}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="large" color="#b63c3e" />
                  ) : profileImageUrl && !imageError ? (
                    <Image
                      source={{ uri: profileImageUrl }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                      onError={(error) => {
                        console.error('Image load error:', error.nativeEvent.error);
                        console.error('Failed URL:', profileImageUrl);
                        setImageError(true);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', profileImageUrl);
                      }}
                    />
                  ) : (
                    <Image
                      source={require("../assets/homepics/cacaopod.png")}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  )}
                </TouchableOpacity>
                {!uploadingImage && (
                  <View style={styles.cameraIconContainer}>
                    <Ionicons name="camera" size={18} color="#fff" />
                  </View>
                )}
              </View>
              <Text style={styles.name}>
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : "Unknown User"}
              </Text>
              <Text style={styles.email}>{user?.email || "No email"}</Text>
              {user?.contact_number && (
                <Text style={styles.contact}>{user.contact_number}</Text>
              )}
            </View>

            <View style={styles.options}>
              <TouchableOpacity 
                style={styles.option}
                onPress={toggleNotifications}
                disabled={checkingNotifications}
              >
                <View style={styles.optionRow}>
                  <View style={styles.optionLeft}>
                    <Ionicons 
                      name={notificationsEnabled ? "notifications" : "notifications-off"} 
                      size={20} 
                      color={notificationsEnabled ? "#b63c3e" : "#999"} 
                      style={styles.optionIcon}
                    />
                    <View>
                      <Text style={styles.optionText}>Notifications</Text>
                      <Text style={styles.subText}>
                        {checkingNotifications 
                          ? "Checking..." 
                          : notificationsEnabled 
                            ? "Reminders enabled" 
                            : "Enable task reminders"}
                      </Text>
                    </View>
                  </View>
                  {!checkingNotifications && (
                    <View style={[
                      styles.toggle,
                      notificationsEnabled && styles.toggleActive
                    ]}>
                      <View style={[
                        styles.toggleCircle,
                        notificationsEnabled && styles.toggleCircleActive
                      ]} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.option}
                onPress={() => navigation.navigate("SettingsScreen" as never)}
              >
                <Text style={styles.optionText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.option}
                onPress={() => navigation.navigate("FeedbackScreen" as never)}
              >
                <Text style={styles.optionText}>Feedback</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.option}
                onPress={() => navigation.navigate("UserFeedbackScreen" as never)}
              >
                <Text style={styles.optionText}>My Feedbacks</Text>
                <Text style={styles.subText}>View your feedback history</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, styles.logout]}
                onPress={handleLogout}
              >
                <Text style={[styles.optionText, { color: "#d9534f" }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <BottomNav
        active="Profile"
        onNavigate={(screen) => navigation.navigate(screen as never)}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
  header: {
    backgroundColor: "#b63c3e",
    paddingVertical: 10,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  profileInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#b63c3e",
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#b63c3e",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#faf8f8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  email: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  contact: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  debugText: {
    fontSize: 10,
    color: "#999",
    marginTop: 8,
    fontFamily: 'monospace',
  },
  options: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  option: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
  },
  subText: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ddd",
    padding: 3,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#b63c3e",
  },
  toggleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
  },
  toggleCircleActive: {
    alignSelf: "flex-end",
  },
  logout: {
    backgroundColor: "#ffe5e5",
  },
});