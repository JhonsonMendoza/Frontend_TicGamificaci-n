'use client';

import React from 'react';
import { CustomMission, MissionSubmission } from '../../types/auth';

interface MissionCardProps {
  mission: CustomMission;
  submission?: MissionSubmission | null;
  onClick?: () => void;
}

const SUBJECT_NAMES: Record<string, string> = {
  calculus: 'Cálculo Vectorial',
  physics: 'Física I',
  differential: 'Ecuaciones Diferenciales',
  digital: 'Computación Digital',
  oop: 'POO',
};

const SUBJECT_COLORS: Record<string, string> = {
  calculus: 'bg-blue-100 text-blue-800',
  physics: 'bg-purple-100 text-purple-800',
  differential: 'bg-green-100 text-green-800',
  digital: 'bg-orange-100 text-orange-800',
  oop: 'bg-red-100 text-red-800',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const MissionCard: React.FC<MissionCardProps> = ({ mission, submission, onClick }) => {
  const subjectName = SUBJECT_NAMES[mission.subject] || mission.subject;
  const subjectColor = SUBJECT_COLORS[mission.subject] || 'bg-gray-100 text-gray-800';
  const difficultyColor = DIFFICULTY_COLORS[mission.difficulty] || 'bg-gray-100 text-gray-700';

  const getStatusBadge = () => {
    if (!submission) return null;

    const statusConfig = {
      approved: { text: 'Completada', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'Fallida', color: 'bg-red-100 text-red-800' },
      pending: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      error: { text: 'Error', color: 'bg-red-100 text-red-800' },
      reviewing: { text: 'Revisando', color: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${subjectColor}`}>
            {subjectName}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor}`}>
            {mission.difficulty.toUpperCase()}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{mission.title}</h3>

      {/* Description preview */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {mission.description.split('\n')[0]}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>📚 {mission.requiredClasses.length} clase(s)</span>
          <span>
            💰 {mission.basePoints + mission.pointsPerTest * (mission.tests?.length || 0)} pts
          </span>
        </div>

        {submission?.pointsAwarded !== null && submission?.pointsAwarded !== undefined && (
          <div className="text-sm font-semibold text-green-600">
            +{submission.pointsAwarded} puntos
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionCard;
