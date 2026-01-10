// API para obtener y gestionar misiones de análisis
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Mission {
  id: number;
  analysisRunId: number;
  title: string;
  description: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'fixed' | 'skipped';
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  fixedAt: Date | null;
}

export interface MissionStats {
  total: number;
  pending: number;
  fixed: number;
  skipped: number;
  byUserId?: {
    [key: string]: number;
  };
  bySeverity?: {
    low: number;
    medium: number;
    high: number;
  };
}

export const missionsApi = {
  // Obtener todas las misiones del usuario
  async getUserMissions(): Promise<Mission[]> {
    const response = await fetch(`${API_BASE}/missions/my`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error obteniendo misiones');
    const data = await response.json();
    return data.data || data;
  },

  // Obtener misiones por análisis
  async getMissionsByAnalysis(analysisId: number): Promise<Mission[]> {
    const response = await fetch(`${API_BASE}/missions/analysis/${analysisId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error obteniendo misiones del análisis');
    const data = await response.json();
    return data.data || data;
  },

  // Obtener misión individual (endpoint no disponible en backend actual)
  async getMission(id: number): Promise<Mission> {
    const response = await fetch(`${API_BASE}/missions/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error obteniendo misión');
    const data = await response.json();
    return data.data || data;
  },

  // Marcar misión como completada (fixed)
  async completeMission(id: number): Promise<Mission> {
    const response = await fetch(`${API_BASE}/missions/${id}/mark-fixed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error completando misión');
    const data = await response.json();
    return data.data || data;
  },

  // Marcar misión como omitida (skipped)
  async skipMission(id: number): Promise<Mission> {
    const response = await fetch(`${API_BASE}/missions/${id}/mark-skipped`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error omitiendo misión');
    const data = await response.json();
    return data.data || data;
  },

  // Obtener estadísticas de misiones (endpoint no disponible en backend actual)
  async getMissionStats(): Promise<MissionStats> {
    const response = await fetch(`${API_BASE}/missions/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error obteniendo estadísticas');
    const data = await response.json();
    return data.data || data;
  },

  // Obtener misiones pendientes (endpoint no disponible en backend actual)
  async getPendingMissions(): Promise<Mission[]> {
    const response = await fetch(`${API_BASE}/missions/pending`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error obteniendo misiones pendientes');
    const data = await response.json();
    return data.data || data;
  },

  // Obtener misiones completadas (endpoint no disponible en backend actual)
  async getCompletedMissions(): Promise<Mission[]> {
    const response = await fetch(`${API_BASE}/missions/completed`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error obteniendo misiones completadas');
    const data = await response.json();
    return data.data || data;
  },

  // Obtener misiones por severidad (endpoint no disponible en backend actual)
  async getMissionsBySeverity(severity: 'low' | 'medium' | 'high'): Promise<Mission[]> {
    const response = await fetch(`${API_BASE}/missions/severity/${severity}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error obteniendo misiones por severidad');
    const data = await response.json();
    return data.data || data;
  },
};
