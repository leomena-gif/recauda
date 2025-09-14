# Recauda - Crear Cuenta App

Una aplicación Next.js con TypeScript para crear cuentas en Recauda.

## Características

- ✅ Next.js 15 con App Router
- ✅ TypeScript para type safety
- ✅ CSS Modules para estilos encapsulados
- ✅ Formulario con validación en tiempo real
- ✅ Diseño responsive
- ✅ Accesibilidad mejorada
- ✅ Animaciones suaves

## Estructura del Proyecto

```
src/
├── app/
│   ├── globals.css          # Estilos globales
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página principal
└── components/
    ├── Header.tsx           # Componente del header
    ├── Header.module.css    # Estilos del header
    ├── AccountForm.tsx      # Formulario de creación de cuenta
    └── AccountForm.module.css # Estilos del formulario
```

## Scripts Disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en modo producción
- `npm run lint` - Ejecuta el linter

## Tecnologías Utilizadas

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **CSS Modules** - Estilos encapsulados
- **React Hooks** - Manejo de estado

## Funcionalidades del Formulario

- Validación en tiempo real
- Estados de error visuales
- Campos requeridos
- Instrucciones específicas para el teléfono
- Animaciones de entrada

## Cómo Ejecutar

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

3. Abrir [http://localhost:3000](http://localhost:3000) en el navegador

## Construcción para Producción

```bash
npm run build
npm run start
```
