import { createContext, useState, useEffect } from 'react'
import authService from '../services/auth'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = () => {
      try {
        const currentUser = authService.getCurrentUser()
        const token = authService.getToken()
        
        if (currentUser && token) {
          setUser(currentUser)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  // Login function
  const login = async (email, password) => {
    setError(null)
    setLoading(true)
    
    try {
      const response = await authService.login(email, password)
      
      if (response.success && response.user) {
        setUser(response.user)
        return { success: true }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Signup function
  const signup = async (userData) => {
    setError(null)
    setLoading(true)
    
    try {
      const response = await authService.signup(userData)
      
      if (response.success) {
        // Don't auto-login after signup, redirect to login
        return { success: true, message: response.message }
      } else {
        throw new Error(response.message || 'Signup failed')
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // Update user profile
  const updateProfile = async (profileData) => {
    setError(null)
    setLoading(true)
    
    try {
      // This will be implemented when backend is ready
      // For now, just update local user
      const updatedUser = { ...user, ...profileData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    setError(null)
    setLoading(true)
    
    try {
      const response = await authService.changePassword(currentPassword, newPassword)
      return { success: true, message: response.message }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    clearError,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider