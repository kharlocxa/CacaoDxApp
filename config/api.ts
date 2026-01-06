import AsyncStorage from "@react-native-async-storage/async-storage";

// UPDATE THIS URL WHEN NGROK RESTARTS
const NGROK_URL = "https://unflitched-cherishable-flo.ngrok-free.dev";

// For production, you can switch to a permanent URL
const USE_NGROK = true;
const PRODUCTION_URL = "https://your-production-api.com";

export const API_BASE_URL = USE_NGROK ? NGROK_URL : PRODUCTION_URL;

// ML API Configuration (Flask server)
// For local development, use your computer's IP address
// Make sure your phone and computer are on the same WiFi network
const ML_API_LOCAL = "http://192.168.1.18:8080"; // UPDATE WITH YOUR IP
const ML_API_PRODUCTION = "https://your-ml-api.com";
const USE_LOCAL_ML = true;

export const ML_API_URL = USE_LOCAL_ML ? ML_API_LOCAL : ML_API_PRODUCTION;

// All your API endpoints in one place
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
  LOGOUT: `${API_BASE_URL}/api/logout`,
  
  // User endpoints
  PROFILE: `${API_BASE_URL}/api/user/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/user/update`,
  
  // Diagnosis endpoints (CodeIgniter)
  DIAGNOSIS_UPLOAD: `${API_BASE_URL}/api/diagnosis/upload`,
  DIAGNOSIS_HISTORY: `${API_BASE_URL}/api/diagnosis/history`,
  DIAGNOSIS_DETAIL: `${API_BASE_URL}/api/diagnosis`,
  
  // Disease endpoints
  DISEASES_LIST: `${API_BASE_URL}/api/disease/list`,
  DISEASE_DETAIL: `${API_BASE_URL}/api/disease`,
  
  // STATS
  STATS: `${API_BASE_URL}/api/stats`,
  
  // PEST endpoints
  PESTS: `${API_BASE_URL}/api/pests`,
  PEST_DETAIL: `${API_BASE_URL}/api/pests`,  

  // FEEDBACK
  FEEDBACK: `${API_BASE_URL}/api/feedback`,
  
  // ML API endpoints (Flask - Direct call, bypass CodeIgniter for faster inference)
  ML_PREDICT: `${ML_API_URL}/predict`,
  ML_HEALTH: `${ML_API_URL}/health`,
};

// Helper function to get headers with token
export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

// Helper function to get multipart headers with token
export const getMultipartHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    "Content-Type": "multipart/form-data",
    "Authorization": `Bearer ${token}`,
  };
};

// API request wrapper with error handling
export const apiRequest = async (
  url: string,
  method: string = 'GET',
  data?: any,
  headers?: any
) => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(url, {
      method,
      headers: { ...authHeaders, ...headers },
      body: data ? JSON.stringify(data) : undefined,
    });

    const jsonData = await response.json();

    if (!response.ok) {
      throw new Error(jsonData.message || 'API request failed');
    }

    return jsonData;
  } catch (error: any) {
    console.error('API Request Error:', error);
    throw error;
  }
};