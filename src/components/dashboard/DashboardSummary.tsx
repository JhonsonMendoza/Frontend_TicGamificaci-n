'use client';

import React from 'react';
import { Mission } from '@/apis/missions.api';
import { Achievement } from '@/apis/achievements.api';

interface DashboardSummaryProps {
  pendingMissions: Mission[];
  completedMissions: Mission[];
  recentAchievements: Achievement[];
  totalPoints: number;
  isLoading?: boolean;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  pendingMissions,
  completedMissions,
  recentAchievements,
  totalPoints,
  isLoading = false,
}) => {
  const highPriorityMissions = pendingMissions.filter((m) => m.severity === 'high').length;
  const completionRate = completedMissions.length + pendingMissions.length > 0
    ? Math.round((completedMissions.length / (completedMissions.length + pendingMissions.length)) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Misiones Pendientes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Misiones Pendientes</h3>
          <span className="text-3xl">📋</span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Total</span>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              {pendingMissions.length}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Críticas (Alto)</span>
            <span
              className={`text-lg font-bold ${
                highPriorityMissions > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600'
              }`}
            >
              {highPriorityMissions}
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
            <div
              className="bg-gradient-to-r from-yellow-400 to-red-500 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  (pendingMissions.length / Math.max(pendingMissions.length + completedMissions.length, 1)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Tasa de completitud: {completionRate}%
          </p>
        </div>

        <a
          href="/missions"
          className="mt-4 w-full inline-block text-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Ver todas →
        </a>
      </div>

      {/* Card 2: Logros Recientes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Logros Recientes</h3>
          <span className="text-3xl">🏆</span>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {recentAchievements.length > 0 ? (
            recentAchievements.slice(0, 3).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-2 rounded bg-purple-50 dark:bg-purple-900/30"
              >
                <span className="text-2xl">
                  {achievement.icon === 'badge' && '🏅'}
                  {achievement.icon === 'star' && '⭐'}
                  {achievement.icon === 'trophy' && '🏆'}
                  {achievement.icon === 'flame' && '🔥'}
                  {achievement.icon === 'crown' && '👑'}
                  {achievement.icon === 'shield' && '🛡️'}
                  {!['badge', 'star', 'trophy', 'flame', 'crown', 'shield'].includes(achievement.icon) && '🎖️'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">
                    {achievement.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">+{achievement.pointsReward} pts</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Completa misiones para desbloquear logros
            </p>
          )}
        </div>

        <a
          href="/achievements"
          className="mt-4 w-full inline-block text-center bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Ver logros →
        </a>
      </div>

      {/* Card 3: Puntos y Progreso */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Puntuación</h3>
          <span className="text-3xl">✨</span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Puntos Totales</p>
            <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{totalPoints}</p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Progreso de puntuación
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all"
                style={{
                  width: `${Math.min((totalPoints / 5000) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {totalPoints} / 5000
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">💡 Tip:</span> Completa misiones pendientes para ganar más puntos y desbloquear logros.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
