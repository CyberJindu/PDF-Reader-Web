import { useState, useRef, useEffect } from 'react'
import { downloadFile, generateFilename } from '../../utils/download'
import './AudioPlayer.css'

const AudioPlayer = ({ audioUrl, title, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const audioRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate)
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
      audioRef.current.addEventListener('ended', handleEnded)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate)
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audioRef.current.removeEventListener('ended', handleEnded)
      }
    }
  }, [])

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e) => {
    const progressBar = progressRef.current
    const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth
    const newTime = clickPosition * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    audioRef.current.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume || 0.5
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleDownload = async () => {
    if (!audioUrl) return
    
    setIsDownloading(true)
    const filename = generateFilename(title || 'audio-summary', 'mp3')
    await downloadFile(audioUrl, filename)
    setIsDownloading(false)
  }

  return (
    <div className="audio-player">
      <div className="audio-player-header">
        <h4 className="audio-player-title">{title || 'Audio Summary'}</h4>
        {onClose && (
          <button onClick={onClose} className="close-player" title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      <audio ref={audioRef} src={audioUrl} />

      <div className="player-controls">
        <button onClick={togglePlay} className="play-pause-btn">
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="5" width="4" height="14" fill="currentColor"/>
              <rect x="14" y="5" width="4" height="14" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
            </svg>
          )}
        </button>

        <div className="progress-container">
          <span className="time-current">{formatTime(currentTime)}</span>
          <div 
            ref={progressRef}
            className="progress-bar"
            onClick={handleProgressClick}
          >
            <div 
              className="progress-filled"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>
          <span className="time-total">{formatTime(duration)}</span>
        </div>

        <div className="volume-control">
          <button onClick={toggleMute} className="volume-btn">
            {isMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10V14H7L12 19V5L7 10H3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M16 9L21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M21 9L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : volume > 0.5 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10V14H7L12 19V5L7 10H3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M15 8C16.5 9.5 16.5 14.5 15 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18 5C21 8 21 16 18 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10V14H7L12 19V5L7 10H3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M15 8C16 9 16 15 15 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>

        <button 
          onClick={handleDownload} 
          className={`download-btn ${isDownloading ? 'downloading' : ''}`} 
          title="Download audio"
          disabled={isDownloading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 17V20H20V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 12L12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {isDownloading ? 'Downloading...' : ''}
        </button>
      </div>
    </div>
  )
}

export default AudioPlayer