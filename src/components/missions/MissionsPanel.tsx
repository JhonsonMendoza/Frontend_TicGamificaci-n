'use client';

import React from 'react';
import { Mission } from '@/apis/missions.api';
import VulnerabilityMissionCard from './VulnerabilityMissionCard';

interface MissionsPanelProps {
  missions: Mission[];
  title?: string;
  showOnlyPending?: boolean;
  onComplete?: (id: number) => Promise<Mission | null | void>;
  onSkip?: (id: number) => Promise<Mission | null | void>;
  isLoading?: boolean;
}

const MissionsPanel: React.FC<MissionsPanelProps> = ({
  missions,
  title = 'Misiones',
  showOnlyPending = false,
  onComplete,
  onSkip,
  isLoading = false,
}) => {
  const displayedMissions = showOnlyPending
    ? missions.filter((m) => m.status === 'pending')
    : missions;

  const categorizedMissions = {
    high: displayedMissions.filter((m) => m.severity === 'high'),
    medium: displayedMissions.filter((m) => m.severity === 'medium'),
    low: displayedMissions.filter((m) => m.severity === 'low'),
  };

  const stats = {
    total: displayedMissions.length,
    pending: displayedMissions.filter((m) => m.status === 'pending').length,
    completed: displayedMissions.filter((m) => m.status === 'fixed').length,
    skipped: displayedMissions.filter((m) => m.status === 'skipped').length,
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Pendientes</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Completadas</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Omitidas</div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats.skipped}
            </div>
          </div>
        </div>
      </div>

      {/* Misiones Críticas */}
      {categorizedMissions.high.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔴</span> Críticas ({categorizedMissions.high.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categorizedMissions.high.map((mission) => (
              <VulnerabilityMissionCard
                key={mission.id}
                mission={mission}
                onComplete={onComplete}
                onSkip={onSkip}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Misiones Medias */}
      {categorizedMissions.medium.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">🟡</span> Medias ({categorizedMissions.medium.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categorizedMissions.medium.map((mission) => (
              <VulnerabilityMissionCard
                key={mission.id}
                mission={mission}
                onComplete={onComplete}
                onSkip={onSkip}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Misiones Bajas */}
      {categorizedMissions.low.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">🟢</span> Bajas ({categorizedMissions.low.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categorizedMissions.low.map((mission) => (
              <VulnerabilityMissionCard
                key={mission.id}
                mission={mission}
                onComplete={onComplete}
                onSkip={onSkip}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {displayedMissions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {showOnlyPending
              ? 'No hay misiones pendientes. ¡Excelente trabajo!'
              : 'No hay misiones en este análisis'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MissionsPanel;
