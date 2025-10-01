import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Link } from 'react-router-dom'
import { MonthSelector } from '../components/MonthSelector'
import { useAuth } from '../lib/auth'

// Global dashboard refresh fonksiyonu
let globalRefreshDashboard: (() => void) | null = null

export const refreshDashboard = () => {
  if (globalRefreshDashboard) {
    globalRefreshDashboard()
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [weekTag, setWeekTag] = useState<string>(isoWeekTag(new Date()))
  const [gasCount, setGasCount] = useState<number>(0)
  const [daniellCount, setDaniellCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [monthDataCounts, setMonthDataCounts] = useState<Record<string, number>>({})

  // Global refresh fonksiyonunu bu component'e bağla
  useEffect(() => {
    globalRefreshDashboard = () => {
      console.log('Dashboard refresh tetiklendi')
      setRefreshTrigger(prev => prev + 1)
    }
    
    // Cleanup
    return () => {
      globalRefreshDashboard = null
    }
  }, [])

  // Mevcut ayları ve veri sayılarını yükle
  useEffect(() => {
    const loadAvailableMonths = async () => {
      try {
        const runsRef = collection(db, 'runs')
        const allRunsSnap = await getDocs(runsRef)
        const monthCounts: Record<string, number> = {}
        
        allRunsSnap.docs.forEach(doc => {
          const data = doc.data()
          if (data.weekTag) {
            monthCounts[data.weekTag] = (monthCounts[data.weekTag] || 0) + 1
          }
        })
        
        const sortedMonths = Object.keys(monthCounts).sort()
        setAvailableMonths(sortedMonths)
        setMonthDataCounts(monthCounts)
        console.log('Mevcut aylar ve veri sayıları:', monthCounts)
      } catch (err: any) {
        console.error('Mevcut aylar yüklenirken hata:', err)
      }
    }
    
    loadAvailableMonths()
  }, [refreshTrigger])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError('')
      
      try {
        console.log('Dashboard veri yükleniyor - weekTag:', weekTag)
        const runsRef = collection(db, 'runs')
        const qGas = query(runsRef, where('weekTag', '==', weekTag), where('type', '==', 'gas'))
        const qDan = query(runsRef, where('weekTag', '==', weekTag), where('type', '==', 'daniell'))
        const [g, d] = await Promise.all([getDocs(qGas), getDocs(qDan)])
        console.log('Gas count:', g.size, 'Daniell count:', d.size)
        setGasCount(g.size)
        setDaniellCount(d.size)
      } catch (err: any) {
        console.error('Veri yükleme hatası:', err)
        setError('Veriler yüklenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'))
      } finally {
        setIsLoading(false)
      }
    }
    
    load()
  }, [weekTag, refreshTrigger])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        padding: 32,
        marginBottom: 32,
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ margin: '0 0 16px 0', fontSize: 32, fontWeight: 'bold', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          🏠 Gösterge Paneli
        </h1>
        <p style={{ margin: 0, fontSize: 18, opacity: 0.9 }}>
          Kimya deney verilerinizi takip edin ve analiz edin
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
          color: '#991b1b'
        }}>
          ✗ {error}
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
            📅 Ay Filtresi
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 'bold', color: '#374151', minWidth: 'fit-content' }}>Seçili Ay:</label>
            <MonthSelector 
              selectedMonth={weekTag}
              onMonthChange={setWeekTag}
              availableMonths={availableMonths}
              monthDataCounts={monthDataCounts}
            />
            <div style={{ 
              fontSize: 14, 
              color: '#6b7280',
              padding: '8px 12px',
              background: '#f8fafc',
              borderRadius: 6,
              border: '1px solid #e2e8f0'
            }}>
              {availableMonths.length} ay'da veri mevcut
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Gaz Deneyi Kartı */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: 16,
          padding: 24,
          color: 'white',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.2 }}>💨</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 'bold' }}>Gaz Deneyi</h3>
            <div style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 8 }}>
              {isLoading ? '...' : gasCount}
            </div>
            <p style={{ margin: '0 0 16px 0', opacity: 0.9, fontSize: 14 }}>Bu hafta kaydedilen deney sayısı</p>
            <Link 
              to="/gas" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: 8,
                color: 'white',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 'bold',
                backdropFilter: 'blur(10px)'
              }}
            >
              ➕ Yeni Deney Ekle
            </Link>
          </div>
        </div>

        {/* Daniell Pili Kartı */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: 16,
          padding: 24,
          color: 'white',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.2 }}>⚡</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 'bold' }}>Daniell Pili Deneyi</h3>
            <div style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 8 }}>
              {isLoading ? '...' : daniellCount}
            </div>
            <p style={{ margin: '0 0 16px 0', opacity: 0.9, fontSize: 14 }}>Bu hafta kaydedilen pil sayısı</p>
            <Link 
              to="/daniell" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: 8,
                color: 'white',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 'bold',
                backdropFilter: 'blur(10px)'
              }}
            >
              ➕ Yeni Pil Ekle
            </Link>
          </div>
        </div>

        {/* Toplam Kartı */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: 16,
          padding: 24,
          color: 'white',
          boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.2 }}>📊</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 'bold' }}>Toplam</h3>
            <div style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 8 }}>
              {isLoading ? '...' : gasCount + daniellCount}
            </div>
            <p style={{ margin: '0 0 16px 0', opacity: 0.9, fontSize: 14 }}>Bu hafta toplam deney sayısı</p>
            {user?.isAdmin && (
              <Link 
                to="/analysis" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '8px 16px',
                  borderRadius: 8,
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 'bold',
                  backdropFilter: 'blur(10px)'
                }}
              >
                🔍 Analiz Et
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Hızlı Erişim Aksiyonları */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚡ Hızlı Erişim
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <QuickLink to="/gas" emoji="💨" title="Gaz Deneyi" subtitle="Yeni kayıt gir" />
          <QuickLink to="/daniell" emoji="⚡" title="Daniell Pili Deneyi" subtitle="Yeni kayıt gir" />
          <QuickLink to="/doe" emoji="🧪" title="DOE Paneli" subtitle="Plan oluştur" />
          <QuickLink to="/prediction" emoji="🔮" title="Tahmin" subtitle="Model tabanlı" />
          <QuickLink to="/history" emoji="📋" title="Geçmiş" subtitle="Kayıt listesi" />
          <QuickLink to="/import" emoji="📁" title="Veri İçe Aktar" subtitle="Excel/CSV" />
          <QuickLink to="/analysis" emoji="📊" title="Veri Analizi" subtitle="Grafikler" adminOnly />
          <QuickLink to="/data-management" emoji="🗂️" title="Veri Yönetimi" subtitle="Kayıt işlemleri" />
          <QuickLink to="/howto" emoji="❓" title="Yardım" subtitle="Kılavuz" />
          <QuickLink to="/user-management" emoji="👥" title="Kullanıcılar" subtitle="Rol yönetimi" adminOnly />
        </div>
      </div>
      
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: 24,
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔄</div>
            <div>Veriler yükleniyor...</div>
          </div>
        </div>
      )}
    </div>
  )
}

function QuickLink({ to, emoji, title, subtitle, adminOnly }: { to: string, emoji: string, title: string, subtitle: string, adminOnly?: boolean }) {
  const { user } = useAuth()
  if (adminOnly && !user?.isAdmin) return null
  return (
    <Link 
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: 16,
        background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 8,
        textDecoration: 'none', color: '#1f2937', transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = '#e2e8f0'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = '#f8fafc'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      <div style={{ fontSize: 24 }}>{emoji}</div>
      <div>
        <div style={{ fontWeight: 'bold' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{subtitle}</div>
      </div>
    </Link>
  )
}

function isoWeekTag(d: Date) {
  const year = d.getFullYear()
  const month = d.getMonth() + 1 // 1-12
  return `${year}-${String(month).padStart(2, '0')}`
}
