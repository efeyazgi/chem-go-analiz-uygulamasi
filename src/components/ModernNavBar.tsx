import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useState } from 'react'

export function ModernNavBar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Dinamik nav linkleri - admin için ekstra linkler
  const baseNavLinks = [
    { path: '/', label: '🏠 Panel', icon: '🏠' },
    { path: '/gas', label: '💨 Gaz Deneyi', icon: '💨' },
    { path: '/daniell', label: '⚡ Daniell Pili', icon: '⚡' },
    { path: '/import', label: '📁 İçe Aktar', icon: '📁' },
    { path: '/doe', label: '🧪 DOE', icon: '🧪' },
    { path: '/prediction', label: '🔮 Tahmin', icon: '🔮' },
    { path: '/history', label: '📋 Geçmiş', icon: '📋' },
    { path: '/data-management', label: '🗏️ Veri Yönetimi', icon: '🗏️' },
    { path: '/howto', label: '❓ Yardım', icon: '❓' }
  ]
  
  const adminNavLinks = [
    { path: '/analysis', label: '📊 Analiz', icon: '📊' },
    { path: '/user-management', label: '👥 Kullanıcılar', icon: '👥' }
  ]
  
  const navLinks = user?.isAdmin 
    ? [...baseNavLinks.slice(0, -1), ...adminNavLinks, baseNavLinks[baseNavLinks.length - 1]]
    : baseNavLinks

  const navLinkStyle = (isActive: boolean) => ({
    padding: '10px 16px',
    borderRadius: 8,
    textDecoration: 'none',
    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
    background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    fontWeight: isActive ? '600' : '500',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    backdropFilter: isActive ? 'blur(10px)' : 'none',
    border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
    boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
    whiteSpace: 'nowrap' as const
  })

  const mobileNavLinkStyle = (isActive: boolean) => ({
    display: 'block',
    padding: '12px 20px',
    borderRadius: 8,
    textDecoration: 'none',
    color: isActive ? '#3b82f6' : '#374151',
    background: isActive ? '#eff6ff' : 'transparent',
    fontWeight: isActive ? '600' : '500',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    margin: '4px 0'
  })

  return (
    <>
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '16px 32px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%'
      }}>
        {/* Logo */}
        <div style={{ 
          fontSize: '22px', 
          fontWeight: '700', 
          color: '#ffffff',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          letterSpacing: '-0.5px'
        }}>
          🧪 Chem GO Analiz Uygulaması
        </div>

        {/* Desktop Navigation */}
        {user && (
          <>
            {/* Desktop Links - Hidden on mobile */}
            <div style={{ 
              display: 'flex', 
              gap: 4,
              alignItems: 'center'
            }} className="desktop-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={navLinkStyle(location.pathname === link.path)}
                  onMouseEnter={(e) => {
                    if (location.pathname !== link.path) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== link.path) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 8,
                padding: '10px',
                color: '#ffffff',
                fontSize: '18px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
              className="mobile-menu-button"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </>
        )}

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user ? (
            <>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '8px 16px',
                borderRadius: 20,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }} className="user-info">
                <span style={{ fontSize: '16px' }}>👤</span>
                <span style={{ 
                  color: '#ffffff', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  maxWidth: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.email}
                </span>
              </div>
              <button 
                onClick={logout}
                className="logout-btn"
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ef4444'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)'
                }}
              >
                🚪 Çıkış
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              style={{
                padding: '10px 20px',
                background: '#10b981',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: 8,
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#059669'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#10b981'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
            >
              🔐 Giriş
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '85px', // NavBar height offset
          left: 0,
          right: 0,
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          zIndex: 999,
          padding: '16px 32px'
        }} className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={mobileNavLinkStyle(location.pathname === link.path)}
              onClick={() => setMobileMenuOpen(false)}
              onMouseEnter={(e) => {
                if (location.pathname !== link.path) {
                  e.currentTarget.style.background = '#f8fafc'
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== link.path) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{ marginRight: '12px' }}>{link.icon}</span>
              {link.label.replace(/^[^\s]+ /, '')} {/* Remove emoji from mobile */}
            </Link>
          ))}
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 998
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 1280px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
        }
        
        @media (max-width: 768px) {
          nav {
            padding: 12px 16px !important;
          }
          
          nav > div:first-child {
            font-size: 18px !important;
          }
          
          .mobile-menu {
            padding: 12px 16px !important;
            top: 70px !important;
          }
          
          .user-info {
            display: none !important;
          }
          
          .logout-btn {
            padding: 6px 12px !important;
            font-size: 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          nav {
            padding: 8px 12px !important;
          }
          
          nav > div:first-child {
            font-size: 16px !important;
          }
          
          .mobile-menu {
            padding: 8px 12px !important;
            top: 60px !important;
          }
        }
      `}</style>
    </>
  )
}