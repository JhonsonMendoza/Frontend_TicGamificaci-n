/**
 * Archivo principal de exportación de APIs
 * Centraliza todas las importaciones para un fácil acceso desde los componentes
 */

// Configuración principal
export { API_CONFIG } from './config';

// Tipos TypeScript
export type {
  ApiResponse,
  AnalysisResult,
  StudentSummary,
  UploadData,
  UploadProgress
} from './types';

// Servicios principales
import { AnalysisApiService } from './analysisService';
export { ApiService, AxiosUtils } from './axiosService';

// Hooks personalizados
export {
  useApiState,
  useFileUpload,
  useAnalysis,
  useStudentSummary,
  useApiHealth
} from './hooks';

// Utilidades y constantes
export {
  APP_CONSTANTS,
  FileUtils,
  DateUtils,
  AnalysisUtils,
  StorageUtils,
  DebugUtils
} from './utils';

// Tipos derivados de constantes
export type {
  AnalysisStatus,
  AnalysisTool,
  SeverityLevel
} from './utils';

// Re-exportar para compatibilidad
export { AnalysisApiService as analysisApi } from './analysisService';

/**
 * Ejemplos de uso:
 * 
 * // En un componente funcional:
 * import { useAnalysis, useFileUpload, FileUtils } from '@/apis';
 * 
 * // Para servicios directos:
 * import { analysisApi, API_CONFIG } from '@/apis';
 * 
 * // Para tipos:
 * import type { AnalysisResult, UploadData } from '@/apis';
 * 
 * // Para utilidades:
 * import { DateUtils, AnalysisUtils, APP_CONSTANTS } from '@/apis';
 */