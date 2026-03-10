import { Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <img src="/logo.svg" alt="PdLis Logo" className="logo-img" />
          <span className="logo-text">PdLis</span>
        </Link>

        {/* Desktop Navigation Links - Only show when user is logged in */}
        {user && (
          <ul className="nav-links desktop-nav">
            <li>
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li>
              <Link to="/notes" className="nav-link">Notes</Link>
            </li>
            <li>
              <Link to="/audio" className="nav-link">Audio</Link>
            </li>
          </ul>
        )}

        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <span className="user-email">{user.email}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/signup" className="btn-signup">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar