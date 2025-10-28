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

# Verificar setup completo
echo "Verificando configuración..."
python3 verify_setup.py > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "⚠️  Setup incompleto. Ejecutando verificación detallada..."
    echo ""
    python3 verify_setup.py
    
    echo ""
    read -p "¿Ejecutar setup automático? (s/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        python3 setup.py
        
        if [ $? -ne 0 ]; then
            echo "❌ Error en el setup"
            exit 1
        fi
    else
        echo "❌ Setup cancelado. Completa el setup manualmente."
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
