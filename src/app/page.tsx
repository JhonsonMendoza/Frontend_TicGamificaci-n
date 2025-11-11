"use client";
import Link from "next/link";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="bg-white shadow-xl rounded-2xl p-10 max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-6">
            {isAuthenticated ? `¡Bienvenido, ${user?.name}!` : 'Bienvenido al Analizador de Vulnerabilidades'}
          </h1>
          <p className="text-gray-700 mb-8">
            {isAuthenticated 
              ? 'Sube tu código y descubre vulnerabilidades de seguridad. Compite con otros desarrolladores y mejora tus habilidades.'
              : 'Plataforma de análisis de vulnerabilidades en código. Regístrate para comenzar a analizar tu código y competir en rankings.'
            }
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/upload"
              className="bg-indigo-600 text-white font-semibold px-6 py-4 rounded-xl shadow hover:bg-indigo-700 transition"
            >
              🚀 Subir proyecto
            </Link>
            <Link
              href="/rankings"
              className="bg-green-600 text-white font-semibold px-6 py-4 rounded-xl shadow hover:bg-green-700 transition"
            >
              🏆 Ver Rankings
            </Link>
          </div>
          
          {isAuthenticated && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Accesos Rápidos</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/my-analyses"
                  className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition"
                >
                  Mis Análisis
                </Link>
                <Link
                  href="/profile"
                  className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition"
                >
                  Mi Perfil
                </Link>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-12 text-gray-500 text-sm">
          Analizador de Vulnerabilidades © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
