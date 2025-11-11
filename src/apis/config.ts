import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Configuración base para todas las APIs
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  TIMEOUT: 60000, // 60 segundos para operaciones normales
  ENDPOINTS: {
    ANALYSIS: {
      HEALTH: '/analysis/health',
      UPLOAD: '/analysis/upload',
      DEMO_DATA: '/analysis/demo-data',
      BY_ID: (id: number) => `/analysis/${id}`,
      BY_STUDENT: (student: string) => `/analysis?student=${student}`,
      STUDENT_SUMMARY: (student: string) => `/analysis/student/${student}/summary`,
      DELETE: (id: number) => `/analysis/${id}`,
    }
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

/**
 * Instancia configurada de Axios
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

/**
 * Interceptor de Request - Agregar headers o auth tokens
 */
apiClient.interceptors.request.use(
  (config: any) => {
    // Aquí puedes agregar tokens de autenticación
    // config.headers.Authorization = `Bearer ${token}`;
    
    // Log de requests en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Response - Manejo de errores globales
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de responses en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API RESPONSE SUCCESS] ${response.status} ${response.config?.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Manejo de errores globales
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
    
    console.error('[API ERROR INTERCEPTOR]', {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method,
      responseData: error.response?.data,
      fullError: error,
      requestData: error.config?.data,
      isNetworkError: !error.response,
      errorCode: error.code,
      errorName: error.name
    });

    // Personalizar mensajes de error según el código de estado
    if (error.response) {
      console.log(`[HTTP ERROR] Status: ${error.response.status}`);
      switch (error.response.status) {
        case 401:
          console.warn('Usuario no autenticado');
          break;
        case 403:
          console.warn('Acceso denegado');
          break;
        case 404:
          console.warn('Recurso no encontrado');
          break;
        case 500:
          console.error('Error interno del servidor');
          break;
      }
    } else {
      console.log('[NETWORK ERROR] Sin respuesta del servidor');
    }
    
    return Promise.reject(error);
  }
);

// Configuración para requests con archivos
export const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data',
  'Accept': 'application/json',
};