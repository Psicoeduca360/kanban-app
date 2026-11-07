/**
 * Storage helpers for persisting task data.
 * Uses IndexedDB as the primary storage engine to support documents and high-resolution
 * photographs without the ~5MB quota limitations of localStorage.
 * Automatically falls back to localStorage if IndexedDB is unavailable.
 */

const DB_NAME = 'KanbanFlowDB'
const DB_VERSION = 1
const STORE_NAME = 'tasks_store'
const DATA_KEY = 'current_tasks'
const LOCAL_STORAGE_KEY = 'kanbanflow_tasks'

/**
 * Default starter tasks when the board is first opened.
 */
export function getDefaultTasks() {
  const samplePhotoSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#grad)" rx="16"/>
      <circle cx="200" cy="100" r="40" fill="#ffffff" opacity="0.2"/>
      <path d="M120 180 L180 120 L230 160 L270 130 L320 180 Z" fill="#ffffff" opacity="0.8"/>
      <text x="200" y="210" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">
        Mockup de Interfaz UI
      </text>
    </svg>`
  )}`

  return [
    {
      id: 'task-1',
      title: 'Diseñar interfaz de usuario moderna',
      description: 'Crear bocetos y prototipo para el nuevo diseño del tablero Kanban con soporte de adjuntos.',
      priority: 'alta',
      status: 'Pendiente',
      category: 'Diseño',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      attachments: [
        {
          id: 'att-demo-1',
          name: 'prototipo_interfaz.svg',
          type: 'image/svg+xml',
          size: 1420,
          data: samplePhotoSvg,
          uploadedAt: new Date().toISOString(),
        },
        {
          id: 'att-demo-2',
          name: 'especificaciones_diseno.pdf',
          type: 'application/pdf',
          size: 45200,
          data: 'data:application/pdf;base64,JVBERi0xLjMKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDQgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzEyIFRECihtaW5pZmljYWRvKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs1IDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDQgMCBSCj4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAyNjAgMDAwMDAgbiAKMDAwMDAwMDAwMCAwMDAwMCBuIAowMDAwMDAwMDAwIDAwMDAwIG4gCjAwMDAwMDAyMDEgMDAwMDAgbiAKMDAwMDAwMDAxOSAwMDAwMCBuIAowMDAwMDAwMDg4IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMzI1CiUlRU9G',
          uploadedAt: new Date().toISOString(),
        }
      ]
    },
    {
      id: 'task-2',
      title: 'Implementar funcionalidad Drag & Drop y Archivos',
      description: 'Permitir mover tarjetas entre columnas de forma fluida y adjuntar documentos o fotografías.',
      priority: 'media',
      status: 'En progreso',
      category: 'Desarrollo',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      attachments: []
    },
    {
      id: 'task-3',
      title: 'Configurar entorno sin credenciales ni tokens',
      description: 'Acceso directo e instantáneo al tablero sin necesidad de autenticaciones externas.',
      priority: 'baja',
      status: 'Completado',
      category: 'Configuración',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      attachments: []
    }
  ]
}

/**
 * Open or initialize IndexedDB connection.
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB no está soportado en este navegador'))
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/**
 * Retrieve tasks from IndexedDB, falling back to localStorage if necessary.
 * Migrates existing localStorage tasks if IndexedDB is clean.
 */
export async function getStoredTasks() {
  try {
    const db = await openDB()
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(DATA_KEY)

      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result) && req.result.length > 0) {
          resolve(req.result)
        } else {
          // Check if there are tasks in localStorage to migrate
          const localTasks = getFromLocalStorage()
          if (localTasks && localTasks.length > 0) {
            saveStoredTasks(localTasks).catch(console.error)
            resolve(localTasks)
          } else {
            const defaults = getDefaultTasks()
            saveStoredTasks(defaults).catch(console.error)
            resolve(defaults)
          }
        }
      }

      req.onerror = () => {
        resolve(getFromLocalStorage() || getDefaultTasks())
      }
    })
  } catch (err) {
    console.warn('Fallo IndexedDB, usando localStorage:', err)
    return getFromLocalStorage() || getDefaultTasks()
  }
}

/**
 * Persist tasks to IndexedDB and sync to localStorage as a safety copy.
 */
export async function saveStoredTasks(tasks) {
  try {
    const db = await openDB()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(tasks, DATA_KEY)

      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn('Error guardando en IndexedDB:', err)
  }

  // Backup to localStorage (without heavy attachments if quota is reached)
  saveToLocalStorageSafe(tasks)
}

/**
 * Clear stored tasks.
 */
export async function clearStoredTasks() {
  try {
    const db = await openDB()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(DATA_KEY)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch (e) {
    console.warn('Error limpiando IndexedDB:', e)
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY)
}

// ─── Helpers para localStorage ─────────────────────────────────────────────

function getFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}

function saveToLocalStorageSafe(tasks) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks))
  } catch (quotaError) {
    // If full due to base64 attachments, store tasks with attachment metadata only
    try {
      const lightweight = tasks.map(t => ({
        ...t,
        attachments: (t.attachments || []).map(a => ({
          id: a.id,
          name: a.name,
          type: a.type,
          size: a.size,
          uploadedAt: a.uploadedAt,
          data: '' // Omit heavy base64 in localStorage since it's already in IndexedDB
        }))
      }))
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightweight))
    } catch (_) {
      // Ignore fallback errors
    }
  }
}
