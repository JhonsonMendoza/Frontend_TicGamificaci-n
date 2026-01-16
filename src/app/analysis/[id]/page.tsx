'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import { Analysis, Mission } from '../../../types/auth';
import apiService from '../../../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

const AnalysisDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'files' | 'missions'>('overview');

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
        // Si el usuario está autenticado, intentar cargar las misiones de este análisis
        try {
          if (apiService.isAuthenticated()) {
            const mresp = await apiService.getMissionsByAnalysis(Number(analysisId));
            if (mresp.success && mresp.data) setMissions(mresp.data);
          }
        } catch (err: unknown) {
          // No bloquear si falla la carga de misiones
          const msg =
            err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
          console.warn('No se pudieron cargar las misiones del análisis:', msg);
        }
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

  const handleMarkMissionFixed = async (id: number) => {
    try {
      const res = await apiService.markMissionFixed(id);
      if (res.success) {
        toast.success('Misión marcada como corregida');
        const mresp = await apiService.getMissionsByAnalysis(Number(analysisId));
        if (mresp.success && mresp.data) setMissions(mresp.data);
      }
    } catch (err) {
      toast.error('Error marcando misión como corregida');
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
    // Si es null, undefined o string vacío, devolver '0.0'
    if (score === null || score === undefined || score === '') return '0.0';
    const n = typeof score === 'string' ? parseFloat(score) : score;
    // Si no es un número válido, devolver '0.0' en lugar de N/A
    if (typeof n !== 'number' || !isFinite(n)) return '0.0';
    // Asegurar que el score esté entre 0 y 100
    const clampedScore = Math.max(0, Math.min(100, n));
    return clampedScore.toFixed(digits);
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

  const [uploadingAnalysis, setUploadingAnalysis] = useState(false);
  const [showReanalyzeModal, setShowReanalyzeModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');

  const handleAnalysisFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAnalysis(true);
      const resp = await apiService.reanalyzeAnalysis(Number(analysisId), file);
      if (resp.success) {
        // Verificar si es un proyecto diferente (la respuesta viene en resp.data)
        const isNewProject = resp.data?.isNewProject;
        if (isNewProject) {
          toast.error('⚠️ El proyecto enviado es diferente al original. Se ha creado un nuevo análisis.');
        } else {
          toast.success('✅ Re-análisis completado. Proyecto actualizado.');
        }
        if (resp.data?.data?.id || resp.data?.id) {
          router.push(`/analysis/${resp.data?.data?.id || resp.data?.id}`);
          return;
        }
        await loadAnalysis();
      } else {
        toast.error(resp.message || 'Error al enviar re-análisis');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error en re-análisis';
      toast.error(msg);
    } finally {
      setUploadingAnalysis(false);
    }
  };

  const handleReanalyzeFromRepo = async () => {
    if (!repoUrl.trim()) {
      toast.error('Ingresa la URL del repositorio');
      return;
    }

    try {
      setUploadingAnalysis(true);
      const resp = await apiService.reanalyzeAnalysis(Number(analysisId), undefined, repoUrl.trim());
      if (resp.success) {
        const isNewProject = resp.data?.isNewProject;
        if (isNewProject) {
          toast.error('⚠️ El proyecto enviado es diferente al original. Se ha creado un nuevo análisis.');
        } else {
          toast.success('✅ Re-análisis completado. Proyecto actualizado.');
        }
        setShowReanalyzeModal(false);
        if (resp.data?.data?.id || resp.data?.id) {
          router.push(`/analysis/${resp.data?.data?.id || resp.data?.id}`);
          return;
        }
        await loadAnalysis();
      } else {
        toast.error(resp.message || 'Error al enviar re-análisis');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error en re-análisis';
      toast.error(msg);
    } finally {
      setUploadingAnalysis(false);
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
            <div className="flex items-center space-x-3">
              {/* Si fue analizado por repositorio, mostrar botón para re-análisis por repo */}
              {analysis.repositoryUrl ? (
                <button
                  onClick={() => {
                    setRepoUrl(analysis.repositoryUrl || '');
                    setShowReanalyzeModal(true);
                  }}
                  disabled={uploadingAnalysis}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {uploadingAnalysis ? '⏳ Procesando...' : '🔄 Re-analizar desde Repositorio'}
                </button>
              ) : (
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                  {uploadingAnalysis ? '⏳ Procesando...' : '📁 Subir Corrección (.zip)'}
                  <input type="file" accept=".zip" className="hidden" onChange={handleAnalysisFileChange} disabled={uploadingAnalysis} />
                </label>
              )}
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(analysis.status)}`}>
                {analysis.status === 'completed' ? 'Completado' : 
                 analysis.status === 'processing' ? 'Procesando' : 
                 analysis.status === 'failed' ? 'Fallido' : 'Pendiente'}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className={`text-3xl font-bold ${getScoreColor(Number(analysis.qualityScore) || 0)}`}>
              {formatScore(analysis.qualityScore)}
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
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-gray-500">{analysis.lowSeverityIssues}</div>
            <div className="text-gray-600">Leves</div>
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
                onClick={() => setActiveTab('missions')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'missions' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Misiones {missions.length > 0 ? `(${missions.length})` : ''}
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

            {activeTab === 'missions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <span>🎯</span> Misiones de este proyecto
                  </h3>
                  {missions.length > 0 && (
                    <div className="flex gap-3 text-sm">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                        {missions.filter(m => m.status === 'pending').length} pendientes
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {missions.filter(m => m.status === 'fixed').length} resueltas
                      </span>
                    </div>
                  )}
                </div>

                {missions.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                    <div className="text-5xl mb-3">🎉</div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">¡Excelente trabajo!</h4>
                    <p className="text-gray-500">No hay misiones generadas para este análisis.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {missions.map(m => {
                      const isFixed = m.status === 'fixed';
                      const severityConfig = {
                        high: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '🔴', label: 'CRÍTICO' },
                        medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '🟡', label: 'MEDIO' },
                        low: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: '🔵', label: 'LEVE' },
                      };
                      const severity = severityConfig[m.severity as keyof typeof severityConfig] || severityConfig.medium;
                      
                      return (
                        <div 
                          id={`mission-${m.id}`} 
                          key={m.id} 
                          className={`bg-white rounded-xl border-2 ${isFixed ? 'border-green-200 bg-green-50/30' : severity.border} transition-all hover:shadow-md`}
                        >
                          <div className="p-5">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{severity.icon}</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${severity.bg} ${severity.color}`}>
                                  {severity.label}
                                </span>
                                {isFixed && (
                                  <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700">
                                    ✓ RESUELTO
                                  </span>
                                )}
                              </div>
                              {!isFixed && (
                                <button 
                                  onClick={() => handleMarkMissionFixed(m.id)} 
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                  ✓ Marcar como corregida
                                </button>
                              )}
                            </div>
                            
                            {/* Título */}
                            <h4 className={`text-lg font-semibold mb-2 ${isFixed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {m.title || 'Sin título'}
                            </h4>
                            
                            {/* Descripción */}
                            {m.description && (
                              <div className={`text-sm mt-3 p-4 rounded-lg ${isFixed ? 'bg-gray-50 text-gray-500' : 'bg-gray-50 text-gray-700'}`}>
                                <ReactMarkdown
                                  components={{
                                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                    strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                                    ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                                    li: ({children}) => <li className="mb-1">{children}</li>,
                                  }}
                                >
                                  {m.description}
                                </ReactMarkdown>
                              </div>
                            )}
                            
                            {/* Footer */}
                            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <span>📄</span>
                                <span className="font-mono">{m.filePath || 'N/A'}</span>
                                {m.lineStart && <span className="text-blue-500">:L{m.lineStart}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                          <span className={`font-bold ${getScoreColor(Number(analysis.qualityScore) || 0)}`}>
                            {formatScore(analysis.qualityScore)}/100
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

      {/* Modal de Re-análisis por Repositorio */}
      {showReanalyzeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🔄 Re-analizar desde Repositorio</h3>
            <p className="text-gray-600 mb-4">
              Ingresa la URL del repositorio Git para re-analizar el proyecto.
              Si el proyecto es el mismo, se actualizarán las misiones. Si es diferente, se creará un nuevo análisis.
            </p>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/usuario/repositorio"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReanalyzeModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleReanalyzeFromRepo}
                disabled={uploadingAnalysis || !repoUrl.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {uploadingAnalysis ? '⏳ Analizando...' : '🚀 Re-analizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDetailPage;