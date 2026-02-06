'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { achievementsApi } from '@/apis/achievements.api';
import { formatDisplayName, getNameInitial } from '../../lib/formatName';

interface UserProfileDropdownProps {
  onClose: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loadingPoints, setLoadingPoints] = useState(false);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoadingPoints(true);
        const stats = await achievementsApi.getAchievementStats();
        setTotalPoints(stats.totalPoints || 0);
      } catch (error) {
        console.log('No se pudo obtener los puntos');
      } finally {
        setLoadingPoints(false);
      }
    };

    if (user) {
      fetchPoints();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!user) return null;

  const rawName = user.name || user.email || 'Usuario';
  const displayName = formatDisplayName(rawName);
  const displayEmail = user.email || 'Sin email';
  const initial = getNameInitial(rawName);

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200/60 py-2 z-50">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {initial}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {displayEmail}
            </p>
          </div>
        </div>
        
        {user.university && (
          <div className="mt-2 text-xs text-gray-600">
            <p>{user.university}</p>
            {user.career && <p>{user.career}</p>}
          </div>
        )}

        {/* Points Badge */}
        <div className="mt-3 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-2 border border-amber-100">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <div>
              <p className="text-xs text-gray-600">Puntos Totales</p>
              <p className="text-sm font-bold text-gray-900">
                {loadingPoints ? '...' : totalPoints}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <a
          href="/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mi Perfil
          </div>
        </a>
        
        <a
          href="/my-analyses"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Mis Análisis
          </div>
        </a>

        <a
          href="/achievements"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Mis Logros
          </div>
        </a>
        
        <a
          href="/rankings"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Rankings
          </div>
        </a>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100 py-1">
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </div>
        </button>
      </div>
    </div>
  );
};

export default UserProfileDropdown;