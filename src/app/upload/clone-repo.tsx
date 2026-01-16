"use client";
import { useState, useEffect } from "react";
import { useAuth } from '../../contexts/AuthContext';
import Cookies from 'js-cookie';

interface CloneRepoProps {
  onSuccess?: (analysisId: number) => void;
}

// Etapas del proceso de análisis
const ANALYSIS_STAGES = [
  { id: 1, label: 'Conectando con el repositorio...', duration: 2000 },
  { id: 2, label: 'Clonando archivos del repositorio...', duration: 4000 },
  { id: 3, label: 'Detectando lenguajes de programación...', duration: 2000 },
  { id: 4, label: 'Ejecutando SpotBugs (análisis Java)...', duration: 5000 },
  { id: 5, label: 'Ejecutando PMD (calidad de código)...', duration: 4000 },
  { id: 6, label: 'Ejecutando Semgrep (seguridad)...', duration: 4000 },
  { id: 7, label: 'Generando misiones educativas...', duration: 2000 },
  { id: 8, label: 'Calculando puntuación de calidad...', duration: 1000 },
];

export default function CloneRepository({ onSuccess }: CloneRepoProps) {
  const { isAuthenticated } = useAuth();
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  // Obtener el token del localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token') || Cookies.get('token');
    }
    return null;
  };

  // Efecto para manejar la progresión de las etapas
  useEffect(() => {
    if (!isLoading) {
      setCurrentStage(0);
      setProgress(0);
      return;
    }

    let stageIndex = 0;
    let stageProgress = 0;
    const totalStages = ANALYSIS_STAGES.length;

    const advanceProgress = () => {
      if (stageIndex >= totalStages) return;

      const currentDuration = ANALYSIS_STAGES[stageIndex].duration;
      const progressIncrement = 100 / (currentDuration / 100); // Incremento cada 100ms

      stageProgress += progressIncrement;

      if (stageProgress >= 100) {
        stageProgress = 0;
        stageIndex++;
        if (stageIndex < totalStages) {
          setCurrentStage(stageIndex);
        }
      }

      // Calcular progreso total
      const baseProgress = (stageIndex / totalStages) * 100;
      const stageContribution = (stageProgress / 100) * (100 / totalStages);
      const totalProgress = Math.min(baseProgress + stageContribution, 95); // Máximo 95% hasta que termine
      
      setProgress(Math.round(totalProgress));
    };

    setCurrentStage(0);
    setProgress(0);

    const interval = setInterval(advanceProgress, 100);

    return () => clearInterval(interval);
  }, [isLoading]);

  const validateRepositoryUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      return (
        hostname.includes("github.com") ||
        hostname.includes("gitlab.com") ||
        hostname.includes("bitbucket.org")
      );
    } catch {
      return false;
    }
  };

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones
    if (!repoUrl.trim()) {
      setError("⚠️ Por favor ingresa la URL del repositorio");
      return;
    }

    if (!validateRepositoryUrl(repoUrl)) {
      setError(
        "❌ URL inválida. Solo se soportan repositorios de:\n" +
        "• GitHub (github.com)\n" +
        "• GitLab (gitlab.com)\n" +
        "• Bitbucket (bitbucket.org)"
      );
      return;
    }

    if (!repoUrl.toLowerCase().endsWith(".git") && !repoUrl.includes("/")) {
      setError("❌ URL de repositorio inválida. Usa el formato: https://github.com/usuario/repo");
      return;
    }

    // Verificar autenticación
    if (!isAuthenticated) {
      setError("❌ Debes estar autenticado para clonar repositorios");
      window.location.href = "/auth/login";
      return;
    }

    setIsLoading(true);

    try {
      const token = getToken();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analysis/clone-repo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            repositoryUrl: repoUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Error desconocido",
        }));
        const errorMessage =
          errorData.message ||
          `Error ${response.status}: ${response.statusText}`;

        if (response.status === 404) {
          setError("❌ Repositorio no encontrado. Verifica la URL.");
        } else if (response.status === 403) {
          setError(
            "❌ El repositorio es privado. Por favor usa un repositorio público."
          );
        } else if (response.status === 400) {
          setError(`❌ ${errorMessage}`);
        } else {
          setError(`❌ Error al clonar: ${errorMessage}`);
        }
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Completar la barra de progreso al 100%
        setProgress(100);
        setCurrentStage(ANALYSIS_STAGES.length);
        
        setSuccess(
          `✅ ¡Repositorio analizado exitosamente!\n` +
          `ID de análisis: ${data.data.id}\n` +
          `Hallazgos encontrados: ${data.data.totalIssues}`
        );
        setRepoUrl("");

        // Esperar 2 segundos y redirigir si hay callback
        setTimeout(() => {
          if (onSuccess && data.data?.id) {
            onSuccess(data.data.id);
          } else {
            window.location.href = `/analysis/${data.data?.id || ""}`;
          }
        }, 2000);
      } else {
        setError("❌ Error en la respuesta del servidor");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(
        `❌ Error de conexión: ${errorMessage}\n` +
        `Asegúrate de que el servidor esté corriendo y que el repositorio sea público.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="clone-repo-container">
      <style>{`
        .clone-repo-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          border-radius: 12px;
          color: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .clone-repo-header {
          margin-bottom: 1.5rem;
        }

        .clone-repo-header h2 {
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .clone-repo-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .clone-repo-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          font-size: 0.95rem;
        }

        .form-group input {
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          background-color: rgba(255, 255, 255, 0.95);
          color: #333;
        }

        .form-group input:focus {
          outline: none;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
        }

        .form-group input::placeholder {
          color: #999;
        }

        .submit-button {
          padding: 0.75rem 1.5rem;
          background-color: #ff6b6b;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          background-color: #ff5252;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert {
          padding: 1rem;
          border-radius: 6px;
          font-size: 0.95rem;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .alert-error {
          background-color: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.5);
          color: #ffebee;
        }

        .alert-success {
          background-color: rgba(76, 175, 80, 0.2);
          border: 1px solid rgba(76, 175, 80, 0.5);
          color: #f1f8e9;
        }

        .repo-info {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .repo-info ul {
          margin: 0.5rem 0 0 1.5rem;
          padding: 0;
        }

        .repo-info li {
          margin: 0.25rem 0;
        }

        .loading-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .progress-container {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .progress-header span {
          font-weight: 600;
          font-size: 1rem;
        }

        .progress-percentage {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffd700;
        }

        .progress-bar-outer {
          width: 100%;
          height: 12px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-bar-inner {
          height: 100%;
          background: linear-gradient(90deg, #4ade80 0%, #22c55e 50%, #16a34a 100%);
          border-radius: 6px;
          transition: width 0.3s ease;
          box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
        }

        .progress-stage {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.95);
        }

        .stage-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          font-size: 0.8rem;
        }

        .progress-stages-list {
          margin-top: 1rem;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .stage-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          opacity: 0.6;
          transition: all 0.3s ease;
        }

        .stage-item.active {
          opacity: 1;
          font-weight: 600;
        }

        .stage-item.completed {
          opacity: 0.8;
          color: #4ade80;
        }

        .stage-check {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          background: rgba(255, 255, 255, 0.2);
        }

        .stage-item.completed .stage-check {
          background: #4ade80;
          color: white;
        }

        .stage-item.active .stage-check {
          background: #ffd700;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(255, 215, 0, 0);
          }
        }
      `}</style>

      <div className="clone-repo-header">
        <h2>🔗 Clonar Repositorio Git</h2>
        <p>Analiza un repositorio público directamente desde Git</p>
      </div>

      <form className="clone-repo-form" onSubmit={handleClone}>
        <div className="form-group">
          <label htmlFor="repo-url">URL del Repositorio</label>
          <input
            id="repo-url"
            type="text"
            placeholder="https://github.com/usuario/repositorio"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !isAuthenticated}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Analizando...
            </>
          ) : (
            <>
              📥 Clonar y Analizar
            </>
          )}
        </button>
      </form>

      {isLoading && (
        <div className="progress-container">
          <div className="progress-header">
            <span>🔄 Progreso del Análisis</span>
            <span className="progress-percentage">{progress}%</span>
          </div>
          
          <div className="progress-bar-outer">
            <div 
              className="progress-bar-inner" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="progress-stage">
            <span className="stage-icon">⚙️</span>
            <span>{ANALYSIS_STAGES[currentStage]?.label || 'Procesando...'}</span>
          </div>

          <div className="progress-stages-list">
            {ANALYSIS_STAGES.map((stage, index) => (
              <div 
                key={stage.id}
                className={`stage-item ${index < currentStage ? 'completed' : ''} ${index === currentStage ? 'active' : ''}`}
              >
                <span className="stage-check">
                  {index < currentStage ? '✓' : index === currentStage ? '●' : '○'}
                </span>
                <span>{stage.label.replace('...', '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="repo-info">
        <strong>📌 Repositorios Soportados:</strong>
        <ul>
          <li>GitHub (github.com)</li>
          <li>GitLab (gitlab.com)</li>
          <li>Bitbucket (bitbucket.org)</li>
        </ul>
        <strong style={{ display: "block", marginTop: "0.5rem" }}>
          ⚠️ Requisitos:
        </strong>
        <ul>
          <li>El repositorio debe ser <strong>PÚBLICO</strong></li>
          <li>Debe contener código fuente (Java, Python, JavaScript, etc.)</li>
          <li>Debes estar autenticado</li>
        </ul>
      </div>
    </div>
  );
}
