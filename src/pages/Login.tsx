import { useForm } from 'react-hook-form'
import { useAuth } from '../lib/auth'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>()
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Eğer kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true)
    setErrorMessage('')
    
    try {
      await login(data.email, data.password)
      // Yönlendirme useEffect tarafından otomatik yapılacak
    } catch (error: any) {
      console.error('Login error:', error)
      setErrorMessage(
        error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' 
          ? 'E-posta veya şifre hatalı'
          : error.code === 'auth/user-not-found'
          ? 'Bu e-posta ile kayıtlı kullanıcı bulunamadı'
          : error.code === 'auth/too-many-requests'
          ? 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin'
          : 'Giriş yapılırken bir hata oluştu'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: 400,
        width: '100%',
        background: '#ffffff',
        borderRadius: 20,
        padding: 40,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Logo ve Başlık */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '48px', marginBottom: 16 }}>🧪</div>
          <h1 style={{ 
            margin: 0, 
            fontSize: 28, 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: 8
          }}>
            Chem GO Analiz Uygulaması
          </h1>
          <p style={{ 
            margin: 0, 
            color: '#6b7280', 
            fontSize: 16 
          }}>
            Hesabınıza giriş yapın
          </p>
        </div>
      
        {/* Hata Mesajı */}
        {errorMessage && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            {errorMessage}
          </div>
        )}
      
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              fontWeight: '600',
              color: '#374151',
              fontSize: 14
            }}>
              📧 E-posta
            </label>
            <input 
              type="email" 
              {...register('email', { required: 'E-posta gerekli' })} 
              style={{
                width: '100%',
                padding: '14px 16px',
                border: errors.email ? '2px solid #f56565' : '2px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 16,
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                if (!errors.email) {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                }
              }}
              onBlur={(e) => {
                if (!errors.email) {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }
              }}
              disabled={isLoading}
              placeholder="ornek@email.com"
            />
            {errors.email && (
              <span style={{ 
                color: '#f56565', 
                fontSize: 12, 
                marginTop: 4,
                display: 'block'
              }}>
                ⚠️ {errors.email.message}
              </span>
            )}
          </div>
        
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              fontWeight: '600',
              color: '#374151',
              fontSize: 14
            }}>
              🔒 Şifre
            </label>
            <input 
              type="password" 
              {...register('password', { required: 'Şifre gerekli' })} 
              style={{
                width: '100%',
                padding: '14px 16px',
                border: errors.password ? '2px solid #f56565' : '2px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 16,
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                }
              }}
              onBlur={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }
              }}
              disabled={isLoading}
              placeholder="Şifrenizi girin"
            />
            {errors.password && (
              <span style={{ 
                color: '#f56565', 
                fontSize: 12, 
                marginTop: 4,
                display: 'block'
              }}>
                ⚠️ {errors.password.message}
              </span>
            )}
          </div>
        
          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: isLoading 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isLoading 
                ? 'none' 
                : '0 4px 14px rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.3)'
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: 16,
                  height: 16,
                  border: '2px solid transparent',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Giriş yapılıyor...
              </>
            ) : (
              <>
                🚀 Giriş Yap
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  )
}
