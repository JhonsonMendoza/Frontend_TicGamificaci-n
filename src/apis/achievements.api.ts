// API para obtener y gestionar logros
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Achievement {
  id: number;
  type: string;
  name: string;
  description: string;
  icon: string;
  pointsReward: number;
  condition: string;
  isUnlocked: boolean;
  unlockedAt: Date | null;
  progressCurrent: number | null;
  progressTarget: number | null;
  category: 'general' | 'vulnerability' | 'performance' | 'consistency';
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedCount: number;
  completionPercentage: number;
  totalPoints: number;
  achievements: Achievement[];
}

export const achievementsApi = {
  // Obtener todos los logros del usuario
  async getAllAchievements(): Promise<{
    totalPoints: number;
    achievements: Achievement[];
  }> {
    const response = await fetch(`${API_BASE}/achievements`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error obteniendo logros');
    return response.json();
  },

  // Obtener logros desbloqueados
  async getUnlockedAchievements(): Promise<Achievement[]> {
    const response = await fetch(`${API_BASE}/achievements/unlocked`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error obteniendo logros desbloqueados');
    return response.json();
  },

  // Obtener logros bloqueados con progreso
  async getLockedAchievements(): Promise<Achievement[]> {
    const response = await fetch(`${API_BASE}/achievements/locked`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error obteniendo logros bloqueados');
    return response.json();
  },

  // Verificar y desbloquear logros (después de completar misiones)
  async checkAndUnlock(): Promise<Achievement[]> {
    const response = await fetch(`${API_BASE}/achievements/check`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error verificando logros');
    return response.json();
  },

  // Obtener estadísticas de logros
  async getAchievementStats(): Promise<AchievementStats> {
    const response = await fetch(`${API_BASE}/achievements/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error obteniendo estadísticas');
    return response.json();
  },

  // Obtener progreso de un logro específico
  async getAchievementProgress(type: string): Promise<Achievement> {
    const response = await fetch(`${API_BASE}/achievements/progress/${type}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error obteniendo progreso del logro');
    return response.json();
  },
};
