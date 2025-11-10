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
    <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
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

        {/* Status */}
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm dark:text-gray-200">http://localhost:8000</span>
              {getStatusBadge()}
            </div>
            {backendStatus && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {backendStatus.message}
              </p>
            )}
          </div>
        </div>

        {/* Models Info */}
        {backendStatus?.status === "healthy" && (
          <div className="pt-3 border-t dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm dark:text-gray-200">
                Modelos disponibles: {models.length}
              </span>
            </div>
            
            {models.length > 0 ? (
              <div className="space-y-1 mt-2">
                {models.map((model) => (
                  <div 
                    key={model.id} 
                    className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded"
                  >
                    <Cpu className="w-3 h-3 text-gray-500" />
                    <span className="dark:text-gray-300">{model.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">({model.scale}x)</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                ⚠️ No hay modelos disponibles. Ejecuta: python backend/setup.py
              </p>
            )}
          </div>
        )}

        {/* Error Help */}
        {backendStatus?.status === "error" && (
          <div className="pt-3 border-t dark:border-gray-700 text-xs space-y-1">
            <p className="dark:text-gray-300">💡 Para solucionar:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-2">
              <li>Abre terminal en la carpeta 'backend'</li>
              <li>Ejecuta: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">python main.py</code></li>
              <li>Verifica modelos: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">python check_models.py</code></li>
            </ol>
          </div>
        )}

        {/* Last Check */}
        {lastCheck && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
            Última verificación: {lastCheck.toLocaleTimeString()}
          </p>
        )}
      </div>
    </Card>
  );
}
