"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiService from '../../../services/api';
import toast from 'react-hot-toast';

const AuthCallbackClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('Error en la autenticación con Google');
          toast.error('Error en la autenticación con Google');
          setTimeout(() => router.push('/auth/login'), 3000);
          return;
        }

        if (!token) {
          setError('No se recibió el token de autenticación');
          toast.error('No se recibió el token de autenticación');
          setTimeout(() => router.push('/auth/login'), 3000);
          return;
        }

        console.log('[Callback] Token recibido:', token.substring(0, 20) + '...');

        // Guardar el token en localStorage y cookies
        apiService.setToken(token);
        console.log('[Callback] Token guardado');

        // Verificar que el token se guardó correctamente
        const savedToken = apiService.getToken();
        console.log('[Callback] Token verificado:', savedToken?.substring(0, 20) + '...');

        // Hacer una llamada a /auth/me para verificar que el token funciona
        try {
          const userData = await apiService.getCurrentUser();
          console.log('[Callback] User data received:', userData.email);
          
          toast.success('¡Inicio de sesión exitoso!');
          
          // Redireccionar después de guardar todo
          setTimeout(() => {
            router.push('/');
          }, 500);
        } catch (authError: any) {
          console.error('[Callback] Error fetching user data:', authError);
          toast.error('Error al verificar tu usuario');
          setTimeout(() => router.push('/auth/login'), 3000);
        }

      } catch (err) {
        console.error('Error processing auth callback:', err);
        setError('Error procesando la autenticación');
        toast.error('Error procesando la autenticación');
        setTimeout(() => router.push('/auth/login'), 3000);
      } finally {
        setProcessing(false);
        setProcessed(true);
      }
    };

    handleCallback();
  }, [searchParams, router, processed]);

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Procesando autenticación...</h2>
          <p className="text-gray-600">Por favor espera mientras completamos tu inicio de sesión.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition">Volver al Inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Autenticación Exitosa!</h2>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
};

export default AuthCallbackClient;
