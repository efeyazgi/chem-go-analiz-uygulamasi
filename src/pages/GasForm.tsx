import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useLocation } from 'react-router-dom'

const schema = z.object({
  date: z.string().min(1),
  weekTag: z.string().min(1),
  vehicleMass_kg: z.union([z.string().length(0), z.coerce.number().positive()]).optional().transform(val => val === "" ? undefined : val),
  vinegar_ml: z.coerce.number().positive(),
  vinegar_acetic_pct: z.coerce.number().positive().max(100).default(5),
  bicarb_g: z.coerce.number().positive(),
  temperature_C: z.coerce.number(),
  time_s: z.coerce.number().positive(),
  co2_volume_ml: z.union([z.string().length(0), z.coerce.number().positive()]).optional().transform(val => val === "" ? undefined : val),
  distance_m: z.union([z.string().length(0), z.coerce.number().positive()]).optional().transform(val => val === "" ? undefined : val),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function GasForm() {
  const { user } = useAuth()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const num = (k: string, d?: number) => {
    const v = params.get(k)
    return v != null ? Number(v) : d
  }
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      weekTag: isoWeekTag(new Date()),
      vinegar_acetic_pct: num('vinegar_acetic_pct', 5),
      temperature_C: num('temperature_C', 20),
      vinegar_ml: num('vinegar_ml'),
      bicarb_g: num('bicarb_g'),
      time_s: num('time_s'),
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      console.log('Auth user:', auth.currentUser)
      console.log('User ID:', auth.currentUser?.uid)
      console.log('User email:', auth.currentUser?.email)
      console.log('Veri kaydediliyor:', data)
      
      // Firebase için undefined değerleri filtrele
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      )
      
      const docData = {
        type: 'gas',
        userId: auth.currentUser?.uid || null,
        ...cleanedData,
        createdAt: serverTimestamp(),
      }
      console.log('Document data:', docData)
      
      await addDoc(collection(db, 'runs'), docData)
      console.log('Veri başarıyla kaydedildi')
      reset()
      setSuccessMessage('Gaz deneyi verisi başarıyla kaydedildi!')
      
      // Success mesajını 3 saniye sonra temizle
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Veri kaydetme hatası:', error)
      setErrorMessage(
        error.code === 'permission-denied' 
          ? 'Veri kaydetme izniniz yok. Lütfen giriş yapın'
          : error.code === 'unavailable'
          ? 'Veritabanına bağlanılamıyor. İnternet bağlantınızı kontrol edin'
          : 'Veri kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata')
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Erişim kontrolü
  if (!user?.canEdit) {
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
          <h2 style={{ margin: '0 0 16px 0', color: '#92400e' }}>Veri Giriş Yetkiniz Yok</h2>
          <p style={{ margin: 0, fontSize: 16 }}>
            Bu sayfaya erişmek için veri girişi yetkisine sahip olmanız gerekiyor.
            <br />Yetki için lütfen yöneticinize başvurun.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 20 }}>
      <h2 style={{ color: '#1f2937', marginBottom: 24, borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>Gaz Deneyi Kayıtı</h2>
      
      {successMessage && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #a7f3d0',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          color: '#065f46'
        }}>
          ✓ {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          color: '#991b1b'
        }}>
          ✗ {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} style={{ background: '#f9fafb', padding: 24, borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Tarih *</label>
          <input 
            type="date" 
            {...register('date')} 
            style={{
              width: '100%',
              padding: 10,
              border: errors.date ? '2px solid #f56565' : '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14
            }}
            disabled={isLoading}
          />
          {errors.date && <span style={{ color: '#f56565', fontSize: 12 }}>Tarih gerekli</span>}
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Hafta Etiketi (YYYY-WW) *</label>
          <input 
            {...register('weekTag')} 
            style={{
              width: '100%',
              padding: 10,
              border: errors.weekTag ? '2px solid #f56565' : '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14
            }}
            disabled={isLoading}
            placeholder="örn: 2024-01"
          />
          {errors.weekTag && <span style={{ color: '#f56565', fontSize: 12 }}>Hafta etiketi gerekli</span>}
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Araç Kütlesi (kg)</label>
          <input 
            type="number" 
            step="0.001" 
            {...register('vehicleMass_kg')} 
            style={{
              width: '100%',
              padding: 10,
              border: errors.vehicleMass_kg ? '2px solid #f56565' : '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14
            }}
            disabled={isLoading}
            placeholder="0.500"
          />
            {errors.vehicleMass_kg && <span style={{ color: '#f56565', fontSize: 12 }}>Pozitif bir değer giriniz</span>}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Asetik Asit (mL) *</label>
            <input 
              type="number" 
              step="0.1" 
              {...register('vinegar_ml')} 
              style={{
                width: '100%',
                padding: 10,
                border: errors.vinegar_ml ? '2px solid #f56565' : '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="50.0"
            />
            {errors.vinegar_ml && <span style={{ color: '#f56565', fontSize: 12 }}>Pozitif bir değer giriniz</span>}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Asetik Asit (%) *</label>
            <input 
              type="number" 
              step="0.1" 
              {...register('vinegar_acetic_pct')} 
              style={{
                width: '100%',
                padding: 10,
                border: errors.vinegar_acetic_pct ? '2px solid #f56565' : '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="5.0"
            />
            {errors.vinegar_acetic_pct && <span style={{ color: '#f56565', fontSize: 12 }}>0-100 arası değer giriniz</span>}
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Sodyumbikarbonat (g) *</label>
            <input 
              type="number" 
              step="0.01" 
              {...register('bicarb_g')} 
              style={{
                width: '100%',
                padding: 10,
                border: errors.bicarb_g ? '2px solid #f56565' : '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="10.00"
            />
            {errors.bicarb_g && <span style={{ color: '#f56565', fontSize: 12 }}>Pozitif bir değer giriniz</span>}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Sıcaklık (°C) *</label>
            <input 
              type="number" 
              step="0.1" 
              {...register('temperature_C')} 
              style={{
                width: '100%',
                padding: 10,
                border: errors.temperature_C ? '2px solid #f56565' : '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="20.0"
            />
            {errors.temperature_C && <span style={{ color: '#f56565', fontSize: 12 }}>Sıcaklık değeri giriniz</span>}
          </div>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Süre (saniye) *</label>
          <input 
            type="number" 
            step="0.1" 
            {...register('time_s')} 
            style={{
              width: '100%',
              padding: 10,
              border: errors.time_s ? '2px solid #f56565' : '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14
            }}
            disabled={isLoading}
            placeholder="60.0"
          />
          {errors.time_s && <span style={{ color: '#f56565', fontSize: 12 }}>Pozitif bir değer giriniz</span>}
        </div>
        
        <h3 style={{ color: '#1f2937', marginBottom: 16, fontSize: 16, borderBottom: '1px solid #d1d5db', paddingBottom: 8 }}>Sonuçlar (opsiyonel)</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>CO₂ Hacmi (mL)</label>
            <input 
              type="number" 
              step="0.1" 
              {...register('co2_volume_ml')} 
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="ölçülen hacim"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Mesafe (m)</label>
            <input 
              type="number" 
              step="0.01" 
              {...register('distance_m')} 
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="araç mesafesi"
            />
          </div>
        </div>
        
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Notlar</label>
          <textarea 
            {...register('notes')} 
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14,
              minHeight: 80,
              resize: 'vertical'
            }}
            disabled={isLoading}
            placeholder="Deney hakkında ek bilgiler ve gözlemler..."
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            width: '100%',
            padding: 16,
            background: isLoading ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          {isLoading ? 'Kaydediliyor...' : '💾 Veri Kaydet'}
        </button>
      </form>
    </div>
  )
}

function isoWeekTag(d: Date) {
  const year = d.getUTCFullYear()
  const onejan = new Date(Date.UTC(year, 0, 1))
  const week = Math.ceil(((+d - +onejan) / 86400000 + onejan.getUTCDay() + 1) / 7)
  return `${year}-${String(week).padStart(2, '0')}`
}
