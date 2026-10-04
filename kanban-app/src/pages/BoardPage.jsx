/**
 * BoardPage — the main Kanban board screen.
 * Orchestrates: header, column board, modals, import panel.
 */
import React, { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'

import { useBoard } from '../hooks/useBoard.js'
import { groupByStatus, COLUMNS } from '../utils/taskHelpers.js'

import Header from '../components/Header.jsx'
import KanbanColumn from '../components/KanbanColumn.jsx'
import TaskCard from '../components/TaskCard.jsx'
import TaskModal from '../components/TaskModal.jsx'
import ImportPanel from '../components/ImportPanel.jsx'
import Toast from '../components/Toast.jsx'

export default function BoardPage() {
  const {
    tasks, loading, error,
    fetchTasks, addTask, editTask, moveTask, removeTask, importTasks, resetToDefaults
  } = useBoard()

  // ─── UI State ─────────────────────────────────────────────────────────────

  const [activeTask, setActiveTask] = useState(null) // task being dragged
  const [editingTask, setEditingTask] = useState(null) // task open in modal (null = closed)
  const [isNewTask, setIsNewTask] = useState(false) // modal in create vs edit mode
  const [defaultStatus, setDefaultStatus] = useState('Pendiente') // for new task column
  const [showImport, setShowImport] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // ─── Toast helper ────────────────────────────────────────────────────────

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
  }

  // ─── Drag & Drop ─────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Avoid accidental drags on click
    })
  )

  const handleDragStart = ({ active }) => {
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    let newStatus = null

    if (COLUMNS.includes(over.id)) {
      newStatus = over.id
    } else {
      const overTask = tasks.find(t => t.id === over.id)
      if (overTask) {
        newStatus = overTask.status
      }
    }

    if (!newStatus || !COLUMNS.includes(newStatus)) return

    const task = tasks.find(t => t.id === active.id)
    if (!task || task.status === newStatus) return

    moveTask(task.id, newStatus)
    showToast(`Tarea movida a "${newStatus}"`)
  }

  // ─── Modal Handlers ───────────────────────────────────────────────────────

  const openNewTask = (status = 'Pendiente') => {
    setDefaultStatus(status)
    setEditingTask({ title: '', description: '', priority: 'media', category: '', dueDate: '', status })
    setIsNewTask(true)
  }

  const openEditTask = (task) => {
    setEditingTask(task)
    setIsNewTask(false)
  }

  const closeModal = () => {
    setEditingTask(null)
  }

  const handleSaveTask = (taskData) => {
    try {
      if (isNewTask) {
        addTask(taskData)
        showToast('Tarea creada exitosamente')
      } else {
        editTask(taskData)
        showToast('Tarea actualizada')
      }
      closeModal()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const handleDeleteTask = (taskId) => {
    try {
      removeTask(taskId)
      showToast('Tarea eliminada')
      closeModal()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  // ─── Import Handler ───────────────────────────────────────────────────────

  const handleImport = (taskList) => {
    const { imported } = importTasks(taskList)
    if (imported.length > 0) {
      showToast(`${imported.length} tarea(s) importada(s) correctamente`)
    }
    return { imported, errors: [] }
  }

  const handleResetData = () => {
    if (window.confirm('¿Estás seguro de restablecer las tareas a su estado inicial?')) {
      resetToDefaults()
      showToast('Datos restablecidos')
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const grouped = groupByStatus(tasks)

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Header
        taskCount={tasks.length}
        onRefresh={fetchTasks}
        onNewTask={() => openNewTask(defaultStatus)}
        onImport={() => setShowImport(true)}
        onReset={handleResetData}
        loading={loading}
      />

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <span className="font-medium">Error:</span> {error}
          <button onClick={fetchTasks} className="ml-auto underline text-red-600 hover:text-red-800">
            Reintentar
          </button>
        </div>
      )}

      {/* Board */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 md:gap-6 min-h-[calc(100vh-10rem)] items-start">
            {COLUMNS.map(column => (
              <KanbanColumn
                key={column}
                column={column}
                tasks={grouped[column] || []}
                loading={loading}
                onAddTask={() => openNewTask(column)}
                onEditTask={openEditTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>

          {/* Drag overlay — renders the card being dragged above everything */}
          <DragOverlay>
            {activeTask ? (
              <div className="drag-overlay">
                <TaskCard task={activeTask} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Task create/edit modal */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          isNew={isNewTask}
          onSave={handleSaveTask}
          onDelete={isNewTask ? null : () => handleDeleteTask(editingTask.id)}
          onClose={closeModal}
        />
      )}

      {/* Import panel (side sheet) */}
      {showImport && (
        <ImportPanel
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}
