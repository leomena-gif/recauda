# Estándares de Diseño - Desktop

## Ancho Máximo y Padding

### Estándar Principal
Todas las páginas principales del proyecto deben seguir este estándar:

- **Max-width**: `1200px`
- **Padding (Desktop)**: `40px`
- **Centrado**: `margin: 0 auto`

### Aplicación

#### Páginas Principales
Todas usan la clase global `.pageContainer` que aplica automáticamente:

```css
@media (min-width: 768px) {
  .pageContainer {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;
    padding-bottom: 110px; /* Espacio para botones fijos */
  }
}
```

**Páginas que usan `.pageContainer`:**
- ✅ `/` - Mis Eventos (page.tsx)
- ✅ `/sellers-list` - Lista de Vendedores
- ✅ `/buyers-list` - Lista de Compradores
- ✅ `/event-detail` - Detalle de Evento

#### Wizards
Los wizards usan su propio contenedor `.mainContent`:

```css
@media (min-width: 768px) {
  .mainContent {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;
  }
}
```

**Wizards:**
- ✅ `/create-event` - CreateEventWizard
- ✅ `/add-seller` - AddSellerWizard

#### Páginas Especiales
Estas páginas tienen su propio diseño centrado (no aplican el estándar de 1200px):

- `/login` - Max-width: `500px` (formulario centrado)
- `/create-account` - Max-width: `500px` (formulario centrado)

### Elementos Internos

#### Headers y Action Bars
Todos los headers y action bars deben tener:
```css
width: 100%;
padding: 0;
```

Y en desktop, si están dentro de `.pageContainer`, heredan automáticamente el padding de 40px.

#### Contenedores de Contenido
- `.cardsContainer` - Max-width: `1200px`, margin: `0 auto`
- `.tableContainer` - Width: `100%`, padding: `0`
- `.filtersContainer` - Width: `100%`, padding: `0`

### Responsive

#### Mobile (max-width: 768px)
- Padding se reduce a `var(--space-md)` (16px)
- Max-width se elimina (100% del ancho disponible)

#### Breakpoints
- **Desktop**: `min-width: 768px` - Padding: `40px`, Max-width: `1200px`
- **Mobile**: `max-width: 767px` - Padding: `16px`, Max-width: `100%`

### Verificación

Para verificar que una página sigue el estándar:

1. ✅ Usa `.pageContainer` o tiene `max-width: 1200px` en desktop
2. ✅ Tiene `padding: 40px` en desktop
3. ✅ Tiene `margin: 0 auto` para centrado
4. ✅ Los elementos internos (headers, action bars) tienen `width: 100%` y `padding: 0`
5. ✅ Los contenedores de contenido respetan el ancho máximo

### Excepciones

- **Modales y Sheets**: Pueden tener max-width específico (ej: 600px para modales)
- **Tooltips**: Pueden tener max-width específico para legibilidad
- **Formularios centrados**: Login/Create Account usan 500px
- **Elementos fijos**: Footer fijo en event-detail usa max-width: 1200px
