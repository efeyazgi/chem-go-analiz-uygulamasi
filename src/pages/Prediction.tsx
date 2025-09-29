import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useEffect, useMemo, useState } from 'react'
import { olsFit, type RegressionResult } from '../utils/regression'
import { useForm } from 'react-hook-form'

type Run = any

export default function Prediction() {
  const [runs, setRuns] = useState<Run[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedModel, setSelectedModel] = useState<'gas' | 'daniell'>('gas')
  const [predictionResult, setPredictionResult] = useState<number | null>(null)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError('')
      
      try {
        console.log('Tahmin için veri yükleniyor...')
        const snap = await getDocs(collection(db, 'runs'))
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        console.log('Yüklenen veri sayısı:', items.length)
        setRuns(items)
      } catch (err: any) {
        console.error('Veri yükleme hatası:', err)
        setError('Veriler yüklenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'))
      } finally {
        setIsLoading(false)
      }
    }
    
    load()
  }, [])

  // Veri tipine göre filtreleme ve model eğitimi
  const modelData = useMemo(() => {
    if (!runs || runs.length === 0) return null
    
    const filteredData = runs.filter(r => r.type === selectedModel)
    if (filteredData.length < 3) return null
    
    // Gas modeli için özellikler
    if (selectedModel === 'gas') {
      const gasFeatures = ['vinegar_ml', 'bicarb_g', 'temperature_C', 'time_s']
      const validData = filteredData.filter(r => 
        gasFeatures.every(f => r[f] != null && !isNaN(Number(r[f]))) &&
        r.distance_m != null && !isNaN(Number(r.distance_m))
      )
      
      if (validData.length < 3) return null
      
      const X = validData.map(r => gasFeatures.map(f => Number(r[f])))
      const y = validData.map(r => Number(r.distance_m))
      
      const model = olsFit(X, y)
      return {
        model,
        features: gasFeatures,
        featureLabels: ['Sirke (mL)', 'Karbonat (g)', 'Sıcaklık (°C)', 'Süre (s)'],
        target: 'distance_m',
        targetLabel: 'Mesafe (m)',
        dataCount: validData.length
      }
    }
    
    // Daniell modeli için özellikler  
    else {
      const daniellFeatures = ['electrolyte_conc_M', 'electrode_area_cm2', 'current_A']
      const validData = filteredData.filter(r => 
        daniellFeatures.every(f => r[f] != null && !isNaN(Number(r[f]))) &&
        r.distance_m != null && !isNaN(Number(r.distance_m))
      )
      
      if (validData.length < 3) return null
      
      const X = validData.map(r => daniellFeatures.map(f => Number(r[f])))
      const y = validData.map(r => Number(r.distance_m))
      
      const model = olsFit(X, y)
      return {
        model,
        features: daniellFeatures,
        featureLabels: ['Elektrolit Derişimi (M)', 'Elektrot Alanı (cm²)', 'Akım (A)'],
        target: 'distance_m',
        targetLabel: 'Mesafe (m)',
        dataCount: validData.length
      }
    }
  }, [runs, selectedModel])

  const onPredict = (data: any) => {
    if (!modelData) return
    
    try {
      const inputValues = modelData.features.map(feature => Number(data[feature]))
      const prediction = modelData.model.predict(inputValues)
      setPredictionResult(prediction)
    } catch (error) {
      console.error('Tahmin hatası:', error)
      setPredictionResult(null)
    }
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 24, marginBottom: 16 }}>🔄</div>
        <div>Model verileri yükleniyor...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20, minHeight: '100vh' }}>
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
          🔮 Model Tahminleme
        </h1>
        <p style={{ margin: 0, fontSize: 18, opacity: 0.9 }}>
          Eğitilmiş modellerle yeni değerler tahmin edin
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

      {/* Model Seçimi */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
          🎯 Model Seçimi
        </h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="model" 
              value="gas" 
              checked={selectedModel === 'gas'}
              onChange={(e) => setSelectedModel('gas')}
            />
            <span>💨 Gaz Deneyi Modeli</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="model" 
              value="daniell" 
              checked={selectedModel === 'daniell'}
              onChange={(e) => setSelectedModel('daniell')}
            />
            <span>⚡ Daniell Pili Modeli</span>
          </label>
        </div>
      </div>

      {!modelData ? (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: 8,
          padding: 24,
          textAlign: 'center',
          color: '#92400e'
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Yetersiz Veri</div>
          <div>
            Seçili model için yeterli veri yok. En az 3 tamamlanmış deney kaydı gereklidir.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
          {/* Tahmin Formu */}
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
              📝 Tahmin Parametreleri
            </h3>
            
            <form onSubmit={handleSubmit(onPredict)} style={{ marginBottom: 20 }}>
              {modelData.features.map((feature, index) => (
                <div key={feature} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#374151' }}>
                    {modelData.featureLabels[index]}
                  </label>
                  <input 
                    type="number"
                    step="any"
                    {...register(feature, { 
                      required: 'Bu alan gerekli',
                      valueAsNumber: true,
                      validate: value => !isNaN(value) || 'Geçerli bir sayı girin'
                    })}
                    style={{
                      width: '100%',
                      padding: 10,
                      border: errors[feature] ? '2px solid #f56565' : '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 14
                    }}
                    placeholder={`${modelData.featureLabels[index]} değerini girin`}
                  />
                  {errors[feature] && (
                    <span style={{ color: '#f56565', fontSize: 12 }}>
                      {errors[feature]?.message as string}
                    </span>
                  )}
                </div>
              ))}
              
              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: 16,
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                🔮 Tahmin Et
              </button>
            </form>

            {predictionResult !== null && (
              <div style={{
                padding: 16,
                background: '#d1fae5',
                border: '1px solid #a7f3d0',
                borderRadius: 8,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', color: '#065f46', marginBottom: 8 }}>
                  Tahmin Sonucu:
                </div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#065f46' }}>
                  {predictionResult.toFixed(3)} metre
                </div>
              </div>
            )}
          </div>

          {/* Model Bilgileri */}
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
              📊 Model Bilgileri
            </h3>
            
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #0ea5e9' }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#0c4a6e', marginBottom: 4 }}>Model Türü</div>
                <div style={{ fontSize: 16, color: '#0369a1' }}>
                  {selectedModel === 'gas' ? '💨 Gaz Deneyi' : '⚡ Daniell Pili'} → Mesafe Tahmini
                </div>
              </div>
              
              <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #0ea5e9' }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#0c4a6e', marginBottom: 4 }}>Eğitim Verisi</div>
                <div style={{ fontSize: 16, color: '#0369a1' }}>{modelData.dataCount} kayıt</div>
              </div>
              
              <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #0ea5e9' }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#0c4a6e', marginBottom: 4 }}>Model Performansı</div>
                <div style={{ fontSize: 16, color: '#0369a1' }}>
                  R² = {(modelData.model.rSquared * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: 12, color: '#0369a1' }}>
                  RMSE = {modelData.model.rmse.toFixed(3)}
                </div>
              </div>
              
              <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #0ea5e9' }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#0c4a6e', marginBottom: 8 }}>Regresyon Denklemi</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#0369a1', wordBreak: 'break-all' }}>
                  y = {modelData.model.coef[0].toFixed(3)} + 
                  {modelData.model.coef.slice(1).map((c, i) => 
                    ` ${c >= 0 ? '+' : ''}${c.toFixed(3)}×x${i+1}`
                  ).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}