# KanbanFlow — Tablero Kanban Moderno con Adjuntos

Un gestor de tareas tipo Kanban 100% frontend, **sin necesidad de credenciales ni tokens de acceso**, con persistencia local en el navegador mediante **IndexedDB**, soporte para **adjuntar documentos y fotografías**, funcionalidad Drag & Drop e importación de tareas desde archivos Word (`.docx`).

---

## ✨ Características

- 🔓 **Acceso Libre y Directo**: No requiere inicio de sesión, credenciales ni tokens personales de GitHub.
- 📎 **Adjuntos de Fotografías y Documentos**:
  - Sube fotos (PNG, JPG, WEBP, GIF, SVG) con portada visual en la tarjeta del tablero.
  - Sube documentos (PDF, Word, Excel, texto plano, etc.).
  - Galería de miniaturas, visor ampliado en pantalla completa (lightbox) y descarga directa.
- 🗂 **Tablero Kanban con 3 Columnas**: **Pendiente / En progreso / Completado**.
- 🖱 **Drag & Drop Fluido**: Arrastra y suelta tarjetas entre columnas con `@dnd-kit`.
- 📋 **Gestión Completa de Tareas**: Crear, editar, mover y eliminar tareas fácilmente.
- 🎨 **Priorización Visual**: Alta (rojo), Media (amarillo/ámbar) y Baja (verde).
- 📅 **Fechas Límite**: Detección automática y resaltado de tareas vencidas.
- 🏷 **Categorías**: Organización temática por etiquetas.
- 📄 **Importación desde Word (`.docx`)**: Importa tareas estructuradas con recomendaciones.
- 💾 **Persistencia Robusta**: Usa **IndexedDB** en el navegador para soportar archivos y fotos de gran tamaño sin las restricciones de cuota de localStorage.

---

## 🚀 Inicio Rápido (Local)

### 1. Requisitos
- Node.js 18+ y npm

### 2. Instalación

```bash
git clone https://github.com/tu-usuario/kanban-app.git
cd kanban-app
npm install
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador. El tablero cargará de inmediato sin pedir ninguna configuración.

---

## 📎 Cómo Adjuntar Documentos y Fotografías

1. Haz clic en **Nueva tarea** (o edita una existente haciendo doble clic en la tarjeta).
2. En la sección **Adjuntos**, arrastra tus archivos o haz clic en la zona punteada.
3. Puedes seleccionar fotografías y documentos a la vez.
4. Las fotos se mostrarán en una cuadrícula con opciones de:
   - 👁 **Ver en grande**: Abre el visor lightbox en alta resolución.
   - ⬇️ **Descargar**: Guarda el archivo en tu computadora.
   - 🗑️ **Eliminar**: Remueve el adjunto de la tarea.
5. Al guardar, la primera foto adjunta se convertirá automáticamente en la **portada visual** de la tarjeta en el tablero.

---

## 📄 Formato de Importación desde Word (.docx)

El documento `.docx` puede contener el siguiente bloque estructurado:

```json
===TASKS_START===
{
  "tasks": [
    {
      "title": "Diseñar nueva interfaz",
      "description": "Actualizar componentes visuales",
      "priority": "alta",
      "category": "Diseño",
      "dueDate": "2026-12-31"
    }
  ],
  "recommendations": [
    "Priorizar tareas de alta urgencia primero."
  ]
}
===TASKS_END===
```

---

## ⚙️ Tecnologías Utilizadas

- **React 18**
- **Vite**
- **TailwindCSS**
- **@dnd-kit** (Drag & Drop)
- **IndexedDB API** (Almacenamiento persistente local de tareas y adjuntos)
- **mammoth.js** (Lector y parser de archivos `.docx`)
- **lucide-react** (Iconos modernos)
