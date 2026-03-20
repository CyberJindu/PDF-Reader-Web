import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
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
  setIsDownloading(true)
  
  try {
    // Use the FULL summary from the note prop
    const fullSummaryText = note.summary
    
    if (!fullSummaryText || fullSummaryText.length === 0) {
      alert('No content to export.')
      setIsDownloading(false)
      return
    }
    
    console.log('Full summary length:', fullSummaryText.length)
    
    // Create a temporary container for PDF rendering
    const pdfContainer = document.createElement('div')
    pdfContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 800px;
      background: white;
      padding: 40px;
      font-family: 'Inter', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333333;
      box-sizing: border-box;
    `
    
    // Process the text line by line
    const lines = fullSummaryText.split('\n')
    const formattedLines = []
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]
      
      // Check for horizontal rule (--- or ***)
      if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        formattedLines.push('<hr style="margin: 20px 0; border: 0; height: 1px; background: linear-gradient(to right, transparent, #4A1D6D, transparent);" />')
        continue
      }
      
      // Headers
      if (line.startsWith('# ')) {
        formattedLines.push(`<h1 style="color: #4A1D6D; font-size: 28px; font-weight: 700; margin: 20px 0 10px 0;">${escapeHtml(line.substring(2))}</h1>`)
        continue
      }
      if (line.startsWith('## ')) {
        formattedLines.push(`<h2 style="color: #4A1D6D; font-size: 24px; font-weight: 600; margin: 15px 0 8px 0;">${escapeHtml(line.substring(3))}</h2>`)
        continue
      }
      if (line.startsWith('### ')) {
        formattedLines.push(`<h3 style="color: #4A1D6D; font-size: 20px; font-weight: 600; margin: 12px 0 6px 0;">${escapeHtml(line.substring(4))}</h3>`)
        continue
      }
      if (line.startsWith('#### ')) {
        formattedLines.push(`<h4 style="color: #4A1D6D; font-size: 18px; font-weight: 600; margin: 10px 0 4px 0;">${escapeHtml(line.substring(5))}</h4>`)
        continue
      }
      
      // Lists
      if (line.startsWith('- ')) {
        formattedLines.push(`<div style="margin-left: 20px; margin-bottom: 4px;">• ${escapeHtml(line.substring(2))}</div>`)
        continue
      }
      if (line.match(/^\d+\. /)) {
        const match = line.match(/^(\d+)\. /)
        formattedLines.push(`<div style="margin-left: 20px; margin-bottom: 4px;">${match[1]}. ${escapeHtml(line.substring(match[0].length))}</div>`)
        continue
      }
      
      // Empty lines
      if (line.trim() === '') {
        formattedLines.push('<div style="height: 8px;"></div>')
        continue
      }
      
      // Regular text - handle inline formatting
      let formatted = escapeHtml(line)
      
      // Handle bold **text**
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #4A1D6D;">$1</strong>')
      
      // Handle italic *text* (but not when it's part of bold)
      formatted = formatted.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em style="font-style: italic;">$1</em>')
      
      // Handle inline code `code`
      formatted = formatted.replace(/`(.*?)`/g, '<code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>')
      
      formattedLines.push(`<p style="margin: 8px 0;">${formatted}</p>`)
    }
    
    const formattedContent = formattedLines.join('')
    
    pdfContainer.innerHTML = `
      <div style="margin-bottom: 30px;">
        <h1 style="color: #4A1D6D; font-size: 32px; margin: 0 0 10px 0; font-weight: 700;">${escapeHtml(note.title || 'Summary')}</h1>
        <div style="color: #666666; font-size: 14px; padding-bottom: 15px; border-bottom: 2px solid #4A1D6D;">
          Created: ${formatDate(note.createdAt)} • ${note.pages || '?'} pages
        </div>
      </div>
      <div style="font-size: 14px; color: #333333;">
        ${formattedContent}
      </div>
    `
    
    document.body.appendChild(pdfContainer)
    
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Use html2canvas to capture the element
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    })
    
    // Create PDF and add the canvas image
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    })
    
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    pdf.save(`${note.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'summary'}.pdf`)
    
    // Clean up
    document.body.removeChild(pdfContainer)
    
  } catch (error) {
    console.error('PDF download failed:', error)
    alert('Failed to download PDF. Please try again.')
  } finally {
    setIsDownloading(false)
  }
}
  
  // Helper function to escape HTML
  const escapeHtml = (text) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // Custom components for markdown rendering (keep your existing ones)
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
