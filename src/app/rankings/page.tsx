'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { RankingUser, GlobalStats } from '../../types/auth';
import toast from 'react-hot-toast';

const RankingsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [myPosition, setMyPosition] = useState<{
    userRank: RankingUser | null;
    position: number;
    totalUsers: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'global' | 'university' | 'career'>('global');
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    loadRankings();
    if (isAuthenticated) {
      loadMyPosition();
    }
  }, [isAuthenticated, filterType, filterValue]);

  const handleRefresh = () => {
    setLoading(true);
    loadRankings();
    if (isAuthenticated) {
      loadMyPosition();
    }
  };

  const loadRankings = async () => {
    try {
      setLoading(true);
      let response;

      console.log('Loading rankings with filter:', filterType, filterValue);

      switch (filterType) {
        case 'university':
          if (filterValue) {
            response = await apiService.getUniversityRankings(filterValue);
            console.log('University rankings response:', response);
            setRankings(response.data || []);
          } else {
            response = await apiService.getGlobalRankings();
            console.log('Global rankings response:', response);
            if (response.data) {
              setRankings(response.data.rankings);
              setGlobalStats(response.data.globalStats);
            }
          }
          break;
        case 'career':
          if (filterValue) {
            response = await apiService.getCareerRankings(filterValue);
            console.log('Career rankings response:', response);
            setRankings(response.data || []);
          } else {
            response = await apiService.getGlobalRankings();
            console.log('Global rankings response (fallback):', response);
            if (response.data) {
              setRankings(response.data.rankings);
              setGlobalStats(response.data.globalStats);
            }
          }
          break;
        default:
          response = await apiService.getGlobalRankings();
          console.log('Default global rankings response:', response);
          if (response.data) {
            setRankings(response.data.rankings);
            setGlobalStats(response.data.globalStats);
          }
      }

      console.log('Final rankings state:', rankings.length);
    } catch (error) {
      console.error('Error loading rankings:', error);
      toast.error('Error al cargar los rankings');
    } finally {
      setLoading(false);
    }
  };

  const loadMyPosition = async () => {
    try {
      const response = await apiService.getMyPosition();
      if (response.data) {
        setMyPosition(response.data);
      }
    } catch (error) {
      console.error('Error loading my position:', error);
    }
  };

  const handleFilterChange = (type: 'global' | 'university' | 'career', value: string = '') => {
    setFilterType(type);
    setFilterValue(value);
  };

  const getRankIcon = (position: number) => {
    const iconClass = "w-6 h-6";
    switch (position) {
      case 1:
        return (
          <div className="flex items-center space-x-2">
            <svg className={`${iconClass} text-yellow-500`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="text-lg font-bold text-gray-900">1°</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center space-x-2">
            <svg className={`${iconClass} text-gray-400`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="text-lg font-bold text-gray-900">2°</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center space-x-2">
            <svg className={`${iconClass} text-amber-600`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="text-lg font-bold text-gray-900">3°</span>
          </div>
        );
      default:
        return <span className="text-lg font-semibold text-gray-600">#{position}</span>;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Rankings de Desarrolladores</h1>
              <p className="text-gray-600">
                Compite con otros desarrolladores y mejora tu puntuación analizando más código
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>

        {/* Global Stats */}
        {globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600">{globalStats.totalUsers}</div>
              <div className="text-gray-600 text-sm mt-1">Usuarios Totales</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{globalStats.totalAnalyses}</div>
              <div className="text-gray-600 text-sm mt-1">Análisis Realizados</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-amber-600">{globalStats.totalIssuesFound}</div>
              <div className="text-gray-600 text-sm mt-1">Vulnerabilidades Encontradas</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{formatScore(globalStats.averageQualityScore)}</div>
              <div className="text-gray-600 text-sm mt-1">Puntuación Promedio</div>
            </div>
          </div>
        )}

        {/* My Position (if authenticated) */}
        {myPosition && isAuthenticated && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-indigo-900 mb-3">Mi Posición en el Ranking</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold">
                  {getRankIcon(myPosition.position)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{myPosition.userRank?.name}</div>
                  <div className="text-sm text-gray-600">
                    Posición {myPosition.position} de {myPosition.totalUsers}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(myPosition.userRank?.averageScore || 0)}`}>
                  {formatScore(myPosition.userRank?.averageScore)}
                </div>
                <div className="text-sm text-gray-600">
                  {myPosition.userRank?.totalAnalyses} análisis
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Options */}
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Filtrar Rankings</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleFilterChange('global')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === 'global' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Global
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFilterChange('university', filterValue)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterType === 'university' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Por Universidad
              </button>
              {filterType === 'university' && (
                <input
                  type="text"
                  placeholder="Nombre de la universidad"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFilterChange('university', filterValue)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFilterChange('career', filterValue)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterType === 'career' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Por Carrera
              </button>
              {filterType === 'career' && (
                <input
                  type="text"
                  placeholder="Nombre de la carrera"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFilterChange('career', filterValue)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              )}
            </div>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              {filterType === 'global' 
                ? 'Ranking Global' 
                : filterType === 'university' && filterValue 
                  ? `Ranking - ${filterValue}` 
                  : filterType === 'career' && filterValue 
                    ? `Ranking - ${filterValue}`
                    : 'Ranking Global'
              }
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posición
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Universidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carrera
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Análisis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puntuación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vulnerabilidades
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankings.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold">
                        {getRankIcon(index + 1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-sm">
                              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {user.name || user.email || 'Usuario'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.university || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.career || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.totalAnalyses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-lg font-bold ${getScoreColor(user.averageScore)}`}>
                        {formatScore(user.averageScore)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.totalIssuesFound}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rankings.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos disponibles</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterValue 
                  ? `No hay usuarios en ${filterType === 'university' ? 'la universidad' : 'la carrera'} "${filterValue}"`
                  : 'No hay usuarios con análisis realizados aún.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingsPage;