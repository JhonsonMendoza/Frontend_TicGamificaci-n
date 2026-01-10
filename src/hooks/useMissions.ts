'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mission, MissionStats, missionsApi } from '@/apis/missions.api';

export interface UseMissionsReturn {
  missions: Mission[];
  pendingMissions: Mission[];
  completedMissions: Mission[];
  stats: MissionStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  completeMission: (id: number) => Promise<Mission | null>;
  skipMission: (id: number) => Promise<Mission | null>;
}

export const useMissions = (analysisId?: number): UseMissionsReturn => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [pendingMissions, setPendingMissions] = useState<Mission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<MissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (analysisId) {
        // Si hay analysisId, obtener misiones específicas de ese análisis
        const data = await missionsApi.getMissionsByAnalysis(analysisId);
        setMissions(data);
        setPendingMissions(data.filter((m) => m.status === 'pending'));
        setCompletedMissions(data.filter((m) => m.status === 'fixed'));
      } else {
        // Obtener todas las misiones del usuario
        const [allMissions, statsData] = await Promise.all([
          missionsApi.getUserMissions(),
          missionsApi.getMissionStats(),
        ]);

        setMissions(allMissions);
        setPendingMissions(allMissions.filter((m) => m.status === 'pending'));
        setCompletedMissions(allMissions.filter((m) => m.status === 'fixed'));
        setStats(statsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching missions');
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  const handleCompleteMission = useCallback(
    async (id: number): Promise<Mission | null> => {
      try {
        const updatedMission = await missionsApi.completeMission(id);
        setMissions((prev) =>
          prev.map((m) => (m.id === id ? updatedMission : m))
        );
        setPendingMissions((prev) => prev.filter((m) => m.id !== id));
        setCompletedMissions((prev) => [...prev, updatedMission]);
        return updatedMission;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error completing mission');
        return null;
      }
    },
    []
  );

  const handleSkipMission = useCallback(async (id: number): Promise<Mission | null> => {
    try {
      const updatedMission = await missionsApi.skipMission(id);
      setMissions((prev) =>
        prev.map((m) => (m.id === id ? updatedMission : m))
      );
      setPendingMissions((prev) => prev.filter((m) => m.id !== id));
      return updatedMission;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error skipping mission');
      return null;
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  return {
    missions,
    pendingMissions,
    completedMissions,
    stats,
    loading,
    error,
    refetch: fetchMissions,
    completeMission: handleCompleteMission,
    skipMission: handleSkipMission,
  };
};
