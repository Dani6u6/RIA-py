import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import LogoRia from "./img/logoria2.svg";

const onboardingSteps = [
  {
    title: "¡Bienvenido a rIA!",
    description: "Tu herramienta de reescalado inteligente de imágenes con IA",
    isLogo: true, // Usar logo en vez de imagen
    content:
      "rIA utiliza Real-ESRGAN para mejorar y reescalar imágenes con tecnología de inteligencia artificial de última generación.",
    color: "from-blue-500 to-purple-600",
  },
  {
    title: "1. Carga tu imagen",
    description: "Arrastra y suelta o haz clic para seleccionar",
    image: "/components/img/subir.png",
    content:
      "Acepta formatos PNG, JPG, WEBP y más. Simplemente arrastra tu imagen al área de carga o haz clic para seleccionar desde tu computadora.",
    color: "from-green-500 to-teal-600",
  },
  {
    title: "2. Configura el reescalado",
    description: "Elige el modelo y parámetros",
    image: "/components/img/config.png",
    content:
      "Selecciona entre modelos General Purpose, Anime & Arte, o especializados. Ajusta el factor de escala (2x-4x) y la reducción de ruido según tus necesidades.",
    color: "from-orange-500 to-red-600",
  },
  {
    title: "3. Procesa con IA",
    description: "Backend Real-ESRGAN o simulación local",
    image: "/components/img/modo.png",
    content:
      "Activa el modo Backend Real para usar Real-ESRGAN con Vulkan (requiere backend activo). O usa la simulación local del navegador para una vista previa rápida.",
    color: "from-yellow-500 to-orange-600",
  },
  {
    title: "4. Compara y descarga",
    description: "Desliza para ver antes y después",
    image: "/components/img/compara.png",
    content:
      "Usa el comparador interactivo para ver la diferencia. Ajusta el zoom y descarga tu imagen mejorada cuando estés satisfecho con el resultado.",
    color: "from-pink-500 to-purple-600",
  },
];

export function Onboarding({ open, onOpenChange }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    setCurrentStep(0);
  };

  const step = onboardingSteps[currentStep];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Tutorial de rIA</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-6 w-6"
            >
              
            </Button>
          </DialogTitle>
          <DialogDescription>
            Aprende a usar rIA en {onboardingSteps.length} pasos simples
          </DialogDescription>
        </DialogHeader>

        <div className="relative overflow-hidden min-h-[500px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
            >
              {/* Screenshot/Image o Logo */}
              {step.isLogo ? (
                <div className="w-48 h-48 mb-6 flex items-center justify-center">
                  <img
                    src={LogoRia}
                    alt="rIA Logo"
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
              ) : (
                <div className="w-full max-w-md h-64 mb-6 rounded-lg overflow-hidden shadow-lg">
                  <ImageWithFallback
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-fill"
                  />
                </div>
              )}

              {/* Content */}
              <h3 className="text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {step.description}
              </p>
              <p className="text-gray-700 dark:text-gray-300 max-w-md">
                {step.content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-2 py-4">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentStep ? 1 : -1);
                setCurrentStep(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-8 bg-blue-600 dark:bg-blue-500"
                  : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
              aria-label={`Ir al paso ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <Button variant="ghost" onClick={handleSkip}>
            Saltar tutorial
          </Button>

          {currentStep < onboardingSteps.length - 1 ? (
            <Button onClick={handleNext}>
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSkip} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              ¡Empezar!
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
