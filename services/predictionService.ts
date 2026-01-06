// services/predictionService.ts
import { API_ENDPOINTS, getMultipartHeaders, getAuthHeaders } from '../config/api';

export interface PredictionRequest {
  user_id: number;
  disease_id: number;
  confidence: number;
  imageUri: string;
  notes?: string;
}

export interface PredictionResponse {
  status: string;
  message: string;
  data: {
    diagnosis_id: number;
    disease: {
      id: number;
      name: string;
      type: string;
      cause: string;
    };
    treatment: {
      description: string;
      treatment: string;
      prevention: string;
      recommended_action: string;
    } | null;
    confidence: number;
    image_url: string | null;
  };
}

class PredictionService {
  /**
   * Save ML prediction to database
   */
  async savePrediction(request: PredictionRequest): Promise<PredictionResponse> {
    try {
      const formData = new FormData();
      formData.append('user_id', request.user_id.toString());
      formData.append('disease_id', request.disease_id.toString());
      formData.append('confidence', request.confidence.toFixed(2));
      
      if (request.notes) {
        formData.append('notes', request.notes);
      }

      // Add image
      const imageFile: any = {
        uri: request.imageUri,
        type: 'image/jpeg',
        name: `diagnosis_${Date.now()}.jpg`,
      };
      
      formData.append('image', imageFile);

      const headers = await getMultipartHeaders();

      const response = await fetch(API_ENDPOINTS.SAVE_PREDICTION, {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Save Prediction Error:', error);
      throw error;
    }
  }

  /**
   * Get disease information by ID
   */
  async getDiseaseInfo(diseaseId: number) {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(
        `${API_ENDPOINTS.GET_DISEASE}/${diseaseId}`,
        {
          method: 'GET',
          headers,
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Get Disease Info Error:', error);
      throw error;
    }
  }

  /**
   * Get all diseases (for reference/mapping)
   */
  async getAllDiseases() {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(API_ENDPOINTS.GET_ALL_DISEASES, {
        method: 'GET',
        headers,
      });

      return await response.json();
    } catch (error) {
      console.error('Get All Diseases Error:', error);
      throw error;
    }
  }
}

export default new PredictionService();