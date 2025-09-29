import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { refreshDashboard } from './Dashboard'

type Run = {
  id: string
  type: 'gas' | 'daniell'
  date: string
  weekTag: string
  vehicleMass_kg: number
  distance_m?: number
  notes?: string
  createdAt: any
  [key: string]: any
}

export default function ModernHistory() {
  const { user } = useAuth()
  const [runs, setRuns] = useState<Run[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'gas' | 'daniell'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'distance'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [editingRun, setEditingRun] = useState<Run | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const snap = await getDocs(collection(db, 'runs'))
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Run[]
      setRuns(items)
    } catch (err: any) {
      console.error('Veri yükleme hatası:', err)
      setError('Veriler yüklenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'))
    } finally {
      setIsLoading(false)
    }
  }

  const deleteRecord = async (id: string) => {
    if (!user?.isAdmin) {
      alert('Bu işlem için yönetici yetkisine sahip olmanız gerekiyor.')
      return
    }

    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return
    
    try {
      await deleteDoc(doc(db, 'runs', id))
      setRuns(runs.filter(run => run.id !== id))
      setSuccessMessage('Kayıt başarıyla silindi')
      refreshDashboard()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      console.error('Silme hatası:', err)
      setError('Kayıt silinirken bir hata oluştu')
    }
  }

  const startEdit = (run: Run) => {
    setEditingRun({ ...run })
  }

  const cancelEdit = () => {
    setEditingRun(null)
  }

  const saveEdit = async () => {
    if (!editingRun) return

    setIsEditing(true)
    try {
      const { id, createdAt, ...updateData } = editingRun
      await updateDoc(doc(db, 'runs', id), updateData)
      
      setRuns(runs.map(run => run.id === id ? editingRun : run))
      setEditingRun(null)
      setSuccessMessage('Kayıt başarıyla güncellendi')
      refreshDashboard()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      console.error('Güncelleme hatası:', err)
      setError('Kayıt güncellenirken bir hata oluştu')
    } finally {
      setIsEditing(false)
    }
  }

  // Filtreleme ve sıralama
  const filteredAndSortedRuns = runs
    .filter(run => filterType === 'all' || run.type === filterType)
    .sort((a, b) => {
      let aVal, bVal
      
      switch (sortBy) {
        case 'date':
          aVal = a.date || ''
          bVal = b.date || ''
          break
        case 'type':
          aVal = a.type
          bVal = b.type
          break
        case 'distance':
          aVal = a.distance_m || 0
          bVal = b.distance_m || 0
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ 
          fontSize: 24, 
          animation: 'spin 1s linear infinite' 
        }}>🔄</div>
        <div style={{ fontSize: 16, color: '#6b7280' }}>Geçmiş kayıtlar yükleniyor...</div>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '100%',
      padding: '16px',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        padding: '24px',
        marginBottom: 24,
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          margin: '0 0 8px 0', 
          fontSize: 'clamp(20px, 5vw, 32px)', 
          fontWeight: 'bold', 
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' 
        }}>
          📋 Deney Geçmişi
        </h1>
        <p style={{ 
          margin: 0, 
          fontSize: 'clamp(14px, 3vw, 18px)', 
          opacity: 0.9 
        }}>
          Tüm deney kayıtlarınızı görüntüleyin ve düzenleyin
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          color: '#991b1b',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {successMessage && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #a7f3d0',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          color: '#065f46',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span>✅</span> {successMessage}
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '16px',
        marginBottom: 16,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: '#1f2937', 
          fontSize: 'clamp(16px, 4vw, 20px)',
          display: 'flex', 
          alignItems: 'center', 
          gap: 8 
        }}>
          🔍 Filtreler
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: 12 
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: 4, 
              fontWeight: '600', 
              color: '#374151',
              fontSize: 14
            }}>
              Deney Türü
            </label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                background: '#ffffff'
              }}
            >
              <option value="all">Tümü ({runs.length})</option>
              <option value="gas">💨 Gaz ({runs.filter(r => r.type === 'gas').length})</option>
              <option value="daniell">⚡ Daniell ({runs.filter(r => r.type === 'daniell').length})</option>
            </select>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: 4, 
              fontWeight: '600', 
              color: '#374151',
              fontSize: 14
            }}>
              Sıralama
            </label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                background: '#ffffff'
              }}
            >
              <option value="date">📅 Tarih</option>
              <option value="type">🧪 Tür</option>
              <option value="distance">📏 Mesafe</option>
            </select>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: 4, 
              fontWeight: '600', 
              color: '#374151',
              fontSize: 14
            }}>
              Sıra
            </label>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                background: '#ffffff'
              }}
            >
              <option value="desc">↓ Azalan</option>
              <option value="asc">↑ Artan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Cards - Mobile Friendly */}
      {runs.length === 0 ? (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          color: '#0369a1'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h3 style={{ margin: '0 0 8px 0' }}>Henüz kayıt yok</h3>
          <p style={{ margin: 0 }}>İlk deney kaydınızı eklemek için yukarıdaki menüden başlayın.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
        }}>
          {filteredAndSortedRuns.map((run) => (
            <div
              key={run.id}
              style={{
                background: '#ffffff',
                borderRadius: 12,
                padding: 20,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Card Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 16,
                flexWrap: 'wrap',
                gap: 8
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: '600',
                  background: run.type === 'gas' ? '#dcfce7' : '#dbeafe',
                  color: run.type === 'gas' ? '#166534' : '#1e40af'
                }}>
                  {run.type === 'gas' ? '💨 Gaz Deneyi' : '⚡ Daniell Pili'}
                </div>
                
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => startEdit(run)}
                    style={{
                      padding: '6px 8px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                  
                  {user?.isAdmin && (
                    <button
                      onClick={() => deleteRecord(run.id)}
                      style={{
                        padding: '6px 8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                      title="Sil (Sadece Admin)"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div style={{ display: 'grid', gap: 6 }}>
                {/* Ortak Parametreler */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: 12 }}>📅 Tarih:</span>
                  <span style={{ fontWeight: '600', fontSize: 12 }}>{run.date || 'N/A'}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: 12 }}>📊 Hafta:</span>
                  <span style={{ fontWeight: '600', fontSize: 12 }}>{run.weekTag || 'N/A'}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: 12 }}>⚖️ Araç Kütlesi:</span>
                  <span style={{ fontWeight: '600', fontSize: 12 }}>{run.vehicleMass_kg ? `${Number(run.vehicleMass_kg).toFixed(3)} kg` : 'N/A'}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: 12 }}>📏 Mesafe:</span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: 13, 
                    color: '#059669' 
                  }}>
                    {run.distance_m ? `${Number(run.distance_m).toFixed(2)} m` : 'N/A'}
                  </span>
                </div>

                {/* Gaz Deneyi Özel Parametreleri */}
                {run.type === 'gas' && (
                  <div style={{ 
                    marginTop: 8, 
                    padding: '8px 10px', 
                    background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)', 
                    borderRadius: 6,
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ 
                      fontSize: 12, 
                      fontWeight: '600', 
                      color: '#166534', 
                      marginBottom: 6 
                    }}>
                      💨 Gaz Deneyi Detayları
                    </div>
                    
                    <div style={{ display: 'grid', gap: 4 }}>
                      {run.vinegar_ml && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#166534', fontSize: 11 }}>🥃 Sirke:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.vinegar_ml).toFixed(1)} mL</span>
                        </div>
                      )}
                      {run.vinegar_acetic_pct && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#166534', fontSize: 11 }}>🧪 Asetik Asit:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.vinegar_acetic_pct).toFixed(1)}%</span>
                        </div>
                      )}
                      {run.bicarb_g && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#166534', fontSize: 11 }}>🧂 Karbonat:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.bicarb_g).toFixed(2)} g</span>
                        </div>
                      )}
                      {run.temperature_C && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#166534', fontSize: 11 }}>🌡️ Sıcaklık:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.temperature_C).toFixed(1)}°C</span>
                        </div>
                      )}
                      {run.time_s && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#166534', fontSize: 11 }}>⏱️ Süre:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.time_s).toFixed(1)} s</span>
                        </div>
                      )}
                      {run.co2_volume_ml && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#166534', fontSize: 11 }}>💨 CO₂ Hacmi:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.co2_volume_ml).toFixed(1)} mL</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Daniell Pili Özel Parametreleri */}
                {run.type === 'daniell' && (
                  <div style={{ 
                    marginTop: 8, 
                    padding: '8px 10px', 
                    background: 'linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%)', 
                    borderRadius: 6,
                    border: '1px solid #93c5fd'
                  }}>
                    <div style={{ 
                      fontSize: 12, 
                      fontWeight: '600', 
                      color: '#1e40af', 
                      marginBottom: 6 
                    }}>
                      ⚡ Daniell Pili Detayları
                    </div>
                    
                    <div style={{ display: 'grid', gap: 4 }}>
                      {run.electrolyte_conc_M && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#1e40af', fontSize: 11 }}>🧪 Elektrolit:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.electrolyte_conc_M).toFixed(1)} M</span>
                        </div>
                      )}
                      {run.electrode_area_cm2 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#1e40af', fontSize: 11 }}>📐 Elektrot Alanı:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.electrode_area_cm2).toFixed(1)} cm²</span>
                        </div>
                      )}
                      {run.solution_level_mm && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#1e40af', fontSize: 11 }}>📊 Çözelti Seviyesi:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.solution_level_mm).toFixed(0)} mm</span>
                        </div>
                      )}
                      {run.ocv_V && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#1e40af', fontSize: 11 }}>🔋 Boşta Gerilim:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.ocv_V).toFixed(2)} V</span>
                        </div>
                      )}
                      {run.current_A && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#1e40af', fontSize: 11 }}>🔌 Akım:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.current_A).toFixed(2)} A</span>
                        </div>
                      )}
                      {run.voltage_V && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#1e40af', fontSize: 11 }}>⚡ Yük Altında:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.voltage_V).toFixed(2)} V</span>
                        </div>
                      )}
                      {run.power_W && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#1e40af', fontSize: 11 }}>⚡ Güç:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.power_W).toFixed(2)} W</span>
                        </div>
                      )}
                      {run.energy_Wh && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#1e40af', fontSize: 11 }}>🔋 Enerji:</span>
                          <span style={{ fontSize: 11, fontWeight: '500' }}>{Number(run.energy_Wh).toFixed(2)} Wh</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {run.notes && (
                  <div style={{ 
                    marginTop: 8, 
                    padding: 8, 
                    background: '#f8fafc', 
                    borderRadius: 6, 
                    fontSize: 11, 
                    color: '#374151',
                    border: '1px solid #e5e7eb'
                  }}>
                    💬 {run.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingRun && (
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
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 20 
            }}>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: 20 }}>
                ✏️ Kaydı Düzenle
              </h3>
              <button
                onClick={cancelEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {/* Ortak Parametreler */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 4, 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: 14
                  }}>
                    📅 Tarih
                  </label>
                  <input
                    type="date"
                    value={editingRun.date || ''}
                    onChange={(e) => setEditingRun({...editingRun, date: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 4, 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: 14
                  }}>
                    📊 Hafta Etiketi
                  </label>
                  <input
                    type="text"
                    value={editingRun.weekTag || ''}
                    onChange={(e) => setEditingRun({...editingRun, weekTag: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    placeholder="2024-01"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 4, 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: 14
                  }}>
                    ⚖️ Araç Kütlesi (kg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingRun.vehicleMass_kg || ''}
                    onChange={(e) => setEditingRun({...editingRun, vehicleMass_kg: Number(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    placeholder="0.500"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 4, 
                    fontWeight: '600', 
                    color: '#374151',
                    fontSize: 14
                  }}>
                    📏 Mesafe (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingRun.distance_m || ''}
                    onChange={(e) => setEditingRun({...editingRun, distance_m: Number(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                    placeholder="araç mesafesi"
                  />
                </div>
              </div>

              {/* Gaz Deneyi Özel Parametreleri */}
              {editingRun.type === 'gas' && (
                <div>
                  <h4 style={{ 
                    margin: '16px 0 12px 0', 
                    color: '#059669', 
                    fontSize: 15, 
                    fontWeight: '600',
                    borderBottom: '1px solid #d1d5db', 
                    paddingBottom: 6 
                  }}>
                    💨 Gaz Deneyi Parametreleri
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: '600', 
                        color: '#374151',
                        fontSize: 13
                      }}>
                        🥃 Sirke (mL)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingRun.vinegar_ml || ''}
                        onChange={(e) => setEditingRun({...editingRun, vinegar_ml: Number(e.target.value)})}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                        placeholder="50.0"
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: '600', 
                        color: '#374151',
                        fontSize: 13
                      }}>
                        🧪 Asetik Asit (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingRun.vinegar_acetic_pct || ''}
                        onChange={(e) => setEditingRun({...editingRun, vinegar_acetic_pct: Number(e.target.value)})}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                        placeholder="5.0"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: '600', 
                        color: '#374151',
                        fontSize: 13
                      }}>
                        🧂 Karbonat (g)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingRun.bicarb_g || ''}
                        onChange={(e) => setEditingRun({...editingRun, bicarb_g: Number(e.target.value)})}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                        placeholder="10.00"
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: '600', 
                        color: '#374151',
                        fontSize: 13
                      }}>
                        🌡️ Sıcaklık (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingRun.temperature_C || ''}
                        onChange={(e) => setEditingRun({...editingRun, temperature_C: Number(e.target.value)})}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                        placeholder="20.0"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: '600', 
                        color: '#374151',
                        fontSize: 13
                      }}>
                        ⏱️ Süre (saniye)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingRun.time_s || ''}
                        onChange={(e) => setEditingRun({...editingRun, time_s: Number(e.target.value)})}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                        placeholder="60.0"
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: '600', 
                        color: '#374151',
                        fontSize: 13
                      }}>
                        💨 CO₂ Hacmi (mL)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingRun.co2_volume_ml || ''}
                        onChange={(e) => setEditingRun({...editingRun, co2_volume_ml: Number(e.target.value)})}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                        placeholder="ölçülen hacim"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Daniell Pili Özel Parametreleri */}
              {editingRun.type === 'daniell' && (
                <div>
                  <h4 style={{ 
                    margin: '16px 0 12px 0', 
                    color: '#1e40af', 
                    fontSize: 15, 
                    fontWeight: '600',
                    borderBottom: '1px solid #d1d5db', 
                    paddingBottom: 6 
                  }}>
                    ⚡ Daniell Pili Parametreleri
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: '600', 
                        color: '#374151',
                        fontSize: 13
                      }}>
                        🧪 Elektrolit Derişimi (M)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingRun.electrolyte_conc_M || ''}
                        onChange={(e) => setEditingRun({...editingRun, electrolyte_conc_M: Number(e.target.value)})}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                        placeholder="1.0"
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: '600', 
                        color: '#374151',
                        fontSize: 13
                      }}>
                        📐 Elektrot Alanı (cm²)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingRun.electrode_area_cm2 || ''}
                        onChange={(e) => setEditingRun({...editingRun, electrode_area_cm2: Number(e.target.value)})}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                        placeholder="10.0"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 4, 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: 13
                    }}>
                      📊 Çözelti Seviyesi (mm)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={editingRun.solution_level_mm || ''}
                      onChange={(e) => setEditingRun({...editingRun, solution_level_mm: Number(e.target.value)})}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        fontSize: 13,
                        boxSizing: 'border-box'
                      }}
                      placeholder="50"
                    />
                  </div>

                  <h5 style={{ 
                    margin: '12px 0 8px 0', 
                    color: '#6b7280', 
                    fontSize: 13, 
                    fontWeight: '600' 
                  }}>
                    ⚡ Elektriksel Ölçümler
                  </h5>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: '600', 
                        color: '#374151',
                        fontSize: 13
                      }}>
                        🔋 Boşta Gerilim (V)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingRun.ocv_V || ''}
                        onChange={(e) => setEditingRun({...editingRun, ocv_V: Number(e.target.value)})}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                        placeholder="1.10"
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: '600', 
                        color: '#374151',
                        fontSize: 13
                      }}>
                        🔌 Akım (A)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingRun.current_A || ''}
                        onChange={(e) => setEditingRun({...editingRun, current_A: Number(e.target.value)})}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                        placeholder="0.50"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: '600', 
                        color: '#374151',
                        fontSize: 13
                      }}>
                        ⚡ Yük Altında Gerilim (V)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingRun.voltage_V || ''}
                        onChange={(e) => setEditingRun({...editingRun, voltage_V: Number(e.target.value)})}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                        placeholder="0.90"
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: '600', 
                        color: '#374151',
                        fontSize: 13
                      }}>
                        ⚡ Güç (W)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingRun.power_W || ''}
                        onChange={(e) => setEditingRun({...editingRun, power_W: Number(e.target.value)})}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                        placeholder="0.45"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 4, 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: 13
                    }}>
                      🔋 Enerji (Wh)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingRun.energy_Wh || ''}
                      onChange={(e) => setEditingRun({...editingRun, energy_Wh: Number(e.target.value)})}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        fontSize: 13,
                        boxSizing: 'border-box'
                      }}
                      placeholder="toplam enerji"
                    />
                  </div>
                </div>
              )}

              {/* Notlar */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 4, 
                  fontWeight: '600', 
                  color: '#374151',
                  fontSize: 14
                }}>
                  💬 Notlar
                </label>
                <textarea
                  value={editingRun.notes || ''}
                  onChange={(e) => setEditingRun({...editingRun, notes: e.target.value})}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 13,
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Deney hakkında ek bilgiler ve gözlemler..."
                />
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 12, 
              marginTop: 24,
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={cancelEdit}
                style={{
                  padding: '10px 20px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                İptal
              </button>
              
              <button
                onClick={saveEdit}
                disabled={isEditing}
                style={{
                  padding: '10px 20px',
                  background: isEditing ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: '600',
                  cursor: isEditing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {isEditing && (
                  <div style={{
                    width: 14,
                    height: 14,
                    border: '2px solid transparent',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                {isEditing ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}