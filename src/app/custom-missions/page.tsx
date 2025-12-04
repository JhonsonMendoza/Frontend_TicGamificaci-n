'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import MissionCard from '../../components/missions/MissionCard';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { CustomMission, MissionSubmission } from '../../types/auth';
import toast from 'react-hot-toast';

const SUBJECT_NAMES: Record<string, string> = {
  calculus: 'Cálculo Vectorial',
  physics: 'Física I',
  differential: 'Ecuaciones Diferenciales',
  digital: 'Computación Digital',
  oop: 'Programación Orientada a Objetos',
};

const CustomMissionsPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [missions, setMissions] = useState<CustomMission[]>([]);
  const [submissions, setSubmissions] = useState<MissionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    loadMissions();
    if (isAuthenticated) {
      loadSubmissions();
    }
  }, [isAuthenticated, selectedSubject, selectedDifficulty]);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedSubject !== 'all') filters.subject = selectedSubject;
      if (selectedDifficulty !== 'all') filters.difficulty = selectedDifficulty;

      const res = await apiService.getCustomMissions(filters);
      if (res.success && res.data) {
        setMissions(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error cargando misiones');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const res = await apiService.getMyCustomMissionSubmissions();
      if (res.success && res.data) {
        setSubmissions(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getSubmissionForMission = (missionId: number): MissionSubmission | undefined => {
    return submissions.find(s => s.customMissionId === missionId);
  };

  const filteredMissions = missions;

  const subjects = ['all', 'calculus', 'physics', 'differential', 'digital', 'oop'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🎯 Desafíos de Código</h1>
          <p className="text-gray-600">
            Completa misiones específicas de cada materia y gana puntos
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materia
              </label>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las materias</option>
                {Object.entries(SUBJECT_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dificultad
              </label>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las dificultades</option>
                <option value="easy">Fácil</option>
                <option value="medium">Medio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
          </div>
        </div>

        {/* Missions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Cargando misiones...</p>
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay misiones disponibles
            </h3>
            <p className="text-gray-600">
              Intenta cambiar los filtros para ver más misiones
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map(mission => (
              <MissionCard
                key={mission.id}
                mission={mission}
                submission={getSubmissionForMission(mission.id)}
                onClick={() => router.push(`/custom-missions/${mission.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomMissionsPage;
