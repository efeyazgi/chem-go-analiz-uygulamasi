import { useState, useEffect } from 'react'

interface MonthSelectorProps {
  selectedMonth: string // YYYY-MM format
  onMonthChange: (month: string) => void
  availableMonths: string[] // YYYY-MM formatında mevcut aylar
  monthDataCounts?: Record<string, number> // Her ay için veri sayısı
}

export function MonthSelector({ selectedMonth, onMonthChange, availableMonths, monthDataCounts = {} }: MonthSelectorProps) {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [expanded, setExpanded] = useState(false)

  const months = [
    { key: '01', name: 'Ocak', short: 'Oca' },
    { key: '02', name: 'Şubat', short: 'Şub' },
    { key: '03', name: 'Mart', short: 'Mar' },
    { key: '04', name: 'Nisan', short: 'Nis' },
    { key: '05', name: 'Mayıs', short: 'May' },
    { key: '06', name: 'Haziran', short: 'Haz' },
    { key: '07', name: 'Temmuz', short: 'Tem' },
    { key: '08', name: 'Ağustos', short: 'Ağu' },
    { key: '09', name: 'Eylül', short: 'Eyl' },
    { key: '10', name: 'Ekim', short: 'Eki' },
    { key: '11', name: 'Kasım', short: 'Kas' },
    { key: '12', name: 'Aralık', short: 'Ara' }
  ]

  const getCurrentMonthName = () => {
    if (!selectedMonth || selectedMonth.length !== 7) return 'Ay Seçin'
    const [year, month] = selectedMonth.split('-')
    const monthName = months.find(m => m.key === month)?.name || 'Bilinmiyor'
    return `${monthName} ${year}`
  }

  const getAvailableYears = () => {
    const years = availableMonths.map(m => parseInt(m.split('-')[0]))
    const uniqueYears = Array.from(new Set(years)).sort()
    if (uniqueYears.length === 0) {
      return [new Date().getFullYear()]
    }
    return uniqueYears
  }

  const isMonthAvailable = (year: number, monthKey: string) => {
    const monthTag = `${year}-${monthKey}`
    return availableMonths.includes(monthTag)
  }

  const getMonthDataCount = (year: number, monthKey: string) => {
    const monthTag = `${year}-${monthKey}`
    return monthDataCounts[monthTag] || 0
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Seçili Ay Gösterici */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#ffffff',
          border: '2px solid #d1d5db',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 'bold',
          color: '#1f2937',
          cursor: 'pointer',
          minWidth: 180,
          boxShadow: expanded ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!expanded) {
            e.currentTarget.style.borderColor = '#3b82f6'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.25)'
          }
        }}
        onMouseLeave={(e) => {
          if (!expanded) {
            e.currentTarget.style.borderColor = '#d1d5db'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📅</span>
          <span>{getCurrentMonthName()}</span>
        </div>
        <span style={{ 
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          fontSize: 12
        }}>
          ▼
        </span>
      </button>

      {/* Ay Seçici Panel */}
      {expanded && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Yıl Navigasyonu */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            background: '#f8fafc',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setCurrentYear(prev => Math.max(prev - 1, 2020))}
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ◀ {currentYear - 1}
            </button>
            
            <div style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: '#1f2937'
            }}>
              {currentYear}
            </div>
            
            <button
              onClick={() => setCurrentYear(prev => Math.min(prev + 1, new Date().getFullYear() + 1))}
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              {currentYear + 1} ▶
            </button>
          </div>

          {/* Ay Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            padding: 16
          }}>
            {months.map((month) => {
              const monthTag = `${currentYear}-${month.key}`
              const isAvailable = isMonthAvailable(currentYear, month.key)
              const isSelected = selectedMonth === monthTag
              const dataCount = getMonthDataCount(currentYear, month.key)

              return (
                <button
                  key={month.key}
                  onClick={() => {
                    if (isAvailable) {
                      onMonthChange(monthTag)
                      setExpanded(false)
                    }
                  }}
                  disabled={!isAvailable}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 8,
                    border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    background: isSelected 
                      ? '#eff6ff' 
                      : isAvailable 
                        ? '#ffffff' 
                        : '#f9fafb',
                    color: isSelected 
                      ? '#1e40af' 
                      : isAvailable 
                        ? '#1f2937' 
                        : '#9ca3af',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    fontSize: 13,
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    opacity: isAvailable ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (isAvailable && !isSelected) {
                      e.currentTarget.style.background = '#f0f9ff'
                      e.currentTarget.style.borderColor = '#60a5fa'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isAvailable && !isSelected) {
                      e.currentTarget.style.background = '#ffffff'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                    }
                  }}
                >
                  <div>{month.short}</div>
                  {isAvailable && dataCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      width: 16,
                      height: 16,
                      background: '#10b981',
                      borderRadius: '50%',
                      fontSize: 8,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {dataCount > 9 ? '9+' : dataCount}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Hızlı Seçim */}
          <div style={{
            padding: 12,
            background: '#f8fafc',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                const now = new Date()
                const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
                if (availableMonths.includes(thisMonth)) {
                  onMonthChange(thisMonth)
                  setExpanded(false)
                }
              }}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Bu Ay
            </button>
            
            {availableMonths.length > 0 && (
              <button
                onClick={() => {
                  const latest = availableMonths.sort().reverse()[0]
                  onMonthChange(latest)
                  setExpanded(false)
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: 11,
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                En Son
              </button>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {expanded && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setExpanded(false)}
        />
      )}
    </div>
  )
}