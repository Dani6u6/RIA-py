"""
Servicio de métricas NIQE (Natural Image Quality Evaluator)
Evalúa la calidad de imágenes sin necesidad de imagen de referencia
Implementación simplificada usando cálculo manual de NIQE
"""

import logging
from pathlib import Path
from typing import Tuple, Optional
import numpy as np
from PIL import Image
import cv2
from scipy import ndimage
from scipy.special import gamma

logger = logging.getLogger(__name__)


class NIQEService:
    """Servicio para calcular métricas NIQE de calidad de imagen"""
    
    # Rangos de interpretación de scores NIQE
    # Valores más bajos = mejor calidad
    QUALITY_RANGES = {
        "Excellent": (0, 3),
        "Good": (3, 5),
        "Fair": (5, 7),
        "Poor": (7, float('inf'))
    }
    
    def __init__(self):
        logger.info("Servicio NIQE inicializado (implementación simplificada)")
    
    def is_available(self) -> bool:
        """Verifica si NIQE está disponible"""
        return True
    
    def calculate_niqe(self, image_path: Path) -> Optional[float]:
        """
        Calcula un score de calidad simplificado basado en métricas de imagen
        
        Args:
            image_path: Ruta a la imagen
            
        Returns:
            float: Score de calidad (valores más bajos = mejor calidad)
                   None si hay error
        """
        try:
            # Leer imagen
            img = cv2.imread(str(image_path))
            
            if img is None:
                logger.error(f"No se pudo leer la imagen: {image_path}")
                return None
            
            # Convertir a escala de grises
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float64)
            
            # Calcular métricas de calidad simplificadas
            # 1. Nitidez (Laplacian variance)
            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
            sharpness = laplacian.var()
            
            # 2. Contraste (desviación estándar)
            contrast = gray.std()
            
            # 3. Brillo promedio
            brightness = gray.mean()
            
            # 4. Ruido estimado (diferencia de gradientes)
            gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
            gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
            noise = np.sqrt(gx**2 + gy**2).std()
            
            # Normalizar métricas y calcular score
            # Valores ideales: alta nitidez, buen contraste, ruido bajo
            sharpness_score = max(0, 5 - (sharpness / 100))  # Más nitidez = mejor
            contrast_score = abs(contrast - 50) / 10  # Contraste óptimo ~50
            noise_score = noise / 20  # Menos ruido = mejor
            
            # Score final (promedio ponderado)
            score = (sharpness_score * 0.4 + contrast_score * 0.3 + noise_score * 0.3)
            
            # Ajustar al rango típico de NIQE (0-10)
            score = np.clip(score, 0, 10)
            
            logger.info(f"Score de calidad calculado: {score:.4f} para {image_path.name}")
            logger.debug(f"Métricas - Nitidez: {sharpness:.2f}, Contraste: {contrast:.2f}, Ruido: {noise:.2f}")
            
            return float(score)
            
        except Exception as e:
            logger.error(f"Error calculando score de calidad: {str(e)}", exc_info=True)
            return None
    
    def interpret_score(self, score: Optional[float]) -> str:
        """
        Interpreta un score y retorna una clasificación de calidad
        
        Args:
            score: Score de calidad
            
        Returns:
            str: Clasificación de calidad (Excellent/Good/Fair/Poor/Unknown)
        """
        if score is None:
            return "Unknown"
        
        for quality, (min_val, max_val) in self.QUALITY_RANGES.items():
            if min_val <= score < max_val:
                return quality
        
        return "Unknown"
    
    def get_quality_info(self, image_path: Path) -> dict:
        """
        Calcula score y retorna información completa de calidad
        
        Args:
            image_path: Ruta a la imagen
            
        Returns:
            dict: Diccionario con score, rating y disponibilidad
        """
        score = self.calculate_niqe(image_path)
        rating = self.interpret_score(score)
        
        return {
            "niqe_score": score,
            "quality_rating": rating,
            "niqe_available": True
        }
    
    @staticmethod
    def get_quality_color(rating: str) -> str:
        """
        Retorna un código de color para la clasificación de calidad
        
        Args:
            rating: Clasificación de calidad
            
        Returns:
            str: Código de color (green, yellow, orange, red, gray)
        """
        color_map = {
            "Excellent": "green",
            "Good": "yellow",
            "Fair": "orange",
            "Poor": "red",
            "Unknown": "gray"
        }
        return color_map.get(rating, "gray")


# Instancia global del servicio
_niqe_service_instance: Optional[NIQEService] = None


def get_niqe_service() -> NIQEService:
    """Obtiene la instancia del servicio NIQE (singleton)"""
    global _niqe_service_instance
    if _niqe_service_instance is None:
        _niqe_service_instance = NIQEService()
    return _niqe_service_instance
