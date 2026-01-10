'use client';

import React from 'react';
import { Achievement } from '@/apis/achievements.api';
import {
  FaMedal,
  FaBullseye,
  FaShield,
  FaStar,
  FaFire,
  FaCrown,
  FaWandMagicSparkles,
  FaCheck,
  FaLightbulb,
  FaTrophy,
  FaExclamation,
  FaArrowTrendUp,
  FaBook,
  FaAward,
} from 'react-icons/fa6';

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const getIcon = (icon: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      badge: <FaMedal />,
      target: <FaBullseye />,
      shield: <FaShield />,
      star: <FaStar />,
      flame: <FaFire />,
      crown: <FaCrown />,
      sword: <FaWandMagicSparkles />,
      'shield-check': <FaCheck />,
      zap: <FaLightbulb />,
      trophy: <FaTrophy />,
      'alert-circle': <FaExclamation />,
      'trending-up': <FaArrowTrendUp />,
      'book-open': <FaBook />,
      award: <FaAward />,
      'crown-sparkles': <FaCrown />,
    };
    return iconMap[icon] || <FaAward />;
  };

  return (
    <div
      className={`relative rounded-lg border-2 transition-all duration-300 ${
        achievement.isUnlocked
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 shadow-lg hover:shadow-xl'
          : 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 opacity-60 hover:opacity-80'
      }`}
    >
      {/* Badge de desbloqueado */}
      {achievement.isUnlocked && (
        <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-2 shadow-lg animate-pulse">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      <div className="p-4">
        {/* Ícono y nombre */}
        <div className="flex items-start gap-4 mb-3">
          <div
            className={`text-5xl transition-all duration-300 ${
              achievement.isUnlocked
                ? 'text-yellow-500 drop-shadow-lg'
                : 'text-gray-400 opacity-50'
            }`}
          >
            {getIcon(achievement.icon)}
          </div>
          <div className="flex-1">
            <h3
              className={`font-bold text-lg transition-colors ${
                achievement.isUnlocked
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {achievement.name}
            </h3>
            <p
              className={`text-xs transition-colors ${
                achievement.isUnlocked
                  ? 'text-gray-600 dark:text-gray-300'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {achievement.category === 'general'
                ? 'General'
                : achievement.category === 'vulnerability'
                  ? 'Seguridad'
                  : achievement.category === 'performance'
                    ? 'Rendimiento'
                    : 'Consistencia'}
            </p>
          </div>
        </div>

        {/* Descripción */}
        <p
          className={`text-sm mb-3 transition-colors ${
            achievement.isUnlocked
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {achievement.description}
        </p>

        {/* Condición */}
        <p
          className={`text-xs mb-3 italic transition-colors ${
            achievement.isUnlocked
              ? 'text-gray-600 dark:text-gray-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {achievement.condition}
        </p>

        {/* Progreso (si no está desbloqueado) */}
        {!achievement.isUnlocked && achievement.progressTarget && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400">Progreso</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {achievement.progressCurrent || 0} / {achievement.progressTarget}
              </span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((achievement.progressCurrent || 0) / achievement.progressTarget) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Puntos */}
        <div
          className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
            achievement.isUnlocked
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <span>✨</span>
          <span>{achievement.pointsReward} puntos</span>
        </div>

        {/* Fecha de desbloqueo */}
        {achievement.isUnlocked && achievement.unlockedAt && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            Desbloqueado el {new Date(achievement.unlockedAt).toLocaleDateString('es-ES')}
          </p>
        )}
      </div>
    </div>
  );
};

export default AchievementCard;
