// import AsyncStorage from "@react-native-async-storage/async-storage";

// // UPDATE THIS URL WHEN NGROK RESTARTS
// const NGROK_URL = "https://burbly-prefearful-shiloh.ngrok-free.dev";
// const LOCAL_URL = "http://192.168.1.3:8000";
// // const LOCAL_URL = "http://localhost:8000";

// // For production, you can switch to a permanent URL
// const USE_NGROK = true;
// const USE_LOCAL = false;
// const PRODUCTION_URL = "https://your-production-api.com";

// export const API_BASE_URL = USE_NGROK ? NGROK_URL : PRODUCTION_URL;

// // ML API Configuration (Flask server)
// const ML_API_LOCAL = "http://192.168.1.3:5000"; // UPDATE WITH YOUR IP
// // const ML_API_LOCAL = "http://172.16.48.119:5000"; // UPDATE WITH YOUR IP
// const ML_API_PRODUCTION = "https://your-ml-api.com";
// const USE_LOCAL_ML = true;
// export const ML_API_URL = USE_LOCAL_ML ? ML_API_LOCAL : ML_API_PRODUCTION;

// // All your API endpoints in one place
// export const API_ENDPOINTS = {
//   // Auth endpoints
//   LOGIN: `${API_BASE_URL}/api/login`,
//   REGISTER: `${API_BASE_URL}/api/register`,
//   LOGOUT: `${API_BASE_URL}/api/logout`,
  
//   // User endpoints
//   PROFILE: `${API_BASE_URL}/api/profile`,
//   UPDATE_PROFILE: `${API_BASE_URL}/api/user/update`,
  
//   // Diagnosis endpoints (CodeIgniter)
//   DIAGNOSIS_UPLOAD: `${API_BASE_URL}/api/diagnosis/upload`,
//   DIAGNOSIS_HISTORY: `${API_BASE_URL}/api/diagnosis/history`,
//   DIAGNOSIS_DETAIL: `${API_BASE_URL}/api/diagnosis`,
  
//   // Disease endpoints
//   DISEASES: `${API_BASE_URL}/api/diseases`,
//   DISEASE_DETAIL: `${API_BASE_URL}/api/diseases`,
  
//   // STATS
//   STATS: `${API_BASE_URL}/api/stats`,
  
//   // PEST endpoints
//   PESTS: `${API_BASE_URL}/api/pests`,
//   PEST_DETAIL: `${API_BASE_URL}/api/pests`,  

//   // FEEDBACK
//   FEEDBACK: `${API_BASE_URL}/api/feedback`,
  
//   // ML API endpoints (Flask)
//   ML_PREDICT: `${ML_API_URL}/predict`,
//   ML_HEALTH: `${ML_API_URL}/health`,
// };

// // Helper to get base headers (includes ngrok fix)
// const getBaseHeaders = () => {
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//   };
  
//   // Add ngrok header if using ngrok
//   if (USE_NGROK) {
//     headers["ngrok-skip-browser-warning"] = "true";
//   }
  
//   return headers;
// };

// // Helper function to get headers with token
// export const getAuthHeaders = async () => {
//   const token = await AsyncStorage.getItem("token");
//   const headers = getBaseHeaders();
  
//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }
  
//   return headers;
// };

// // Helper function to get multipart headers with token
// export const getMultipartHeaders = async () => {
//   const token = await AsyncStorage.getItem("token");
//   const headers: Record<string, string> = {
//     // Don't set Content-Type for multipart, let fetch do it
//   };
  
//   if (USE_NGROK) {
//     headers["ngrok-skip-browser-warning"] = "true";
//   }
  
//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }
  
//   return headers;
// };

// // API request wrapper with error handling
// export const apiRequest = async (
//   url: string,
//   method: string = 'GET',
//   data?: any,
//   headers?: any
// ) => {
//   try {
//     const authHeaders = await getAuthHeaders();
    
//     console.log('📡 API Request:', method, url);
    
//     const response = await fetch(url, {
//       method,
//       headers: { ...authHeaders, ...headers },
//       body: data ? JSON.stringify(data) : undefined,
//     });

//     console.log('📥 Response status:', response.status);
    
//     // Get raw text first
//     const text = await response.text();
//     console.log('📄 Raw response:', text.substring(0, 200)); // Log first 200 chars
    
//     // Try to parse JSON
//     let jsonData;
//     try {
//       jsonData = JSON.parse(text);
//     } catch (e) {
//       console.error('❌ JSON Parse Error. Response was:', text);
//       throw new Error('Server returned invalid JSON. Check if backend is running correctly.');
//     }

//     if (!response.ok) {
//       throw new Error(jsonData.message || `HTTP ${response.status}: ${response.statusText}`);
//     }

//     return jsonData;
//   } catch (error: any) {
//     console.error('❌ API Request Error:', error.message);
//     throw error;
//   }
// };

