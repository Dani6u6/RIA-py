import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Database,
  Cpu,
  Terminal,
  Zap
} from "lucide-react";
import { checkBackendHealth, getAvailableModels } from "../utils/api";

export function BackendStatusDialog({ open, onOpenChange }) {
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
          message: "Backend conectado y funcionando correctamente",
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
    if (open) {
      checkStatus();
    }
  }, [open]);

  const getStatusIcon = () => {
    if (!backendStatus) return <AlertCircle className="w-6 h-6 text-gray-400" />;
    
    switch (backendStatus.status) {
      case "healthy":
        return <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />;
      case "error":
        return <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getStatusBadge = () => {
    if (!backendStatus) return <Badge variant="outline">Verificando...</Badge>;
    
    switch (backendStatus.status) {
      case "healthy":
        return <Badge className="bg-green-600">✓ Conectado</Badge>;
      case "error":
        return <Badge variant="destructive">✗ Desconectado</Badge>;
      default:
        return <Badge variant="outline">? Desconocido</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Server className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <DialogTitle>Estado del Backend</DialogTitle>
              <DialogDescription>
                Diagnóstico de Real-ESRGAN Backend
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
            {getStatusIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm dark:text-gray-200">
                  http://localhost:8000
                </span>
                {getStatusBadge()}
              </div>
              {backendStatus && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {backendStatus.message}
                </p>
              )}
              {lastCheck && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Última verificación: {lastCheck.toLocaleTimeString()}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkStatus}
              disabled={isChecking}
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Models Info */}
          {backendStatus?.status === "healthy" && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="text-gray-900 dark:text-white">
                  Modelos Disponibles ({models.length})
                </h4>
              </div>
              
              {models.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {models.map((model) => (
                    <div 
                      key={model.id} 
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div className="flex-1">
                        <p className="text-sm dark:text-gray-200">{model.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {model.description}
                        </p>
                      </div>
                      <Badge variant="outline">{model.scale}x</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    ⚠️ No hay modelos disponibles
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    Ejecuta: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">python backend/setup.py</code>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Performance Info */}
          {backendStatus?.status === "healthy" && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h4 className="text-gray-900 dark:text-white">
                  Configuración de Rendimiento
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Motor</p>
                  <p className="text-sm dark:text-gray-200">Vulkan (GPU)</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Timeout</p>
                  <p className="text-sm dark:text-gray-200">900s (15 min)</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Imagen Máx.</p>
                  <p className="text-sm dark:text-gray-200">4096px</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Formatos</p>
                  <p className="text-sm dark:text-gray-200">PNG, JPG, WebP</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Help */}
          {backendStatus?.status === "error" && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h4 className="text-gray-900 dark:text-white">
                  Solución de Problemas
                </h4>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-900 dark:text-red-300 mb-3">
                    💡 Pasos para iniciar el backend:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-red-800 dark:text-red-400">
                    <li>Abre una terminal en la carpeta del proyecto</li>
                    <li>Navega a la carpeta backend: <code className="bg-red-100 dark:bg-red-800 px-1 rounded">cd backend</code></li>
                    <li>Instala dependencias (primera vez): <code className="bg-red-100 dark:bg-red-800 px-1 rounded">pip install -r requirements.txt</code></li>
                    <li>Descarga modelos: <code className="bg-red-100 dark:bg-red-800 px-1 rounded">python setup.py</code></li>
                    <li>Inicia el servidor: <code className="bg-red-100 dark:bg-red-800 px-1 rounded">python main.py</code></li>
                  </ol>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-xs text-blue-900 dark:text-blue-300">
                    ℹ️ El servidor debe mostrar: <strong>"Uvicorn running on http://0.0.0.0:8000"</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Commands */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm text-gray-900 dark:text-white mb-3">
              Comandos Rápidos
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded">
                <code className="text-gray-600 dark:text-gray-400">cd backend && python main.py</code>
                <span className="text-gray-400">Iniciar backend</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded">
                <code className="text-gray-600 dark:text-gray-400">python check_models.py</code>
                <span className="text-gray-400">Verificar modelos</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded">
                <code className="text-gray-600 dark:text-gray-400">python setup.py</code>
                <span className="text-gray-400">Descargar modelos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t dark:border-gray-700">
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
