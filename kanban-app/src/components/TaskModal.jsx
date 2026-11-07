/**
 * TaskModal — slide-up modal for creating or editing a task.
 * Supports adding, viewing, and managing attachments (photos, documents, files).
 */
import React, { useState, useEffect, useRef } from 'react'
import {
  X, Trash2, Loader2, Calendar, Tag, AlignLeft, Flag,
  Paperclip, Upload, Image as ImageIcon, FileText, Download,
  Eye, Plus
} from 'lucide-react'
import {
  COLUMNS, PRIORITY_CONFIG, todayISO,
  formatBytes, isImageAttachment, getFileBadge
} from '../utils/taskHelpers.js'
import AttachmentPreviewModal from './AttachmentPreviewModal.jsx'

const PRIORITIES = ['alta', 'media', 'baja']

export default function TaskModal({ task, isNew, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    attachments: [],
    ...task,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [readingFiles, setReadingFiles] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewAttachment, setPreviewAttachment] = useState(null)

  const titleRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  // ─── Attachments Handling ──────────────────────────────────────────────────

  const handleFiles = (files) => {
    if (!files || files.length === 0) return
    setReadingFiles(true)
    setError('')

    const fileList = Array.from(files)
    const readPromises = fileList.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            data: reader.result,
            uploadedAt: new Date().toISOString()
          })
        }
        reader.onerror = () => {
          console.error('Error al leer archivo:', file.name)
          resolve(null)
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(readPromises).then(newAttachments => {
      const valid = newAttachments.filter(Boolean)
      setForm(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...valid]
      }))
      setReadingFiles(false)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleRemoveAttachment = (attId) => {
    setForm(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter(a => a.id !== attId)
    }))
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('El título es obligatorio.')
      titleRef.current?.focus()
      return
    }
    setSaving(true)
    try {
      await onSave({
        ...form,
        title: form.title.trim(),
        attachments: form.attachments || []
      })
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  const attachments = form.attachments || []
  const imageAttachments = attachments.filter(isImageAttachment)
  const docAttachments = attachments.filter(a => !isImageAttachment(a))

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 flex md:items-center md:justify-center z-50 p-0 md:p-4">
        <div className="w-full md:max-w-xl bg-white rounded-t-2xl md:rounded-2xl shadow-modal
          overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh]">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-100">
            <h2 className="font-semibold text-gray-900 flex-1">
              {isNew ? 'Nueva tarea' : 'Editar tarea'}
            </h2>
            {!isNew && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                title="Eliminar tarea"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-500 transition"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable form body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Título *
              </label>
              <input
                ref={titleRef}
                type="text"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder="¿En qué hay que trabajar?"
                className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  placeholder:text-gray-300 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                <AlignLeft className="w-3 h-3" /> Descripción
              </label>
              <textarea
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Contexto, detalles, requerimientos..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm resize-none
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  placeholder:text-gray-300 transition"
              />
            </div>

            {/* Priority + Status row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Priority */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  <Flag className="w-3 h-3" /> Prioridad
                </label>
                <div className="flex gap-1.5">
                  {PRIORITIES.map(p => {
                    const cfg = PRIORITY_CONFIG[p]
                    const active = form.priority === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleChange('priority', p)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition
                          ${active
                            ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                            : 'bg-white border-surface-200 text-gray-400 hover:border-surface-300'
                          }`}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  Estado
                </label>
                <select
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    bg-white transition"
                >
                  {COLUMNS.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category + Due date row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  <Tag className="w-3 h-3" /> Categoría
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                  placeholder="ej. Diseño, Backend..."
                  className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    placeholder:text-gray-300 transition"
                />
              </div>

              {/* Due date */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  <Calendar className="w-3 h-3" /> Fecha límite
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  min={todayISO()}
                  onChange={e => handleChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                    transition"
                />
              </div>
            </div>

            {/* ─── Attachments Section (Photos & Documents) ─── */}
            <div className="pt-2 border-t border-surface-100">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <Paperclip className="w-3.5 h-3.5" />
                  Adjuntos ({attachments.length})
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  <Plus className="w-3 h-3" /> Adjuntar archivo o foto
                </button>
              </div>

              {/* Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition
                  ${dragOver
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-surface-200 hover:border-brand-300 hover:bg-surface-50'
                  }`}
              >
                {readingFiles ? (
                  <div className="flex items-center justify-center gap-2 py-1 text-gray-500 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                    Procesando adjuntos...
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-1">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600 font-medium">
                      Arrastra fotografías o documentos aquí o haz clic para subir
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      PNG, JPG, WEBP, PDF, Word, Excel, texto (sin límite de tokens)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              {/* Photos Grid */}
              {imageAttachments.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Fotografías ({imageAttachments.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    {imageAttachments.map((img) => (
                      <div
                        key={img.id}
                        className="group relative rounded-xl border border-surface-200 overflow-hidden bg-surface-100 aspect-video flex items-center justify-center shadow-xs"
                      >
                        <img
                          src={img.data}
                          alt={img.name}
                          className="w-full h-full object-cover transition group-hover:scale-105"
                        />
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setPreviewAttachment(img) }}
                            className="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:bg-white hover:text-brand-600 transition"
                            title="Ver en grande"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={img.data}
                            download={img.name}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:bg-white hover:text-brand-600 transition"
                            title="Descargar imagen"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveAttachment(img.id) }}
                            className="p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-white transition"
                            title="Eliminar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* Badge name */}
                        <span className="absolute bottom-1 left-1 right-1 px-1 py-0.5 rounded text-[10px] bg-black/60 text-white truncate group-hover:hidden">
                          {img.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents List */}
              {docAttachments.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Documentos ({docAttachments.length})
                  </h4>
                  <div className="space-y-1.5">
                    {docAttachments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2.5 p-2 rounded-xl border border-surface-200 bg-surface-50 hover:bg-white transition text-xs"
                      >
                        <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                          <span className="font-bold text-[10px] text-brand-600">
                            {getFileBadge(doc)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate" title={doc.name}>
                            {doc.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {formatBytes(doc.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewAttachment(doc)}
                          className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-surface-100 rounded-lg transition"
                          title="Vista previa"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={doc.data}
                          download={doc.name}
                          className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-surface-100 rounded-lg transition"
                          title="Descargar archivo"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(doc.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center gap-2 px-5 py-4 border-t border-surface-100 bg-surface-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-surface-200 text-sm font-medium
                text-gray-600 hover:bg-surface-100 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700
                disabled:opacity-60 text-white text-sm font-medium flex items-center justify-center gap-2 transition"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isNew ? 'Crear tarea' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / Document Preview Modal */}
      {previewAttachment && (
        <AttachmentPreviewModal
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}
    </>
  )
}
