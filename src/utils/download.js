// Utility function for downloading files directly without opening in browser
export const downloadFile = async (url, filename) => {
  try {
    console.log(`Downloading: ${filename} from ${url}`)
    
    // Check if it's a Cloudinary URL
    const isCloudinaryUrl = url.includes('cloudinary.com')
    
    // For Cloudinary URLs, ALWAYS use fetch + blob method to ensure filename control
    // This bypasses browser's cross-origin download restrictions
    if (isCloudinaryUrl) {
      console.log('Using blob method for Cloudinary URL to ensure correct filename')
      
      try {
        // Fetch the file as a blob
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Cloudinary fetch failed: ${response.statusText}`)
        }
        
        const blob = await response.blob()
        
        // Create a blob URL and trigger download with OUR filename
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename // This WILL work with blob URLs
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl)
        
        console.log(`✅ Downloaded with filename: ${filename}`)
        return true
      } catch (cloudinaryError) {
        console.error('Cloudinary blob download failed, trying URL method as fallback:', cloudinaryError)
        
        // Fallback: try URL modification method
        try {
          const cloudinaryUrl = new URL(url)
          
          if (cloudinaryUrl.pathname.includes('/upload/')) {
            cloudinaryUrl.pathname = cloudinaryUrl.pathname.replace(
              '/upload/',
              '/upload/fl_attachment/'
            )
          }
          
          cloudinaryUrl.searchParams.set('filename', filename)
          
          // Even with modified URL, we'll use blob method
          const fallbackResponse = await fetch(cloudinaryUrl.toString(), {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
            },
          })
          
          if (!fallbackResponse.ok) {
            throw new Error(`Fallback fetch failed: ${fallbackResponse.statusText}`)
          }
          
          const fallbackBlob = await fallbackResponse.blob()
          const fallbackBlobUrl = window.URL.createObjectURL(fallbackBlob)
          const fallbackLink = document.createElement('a')
          fallbackLink.href = fallbackBlobUrl
          fallbackLink.download = filename
          document.body.appendChild(fallbackLink)
          fallbackLink.click()
          document.body.removeChild(fallbackLink)
          window.URL.revokeObjectURL(fallbackBlobUrl)
          
          return true
        } catch (fallbackError) {
          console.error('All Cloudinary download methods failed:', fallbackError)
          throw new Error('Could not download from Cloudinary')
        }
      }
    }
    
    // For non-Cloudinary URLs, use fetch + blob method
    console.log('Using fetch + blob download method for non-Cloudinary URL')
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    
    // Create a blob URL and trigger download with OUR filename
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename // Our filename takes precedence
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl)
    
    return true
  } catch (error) {
    console.error('Download error:', error)
    
    // Ultimate fallback: open in new tab as last resort
    try {
      window.open(url, '_blank')
    } catch (fallbackError) {
      console.error('Fallback download also failed:', fallbackError)
    }
    
    return false
  }
}

// Helper to generate clean filename from title
export const generateFilename = (title, extension) => {
  if (!title) return `download.${extension}`
  
  // Remove special characters and replace spaces with hyphens
  const cleanTitle = title
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase()
    .substring(0, 100) // Limit filename length
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  
  return `${cleanTitle || 'download'}.${extension}`
}

// Simple filename generator for audio files (convenience wrapper)
export const generateAudioFilename = (title) => {
  return generateFilename(title, 'mp3')
}

// Simple filename generator for PDF files (convenience wrapper)
export const generatePdfFilename = (title) => {
  return generateFilename(title, 'pdf')
}

// Alternative method for stubborn browsers (kept for compatibility)
export const forceDownloadViaIframe = (url, filename) => {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  iframe.onload = () => {
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 5000)
  }
  document.body.appendChild(iframe)
}