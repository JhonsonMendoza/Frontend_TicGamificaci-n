import { useState, useCallback } from 'react';
import apiService from '../services/api';
import { Analysis } from '../types/auth';
import toast from 'react-hot-toast';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UseAuthFileUploadReturn {
  uploadFile: (file: File, student?: string) => Promise<Analysis | null>;
  uploadProgress: UploadProgress | null;
  isUploading: boolean;
  uploadError: string | null;
  resetUpload: () => void;
}

export const useAuthFileUpload = (): UseAuthFileUploadReturn => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, student?: string): Promise<Analysis | null> => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // Simular progreso durante el upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (!prev) return null;
          const newPercentage = Math.min(prev.percentage + Math.random() * 10, 90);
          return {
            ...prev,
            percentage: newPercentage,
            loaded: (newPercentage / 100) * prev.total
          };
        });
      }, 200);

      const response = await apiService.uploadFile(file, student);
      
      clearInterval(progressInterval);
      
      if (response.success && response.data) {
        setUploadProgress({ loaded: file.size, total: file.size, percentage: 100 });
        toast.success('Archivo subido y analizado correctamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error en el análisis');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al subir el archivo';
      setUploadError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setUploadProgress(null);
    setIsUploading(false);
    setUploadError(null);
  }, []);

  return {
    uploadFile,
    uploadProgress,
    isUploading,
    uploadError,
    resetUpload
  };
};