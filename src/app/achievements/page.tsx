'use client';

import React, { useState } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementPanel, AchievementStatsCard } from '@/components/achievements';
import Navbar from '@/components/layout/Navbar';
import { FaTrophy, FaLock, FaUnlock, FaWandMagicSparkles } from 'react-icons/fa6';

const AchievementsPage = () => {
  const { achievements, stats, loading, error } = useAchievements();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.isUnlocked;
    if (filter === 'locked') return !a.isUnlocked;
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const lockedCount = achievements.filter((a) => !a.isUnlocked).length;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
              <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg">Cargando logros...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8 text-red-600 dark:text-red-400 shadow-md">
              <h3 className="font-bold text-xl mb-2">❌ Error al cargar logros</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Encabezado con icono */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                <FaTrophy className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent dark:from-yellow-400 dark:via-orange-400 dark:to-red-400">
                  Centro de Logros
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  Desbloquea logros completando análisis, encontrando vulnerabilidades y mejorando tu código
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          {stats && (
            <div className="mb-10">
              <AchievementStatsCard stats={stats} />
            </div>
          )}

          {/* Filtros */}
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500'
              }`}
            >
              <FaWandMagicSparkles />
              Todos ({achievements.length})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                filter === 'unlocked'
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-green-600 dark:hover:border-green-500'
              }`}
            >
              <FaUnlock />
              Desbloqueados ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                filter === 'locked'
                  ? 'bg-gray-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-600 dark:hover:border-gray-500'
              }`}
            >
              <FaLock />
              Bloqueados ({lockedCount})
            </button>
          </div>

          {/* Panel de logros */}
          {filteredAchievements.length > 0 ? (
            <AchievementPanel achievements={filteredAchievements} title={`${filteredAchievements.length} Logros`} />
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <FaLock className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-xl mb-2">No hay logros en esta categoría</p>
              <p className="text-gray-500 dark:text-gray-500">Sigue completando análisis para desbloquear más logros</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AchievementsPage;
