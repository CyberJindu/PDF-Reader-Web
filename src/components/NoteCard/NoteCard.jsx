import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import html2pdf from 'html2pdf.js'
import './NoteCard.css'

const NoteCard = ({ note, onPlayAudio, onDelete }) => {
  const [expanded, setExpanded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const summaryRef = useRef(null)

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const truncateSummary = (text, maxLength = 300) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  const handleDownloadPDF = async () => {
    if (!summaryRef.current) return
    
    setIsDownloading(true)
    
    try {
      // Get the raw text content instead of HTML with classes
      const summaryText = summaryRef.current.innerText || summaryRef.current.textContent
      
      // Create a dedicated container for PDF with INLINE STYLES only
      const pdfElement = document.createElement('div')
      pdfElement.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 800px;
        background: white;
        padding: 40px;
        font-family: 'Inter', 'Helvetica', 'Arial', sans-serif;
        line-height: 1.6;
        color: #333333;
      `
      
      // Process the summary to maintain some formatting
      // Convert markdown-style formatting to styled HTML
      const formattedContent = summaryText
        .split('\n')
        .map(line => {
          if (line.startsWith('# ')) {
            return `<h1 style="color: #4A1D6D; font-size: 28px; font-weight: 700; margin: 20px 0 10px 0;">${line.substring(2)}</h1>`
          } else if (line.startsWith('## ')) {
            return `<h2 style="color: #4A1D6D; font-size: 24px; font-weight: 600; margin: 15px 0 8px 0;">${line.substring(3)}</h2>`
          } else if (line.startsWith('### ')) {
            return `<h3 style="color: #4A1D6D; font-size: 20px; font-weight: 600; margin: 12px 0 6px 0;">${line.substring(4)}</h3>`
          } else if (line.startsWith('- ')) {
            return `<li style="margin-left: 20px; list-style-type: disc;">${line.substring(2)}</li>`
          } else if (line.match(/^\d+\. /)) {
            return `<li style="margin-left: 20px; list-style-type: decimal;">${line.substring(line.indexOf('.') + 2)}</li>`
          } else if (line.startsWith('**') && line.endsWith('**')) {
            return `<p><strong style="font-weight: 700; color: #4A1D6D;">${line.substring(2, line.length - 2)}</strong></p>`
          } else if (line.startsWith('*') && line.endsWith('*')) {
            return `<p><em style="font-style: italic;">${line.substring(1, line.length - 1)}</em></p>`
          } else if (line.trim() === '') {
            return '<br/>'
          } else {
            return `<p style="margin: 8px 0;">${line}</p>`
          }
        })
        .join('')
      
      // Add title and metadata with inline styles
      pdfElement.innerHTML = `
        <div style="margin-bottom: 30px;">
          <h1 style="color: #4A1D6D; font-size: 32px; margin: 0 0 10px 0; font-weight: 700;">${note.title || 'Summary'}</h1>
          <div style="color: #666666; font-size: 14px; padding-bottom: 15px; border-bottom: 2px solid #4A1D6D;">
            Created: ${formatDate(note.createdAt)} • ${note.pages || '?'} pages
          </div>
        </div>
        <div style="font-size: 14px; color: #333333;">
          ${formattedContent}
        </div>
      `
      
      document.body.appendChild(pdfElement)
      
      // PDF options
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${note.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'summary'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          letterRendering: true,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      }
      
      // Generate and save PDF
      await html2pdf().set(opt).from(pdfElement).save()
      
      // Clean up
      document.body.removeChild(pdfElement)
      
    } catch (error) {
      console.error('PDF download failed:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Custom components for markdown rendering
  const MarkdownComponents = {
    h1: ({node, ...props}) => <h1 className="markdown-h1" {...props} />,
    h2: ({node, ...props}) => <h2 className="markdown-h2" {...props} />,
    h3: ({node, ...props}) => <h3 className="markdown-h3" {...props} />,
    h4: ({node, ...props}) => <h4 className="markdown-h4" {...props} />,
    strong: ({node, ...props}) => <strong className="markdown-strong" {...props} />,
    em: ({node, ...props}) => <em className="markdown-em" {...props} />,
    p: ({node, ...props}) => <p className="markdown-paragraph" {...props} />,
    ul: ({node, ...props}) => <ul className="markdown-list" {...props} />,
    ol: ({node, ...props}) => <ol className="markdown-list" {...props} />,
    li: ({node, ...props}) => <li className="markdown-list-item" {...props} />,
    hr: ({node, ...props}) => <hr className="markdown-hr" {...props} />,
    code: ({node, inline, ...props}) => 
      inline ? 
        <code className="markdown-code-inline" {...props} /> : 
        <code className="markdown-code-block" {...props} />,
  }

  return (
    <div className="note-card">
      <div className="note-header">
        <div className="note-title-section">
          <h3 className="note-title">{note.title || 'Untitled Summary'}</h3>
          <span className="note-date">{formatDate(note.createdAt)}</span>
        </div>
        <button 
          onClick={() => onDelete(note.id)} 
          className="delete-note"
          title="Delete note"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7H9V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="note-content">
        <div 
          ref={summaryRef}
          className="note-summary markdown-body"
        >
          {expanded ? (
            <ReactMarkdown components={MarkdownComponents}>
              {note.summary}
            </ReactMarkdown>
          ) : (
            <ReactMarkdown components={MarkdownComponents}>
              {truncateSummary(note.summary)}
            </ReactMarkdown>
          )}
        </div>
        {note.summary.length > 300 && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="read-more"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {note.audioUrl && (
        <div className="note-audio-section">
          <div className="audio-info">
            <span className="audio-duration">{note.audioDuration || '2:30'}</span>
          </div>
          <div className="audio-actions">
            <button 
              onClick={() => onPlayAudio(note.audioUrl)} 
              className="play-audio"
              title="Play"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
              </svg>
              Play Summary
            </button>
          </div>
        </div>
      )}

      <div className="note-footer">
        <div className="note-tags">
          <span className="tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
              <path d="M4 4H9L20 15L15 20L4 9V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {note.pages || '?'} pages
          </span>
          {note.tags && note.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
        
        <button 
          onClick={handleDownloadPDF}
          className={`download-pdf-btn ${isDownloading ? 'downloading' : ''}`}
          disabled={isDownloading}
          title="Download as PDF"
        >
          {isDownloading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="spinner">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="32" strokeDashoffset="32">
                  <animate attributeName="stroke-dashoffset" dur="1s" values="32;0" repeatCount="indefinite" />
                </circle>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 17V20H20V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 12L12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              PDF
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default NoteCard
