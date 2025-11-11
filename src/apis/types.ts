// Tipos para las respuestas de la API

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface AnalysisResult {
  id: number;
  student: string;
  originalFileName?: string;
  fileSize?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  findings?: {
    summary: {
      toolsExecuted: number;
      successfulTools: number;
      failedTools: number;
    };
    results: {
      [toolName: string]: {
        success: boolean;
        findingsCount: number;
        findings: any[];
        error?: string;
      };
    };
  };
  totalIssues: number;
  highSeverityIssues: number;
  mediumSeverityIssues: number;
  lowSeverityIssues: number;
  qualityScore: number;
  fileStats?: {
    totalFiles: number;
    javaFiles: number;
    jsFiles: number;
    pythonFiles: number;
    linesOfCode: number;
  };
  createdAt: string;
  completedAt?: string;
}

export interface StudentSummary {
  totalAnalyses: number;
  completedAnalyses: number;
  failedAnalyses: number;
  pendingAnalyses: number;
  averageQualityScore: number;
  totalIssues: number;
  recentAnalyses: AnalysisResult[];
}

export interface HealthStatus {
  success: boolean;
  message: string;
  timestamp: string;
  endpoints: string[];
}

export interface UploadData {
  file: File;
  student: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}