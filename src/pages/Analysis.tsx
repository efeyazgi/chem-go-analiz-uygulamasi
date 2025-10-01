import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useEffect, useMemo, useState } from 'react'
import { olsFit, crossValidation, type RegressionResult } from '../utils/regression'
import { useAuth } from '../lib/auth'

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend)

type Run = any

const LABELS: Record<string, string> = {
  vinegar_ml: 'Asetik Asit (mL)',
  vinegar_acetic_pct: 'Asetik Asit (%)',
  bicarb_g: 'Sodyumbikarbonat (g)',
  temperature_C: 'Sıcaklık (°C)',
  time_s: 'Süre (s)',
  co2_volume_ml: 'CO₂ Hacmi (mL)',
  distance_m: 'Mesafe (m)',
  electrolyte_conc_M: 'Konsantrasyon (M)',
  electrode_area_cm2: 'Elektrot Alanı (cm²)',
  current_A: 'Akım (A)',
  voltage_V: 'Gerilim (V)',
  power_W: 'Güç (W)',
  energy_Wh: 'Enerji (Wh)',
  vehicleMass_kg: 'Araç Kütlesi (kg)',
}

export default function Analysis() {
  const { user } = useAuth()
  const [runs, setRuns] = useState<Run[]>([])
  const [feature, setFeature] = useState<string>('vinegar_ml')
  const [target, setTarget] = useState<string>('distance_m')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError('')
      
      try {
        console.log('Veri yükleniyor...')
        const snap = await getDocs(collection(db, 'runs'))
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        console.log('Yüklenen veri sayısı:', items.length)
        console.log('Yüklenen veriler:', items)
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

  const data = useMemo(() => {
    if (!runs || runs.length === 0) return []
    return runs.filter((r) => {
      const featVal = r && r[feature]
      const targVal = r && r[target]
      return featVal != null && !isNaN(Number(featVal)) && targVal != null && !isNaN(Number(targVal))
    })
  }, [runs, feature, target])

  const regressionData = useMemo(() => {
    if (!data || data.length < 2) {
      return {
        coef: [0, 0],
        predict: (x: number[]) => 0,
        rSquared: 0,
        rmse: 0,
        residuals: [],
        predictions: [],
        xs: [],
        ys: [],
        lineX: [0, 1],
        lineY: [0, 0],
        cvResults: { cvRMSE: 0, cvScores: [] },
        n: 0,
        yMean: 0
      }
    }
    
    try {
      const X = data.map((r) => [Number(r[feature])])
      const y = data.map((r) => Number(r[target]))
      
      const model = olsFit(X, y)
      const cvResults = data.length >= 5 ? crossValidation(X, y, Math.min(5, data.length)) : { cvRMSE: 0, cvScores: [] }
      
      const xs = data.map((r) => Number(r[feature]))
      const ys = data.map((r) => Number(r[target]))
      const lineX = xs.length ? [Math.min(...xs), Math.max(...xs)] : [0, 1]
      const lineY = lineX.map((x) => model.predict([x]))
      
      return { 
        ...model, 
        xs, 
        ys, 
        lineX, 
        lineY, 
        cvResults 
      }
    } catch (error) {
      console.error('Regresyon hesaplamasında hata:', error)
      return {
        coef: [0, 0],
        predict: (x: number[]) => 0,
        rSquared: 0,
        rmse: 0,
        residuals: [],
        predictions: [],
        xs: [],
        ys: [],
        lineX: [0, 1],
        lineY: [0, 0],
        cvResults: { cvRMSE: 0, cvScores: [] },
        n: 0,
        yMean: 0
      }
    }
  }, [data, feature, target])
  
  const { coef, predict, rSquared, rmse, residuals, predictions, xs, ys, lineX, lineY, cvResults, n } = regressionData

  // Admin yetkisi kontrolü
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
          <h2 style={{ margin: '0 0 16px 0', color: '#92400e' }}>Yetkiniz Yok</h2>
          <p style={{ margin: 0, fontSize: 16 }}>
            Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor.
            <br />Yetki için lütfen yöneticinize başvurun.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 24, marginBottom: 16 }}>🔄</div>
        <div>Analiz veriler yükleniyor...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', minHeight: '100vh' }}>
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
          📊 Regresyon Analizi
        </h1>
        <p style={{ margin: 0, fontSize: 18, opacity: 0.9 }}>
          Deney verileriniz arasında ilişki analizi yapın
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

      {runs.length === 0 ? (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: 8,
          padding: 24,
          textAlign: 'center',
          color: '#0369a1'
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📈</div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Henüz analiz edilecek veri yok</div>
          <div>Analiz yapmak için önce deney verileri kaydedin.</div>
        </div>
      ) : (
        <>
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚙️ Analiz Ayarları
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: 20 
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#374151' }}>
                  Bağımsız Değişken (X)
                </label>
                <select 
                  value={feature} 
                  onChange={(e) => setFeature(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    background: 'white'
                  }}
                >
                  <option value="vinegar_ml">Asetik Asit (mL)</option>
                  <option value="vinegar_acetic_pct">Asetik Asit (%)</option>
                  <option value="bicarb_g">Sodyumbikarbonat (g)</option>
                  <option value="temperature_C">Sıcaklık (°C)</option>
                  <option value="time_s">Süre (s)</option>
                  <option value="co2_volume_ml">CO₂ Hacmi (mL)</option>
                  <option value="electrolyte_conc_M">Konsantrasyon (M)</option>
                  <option value="electrode_area_cm2">Elektrot Alanı (cm²)</option>
                  <option value="current_A">Akım (A)</option>
                  <option value="voltage_V">Gerilim (V)</option>
                  <option value="power_W">Güç (W)</option>
                  <option value="vehicleMass_kg">Araç Kütlesi (kg)</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#374151' }}>
                  Bağımlı Değişken (Y)
                </label>
                <select 
                  value={target} 
                  onChange={(e) => setTarget(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    background: 'white'
                  }}
                >
                  <option value="distance_m">Mesafe (m)</option>
                  <option value="co2_volume_ml">CO₂ Hacmi (mL)</option>
                  <option value="power_W">Güç (W)</option>
                  <option value="energy_Wh">Enerji (Wh)</option>
                  <option value="current_A">Akım (A)</option>
                  <option value="voltage_V">Gerilim (V)</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 6, fontSize: 14, color: '#6b7280' }}>
              Toplam {runs.length} kayıt, analiz edilen {data.length} kayıt (eksik veriler filtrendi)
            </div>
          </div>

          {data.length > 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
                📊 Regresyon Grafiği
              </h3>
              
              <div style={{ 
                background: '#fafafa',
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>Regresyon Denklemi:</div>
                <div style={{ fontFamily: 'monospace', fontSize: 16, color: '#ef6c00', fontWeight: 'bold' }}>
                  y = {coef.map((c, i) => i === 0 ? c.toFixed(3) : `${c >= 0 ? '+' : ''}${c.toFixed(3)}x`).join(' ')}
                </div>
              </div>

              {/* Model Performans Metrikleri */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div style={{ padding: 12, background: '#e7f3ff', borderRadius: 8, border: '1px solid #b3d9ff' }}>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#0066cc', marginBottom: 4 }}>R² Skoru</div>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#0066cc' }}>{(rSquared * 100).toFixed(1)}%</div>
                  <div style={{ fontSize: 10, color: '#0066cc' }}>Model açıklama oranı</div>
                </div>
                
                <div style={{ padding: 12, background: '#fff2e6', borderRadius: 8, border: '1px solid #ffcc99' }}>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#cc6600', marginBottom: 4 }}>RMSE</div>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#cc6600' }}>{rmse.toFixed(3)}</div>
                  <div style={{ fontSize: 10, color: '#cc6600' }}>Kök ortalama kare hatası</div>
                </div>
                
                <div style={{ padding: 12, background: '#f0fff4', borderRadius: 8, border: '1px solid #90ee90' }}>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#006600', marginBottom: 4 }}>Veri Sayısı</div>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#006600' }}>{n}</div>
                  <div style={{ fontSize: 10, color: '#006600' }}>Eğitim nokta sayısı</div>
                </div>
                
                {cvResults.cvRMSE > 0 && (
                  <div style={{ padding: 12, background: '#f9f0ff', borderRadius: 8, border: '1px solid #d4b3ff' }}>
                    <div style={{ fontSize: 12, fontWeight: 'bold', color: '#6600cc', marginBottom: 4 }}>CV-RMSE</div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#6600cc' }}>{cvResults.cvRMSE.toFixed(3)}</div>
                    <div style={{ fontSize: 10, color: '#6600cc' }}>5-fold cross validation</div>
                  </div>
                )}
              </div>

              <div style={{ 
                width: '100%', 
                maxWidth: '100%', 
                overflowX: 'auto',
                minHeight: 400,
                '@media (max-width: 768px)': {
                  minHeight: 300
                }
              }}>
                <Scatter
                  data={{
                    datasets: [
                      {
                        label: 'Gercek Veriler',
                        data: xs.map((x, i) => ({ x, y: ys[i] })),
                        backgroundColor: '#3b82f6',
                        borderColor: '#1d4ed8',
                        pointRadius: 6,
                        pointHoverRadius: 8,
                      },
                      {
                        label: 'Regresyon Çizgisi',
                        data: lineX.map((x, i) => ({ x, y: lineY[i] })),
                        showLine: true,
                        borderColor: '#ef6c00',
                        backgroundColor: 'transparent',
                        pointRadius: 0,
                        borderWidth: 3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      intersect: false,
                    },
                    plugins: {
                      legend: {
                        position: 'top' as const,
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#374151',
                        borderWidth: 1,
                      },
                    },
                    scales: { 
                      x: { 
                        type: 'linear', 
                        title: { 
                          display: true, 
                          text: LABELS[feature] || feature,
                          font: {
                            size: 14,
                            weight: 'bold',
                          },
                          color: '#374151',
                        },
                        grid: {
                          color: '#e5e7eb',
                        },
                      }, 
                      y: { 
                        title: { 
                          display: true, 
                          text: LABELS[target] || target,
                          font: {
                            size: 14,
                            weight: 'bold',
                          },
                          color: '#374151',
                        },
                        grid: {
                          color: '#e5e7eb',
                        },
                      } 
                    },
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: 8,
              padding: 16,
              color: '#92400e'
            }}>
              ⚠️ Seçili değişkenler için yeterli veri yok. Lütfen farklı değişkenler seçin.
            </div>
          )}
        </>
      )}
    </div>
  )
}
