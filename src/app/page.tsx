"use client";
import Link from "next/link";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { formatDisplayName } from "../lib/formatName";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
        {/* Hero Section */}
        <div className="max-w-4xl w-full text-center mb-12">
          <div className="inline-flex items-center bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 mb-6">
            <svg className="w-4 h-4 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-sm font-medium text-indigo-700">Plataforma Educativa de Análisis de Código</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {isAuthenticated ? (
              <>Bienvenido de vuelta, <span className="text-indigo-600">{formatDisplayName(user?.name || '')}</span></>
            ) : (
              <>Mejora la Seguridad de tu <span className="text-indigo-600">Código</span></>
            )}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            {isAuthenticated 
              ? 'Analiza tu código, completa misiones educativas y desarrolla habilidades profesionales en seguridad de software.'
              : 'Plataforma integral para analizar vulnerabilidades, aprender buenas prácticas y competir con otros desarrolladores.'
            }
          </p>
        </div>

        {/* Action Cards */}
        <div className="max-w-5xl w-full mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/upload"
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200/60 p-8 hover:border-indigo-300"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 rounded-xl p-3 group-hover:bg-indigo-600 transition-colors duration-300">
                  <svg className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analizar Proyecto</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Sube tu código y obtén un análisis detallado de vulnerabilidades y métricas de calidad.
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              href="/rankings"
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200/60 p-8 hover:border-indigo-300"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-amber-100 rounded-xl p-3 group-hover:bg-amber-500 transition-colors duration-300">
                  <svg className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ver Rankings</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Compara tu progreso con otros desarrolladores y alcanza la cima del ranking.
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Quick Access Section */}
        {isAuthenticated && (
          <div className="max-w-5xl w-full">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link
                  href="/my-analyses"
                  className="flex items-center justify-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Mis Análisis</span>
                </Link>
                <Link
                  href="/missions"
                  className="flex items-center justify-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Misiones</span>
                </Link>
                <Link
                  href="/achievements"
                  className="flex items-center justify-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>Logros</span>
                </Link>
                <Link
                  href="/custom-missions"
                  className="flex items-center justify-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Desafíos</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>VulnAnalyzer © {new Date().getFullYear()} - Plataforma Educativa de Análisis de Código</p>
        </footer>
      </div>
    </div>
  );
}
