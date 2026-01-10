'use client';

import React from 'react';
import { Achievement } from '@/apis/achievements.api';

interface RecentAchievementsProps {
  achievements: Achievement[];
  limit?: number;
}

const RecentAchievements: React.FC<RecentAchievementsProps> = ({ achievements, limit = 3 }) => {
  const recentUnlocked = achievements
    .filter((a) => a.isUnlocked)
    .sort((a, b) => {
      const dateA = new Date(a.unlockedAt || 0).getTime();
      const dateB = new Date(b.unlockedAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, limit);

  if (recentUnlocked.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">🎉</span> Logros Recientes
      </h3>

      <div className="space-y-3">
        {recentUnlocked.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800"
          >
            {/* Ícono */}
            <div className="text-3xl flex-shrink-0">
              {achievement.icon === 'badge' && '🏅'}
              {achievement.icon === 'target' && '🎯'}
              {achievement.icon === 'shield' && '🛡️'}
              {achievement.icon === 'star' && '⭐'}
              {achievement.icon === 'flame' && '🔥'}
              {achievement.icon === 'crown' && '👑'}
              {achievement.icon === 'sword' && '⚔️'}
              {achievement.icon === 'shield-check' && '✅'}
              {achievement.icon === 'zap' && '⚡'}
              {achievement.icon === 'trophy' && '🏆'}
              {achievement.icon === 'alert-circle' && '⚠️'}
              {achievement.icon === 'trending-up' && '📈'}
              {achievement.icon === 'book-open' && '📖'}
              {achievement.icon === 'award' && '🎖️'}
              {achievement.icon === 'crown-sparkles' && '👑'}
            </div>

            {/* Información */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 dark:text-white truncate">
                {achievement.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                +{achievement.pointsReward} puntos
              </p>
            </div>

            {/* Fecha */}
            <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {achievement.unlockedAt &&
                new Date(achievement.unlockedAt).toLocaleDateString('es-ES', {
                  month: 'short',
                  day: 'numeric',
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAchievements;
