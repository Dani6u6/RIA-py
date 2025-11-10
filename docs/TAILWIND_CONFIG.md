# Configuración de Tailwind CSS v4.0

## ⚠️ Importante

Este proyecto usa **Tailwind CSS v4.0**, que tiene un enfoque diferente de configuración comparado con versiones anteriores.

## 🚫 NO necesitas `tailwind.config.js`

En Tailwind v4.0, **NO se usa el archivo `tailwind.config.js`** tradicional. Toda la configuración se hace directamente en el archivo CSS.

## ✅ Archivos de configuración

### 1. `postcss.config.js` (✅ Incluido)

Este es el único archivo de configuración necesario para que Vite procese Tailwind:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

### 2. `styles/globals.css` (✅ Incluido)

Toda la configuración de Tailwind v4.0 se hace aquí usando la directiva `@theme`:

- **Variables CSS personalizadas**: `:root` y `.dark`
- **Tokens de color**: Se definen con `--color-*` dentro de `@theme inline`
- **Radios**: `--radius-sm`, `--radius-md`, etc.
- **Tipografía**: Configuración base para h1, h2, p, etc.
- **Variantes personalizadas**: `@custom-variant dark`

## 📦 Dependencias necesarias

```json
{
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  }
}
```

## 🎨 Personalización del tema

Para personalizar colores, espaciado, etc., edita directamente `styles/globals.css`:

```css
@theme inline {
  --color-primary: #030213;
  --color-secondary: oklch(0.95 0.0058 264.53);
  /* etc. */
}
```

## 🌙 Modo oscuro

El modo oscuro está implementado con:

1. Variante personalizada: `@custom-variant dark (&:is(.dark *))`
2. Variables en `.dark { ... }`
3. Toggle en `App.jsx` que añade/quita la clase `.dark` al `documentElement`

## 📚 Recursos

- [Documentación de Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [Migración a v4.0](https://tailwindcss.com/docs/v4-beta)

## 🚀 Uso

Las clases de Tailwind funcionan exactamente igual que siempre:

```jsx
<div className="bg-primary text-white p-4 rounded-lg">
  Contenido
</div>
```

La diferencia es que los tokens (`primary`, `secondary`, etc.) se definen en CSS en lugar de en un archivo de configuración JS.
