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
  weekTag: z.string().min(1).max(50).transform(val => val.trim().replace(/[<>]/g, '')),
  vehicleMass_kg: z.union([z.string().length(0), z.coerce.number().positive()]).optional().transform(val => val === "" ? undefined : val),
  electrolyte_conc_M: z.coerce.number().min(0.1).max(2.0),
  electrode_area_cm2: z.coerce.number().min(1).max(25),
  solution_level_mm: z.coerce.number().min(1),
  ocv_V: z.union([z.string().length(0), z.coerce.number().positive()]).optional().transform(val => val === "" ? undefined : val),
  current_A: z.union([z.string().length(0), z.coerce.number().positive()]).optional().transform(val => val === "" ? undefined : val),
  voltage_V: z.union([z.string().length(0), z.coerce.number().positive()]).optional().transform(val => val === "" ? undefined : val),
  power_W: z.union([z.string().length(0), z.coerce.number().positive()]).optional().transform(val => val === "" ? undefined : val),
  energy_Wh: z.union([z.string().length(0), z.coerce.number().positive()]).optional().transform(val => val === "" ? undefined : val),
  distance_m: z.union([z.string().length(0), z.coerce.number().positive()]).optional().transform(val => val === "" ? undefined : val),
  notes: z.string().max(500).optional().transform(val => val ? val.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') : undefined),
})

type FormData = z.infer<typeof schema>

export default function DaniellForm() {
  const { user } = useAuth()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const num = (k: string, d?: number) => {
    const v = params.get(k)
    return v != null ? Number(v) : d
  }
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      weekTag: isoWeekTag(new Date()),
      electrolyte_conc_M: num('electrolyte_conc_M'),
      electrode_area_cm2: num('electrode_area_cm2'),
      solution_level_mm: num('solution_level_mm'),
    } as any,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      console.log('Daniell pili verisi kaydediliyor:', data)
      
      // Firebase için undefined değerleri filtrele
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      )
      
      await addDoc(collection(db, 'runs'), {
        type: 'daniell',
        userId: auth.currentUser?.uid || null,
        ...cleanedData,
        createdAt: serverTimestamp(),
      })
      console.log('Daniell pili verisi başarıyla kaydedildi')
      reset()
      setSuccessMessage('Daniell pili verisi başarıyla kaydedildi!')
      
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
      <h2 style={{ color: '#1f2937', marginBottom: 24, borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>Daniell Pili Kayıtı</h2>
      
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
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Hafta Etiketi (YYYY-WW) *</label>
            <input 
              {...register('weekTag' as any)} 
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
          
          <div>
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
        </div>
        
        <h3 style={{ color: '#1f2937', marginBottom: 16, fontSize: 16, borderBottom: '1px solid #d1d5db', paddingBottom: 8 }}>Pil Parametreleri</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Elektrolit Derişimi (M) *</label>
            <input 
              type="number" 
              step="0.1" 
              {...register('electrolyte_conc_M')} 
              style={{
                width: '100%',
                padding: 10,
                border: errors.electrolyte_conc_M ? '2px solid #f56565' : '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="1.0"
            />
            {errors.electrolyte_conc_M && <span style={{ color: '#f56565', fontSize: 12 }}>0.1-2.0 arası değer giriniz</span>}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Elektrot Alanı (cm²) *</label>
            <input 
              type="number" 
              step="0.1" 
              {...register('electrode_area_cm2')} 
              style={{
                width: '100%',
                padding: 10,
                border: errors.electrode_area_cm2 ? '2px solid #f56565' : '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="10.0"
            />
            {errors.electrode_area_cm2 && <span style={{ color: '#f56565', fontSize: 12 }}>1-25 arası değer giriniz</span>}
          </div>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Çözelti Seviyesi (mm) *</label>
          <input 
            type="number" 
            step="1" 
            {...register('solution_level_mm')} 
            style={{
              width: '100%',
              padding: 10,
              border: errors.solution_level_mm ? '2px solid #f56565' : '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14
            }}
            disabled={isLoading}
            placeholder="50"
          />
          {errors.solution_level_mm && <span style={{ color: '#f56565', fontSize: 12 }}>Pozitif bir değer giriniz</span>}
        </div>
        
        <h3 style={{ color: '#1f2937', marginBottom: 16, fontSize: 16, borderBottom: '1px solid #d1d5db', paddingBottom: 8 }}>Elektriksel Ölçümler (opsiyonel)</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Boşta Gerilim EMF (V)</label>
            <input 
              type="number" 
              step="0.01" 
              {...register('ocv_V')} 
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="1.10"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Akım (A)</label>
            <input 
              type="number" 
              step="0.01" 
              {...register('current_A')} 
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="0.50"
            />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Yük Altında Gerilim (V)</label>
            <input 
              type="number" 
              step="0.01" 
              {...register('voltage_V')} 
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="0.90"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Güç (W)</label>
            <input 
              type="number" 
              step="0.01" 
              {...register('power_W')} 
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="0.45"
            />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>Enerji (Wh)</label>
            <input 
              type="number" 
              step="0.01" 
              {...register('energy_Wh')} 
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14
              }}
              disabled={isLoading}
              placeholder="toplam enerji"
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
            placeholder="Pil performansı, gözlemler ve ek bilgiler..."
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            width: '100%',
            padding: 16,
            background: isLoading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          {isLoading ? 'Kaydediliyor...' : '⚡ Pil Verisi Kaydet'}
        </button>
      </form>
      
      <div style={{ 
        marginTop: 24, 
        padding: 16,
        background: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: 8,
        fontSize: 14,
        color: '#0369a1'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#0c4a6e' }}>💡 İpcuçları:</h4>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Tek Daniell hücresi yaklaşık 1.1V gerilim üretir</li>
          <li>Motor sürmek için hücreleri seri bağlayarak 3-6V hedefleyin</li>
          <li>Bu form tek hücre ölçümlerini kaydeder</li>
          <li>Elektrolit derişimi ve elektrot alanı performansı çok etkiler</li>
        </ul>
      </div>
    </div>
  )
}

function isoWeekTag(d: Date) {
  const year = d.getUTCFullYear()
  const onejan = new Date(Date.UTC(year, 0, 1))
  const week = Math.ceil(((+d - +onejan) / 86400000 + onejan.getUTCDay() + 1) / 7)
  return `${year}-${String(week).padStart(2, '0')}`
}
