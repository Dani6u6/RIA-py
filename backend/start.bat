@echo off
REM Script de inicio rápido para el backend de rIA
REM Compatible con Windows

echo ==================================
echo   rIA Backend - Inicio Rapido
echo ==================================
echo.

REM Verificar que Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python no esta instalado
    echo Instala Python 3.8 o superior desde python.org
    pause
    exit /b 1
)

echo Verificado: Python instalado
echo.

REM Verificar si las dependencias están instaladas
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo Dependencias no instaladas
    echo Instalando dependencias...
    pip install -r requirements.txt
    
    if errorlevel 1 (
        echo Error al instalar dependencias
        pause
        exit /b 1
    )
    echo Dependencias instaladas correctamente
    echo.
)

REM Verificar setup completo
echo Verificando configuracion...
python verify_setup.py >nul 2>&1

if errorlevel 1 (
    echo Configuracion incompleta. Ejecutando verificacion detallada...
    echo.
    python verify_setup.py
    
    echo.
    set /p ejecutar_setup="Ejecutar setup automatico? (s/n): "
    
    if /i "%ejecutar_setup%"=="s" (
        python setup.py
        
        if errorlevel 1 (
            echo Error en el setup
            pause
            exit /b 1
        )
    ) else (
        echo Setup cancelado. Completa el setup manualmente.
        pause
        exit /b 1
    )
    echo.
)

REM Iniciar el servidor
echo ==================================
echo   Iniciando servidor...
echo ==================================
echo.
echo Servidor corriendo en: http://localhost:8000
echo Documentacion API: http://localhost:8000/docs
echo Presiona Ctrl+C para detener
echo.

python main.py
pause
