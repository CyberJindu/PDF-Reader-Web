import { useState, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import NoteCard from '../../components/NoteCard/NoteCard'
import AudioPlayer from '../../components/AudioPlayer/AudioPlayer'
import uploadService from '../../services/upload'
import './Notes.css'

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedNote, setSelectedNote] = useState(null)
  const [playingAudio, setPlayingAudio] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await uploadService.getUserUploads()
      if (response.success) {
        setNotes(response.data || [])
      } else {
        setError('Failed to load notes')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // FIX: Removed 'favorites' and 'archived' from filters
  const filters = ['all', 'recent']

  const handlePlayAudio = (note) => {
    setPlayingAudio(note.audioUrl)
    setSelectedNote(note)
  }

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await uploadService.deleteUpload(noteId)
        setNotes(notes.filter(note => note._id !== noteId))
        if (selectedNote?._id === noteId) {
          setSelectedNote(null)
          setPlayingAudio(null)
        }
      } catch (err) {
        alert('Failed to delete note: ' + err.message)
      }
    }
  }

  const handleClosePlayer = () => {
    setSelectedNote(null)
    setPlayingAudio(null)
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (note.tags || []).some(tag => tag?.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'recent') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return matchesSearch && new Date(note.createdAt) > sevenDaysAgo
    }
    // FIX: Removed favorites and archived conditions
    return matchesSearch
  })

  if (loading) {
    return (
      <Layout>
        <div className="notes-page">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your notes...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="notes-page">
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button onClick={fetchNotes} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="notes-page">
        <div className="notes-header">
          <h1 className="notes-title">My Notes</h1>
          <p className="notes-subtitle">
            All your AI-generated summaries in one place
          </p>
        </div>

        <div className="notes-controls">
          <div className="search-bar">
            <span className="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search notes by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            {filters.map(filter => (
              <button
                key={filter}
                className={`filter-btn ${selectedFilter === filter ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter === 'all' ? 'All Notes' : 'Recent'}
              </button>
            ))}
          </div>
        </div>

        <div className="notes-stats">
          <span className="stats-count">
            Showing {filteredNotes.length} of {notes.length} notes
          </span>
        </div>

        {filteredNotes.length > 0 ? (
          <div className="notes-grid">
            {filteredNotes.map(note => (
              <NoteCard
                key={note._id}
                note={{
                  id: note._id,
                  title: note.title,
                  summary: note.summary,
                  createdAt: note.createdAt,
                  pages: note.pages,
                  tags: note.tags || [],
                  audioUrl: note.audioUrl,
                  audioDuration: note.audioDuration,
                  pdfUrl: note.pdfUrl,        
                  pdfPublicId: note.pdfPublicId
                }}
                onPlayAudio={() => handlePlayAudio(note)}
                onDelete={() => handleDeleteNote(note._id)}
              />
            ))}
          </div>
        ) : (
          <div className="no-notes">
            <div className="no-notes-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20V20H4V4Z" stroke="var(--purple-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 8H16V10H8V8Z" fill="var(--purple-dark)"/>
                <path d="M8 12H16V14H8V12Z" fill="var(--purple-dark)"/>
                <path d="M8 16H13V18H8V16Z" fill="var(--purple-dark)"/>
              </svg>
            </div>
            <h3 className="no-notes-title">No notes found</h3>
            <p className="no-notes-text">
              {searchTerm 
                ? 'Try adjusting your search or filters'
                : 'Upload your first PDF to get started'}
            </p>
            {!searchTerm && (
              <button 
                className="upload-first-btn"
                onClick={() => window.location.href = '/'}
              >
                Upload PDF
              </button>
            )}
          </div>
        )}

        {selectedNote && playingAudio && (
          <div className="audio-player-fixed">
            <AudioPlayer
              audioUrl={playingAudio}
              title={selectedNote.title}
              onClose={handleClosePlayer}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Notes