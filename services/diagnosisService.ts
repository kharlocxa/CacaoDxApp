// services/diagnosisService.ts
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

class DiagnosisService {
  /**
   * Get user's diagnosis history
   */
  async getHistory(userId: number) {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(
        `${API_ENDPOINTS.DIAGNOSIS_HISTORY}/${userId}`,
        {
          method: 'GET',
          headers,
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Get History Error:', error);
      throw error;
    }
  }

  /**
   * Get single diagnosis details
   */
  async getDetail(diagnosisId: number) {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(
        `${API_ENDPOINTS.DIAGNOSIS_DETAIL}/${diagnosisId}`,
        {
          method: 'GET',
          headers,
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Get Diagnosis Detail Error:', error);
      throw error;
    }
  }

  /**
   * Delete diagnosis
   */
  async deleteDiagnosis(diagnosisId: number) {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(
        `${API_ENDPOINTS.DIAGNOSIS_DELETE}/${diagnosisId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Delete Diagnosis Error:', error);
      throw error;
    }
  }
}

export default new DiagnosisService();