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
      approved: { text: 'Completada', color: 'bg-green-100 text-green-800 border border-green-200' },
      rejected: { text: 'Fallida', color: 'bg-red-100 text-red-800 border border-red-200' },
      pending: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
      error: { text: 'Error', color: 'bg-red-100 text-red-800 border border-red-200' },
      reviewing: { text: 'Revisando', color: 'bg-blue-100 text-blue-800 border border-blue-200' },
    };

    const config = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 p-6 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${subjectColor}`}>
            {subjectName}
          </span>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${difficultyColor}`}>
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
          <span className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>{mission.requiredClasses.length} clase(s)</span>
          </span>
          <span className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>{mission.basePoints + mission.pointsPerTest * (mission.tests?.length || 0)} pts</span>
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
