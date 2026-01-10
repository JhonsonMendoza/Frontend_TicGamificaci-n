'use client';

import React from 'react';
import { AchievementStats } from '@/apis/achievements.api';
import { FaTrophy, FaUnlock, FaLock, FaStar } from 'react-icons/fa6';

interface AchievementStatsCardProps {
  stats: AchievementStats;
}

const AchievementStatsCard: React.FC<AchievementStatsCardProps> = ({ stats }) => {
  const completionPercentage = Math.round(stats.completionPercentage);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border-2 border-gradient-to-r border-blue-200 dark:border-gray-700 overflow-hidden">
      {/* Encabezado con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="flex items-center gap-4 mb-2">
          <FaTrophy className="text-3xl drop-shadow-lg" />
          <div>
            <h3 className="text-3xl font-bold">Resumen de Logros</h3>
            <p className="text-blue-100">
              {stats.unlockedCount} de {stats.totalAchievements} desbloqueados
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Grid de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Desbloqueados */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">Desbloqueados</span>
              <FaUnlock className="text-2xl text-green-500" />
            </div>
            <span className="text-4xl font-bold text-green-600 dark:text-green-400">
              {stats.unlockedCount}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">logros completados</p>
          </div>

          {/* Bloqueados */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/20 dark:to-gray-600/20 rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">Bloqueados</span>
              <FaLock className="text-2xl text-gray-500" />
            </div>
            <span className="text-4xl font-bold text-gray-600 dark:text-gray-400">
              {stats.totalAchievements - stats.unlockedCount}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">por desbloquear</p>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">Total</span>
              <FaTrophy className="text-2xl text-blue-500" />
            </div>
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalAchievements}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">logros disponibles</p>
          </div>

          {/* Puntos */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">Puntos</span>
              <FaStar className="text-2xl text-yellow-500" />
            </div>
            <span className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.totalPoints}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">puntos totales</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Progreso General</span>
            <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{
                width: `${completionPercentage}%`,
              }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Desbloquea {stats.totalAchievements - stats.unlockedCount} logros más para completar la colección
          </p>
        </div>
      </div>
    </div>
  );
};

export default AchievementStatsCard;
