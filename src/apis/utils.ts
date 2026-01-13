/**
 * Constantes para la aplicación
 */
export const APP_CONSTANTS = {
  // Límites de archivos
  FILE_SIZE_LIMIT: 50 * 1024 * 1024, // 50MB
  MAX_FILES: 1,
  
  // Tipos de archivo permitidos (sin .rar)
  ALLOWED_FILE_TYPES: ['.zip', '.tar', '.gz'],
  ALLOWED_MIME_TYPES: [
    'application/zip',
    'application/x-zip-compressed',
    'application/zip-compressed',
    'application/octet-stream',
    'application/x-tar',
    'application/gzip'
  ],
  
  // Estados de análisis
  ANALYSIS_STATUS: {
    PENDING: 'PENDING',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
  } as const,
  
  // Herramientas de análisis
  ANALYSIS_TOOLS: {
    SPOTBUGS: 'SpotBugs',
    PMD: 'PMD',
    SEMGREP: 'Semgrep',
    ESLINT: 'ESLint',
    BANDIT: 'Bandit'
  } as const,
  
  // Severidades de problemas
  SEVERITY_LEVELS: {
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
    INFO: 'INFO'
  } as const,
  
  // Colores por severidad
  SEVERITY_COLORS: {
    HIGH: '#ef4444', // red-500
    MEDIUM: '#f97316', // orange-500
    LOW: '#eab308', // yellow-500
    INFO: '#3b82f6' // blue-500
  } as const,
  
  // Configuraciones de refresh
  REFRESH_INTERVALS: {
    DASHBOARD: 30000, // 30 segundos
    ANALYSIS_STATUS: 5000, // 5 segundos
    HEALTH_CHECK: 60000 // 1 minuto
  } as const
};

/**
 * Tipos derivados de las constantes
 */
export type AnalysisStatus = typeof APP_CONSTANTS.ANALYSIS_STATUS[keyof typeof APP_CONSTANTS.ANALYSIS_STATUS];
export type AnalysisTool = typeof APP_CONSTANTS.ANALYSIS_TOOLS[keyof typeof APP_CONSTANTS.ANALYSIS_TOOLS];
export type SeverityLevel = typeof APP_CONSTANTS.SEVERITY_LEVELS[keyof typeof APP_CONSTANTS.SEVERITY_LEVELS];

/**
 * Utilidades para manejo de archivos
 */
export class FileUtils {
  /**
   * Valida si un archivo es permitido
   */
  static isFileAllowed(file: File): { allowed: boolean; reason?: string } {
    const extension = this.getFileExtension(file.name);
    const mimeType = file.type;
    
    // Validación especial para .rar
    if (extension === '.rar') {
      return {
        allowed: false,
        reason: 'Los archivos .rar no están soportados. Por favor utiliza archivos .zip'
      };
    }
    
    const extensionAllowed = APP_CONSTANTS.ALLOWED_FILE_TYPES.includes(extension);
    const mimeAllowed = APP_CONSTANTS.ALLOWED_MIME_TYPES.includes(mimeType);
    
    const allowed = extensionAllowed || mimeAllowed;
    
    return { allowed };
  }
  
  /**
   * Valida el tamaño del archivo
   */
  static isFileSizeValid(file: File): boolean {
    return file.size <= APP_CONSTANTS.FILE_SIZE_LIMIT;
  }
  
  /**
   * Obtiene la extensión de un archivo
   */
  static getFileExtension(filename: string): string {
    return '.' + filename.split('.').pop()?.toLowerCase() || '';
  }
  
