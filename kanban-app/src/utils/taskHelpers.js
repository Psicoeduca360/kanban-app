/**
 * Task utility helpers: sorting, filtering, color mapping.
 */

export const COLUMNS = ['Pendiente', 'En progreso', 'Completado']

export const PRIORITY_CONFIG = {
  alta: {
    label: 'Alta',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
  },
  media: {
    label: 'Media',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  baja: {
    label: 'Baja',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
  },
}

export const STATUS_CONFIG = {
  'Pendiente': {
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    headerBg: 'bg-slate-50',
    headerBorder: 'border-slate-200',
    count: 'bg-slate-200 text-slate-700',
  },
  'En progreso': {
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    headerBg: 'bg-blue-50',
    headerBorder: 'border-blue-200',
    count: 'bg-blue-200 text-blue-700',
  },
  'Completado': {
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    headerBg: 'bg-emerald-50',
    headerBorder: 'border-emerald-200',
    count: 'bg-emerald-200 text-emerald-700',
  },
}

const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 }

/**
 * Sort tasks within a column:
 * 1. By priority (alta → media → baja)
 * 2. By due date (earliest first; tasks without due dates go last)
 */
export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    // Priority sort
    const pDiff = (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
    if (pDiff !== 0) return pDiff

    // Due date sort
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate) - new Date(b.dueDate)
  })
}

/** Group tasks by their status column */
export function groupByStatus(tasks) {
  const grouped = {}
  COLUMNS.forEach(col => { grouped[col] = [] })
  tasks.forEach(task => {
    const col = COLUMNS.includes(task.status) ? task.status : 'Pendiente'
    grouped[col].push(task)
  })
  // Sort within each column
  COLUMNS.forEach(col => { grouped[col] = sortTasks(grouped[col]) })
  return grouped
}

/** Format a YYYY-MM-DD date string for display */
export function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch (_) {
    return dateStr
  }
}

/** Determine if a due date is overdue */
export function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr + 'T23:59:59') < new Date()
}

/** Get today's date as YYYY-MM-DD */
export function todayISO() {
  return new Date().toISOString().split('T')[0]
}

/** Format file size in bytes to a human-readable string */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/** Check if an attachment is an image based on MIME type or file extension */
export function isImageAttachment(attachment) {
  if (!attachment) return false
  if (attachment.type && attachment.type.startsWith('image/')) return true
  const name = attachment.name || ''
  return /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(name)
}

/** Get a clean short uppercase badge label for an attachment type */
export function getFileBadge(attachment) {
  if (!attachment) return 'FILE'
  if (isImageAttachment(attachment)) return 'IMG'
  const name = (attachment.name || '').toLowerCase()
  if (name.endsWith('.pdf') || attachment.type?.includes('pdf')) return 'PDF'
  if (name.endsWith('.doc') || name.endsWith('.docx') || attachment.type?.includes('word')) return 'DOC'
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || attachment.type?.includes('sheet')) return 'XLS'
  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return 'PPT'
  if (name.endsWith('.txt')) return 'TXT'
  return 'FILE'
}

