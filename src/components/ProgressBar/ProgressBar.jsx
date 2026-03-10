import { useState, useEffect } from 'react'
import './ProgressBar.css'

const ProgressBar = ({ status, progress }) => {
  const [message, setMessage] = useState('')

  useEffect(() => {
    switch (status) {
      case 'uploading':
        setMessage('Uploading your PDF...')
        break
      case 'processing':
        setMessage('AI is analyzing your document...')
        break
      case 'summarizing':
        setMessage('Generating smart summary...')
        break
      case 'generating-audio':
        setMessage('Creating audio version...')
        break
      case 'complete':
        setMessage('Processing complete!')
        break
      case 'error':
        setMessage('An error occurred. Please try again.')
        break
      default:
        setMessage('Preparing...')
    }
  }, [status])

  const getProgressWidth = () => {
    if (progress) return `${progress}%`
    
    switch (status) {
      case 'uploading':
        return '25%'
      case 'processing':
        return '50%'
      case 'summarizing':
        return '75%'
      case 'generating-audio':
        return '90%'
      case 'complete':
        return '100%'
      default:
        return '0%'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '🔄'
    }
  }

  return (
    <div className="progress-bar-container">
      <div className="progress-status">
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-message">{message}</span>
      </div>
      
      <div className="progress-track">
        <div 
          className={`progress-fill ${status}`}
          style={{ width: getProgressWidth() }}
        ></div>
      </div>

      {status === 'complete' && (
        <p className="progress-note">Your summary and audio are ready!</p>
      )}
      
      {status === 'error' && (
        <button className="retry-button">
          Try Again
        </button>
      )}
    </div>
  )
}

export default ProgressBar