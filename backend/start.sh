#!/bin/bash

# Script de inicio rápido para el backend de rIA
# Compatible con Linux y macOS

echo "=================================="
echo "  rIA Backend - Inicio Rápido"
echo "=================================="
echo ""

# Verificar que Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 no está instalado"
    echo "Instala Python 3.8 o superior"
    exit 1
fi

echo "✓ Python encontrado: $(python3 --version)"
echo ""

# Verificar si las dependencias están instaladas
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "⚠️  Dependencias no instaladas"
    echo "Instalando dependencias..."
    pip3 install -r requirements.txt
    
    if [ $? -ne 0 ]; then
        echo "❌ Error al instalar dependencias"
        exit 1
    fi
    echo "✓ Dependencias instaladas"
    echo ""
fi

# Verificar si el binario de Real-ESRGAN existe
BINARY_FILE="binaries/realesrgan-ncnn-vulkan"
if [[ "$OSTYPE" == "darwin"* ]]; then
    BINARY_FILE="binaries/realesrgan-ncnn-vulkan"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    BINARY_FILE="binaries/realesrgan-ncnn-vulkan.exe"
fi

if [ ! -f "$BINARY_FILE" ]; then
    echo "⚠️  Binario de Real-ESRGAN no encontrado"
    echo "Ejecutando setup..."
    python3 setup.py
    
    if [ $? -ne 0 ]; then
        echo "❌ Error en el setup"
        exit 1
    fi
    echo ""
fi

# Iniciar el servidor
echo "=================================="
echo "  Iniciando servidor..."
echo "=================================="
echo ""
echo "Servidor corriendo en: http://localhost:8000"
echo "Documentación API: http://localhost:8000/docs"
echo "Presiona Ctrl+C para detener"
echo ""

python3 main.py
