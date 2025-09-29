import { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { refreshDashboard } from './Dashboard'
import { useAuth } from '../lib/auth'

type Run = any

export default function DataManagement() {
  const { user } = useAuth()
  const [runs, setRuns] = useState<Run[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<'all' | 'gas' | 'daniell'>('all')
  const [isDeleting, setIsDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const snap = await getDocs(collection(db, 'runs'))
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setRuns(items.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()))
    } catch (err: any) {
      setError('Veriler yüklenirken hata oluştu: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRuns = runs.filter(run => {
    if (filterType === 'all') return true
    return run.type === filterType
  })

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRuns.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredRuns.map(r => r.id)))
    }
  }

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return
    
    const confirmed = confirm(`${selectedIds.size} kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)
    if (!confirmed) return

    setIsDeleting(true)
    setError('')

    try {
      const deletePromises = Array.from(selectedIds).map(id => 
        deleteDoc(doc(db, 'runs', id))
      )
      
      await Promise.all(deletePromises)
      
      setSuccessMessage(`${selectedIds.size} kayıt başarıyla silindi.`)
      setSelectedIds(new Set())
      await loadData()
      refreshDashboard()
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError('Silme işlemi sırasında hata oluştu: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  // Erişim kontrolü
  if (!user) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, textAlign: 'center' }}>
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          color: '#92400e'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ margin: '0 0 16px 0', color: '#92400e' }}>Giriş Gerekli</h2>
          <p style={{ margin: 0, fontSize: 16 }}>
            Veri yönetimi sayfasına erişmek için giriş yapmanız gerekiyor.
          </p>
        </div>
      </div>
    )
  }

  // Sadece admin silebilir, diğerleri görüntüleyebilir
  const canDelete = user.isAdmin

  if (isLoading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 24, marginBottom: 16 }}>🔄</div>
        <div>Veriler yükleniyor...</div>
      </div>
    )
  }

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
          🗂️ Veri Yönetimi
        </h1>
        <p style={{ margin: 0, fontSize: 18, opacity: 0.9 }}>
          Tüm deney kayıtlarını görüntüleyin, filtreleyin ve yönetin
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

      {successMessage && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #a7f3d0',
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
          color: '#065f46'
        }}>
          ✓ {successMessage}
        </div>
      )}

      {/* Filtreler ve Kontroller */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h3 style={{ margin: 0, color: '#1f2937' }}>⚙️ Filtreler</h3>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              style={{
                padding: '8px 12px',
                border: '2px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14
              }}
            >
              <option value="all">Tüm Kayıtlar ({runs.length})</option>
              <option value="gas">Gaz Deneyleri ({runs.filter(r => r.type === 'gas').length})</option>
              <option value="daniell">Daniell Pilleri ({runs.filter(r => r.type === 'daniell').length})</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 14, color: '#6b7280' }}>
              {selectedIds.size} / {filteredRuns.length} seçili
            </div>
            {selectedIds.size > 0 && canDelete && (
              <button
                onClick={deleteSelected}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.6 : 1
                }}
              >
                {isDeleting ? '🔄 Siliniyor...' : `🗑️ ${selectedIds.size} Kayıdı Sil`}
              </button>
            )}
            
            {!canDelete && selectedIds.size > 0 && (
              <div style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: '500'
              }}>
                🔒 Sadece admin silebilir
              </div>
            )}
          </div>
        </div>
      </div>

      {runs.length === 0 ? (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: 8,
          padding: 24,
          textAlign: 'center',
          color: '#0369a1'
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Henüz kayıt yok</div>
          <div>Veri yönetimi yapmak için önce deney kayıtları ekleyin.</div>
        </div>
      ) : (
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {/* Tablo Başlığı */}
          <div style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid #e5e7eb',
            display: 'grid',
            gridTemplateColumns: '40px 80px 120px 120px 100px 120px 120px auto 60px',
            alignItems: 'center',
            gap: 16,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#374151'
          }}>
            <input 
              type="checkbox"
              checked={selectedIds.size === filteredRuns.length && filteredRuns.length > 0}
              onChange={toggleSelectAll}
              style={{ width: 16, height: 16 }}
            />
            <div>Tip</div>
            <div>Tarih</div>
            <div>Hafta</div>
            <div>Araç (kg)</div>
            <div>Mesafe (m)</div>
            <div>Güç/CO₂</div>
            <div>Notlar</div>
            <div>İşlemler</div>
          </div>

          {/* Tablo İçeriği */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredRuns.map((run, index) => (
              <div
                key={run.id}
                style={{
                  padding: '12px 24px',
                  borderBottom: index < filteredRuns.length - 1 ? '1px solid #e5e7eb' : 'none',
                  display: 'grid',
                  gridTemplateColumns: '40px 80px 120px 120px 100px 120px 120px auto 60px',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: 14,
                  backgroundColor: selectedIds.has(run.id) ? '#eff6ff' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f9fafb'
                  }
                }}
              >
                <input 
                  type="checkbox"
                  checked={selectedIds.has(run.id)}
                  onChange={() => toggleSelection(run.id)}
                  style={{ width: 16, height: 16 }}
                />
                
                <div style={{ 
                  padding: '4px 8px', 
                  borderRadius: 4, 
                  fontSize: 12, 
                  fontWeight: 'bold',
                  background: run.type === 'gas' ? '#dcfce7' : '#dbeafe',
                  color: run.type === 'gas' ? '#166534' : '#1e40af',
                  textAlign: 'center'
                }}>
                  {run.type === 'gas' ? '💨 Gaz' : '⚡ Pil'}
                </div>
                
                <div>{run.date || 'N/A'}</div>
                <div>{run.weekTag || 'N/A'}</div>
                <div>{run.vehicleMass_kg || 'N/A'}</div>
                <div style={{ fontWeight: 'bold', color: '#059669' }}>
                  {run.distance_m ? Number(run.distance_m).toFixed(2) : 'N/A'}
                </div>
                
                <div>
                  {run.type === 'gas' ? 
                    (run.co2_volume_ml ? `${run.co2_volume_ml} mL` : 'N/A') :
                    (run.power_W ? `${Number(run.power_W).toFixed(2)} W` : 'N/A')
                  }
                </div>
                
                <div style={{ 
                  maxWidth: '200px', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  color: '#6b7280'
                }}>
                  {run.notes || 'Not yok'}
                </div>
                
                <button
                  onClick={() => {
                    const newSelected = new Set([run.id])
                    setSelectedIds(newSelected)
                  }}
                  style={{
                    padding: '4px 8px',
                    background: 'none',
                    border: '1px solid #d1d5db',
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                  title="Bu kaydı seç"
                >
                  ✓
                </button>
              </div>
            ))}
          </div>

          {filteredRuns.length === 0 && (
            <div style={{
              padding: 40,
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
              <div>Bu filtre için kayıt bulunamadı</div>
            </div>
          )}
        </div>
      )}

      {/* İstatistikler */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        marginTop: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>📊 İstatistikler</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0369a1' }}>{runs.length}</div>
            <div style={{ fontSize: 12, color: '#0369a1' }}>Toplam Kayıt</div>
          </div>
          <div style={{ padding: 12, background: '#ecfdf5', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#059669' }}>
              {runs.filter(r => r.type === 'gas').length}
            </div>
            <div style={{ fontSize: 12, color: '#059669' }}>Gaz Deneyi</div>
          </div>
          <div style={{ padding: 12, background: '#fef3c7', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#d97706' }}>
              {runs.filter(r => r.type === 'daniell').length}
            </div>
            <div style={{ fontSize: 12, color: '#d97706' }}>Daniell Pili</div>
          </div>
          <div style={{ padding: 12, background: '#f3e8ff', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#7c3aed' }}>
              {new Set(runs.map(r => r.weekTag)).size}
            </div>
            <div style={{ fontSize: 12, color: '#7c3aed' }}>Farklı Hafta</div>
          </div>
        </div>
      </div>
    </div>
  )
}