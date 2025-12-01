import AsyncStorage from "@react-native-async-storage/async-storage";

// UPDATE THIS URL WHEN NGROK RESTARTS
const NGROK_URL = "https://unflitched-cherishable-flo.ngrok-free.dev";

// For production, you can switch to a permanent URL
const USE_NGROK = true;
const PRODUCTION_URL = "https://your-production-api.com";

export const API_BASE_URL = USE_NGROK ? NGROK_URL : PRODUCTION_URL;

// All your API endpoints in one place
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
  LOGOUT: `${API_BASE_URL}/api/logout`,
  
  // User endpoints
  PROFILE: `${API_BASE_URL}/api/user/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/user/update`,
  
  // Diagnosis endpoints
  DIAGNOSIS_HISTORY: `${API_BASE_URL}/api/diagnosis/history`,
  
  // STATS
  STATS: `${API_BASE_URL}/api/stats`,
  
  //FEEDBACK
  FEEDBACK: `${API_BASE_URL}/api/feedback`,
};

// Helper function to get headers with token
export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};