# 🎯 Recauda App

Una aplicación profesional de gestión de eventos y vendedores construida con Next.js 15, TypeScript y las mejores prácticas de desarrollo.

## ✨ Características Principales

### 🎫 Gestión de Eventos
- Creación de eventos (Rifas y Ventas de Comida)
- Asignación de números
- Seguimiento de ventas en tiempo real
- Estados de eventos (Activo, Inactivo, Completado)

### 👥 Gestión de Vendedores
- Lista de vendedores con búsqueda y filtros
- Edición inline de información
- Asignación rápida a eventos activos
- Estado de vendedores (Activo/Inactivo)

### 🎨 Experiencia de Usuario
- **Interfaz moderna y responsive**
- **Animaciones suaves** con transiciones CSS
- **Feedback visual** con snackbars y estados hover
- **Sin modales innecesarios** - Flujo inline optimizado
- **Mobile-first design**

## 🏗️ Arquitectura

### Stack Tecnológico
- ⚡ **Next.js 15** - App Router con SSR
- 🔷 **TypeScript** - Type safety completo
- 🎨 **CSS Modules** - Estilos encapsulados
- 🪝 **React Hooks** - State management moderno
- 📦 **Modular Architecture** - Código reutilizable

### Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── sellers-list/      # Gestión de vendedores
│   ├── create-event/      # Creación de eventos
│   └── add-seller/        # Agregar vendedor
├── components/            # Componentes reutilizables
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── wizard/           # Componentes wizard
├── types/                # TypeScript types
│   └── models.ts         # Modelos de datos
├── constants/            # Constantes
│   └── index.ts          # Config centralizada
├── utils/                # Utilidades
│   └── validation.ts     # Validaciones
├── hooks/                # Custom hooks
│   └── useSnackbar.ts    # Hook de notificaciones
└── mocks/                # Datos de prueba
    └── data.ts           # Mock data
```

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone [repository-url]

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir http://localhost:3000
```

### Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run start     # Servidor de producción
npm run lint      # Ejecutar linter
```

### Ver desarrollo en localhost

1. **Recomendado** (libera puerto 3000, borra caché y arranca limpio):
   ```bash
   npm run dev:fresh
   ```
2. **O solo arrancar** (si el puerto está libre):
   ```bash
   npm run dev
   ```
3. Abre **http://localhost:3000** en el navegador.

### Localhost no funciona

- **`EADDRINUSE`** o **puerto 3000 ocupado**: ejecuta `npm run dev:fresh`. Mata el proceso en 3000, borra `.next` y vuelve a iniciar.
- **`Cannot find module './51.js'`** u otros errores raros de módulos: caché corrupta. Ejecuta `rm -rf .next` y luego `npm run dev`.
- **`EPERM: operation not permitted`** en el puerto: abre **Terminal.app** o **iTerm** (fuera de Cursor), ve a la carpeta del proyecto y ejecuta `npm run dev:fresh` o `./start-dev.sh` ahí.

## 📚 Documentación

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura y patrones de diseño
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - Guía de estilo y convenciones

## 🎯 Mejores Prácticas Implementadas

### ✅ Code Quality
- **Type Safety**: 100% TypeScript con interfaces estrictas
- **DRY Principle**: Código reutilizable sin duplicación
- **Single Responsibility**: Cada módulo tiene una responsabilidad clara
- **Separation of Concerns**: Lógica separada de presentación

### ✅ Performance
- **useMemo**: Para cálculos costosos y filtros
- **useCallback**: Para funciones estables
- **Code Splitting**: Carga optimizada de componentes
- **CSS Optimizado**: Animaciones con GPU acceleration

### ✅ Developer Experience
- **Typed Everything**: Autocompletado completo en IDE
- **Clear Structure**: Fácil de navegar y entender
- **Consistent Naming**: Convenciones claras y consistentes
- **Documented**: Código auto-documentado y comentarios útiles

### ✅ User Experience
- **Responsive Design**: Mobile, tablet y desktop
- **Smooth Animations**: Transiciones suaves y naturales
- **Immediate Feedback**: Estados de loading y error claros
- **Accessible**: Diseño accesible (keyboard navigation, ARIA labels)

## 🔧 Configuración

### ESLint
El proyecto incluye configuración de ESLint en `.eslintrc.json`:
- Next.js recomendado
- TypeScript estricto
- Reglas de React Hooks

### TypeScript
Configuración estricta en `tsconfig.json`:
- Strict mode habilitado
- Path aliases (@/)
- Módulos ES6

## 📊 Estructura de Datos

### Seller (Vendedor)
```typescript
interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  eventsAssigned: number;
  totalSold: number;
  lastActivity: string;
}
```

### Event (Evento)
```typescript
interface Event {
  id: string;
  name: string;
  type: 'raffle' | 'food_sale';
  status: 'active' | 'inactive' | 'completed';
  endDate: string;
  totalNumbers: number;
  soldNumbers: number;
}
```

## 🎨 Diseño

### Sistema de Colores
- **Primary**: #007AFF (iOS Blue)
- **Success**: #34C759 (Green)
- **Error**: #FF3B30 (Red)
- **Background**: #F5F5F5 (Light Gray)
- **Text**: #111827 (Dark Gray)

### Tipografía
- **Font Family**: System fonts (SF Pro / Segoe UI / Roboto)
- **Font Sizes**: 14px - 32px (escalado responsive)
- **Font Weights**: 400 (Regular), 600 (Semibold), 700 (Bold)

## 🔮 Roadmap

### En Desarrollo
- [ ] Integración con API backend
- [ ] Tests unitarios y de integración
- [ ] Autenticación y autorización
- [ ] Panel de analytics y reportes

### Futuras Mejoras
- [ ] PWA capabilities
- [ ] Notificaciones push
- [ ] Exportar datos a PDF/Excel
- [ ] Multi-idioma (i18n)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 👨‍💻 Autor

Desarrollado con ❤️ usando las mejores prácticas de desarrollo web moderno.

---

**Nota**: Este proyecto usa datos mock para desarrollo. En producción, estos serán reemplazados por llamadas a API real.
