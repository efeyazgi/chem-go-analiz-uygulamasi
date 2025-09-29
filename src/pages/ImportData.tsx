import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { useState } from 'react'
import { refreshDashboard } from './Dashboard'

export default function ImportData() {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [importStats, setImportStats] = useState<{total: number, gas: number, daniell: number} | null>(null)

  const handleCSV = async (file: File) => {
    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')
    setImportStats(null)
    
    try {
      const text = await file.text()
      const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
      const rows = result.data
      
      let gasCount = 0
      let daniellCount = 0
      let totalProcessed = 0
      
      for (const r of rows) {
        const type = (r.type || '').toLowerCase()
        if (type !== 'gas' && type !== 'daniell') {
          console.log('Atlanan satır (geçersiz tip):', r)
          continue
        }
        
        // WeekTag otomatik oluştur eğer yoksa
        const processedData = {
          type,
          userId: auth.currentUser?.uid || null,
          ...coerceNumbers(r),
          createdAt: serverTimestamp(),
        }
        
        // WeekTag eksikse date'den oluştur
        if (!processedData.weekTag && processedData.date) {
          try {
            const date = new Date(processedData.date)
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            processedData.weekTag = `${year}-${String(month).padStart(2, '0')}`
          } catch (e) {
            // Date parse edilemezse bugünün tarihini kullan
            const now = new Date()
            const year = now.getFullYear()
            const month = now.getMonth() + 1
            processedData.weekTag = `${year}-${String(month).padStart(2, '0')}`
          }
        }
        
        await addDoc(collection(db, 'runs'), processedData)
        
        if (type === 'gas') gasCount++
        else daniellCount++
        totalProcessed++
      }
      
      setImportStats({ total: totalProcessed, gas: gasCount, daniell: daniellCount })
      setSuccessMessage(`Başarıyla ${totalProcessed} kayıt içe aktarıldı!`)
      
      // Dashboard'ı güncelle
      refreshDashboard()
      
      // 3 saniye sonra mesajları temizle
      setTimeout(() => {
        setSuccessMessage('')
        setImportStats(null)
      }, 5000)
    } catch (error: any) {
      console.error('CSV içe aktarma hatası:', error)
      setErrorMessage('Dosya işlenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleXLSX = async (file: File) => {
    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')
    setImportStats(null)
    
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws)
      
      let gasCount = 0
      let daniellCount = 0
      let totalProcessed = 0
      
      for (const r of rows) {
        const type = (r.type || '').toLowerCase()
        if (type !== 'gas' && type !== 'daniell') {
          console.log('Atlanan satır (geçersiz tip):', r)
          continue
        }
        
        // WeekTag otomatik oluştur eğer yoksa
        const processedData = {
          type,
          userId: auth.currentUser?.uid || null,
          ...coerceNumbers(r),
          createdAt: serverTimestamp(),
        }
        
        // WeekTag eksikse date'den oluştur
        if (!processedData.weekTag && processedData.date) {
          try {
            const date = new Date(processedData.date)
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            processedData.weekTag = `${year}-${String(month).padStart(2, '0')}`
          } catch (e) {
            // Date parse edilemezse bugünün tarihini kullan
            const now = new Date()
            const year = now.getFullYear()
            const month = now.getMonth() + 1
            processedData.weekTag = `${year}-${String(month).padStart(2, '0')}`
          }
        }
        
        await addDoc(collection(db, 'runs'), processedData)
        
        if (type === 'gas') gasCount++
        else daniellCount++
        totalProcessed++
      }
      
      setImportStats({ total: totalProcessed, gas: gasCount, daniell: daniellCount })
      setSuccessMessage(`Başarıyla ${totalProcessed} kayıt içe aktarıldı!`)
      
      // Dashboard'ı güncelle
      refreshDashboard()
      
      // 5 saniye sonra mesajları temizle
      setTimeout(() => {
        setSuccessMessage('')
        setImportStats(null)
      }, 5000)
    } catch (error: any) {
      console.error('Excel içe aktarma hatası:', error)
      setErrorMessage('Dosya işlenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'))
    } finally {
      setIsLoading(false)
    }
  }

  const exportTemplate = (which: 'gas' | 'daniell') => {
    // İngilizce alan adları (sistem için)
    const headGasEng = ['type','date','weekTag','vehicleMass_kg','vinegar_ml','vinegar_acetic_pct','bicarb_g','temperature_C','time_s','co2_volume_ml','distance_m','notes']
    const headDanEng = ['type','date','weekTag','vehicleMass_kg','electrolyte_conc_M','electrode_area_cm2','solution_level_mm','ocv_V','current_A','voltage_V','power_W','energy_Wh','distance_m','notes']
    
    // Türkçe açıklamalar
    const headGasTr = ['Tip (gas)','Tarih (YYYY-MM-DD)','Hafta Etiketi (YYYY-WW)','Araç Kütlesi (kg)','Sirke (mL)','Asetik Asit (%)','Karbonat (g)','Sıcaklık (°C)','Süre (s)','CO2 Hacmi (mL)','Mesafe (m)','Notlar']
    const headDanTr = ['Tip (daniell)','Tarih (YYYY-MM-DD)','Hafta Etiketi (YYYY-WW)','Araç Kütlesi (kg)','Elektrolit Derişimi (M)','Elektrot Alanı (cm²)','Çözelti Seviyesi (mm)','Boşta Gerilim (V)','Akım (A)','Gerilim (V)','Güç (W)','Enerji (Wh)','Mesafe (m)','Notlar']
    
    // Örnek veriler
    const exampleGas = ['gas', '2024-01-15', '2024-03', '0.5', '50', '5', '10', '20', '60', '120', '2.5', 'Başarılı deney']
    const exampleDan = ['daniell', '2024-01-15', '2024-03', '0.5', '1.0', '10', '50', '1.1', '0.5', '0.9', '0.45', '0.2', '1.8', 'Pil performansı iyi']
    
    const headerEng = which === 'gas' ? headGasEng : headDanEng
    const headerTr = which === 'gas' ? headGasTr : headDanTr
    const example = which === 'gas' ? exampleGas : exampleDan
    
    // Şablon oluştur: Türkçe açıklama, İngilizce alan adı, örnek veri
    const ws = XLSX.utils.aoa_to_sheet([
      headerTr,    // 1. satır: Türkçe açıklamalar
      headerEng,   // 2. satır: Sistem alan adları
      example      // 3. satır: Örnek veri
    ])
    
    // Sütun genişliklerini ayarla
    ws['!cols'] = headerEng.map(() => ({ wch: 20 }))
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, which === 'gas' ? 'Gaz_Deneyi_Sablonu' : 'Daniell_Pili_Sablonu')
    XLSX.writeFile(wb, `${which === 'gas' ? 'Gaz_Deneyi' : 'Daniell_Pili'}_Sablonu.xlsx`)
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
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
          📁 Veri İçe/Dışa Aktarım
        </h1>
        <p style={{ margin: 0, fontSize: 18, opacity: 0.9 }}>
          Excel veya CSV dosyalarıyla toplu veri işlemleri yapın
        </p>
      </div>

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
          {importStats && (
            <div style={{ marginTop: 8, fontSize: 14 }}>
              📊 İstatistikler: {importStats.gas} gaz deneyi, {importStats.daniell} Daniell pili
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
          color: '#991b1b'
        }}>
          ✗ {errorMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Dosya Yükleme Kartı */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
            📤 Dosya Yükle
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
            Excel (.xlsx) veya CSV (.csv) dosyası seçerek verilerinizi toplu olarak içe aktarın.
          </p>
          
          <div style={{
            border: '2px dashed #d1d5db',
            borderRadius: 8,
            padding: 24,
            textAlign: 'center',
            background: '#f9fafb'
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
            <input 
              type="file" 
              accept=".csv,.xlsx" 
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                background: 'white'
              }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                if (f.name.endsWith('.csv')) handleCSV(f)
                else handleXLSX(f)
              }} 
            />
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
              Desteklenen formatlar: .xlsx, .csv
            </div>
          </div>
          
          {isLoading && (
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              background: '#f0f9ff', 
              borderRadius: 6, 
              textAlign: 'center',
              color: '#0369a1'
            }}>
              🔄 Dosya işleniyor, lütfen bekleyin...
            </div>
          )}
        </div>

        {/* Şablon İndirme Kartı */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
            📎 Şablon İndir
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            Doğru formatla veri hazırlamak için şablonları indirin. Şablonlar Türkçe açıklamalar ve örnek veriler içerir.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button 
              onClick={() => exportTemplate('gas')}
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
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              💨 Gaz Deneyi Şablonu İndir
            </button>
            
            <button 
              onClick={() => exportTemplate('daniell')}
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
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              ⚡ Daniell Pili Şablonu İndir
            </button>
          </div>
        </div>
      </div>

      {/* İmport Mantığı Açıklaması */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        marginTop: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚙️ İmport Mantığı ve Detaylar
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
          <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 8, border: '1px solid #0ea5e9' }}>
            <div style={{ fontWeight: 'bold', color: '#0c4a6e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              📄 Dosya Formatı
            </div>
            <div style={{ fontSize: 14, color: '#0369a1', lineHeight: 1.5 }}>
              Excel (.xlsx) ve CSV dosyaları desteklenir. Şablon formatına uygun olmalıdır.
            </div>
          </div>
          
          <div style={{ padding: 16, background: '#ecfdf5', borderRadius: 8, border: '1px solid #10b981' }}>
            <div style={{ fontWeight: 'bold', color: '#064e3b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              📅 WeekTag Otomatik
            </div>
            <div style={{ fontSize: 14, color: '#047857', lineHeight: 1.5 }}>
              Hafta etiketi boşsa, tarih alanından otomatik oluşturulur (YYYY-MM formatında).
            </div>
          </div>
          
          <div style={{ padding: 16, background: '#fef3c7', borderRadius: 8, border: '1px solid #f59e0b' }}>
            <div style={{ fontWeight: 'bold', color: '#92400e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              🔄 Dashboard Güncelleme
            </div>
            <div style={{ fontSize: 14, color: '#d97706', lineHeight: 1.5 }}>
              Import sonrası ana panel otomatik olarak güncellenir, sayfa yenileme gereksizdir.
            </div>
          </div>
        </div>
        
        <div style={{ padding: 16, background: '#f3e8ff', borderRadius: 8, border: '1px solid #a855f7', marginBottom: 20 }}>
          <div style={{ fontWeight: 'bold', color: '#7c2d12', marginBottom: 8 }}>
            📊 Veri Güncelleme Mantığı:
          </div>
          <div style={{ fontSize: 14, color: '#7c3aed', lineHeight: 1.6 }}>
            <strong>Yeni kayıt ekleme:</strong> Excel/CSV'deki her satır yeni bir kayıt olarak eklenir. Mevcut veriler üzerine yazılmaz.<br/>
            <strong>Aynı dosyayı tekrar yüklerseniz:</strong> Aynı veriler çoplanacaktır (duplikasyon olur).<br/>
            <strong>Güncelleme için:</strong> Önce “Veri Yönetimi” sayfasından eski kayıtları silin, sonra yeni dosyayı yükleyin.
          </div>
        </div>
      </div>
      
      {/* Kullanım Kılavuzu */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        marginTop: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
          📝 Adım Adım Kullanım
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>1. Şablon İndirin</div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>Ğaz deneyi veya Daniell pili için uygun şablonu indirin.</div>
          </div>
          <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>2. Veri Girin</div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>3. satırdan itibaren verilerinizi girin. 1-2. satırlar başlık ve örnektir.</div>
          </div>
          <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>3. Dosya Yükleyin</div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>Hazırladığınız dosyayı yukarıdan seçerek yükleyin.</div>
          </div>
          <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>4. Kontrol Edin</div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>Dashboard ve analiz sayfalarında verilerinizin doğru yüklendigini kontrol edin.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function coerceNumbers(obj: Record<string, any>) {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj)) {
    const num = typeof v === 'string' && v.trim() !== '' ? Number(v) : v
    out[k] = Number.isFinite(num) ? num : v
  }
  return out
}
