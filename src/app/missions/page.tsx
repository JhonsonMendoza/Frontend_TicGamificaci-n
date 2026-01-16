'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Mission } from '../../types/auth';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const MissionsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) loadMissions();
  }, [isAuthenticated]);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const res = await apiService.getMyMissions();
      if (res.success && res.data) setMissions(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Error cargando misiones');
    } finally {
      setLoading(false);
    }
  };

  const markFixed = async (id: number) => {
    try {
      const res = await apiService.markMissionFixed(id);
      if (res.success) {
        toast.success('Misión marcada como corregida');
        loadMissions();
      }
    } catch (error) {
      toast.error('Error marcando misión');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h1>
            <p className="text-gray-600 mb-6">Necesitas iniciar sesión para ver tus misiones</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Header mejorado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">🎯</span>
            Mis Misiones
          </h1>
          <p className="text-gray-600 mt-2">
            Lista de tareas generadas a partir de tus análisis. Para verificar correcciones, re-analiza el proyecto completo desde la página de análisis.
          </p>
        </div>

        {/* Estadísticas rápidas */}
        {!loading && missions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-400">
              <div className="text-2xl font-bold text-yellow-600">{missions.filter(m => m.status === 'pending').length}</div>
              <div className="text-sm text-gray-500">Pendientes</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-400">
              <div className="text-2xl font-bold text-green-600">{missions.filter(m => m.status === 'fixed').length}</div>
              <div className="text-sm text-gray-500">Completadas</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-400">
              <div className="text-2xl font-bold text-gray-600">{missions.length}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        ) : missions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">¡No hay misiones pendientes!</h3>
            <p className="text-gray-500">Analiza un proyecto para generar nuevas misiones de mejora.</p>
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
                  key={m.id} 
                  className={`bg-white rounded-xl shadow-sm border-2 ${isFixed ? 'border-green-200 bg-green-50/30' : severity.border} transition-all hover:shadow-md`}
                >
                  <div className="p-5">
                    {/* Header de la misión */}
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
                          onClick={() => markFixed(m.id)} 
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <span>✓</span> Marcar como corregida
                        </button>
                      )}
                    </div>
                    
                    {/* Título */}
                    <h3 className={`text-lg font-semibold mb-2 ${isFixed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {m.title || 'Sin título'}
                    </h3>
                    
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
                    
                    {/* Footer con información del archivo */}
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
    </div>
  );
};

export default MissionsPage;
