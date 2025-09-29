export default function HowTo() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        padding: 32,
        marginBottom: 32,
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ margin: '0 0 16px 0', fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          ❓ Kullanım Kılavuzu
        </h1>
        <p style={{ margin: 0, fontSize: 'clamp(14px, 3vw, 18px)', opacity: 0.9 }}>
          Chem GO Analiz Uygulaması'nı etkili bir şekilde kullanmak için kapsamlı rehber
        </p>
      </div>

      {/* Temel Kullanım */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
          🚀 Temel Kullanım Adımları
        </h2>
        <div style={{ display: 'grid', gap: 16 }}>
          {[
            {
              step: '1',
              title: 'Hesap Oluşturma ve Giriş',
              desc: 'E-posta ve şifre ile giriş yapın. Yeni kullanıcılar otomatik olarak "Kullanıcı" rolü alır. Admin yetkisi için yöneticiye başvurun.',
              icon: '🔐'
            },
            {
              step: '2',
              title: 'Deney Verilerini Girin',
              desc: 'Gaz Deneyi veya Daniell Pili sayfalarından verilerinizi tek tek girin. Her ölçüm için ayrı kayıt oluşturun.',
              icon: '🧪'
            },
            {
              step: '3',
              title: 'Toplu Veri Yükleme',
              desc: 'İçe Aktar sayfasından şablonları indirip Excel/CSV ile toplu veri yükleyebilirsiniz.',
              icon: '📁'
            },
            {
              step: '4',
              title: 'Veri Analizi Yapın',
              desc: 'Analiz sayfasında X ve Y değişkenlerini seçerek basit dogrusal regresyon analizi yapın.',
              icon: '📊'
            },
            {
              step: '5',
              title: 'Veri Yönetimi',
              desc: 'Geçmiş sayfasından tüm kayıtlarınızı görüntüleyin, düzenleyin (tüm parametreler). Admin kullanıcılar kayıt silebilir.',
              icon: '📋'
            },
            {
              step: '6',
              title: 'Sonuçları Takip Edin',
              desc: 'Dashboard\'da haftalık istatistikleri takip edin. Analiz sayfasında regresyon analizleri yapın ve PDF rapor indirin.',
              icon: '📊'
            }
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              padding: 16,
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                minWidth: 40,
                height: 40,
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 16
              }}>
                {item.step}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </div>
                <div style={{ color: '#6b7280', fontSize: 14 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kullanıcı Rolleri */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
          👥 Kullanıcı Rolleri ve Yetkileri
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {
            [
              {
                role: '👑 Admin',
                color: '#fef3c7',
                border: '#f59e0b',
                textColor: '#92400e',
                permissions: [
                  'Tüm sayfalara erişim',
                  'Veri ekleme ve düzenleme',
                  'Veri silme yetkisi',
                  'Kullanıcı rollerini yönetme',
                  'Toplu veri silme'
                ]
              },
              {
                role: '👤 Kullanıcı',
                color: '#d1fae5',
                border: '#10b981',
                textColor: '#065f46',
                permissions: [
                  'Veri ekleme ve düzenleme',
                  'Tüm rapor ve analizler',
                  'Kendi verilerini yönetme',
                  'PDF rapor indirme',
                  'Dashboard görüntüleme'
                ]
              },
              {
                role: '👁️ Görüntüleyici',
                color: '#e0e7ff',
                border: '#6366f1',
                textColor: '#3730a3',
                permissions: [
                  'Sadece veri görüntüleme',
                  'Raporları inceleme',
                  'Grafik ve analizleri görme',
                  'Dashboard erişimi',
                  'Veri değiştirme yok'
                ]
              }
            ].map((roleInfo, i) => (
              <div key={i} style={{
                padding: 20,
                background: roleInfo.color,
                borderRadius: 12,
                border: `2px solid ${roleInfo.border}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  color: roleInfo.textColor, 
                  marginBottom: 12,
                  textAlign: 'center'
                }}>
                  {roleInfo.role}
                </div>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: 20, 
                  color: roleInfo.textColor 
                }}>
                  {roleInfo.permissions.map((perm, j) => (
                    <li key={j} style={{ marginBottom: 6, fontSize: 14 }}>{perm}</li>
                  ))}
                </ul>
              </div>
            ))
          }
        </div>
      </div>

      {/* İpuçları */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
          💡 İpuçları ve Önemli Notlar
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {[
            {
              icon: '🌶️',
              title: 'Sirke Konsantrasyonu',
              desc: 'Sirke için asetik asit varsayılanı %5’tir. Farklı bir değer kullanıyorsanız formda güncelleyin.'
            },
            {
              icon: '🌡️',
              title: 'Gaz Deneyi Koşulları',
              desc: 'Gaz deneyinde oda sıcaklığı ve 1 atm basınç varsayılmıştır. STP düzeltmeleri sonraki sürümlerde eklenecek.'
            },
            {
              icon: '⚡',
              title: 'Daniell Pili Gerilimi',
              desc: 'Tek Daniell hücresi yaklaşık 1.1V üretir. Motor sürmek için 3–6V hedeflemek üzere hücreleri seri bağlayın.'
            },
            {
              icon: '🎯',
              title: 'Mesafe Tahmini',
              desc: 'Analiz sayfasında hedef değişkeni "mesafe (m)" seçerseniz model doğrudan araç performansını tahmin etmeye çalışır.'
            },
            {
              icon: '📅',
              title: 'Hafta Etiketleri',
              desc: 'weekTag formatı: YYYY-WW (örn: 2024-03). Bu format sayesinde haftalık performans takibi yapabilirsiniz.'
            },
            {
              icon: '📄',
              title: 'Veri Kalitesi',
              desc: 'Her ölçümü ayrı bir satır olarak kaydedin. Tekrarları aynı satırda toplamayın, böylece istatistik analizi daha sağlıklı olur.'
            },
            {
              icon: '✏️',
              title: 'Veri Düzenleme',
              desc: 'Geçmiş sayfasından tüm parametreleri düzenleyebilirsiniz. Modal pencerede deney türüne göre ilgili alanlar gösterilir.'
            },
            {
              icon: '👥',
              title: 'Kullanıcı Yönetimi',
              desc: 'Admin kullanıcılar navbar\'dan "Kullanıcılar" sayfasına giderek diğer kullanıcıların rollerini yönetebilir.'
            }
          ].map((tip, i) => (
            <div key={i} style={{
              padding: 16,
              background: '#fef3c7',
              borderRadius: 8,
              border: '1px solid #fbbf24'
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{tip.icon}</div>
              <div style={{ fontWeight: 'bold', color: '#92400e', marginBottom: 8 }}>{tip.title}</div>
              <div style={{ color: '#92400e', fontSize: 14 }}>{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Teknik Detaylar */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚙️ Teknik Bilgiler
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 8, border: '1px solid #0ea5e9' }}>
            <div style={{ fontWeight: 'bold', color: '#0c4a6e', marginBottom: 8 }}>Veri Saklama</div>
            <div style={{ fontSize: 14, color: '#0369a1' }}>Tüm veriler Firebase Firestore’da güvenle saklanır ve kullanıcı bazında izole edilir.</div>
          </div>
          <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 8, border: '1px solid #0ea5e9' }}>
            <div style={{ fontWeight: 'bold', color: '#0c4a6e', marginBottom: 8 }}>Analiz Yöntemi</div>
            <div style={{ fontSize: 14, color: '#0369a1' }}>Basit doğrusal regresyon (OLS) kullanılarak X-Y ilişkisi analiz edilir.</div>
          </div>
          <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 8, border: '1px solid #0ea5e9' }}>
            <div style={{ fontWeight: 'bold', color: '#0c4a6e', marginBottom: 8 }}>Veri Formatları</div>
            <div style={{ fontSize: 14, color: '#0369a1' }}>Excel (.xlsx) ve CSV (.csv) formatlarında toplu veri içe aktarma desteklenir.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
