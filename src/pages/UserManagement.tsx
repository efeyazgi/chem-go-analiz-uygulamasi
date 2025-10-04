import { useEffect, useState } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth, type UserRole, updateUserRole } from '../lib/auth'

type UserData = {
  uid: string
  email: string | null
  role: UserRole
  createdAt: any
  lastLogin: any
}

export default function UserManagement() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)

  useEffect(() => {
    if (user?.isAdmin) {
      loadUsers()
    }
  }, [user])

  const loadUsers = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const snap = await getDocs(collection(db, 'userRoles'))
      const userList = snap.docs.map((d) => ({ uid: d.id, ...d.data() })) as UserData[]
      setUsers(userList.sort((a, b) => new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime()))
    } catch (err: any) {
      console.error('Kullanıcılar yüklenirken hata:', err)
      setError('Kullanıcılar yüklenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    // Kendi yetkisini kaldırma kontrolü
    if (uid === user?.uid && newRole !== 'admin') {
      alert('Kendi admin yetkilerinizi kaldıramazsınız!')
      return
    }

    // Admin kullanıcıları koruma - sadece ana admin (efeyazgi@yahoo.com) diğer adminlerin yetkisini kaldırabilir
    const targetUser = users.find(u => u.uid === uid)
    if (targetUser?.role === 'admin' && targetUser?.email !== 'efeyazgi@yahoo.com') {
      if (user?.email !== 'efeyazgi@yahoo.com') {
        alert('Sadece ana admin (efeyazgi@yahoo.com) diğer admin kullanıcıların yetkisini kaldırabilir!')
        return
      }
    }

    // Ana admin'i koruma - hiç kimse ana admin'in yetkisini kaldıramaz
    if (targetUser?.email === 'efeyazgi@yahoo.com' && newRole !== 'admin') {
      alert('Ana admin (efeyazgi@yahoo.com) kullanıcısının yetkisi kaldırılamaz!')
      return
    }

    setUpdatingUser(uid)
    setError('')

    try {
      const success = await updateUserRole(uid, newRole)
      if (success) {
        setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u))
        setSuccessMessage(`Kullanıcı rolü başarıyla ${newRole} olarak güncellendi!`)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError('Rol güncellenirken bir hata oluştu')
      }
    } catch (error: any) {
      console.error('Rol güncelleme hatası:', error)
      setError('Rol güncellenirken bir hata oluştu')
    } finally {
      setUpdatingUser(null)
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' }
      case 'user': return { bg: '#d1fae5', text: '#065f46', border: '#10b981' }
      case 'viewer': return { bg: '#e0e7ff', text: '#3730a3', border: '#6366f1' }
      default: return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' }
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return '👑 Admin'
      case 'user': return '👤 Kullanıcı'
      case 'viewer': return '👁️ Görüntüleyici'
      default: return role
    }
  }

  // Admin kontrolü
  if (!user?.isAdmin) {
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
          <h2 style={{ margin: '0 0 16px 0', color: '#92400e' }}>Erişim Kısıtlı</h2>
          <p style={{ margin: 0, fontSize: 16 }}>
            Kullanıcı yönetimi sayfasına erişmek için admin yetkisine sahip olmanız gerekiyor.
          </p>
        </div>
      </div>
    )
  }

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
        <div style={{ fontSize: 16, color: '#6b7280' }}>Kullanıcılar yükleniyor...</div>
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
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
          👥 Kullanıcı Yönetimi
        </h1>
        <p style={{ 
          margin: 0, 
          fontSize: 'clamp(14px, 3vw, 18px)', 
          opacity: 0.9 
        }}>
          Kullanıcı rollerini ve izinlerini yönetin
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

      {/* Rol Açıklamaları */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '16px',
        marginBottom: 16,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          color: '#1f2937', 
          fontSize: 16
        }}>
          📋 Rol Açıklamaları
        </h3>
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
          fontSize: 13,
          color: '#92400e'
        }}>
          <div style={{ fontWeight: '600', marginBottom: 4 }}>🔒 Admin Koruması</div>
          <div>• Ana admin (efeyazgi@yahoo.com) korunur ve yetkisi kaldırılamaz</div>
          <div>• Diğer admin kullanıcıların yetkisi sadece ana admin tarafından kaldırılabilir</div>
          <div>• Admin kullanıcılar kendi yetkilerini kaldıramaz</div>
        </div>
        <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ 
              ...getRoleColor('admin'), 
              padding: '4px 8px', 
              borderRadius: 6, 
              fontSize: 12,
              fontWeight: '600',
              border: `1px solid ${getRoleColor('admin').border}`
            }}>
              👑 Admin
            </span>
            <span style={{ color: '#6b7280' }}>Tüm yetkilere sahip, veri ekleyebilir, düzenleyebilir ve silebilir</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ 
              ...getRoleColor('user'), 
              padding: '4px 8px', 
              borderRadius: 6, 
              fontSize: 12,
              fontWeight: '600',
              border: `1px solid ${getRoleColor('user').border}`
            }}>
              👤 Kullanıcı
            </span>
            <span style={{ color: '#6b7280' }}>Veri ekleyebilir, düzenleyebilir ama silemez</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ 
              ...getRoleColor('viewer'), 
              padding: '4px 8px', 
              borderRadius: 6, 
              fontSize: 12,
              fontWeight: '600',
              border: `1px solid ${getRoleColor('viewer').border}`
            }}>
              👁️ Görüntüleyici
            </span>
            <span style={{ color: '#6b7280' }}>Sadece verileri görüntüleyebilir, değişiklik yapamaz</span>
          </div>
        </div>
      </div>

      {/* Kullanıcı Listesi */}
      {users.length === 0 ? (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          color: '#0369a1'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3 style={{ margin: '0 0 8px 0' }}>Henüz kullanıcı yok</h3>
          <p style={{ margin: 0 }}>Sistemde kayıtlı kullanıcı bulunmuyor.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
        }}>
          {users.map((userData) => {
            const roleColors = getRoleColor(userData.role)
            return (
              <div
                key={userData.uid}
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
                {/* Kullanıcı Bilgileri */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <div style={{
                      fontWeight: '600',
                      fontSize: 16,
                      color: '#1f2937'
                    }}>
                      📧 {userData.email || 'Email yok'}
                    </div>
                    
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {userData.uid === user.uid && (
                        <div style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: '600'
                        }}>
                          Siz
                        </div>
                      )}
                      {userData.email === 'efeyazgi@yahoo.com' && (
                        <div style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: '600',
                          border: '1px solid #f59e0b'
                        }}>
                          🔒 Ana Admin
                        </div>
                      )}
                      {userData.role === 'admin' && userData.email !== 'efeyazgi@yahoo.com' && (
                        <div style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: '600',
                          border: '1px solid #ef4444'
                        }}>
                          ⚠️ Korumalı
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gap: 4, fontSize: 13, color: '#6b7280' }}>
                    <div>🆔 UID: {userData.uid.substring(0, 8)}...</div>
                    {userData.createdAt && (
                      <div>📅 Kayıt: {userData.createdAt.toDate?.()?.toLocaleDateString('tr-TR') || 'N/A'}</div>
                    )}
                    {userData.lastLogin && (
                      <div>🕒 Son Giriş: {userData.lastLogin.toDate?.()?.toLocaleDateString('tr-TR') || 'N/A'}</div>
                    )}
                  </div>
                </div>

                {/* Rol Yönetimi */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: 12
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: 4,
                      fontSize: 13,
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Kullanıcı Rolü:
                    </label>
                    <select
                      value={userData.role}
                      onChange={(e) => handleRoleChange(userData.uid, e.target.value as UserRole)}
                      disabled={
                        updatingUser === userData.uid || 
                        userData.email === 'efeyazgi@yahoo.com' ||
                        (userData.role === 'admin' && userData.email !== 'efeyazgi@yahoo.com' && user?.email !== 'efeyazgi@yahoo.com')
                      }
                      style={{
                        padding: '6px 8px',
                        border: `1px solid ${roleColors.border}`,
                        borderRadius: 6,
                        fontSize: 13,
                        background: roleColors.bg,
                        color: roleColors.text,
                        fontWeight: '600',
                        cursor: (
                          updatingUser === userData.uid || 
                          userData.email === 'efeyazgi@yahoo.com' ||
                          (userData.role === 'admin' && userData.email !== 'efeyazgi@yahoo.com' && user?.email !== 'efeyazgi@yahoo.com')
                        ) ? 'not-allowed' : 'pointer',
                        opacity: (
                          updatingUser === userData.uid || 
                          userData.email === 'efeyazgi@yahoo.com' ||
                          (userData.role === 'admin' && userData.email !== 'efeyazgi@yahoo.com' && user?.email !== 'efeyazgi@yahoo.com')
                        ) ? 0.6 : 1
                      }}
                    >
                      <option value="admin">👑 Admin</option>
                      <option value="user">👤 Kullanıcı</option>
                      <option value="viewer">👁️ Görüntüleyici</option>
                    </select>
                  </div>

                  {updatingUser === userData.uid && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: '#6b7280'
                    }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        border: '2px solid #d1d5db',
                        borderTop: '2px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Güncelleniyor...
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}