# 🎨 Guía de Estilo - Recauda App

## 🎯 Objetivo
Mantener un código consistente, limpio y profesional en todo el proyecto.

## 📝 Convenciones de Código

### TypeScript

#### ✅ Hacer
```typescript
// Usar interfaces para objetos
interface User {
  id: string;
  name: string;
}

// Usar tipos para uniones y primitivos
type Status = 'active' | 'inactive';

// Nombres descriptivos
const isUserActive = user.status === 'active';
```

#### ❌ Evitar
```typescript
// No usar 'any'
const data: any = getData();

// No usar nombres cortos sin contexto
const u = getUser();
const st = 'active';
```

### React Components

#### ✅ Hacer
```typescript
// Agrupar imports lógicamente
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/models';
import { validateName } from '@/utils/validation';
import styles from './Component.module.css';

// Comentarios al inicio del componente
export default function UserProfile() {
  // State
  const [user, setUser] = useState<User | null>(null);
  
  // Hooks
  const router = useRouter();
  
  // Computed values
  const isActive = user?.status === 'active';
  
  // Event handlers
  const handleClick = useCallback(() => {
    // ...
  }, []);
  
  // Render
  return <div>{/* ... */}</div>;
}
```

#### ❌ Evitar
```typescript
// No mezclar lógica con JSX
export default function UserProfile() {
  const user = useState(null);
  return <div onClick={() => {
    // Mucha lógica aquí
    setUser({});
    router.push('/');
  }}>Click</div>;
}
```

### Hooks Personalizados

```typescript
// Siempre empezar con 'use'
export function useCustomHook() {
  // Lógica del hook
  return { value, setValue };
}
```

### Constantes

```typescript
// UPPER_SNAKE_CASE para constantes
export const MAX_RETRIES = 3;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 'as const' para objetos inmutables
export const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
] as const;
```

## 🎨 CSS Modules

### ✅ Hacer
```css
/* Nombres descriptivos en camelCase */
.userProfile {
  display: flex;
  flex-direction: column;
}

/* Agrupar propiedades relacionadas */
.button {
  /* Layout */
  display: flex;
  padding: 12px 24px;
  
  /* Visual */
  background: #007AFF;
  border-radius: 8px;
  
  /* Typography */
  font-size: 16px;
  font-weight: 600;
  
  /* Animation */
  transition: all 0.3s ease;
}

/* Mobile-first approach */
.container {
  padding: 16px;
}

@media (min-width: 768px) {
  .container {
    padding: 32px;
  }
}
```

## 🔘 Sistema de Botones

Usamos un sistema de 3 niveles de botones con clases globales de utilidad.

### Botón Principal
```tsx
// Color azul sólido - Para acciones principales
<button className="btn btn-primary">
  Agregar vendedor
</button>
```

### Botón Secundario (Quiet)
```tsx
// Texto azul sin borde ni fondo - Para acciones secundarias sutiles
<button className="btn btn-secondary">
  Cancelar
</button>
```

### Botón Terciario (Outline)
```tsx
// Outline azul con fondo transparente - Para acciones alternativas
<button className="btn btn-tertiary">
  Ir al detalle
</button>
```

### Tamaños
```tsx
// Pequeño
<button className="btn btn-primary btn-sm">Pequeño</button>

// Mediano (default)
<button className="btn btn-primary btn-md">Mediano</button>

// Grande
<button className="btn btn-primary btn-lg">Grande</button>
```

### Ancho completo
```tsx
<button className="btn btn-primary btn-full">
  Botón de ancho completo
</button>
```

### Con icono
```tsx
<button className="btn btn-primary btn-icon">
  <svg>...</svg>
  Agregar vendedor
</button>
```

### Jerarquía Visual
1. **Principal**: Usa para la acción más importante en la pantalla
2. **Secundario**: Usa para acciones de menor prioridad o cancelar
3. **Terciario**: Usa para acciones alternativas o navegación

### ❌ Evitar
```css
/* No usar !important sin necesidad */
.button {
  color: red !important;
}

/* No usar px fijos para todo */
.container {
  width: 1200px;
}

/* No usar nombres cortos */
.btn {
  padding: 10px;
}
```

## 🔧 Utilidades y Helpers

### Validación
```typescript
// Funciones puras que retornan string | undefined
export const validateName = (name: string): string | undefined => {
  if (!name.trim()) return 'Campo requerido';
  if (name.length < 2) return 'Mínimo 2 caracteres';
  return undefined;
};
```

### Formateo
```typescript
// Funciones puras de transformación
export const formatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount);
};
```

## 📁 Estructura de Archivos

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.css
├── ComponentName.test.tsx (futuro)
└── index.ts (re-export si es necesario)
```

## 🎯 Performance

### useMemo
```typescript
// Para cálculos costosos o filtros complejos
const filteredData = useMemo(() => {
  return data.filter(item => item.status === status);
}, [data, status]);
```

### useCallback
```typescript
// Para funciones pasadas como props
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

### Dynamic Imports
```typescript
// Para componentes pesados
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false
});
```

## 🚫 Anti-Patrones

### ❌ Props Drilling
```typescript
// No pasar props a través de muchos niveles
<Parent user={user}>
  <Child user={user}>
    <GrandChild user={user} />
  </Child>
</Parent>
```

**Solución**: Usar Context API o state management

### ❌ Inline Styles
```typescript
// Evitar styles inline
<div style={{ padding: '10px', margin: '20px' }}>
```

**Solución**: Usar CSS Modules

### ❌ Magic Numbers
```typescript
// No usar números sin contexto
setTimeout(() => {}, 3000);
```

**Solución**: Usar constantes
```typescript
const TIMEOUT_DURATION = 3000;
setTimeout(() => {}, TIMEOUT_DURATION);
```

## ✅ Checklist Pre-Commit

- [ ] No hay errores de TypeScript
- [ ] No hay console.log olvidados
- [ ] Los nombres son descriptivos
- [ ] Se usan las utilidades compartidas
- [ ] El código está formateado
- [ ] Se agregaron comentarios donde sea necesario
- [ ] Se probó en navegador

## 📚 Referencias

- [React Best Practices](https://react.dev/learn)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Next.js Best Practices](https://nextjs.org/docs/pages/building-your-application/routing/custom-app)

