import api from './api'

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async signup(userData) {
    try {
      const response = await api.post('/auth/signup', userData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      return JSON.parse(userStr)
    }
    return null
  }

  getToken() {
    return localStorage.getItem('token')
  }

  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'Authentication failed')
    } else if (error.request) {
      return new Error('Unable to connect to server')
    } else {
      return new Error(error.message || 'Authentication failed')
    }
  }
}

export default new AuthService()