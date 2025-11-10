import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Cpu, Zap, Github, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import LogoRia from "./img/logoria2.svg";

export function AboutDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <img src={LogoRia} alt="rIA Logo" className="w-12 h-12 rounded-lg" />
            <div>
              <DialogTitle>rIA - Reescalado Inteligente</DialogTitle>
              <DialogDescription>
                Versión 1.0.0
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              rIA es una aplicación de escritorio para reescalar imágenes usando
              inteligencia artificial. Utiliza Real-ESRGAN con Vulkan para
              proporcionar resultados de alta calidad sin necesidad de
              dependencias pesadas como PyTorch.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-gray-900 dark:text-white mb-3">
              Características principales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <img src={LogoRia} alt="AI Icon" className="w-5 h-5 mt-0.5 rounded" />
                <div>
                  <p className="text-sm dark:text-gray-200">Modelos de IA múltiples</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    General, Anime, Video
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Cpu className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm dark:text-gray-200">Aceleración Vulkan</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Compatibilidad universal
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm dark:text-gray-200">Procesamiento rápido</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Optimizado para rendimiento
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <ExternalLink className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm dark:text-gray-200">Interfaz intuitiva</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Material Design
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div>
            <h4 className="text-gray-900 dark:text-white mb-3">
              Tecnologías
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">React</Badge>
              <Badge variant="outline">Electron</Badge>
              <Badge variant="outline">Tailwind CSS</Badge>
              <Badge variant="outline">FastAPI</Badge>
              <Badge variant="outline">Python</Badge>
              <Badge variant="outline">Real-ESRGAN</Badge>
              <Badge variant="outline">Vulkan</Badge>
            </div>
          </div>

          {/* Backend Info */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h4 className="text-blue-900 dark:text-blue-300 mb-2">
              Acerca del Backend
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
              Para usar las capacidades completas de IA con Real-ESRGAN, necesitas
              ejecutar el backend de Python/FastAPI. La aplicación también puede
              funcionar en modo simulación para demostración.
            </p>
            <div className="flex gap-2">
              <Badge className="bg-blue-600 dark:bg-blue-700">
                Backend: FastAPI + Python
              </Badge>
              <Badge className="bg-purple-600 dark:bg-purple-700">
                Motor IA: Real-ESRGAN (Vulkan)
              </Badge>
            </div>
          </div>

          {/* Credits */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4 border-t dark:border-gray-700">
            <p>
              Desarrollado con ❤️ usando tecnologías de código abierto
            </p>
            <p className="mt-1">
              Real-ESRGAN por xinntao • Shadcn UI • Radix UI • Lucide Icons
            </p>
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
