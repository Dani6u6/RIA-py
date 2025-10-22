#!/usr/bin/env node

/**
 * Script de post-instalación para rIA
 * Se ejecuta automáticamente después de npm install
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Definir __dirname en entorno ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🎨 Configurando rIA...\n');

// Verificar que los directorios necesarios existan
const directories = [
  'components',
  'components/ui',
  'styles',
  'utils',
  'electron'
];

let allGood = true;

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - No encontrado`);
    allGood = false;
  }
});

// Verificar archivos críticos
const criticalFiles = [
  'App.jsx',
  'main.jsx',
  'index.html',
  'vite.config.js',
  'styles/globals.css',
  'electron/main.js',
  'electron/preload.js'
];

console.log('\n📄 Verificando archivos críticos:\n');

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - No encontrado`);
    allGood = false;
  }
});

console.log('\n📦 Dependencias instaladas:\n');

// Verificar algunas dependencias clave
const keyDeps = [
  'react',
  'react-dom',
  'lucide-react',
  'sonner'
];

// Cargar package.json (en ESM usamos import dinámico)
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJsonData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

keyDeps.forEach(dep => {
  if (packageJsonData.dependencies[dep]) {
    console.log(`✅ ${dep} v${packageJsonData.dependencies[dep].replace('^', '')}`);
  } else {
    console.log(`❌ ${dep} - No instalado`);
  }
});

console.log('\n');

if (allGood) {
  console.log('✨ ¡Todo listo! Ahora puedes ejecutar:\n');
  console.log('   npm run dev          - Modo web (navegador)');
  console.log('   npm run electron-dev - Modo desktop (Electron)\n');
  console.log('📖 Lee INICIO_RAPIDO.md para más información\n');
} else {
  console.log('⚠️  Algunos archivos faltan. Verifica la instalación.\n');
  console.log('💡 Intenta clonar el repositorio nuevamente o verifica los archivos.\n');
}

console.log('━'.repeat(60));
console.log('🎯 rIA - Reescalado Inteligente de Imágenes');
console.log('━'.repeat(60) + '\n');
