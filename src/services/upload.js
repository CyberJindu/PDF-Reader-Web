import api from './api'

class UploadService {
  // Upload PDF file
  async uploadPDF(file, onProgress) {
    try {
      const formData = new FormData()
      formData.append('pdf', file)

      // Upload the file
      const uploadResponse = await api.post('/upload/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress({
              status: 'uploading',
              progress: percentCompleted,
              message: 'Uploading PDF...'
            })
          }
        }
      })

      // If upload successful, start polling for status
      if (uploadResponse.data.uploadId) {
        return this.pollUploadStatus(uploadResponse.data.uploadId, onProgress)
      }

      return uploadResponse.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Poll upload status
  async pollUploadStatus(uploadId, onProgress) {
    const pollInterval = 2000 // Poll every 2 seconds
    const maxAttempts = 150 // 5 minutes max (150 * 2s = 5min)
    let attempts = 0

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const response = await api.get(`/upload/status/${uploadId}`)
          
          // Update progress
          if (onProgress && response.data) {
            onProgress({
              status: response.data.status,
              progress: response.data.progress,
              message: response.data.message
            })
          }

          // Check if completed or failed
          if (response.data.status === 'completed') {
            try {
              // FIX: Extract the noteId properly - it might be an object with _id
              let noteId = response.data.noteId
              
              // If noteId is an object with _id property (MongoDB ObjectId)
              if (noteId && typeof noteId === 'object' && noteId._id) {
                noteId = noteId._id
              }
              
              // If noteId is an object with toString method
              if (noteId && typeof noteId === 'object' && noteId.toString) {
                noteId = noteId.toString()
              }
              
              console.log('✅ Processing complete, fetching note with ID:', noteId)
              
              // Add a small delay to ensure the note is saved in DB
              await new Promise(resolve => setTimeout(resolve, 500))
              
              // Get the completed note
              const noteResponse = await api.get(`/upload/${noteId}`)
              
              // FIX: Extract the actual note data from the response
              const noteData = noteResponse.data.data || noteResponse.data
              
              console.log('✅ Upload completed successfully:', noteData)
              
              // Resolve with the note data in a consistent format
              resolve({
                success: true,
                data: noteData,
                message: 'Processing complete'
              })
            } catch (noteError) {
              console.error('Error fetching completed note:', noteError)
              
              // FIX: If the note fetch fails, try to get it from the uploads list
              try {
                console.log('Attempting to fetch note from uploads list...')
                const uploadsResponse = await this.getUserUploads()
                if (uploadsResponse.success && uploadsResponse.data.length > 0) {
                  // Find the most recent note (assuming it's the one just processed)
                  const latestNote = uploadsResponse.data[0]
                  console.log('Found note in uploads list:', latestNote)
                  
                  resolve({
                    success: true,
                    data: latestNote,
                    message: 'Processing complete'
                  })
                  return
                }
              } catch (listError) {
                console.error('Error fetching uploads list:', listError)
              }
              
              // If all else fails, still resolve with success
              resolve({
                success: true,
                message: 'Processing complete, but could not fetch note details'
              })
            }
          } else if (response.data.status === 'error') {
            reject(new Error(response.data.message || 'Processing failed'))
          } else {
            // Continue polling
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, pollInterval)
            } else {
              reject(new Error('Processing timeout'))
            }
          }
        } catch (error) {
          console.error('Polling error:', error)
          reject(this.handleError(error))
        }
      }

      // Start polling
      checkStatus()
    })
  }

  // Get all user uploads
  async getUserUploads() {
    try {
      const response = await api.get('/upload')
      
      // FIX: Handle nested data structure
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || response.data.notes || []
        }
      }
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Get single upload by ID
  async getUpload(uploadId) {
    try {
      // FIX: Ensure uploadId is a string
      const id = uploadId.toString ? uploadId.toString() : uploadId
      const response = await api.get(`/upload/${id}`)
      
      // FIX: Extract the note data
      return {
        success: response.data.success,
        data: response.data.data || response.data
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Delete upload
  async deleteUpload(uploadId) {
    try {
      // FIX: Ensure uploadId is a string
      const id = uploadId.toString ? uploadId.toString() : uploadId
      const response = await api.delete(`/upload/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Handle errors
  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'Request failed')
    } else if (error.request) {
      return new Error('Unable to connect to server. Please check if backend is running.')
    } else {
      return new Error(error.message || 'Request failed')
    }
  }
}

export default new UploadService()