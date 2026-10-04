/**
 * useBoard — central state manager for the Kanban board with local persistence.
 *
 * Responsibilities:
 * - Load tasks from localStorage on mount
 * - Provide CRUD operations (create, update, delete, move, import)
 * - Persist changes synchronously to localStorage
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

  const fetchTasks = useCallback(() => {
    setLoading(true)
    setError(null)
    try {
      const stored = getStoredTasks()
      setTasks(stored)
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
    }
    setTasks(prev => {
      const updated = [newTask, ...prev]
      saveStoredTasks(updated)
      return updated
    })
    return newTask
  }, [])

  // ─── Update ──────────────────────────────────────────────────────────────────

  const editTask = useCallback((taskData) => {
    setTasks(prev => {
      const updated = prev.map(t => (t.id === taskData.id ? { ...t, ...taskData } : t))
      saveStoredTasks(updated)
      return updated
    })
  }, [])

  // ─── Move (drag & drop status change) ────────────────────────────────────────

  const moveTask = useCallback((taskId, newStatus) => {
    setTasks(prev => {
      const updated = prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
      saveStoredTasks(updated)
      return updated
    })
  }, [])

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const removeTask = useCallback((taskId) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== taskId)
      saveStoredTasks(updated)
      return updated
    })
  }, [])

  // ─── Bulk Import (from DOCX or files) ────────────────────────────────────────

  const importTasks = useCallback((taskList) => {
    const imported = taskList.map((taskData, idx) => ({
      ...taskData,
      id: `imported-${Date.now()}-${idx}`,
      createdAt: new Date().toISOString(),
    }))

    setTasks(prev => {
      const updated = [...imported, ...prev]
      saveStoredTasks(updated)
      return updated
    })

    return { imported, errors: [] }
  }, [])

  // ─── Reset ───────────────────────────────────────────────────────────────────

  const resetToDefaults = useCallback(() => {
    clearStoredTasks()
    const defaults = getDefaultTasks()
    saveStoredTasks(defaults)
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
