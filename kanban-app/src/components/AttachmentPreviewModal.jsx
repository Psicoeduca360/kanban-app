import React, { useEffect } from 'react'
import { X, Download, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { isImageAttachment, formatBytes, getFileBadge } from '../utils/taskHelpers.js'

export default function AttachmentPreviewModal({ attachment, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!attachment) return null

  const isImg = isImageAttachment(attachment)
  const isPdf = attachment.type?.includes('pdf') || attachment.name?.toLowerCase().endsWith('.pdf')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 bg-gray-900/90 text-white">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
              {isImg ? (
                <ImageIcon className="w-4 h-4 text-brand-400" />
              ) : (
                <FileText className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium truncate text-gray-100" title={attachment.name}>
                {attachment.name}
              </h3>
              <p className="text-xs text-gray-400">
                {formatBytes(attachment.size)} • {getFileBadge(attachment)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {attachment.data && (
              <a
                href={attachment.data}
                download={attachment.name || 'descarga'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white transition shadow-sm"
                title="Descargar archivo"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-950/60 min-h-[300px]">
          {isImg ? (
            <img
              src={attachment.data}
              alt={attachment.name}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-md"
            />
          ) : isPdf && attachment.data ? (
            <iframe
              src={attachment.data}
              title={attachment.name}
              className="w-full h-[70vh] rounded-lg border border-gray-800 bg-white"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4 text-gray-300">
                <FileText className="w-8 h-8 text-brand-400" />
              </div>
              <h4 className="text-base font-medium text-gray-200 mb-1">{attachment.name}</h4>
              <p className="text-xs text-gray-400 mb-5">
                Vista previa integrada no disponible para este formato ({getFileBadge(attachment)}). Puedes descargarlo directamente en tu equipo.
              </p>
              {attachment.data && (
                <a
                  href={attachment.data}
                  download={attachment.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition"
                >
                  <Download className="w-4 h-4" />
                  Descargar archivo
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
