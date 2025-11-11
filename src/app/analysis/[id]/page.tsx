'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import { Analysis } from '../../../types/auth';
import apiService from '../../../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const AnalysisDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'files'>('overview');

  const analysisId = params.id as string;

  useEffect(() => {
    if (analysisId) {
      loadAnalysis();
    }
  }, [analysisId]);

  const loadAnalysis = async () => {
    try {
      const response = await apiService.getAnalysisById(parseInt(analysisId));
      if (response.success && response.data) {
        setAnalysis(response.data);
      } else {
        toast.error('Análisis no encontrado');
        router.push('/my-analyses');
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast.error('Error al cargar el análisis');
      router.push('/my-analyses');
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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Análisis no encontrado</h1>
            <p className="text-gray-600 mb-6">
              El análisis solicitado no existe o no tienes permisos para verlo
            </p>
            <Link
              href="/my-analyses"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
            >
              Volver a Mis Análisis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/my-analyses" className="text-gray-700 hover:text-blue-600">
                  Mis Análisis
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-gray-500">Análisis #{analysis.id}</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {analysis.originalFileName || 'Proyecto sin nombre'}
              </h1>
              <p className="text-gray-600">
                Análisis realizado el {formatDate(analysis.createdAt)}
              </p>
            </div>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(analysis.status)}`}>
              {analysis.status === 'completed' ? 'Completado' : 
               analysis.status === 'processing' ? 'Procesando' : 
               analysis.status === 'failed' ? 'Fallido' : 'Pendiente'}
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.qualityScore)}`}>
              {analysis.qualityScore.toFixed(1)}
            </div>
            <div className="text-gray-600">Puntuación de Calidad</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-gray-900">{analysis.totalIssues}</div>
            <div className="text-gray-600">Problemas Totales</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{analysis.highSeverityIssues}</div>
            <div className="text-gray-600">Críticos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{analysis.mediumSeverityIssues}</div>
            <div className="text-gray-600">Medios</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'overview' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('findings')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'findings' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Problemas Encontrados ({analysis.totalIssues})
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'files' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Información del Archivo
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Resumen del Análisis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Archivo:</span>
                        <span className="font-medium">{analysis.originalFileName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tamaño:</span>
                        <span className="font-medium">
                          {analysis.fileSize ? `${(analysis.fileSize / 1024).toFixed(2)} KB` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(analysis.status)}`}>
                          {analysis.status === 'completed' ? 'Completado' : 
                           analysis.status === 'processing' ? 'Procesando' : 
                           analysis.status === 'failed' ? 'Fallido' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Iniciado:</span>
                        <span className="font-medium">{formatDate(analysis.createdAt)}</span>
                      </div>
                      {analysis.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completado:</span>
                          <span className="font-medium">{formatDate(analysis.completedAt)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estudiante:</span>
                        <span className="font-medium">{analysis.student}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {analysis.message && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Mensaje del Sistema</h4>
                    <p className="text-blue-800">{analysis.message}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'findings' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Problemas Encontrados</h3>
                
                {analysis.totalIssues === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h4 className="text-lg font-semibold text-green-900 mb-2">¡Excelente!</h4>
                    <p className="text-green-700">No se encontraron problemas en tu código.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Severity breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {analysis.highSeverityIssues > 0 && (
                        <div className={`p-4 rounded-lg border ${getSeverityColor('high')}`}>
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">🔴</span>
                            <div>
                              <div className="text-lg font-bold">{analysis.highSeverityIssues}</div>
                              <div className="text-sm">Problemas Críticos</div>
                            </div>
                          </div>
                        </div>
                      )}
                      {analysis.mediumSeverityIssues > 0 && (
                        <div className={`p-4 rounded-lg border ${getSeverityColor('medium')}`}>
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">🟡</span>
                            <div>
                              <div className="text-lg font-bold">{analysis.mediumSeverityIssues}</div>
                              <div className="text-sm">Problemas Medios</div>
                            </div>
                          </div>
                        </div>
                      )}
                      {analysis.lowSeverityIssues > 0 && (
                        <div className={`p-4 rounded-lg border ${getSeverityColor('low')}`}>
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">🔵</span>
                            <div>
                              <div className="text-lg font-bold">{analysis.lowSeverityIssues}</div>
                              <div className="text-sm">Problemas Menores</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Detailed findings */}
                    {analysis.findings && typeof analysis.findings === 'object' && (
                      <div className="space-y-4">
                        {Object.entries(analysis.findings).map(([tool, findings]: [string, any], index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                              Herramienta: {tool}
                            </h4>
                            {Array.isArray(findings) && findings.length > 0 ? (
                              <div className="space-y-3">
                                {findings.map((finding: any, fIndex: number) => (
                                  <div key={fIndex} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-start space-x-3">
                                      <span className="text-lg">
                                        {getSeverityIcon(finding.severity || 'medium')}
                                      </span>
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900">
                                          {finding.rule || finding.type || 'Problema detectado'}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                          {finding.message || finding.description || 'Sin descripción disponible'}
                                        </div>
                                        {finding.file && (
                                          <div className="text-xs text-gray-500 mt-2">
                                            📁 {finding.file}
                                            {finding.line && ` (línea ${finding.line})`}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-600">No se encontraron problemas específicos con esta herramienta.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Información del Archivo</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Detalles del Archivo</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nombre:</span>
                          <span className="font-medium">{analysis.originalFileName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tamaño:</span>
                          <span className="font-medium">
                            {analysis.fileSize ? `${(analysis.fileSize / 1024).toFixed(2)} KB` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo:</span>
                          <span className="font-medium">
                            {analysis.originalFileName?.split('.').pop()?.toUpperCase() || 'Desconocido'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Estadísticas de Análisis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Puntuación:</span>
                          <span className={`font-bold ${getScoreColor(analysis.qualityScore)}`}>
                            {analysis.qualityScore.toFixed(1)}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total de problemas:</span>
                          <span className="font-medium">{analysis.totalIssues}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duración:</span>
                          <span className="font-medium">
                            {analysis.completedAt && analysis.createdAt 
                              ? `${Math.round((new Date(analysis.completedAt).getTime() - new Date(analysis.createdAt).getTime()) / 1000)}s`
                              : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {analysis.fileStats && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Estadísticas Adicionales</h4>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(analysis.fileStats, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailPage;