import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, ADMIN_EMAIL, db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export type UserRole = 'admin' | 'user' | 'viewer'

export type AppUser = {
  uid: string
  email: string | null
  role: UserRole
  isAdmin: boolean
  canEdit: boolean
  canView: boolean
}

const AuthCtx = createContext<{
  user: AppUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
} | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u: User | null) => {
      if (!u) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        // Kullanıcının rolünü Firestore'dan al
        const userRoleDoc = await getDoc(doc(db, 'userRoles', u.uid))
        let role: UserRole = 'user' // Varsayılan rol
        
        if (userRoleDoc.exists()) {
          role = userRoleDoc.data().role || 'user'
        } else {
          // İlk kez giriş yapan kullanıcı için rol belirle
          if ((u.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            role = 'admin'
          } else {
            role = 'user'
          }
          
          // Rolü Firestore'a kaydet
          await setDoc(doc(db, 'userRoles', u.uid), {
            uid: u.uid,
            email: u.email,
            role: role,
            createdAt: new Date(),
            lastLogin: new Date()
          })
        }

        const appUser: AppUser = {
          uid: u.uid,
          email: u.email,
          role: role,
          isAdmin: role === 'admin',
          canEdit: role === 'admin' || role === 'user',
          canView: true // Herkes görüntüleyebilir
        }
        
        setUser(appUser)
      } catch (error) {
        console.error('Kullanıcı rolü alınırken hata:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }
  const logout = async () => {
    await signOut(auth)
  }

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

// Rol yönetimi fonksiyonları
export const updateUserRole = async (uid: string, newRole: UserRole) => {
  try {
    await setDoc(doc(db, 'userRoles', uid), {
      role: newRole,
      updatedAt: new Date()
    }, { merge: true })
    return true
  } catch (error) {
    console.error('Rol güncellenirken hata:', error)
    return false
  }
}

export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    const userRoleDoc = await getDoc(doc(db, 'userRoles', uid))
    if (userRoleDoc.exists()) {
      return userRoleDoc.data().role || 'user'
    }
    return null
  } catch (error) {
    console.error('Kullanıcı rolü alınırken hata:', error)
    return null
  }
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
