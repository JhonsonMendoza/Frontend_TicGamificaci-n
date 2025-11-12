"use client";
import { useState, useRef, useCallback } from "react";
import Link from 'next/link';
import { 
  FileUtils,
  type UploadProgress
} from '../../apis';
import { useAuthFileUpload } from '../../hooks/useAuthFileUpload';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';

export default function UploadPage() {
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [student, setStudent] = useState("estudiante1");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Usar el hook de upload con autenticación
  const { 
    uploadFile, 
    uploadProgress, 
    isUploading, 
    uploadError,
    resetUpload 
  } = useAuthFileUpload();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'zip': return '🗜️';
      case 'rar': return '📦';
      case 'js': case 'jsx': return '📄';
      case 'ts': case 'tsx': return '📘';
      case 'py': return '🐍';
      case 'java': return '☕';
      case 'cpp': case 'c': return '⚙️';
      case 'html': return '🌐';
      case 'css': return '🎨';
      default: return '📁';
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFile(droppedFiles[0]);
      resetUpload();
    }
  }, [resetUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      resetUpload();
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      // Redirigir a la página de login
      window.location.href = '/auth/login';
      return;
    }

    // Validar archivo usando las utilidades
    const { valid, errors } = FileUtils.validateFiles([file]);
    if (errors.length > 0) {
      console.error('Errores de validación:', errors);
      return;
    }

    const result = await uploadFile(file, isAuthenticated ? undefined : student);

    if (result) {
      // Redirigir al dashboard después del éxito
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
  };

  const removeFile = () => {
    setFile(null);
    resetUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
              <span className="text-3xl text-white">📤</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Análisis de Proyecto
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sube tu proyecto para obtener un análisis detallado de código, métricas de calidad y sugerencias de mejora
            </p>
            {!isAuthenticated && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-center">
                  💡 <strong>Tip:</strong> 
                  <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 font-medium mx-1">
                    Regístrate
                  </Link>
                  para guardar tus análisis y participar en los 
                  <Link href="/rankings" className="text-blue-600 hover:text-blue-800 font-medium mx-1">
                    rankings
                  </Link>
                </p>
              </div>
            )}
          </div>

        {/* Student Input - Solo para usuarios no autenticados */}
        {!isAuthenticated && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Estudiante</h2>
            <div className="flex items-center space-x-4">
              <label className="flex-shrink-0 text-gray-700 font-medium">Nombre del estudiante:</label>
              <input
                type="text"
                value={student}
                onChange={(e) => setStudent(e.target.value)}
                className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Ingresa tu nombre"
              />
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Subir Proyecto</h2>
            
            {/* Drag & Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50'
                  : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="text-6xl">{getFileIcon(file.name)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{file.name}</h3>
                    <p className="text-gray-600">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={removeFile}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Remover archivo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl text-gray-400">
                    {isDragOver ? '📥' : '📁'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu proyecto aquí'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      O haz clic para seleccionar archivos
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 font-medium"
                    >
                      Seleccionar Archivo
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".zip,.rar,.tar,.gz,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css"
              />
            </div>

            {/* File Types Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Tipos de archivo soportados:</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { ext: '.zip', icon: '🗜️' },
                  { ext: '.rar', icon: '📦' },
                  { ext: '.js/.jsx', icon: '📄' },
                  { ext: '.ts/.tsx', icon: '📘' },
                  { ext: '.py', icon: '🐍' },
                  { ext: '.java', icon: '☕' },
                  { ext: '.cpp/.c', icon: '⚙️' }
                ].map((type, index) => (
                  <span key={index} className="inline-flex items-center space-x-1 bg-white px-3 py-1 rounded-full text-sm text-blue-700">
                    <span>{type.icon}</span>
                    <span>{type.ext}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Status & Upload Button */}
          <div className="bg-gray-50 px-8 py-6">
            {/* Mostrar errores de upload */}
            {uploadError && (
              <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800">
                <div className="flex items-center justify-between">
                  <span>{uploadError}</span>
                  <button
                    onClick={resetUpload}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Mostrar progreso de upload */}
            {isUploading && uploadProgress && (
              <div className="mb-4 p-4 rounded-lg bg-blue-100 text-blue-800">
                <div className="flex items-center justify-between">
                  <span>Subiendo archivo...</span>
                  <span className="text-sm font-medium">{Math.round(uploadProgress.percentage || 0)}%</span>
                </div>
                <div className="mt-2 w-full bg-white rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {file ? (
                  <div>
                    <span className="font-medium">Archivo:</span> {file.name}
                    <br />
                    <span className="font-medium">Tamaño:</span> {FileUtils.formatFileSize(file.size)}
                  </div>
                ) : (
                  'No hay archivo seleccionado'
                )}
              </div>
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`px-8 py-3 rounded-lg font-medium transition-all transform ${
                  !file || isUploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Analizando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>🚀</span>
                    <span>Iniciar Análisis</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Análisis Rápido</h3>
            <p className="text-gray-600 text-sm">Procesamiento en segundos con resultados detallados</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">Análisis Profundo</h3>
            <p className="text-gray-600 text-sm">Evaluación completa de calidad y mejores prácticas</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Reportes Visuales</h3>
            <p className="text-gray-600 text-sm">Métricas claras y sugerencias de mejora</p>
          </div>
        </div>
        </div>
      </div>
      

    </div>
  );
}
