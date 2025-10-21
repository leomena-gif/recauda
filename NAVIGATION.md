# 🗺️ Mapa de Navegación - Recauda App

## 📊 Estructura de Páginas

### 🏠 Páginas Principales (Sidebar + Header)

```
┌─────────────────────────────────────────┐
│          SIDEBAR / HEADER               │
├─────────────────────────────────────────┤
│ 🏠 Mis Eventos              [/]         │
│ ➕ Crear evento             [/create-event] │
│ 👥 Lista de vendedores      [/sellers-list] │
└─────────────────────────────────────────┘
```

---

## 🔗 Flujo de Navegación

### 1️⃣ **Autenticación**

```
┌──────────────┐
│   /login     │  ← Página de inicio (sin sidebar/header)
│              │
│  [Ingresar]  ├──────────────────────────────┐
│              │                              ↓
│ "¿No tienes  │                          [/] (Home)
│  cuenta?"    │
│              │
│  [Crear]     │
└──────┬───────┘
       ↓
┌──────────────────┐
│ /create-account  │  ← Crear nueva cuenta
│                  │
│ [Crear cuenta]   ├────────────────────────┐
│                  │                        ↓
│ "¿Ya tienes      │                    [/] (Home)
│  cuenta?"        │
│                  │
│ [Iniciar sesión] │
└──────────────────┘
       ↑
       │
       └─────────────────────── Volver a /login
```

---

### 2️⃣ **Dashboard de Eventos**

```
┌────────────────────────────────────────────┐
│  / (Mis Eventos)                           │
│                                            │
│  📊 Pills de Filtro:                       │
│  • Todos    [all]                          │
│  • Activos  [active]                       │
│  • Finalizados [completed]                 │
│  • Bloqueados [blocked]                    │
│                                            │
│  📋 Event Cards:                           │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Evento 1     │  │ Evento 2     │       │
│  │ (Active)     │  │ (Completed)  │       │
│  └──────┬───────┘  └──────┬───────┘       │
└─────────┼──────────────────┼───────────────┘
          │                  │
          └──────────┬───────┘
                     ↓
          ┌──────────────────┐
          │  /event-detail   │  ← Ver detalles del evento
          │                  │
          │  • Números       │
          │  • Vendedores    │
          │  • Estadísticas  │
          │                  │
          │  [← Volver]      ├───────→ Regresa a /
          └──────────────────┘
```

---

### 3️⃣ **Crear Evento (Wizard)**

```
┌──────────────────────────────────────────────┐
│  /create-event                               │
│                                              │
│  Paso 1: Tipo de evento                     │
│    🎁 Sorteo    🍲 Venta de comida          │
│                                              │
│  Paso 2: Datos del evento                   │
│    • Nombre                                  │
│    • Fecha de finalización                  │
│    • Precio                                  │
│                                              │
│  Paso 3: Asignar números                    │
│    • Cantidad de números                    │
│                                              │
│  Paso 4: Confirmar                          │
│    [Crear evento]                            │
│                                              │
│  ✓ Éxito                                     │
│    [Ir a mis eventos]  ───────────────→  /  │
└──────────────────────────────────────────────┘
```

---

### 4️⃣ **Vendedores**

```
┌─────────────────────────────────────────────┐
│  /sellers-list                              │
│                                             │
│  📊 Filtros:                                │
│  • Todos   • Activos   • Inactivos         │
│                                             │
│  📋 Lista de Vendedores                     │
│  • María González                           │
│  • Juan Pérez                               │
│  • ...                                      │
│                                             │
│  Acciones:                                  │
│  • [Agregar vendedor] ────────┐            │
│  • [Asignar a evento]          │            │
│  • [Editar]                    │            │
└────────────────────────────────┼────────────┘
                                 ↓
                    ┌────────────────────────┐
                    │  /add-seller           │
                    │                        │
                    │  Paso 1: Datos         │
                    │    • Nombre            │
                    │    • Apellido          │
                    │    • Teléfono          │
                    │    • Email             │
                    │                        │
                    │  Paso 2: Confirmar     │
                    │    [Agregar]           │
                    │                        │
                    │  ✓ Éxito               │
                    │    [Volver]  ──────────┼──→ /sellers-list
                    └────────────────────────┘
```

---

## 🎯 Resumen de Rutas

### Rutas Públicas (sin autenticación requerida)
- `/login` - Iniciar sesión
- `/create-account` - Crear cuenta

### Rutas Protegidas (con Sidebar + Header)
- `/` - Mis eventos (dashboard)
- `/create-event` - Crear evento (wizard)
- `/sellers-list` - Lista de vendedores
- `/add-seller` - Agregar vendedor (wizard)
- `/event-detail` - Detalle de evento

---

## 📱 Navegación Móvil

### Header con Menú Hamburguesa
```
┌─────────────────────────────────────┐
│  ☰  Recauda        👤 Usuario       │
└─────────────────────────────────────┘
      │
      │ (Click)
      ↓
┌─────────────────────────────────────┐
│  Recauda                        ✕   │
├─────────────────────────────────────┤
│  🏠 Mis Eventos                     │
│  ➕ Crear evento                     │
│  👥 Lista de vendedores             │
└─────────────────────────────────────┘
```

---

## 🔄 Flujos Especiales

### Asignación de Vendedores a Eventos (Inline)
```
/sellers-list
  │
  ├─ Seleccionar vendedores (checkbox)
  │
  ├─ Click [Asignar N vendedor(es)]
  │
  └─ Mostrar selector de eventos activos
     │
     ├─ Click en evento
     │
     └─ ✓ Vendedores asignados (snackbar)
```

### Navegación desde Event Cards
```
/ (Mis eventos)
  │
  ├─ Filtrar por estado (pills)
  │
  └─ Click en Event Card
     │
     └─ → /event-detail
```

---

## 🎨 Componentes de Navegación

### Sidebar (Desktop)
- Ubicación: Izquierda, fija
- Páginas: Home, Create Event, Sellers List
- Indicador: Botón activo con estilo destacado

### Header (Mobile)
- Ubicación: Top, sticky
- Menú hamburguesa: ☰
- Menú desplegable: Overlay con animación

### ConditionalLayout
- Controla visibilidad de Sidebar/Header
- Páginas sin layout: `/login`, `/create-account`
- Páginas con layout: Todas las demás

---

## ✅ Estado de Navegación

- ✅ Todas las rutas funcionando correctamente
- ✅ Navegación bidireccional login ↔ create-account
- ✅ Links internos operativos (event cards, wizards)
- ✅ Sidebar activo en desktop
- ✅ Header con menú hamburguesa en mobile
- ✅ Filtros de pills funcionando con navegación
- ✅ Asignación inline de vendedores
- ✅ Breadcrumbs y botones de retorno

---

## 🚀 Acceso Directo a Todas las Páginas

### Para Desarrollo
```bash
# Páginas principales
http://localhost:3000/                    # Home
http://localhost:3000/create-event        # Crear evento
http://localhost:3000/sellers-list        # Vendedores

# Páginas secundarias
http://localhost:3000/add-seller          # Agregar vendedor
http://localhost:3000/event-detail        # Detalle evento

# Autenticación
http://localhost:3000/login               # Login
http://localhost:3000/create-account      # Registro
```

---

**Última actualización:** Octubre 2025  
**Estado:** ✅ Navegación completa y funcional
