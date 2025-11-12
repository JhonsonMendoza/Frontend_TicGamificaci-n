import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  ApiResponse,
  Analysis,
  RankingUser,
  GlobalStats
} from '../types/auth';
import { Mission } from '../types/auth';

class ApiService {
  private api: AxiosInstance;
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 120000, // 2 minutos para uploads
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token automáticamente
    this.api.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para manejar errores de autenticación
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', data);
    
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', data);
    
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/me');
    return response.data;
  }

  async getUserProfile(): Promise<User & { totalAnalyses: number; averageScore: number; totalIssuesFound: number; recentAnalyses: Analysis[] }> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.patch('/auth/profile', data);
    return response.data;
  }

  // Google OAuth
  getGoogleAuthUrl(): string {
    return `${this.baseURL}/auth/google`;
  }

  // Analysis methods
  async uploadFile(file: File, student?: string): Promise<ApiResponse<Analysis>> {
    const formData = new FormData();
    formData.append('file', file);
    if (student) {
      formData.append('student', student);
    }

    const token = this.getToken();
    const endpoint = token ? '/analysis/upload-auth' : '/analysis/upload';

    const response = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getMyAnalyses(limit?: number): Promise<ApiResponse<Analysis[]>> {
    const params = limit ? { limit: limit.toString() } : {};
    const response = await this.api.get('/analysis/my/analyses', { params });
    return response.data;
  }

  async getMySummary(): Promise<ApiResponse<{
    totalAnalyses: number;
    averageScore: number;
    totalIssues: number;
    highSeverityIssues: number;
    mediumSeverityIssues: number;
    lowSeverityIssues: number;
    recentAnalyses: Analysis[];
  }>> {
    const response = await this.api.get('/analysis/my/summary');
    return response.data;
  }

  async getAnalysisById(id: number): Promise<ApiResponse<Analysis>> {
    const response = await this.api.get(`/analysis/${id}`);
    return response.data;
  }

  // Missions
  async getMyMissions(): Promise<ApiResponse<Mission[]>> {
    const response = await this.api.get('/missions/my');
    return response.data;
  }

  async getMissionsByAnalysis(analysisId: number): Promise<ApiResponse<Mission[]>> {
    const response = await this.api.get(`/missions/analysis/${analysisId}`);
    return response.data;
  }

  async markMissionFixed(id: number): Promise<ApiResponse<Mission>> {
    const response = await this.api.post(`/missions/${id}/mark-fixed`);
    return response.data;
  }

  async reanalyzeMission(id: number, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.api.post(`/missions/${id}/reanalyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 5 * 60 * 1000,
    });
    return response.data;
  }

  async reanalyzeAnalysis(analysisId: number, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.api.post(`/analysis/${analysisId}/reanalyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 5 * 60 * 1000,
    });
    return response.data;
  }

  async getAllAnalyses(): Promise<ApiResponse<Analysis[]>> {
    const response = await this.api.get('/analysis');
    return response.data;
  }

  // Rankings methods
  async getGlobalRankings(limit?: number): Promise<ApiResponse<{
    rankings: RankingUser[];
    globalStats: GlobalStats;
  }>> {
    const params = limit ? { limit: limit.toString() } : {};
    const response = await this.api.get('/rankings/global', { params });
    return response.data;
  }

  async getMyPosition(): Promise<ApiResponse<{
    userRank: RankingUser | null;
    position: number;
    totalUsers: number;
  }>> {
    const response = await this.api.get('/rankings/my-position');
    return response.data;
  }

  async getUniversityRankings(university: string): Promise<ApiResponse<RankingUser[]>> {
    const response = await this.api.get(`/rankings/university/${encodeURIComponent(university)}`);
    return response.data;
  }

  async getCareerRankings(career: string): Promise<ApiResponse<RankingUser[]>> {
    const response = await this.api.get(`/rankings/career/${encodeURIComponent(career)}`);
    return response.data;
  }

  async getGlobalStats(): Promise<ApiResponse<GlobalStats>> {
    const response = await this.api.get('/rankings/stats');
    return response.data;
  }

  // Token management
  setToken(token: string): void {
    Cookies.set('auth_token', token, { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  getToken(): string | null {
    return Cookies.get('auth_token') || null;
  }

  logout(): void {
    Cookies.remove('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const apiService = new ApiService();
export default apiService;