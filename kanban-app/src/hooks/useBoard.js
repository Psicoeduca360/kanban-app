/**
 * useBoard — central state manager for the Kanban board with IndexedDB persistence.
 *
 * Responsibilities:
 * - Load tasks asynchronously from IndexedDB/localStorage on mount
 * - Provide CRUD operations (create, update, delete, move, import)
 * - Persist changes asynchronously to IndexedDB without blocking UI
 */
import { useState, useCallback } from 'react'
import {
  getStoredTasks,
  saveStoredTasks,
  getDefaultTasks,
  clearStoredTasks,
} from '../utils/storage.js'

export function useBoard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ─── Fetch ───────────────────────────────────────────────────────────────────

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const stored = await getStoredTasks()
      setTasks(stored || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Create ──────────────────────────────────────────────────────────────────

  const addTask = useCallback((taskData) => {
    const newTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      attachments: taskData.attachments || [],
    }
    setTasks(prev => {
      const updated = [newTask, ...prev]
      saveStoredTasks(updated).catch(console.error)
      return updated
    })
    return newTask
  }, [])

  // ─── Update ──────────────────────────────────────────────────────────────────

  const editTask = useCallback((taskData) => {
    setTasks(prev => {
      const updated = prev.map(t => (t.id === taskData.id ? { ...t, ...taskData } : t))
      saveStoredTasks(updated).catch(console.error)
      return updated
    })
  }, [])

  // ─── Move (drag & drop status change) ────────────────────────────────────────

  const moveTask = useCallback((taskId, newStatus) => {
    setTasks(prev => {
      const updated = prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
      saveStoredTasks(updated).catch(console.error)
      return updated
    })
  }, [])

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const removeTask = useCallback((taskId) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== taskId)
      saveStoredTasks(updated).catch(console.error)
      return updated
    })
  }, [])

  // ─── Bulk Import (from DOCX or files) ────────────────────────────────────────

  const importTasks = useCallback((taskList) => {
    const imported = taskList.map((taskData, idx) => ({
      ...taskData,
      id: `imported-${Date.now()}-${idx}`,
      createdAt: new Date().toISOString(),
      attachments: taskData.attachments || [],
    }))

    setTasks(prev => {
      const updated = [...imported, ...prev]
      saveStoredTasks(updated).catch(console.error)
      return updated
    })

    return { imported, errors: [] }
  }, [])

  // ─── Reset ───────────────────────────────────────────────────────────────────

  const resetToDefaults = useCallback(async () => {
    await clearStoredTasks()
    const defaults = getDefaultTasks()
    await saveStoredTasks(defaults)
    setTasks(defaults)
  }, [])

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    editTask,
    moveTask,
    removeTask,
    importTasks,
    resetToDefaults,
  }
}
