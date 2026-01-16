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
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-6 text-gray-600 text-lg">Cargando logros...</p>
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
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-red-600 shadow-md">
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
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Encabezado con icono */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-md">
                <FaTrophy className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  🏆 Centro de Logros
                </h1>
                <p className="text-gray-600 mt-1">
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
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'
              }`}
            >
              <FaWandMagicSparkles />
              Todos ({achievements.length})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filter === 'unlocked'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-green-400'
              }`}
            >
              <FaUnlock />
              Desbloqueados ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filter === 'locked'
                  ? 'bg-gray-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'
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
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <FaLock className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-xl mb-2">No hay logros en esta categoría</p>
              <p className="text-gray-500">Sigue completando análisis para desbloquear más logros</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AchievementsPage;
