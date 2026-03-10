import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L3 9L12 15L21 9L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 9V19L12 25L21 19V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Home</span>
      </NavLink>

      <NavLink to="/notes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8H16V10H8V8Z" fill="currentColor"/>
          <path d="M8 12H16V14H8V12Z" fill="currentColor"/>
          <path d="M8 16H13V18H8V16Z" fill="currentColor"/>
        </svg>
        <span>Notes</span>
      </NavLink>

      <NavLink to="/audio" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 7V15C16 17.2091 14.2091 19 12 19C9.79086 19 8 17.2091 8 15V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 11V15C20 19.4183 16.4183 23 12 23C7.58172 23 4 19.4183 4 15V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Audio</span>
      </NavLink>
    </nav>
  )
}

export default BottomNav