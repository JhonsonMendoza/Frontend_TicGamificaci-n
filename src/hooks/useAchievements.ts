'use client';

import { useState, useEffect, useCallback } from 'react';
import { Achievement, AchievementStats, achievementsApi } from '@/apis/achievements.api';

export interface UseAchievementsReturn {
  achievements: Achievement[];
  stats: AchievementStats | null;
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  checkAndUnlock: () => Promise<Achievement[]>;
}

export const useAchievements = (): UseAchievementsReturn => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [lockedAchievements, setLockedAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [allData, statsData] = await Promise.all([
        achievementsApi.getAllAchievements(),
        achievementsApi.getAchievementStats(),
      ]);

      setAchievements(allData.achievements);
      setStats(statsData);
      setUnlockedAchievements(allData.achievements.filter((a) => a.isUnlocked));
      setLockedAchievements(allData.achievements.filter((a) => !a.isUnlocked));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching achievements');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCheckAndUnlock = useCallback(async (): Promise<Achievement[]> => {
    try {
      const newlyUnlocked = await achievementsApi.checkAndUnlock();
      await fetchAchievements();
      return newlyUnlocked;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error checking achievements');
      return [];
    }
  }, [fetchAchievements]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    stats,
    unlockedAchievements,
    lockedAchievements,
    loading,
    error,
    refetch: fetchAchievements,
    checkAndUnlock: handleCheckAndUnlock,
  };
};
