# 🔘 Sistema de Botones - Guía de Uso

## 📋 Resumen

Este proyecto utiliza un **sistema de 3 niveles de botones** que proporciona una jerarquía visual clara y consistente en toda la aplicación.

## 🎨 Los 3 Niveles

### 1. Botón Principal (Primary)
**Uso**: Acción más importante en la pantalla
**Estilo**: Azul sólido (#007AFF)

```tsx
<button className="btn btn-primary">
  Agregar vendedor
</button>
```

**Visual**:
- Fondo: Azul sólido
- Texto: Blanco
- Hover: Azul más oscuro
- Mejor para: Crear, Guardar, Confirmar

---

### 2. Botón Secundario (Secondary) - QUIET
**Uso**: Acciones de menor prioridad o cancelar
**Estilo**: Solo texto azul, sin borde ni fondo

```tsx
<button className="btn btn-secondary">
  Cancelar
</button>
```

**Visual**:
- Fondo: Transparente
- Texto: Azul
- Hover: Fondo azul muy sutil (8% opacity)
- Mejor para: Cancelar, Cerrar, Acciones sutiles

---

### 3. Botón Terciario (Tertiary) - OUTLINE
**Uso**: Acciones alternativas o navegación
**Estilo**: Outline azul con fondo transparente

```tsx
<button className="btn btn-tertiary">
  Ir al detalle
</button>
```

**Visual**:
- Fondo: Transparente
- Texto: Azul
- Borde: Azul (2px)
- Hover: Fondo azul, texto blanco
- Mejor para: Ver detalles, Editar, Navegación

---

## 📐 Tamaños

```tsx
// Pequeño
<button className="btn btn-primary btn-sm">Texto</button>

// Mediano (default)
<button className="btn btn-primary btn-md">Texto</button>

// Grande
<button className="btn btn-primary btn-lg">Texto</button>
```

## 🎯 Modificadores

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

### Deshabilitado
```tsx
<button className="btn btn-primary" disabled>
  No disponible
</button>
```

## 💡 Ejemplos de Uso

### Formulario con jerarquía clara
```tsx
<div className={styles.formActions}>
  <button className="btn btn-primary">
    Guardar cambios
  </button>
  <button className="btn btn-tertiary">
    Ver preview
  </button>
  <button className="btn btn-secondary">
    Cancelar
  </button>
</div>
```

### Tarjeta de evento
```tsx
<div className={styles.card}>
  {/* ... contenido ... */}
  <div className={styles.actions}>
    <button className="btn btn-primary">
      Agregar vendedores
    </button>
    <button className="btn btn-tertiary">
      Ir al detalle
    </button>
  </div>
</div>
```

### Modal o diálogo
```tsx
<div className={styles.modal}>
  {/* ... contenido ... */}
  <div className={styles.modalActions}>
    <button className="btn btn-primary">
      Confirmar
    </button>
    <button className="btn btn-secondary">
      Cancelar
    </button>
  </div>
</div>
```

## 📏 Reglas de Uso

### ✅ Hacer
- Usa solo **UN** botón principal por pantalla o sección
- El botón principal debe ser la acción más importante
- Usa botones secundarios (quiet) para cancelar o cerrar
- Usa botones terciarios (outline) para acciones alternativas
- Mantén consistencia en toda la app

### ❌ Evitar
- No uses múltiples botones principales en la misma sección
- No uses el botón secundario (quiet) para acciones importantes
- No mezcles estilos personalizados con las clases globales
- No uses botones grandes para acciones menores

## 🎨 Jerarquía Visual en la Práctica

```
Pantalla Principal
├── [Primary] Crear evento nuevo      ← Acción principal
├── [Tertiary] Ver eventos archivados ← Acción alternativa
└── [Secondary] Cerrar sesión         ← Acción secundaria
```

## 🔧 Implementación Técnica

Las clases están definidas en `/src/styles/utilities.css` y son globales en toda la aplicación.

### Estructura de clases
- `.btn` - Clase base (siempre requerida)
- `.btn-primary` | `.btn-secondary` | `.btn-tertiary` - Nivel del botón
- `.btn-sm` | `.btn-md` | `.btn-lg` - Tamaño (opcional)
- `.btn-full` - Ancho completo (opcional)
- `.btn-icon` - Con icono (opcional)

## 📱 Responsive

Los botones se adaptan automáticamente a diferentes tamaños de pantalla. En móvil, considera usar `btn-full` para mejor usabilidad.

## 🎯 Demo

Puedes ver todos los estilos de botones en acción visitando:
```
http://localhost:3000/button-showcase
```

---

**Última actualización**: Octubre 2025

