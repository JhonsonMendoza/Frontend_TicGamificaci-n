'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import AuthButton from '../auth/AuthButton';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const getLinkClasses = (href: string) => {
    const baseClasses = "font-medium transition-colors duration-200 px-3 py-2 rounded-md";
    if (isActiveLink(href)) {
      return `${baseClasses} text-blue-600 bg-blue-50`;
    }
    return `${baseClasses} text-gray-700 hover:text-gray-900 hover:bg-gray-50`;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VulnAnalyzer
              </span>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={getLinkClasses('/dashboard')}
                >
                  <span className="flex items-center space-x-2">
                    <span>📊</span>
                    <span>Dashboard</span>
                  </span>
                </Link>
                <Link 
                  href="/upload" 
                  className={getLinkClasses('/upload')}
                >
                  <span className="flex items-center space-x-2">
                    <span>📤</span>
                    <span>Subir Archivo</span>
                  </span>
                </Link>
                <Link 
                  href="/my-analyses" 
                  className={getLinkClasses('/my-analyses')}
                >
                  <span className="flex items-center space-x-2">
                    <span>📋</span>
                    <span>Mis Análisis</span>
                  </span>
                </Link>
                <Link 
                  href="/missions" 
                  className={getLinkClasses('/missions')}
                >
                  <span className="flex items-center space-x-2">
                    <span>🎯</span>
                    <span>Mis Misiones</span>
                  </span>
                </Link>
                <Link 
                  href="/custom-missions" 
                  className={getLinkClasses('/custom-missions')}
                >
                  <span className="flex items-center space-x-2">
                    <span>🚀</span>
                    <span>Desafíos</span>
                  </span>
                </Link>
                <Link 
                  href="/rankings" 
                  className={getLinkClasses('/rankings')}
                >
                  <span className="flex items-center space-x-2">
                    <span>🏆</span>
                    <span>Rankings</span>
                  </span>
                </Link>
                <Link 
                  href="/achievements" 
                  className={getLinkClasses('/achievements')}
                >
                  <span className="flex items-center space-x-2">
                    <span>🎖️</span>
                    <span>Logros</span>
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/" 
                  className={getLinkClasses('/')}
                >
                  <span className="flex items-center space-x-2">
                    <span>🏠</span>
                    <span>Inicio</span>
                  </span>
                </Link>
                <Link 
                  href="/custom-missions" 
                  className={getLinkClasses('/custom-missions')}
                >
                  <span className="flex items-center space-x-2">
                    <span>🚀</span>
                    <span>Desafíos</span>
                  </span>
                </Link>
                <Link 
                  href="/rankings" 
                  className={getLinkClasses('/rankings')}
                >
                  <span className="flex items-center space-x-2">
                    <span>🏆</span>
                    <span>Rankings</span>
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button and Auth */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            {children}
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu (could be expanded later) */}
      <div className="md:hidden">
        {/* Mobile menu content would go here */}
      </div>
    </nav>
  );
};

export default Navbar;