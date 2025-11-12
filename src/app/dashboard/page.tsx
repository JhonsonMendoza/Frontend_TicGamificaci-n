'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/layout/Navbar';
import { Analysis, RankingUser, GlobalStats } from '../../types/auth';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface MetricCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: number;
}

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

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-ES');
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
      icon: "📊",
      color: "bg-blue-500",
    },
    {
      title: "Issues Encontrados",
      value: stats?.totalIssues || 0,
      icon: "🐛",
      color: "bg-red-500",
    },
    {
      title: "Puntuación Promedio",
      value: `${formatScore(stats?.averageScore, 1)}/10`,
      icon: "🎯",
      color: "bg-green-500",
    },
    {
      title: "Ranking Global",
      value: userRanking ? `#${userRanking.position}` : "N/A",
      icon: "🏆",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Bienvenido de vuelta, {user?.name || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                🟢 Sistema Activo
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
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
                  {metric.trend && (
                    <p className="text-green-600 text-sm flex items-center mt-2">
                      <span className="mr-1">↗️</span>
                      +{metric.trend}% vs. mes anterior
                    </p>
                  )}
                </div>
                <div className={`${metric.color} text-white p-3 rounded-full text-2xl`}>
                  {metric.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Analyses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Análisis Recientes</h2>
                <Link 
                  href="/my-analyses"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Ver Todos
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
                                <span className="font-medium">Puntuación:</span> {analysis.qualityScore || 'N/A'}/10
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
                  <div className="text-6xl mb-4">📈</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No hay análisis disponibles
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Sube un archivo para comenzar tu primer análisis
                  </p>
                  <Link 
                    href="/upload"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Iniciar Análisis
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link 
                  href="/upload"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
                >
                  <span>📤</span>
                  <span>Subir Archivo</span>
                </Link>
                <Link 
                  href="/my-analyses"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2"
                >
                  <span>📊</span>
                  <span>Mis Análisis</span>
                </Link>
                <Link 
                  href="/rankings"
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                >
                  <span>🏆</span>
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