// // Special login function (no auth token needed)
// export const loginRequest = async (email: string, password: string) => {
//   try {
//     const headers = getBaseHeaders();
    
//     console.log('🔐 Logging in:', email);
//     console.log('📡 API URL:', API_ENDPOINTS.LOGIN);
    
//     const response = await fetch(API_ENDPOINTS.LOGIN, {
//       method: 'POST',
//       headers,
//       body: JSON.stringify({ email, password }),
//     });

//     console.log('📥 Response status:', response.status);
    
//     const text = await response.text();
//     console.log('📄 Raw response:', text.substring(0, 200));
    
//     let jsonData;
//     try {
//       jsonData = JSON.parse(text);
//     } catch (e) {
//       console.error('❌ Server returned HTML instead of JSON:', text);
//       throw new Error('Server error. Please check if the backend API is running.');
//     }

//     if (!response.ok) {
//       throw new Error(jsonData.message || 'Login failed');
//     }

//     return jsonData;
//   } catch (error: any) {
//     console.error('❌ Login Error:', error.message);
//     throw error;
//   }
// };

import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================
// CacaoDx — apiConfig.ts
// ✅ NEVER NEEDS TO CHANGE when switching networks
// ============================================================

// Your permanent ngrok URL — set once, never change
// const API_BASE_URL = "https://tenseless-sau-freakily.ngrok-free.dev";
const API_BASE_URL = "http://172.16.48.119:8080";
// const API_BASE_URL = "http://192.168.1.4:8080";

export const API_ENDPOINTS = {
  LOGIN:             `${API_BASE_URL}/api/login`,
  REGISTER:          `${API_BASE_URL}/api/register`,
  LOGOUT:            `${API_BASE_URL}/api/logout`,
  PROFILE:           `${API_BASE_URL}/api/user/profile`,
  UPDATE_PROFILE:    `${API_BASE_URL}/api/user/update`,
  DIAGNOSIS_UPLOAD:  `${API_BASE_URL}/api/diagnosis/upload`,
  DIAGNOSIS_HISTORY: `${API_BASE_URL}/api/diagnosis/history`,
  DIAGNOSIS_DETAIL:  `${API_BASE_URL}/api/diagnosis`,
  DISEASES:          `${API_BASE_URL}/api/diseases`,
  DISEASE_DETAIL:    `${API_BASE_URL}/api/diseases`,
  PESTS:             `${API_BASE_URL}/api/pests`,
  PEST_DETAIL:       `${API_BASE_URL}/api/pests`,
  STATS:             `${API_BASE_URL}/api/stats`,
  FEEDBACK:          `${API_BASE_URL}/api/feedback`,
  FARMS:             `${API_BASE_URL}/api/farms`,   // ✅ NEW
};

// ── Base headers — always includes ngrok header ───────────────
const getBaseHeaders = (): Record<string, string> => ({
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true", // ← required or ngrok blocks requests
});

// ── JSON requests (login, register, etc.) ────────────────────
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token   = await AsyncStorage.getItem("token");
  const headers = getBaseHeaders();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

// ── Multipart/file upload requests (image upload) ────────────
// ⚠️  Do NOT set Content-Type here — fetch sets it automatically
//     for FormData with the correct boundary
export const getMultipartHeaders = async (): Promise<Record<string, string>> => {
  const token   = await AsyncStorage.getItem("token");
  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "true", // ← required for ngrok
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

// ── Standard API request wrapper ─────────────────────────────
export const apiRequest = async (
  url: string,
  method: string = "GET",
  data?: any,
  extraHeaders?: Record<string, string>
) => {
  try {
    const authHeaders = await getAuthHeaders();
    console.log("📡 API Request:", method, url);

    const response = await fetch(url, {
      method,
      headers: { ...authHeaders, ...extraHeaders },
      body: data ? JSON.stringify(data) : undefined,
    });

    console.log("📥 Response status:", response.status);
    const text = await response.text();
    console.log("📄 Raw response:", text.substring(0, 200));

    let jsonData: any;
    try {
      jsonData = JSON.parse(text);
    } catch {
      throw new Error("Server returned invalid JSON. Is the backend running?");
    }

    if (!response.ok) {
      throw new Error(jsonData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return jsonData;
  } catch (error: any) {
    console.error("❌ API Error:", error.message);
    throw error;
  }
};

// ── Login (no token needed) ───────────────────────────────────
export const loginRequest = async (email: string, password: string) => {
  try {
    console.log("🔐 Logging in:", email);

    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method:  "POST",
      headers: getBaseHeaders(),
      body:    JSON.stringify({ email, password }),
    });

    const text = await response.text();
    let jsonData: any;
    try {
      jsonData = JSON.parse(text);
    } catch {
      throw new Error("Server error. Is the backend running?");
    }

    if (!response.ok) throw new Error(jsonData.message || "Login failed");
    return jsonData;
  } catch (error: any) {
    console.error("❌ Login Error:", error.message);
    throw error;
  }
};

export { API_BASE_URL };