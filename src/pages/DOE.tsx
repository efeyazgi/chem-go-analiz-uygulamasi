import { useEffect, useMemo, useState } from 'react'
import { buildDesign, Factor, L9_3_3, SNMode, snr, mainEffects, bestLevels, selectOAForFactors } from '../utils/taguchi'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

export default function DOE() {
  const [experiment, setExperiment] = useState<'gas' | 'daniell'>('gas')

  const [gasFactors, setGasFactors] = useState<Factor[]>([
    { name: 'vinegar_ml', label: 'Asetik Asit (mL)', levels: [20, 40, 60] },
    { name: 'bicarb_g', label: 'Sodyumbikarbonat (g)', levels: [2, 4, 6] },
    { name: 'time_s', label: 'Süre (s)', levels: [30, 60, 90] },
  ])

  const [daniellFactors, setDaniellFactors] = useState<Factor[]>([
    { name: 'electrolyte_conc_M', label: 'Konsantrasyon (M)', levels: [0.5, 1.0, 1.5] },
    { name: 'electrode_area_cm2', label: 'Elektrot Alanı (cm²)', levels: [5, 10, 15] },
    { name: 'solution_level_mm', label: 'Çözelti Seviyesi (mm)', levels: [30, 50, 70] },
  ])

  const navigate = useNavigate()
  const activeFactors = experiment === 'gas' ? gasFactors : daniellFactors

  const { oa, warning } = useMemo(() => selectOAForFactors(activeFactors), [activeFactors])
  const plan = useMemo(() => buildDesign(activeFactors, oa), [activeFactors, oa])

  useEffect(() => {
    // adjust runInputs length when plan changes
    setRunInputs(prev => {
      const next = [...prev]
      next.length = plan.length
      for (let i = 0; i < plan.length; i++) if (next[i] == null) next[i] = ''
      return next
    })
  }, [plan.length])

  // S/N and response inputs
  const [snMode, setSnMode] = useState<SNMode>('larger')
  const [runInputs, setRunInputs] = useState<string[]>(() => Array(L9_3_3.matrix.length).fill(''))

  const runSnrs = useMemo(() => {
    return runInputs.map(inp => {
      const nums = (inp || '')
        .split(/[,;\s]+/)
        .map(v => Number(v))
        .filter(v => !isNaN(v))
      if (nums.length === 0) return NaN
      return snr(nums, snMode)
    })
  }, [runInputs, snMode])

  const effects = useMemo(() => mainEffects(activeFactors, plan, runSnrs), [activeFactors, plan, runSnrs])
  const best = useMemo(() => bestLevels(activeFactors, effects), [activeFactors, effects])

  const onLevelChange = (fi: number, li: number, value: number) => {
    const copy = activeFactors.map(f => ({ ...f, levels: [...f.levels] }))
    copy[fi].levels[li] = value
    if (experiment === 'gas') setGasFactors(copy)
    else setDaniellFactors(copy)
  }

  const downloadCSV = () => {
    const headers = ['Run', ...activeFactors.map(f => f.label || f.name)]
    const rows = plan.map(r => [
      r.index,
      ...activeFactors.map(f => r.levels[f.name])
    ])
    const content = [headers, ...rows]
      .map(row => row.join(','))
      .join('\r\n')
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${experiment}-L9-plan.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>🧪 DOE Paneli (Taguchi L9)</h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
          Basit 3×3 faktörlü L9 planı ile haftalık deney setinizi hazırlayın
        </p>
      </div>

      <div style={{
        background: '#ffffff', borderRadius: 12, padding: 20, marginBottom: 16,
        border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginTop: 0 }}>1) Deney Tipi</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input 
              type="radio" 
              name="exp" 
              checked={experiment === 'gas'} 
              onChange={() => setExperiment('gas')} 
            />
            <span>💨 Gaz İtişi</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input 
              type="radio" 
              name="exp" 
              checked={experiment === 'daniell'} 
              onChange={() => setExperiment('daniell')} 
            />
            <span>⚡ Daniell Pili</span>
          </label>
        </div>
      </div>

      <div style={{
        background: '#ffffff', borderRadius: 12, padding: 20, marginBottom: 16,
        border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginTop: 0 }}>2) Faktörler ve Düzeyler</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {activeFactors.map((f, fi) => (
            <div key={fi} style={{
              display: 'grid', gridTemplateColumns: '200px 110px repeat(3, 1fr) 80px', gap: 8, alignItems: 'center'
            }}>
              <input
                value={f.label || f.name}
                onChange={e => {
                  const copy = activeFactors.map(x => ({ ...x, levels: [...x.levels] }))
                  copy[fi].label = e.target.value
                  if (!copy[fi].name) copy[fi].name = e.target.value.replace(/\s+/g, '_').toLowerCase() || `factor_${fi+1}`
                  if (experiment === 'gas') setGasFactors(copy)
                  else setDaniellFactors(copy)
                }}
                style={{ padding: 10, border: '1px solid #d1d5db', borderRadius: 6 }}
              />
              <select
                value={f.levels.length}
                onChange={e => {
                  const k = Number(e.target.value)
                  const copy = activeFactors.map(x => ({ ...x, levels: [...x.levels] }))
                  copy[fi].levels = k === 2 ? copy[fi].levels.slice(0,2) : (copy[fi].levels.length===2 ? [...copy[fi].levels, copy[fi].levels[1]] : copy[fi].levels)
                  if (experiment === 'gas') setGasFactors(copy)
                  else setDaniellFactors(copy)
                }}
                style={{ padding: 10, border: '1px solid #d1d5db', borderRadius: 6 }}
              >
                <option value={2}>2 seviye</option>
                <option value={3}>3 seviye</option>
              </select>
              {Array.from({ length: f.levels.length }).map((_, li) => (
                <input
                  key={li}
                  type="number"
                  step="any"
                  value={f.levels[li]}
                  onChange={e => onLevelChange(fi, li, Number(e.target.value))}
                  style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                />
              ))}
              {f.levels.length === 2 && <div />}
              <button
                onClick={() => {
                  const copy = activeFactors.slice()
                  copy.splice(fi, 1)
                  if (experiment === 'gas') setGasFactors(copy)
                  else setDaniellFactors(copy)
                }}
                style={{ padding: 8, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b' }}
              >
                Sil
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => {
              const nf: Factor = { name: `factor_${activeFactors.length+1}`, label: `Faktör ${activeFactors.length+1}`, levels: [1,2,3] }
              const copy = [...activeFactors, nf]
              if (experiment === 'gas') setGasFactors(copy)
              else setDaniellFactors(copy)
            }}
            style={btnSecondary}
          >
            + Faktör Ekle
          </button>
        </div>
        {warning && (
          <div style={{ marginTop: 12, color: '#92400e', background: '#fef3c7', border: '1px solid #f59e0b', padding: 10, borderRadius: 8 }}>
            OA uyarısı: {warning}
          </div>
        )}
      </div>

      <div style={{
        background: '#ffffff', borderRadius: 12, padding: 20, marginBottom: 16,
        border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginTop: 0 }}>3) L9(3×3) Plan Tablosu</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Run</th>
                {activeFactors.map(f => (
                  <th key={f.name} style={th}>{f.label || f.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plan.map(row => (
                <tr key={row.index}>
                  <td style={td}>{row.index}</td>
                  {activeFactors.map(f => (
                    <td key={f.name} style={td}>{row.levels[f.name]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={downloadCSV}
            style={btnPrimary}
          >
            ⬇️ CSV İndir
          </button>
          <div style={{ color: '#6b7280', fontSize: 13 }}>
            İpucu: Koşu sırasını laboratuvarda randomize edin, her koşuyu 2 tekrar yapın.
          </div>
        </div>
      </div>

      <div style={{
        background: '#ffffff', borderRadius: 12, padding: 20, marginBottom: 16,
        border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginTop: 0 }}>4) S/N Modu ve Koşu Sonuçları</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, color: '#374151' }}>S/N:</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="radio" name="sn" checked={snMode === 'larger'} onChange={() => setSnMode('larger')} />
            <span>Büyüdükçe-İyi</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="radio" name="sn" checked={snMode === 'smaller'} onChange={() => setSnMode('smaller')} />
            <span>Küçüldükçe-İyi</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="radio" name="sn" checked={snMode === 'nominal'} onChange={() => setSnMode('nominal')} />
            <span>Nominal-En-İyi</span>
          </label>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Run</th>
                <th style={th}>Y replikler (virgülle)</th>
                <th style={th}>S/N (dB)</th>
              </tr>
            </thead>
            <tbody>
              {plan.map((row, i) => (
                <tr key={row.index}>
                  <td style={td}>{row.index}</td>
                  <td style={td}>
                    <input
                      value={runInputs[i] || ''}
                      onChange={e => {
                        const next = [...runInputs]
                        next[i] = e.target.value
                        setRunInputs(next)
                      }}
                      placeholder="ör: 1.2, 1.3, 1.1"
                      style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
                    />
                  </td>
                  <td style={td}>{isNaN(runSnrs[i]) ? '-' : runSnrs[i].toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{
        background: '#ffffff', borderRadius: 12, padding: 20, marginBottom: 16,
        border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginTop: 0 }}>5) Ana Etkiler (S/N ortalamaları) ve Öneri</h3>
        <div style={{ display: 'grid', gap: 16 }}>
          {activeFactors.map(f => (
            <div key={f.name}>
              <div style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>{f.label || f.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {f.levels.map((lv, li) => {
                  const val = effects[f.name]?.[li]
                  const b = best[f.name]
                  const isBest = b && b.levelIndex === li
                  return (
                    <div key={li} style={{
                      padding: 12,
                      border: '1px solid ' + (isBest ? '#34d399' : '#e5e7eb'),
                      borderRadius: 8,
                      background: isBest ? '#ecfdf5' : '#ffffff'
                    }}>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>Seviye: {lv}</div>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{isNaN(val) ? '-' : val.toFixed(3)} dB</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <div style={{ fontWeight: 700, color: '#111827', marginBottom: 6 }}>Önerilen En İyi Kombinasyon</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {activeFactors.map(f => (
              <div key={f.name} style={{ padding: 10, border: '1px solid #e5e7eb', borderRadius: 8, background: '#ffffff' }}>
                <div style={{ color: '#6b7280', fontSize: 12 }}>{f.label || f.name}</div>
                <div style={{ fontWeight: 600 }}>
                  {(() => {
                    const b = best[f.name]
                    return b ? `${b.levelValue} (S/N ${isFinite(b.snr) ? b.snr.toFixed(3) : '-'})` : '-'
                  })()}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (experiment === 'gas') {
                  const params = new URLSearchParams()
                  const get = (k: string) => best[k]?.levelValue
                  if (get('vinegar_ml') != null) params.set('vinegar_ml', String(get('vinegar_ml')))
                  if (get('bicarb_g') != null) params.set('bicarb_g', String(get('bicarb_g')))
                  if (get('time_s') != null) params.set('time_s', String(get('time_s')))
                  navigate(`/gas?${params.toString()}`)
                } else {
                  const params = new URLSearchParams()
                  const get = (k: string) => best[k]?.levelValue
                  if (get('electrolyte_conc_M') != null) params.set('electrolyte_conc_M', String(get('electrolyte_conc_M')))
                  if (get('electrode_area_cm2') != null) params.set('electrode_area_cm2', String(get('electrode_area_cm2')))
                  if (get('solution_level_mm') != null) params.set('solution_level_mm', String(get('solution_level_mm')))
                  navigate(`/daniell?${params.toString()}`)
                }
              }}
              style={btnPrimary}
            >
              ➡️ En iyi kombinasyonu forma aktar
            </button>
          </div>
        </div>
      </div>

      <div style={{
        background: '#ffffff', borderRadius: 12, padding: 20, marginBottom: 16,
        border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginTop: 0 }}>6) Pareto Grafiği (Standartlaştırılmış Etkiler - yaklaşık)</h3>
        <div style={{ height: 320 }}>
          <Pareto effects={activeFactors.map(f => ({
            name: f.label || f.name,
            value: (() => {
              const vals = effects[f.name] || []
              const maxv = Math.max(...vals.filter(v => !isNaN(v)))
              const minv = Math.min(...vals.filter(v => !isNaN(v)))
              const rng = (isFinite(maxv) && isFinite(minv)) ? (maxv - minv) : 0
              // standardize by sd of run S/Ns
              const validSn = runSnrs.filter(v => !isNaN(v))
              const mu = validSn.reduce((a,b)=>a+b,0) / (validSn.length || 1)
              const sd = Math.sqrt(validSn.reduce((s,v)=>s+(v-mu)*(v-mu),0) / Math.max(1, validSn.length-1)) || 1
              return rng / sd
            })()
          }))} />
        </div>
        <div style={{ color: '#6b7280', fontSize: 12, marginTop: 8 }}>
          Not: Bu grafik, Minitab\'daki t-istatistiklerine yaklaşık bir karşılıktır. Tam ANOVA yerine S/N aralığını standart sapmaya bölerek hesaplanır.
        </div>
      </div>

      <div style={{
        background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px dashed #cbd5e1'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Sonraki Adımlar</div>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#374151' }}>
          <li>Verileri normal şekilde Gas/Daniell formlarından kaydedin.</li>
          <li>Analiz kısmında regresyonu inceleyin.</li>
          <li>DOE sonuçlarını doğrulama koşusuyla teyit edin ve isterseniz raporlayın.</li>
        </ul>
      </div>
    </div>
  )
}

const th: React.CSSProperties = {
  textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb', background: '#f3f4f6', fontSize: 13
}

const td: React.CSSProperties = {
  padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 14, color: '#111827'
}

const btnPrimary: React.CSSProperties = {
  padding: '10px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8,
  fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(59,130,246,0.3)'
}

const btnSecondary: React.CSSProperties = {
  padding: '8px 12px', background: '#e5e7eb', color: '#111827', border: '1px solid #d1d5db', borderRadius: 8,
  fontWeight: 600, cursor: 'pointer'
}

function Pareto({ effects }: { effects: { name: string, value: number }[] }) {
  const labels = effects.map(e => e.name)
  const dataVals = effects.map(e => (isFinite(e.value) ? e.value : 0))
  const crit = 0 // user-defined threshold could be added later
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: 'Standartlaştırılmış Etki',
            data: dataVals,
            backgroundColor: '#60a5fa',
          },
          {
            type: 'line' as const,
            label: 'Kritik Çizgi',
            data: dataVals.map(() => crit),
            borderDash: [6,6],
            borderColor: '#ef4444',
            borderWidth: 2,
            pointRadius: 0,
            hidden: crit === 0,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' as const } },
        scales: { y: { beginAtZero: true } }
      }}
    />
  )
}
