import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import Navbar from '../Navbar/Navbar'
import BottomNav from '../BottomNav/BottomNav'
import './Layout.css'

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext)

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
      {/* Show footer on desktop, bottom nav on mobile */}
      <footer className="footer">
        <div className="container">
          <p>© 2025 PdLis - Turn your study PDFs into smart audio summaries</p>
        </div>
      </footer>
      {user && <BottomNav />}
    </div>
  )
}

export default Layout