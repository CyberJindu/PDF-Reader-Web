import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import uploadService from '../../services/upload'
import './UploadArea.css'

const UploadArea = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({
    status: '',
    progress: 0,
    message: ''
  })
  const [error, setError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const navigate = useNavigate()

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const validateFile = (file) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return false
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File size should be less than 50MB')
      return false
    }
    setError('')
    return true
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadSuccess(false)
    setUploadProgress({
      status: 'uploading',
      progress: 0,
      message: 'Starting upload...'
    })

    try {
      const result = await uploadService.uploadPDF(file, (progressData) => {
        setUploadProgress(progressData)
        
        // If we get a completed status from the progress updates
        if (progressData.status === 'completed') {
          setUploadSuccess(true)
        }
      })
      
      // Check if we got a successful result
      if (result && (result.success || result.data)) {
        setUploadSuccess(true)
        setUploadProgress({
          status: 'completed',
          progress: 100,
          message: 'Summary Completed!'
        })
        
        // Short delay to show success message before redirect
        setTimeout(() => {
          navigate('/notes')
        }, 1500)
      } else {
        throw new Error('Upload failed - invalid response')
      }
      
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed. Please try again.')
      setUploading(false)
      setUploadSuccess(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError('')
    setUploadProgress({
      status: '',
      progress: 0,
      message: ''
    })
    setUploadSuccess(false)
  }

  // Get status message for display
  const getStatusMessage = () => {
    // FIX: Show "Summary Completed!" when done
    if (uploadSuccess) return 'Summary Completed!'
    
    const messages = {
      'uploading': 'Uploading PDF...',
      'processing': 'Extracting text from PDF...',
      'summarizing': 'Generating AI summary...',
      'generating-audio': 'Creating audio summary...',
      'uploading-files': 'Saving your files...',
      'completed': 'Summary Completed!'
    }
    return messages[uploadProgress.status] || uploadProgress.message || 'Processing...'
  }

  // Done/Checkmark icon component
  const DoneIcon = () => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="done-icon"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path 
        d="M8 12L11 15L16 9" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )

  return (
    <div className="upload-area">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'file-selected' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          className="file-input"
          accept=".pdf"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        
        {!file ? (
          <label htmlFor="file-input" className="drop-zone-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20V20H4V4Z" stroke="var(--purple-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 8H16V10H8V8Z" fill="var(--purple-dark)"/>
              <path d="M8 12H16V14H8V12Z" fill="var(--purple-dark)"/>
              <path d="M8 16H13V18H8V16Z" fill="var(--purple-dark)"/>
              <path d="M16 8L20 12L16 16" stroke="var(--purple-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 16L4 12L8 8" stroke="var(--purple-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="drop-text">
              Drag & drop your PDF here or <span className="browse-text">browse</span>
            </p>
            <p className="file-info">Maximum file size: 50MB</p>
          </label>
        ) : (
          <div className="file-preview">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20V20H4V4Z" stroke="var(--purple-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 8H16V10H8V8Z" fill="var(--purple-dark)"/>
              <path d="M8 12H16V14H8V12Z" fill="var(--purple-dark)"/>
              <path d="M8 16H13V18H8V16Z" fill="var(--purple-dark)"/>
            </svg>
            <div className="file-details">
              <p className="file-name">{file.name}</p>
              <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!uploading && (
              <button onClick={handleRemoveFile} className="remove-file" title="Remove file">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      {file && !uploading && (
        <button onClick={handleUpload} className="upload-button">
          Upload and Summarize
        </button>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress.progress}%` }}
            ></div>
          </div>
          
          <div className="progress-status-container">
            {uploadSuccess ? (
              <>
                <DoneIcon />
                <p className="progress-status success">
                  {getStatusMessage()}
                </p>
              </>
            ) : (
              <p className="progress-status">
                {getStatusMessage()} {!uploadSuccess && `(${uploadProgress.progress}%)`}
              </p>
            )}
          </div>
          
          {uploadProgress.status === 'generating-audio' && !uploadSuccess && (
            <p className="progress-hint">This may take a minute...</p>
          )}
          
          {uploadSuccess && (
            <p className="redirect-hint">Redirecting to your notes...</p>
          )}
        </div>
      )}
    </div>
  )
}

export default UploadArea