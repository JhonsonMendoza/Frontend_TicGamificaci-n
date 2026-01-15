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
        <h1 className="text-3xl font-bold mb-4">🎯 Mis Misiones</h1>
        <p className="text-gray-600 mb-6">Lista de tareas generadas a partir de tus análisis. Para verificar correcciones, re-analiza el proyecto completo desde la página de análisis.</p>

        {loading ? (
          <div>Loading...</div>
        ) : missions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">No hay misiones pendientes</div>
        ) : (
          <div className="space-y-4">
            {missions.map(m => {
              const severityText = (m.severity || 'medium').toUpperCase();
              const severityColor = m.severity === 'high' ? 'text-red-600' : m.severity === 'medium' ? 'text-yellow-600' : 'text-green-600';
              
              return (
                <div key={m.id} className="bg-white rounded-lg shadow p-4 flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className={`text-sm font-semibold ${severityColor}`}>{severityText}</div>
                    <div className="text-lg font-semibold">{m.title || 'Sin título'}</div>
                    {m.description && (
                      <div className="text-sm text-gray-600 mt-2 prose prose-sm max-w-none">
                        <ReactMarkdown>{m.description}</ReactMarkdown>
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">Archivo: {m.filePath || 'N/A'} {m.lineStart ? `: L${m.lineStart}` : ''}</div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded text-sm ${m.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : m.status === 'fixed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{m.status}</span>
                    <button onClick={() => markFixed(m.id)} className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Marcar como corregida</button>
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
