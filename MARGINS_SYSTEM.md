# 📏 Sistema de Márgenes Estandarizado

## 🎯 Objetivo
Mantener consistencia visual en todas las páginas del proyecto con márgenes uniformes.

## 📐 Sistema de Espaciado

### Variables CSS Globales
```css
--space-xs: 8px
--space-sm: 12px
--space-md: 16px
--space-lg: 20px
--space-xl: 24px
--space-2xl: 32px
--space-3xl: 48px
```

## 🏗️ Estructura de Layout

### 1. Páginas con Header y Sidebar
**Clase**: `.pageContainer`

#### Desktop (> 768px)
- **Padding Superior**: 24px (`var(--space-xl)`)
- **Padding Lateral**: 20px (`var(--space-lg)`)
- **Max Width**: 1400px
- **Margin**: 0 auto (centrado)

#### Tablet (≤ 768px)
- **Padding Superior**: 16px (`var(--space-md)`)
- **Padding Lateral**: 16px (`var(--space-md)`)

#### Mobile (≤ 480px)
- **Padding Superior**: 16px (`var(--space-md)`)
- **Padding Lateral**: 12px (`var(--space-sm)`)

### 2. Wizards (Create Event, Add Seller)
**Clase**: `.mainContent`

Usan el mismo sistema de márgenes que `.pageContainer`:

#### Desktop (> 768px)
- **Padding**: 24px 20px (`var(--space-xl) var(--space-lg)`)
- **Max Width**: 1400px
- **Width**: 100%

#### Tablet (≤ 768px)
- **Padding**: 16px 16px (`var(--space-md) var(--space-md)`)

#### Mobile (≤ 480px)
- **Padding**: 16px 12px (`var(--space-md) var(--space-sm)`)

## 📄 Páginas del Proyecto

### ✅ Páginas Estandarizadas

| Página | Clase Container | Estado |
|--------|----------------|--------|
| `/` (Mis eventos) | `.pageContainer` | ✅ Estandarizado |
| `/event-detail` | `.pageContainer` | ✅ Estandarizado |
| `/sellers-list` | `.pageContainer` | ✅ Estandarizado |
| `/create-event` | `.mainContent` (wizard) | ✅ Estandarizado |
| `/add-seller` | `.mainContent` (wizard) | ✅ Estandarizado |
| `/login` | `.formContainer` | ⚠️ Layout especial |
| `/create-account` | `.formContainer` | ⚠️ Layout especial |

## 🎨 Reglas de Uso

### Para Nuevas Páginas

1. **Páginas con Sidebar**: Usa `<div className="pageContainer">`
   ```tsx
   export default function MyPage() {
     return (
       <div className="pageContainer">
         <h1 className="pageTitle">Mi Página</h1>
         {/* contenido */}
       </div>
     );
   }
   ```

2. **Wizards sin Sidebar**: Usa la estructura del wizard
   ```tsx
   <div className={styles.wizardContainer}>
     <div className={styles.mainContent}>
       {/* contenido */}
     </div>
   </div>
   ```

### Márgenes Adicionales

#### Títulos de Página
```css
.pageTitle {
  margin-bottom: var(--space-xl); /* 24px en desktop */
  margin-bottom: var(--space-lg);  /* 20px en mobile */
}
```

#### Headers de Sección
```css
.headerContainer {
  margin-bottom: 12px; /* Espacio reducido para mejor jerarquía */
}
```

#### Contenedores de Filtros
```css
.filtersContainer {
  margin-top: calc(var(--space-xl) / 2); /* 12px */
  margin-bottom: var(--space-xl); /* 24px */
}
```

## 🔍 Verificación

### Checklist para Nuevas Páginas
- [ ] Usa `.pageContainer` o `.mainContent` según corresponda
- [ ] No tiene márgenes hardcodeados en px
- [ ] Usa variables CSS de espaciado
- [ ] Responsive correctamente en mobile
- [ ] Max-width establecido para pantallas grandes
- [ ] Centrado con `margin: 0 auto`

## 🚫 Anti-Patrones

### ❌ Evitar
```css
/* NO hacer esto */
.myPage {
  padding: 30px 25px; /* Valores hardcodeados */
}

.myContainer {
  margin-left: 280px; /* Valor fijo sin variable */
}
```

### ✅ Hacer
```css
/* SI hacer esto */
.myPage {
  padding: var(--space-xl) var(--space-lg);
}

.myContainer {
  margin-left: var(--sidebar-width);
}
```

## 📊 Beneficios del Sistema

1. ✅ **Consistencia Visual**: Todas las páginas se ven uniformes
2. ✅ **Mantenibilidad**: Cambios centralizados en variables CSS
3. ✅ **Responsive**: Sistema adaptable a todos los tamaños
4. ✅ **Escalabilidad**: Fácil agregar nuevas páginas
5. ✅ **Accesibilidad**: Espaciado adecuado para lectura

---

**Última actualización**: Octubre 2025
**Mantenido por**: Equipo de Desarrollo

