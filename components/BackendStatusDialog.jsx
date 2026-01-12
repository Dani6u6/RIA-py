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
  <DialogContent className="sm:max-w-3xl lg:max-w-4xl">
    <DialogHeader>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
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
        <Button
          variant="outline"
          size="sm"
          onClick={checkStatus}
          disabled={isChecking}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Verificando...' : 'Verificar'}
        </Button>
      </div>
    </DialogHeader>

    <div className="space-y-6">
      {/* Header Row - Status + Models Count */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Connection Status - Ocupa 2/3 */}
        <div className="lg:col-span-2 flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-sm font-medium dark:text-gray-200 truncate">
                http://localhost:8000
              </span>
              {getStatusBadge()}
            </div>
            {backendStatus && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {backendStatus.message}
              </p>
            )}
            {lastCheck && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Última verificación: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Models Counter - Ocupa 1/3 */}
        {backendStatus?.status === "healthy" && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-gray-900 dark:text-white font-medium">Modelos</h4>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold dark:text-white">{models.length}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  disponibles
                </p>
              </div>
              {models.length === 0 && (
                <span className="text-xs text-yellow-600 dark:text-yellow-500">
                  ⚠️ Configurar
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Models List */}
        {backendStatus?.status === "healthy" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Modelos Disponibles
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {models.length} items
              </span>
            </div>
            
            {models.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {models.map((model) => (
                  <div 
                    key={model.id} 
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dark:text-gray-200 truncate">{model.name}</p>
                      {model.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                          {model.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">
                      {model.scale}x
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-500 mt-0.5">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      No hay modelos disponibles
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                      Ejecuta: <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-0.5 rounded">python backend/setup.py</code>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Info */}
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                Configuración de Rendimiento
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Motor</p>
                  <p className="text-sm font-medium dark:text-gray-200">Vulkan (GPU)</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Timeout</p>
                  <p className="text-sm font-medium dark:text-gray-200">900s (15 min)</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Imagen Máx.</p>
                  <p className="text-sm font-medium dark:text-gray-200">4096px</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Formatos</p>
                  <p className="text-sm font-medium dark:text-gray-200">PNG, JPG, WebP</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Columna Derecha: Error Help OR Quick Commands */}
        <div className="space-y-4">
          {backendStatus?.status === "error" ? (
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium flex items-center gap-2 mb-3">
                <Terminal className="w-5 h-5 text-red-600 dark:text-red-400" />
                Solución de Problemas
              </h4>
              
              <div className="space-y-3">
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm font-medium text-red-900 dark:text-red-300 mb-3">
                    💡 Pasos para iniciar el backend:
                  </p>
                  <div className="space-y-2">
                    {[
                      "Abre una terminal en la carpeta del proyecto",
                      "Navega a la carpeta backend: cd backend",
                      "Instala dependencias: pip install -r requirements.txt",
                      "Descarga modelos: python setup.py",
                      "Inicia el servidor: python main.py"
                    ].map((step, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-300 rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <p className="text-sm text-red-800 dark:text-red-400 flex-1">
                          {step.includes(": ") ? (
                            <>
                              {step.split(": ")[0]}:{" "}
                              <code className="bg-red-100 dark:bg-red-800 px-2 py-0.5 rounded text-xs">
                                {step.split(": ")[1]}
                              </code>
                            </>
                          ) : (
                            step
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    ℹ️ El servidor debe mostrar: <strong>"Uvicorn running on http://0.0.0.0:8000"</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Quick Commands - Siempre visible */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Comandos Rápidos
            </h4>
            <div className="space-y-2">
              {[
                { cmd: "cd backend && python main.py", desc: "Iniciar backend" },
                { cmd: "python check_models.py", desc: "Verificar modelos" },
                { cmd: "python setup.py", desc: "Descargar modelos" },
                { cmd: "python --version", desc: "Verificar Python" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <code className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                    {item.cmd}
                  </code>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Real-ESRGAN Backend v1.0.0
      </div>
      <Button onClick={() => onOpenChange(false)}>
        Cerrar
      </Button>
    </div>
  </DialogContent>
</Dialog>
  );
}
