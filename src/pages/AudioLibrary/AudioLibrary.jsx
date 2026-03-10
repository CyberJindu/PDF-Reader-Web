import { useState, useEffect } from 'react'
import Layout from '../../components/Layout/Layout'
import AudioPlayer from '../../components/AudioPlayer/AudioPlayer'
import uploadService from '../../services/upload'
import { downloadFile, generateFilename } from '../../utils/download' // Add this import
import './AudioLibrary.css'

const AudioLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [playingAudio, setPlayingAudio] = useState(null)
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [audioTracks, setAudioTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloadingTrackId, setDownloadingTrackId] = useState(null) // Add this

  useEffect(() => {
    fetchAudioTracks()
  }, [])

  const fetchAudioTracks = async () => {
    try {
      setLoading(true)
      const response = await uploadService.getUserUploads()
      if (response.success) {
        setAudioTracks(response.data || [])
      } else {
        setError('Failed to load audio tracks')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...new Set(audioTracks.map(track => track.category || 'uncategorized').filter(Boolean))]

  const handlePlayAudio = (track) => {
    setPlayingAudio(track.audioUrl)
    setSelectedTrack(track)
  }

  const handleDownload = async (track) => {
    if (!track.audioUrl) {
      alert('Audio file not available for download')
      return
    }
    
    // Set downloading state for this specific track
    setDownloadingTrackId(track._id)
    
    try {
      const filename = generateFilename(track.title || 'audio-summary', 'mp3')
      await downloadFile(track.audioUrl, filename)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download audio. Please try again.')
    } finally {
      setDownloadingTrackId(null)
    }
  }

  const handleDelete = async (trackId) => {
    if (window.confirm('Are you sure you want to delete this audio?')) {
      try {
        await uploadService.deleteUpload(trackId)
        setAudioTracks(audioTracks.filter(track => track._id !== trackId))
        if (selectedTrack?._id === trackId) {
          setSelectedTrack(null)
          setPlayingAudio(null)
        }
      } catch (err) {
        alert('Failed to delete audio: ' + err.message)
      }
    }
  }

  const handleClosePlayer = () => {
    setSelectedTrack(null)
    setPlayingAudio(null)
  }

  const filteredTracks = audioTracks.filter(track => {
    const matchesSearch = track.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || track.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 MB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <Layout>
        <div className="audio-library">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your audio library...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="audio-library">
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button onClick={fetchAudioTracks} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="audio-library">
        <div className="library-header">
          <h1 className="library-title">Audio Library</h1>
          <p className="library-subtitle">
            Listen to your summarized content anywhere, anytime
          </p>
        </div>

        <div className="library-controls">
          <div className="search-section">
            <div className="search-bar">
              <span className="search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search audio tracks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {categories.length > 1 && (
              <div className="category-filters">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="library-stats">
            <span className="tracks-count">
              {filteredTracks.length} {filteredTracks.length === 1 ? 'track' : 'tracks'}
            </span>
          </div>
        </div>

        {filteredTracks.length > 0 ? (
          <div className="tracks-grid">
            {filteredTracks.map(track => (
              <div key={track._id} className="track-card">
                <div className="track-thumbnail"> 
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20V20H4V4Z" stroke="var(--purple-dark)" strokeWidth="2"/>
                    <path d="M8 8H16V10H8V8Z" fill="var(--purple-dark)"/>
                    <path d="M8 12H16V14H8V12Z" fill="var(--purple-dark)"/>
                    <path d="M8 16H13V18H8V16Z" fill="var(--purple-dark)"/>
                  </svg>
                </div>
                
                <div className="track-info">
                  <h3 className="track-title">{track.title || 'Untitled'}</h3>
                  <p className="track-summary">{track.summary?.substring(0, 100)}...</p>
                  
                  <div className="track-meta">
                    <span className="track-category">{track.category || 'Uncategorized'}</span>
                    <span className="track-duration">{track.audioDuration || '0:00'}</span>
                    <span className="track-plays">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M5 20V18C5 14.6863 7.68629 12 11 12H13C16.3137 12 19 14.6863 19 18V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      {track.plays || 0}
                    </span>
                    <span className="track-size">{formatFileSize(track.audioSize)}</span>
                    <span className="track-date">{formatDate(track.createdAt)}</span>
                  </div>
                </div>

                <div className="track-actions">
                  <button 
                    className="action-btn play-btn"
                    onClick={() => handlePlayAudio(track)}
                    title="Play"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                    </svg>
                  </button>
                  
                  <button 
                    className={`action-btn download-btn ${downloadingTrackId === track._id ? 'downloading' : ''}`}
                    onClick={() => handleDownload(track)}
                    title="Download"
                    disabled={downloadingTrackId === track._id}
                  >
                    {downloadingTrackId === track._id ? (
                      <span className="downloading-indicator">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="spinner">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="32" strokeDashoffset="32">
                            <animate attributeName="stroke-dashoffset" dur="1s" values="32;0" repeatCount="indefinite" />
                          </circle>
                        </svg>
                      </span>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 17V20H20V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 12L12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                  
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(track._id)}
                    title="Delete"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7H9V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-tracks">
            <div className="no-tracks-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3V15" stroke="var(--purple-dark)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 7V15C16 17.2091 14.2091 19 12 19C9.79086 19 8 17.2091 8 15V7" stroke="var(--purple-dark)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 11V15C20 19.4183 16.4183 23 12 23C7.58172 23 4 19.4183 4 15V11" stroke="var(--purple-dark)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="no-tracks-title">No audio tracks found</h3>
            <p className="no-tracks-text">
              {searchTerm 
                ? 'No tracks match your search criteria'
                : 'Upload a PDF to generate your first audio summary'}
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

        {selectedTrack && playingAudio && (
          <div className="audio-player-fixed">
            <AudioPlayer
              audioUrl={playingAudio}
              title={selectedTrack.title || 'Audio Track'}
              onClose={handleClosePlayer}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AudioLibrary