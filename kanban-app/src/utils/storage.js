/**
 * localStorage helpers for persisting task data locally.
 */

const STORAGE_KEY = 'kanbanflow_tasks'

export function getDefaultTasks() {
  return [
    {
      id: 'task-1',
      title: 'Diseñar interfaz de usuario',
      description: 'Crear bocetos y prototipo para el nuevo diseño del tablero Kanban.',
      priority: 'alta',
      status: 'Pendiente',
      category: 'Diseño',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Implementar funcionalidad Drag & Drop',
      description: 'Permitir mover tarjetas entre columnas de forma fluida.',
      priority: 'media',
      status: 'En progreso',
      category: 'Desarrollo',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Configurar entorno inicial del proyecto',
      description: 'Instalación de dependencias React, Tailwind CSS y componentes base.',
      priority: 'baja',
      status: 'Completado',
      category: 'Configuración',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }
  ]
}

export function getStoredTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const defaults = getDefaultTasks()
      saveStoredTasks(defaults)
      return defaults
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Could not read tasks from localStorage:', e)
    return getDefaultTasks()
  }
}

export function saveStoredTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('Could not save tasks to localStorage:', e)
  }
}

export function clearStoredTasks() {
  localStorage.removeItem(STORAGE_KEY)
}
