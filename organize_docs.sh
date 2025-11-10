#!/bin/bash

echo "📚 Organizando documentación en /docs/"
echo ""

# Crear carpetas
echo "📁 Creando estructura de carpetas..."
mkdir -p docs/backend
mkdir -p docs/backend-example

# Mover archivos de raíz a /docs/
echo ""
echo "📁 Moviendo archivos de raíz a /docs/..."
files_moved=0

for file in BACKEND_COMPLETO.md BACKEND_SETUP.md CAMBIOS_RECIENTES.md \
            CAMBIOS_TYPESCRIPT_A_JAVASCRIPT.md CHECKLIST.md \
            CONFIGURACION_COMPLETA.md DIAGNOSTICO_BACKEND.md \
            ELECTRON_PYTHON_SETUP.md INICIO_RAPIDO.md INSTALACION.md \
            INTEGRATION.md INTERFAZ_COMPACTADA.md LAYOUT_RESPONSIVO.md \
            MEJORAS_IMAGE_COMPARISON.md RESUMEN_PROYECTO.md \
            SOLUCION_MODELO_GENERAL.md TAILWIND_CONFIG.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/
        echo "   ✅ $file → docs/"
        ((files_moved++))
    else
        echo "   ⏭️  $file (ya movido o no existe)"
    fi
done

# Copiar archivos de backend/ a /docs/backend/
echo ""
echo "📁 Copiando archivos de backend/ a /docs/backend/..."
files_copied=0

for file in backend/COMANDOS_RAPIDOS.md backend/INICIO_RAPIDO.md \
            backend/MODELOS.md backend/README.md; do
    if [ -f "$file" ]; then
        cp "$file" "docs/$(basename "$(dirname "$file")")/"
        echo "   ✅ $file → docs/backend/"
        ((files_copied++))
    else
        echo "   ⏭️  $file (no existe)"
    fi
done

# Copiar archivos de backend-example/ a /docs/backend-example/
echo ""
echo "📁 Copiando archivos de backend-example/ a /docs/backend-example/..."

if [ -f "backend-example/README.md" ]; then
    cp backend-example/README.md docs/backend-example/
    echo "   ✅ backend-example/README.md → docs/backend-example/"
    ((files_copied++))
else
    echo "   ⏭️  backend-example/README.md (no existe)"
fi

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ¡Documentación organizada!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Resumen:"
echo "   • $files_moved archivos movidos de raíz a docs/"
echo "   • $files_copied archivos copiados a subdirectorios"
echo ""
echo "📂 Estructura creada:"
echo "   docs/"
echo "   ├── README.md (índice)"
echo "   ├── INSTRUCCIONES_ORGANIZACION.md"
echo "   ├── AUMENTAR_TIMEOUT.md"
echo "   ├── Attributions.md"
echo "   ├── *.md ($files_moved archivos)"
echo "   ├── backend/"
echo "   │   ├── README.md"
echo "   │   ├── INICIO_RAPIDO.md"
echo "   │   ├── MODELOS.md"
echo "   │   └── COMANDOS_RAPIDOS.md"
echo "   └── backend-example/"
echo "       └── README.md"
echo ""
echo "💡 Notas:"
echo "   • Los archivos .md del backend se mantienen también en backend/"
echo "   • README.md principal ya apunta a /docs/"
echo "   • Consulta docs/README.md para el índice completo"
echo ""
echo "✨ ¡Listo para usar!"
