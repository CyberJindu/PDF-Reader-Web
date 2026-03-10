import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './NoteCard.css'

const NoteCard = ({ note, onPlayAudio, onDelete }) => {
  const [expanded, setExpanded] = useState(false)

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const truncateSummary = (text, maxLength = 300) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  // Custom components for markdown rendering
  const MarkdownComponents = {
    // Headers with proper styling
    h1: ({node, ...props}) => <h1 className="markdown-h1" {...props} />,
    h2: ({node, ...props}) => <h2 className="markdown-h2" {...props} />,
    h3: ({node, ...props}) => <h3 className="markdown-h3" {...props} />,
    h4: ({node, ...props}) => <h4 className="markdown-h4" {...props} />,
    
    // Text formatting
    strong: ({node, ...props}) => <strong className="markdown-strong" {...props} />,
    em: ({node, ...props}) => <em className="markdown-em" {...props} />,
    p: ({node, ...props}) => <p className="markdown-paragraph" {...props} />,
    
    // Lists
    ul: ({node, ...props}) => <ul className="markdown-list" {...props} />,
    ol: ({node, ...props}) => <ol className="markdown-list" {...props} />,
    li: ({node, ...props}) => <li className="markdown-list-item" {...props} />,
    
    // Horizontal rule
    hr: ({node, ...props}) => <hr className="markdown-hr" {...props} />,
    
    // Code blocks
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
        <div className="note-summary markdown-body">
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
      </div>
    </div>
  )
}

export default NoteCard