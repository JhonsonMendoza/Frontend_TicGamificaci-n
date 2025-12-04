// Types for authentication
export interface User {
  id: number;
  email: string;
  name: string;
  profilePicture?: string;
  studentId?: string;
  university?: string;
  career?: string;
  emailVerified: boolean;
  createdAt: string;
  totalAnalyses?: number;
  averageScore?: number;
  totalIssuesFound?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  studentId?: string;
  university?: string;
  career?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Analysis types
export interface Analysis {
  id: number;
  student: string;
  originalFileName?: string;
  fileSize?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  findings?: any;
  totalIssues: number;
  highSeverityIssues: number;
  mediumSeverityIssues: number;
  lowSeverityIssues: number;
  qualityScore: number;
  fileStats?: any;
  createdAt: string;
  completedAt?: string;
  message: string;
}

// Ranking types
export interface RankingUser {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  university?: string;
  career?: string;
  totalAnalyses: number;
  averageScore: number;
  totalIssuesFound: number;
  rank: number;
}

export interface GlobalStats {
  totalUsers: number;
  totalAnalyses: number;
  averageQualityScore: number;
  totalIssuesFound: number;
  mostActiveUser: {
    name: string;
    analysesCount: number;
  };
  bestQualityUser: {
    name: string;
    qualityScore: number;
  };
}

// Missions
export interface Mission {
  id: number;
  analysisRunId: number;
  title: string;
  description?: string;
  filePath?: string;
  lineStart?: number | null;
  lineEnd?: number | null;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'fixed' | 'skipped';
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  fixedAt?: string | null;
}

// Custom Missions
export interface CustomMission {
  id: number;
  title: string;
  description: string;
  subject: string; // 'calculus', 'physics', 'differential', 'digital', 'oop'
  difficulty: string; // 'easy', 'medium', 'hard'
  pointsMin: number | null;
  pointsMax: number | null;
  basePoints: number;
  pointsPerTest: number;
  requiredClasses: string[];
  requiredMethods: string[] | null;
  tests: MissionTest[] | null;
  criteria: string | null;
  isActive: boolean;
  order: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MissionTest {
  name: string;
  className: string;
  methodName: string;
  params: any[];
  expectedResult: any;
  tolerance?: number;
  setup?: string;
}

export interface MissionSubmission {
  id: number;
  userId: number;
  customMissionId: number;
  extractedPath: string | null;
  status: string; // 'pending', 'approved', 'rejected', 'reviewing', 'error'
  pointsAwarded: number | null;
  testsPassed: number | null;
  testsFailed: number | null;
  testResults: any | null;
  feedback: string | null;
  errorMessage: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customMission?: CustomMission;
}
