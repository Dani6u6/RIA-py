import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Database,
  Cpu
} from "lucide-react";
import { checkBackendHealth, getAvailableModels } from "../utils/api";

export function BackendStatus() {
  const [isChecking, setIsChecking] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);
  const [models, setModels] = useState([]);
  const [lastCheck, setLastCheck] = useState(null);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const isHealthy = await checkBackendHealth();
      
      if (isHealthy) {
        const availableModels = await getAvailableModels();
        setModels(availableModels);
        setBackendStatus({
          status: "healthy",
          message: "Backend conectado y funcionando",
          modelsCount: availableModels.length
        });
      } else {
        setBackendStatus({
          status: "error",
          message: "Backend no responde en http://localhost:8000",
          modelsCount: 0
        });
        setModels([]);
      }
    } catch (error) {
      setBackendStatus({
        status: "error",
        message: error.message || "Error al conectar con el backend",
        modelsCount: 0
      });
      setModels([]);
    } finally {
      setIsChecking(false);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const getStatusIcon = () => {
    if (!backendStatus) return <AlertCircle className="w-5 h-5 text-gray-400" />;
    
    switch (backendStatus.status) {
      case "healthy":
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getStatusBadge = () => {
    if (!backendStatus) return <Badge variant="outline">Verificando...</Badge>;
    
    switch (backendStatus.status) {
      case "healthy":
        return <Badge className="bg-green-600">Conectado</Badge>;
      case "error":
        return <Badge variant="destructive">Desconectado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <Card className="p-4 dark:bg-gray-800 dark:border-gray-700 w-full max-w-full">
  <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
    {/* Columna 1: Header y Status */}
    <div className="md:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h4 className="text-gray-900 dark:text-white">Estado del Backend</h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkStatus}
          disabled={isChecking}
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Status - Horizontal layout para escritorio */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm dark:text-gray-200 truncate">http://localhost:8000</span>
            {getStatusBadge()}
          </div>
          {backendStatus && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {backendStatus.message}
            </p>
          )}
        </div>
      </div>
    </div>

    {/* Columna 2: Info adicional (hora y modelos) */}
    <div className="space-y-3">
      {/* Last Check */}
      {lastCheck && (
        <div className="text-right md:text-left">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Última verificación</p>
          <p className="text-sm dark:text-gray-300 font-medium">
            {lastCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      {/* Models Counter */}
      {backendStatus?.status === "healthy" && models.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm dark:text-gray-200">Modelos</span>
            </div>
            <span className="text-lg font-bold dark:text-white">{models.length}</span>
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Sección expandible para modelos o errores */}
  {(backendStatus?.status === "healthy" && models.length > 0) || 
   backendStatus?.status === "error" ? (
    <div className="mt-4 pt-4 border-t dark:border-gray-700">
      {/* Models List */}
      {backendStatus?.status === "healthy" && models.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Lista de modelos:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {models.map((model) => (
              <div 
                key={model.id} 
                className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded"
              >
                <Cpu className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate dark:text-gray-300">{model.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Escala: {model.scale}x</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Models Error */}
      {backendStatus?.status === "healthy" && models.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 dark:text-yellow-500 mt-0.5">⚠️</span>
            <div>
              <p className="text-sm dark:text-yellow-200">No hay modelos disponibles</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                Ejecuta: <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 rounded">python backend/setup.py</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Help */}
      {backendStatus?.status === "error" && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-start gap-2 mb-3">
            <span className="text-red-600 dark:text-red-500 mt-0.5">💡</span>
            <p className="text-sm dark:text-red-200 flex-1">Para solucionar el problema:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paso 1</p>
              <p className="text-sm dark:text-gray-300">Abre terminal en la carpeta 'backend'</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paso 2</p>
              <p className="text-sm dark:text-gray-300">
                Ejecuta: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">python main.py</code>
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paso 3</p>
              <p className="text-sm dark:text-gray-300">
                Verifica modelos: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">python check_models.py</code>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : null}
</Card>
  );
}
