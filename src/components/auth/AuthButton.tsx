'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import UserProfileDropdown from './UserProfileDropdown';
import { formatDisplayName, getNameInitial } from '../../lib/formatName';

const AuthButton: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const rawName = user.name || user.email || 'Usuario';
    const displayName = formatDisplayName(rawName);
    const initial = getNameInitial(rawName);
    
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleProfileClick}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-sm">
              {initial}
            </span>
          </div>
          <span className="hidden sm:block font-medium">{displayName}</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showProfileDropdown && (
          <UserProfileDropdown onClose={() => setShowProfileDropdown(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Link
        href="/auth/login"
        className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
      >
        Iniciar Sesión
      </Link>
      <Link
        href="/auth/register"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
      >
        Registrarse
      </Link>
    </div>
  );
};

export default AuthButton;