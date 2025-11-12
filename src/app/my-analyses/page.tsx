'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/layout/Navbar';
import { Analysis } from '../../types/auth';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const MyAnalysesPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    totalAnalyses: number;
    averageScore: number;
    totalIssues: number;
    highSeverityIssues: number;
    mediumSeverityIssues: number;
    lowSeverityIssues: number;
    recentAnalyses: Analysis[];
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalyses();
      loadSummary();
    }
  }, [isAuthenticated]);

  const loadAnalyses = async () => {
    try {
      const response = await apiService.getMyAnalyses();
      if (response.success && response.data) {
        setAnalyses(response.data);
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
      toast.error('Error al cargar los análisis');
    }
  };

  const loadSummary = async () => {
    try {
      const response = await apiService.getMySummary();
      if (response.success && response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatScore = (score: any, digits: number = 1) => {
    const n = typeof score === 'string' ? parseFloat(score) : score;
    if (typeof n !== 'number' || !isFinite(n)) return 'N/A';
    return n.toFixed(digits);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h1>
            <p className="text-gray-600 mb-6">
              Necesitas iniciar sesión para ver tus análisis
            </p>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
            >
              Ir al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Mis Análisis</h1>
          <p className="text-gray-600">
            Historial completo de tus análisis de código y métricas de rendimiento
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{summary.totalAnalyses}</div>
              <div className="text-gray-600">Análisis Totales</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className={`text-3xl font-bold ${getScoreColor(summary.averageScore)}`}>
                {formatScore(summary.averageScore)}
              </div>
              <div className="text-gray-600">Puntuación Promedio</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">{summary.totalIssues}</div>
              <div className="text-gray-600">Problemas Encontrados</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-red-600">{summary.highSeverityIssues}</div>
              <div className="text-gray-600">Críticos</div>
            </div>
          </div>
        )}

        {/* Analyses List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Historial de Análisis</h2>
          </div>
          
          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay análisis</h3>
              <p className="mt-1 text-sm text-gray-500">
                Sube tu primer proyecto para comenzar a analizar código
              </p>
              <div className="mt-6">
                <Link
                  href="/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Subir Proyecto
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proyecto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puntuación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Problemas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyses.map((analysis) => (
                    <tr key={analysis.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {analysis.originalFileName || 'Proyecto sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {analysis.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(analysis.status)}`}>
                          {analysis.status === 'completed' ? 'Completado' : 
                           analysis.status === 'processing' ? 'Procesando' : 
                           analysis.status === 'failed' ? 'Fallido' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-lg font-bold ${getScoreColor(analysis.qualityScore)}`}>
                          {formatScore(analysis.qualityScore)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {analysis.highSeverityIssues > 0 && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor('high')}`}>
                              {analysis.highSeverityIssues} Críticos
                            </span>
                          )}
                          {analysis.mediumSeverityIssues > 0 && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor('medium')}`}>
                              {analysis.mediumSeverityIssues} Medios
                            </span>
                          )}
                          {analysis.lowSeverityIssues > 0 && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor('low')}`}>
                              {analysis.lowSeverityIssues} Bajos
                            </span>
                          )}
                          {analysis.totalIssues === 0 && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                              Sin problemas
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(analysis.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/analysis/${analysis.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Ver Detalles
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAnalysesPage;