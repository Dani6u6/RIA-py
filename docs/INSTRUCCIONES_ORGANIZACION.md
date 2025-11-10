# 📋 Instrucciones para Organizar la Documentación

## ✅ Ya Completado

- ✅ Creada carpeta `/docs/`
- ✅ Creado índice `/docs/README.md`
- ✅ Movido `/docs/AUMENTAR_TIMEOUT.md`
- ✅ Copiado `/docs/Attributions.md` (original es protegido)
- ✅ Actualizado `/README.md` principal con referencias a `/docs/`

---

## 📦 Archivos a Mover Manualmente

### Desde Raíz `/` a `/docs/`

Mueve estos archivos de la raíz del proyecto a `/docs/`:

```bash
# En la raíz del proyecto
mv BACKEND_COMPLETO.md docs/
mv BACKEND_SETUP.md docs/
mv CAMBIOS_RECIENTES.md docs/
mv CAMBIOS_TYPESCRIPT_A_JAVASCRIPT.md docs/
mv CHECKLIST.md docs/
mv CONFIGURACION_COMPLETA.md docs/
mv DIAGNOSTICO_BACKEND.md docs/
mv ELECTRON_PYTHON_SETUP.md docs/
mv INICIO_RAPIDO.md docs/
mv INSTALACION.md docs/
mv INTEGRATION.md docs/
mv INTERFAZ_COMPACTADA.md docs/
mv LAYOUT_RESPONSIVO.md docs/
mv MEJORAS_IMAGE_COMPARISON.md docs/
mv RESUMEN_PROYECTO.md docs/
mv SOLUCION_MODELO_GENERAL.md docs/
mv TAILWIND_CONFIG.md docs/
```

### Desde `/backend/` a `/docs/backend/`

Primero crea la carpeta:
```bash
mkdir -p docs/backend
```

Luego mueve estos archivos:
```bash
# Desde la raíz del proyecto
cp backend/COMANDOS_RAPIDOS.md docs/backend/
cp backend/INICIO_RAPIDO.md docs/backend/
cp backend/MODELOS.md docs/backend/
cp backend/README.md docs/backend/
```

**NOTA:** Usa `cp` (copiar) en lugar de `mv` (mover) para los archivos del backend, ya que pueden ser útiles mantenerlos también en `/backend/` para referencia cuando trabajas ahí.

### Desde `/backend-example/` a `/docs/backend-example/`

```bash
# Crear carpeta
mkdir -p docs/backend-example

# Copiar README
cp backend-example/README.md docs/backend-example/
```

---

## 🗂️ Estructura Final

Después de mover los archivos, tu estructura será:

```
/
├── README.md                              # ✅ Actualizado (apunta a /docs/)
├── docs/                                  # 📚 TODA LA DOCUMENTACIÓN
│   ├── README.md                          # ✅ Índice de docs
│   │
│   ├── AUMENTAR_TIMEOUT.md                # ✅ Ya movido
│   ├── Attributions.md                    # ✅ Ya copiado
│   ├── BACKEND_COMPLETO.md                # ⏳ Mover
│   ├── BACKEND_SETUP.md                   # ⏳ Mover
│   ├── CAMBIOS_RECIENTES.md               # ⏳ Mover
│   ├── CAMBIOS_TYPESCRIPT_A_JAVASCRIPT.md # ⏳ Mover
│   ├── CHECKLIST.md                       # ⏳ Mover
│   ├── CONFIGURACION_COMPLETA.md          # ⏳ Mover
│   ├── DIAGNOSTICO_BACKEND.md             # ⏳ Mover
│   ├── ELECTRON_PYTHON_SETUP.md           # ⏳ Mover
│   ├── INICIO_RAPIDO.md                   # ⏳ Mover
│   ├── INSTALACION.md                     # ⏳ Mover
│   ├── INTEGRATION.md                     # ⏳ Mover
│   ├── INTERFAZ_COMPACTADA.md             # ⏳ Mover
│   ├── LAYOUT_RESPONSIVO.md               # ⏳ Mover
│   ├── MEJORAS_IMAGE_COMPARISON.md        # ⏳ Mover
│   ├── RESUMEN_PROYECTO.md                # ⏳ Mover
│   ├── SOLUCION_MODELO_GENERAL.md         # ⏳ Mover
│   ├── TAILWIND_CONFIG.md                 # ⏳ Mover
│   │
│   ├── backend/                           # Docs del backend
│   │   ├── README.md                      # ⏳ Copiar
│   │   ├── INICIO_RAPIDO.md               # ⏳ Copiar
│   │   ├── MODELOS.md                     # ⏳ Copiar
│   │   └── COMANDOS_RAPIDOS.md            # ⏳ Copiar
│   │
│   └── backend-example/                   # Docs del ejemplo
│       └── README.md                      # ⏳ Copiar
│
├── backend/                               # Código del backend
│   ├── main.py
│   ├── config.py
│   ├── upscale_service.py
│   ├── setup.py
│   ├── requirements.txt
│   ├── COMANDOS_RAPIDOS.md                # 📌 Mantener (referencia local)
│   ├── INICIO_RAPIDO.md                   # 📌 Mantener (referencia local)
│   ├── MODELOS.md                         # 📌 Mantener (referencia local)
│   ├── README.md                          # 📌 Mantener (referencia local)
│   └── ...
│
├── backend-example/                       # Código del ejemplo
│   ├── main.py
│   ├── requirements.txt
│   └── README.md                          # 📌 Mantener (referencia local)
│
├── components/                            # Componentes React
├── electron/                              # Electron
├── styles/                                # Estilos
├── utils/                                 # Utilidades
├── guidelines/                            # Guidelines
│   └── Guidelines.md                      # 📌 Mantener (no es doc del proyecto)
├── App.jsx
├── main.jsx
└── package.json
```

---

## 🚀 Script de Bash (Opcional)

Si quieres automatizar todo, copia y pega este script:

```bash
#!/bin/bash

echo "📚 Organizando documentación en /docs/"

# Crear carpetas
mkdir -p docs/backend
mkdir -p docs/backend-example

# Mover archivos de raíz a /docs/
echo "📁 Moviendo archivos de raíz..."
mv BACKEND_COMPLETO.md docs/ 2>/dev/null
mv BACKEND_SETUP.md docs/ 2>/dev/null
mv CAMBIOS_RECIENTES.md docs/ 2>/dev/null
mv CAMBIOS_TYPESCRIPT_A_JAVASCRIPT.md docs/ 2>/dev/null
mv CHECKLIST.md docs/ 2>/dev/null
mv CONFIGURACION_COMPLETA.md docs/ 2>/dev/null
mv DIAGNOSTICO_BACKEND.md docs/ 2>/dev/null
mv ELECTRON_PYTHON_SETUP.md docs/ 2>/dev/null
mv INICIO_RAPIDO.md docs/ 2>/dev/null
mv INSTALACION.md docs/ 2>/dev/null
mv INTEGRATION.md docs/ 2>/dev/null
mv INTERFAZ_COMPACTADA.md docs/ 2>/dev/null
mv LAYOUT_RESPONSIVO.md docs/ 2>/dev/null
mv MEJORAS_IMAGE_COMPARISON.md docs/ 2>/dev/null
mv RESUMEN_PROYECTO.md docs/ 2>/dev/null
mv SOLUCION_MODELO_GENERAL.md docs/ 2>/dev/null
mv TAILWIND_CONFIG.md docs/ 2>/dev/null

# Copiar archivos de backend/ a /docs/backend/
echo "📁 Copiando archivos de backend..."
cp backend/COMANDOS_RAPIDOS.md docs/backend/
cp backend/INICIO_RAPIDO.md docs/backend/
cp backend/MODELOS.md docs/backend/
cp backend/README.md docs/backend/

# Copiar archivos de backend-example/ a /docs/backend-example/
echo "📁 Copiando archivos de backend-example..."
cp backend-example/README.md docs/backend-example/

echo "✅ ¡Documentación organizada!"
echo ""
echo "📂 Estructura creada:"
echo "   docs/"
echo "   ├── README.md (índice)"
echo "   ├── *.md (17 archivos)"
echo "   ├── backend/ (4 archivos)"
echo "   └── backend-example/ (1 archivo)"
echo ""
echo "💡 Recuerda: Los archivos .md en backend/ se mantienen como referencia local"
```

Guárdalo como `organize_docs.sh`, dale permisos y ejecútalo:

```bash
chmod +x organize_docs.sh
./organize_docs.sh
```

---

## 🔍 Verificación

Después de mover, verifica que todo está en su lugar:

```bash
# Ver estructura de docs/
tree docs/

# O con ls
ls -R docs/

# Debería mostrar:
# docs/
# docs/backend/
# docs/backend-example/
# + 17 archivos .md en docs/
# + 4 archivos .md en docs/backend/
# + 1 archivo .md en docs/backend-example/
```

---

## ❓ Preguntas Frecuentes

### ¿Por qué copiar (cp) en lugar de mover (mv) los archivos del backend?

Los archivos .md en `/backend/` son útiles para desarrolladores que trabajan directamente en esa carpeta. Mantenerlos ahí permite acceso rápido sin salir del contexto.

### ¿Qué pasa con Attributions.md?

Es un archivo protegido del sistema, se copió a `/docs/` pero el original se mantiene en la raíz.

### ¿Y Guidelines.md?

Se mantiene en `/guidelines/` porque es parte del flujo de trabajo de desarrollo, no documentación del proyecto.

### ¿Puedo eliminar los .md de la raíz después de moverlos?

¡Sí! Después de verificar que funcionan bien en `/docs/`, puedes eliminarlos.

### ¿Necesito actualizar las referencias internas?

El nuevo `/README.md` ya tiene referencias actualizadas. Si encuentras enlaces rotos en otros archivos .md, actualiza las rutas:

```markdown
# Antes
[Backend Setup](BACKEND_SETUP.md)

# Ahora
[Backend Setup](docs/BACKEND_SETUP.md)

# O si estás dentro de /docs/
[Backend Setup](BACKEND_SETUP.md)
```

---

## ✅ Checklist

- [ ] Ejecutado el script de bash O movido archivos manualmente
- [ ] Creadas carpetas `docs/backend/` y `docs/backend-example/`
- [ ] Movidos 17 archivos .md a `/docs/`
- [ ] Copiados 4 archivos .md a `/docs/backend/`
- [ ] Copiado 1 archivo .md a `/docs/backend-example/`
- [ ] Verificada estructura con `ls -R docs/`
- [ ] Probado que `/docs/README.md` funciona correctamente
- [ ] Actualizado README principal apunta a `/docs/`
- [ ] (Opcional) Eliminados archivos .md de la raíz después de verificar

---

**¡Listo!** Toda tu documentación ahora está organizada en `/docs/` 📚
