import axios, { AxiosResponse, AxiosError } from 'axios';
import { apiClient } from './config';
import { ApiResponse } from './types';

/**
 * Clase wrapper para simplificar el uso de axios
 * Proporciona métodos con mejor manejo de errores y tipos
 */
export class ApiService {
  
  /**
   * GET request genérico
   */
  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * POST request genérico
   */
  static async post<T>(
    endpoint: string, 
    data?: any, 
    config?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * PUT request genérico
   */
  static async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * DELETE request genérico
   */
  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Upload de archivos con progress
   */
  static async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (percentage: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Agregar datos adicionales al FormData
      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key]);
        });
      }

      const response: AxiosResponse<ApiResponse<T>> = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutos para uploads de archivos grandes
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentage);
          }
        }
      });

      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Múltiples requests en paralelo
   */
  static async parallel<T>(
    requests: Array<() => Promise<ApiResponse<T>>>
  ): Promise<ApiResponse<T[]>> {
    try {
      const responses = await Promise.allSettled(requests.map(req => req()));
      
      const results: T[] = [];
      const errors: string[] = [];

      responses.forEach((response, index) => {
        if (response.status === 'fulfilled' && response.value.success) {
          results.push(response.value.data!);
        } else {
          const reason = response.status === 'rejected' 
            ? response.reason.message 
            : response.value.message;
          errors.push(`Request ${index}: ${reason}`);
        }
      });

      if (errors.length === responses.length) {
        // Todos fallaron
        return {
          success: false,
          message: `Todas las requests fallaron: ${errors.join(', ')}`,
          data: undefined
        };
      }

      return {
        success: true,
        message: errors.length > 0 
          ? `${results.length} exitosas, ${errors.length} fallidas`
          : 'Todas las requests exitosas',
        data: results
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Request con retry automático
   */
  static async withRetry<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFn();
        if (result.success) {
          return result;
        }
        lastError = new Error(result.message);
      } catch (error) {
        lastError = error;
        
        // Si no es el último intento, esperar antes del retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
        }
      }
    }

    return this.handleError(lastError);
  }

  /**
   * Request con timeout personalizado
   */
  static async withTimeout<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    timeoutMs: number
  ): Promise<ApiResponse<T>> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs);
    });

    try {
      return await Promise.race([requestFn(), timeoutPromise]);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Cancelación de requests
   */
  static createCancelToken() {
    return axios.CancelToken?.source();
  }

  /**
   * Manejo centralizado de errores
   */
  private static handleError<T>(error: AxiosError): ApiResponse<T> {
    const response = error.response;
    
    // Error de red o sin respuesta
    if (!response) {
      return {
        success: false,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        data: undefined
      };
    }

    // Extraer mensaje de error del backend
    const backendMessage = (response.data as any)?.message || 'Error desconocido';
    
    // Mensajes personalizados por código de estado
    let message: string;
    switch (response.status) {
      case 400:
        message = `Solicitud inválida: ${backendMessage}`;
        break;
      case 401:
        message = 'No autorizado. Por favor inicia sesión.';
        break;
      case 403:
        message = 'Acceso denegado. No tienes permisos para esta acción.';
        break;
      case 404:
        message = 'Recurso no encontrado.';
        break;
      case 422:
        message = `Datos inválidos: ${backendMessage}`;
        break;
      case 429:
        message = 'Demasiadas solicitudes. Intenta más tarde.';
        break;
      case 500:
        message = 'Error interno del servidor. Intenta más tarde.';
        break;
      case 502:
        message = 'Servicio no disponible temporalmente.';
        break;
      case 503:
        message = 'Servicio en mantenimiento.';
        break;
      default:
        message = `Error ${response.status}: ${backendMessage}`;
    }

    return {
      success: false,
      message,
      data: undefined
    };
  }
}

/**
 * Utilidades adicionales para axios
 */
export class AxiosUtils {
  
  /**
   * Verificar si un error es de cancelación
   */
  static isCancelError(error: any): boolean {
    return axios.isCancel?.(error) || false;
  }

  /**
   * Crear headers de autenticación
   */
  static createAuthHeaders(token: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Crear headers para JSON
   */
  static createJsonHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Crear headers para FormData
   */
  static createMultipartHeaders(): Record<string, string> {
    return {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
    };
  }

  /**
   * Convertir objeto a query params
   */
  static objectToQueryParams(obj: Record<string, any>): string {
    const params = new URLSearchParams();
    Object.keys(obj).forEach(key => {
      if (obj[key] !== null && obj[key] !== undefined) {
        params.append(key, obj[key].toString());
      }
    });
    return params.toString();
  }

  /**
   * Formatear error de axios para logging
   */
  static formatErrorForLogging(error: AxiosError): Record<string, any> {
    return {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      responseData: error.response?.data,
    };
  }
}