'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/layout/Navbar';
import { Analysis, RankingUser, GlobalStats } from '../../types/auth';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { achievementsApi } from '@/apis/achievements.api';
import type { Achievement, AchievementStats } from '@/apis/achievements.api';
import { formatDisplayName } from '@/lib/formatName';

interface MetricCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: number;
}

const getMetricIcon = (icon: string) => {
  const iconClass = "w-8 h-8";
  switch (icon) {
    case 'chart':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'bug':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'target':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    case 'star':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    default:
      return null;
  }
};

interface AnalysisStats {
  totalAnalyses: number;
  completedAnalyses: number;
  inProgressAnalyses: number;
  errorAnalyses: number;
  totalIssues: number;
  highSeverityIssues: number;
  mediumSeverityIssues: number;
  lowSeverityIssues: number;
  averageScore: number;
}

interface UserRankingInfo {
  position: number;
  totalUsers: number;
  percentile: number;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [userRanking, setUserRanking] = useState<UserRankingInfo | null>(null);
  const [recentActivity, setRecentActivity] = useState<Analysis[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [achievementStats, setAchievementStats] = useState<AchievementStats | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener análisis del usuario
      const analysesResponse = await apiService.getMyAnalyses();
      if (analysesResponse.success && analysesResponse.data) {
        setAnalyses(analysesResponse.data);
        setRecentActivity(analysesResponse.data.slice(0, 5));
        
        // Calcular estadísticas
        const analysesData = analysesResponse.data;
        const calculatedStats: AnalysisStats = {
          totalAnalyses: analysesData.length,
          completedAnalyses: analysesData.filter((a: Analysis) => a.status === 'completed').length,
          inProgressAnalyses: analysesData.filter((a: Analysis) => a.status === 'processing').length,
          errorAnalyses: analysesData.filter((a: Analysis) => a.status === 'failed').length,
          totalIssues: analysesData.reduce((sum: number, a: Analysis) => sum + (a.totalIssues || 0), 0),
          highSeverityIssues: analysesData.reduce((sum: number, a: Analysis) => sum + (a.highSeverityIssues || 0), 0),
          mediumSeverityIssues: analysesData.reduce((sum: number, a: Analysis) => sum + (a.mediumSeverityIssues || 0), 0),
          lowSeverityIssues: analysesData.reduce((sum: number, a: Analysis) => sum + (a.lowSeverityIssues || 0), 0),
          averageScore: analysesData.length > 0 
            ? analysesData.reduce((sum: number, a: Analysis) => sum + (a.qualityScore || 0), 0) / analysesData.length 
            : 0
        };
        setStats(calculatedStats);
      }

      // Obtener ranking del usuario
      try {
        const rankingResponse = await apiService.getMyPosition();
        if (rankingResponse.success && rankingResponse.data) {
          setUserRanking({
            position: rankingResponse.data.position || 0,
            totalUsers: rankingResponse.data.totalUsers || 0,
            percentile: rankingResponse.data.position && rankingResponse.data.totalUsers 
              ? Math.round((rankingResponse.data.position / rankingResponse.data.totalUsers) * 100)
              : 0
          });
        }
      } catch (error) {
        console.log('No se pudo obtener el ranking del usuario');
      }

      // Obtener logros del usuario
      try {
        const achievementsResponse = await achievementsApi.getAchievementStats();
        setAchievementStats(achievementsResponse);
        if (achievementsResponse.achievements) {
          const unlockedAchievements = achievementsResponse.achievements
            .filter(a => a.isUnlocked)
            .sort((a, b) => {
              const dateA = new Date(a.unlockedAt || 0).getTime();
              const dateB = new Date(b.unlockedAt || 0).getTime();
              return dateB - dateA;
            })
            .slice(0, 3);
          setRecentAchievements(unlockedAchievements);
        }
      } catch (error) {
        console.log('No se pudo obtener los logros del usuario');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    // Usar formato de fecha exacto como en "Mis Análisis"
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'completed': { text: 'Completado', color: 'bg-green-100 text-green-800' },
      'processing': { text: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
      'failed': { text: 'Error', color: 'bg-red-100 text-red-800' },
      'pending': { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' }
    };
    return statusMap[status as keyof typeof statusMap] || { text: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
  };

  const formatScore = (score: any, digits: number = 1) => {
    const n = typeof score === 'string' ? parseFloat(score) : score;
    if (typeof n !== 'number' || !isFinite(n)) return '0';
    return n.toFixed(digits);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Acceso Requerido</h2>
          <p className="text-gray-500 mb-6">Debes iniciar sesión para ver tu dashboard</p>
          <Link href="/auth" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  const metrics: MetricCard[] = [
    {
      title: "Análisis Completados",
      value: stats?.completedAnalyses || 0,
      icon: "chart",
      color: "bg-indigo-600",
    },
    {
      title: "Issues Encontrados",
      value: stats?.totalIssues || 0,
      icon: "bug",
      color: "bg-red-600",
    },
    {
      title: "Puntuación Promedio",
      value: `${formatScore(stats?.averageScore, 1)}/10`,
      icon: "target",
      color: "bg-green-600",
    },
    {
      title: "Puntos Totales",
      value: achievementStats?.totalPoints || 0,
      icon: "star",
      color: "bg-amber-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Bienvenido de vuelta, <span className="font-semibold text-indigo-600">{formatDisplayName(user?.name || user?.email || '')}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Sistema Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200/60 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
                  {metric.trend && (
                    <div className="flex items-center text-green-600 text-sm mt-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>+{metric.trend}% vs. mes anterior</span>
                    </div>
                  )}
                </div>
                <div className={`${metric.color} text-white p-3 rounded-xl shadow-sm`}>
                  {getMetricIcon(metric.icon)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Analyses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Análisis Recientes</h2>
                <Link 
                  href="/my-analyses"
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  <span>Ver Todos</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((analysis, index) => {
                    const statusBadge = getStatusBadge(analysis.status);
                    return (
                      <div
                        key={analysis.id || index}
                        className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {analysis.originalFileName || `Análisis #${analysis.id}`}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                                {statusBadge.text}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Issues:</span> 
                                <span className="text-red-500 font-medium">{analysis.highSeverityIssues || 0}H</span>
                                <span className="text-yellow-500 font-medium">{analysis.mediumSeverityIssues || 0}M</span>
                                <span className="text-gray-500 font-medium">{analysis.lowSeverityIssues || 0}L</span>
                              </div>
                              <div>
                                <span className="font-medium">Puntuación:</span> {typeof analysis.qualityScore === 'number' ? Math.max(0, analysis.qualityScore).toFixed(1) : '0.0'}/100
                              </div>
                              <div>
                                <span className="font-medium">Fecha:</span> {formatDate(analysis.createdAt)}
                              </div>
                              <div>
                                <span className="font-medium">Total Issues:</span> {analysis.totalIssues || 0}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Link 
                              href={`/analysis/${analysis.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Ver Detalles →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No hay análisis disponibles
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Sube un archivo para comenzar tu primer análisis
                  </p>
                  <Link 
                    href="/upload"
                    className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Iniciar Análisis</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Logros Recientes</h3>
                <Link 
                  href="/achievements"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-1"
                >
                  <span>Ver todos</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              {recentAchievements.length > 0 ? (
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="border border-blue-100 bg-blue-50 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{achievement.icon}</span>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {achievement.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                +{achievement.pointsReward} pts
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Sin logros desbloqueados aún</p>
                  <p className="text-gray-400 text-xs mt-2">Completa misiones para desbloquear logros</p>
                </div>
              )}
            </div>

            {/* Achievement Stats */}
            {achievementStats && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Progreso de Logros</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium">
                      {achievementStats.unlockedCount}/{achievementStats.totalAchievements}
                    </span>
                    <span className="text-blue-600 font-bold">
                      {achievementStats.completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${achievementStats.completionPercentage}%` }}
                    ></div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Puntos Totales</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {achievementStats.totalPoints}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link 
                  href="/upload"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg transition-all flex items-center justify-center space-x-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Subir Proyecto</span>
                </Link>
                <Link 
                  href="/my-analyses"
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-all flex items-center justify-center space-x-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Mis Análisis</span>
                </Link>
                <Link 
                  href="/rankings"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-lg transition-all flex items-center justify-center space-x-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span>Ver Rankings</span>
                </Link>
              </div>
            </div>

            {/* User Stats */}
            {userRanking && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tu Posición</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    #{userRanking.position}
                  </div>
                  <p className="text-gray-600 mb-4">
                    de {userRanking.totalUsers} usuarios
                  </p>
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Percentil {userRanking.percentile}º
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Mejor que el {100 - userRanking.percentile}% de usuarios
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            {stats && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Resumen de Issues</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-red-600 font-medium">🔴 Alta Severidad</span>
                    <span className="font-bold">{stats.highSeverityIssues}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-600 font-medium">🟡 Media Severidad</span>
                    <span className="font-bold">{stats.mediumSeverityIssues}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">⚪ Baja Severidad</span>
                    <span className="font-bold">{stats.lowSeverityIssues}</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>{stats.totalIssues}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
