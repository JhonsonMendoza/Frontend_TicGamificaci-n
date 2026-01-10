'use client';

import React from 'react';
import { Achievement } from '@/apis/achievements.api';
import AchievementCard from './achievement-card';

interface AchievementPanelProps {
  achievements: Achievement[];
  title?: string;
  showUnlockedOnly?: boolean;
}

const AchievementPanel: React.FC<AchievementPanelProps> = ({
  achievements,
  title = 'Logros',
  showUnlockedOnly = false,
}) => {
  const displayedAchievements = showUnlockedOnly
    ? achievements.filter((a) => a.isUnlocked)
    : achievements;

  const categorizedAchievements = {
    general: displayedAchievements.filter((a) => a.category === 'general'),
    vulnerability: displayedAchievements.filter((a) => a.category === 'vulnerability'),
    performance: displayedAchievements.filter((a) => a.category === 'performance'),
    consistency: displayedAchievements.filter((a) => a.category === 'consistency'),
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {showUnlockedOnly
            ? `Has desbloqueado ${displayedAchievements.length} logro${displayedAchievements.length !== 1 ? 's' : ''}`
            : `Progreso: ${displayedAchievements.filter((a) => a.isUnlocked).length}/${displayedAchievements.length}`}
        </p>
      </div>

      {/* Logros Generales */}
      {categorizedAchievements.general.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Logros Generales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedAchievements.general.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Logros de Vulnerabilidades */}
      {categorizedAchievements.vulnerability.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span className="text-2xl">🛡️</span> Seguridad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedAchievements.vulnerability.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Logros de Rendimiento */}
      {categorizedAchievements.performance.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span> Rendimiento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedAchievements.performance.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Logros de Consistencia */}
      {categorizedAchievements.consistency.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span> Consistencia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedAchievements.consistency.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {displayedAchievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {showUnlockedOnly
              ? 'Aún no has desbloqueado logros'
              : 'Carga un análisis para comenzar a desbloquear logros'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementPanel;
