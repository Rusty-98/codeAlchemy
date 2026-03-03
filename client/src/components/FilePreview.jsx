// src/components/FilePreview.jsx

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  Copy,
  Check,
  FileCode2,
  FileText,
  File,
  ChevronRight,
  ChevronDown,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '../lib/utils'

/* ---------------- LANGUAGE MAP ---------------- */

function getLanguage(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const map = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    css: 'css',
    html: 'html',
    json: 'json',
    md: 'markdown',
    sh: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
    txt: 'text',
    rs: 'rust',
    go: 'go',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    rb: 'ruby'
  }
  return map[ext] || 'text'
}

/* ---------------- FILE ICON ---------------- */

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase()

  if (
    ['js', 'jsx', 'ts', 'tsx', 'py', 'rs', 'go', 'java', 'cpp', 'c', 'rb']
      .includes(ext)
  )
    return <FileCode2 className="w-4 h-4" />

  if (['md', 'txt', 'html', 'css'].includes(ext))
    return <FileText className="w-4 h-4" />

  return <File className="w-4 h-4" />
}

/* ---------------- COPY BUTTON ---------------- */

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-700/60 hover:bg-gray-600/60 text-gray-300 hover:text-white transition-all"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

/* ---------------- TREE BUILDER ---------------- */

function buildTree(files) {
  const tree = {}

  files.forEach((file) => {
    const parts = file.name.split('/')
    let current = tree

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = file.name
      } else {
        current[part] = current[part] || {}
        current = current[part]
      }
    })
  })

  return tree
}

/* ---------------- FILE PREVIEW ---------------- */

export default function FilePreview({ files, downloadUrl, onClose }) {
  const [activeFile, setActiveFile] = useState(files[0]?.name || '')
  const [expanded, setExpanded] = useState(false)
  const [openFolders, setOpenFolders] = useState({})

  const tree = useMemo(() => buildTree(files), [files])
  const current = files.find((f) => f.name === activeFile)

  const toggleFolder = (path) => {
    setOpenFolders((prev) => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const renderTree = (node, parentPath = '') => {
    return Object.entries(node).map(([key, value]) => {
      const fullPath = parentPath ? `${parentPath}/${key}` : key

      if (typeof value === 'string') {
        // File
        return (
          <button
            key={fullPath}
            onClick={() => setActiveFile(value)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-all',
              activeFile === value
                ? 'bg-violet-600/30 text-violet-200'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/40'
            )}
          >
            {getFileIcon(key)}
            <span className="truncate font-mono">{key}</span>
          </button>
        )
      }

      // Folder
      const isOpen = openFolders[fullPath]

      return (
        <div key={fullPath}>
          <button
            onClick={() => toggleFolder(fullPath)}
            className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-gray-400 hover:text-gray-200"
          >
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span className="font-medium">{key}</span>
          </button>

          {isOpen && (
            <div className="ml-4 space-y-0.5">
              {renderTree(value, fullPath)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        'bg-[#0f1117] border border-gray-700/60 rounded-2xl overflow-hidden shadow-2xl',
        expanded ? 'fixed inset-4 z-50' : 'w-full mt-4'
      )}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/60 bg-gray-900/60">
        <span className="text-xs text-gray-400 font-mono">
          {files.length} file{files.length !== 1 ? 's' : ''} generated
        </span>

        <div className="flex items-center gap-2">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={downloadUrl}
            download="code-files.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            <Download className="w-4 h-4" />
            Download ZIP
          </motion.a>

          <button
            onClick={() => setExpanded((e) => !e)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-200"
          >
            {expanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="flex"
        style={{ height: expanded ? 'calc(100% - 49px)' : '500px' }}
      >
        {/* SIDEBAR */}
        <div className="w-60 border-r border-gray-700/60 bg-gray-900/40 overflow-y-auto p-2">
          {renderTree(tree)}
        </div>

        {/* CODE PANEL */}
        <div className="flex-1 overflow-auto">
          {current && (
            <SyntaxHighlighter
              language={getLanguage(current.name)}
              style={vscDarkPlus}
              showLineNumbers
              wrapLines
              customStyle={{
                margin: 0,
                padding: '20px',
                background: 'transparent',
                fontSize: '13px'
              }}
              lineNumberStyle={{
                color: '#6b7280',
                paddingRight: '16px'
              }}
            >
              {current.content}
            </SyntaxHighlighter>
          )}
        </div>
      </div>
    </motion.div>
  )
}