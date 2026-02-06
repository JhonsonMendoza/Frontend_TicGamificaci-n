'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../services/api';
import { CustomMission, MissionSubmission } from '../../../types/auth';
import toast from 'react-hot-toast';

const SUBJECT_NAMES: Record<string, string> = {
  calculus: 'Cálculo Vectorial',
  physics: 'Física I',
  differential: 'Ecuaciones Diferenciales',
  digital: 'Computación Digital',
  oop: 'Programación Orientada a Objetos',
};

const CustomMissionDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const missionId = Number(params?.id);
  const { isAuthenticated, user } = useAuth();

  const [mission, setMission] = useState<CustomMission | null>(null);
  const [submission, setSubmission] = useState<MissionSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (missionId) {
      loadMission();
      if (isAuthenticated) {
        loadSubmission();
      }
    }
  }, [missionId, isAuthenticated]);

  const loadMission = async () => {
    try {
      setLoading(true);
      const res = await apiService.getCustomMissionById(missionId);
      if (res.success && res.data) {
        setMission(res.data);
      } else {
        toast.error('Misión no encontrada');
        router.push('/custom-missions');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error cargando misión');
      router.push('/custom-missions');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmission = async () => {
    try {
      const res = await apiService.getCustomMissionSubmission(missionId);
      if (res.success && res.data) {
        setSubmission(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para enviar una misión');
      return;
    }

    try {
      setUploading(true);
      toast.loading('Subiendo y validando tu código...');

      const res = await apiService.submitCustomMission(missionId, file);

      toast.dismiss();

      if (res.success && res.data) {
        const sub = res.data;
        setSubmission(sub);

        if (sub.status === 'approved') {
          toast.success(`🎉 ${res.message || '¡Misión completada!'}`);
        } else if (sub.status === 'error') {
          toast.error('Error: ' + (sub.errorMessage || 'Tu código no compila'));
        } else {
          toast.error('Algunos tests fallaron. Revisa el feedback.');
        }
      } else {
        toast.error(res.message || 'Error enviando misión');
      }
    } catch (error: any) {
      toast.dismiss();
      const msg = error.response?.data?.message || error.message || 'Error enviando misión';
      toast.error(msg);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Cargando misión...</p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return null;
  }

  const subjectName = SUBJECT_NAMES[mission.subject] || mission.subject;
  const maxPoints = mission.basePoints + mission.pointsPerTest * (mission.tests?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back button */}
        <button
          onClick={() => router.push('/custom-missions')}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Volver a misiones
        </button>

        {/* Mission Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {subjectName}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              mission.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              mission.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {mission.difficulty.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
              💰 {maxPoints} puntos máximos
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4">{mission.title}</h1>

          <div className="prose max-w-none">
            <div className="whitespace-pre-line text-gray-700">
              {mission.description}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Requisitos Técnicos</span>
          </h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium">Clases requeridas:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {mission.requiredClasses.map(cls => (
                  <code key={cls} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {cls}.java
                  </code>
                ))}
              </div>
            </div>

            {mission.requiredMethods && mission.requiredMethods.length > 0 && (
              <div>
                <span className="font-medium">Métodos requeridos:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mission.requiredMethods.map(method => (
                    <code key={method} className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {method}()
                    </code>
                  ))}
                </div>
              </div>
            )}

            {mission.tests && mission.tests.length > 0 && (
              <div>
                <span className="font-medium">Tests a pasar: {mission.tests.length}</span>
                <ul className="mt-2 ml-4 space-y-1 text-sm text-gray-700">
                  {mission.tests.map((test, idx) => (
                    <li key={idx} className="list-disc">
                      {test.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Submission Section */}
        {isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Enviar Solución</span>
            </h2>

            {submission && (
              <div className={`p-4 rounded-lg mb-4 ${
                submission.status === 'approved' ? 'bg-green-50 border border-green-200' :
                submission.status === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold">
                      {submission.status === 'approved' ? '✅ Completada' :
                       submission.status === 'error' ? '❌ Error de compilación' :
                       '⚠️ Tests fallidos'}
                    </span>
                    {submission.pointsAwarded !== null && (
                      <span className="ml-3 text-green-600 font-bold">
                        +{submission.pointsAwarded} puntos
                      </span>
                    )}
                  </div>
                  {submission.submittedAt && (
                    <span className="text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleString('es-ES')}
                    </span>
                  )}
                </div>

                {submission.testsPassed !== null && submission.testsFailed !== null && (
                  <div className="text-sm mb-2">
                    <span className="text-green-600">✓ {submission.testsPassed} tests pasados</span>
                    <span className="mx-2">|</span>
                    <span className="text-red-600">✗ {submission.testsFailed} tests fallidos</span>
                  </div>
                )}

                {submission.feedback && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <strong>Feedback:</strong>
                    <pre className="mt-2 text-sm whitespace-pre-wrap font-mono text-gray-700">
                      {submission.feedback}
                    </pre>
                  </div>
                )}

                {submission.errorMessage && (
                  <div className="mt-3 p-3 bg-red-100 rounded">
                    <strong className="text-red-800">Error:</strong>
                    <pre className="mt-2 text-sm whitespace-pre-wrap font-mono text-red-700">
                      {submission.errorMessage}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-3">
                Sube un archivo ZIP con tus archivos .java
              </p>
              <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validando...
                  </>
                ) : (
                  <>📁 Seleccionar archivo ZIP</>
                )}
                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">
                El código se compilará y probará automáticamente
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 mb-4">
              Debes iniciar sesión para enviar tu solución
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Iniciar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomMissionDetailPage;
