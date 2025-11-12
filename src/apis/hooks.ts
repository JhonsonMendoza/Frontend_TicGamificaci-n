import { useState, useCallback } from 'react';
import { AnalysisApiService } from './analysisService';
import { 
  AnalysisResult, 
  StudentSummary, 
  UploadData, 
  UploadProgress,
  ApiResponse 
} from './types';

/**
 * Hook para manejo de estado de carga y errores
 */
export function useApiState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { loading, error, executeApiCall, clearError };
}

/**
 * Hook para subir archivos
 */
export function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    uploadData: UploadData
  ): Promise<AnalysisResult | null> => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(null);

      const response = await AnalysisApiService.uploadFile(
        uploadData,
        (progress) => setUploadProgress(progress)
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error en la subida');
      }
    } catch (error: any) {
      setUploadError(error.message);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setUploadProgress(null);
    setUploadError(null);
    setIsUploading(false);
  }, []);

  return {
    uploadFile,
    uploadProgress,
    isUploading,
    uploadError,
    resetUpload
  };
}

/**
 * Hook para análisis
 */
export function useAnalysis() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const { loading, error, executeApiCall, clearError } = useApiState();

  const fetchDemoData = useCallback(async () => {
    const result = await executeApiCall(() => AnalysisApiService.getDemoData());
    if (result?.success && result.data) {
      setAnalyses(result.data);
    }
    return result;
  }, [executeApiCall]);

  const fetchAnalysisById = useCallback(async (id: number) => {
    const result = await executeApiCall(() => AnalysisApiService.getAnalysisById(id));
    if (result?.success && result.data) {
      setCurrentAnalysis(result.data);
    }
    return result;
  }, [executeApiCall]);

  const fetchAnalysesByStudent = useCallback(async (student: string) => {
    const result = await executeApiCall(() => AnalysisApiService.getAnalysesByStudent(student));
    if (result?.success && result.data) {
      setAnalyses(result.data);
    }
    return result;
  }, [executeApiCall]);

  const fetchAllAnalyses = useCallback(async () => {
    const result = await executeApiCall(() => AnalysisApiService.getAllAnalyses());
    if (result?.success && result.data) {
      setAnalyses(result.data);
    }
    return result;
  }, [executeApiCall]);

  const deleteAnalysis = useCallback(async (id: number) => {
    const result = await executeApiCall(() => AnalysisApiService.deleteAnalysis(id));
    if (result?.success) {
      // Remover de la lista local
      setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
      // Si es el análisis actual, limpiarlo
      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(null);
      }
    }
    return result;
  }, [executeApiCall, currentAnalysis]);

  return {
    analyses,
    currentAnalysis,
    loading,
    error,
    fetchDemoData,
    fetchAnalysisById,
    fetchAnalysesByStudent,
    fetchAllAnalyses,
    deleteAnalysis,
    clearError,
    setCurrentAnalysis
  };
}

/**
 * Hook para resumen de estudiante
 */
export function useStudentSummary() {
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const { loading, error, executeApiCall, clearError } = useApiState();

  const fetchStudentSummary = useCallback(async (student: string) => {
    const result = await executeApiCall(() => AnalysisApiService.getStudentSummary(student));
    if (result?.success && result.data) {
      setSummary(result.data);
    }
    return result;
  }, [executeApiCall]);

  return {
    summary,
    loading,
    error,
    fetchStudentSummary,
    clearError
  };
}

/**
 * Hook para verificar estado de la API
 */
export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const { loading, error, executeApiCall } = useApiState();

  const checkHealth = useCallback(async () => {
    const result = await executeApiCall(() => AnalysisApiService.checkHealth());
    if (result?.success) {
      setIsHealthy(true);
    } else {
      setIsHealthy(false);
    }
    return result;
  }, [executeApiCall]);

  return {
    isHealthy,
    loading,
    error,
    checkHealth
  };
}