# 🏗️ Arquitectura del Proyecto - Recauda App

## 📁 Estructura del Proyecto

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (dashboard)
│   ├── sellers-list/        # Sellers management
│   ├── create-event/        # Event creation
│   ├── add-seller/          # Add new seller
│   ├── event-detail/        # Event detail with buyers/sellers tabs
│   ├── login/               # Login page
│   └── create-account/      # Account creation
├── components/              # Reusable components
│   ├── Header.tsx           # Page header with dynamic titles
│   ├── Sidebar.tsx          # Desktop navigation sidebar
│   ├── Topbar.tsx           # Global top navigation bar
│   ├── TabBar/              # Mobile bottom tab navigation
│   ├── SegmentedControl/    # Tab/segment control
│   ├── BottomSheet/         # Generic bottom sheet (mobile)
│   ├── MobileListRow/       # Mobile table row rendering
│   ├── MobileFilterSheet/   # Mobile filters bottom sheet
│   ├── MobileStickyActionBar/ # Sticky action bar for bulk operations
│   ├── ConditionalLayout.tsx
│   └── wizard/              # Wizard step components
│       ├── CreateEventForm.tsx  # Event creation form wrapper
│       ├── AddSellerForm.tsx    # Add seller form wrapper
│       ├── EventTypeStep.tsx
│       ├── EventDataStep.tsx
│       ├── ConfirmEventStep.tsx
│       ├── AssignNumbersStep.tsx
│       ├── RegisterSaleWizard.tsx
│       ├── RegisterSaleModal.tsx   # Desktop modal for sales
│       └── RegisterSaleSheet.tsx  # Mobile bottom sheet for sales
├── types/                   # TypeScript type definitions
│   └── models.ts            # Core data models
├── constants/               # Application constants
│   └── index.ts
├── utils/                   # Utility functions
│   └── validation.ts        # Validation helpers
├── hooks/                   # Custom React hooks
│   ├── useSnackbar.ts       # Snackbar notification hook
│   └── useMediaQuery.ts     # Responsive breakpoint hook
└── mocks/                   # Mock data for development
    └── data.ts              # Mock sellers, events and buyers
```

## 🎯 Principios de Diseño

### 1. **Separación de Responsabilidades**
- **Types**: Definiciones centralizadas de tipos TypeScript
- **Constants**: Valores constantes y configuración
- **Utils**: Funciones puras y reutilizables
- **Hooks**: Lógica reutilizable de React
- **Mocks**: Datos de prueba separados del código

### 2. **Performance**
- `useMemo` para cálculos costosos
- `useCallback` para funciones estables
- Lazy loading de componentes cuando es posible
- Optimización de re-renders

### 3. **Type Safety**
- TypeScript estricto en todo el proyecto
- Interfaces compartidas centralizadas
- Type guards donde sea necesario

### 4. **Clean Code**
- Nombres descriptivos y auto-documentados
- Funciones pequeñas y enfocadas
- Comentarios solo cuando aportan valor
- Organización lógica del código

## 📚 Guía de Archivos Principales

### `src/types/models.ts`
Define los modelos de datos principales:
- `Seller`: Vendedor
- `Event`: Evento
- Tipos de estado y filtros

### `src/constants/index.ts`
Constantes de la aplicación:
- Duraciones de snackbar
- Opciones de filtros
- Reglas de validación

### `src/utils/validation.ts`
Funciones de validación reutilizables:
- `validateName()`: Valida nombres
- `validatePhone()`: Valida teléfonos
- `formatPhone()`: Formatea números de teléfono

### `src/hooks/useSnackbar.ts`
Hook personalizado para notificaciones:
- Maneja estado de visibilidad
- Animaciones de entrada/salida
- Temporizadores automáticos

### `src/hooks/useMediaQuery.ts`
Hook para detectar breakpoints responsive:
- Retorna `true/false` según el media query activo
- Usado para alternar entre UI mobile y desktop

### `src/mocks/data.ts`
Datos mock para desarrollo:
- `MOCK_SELLERS`: Lista de vendedores de prueba
- `MOCK_EVENTS`: Lista de eventos de prueba
- `MOCK_BUYERS`: Lista de compradores de prueba
- `MOCK_HOME_EVENTS`: Lista de eventos para el dashboard

## 🔄 Flujo de Datos

```
User Action → Component → Hook/Utils → State Update → Re-render
```

## 🚀 Mejoras Implementadas

### ✅ Antes vs Después

**Antes:**
```typescript
// Tipos inline, datos hardcoded, lógica duplicada
const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
const [snackbarClosing, setSnackbarClosing] = useState(false);
// ... 50 líneas de lógica de snackbar repetida
```

**Después:**
```typescript
// Hook reutilizable, tipos centralizados
import { useSnackbar } from '@/hooks/useSnackbar';
const successSnackbar = useSnackbar();
successSnackbar.showSnackbar();
```

### 📊 Métricas de Calidad

- **Reducción de código**: ~150 líneas eliminadas
- **Reutilización**: 4 nuevas utilidades compartidas
- **Type Safety**: 100% tipado TypeScript
- **Performance**: useMemo para filtros costosos
- **Mantenibilidad**: Código modular y testeable

## 🎨 Patrones de Diseño

### Custom Hooks
Los hooks personalizados encapsulan lógica compleja:
```typescript
const { isVisible, isClosing, showSnackbar, hideSnackbar } = useSnackbar();
```

### Utility Functions
Funciones puras sin efectos secundarios:
```typescript
const error = validateName(name);
const formattedPhone = formatPhone(phone);
```

### Constants as Single Source of Truth
```typescript
import { SNACKBAR_DURATION, STATUS_OPTIONS } from '@/constants';
```

## 📝 Convenciones de Código

1. **Imports**: Agrupados y ordenados (externos → internos → styles)
2. **Naming**:
   - Components: PascalCase
   - Functions: camelCase
   - Constants: UPPER_SNAKE_CASE
   - Types: PascalCase
3. **File Structure**:
   - Imports
   - Types/Interfaces
   - Component
   - Exports

## 🔮 Próximos Pasos

- [ ] Implementar API real (reemplazar mocks)
- [ ] Agregar tests unitarios
- [ ] Implementar error boundaries
- [ ] Agregar logging y analytics
- [ ] Optimizar bundle size

## 📖 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