  /**
   * Formatea el tamaño de archivo en formato legible
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Valida múltiples archivos
   */
  static validateFiles(files: FileList | File[]): { valid: File[]; errors: string[] } {
    const valid: File[] = [];
    const errors: string[] = [];
    
    const fileArray = Array.from(files);
    
    // Verificar cantidad
    if (fileArray.length > APP_CONSTANTS.MAX_FILES) {
      errors.push(`Solo se permite subir ${APP_CONSTANTS.MAX_FILES} archivo(s) a la vez`);
      return { valid, errors };
    }
    
    fileArray.forEach((file, index) => {
      // Verificar tipo
      const fileCheck = this.isFileAllowed(file);
      if (!fileCheck.allowed) {
        const errorMsg = fileCheck.reason || `Archivo "${file.name}": Tipo no permitido. Solo se permiten: ${APP_CONSTANTS.ALLOWED_FILE_TYPES.join(', ')}`;
        errors.push(errorMsg);
        return;
      }
      
      // Verificar tamaño
      if (!this.isFileSizeValid(file)) {
        errors.push(
          `Archivo "${file.name}": Tamaño excede el límite de ${this.formatFileSize(APP_CONSTANTS.FILE_SIZE_LIMIT)}`
        );
        return;
      }
      
      valid.push(file);
    });
    
    return { valid, errors };
  }
}

/**
 * Utilidades para fechas y tiempo
 */
export class DateUtils {
  /**
   * Formatea una fecha en formato legible
   */
  static formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }
  
  /**
   * Obtiene tiempo relativo (hace X tiempo)
   */
  static getTimeAgo(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return this.formatDate(d);
  }
  
  /**
   * Calcula duración entre dos fechas
   */
  static calculateDuration(start: string | Date, end: string | Date): string {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    
    const diffInMs = endDate.getTime() - startDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ${diffInSeconds % 60}s`;
    
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Utilidades para análisis
 */
export class AnalysisUtils {
  /**
   * Obtiene el color por severidad
   */
  static getSeverityColor(severity: SeverityLevel): string {
    return APP_CONSTANTS.SEVERITY_COLORS[severity] || '#6b7280';
  }
  
  /**
   * Obtiene el ícono por severidad
   */
  static getSeverityIcon(severity: SeverityLevel): string {
    switch (severity) {
      case 'HIGH':
        return '🔴';
      case 'MEDIUM':
        return '🟡';
      case 'LOW':
        return '🟢';
      case 'INFO':
        return '🔵';
      default:
        return '⚪';
    }
  }
  
  /**
   * Calcula estadísticas de análisis
   */
  static calculateStats(issues: Array<{ severity: SeverityLevel }>): Record<SeverityLevel, number> {
    const stats = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0
    };
    
    issues.forEach(issue => {
      if (stats.hasOwnProperty(issue.severity)) {
        stats[issue.severity]++;
      }
    });
    
    return stats;
  }
  
  /**
   * Obtiene el estado visual del análisis
   */
  static getAnalysisStatusBadge(status: AnalysisStatus): { color: string; text: string } {
    switch (status) {
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' };
      case 'RUNNING':
        return { color: 'bg-blue-100 text-blue-800', text: 'Ejecutando' };
      case 'COMPLETED':
        return { color: 'bg-green-100 text-green-800', text: 'Completado' };
      case 'FAILED':
        return { color: 'bg-red-100 text-red-800', text: 'Falló' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Desconocido' };
    }
  }
}

/**
 * Utilidades para almacenamiento local
 */
export class StorageUtils {
  /**
   * Guarda datos en localStorage de forma segura
   */
  static setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Error saving to localStorage:', error);
    }
  }
  
  /**
   * Obtiene datos de localStorage de forma segura
   */
  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
      return defaultValue;
    }
  }
  
  /**
   * Remueve un item del localStorage
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Error removing from localStorage:', error);
    }
  }
}

/**
 * Utilidades para debugging
 */
export class DebugUtils {
  /**
   * Log condicional basado en entorno
   */
  static log(...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', ...args);
    }
  }
  
  /**
   * Error log
   */
  static error(...args: any[]): void {
    console.error('[ERROR]', ...args);
  }
  
  /**
   * Warning log
   */
  static warn(...args: any[]): void {
    console.warn('[WARN]', ...args);
  }
}