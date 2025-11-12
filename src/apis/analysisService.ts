import { API_CONFIG } from './config';
import { ApiService } from './axiosService';
import { 
  ApiResponse, 
  AnalysisResult, 
  StudentSummary, 
  HealthStatus,
  UploadData,
  UploadProgress 
} from './types';

export class AnalysisApiService {
  
  /**
   * Verificar estado de la API
   */
  static async checkHealth(): Promise<ApiResponse<HealthStatus>> {
    return ApiService.get<HealthStatus>(API_CONFIG.ENDPOINTS.ANALYSIS.HEALTH);
  }

  /**
   * Subir archivo para análisis con seguimiento de progreso
   */
  static async uploadFile(
    uploadData: UploadData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<AnalysisResult>> {
    const handleProgress = (percentage: number) => {
      if (onProgress) {
        onProgress({
          loaded: percentage,
          total: 100,
          percentage: percentage
        });
      }
    };

    return ApiService.uploadFile<AnalysisResult>(
      API_CONFIG.ENDPOINTS.ANALYSIS.UPLOAD,
      uploadData.file,
      { student: uploadData.student },
      handleProgress
    );
  }

  /**
   * Obtener datos de demostración
   */
  static async getDemoData(): Promise<ApiResponse<AnalysisResult[]>> {
    return ApiService.get<AnalysisResult[]>(API_CONFIG.ENDPOINTS.ANALYSIS.DEMO_DATA);
  }

  /**
   * Obtener análisis por ID
   */
  static async getAnalysisById(id: number): Promise<ApiResponse<AnalysisResult>> {
    return ApiService.get<AnalysisResult>(API_CONFIG.ENDPOINTS.ANALYSIS.BY_ID(id));
  }

  /**
   * Obtener análisis por estudiante
   */
  static async getAnalysesByStudent(student: string): Promise<ApiResponse<AnalysisResult[]>> {
    return ApiService.get<AnalysisResult[]>(API_CONFIG.ENDPOINTS.ANALYSIS.BY_STUDENT(student));
  }

  /**
   * Obtener resumen de estudiante
   */
  static async getStudentSummary(student: string): Promise<ApiResponse<StudentSummary>> {
    return ApiService.get<StudentSummary>(API_CONFIG.ENDPOINTS.ANALYSIS.STUDENT_SUMMARY(student));
  }

  /**
   * Eliminar análisis
   */
  static async deleteAnalysis(id: number): Promise<ApiResponse<void>> {
    return ApiService.delete<void>(API_CONFIG.ENDPOINTS.ANALYSIS.DELETE(id));
  }

  /**
   * Obtener todos los análisis
   */
  static async getAllAnalyses(): Promise<ApiResponse<AnalysisResult[]>> {
    return ApiService.get<AnalysisResult[]>('/analysis');
  }

  /**
   * Búsqueda de análisis con filtros
   */
  static async searchAnalyses(params: {
    student?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<AnalysisResult[]>> {
    return ApiService.get<AnalysisResult[]>('/analysis/search', params);
  }

  /**
   * Actualizar análisis
   */
  static async updateAnalysis(
    id: number, 
    data: Partial<AnalysisResult>
  ): Promise<ApiResponse<AnalysisResult>> {
    return ApiService.put<AnalysisResult>(`/analysis/${id}`, data);
  }

  /**
   * Reanalizar proyecto existente
   */
  static async rerunAnalysis(id: number): Promise<ApiResponse<AnalysisResult>> {
    return ApiService.post<AnalysisResult>(`/analysis/${id}/rerun`);
  }

  /**
   * Obtener estadísticas generales
   */
  static async getStats(): Promise<ApiResponse<{
    totalAnalyses: number;
    completedAnalyses: number;
    failedAnalyses: number;
    averageScore: number;
  }>> {
    return ApiService.get('/analysis/stats');
  }

  /**
   * Exportar resultados en diferentes formatos
   */
  static async exportResults(
    id: number, 
    format: 'json' | 'csv' | 'pdf'
  ): Promise<ApiResponse<string>> {
    return ApiService.get<string>(`/analysis/${id}/export?format=${format}`);
  }

  /**
   * Múltiples análisis en paralelo (útil para dashboard)
   */
  static async getDashboardData(): Promise<ApiResponse<{
    recentAnalyses: AnalysisResult[];
    stats: any;
    healthStatus: HealthStatus;
  }>> {
    try {
      const [analysesResult, statsResult, healthResult] = await Promise.allSettled([
        this.getDemoData(),
        this.getStats(),
        this.checkHealth()
      ]);

      const analyses = analysesResult.status === 'fulfilled' && analysesResult.value.success 
        ? analysesResult.value.data || [] 
        : [];

      const stats = statsResult.status === 'fulfilled' && statsResult.value.success 
        ? statsResult.value.data 
        : { totalAnalyses: 0, completedAnalyses: 0, failedAnalyses: 0, averageScore: 0 };

      const healthStatus = healthResult.status === 'fulfilled' && healthResult.value.success 
        ? healthResult.value.data 
        : { success: false, message: 'Health check failed', timestamp: new Date().toISOString(), endpoints: [] };

      return {
        success: true,
        message: 'Dashboard data loaded successfully',
        data: {
          recentAnalyses: analyses,
          stats: stats,
          healthStatus: healthStatus as HealthStatus
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error loading dashboard data: ${error.message}`,
        data: undefined
      };
    }
  }

  /**
   * Análisis con retry automático (para casos de falla temporal)
   */
  static async uploadWithRetry(
    uploadData: UploadData,
    maxRetries: number = 3,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<AnalysisResult>> {
    return ApiService.withRetry(
      () => this.uploadFile(uploadData, onProgress),
      maxRetries,
      2000 // 2 segundos entre retries
    );
  }

  /**
   * Análisis con timeout personalizado
   */
  static async uploadWithTimeout(
    uploadData: UploadData,
    timeoutMs: number = 30000,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<AnalysisResult>> {
    return ApiService.withTimeout(
      () => this.uploadFile(uploadData, onProgress),
      timeoutMs
    );
  }
}