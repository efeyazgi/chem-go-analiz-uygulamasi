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

      {/* DOE Paneli Nasıl Kullanılır */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
          🧪 DOE Paneli Nasıl Kullanılır?
        </h2>
        <ol style={{ margin: 0, paddingLeft: 20, color: '#374151', display: 'grid', gap: 10 }}>
          <li>Menüden "DOE" sayfasına gidin ve deney tipini seçin (Gaz/Daniell).</li>
          <li>Faktörleri ve 2/3 seviye değerlerini girin. Gerekirse "Faktör Ekle" ile yeni faktör tanımlayın.</li>
          <li>Plan tablosunu (L9/L8/L18 vb. otomatik seçilir) inceleyin ve CSV indirin. Laboratuvarda koşu sırasını randomize edip her koşuyu 2 tekrar yapın.</li>
          <li>Deney sonrası her koşudaki Y repliklerini (örn. mesafe) panelde girin ve S/N modunu seçin (genelde "Büyüdükçe-İyi").</li>
          <li>Ana etki tablosundan en iyi seviye kombinasyonunu görüntüleyin. İsterseniz "En iyi kombinasyonu forma aktar" butonuyla ilgili forma otomatik doldurma yapın.</li>
          <li>Pareto grafiğiyle faktörlerin göreli etkilerini görselleştirin. Ardından doğrulama koşusunu önerilen kombinasyonla 2–3 tekrar yapın.</li>
        </ol>
        <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>İpuçları</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Gaz: Stoik oran φ = n_asetik/n_bikarbonat ≈ 1 civarı verimli. Aşırı dengesizlik verimi düşürebilir.</li>
            <li>Daniell: Standard yük direnci ile test edin; power_W = V×I doğrulaması yapın.</li>
            <li>Randomizasyon ve tekrar, S/N hesaplarının güvenilirliği için önemlidir.</li>
          </ul>
        </div>
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

      {/* Tepkime Denklemi */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>⚗️ Gaz İtişi Tepkimesi</h2>
        <div style={{
          background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, fontFamily: 'monospace', fontSize: 14
        }}>
          CH3COOH  +  NaHCO3  →  CO2  +  H2O  +  CH3COONa
        </div>
        <div style={{ color: '#6b7280', fontSize: 14, marginTop: 8 }}>
          Asetik asit ile sodyumbikarbonat 1:1 mol oranında tepkimeye girer. Üretilen CO₂ miktarı, sınırlayıcı reaktife göre belirlenir.
        </div>
      </div>

      {/* Daniell Pili Tepkimesi */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>⚡ Daniell Pili Tepkimeleri</h2>
        <div style={{
          background: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: 8, padding: 16, marginBottom: 12
        }}>
          <div style={{ fontWeight: 'bold', color: '#0c4a6e', marginBottom: 8 }}>Anot (Çinko Elektrodu):</div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#0369a1', marginBottom: 8 }}>
            Zn(s) → Zn²⁺(aq) + 2e⁻
          </div>
          <div style={{ fontWeight: 'bold', color: '#0c4a6e', marginBottom: 8 }}>Katot (Bakır Elektrodu):</div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#0369a1', marginBottom: 8 }}>
            Cu²⁺(aq) + 2e⁻ → Cu(s)
          </div>
          <div style={{ fontWeight: 'bold', color: '#0c4a6e', marginBottom: 8 }}>Toplam Hücre Tepkimesi:</div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#0369a1' }}>
            Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)
          </div>
        </div>
        <div style={{ color: '#6b7280', fontSize: 14 }}>
          Daniell pili, çinko ve bakır elektrotları arasındaki redoks tepkimesiyle elektrik üretir. Standart koşullarda yaklaşık 1.1V gerilim sağlar. Elektrolit derişimi ve elektrot yüzey alanı pilin performansını doğrudan etkiler.
        </div>
      </div>

      {/* Teknik Detaylar */}
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
              title: 'Asetik Asit Konsantrasyonu',
              desc: 'Asetik asidin varsayılanı %5’tir. Farklı bir değer kullanıyorsanız formda güncelleyin.'
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
            },
            {
              icon: '⚡',
              title: 'Elektriksel Güç (W)',
              desc: 'Güç = Gerilim × Akım (P = V × I) formülüyle hesaplanır. Pilin anlık performansını gösterir ve watt (W) cinsinden ölçülür.'
            },
            {
              icon: '🔋',
              title: 'Elektriksel Enerji (Wh)',
              desc: 'Enerji = Güç × Zaman (E = P × t) ile hesaplanır. Pilin toplam depoladığı enerjiyi watt-saat (Wh) cinsinden ifade eder. 1 Wh = 3600 J’dir.'
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
