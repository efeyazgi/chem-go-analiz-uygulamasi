# 🧪 Chem GO Analiz Uygulaması

Modern ve kullanıcı dostu kimya deneyleri analiz platformu. React, TypeScript, Firebase ve Vite ile geliştirilmiş tam kapsamlı bir web uygulaması.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Proje Yapısı](#-proje-yapısı)
- [Deployment](#-deployment)
- [Katkıda Bulunma](#-katkıda-bulunma)

## 🚀 Özellikler

### 🔐 Kullanıcı Yönetimi
- **Firebase Authentication** ile güvenli giriş sistemi
- **3 seviye kullanıcı rolü**:
  - 👑 **Admin**: Tüm yetkilere sahip, kullanıcı rollerini yönetebilir
  - 👤 **Kullanıcı**: Veri ekleyebilir ve düzenleyebilir
  - 👁️ **Görüntüleyici**: Sadece verileri görüntüleyebilir
- Rol bazlı sayfa erişim kontrolü

### 🧪 Deney Türleri
1. **💨 Gaz Deneyleri**
   - Asetik Asit miktarı (mL)
   - Asetik asit yüzdesi (%)
   - Karbonat miktarı (g)
   - Sıcaklık (°C)
   - Süre (saniye)
   - CO₂ hacmi (mL)

2. **⚡ Daniell Pili Deneyleri**
   - Elektrolit derişimi (M)
   - Elektrot alanı (cm²)
   - Çözelti seviyesi (mm)
   - Boşta gerilim (V)
   - Akım (A)
   - Güç (W)
   - Enerji (Wh)

### 📊 Analiz Özellikleri
- **Dinamik grafikler** (Chart.js entegrasyonu)
- **Regresyon analizi** (En küçük kareler yöntemi)
- **Cross-validation** ile model doğrulama
- **R-squared, RMSE** gibi istatistiksel metrikler
- **Tahmin modelleri** ile gelecek sonuçları öngörme
- **Admin-only analiz sayfası** (Güvenlik kontrollü)

### 📁 Veri Yönetimi
- **Excel/CSV dosya içe aktarma** (XLSX, Papa Parse)
- **PDF rapor oluşturma** (jsPDF)
- **Gelişmiş filtreleme ve sıralama**
- **Toplu veri silme** (sadece admin)
- **Veri düzenleme** (modal tabanlı)

### 📱 Modern Arayüz
- **Responsive tasarım** (mobil uyumlu)
- **Modern navbar** (sticky, backdrop blur)
- **Gradient arka planlar**
- **Hover efektleri** ve animasyonlar
- **Toast bildirimleri**
- **Loading spinner'ları**
- **Gelişmiş form validasyonu** (Zod ile tip güvenli)
- **Opsiyonel alan desteği** (Araç kütlesi, mesafe vb.)

## 🛠 Teknolojiler

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Tip güvenli geliştirme
- **React Router Dom** - SPA routing
- **React Hook Form** - Form yönetimi
- **Zod** - Veri validasyonu
- **Chart.js & React Chart.js 2** - Grafik görselleştirme

### Backend & Database
- **Firebase Authentication** - Kullanıcı doğrulama
- **Firestore** - NoSQL veritabanı
- **Firebase Hosting** - Static hosting

### Build Tools & Dev
- **Vite** - Hızlı build tool
- **ESLint** - Kod kalitesi
- **TypeScript Compiler** - Tip kontrolü

### Utility Libraries
- **Papa Parse** - CSV parsing
- **XLSX** - Excel dosya işleme
- **jsPDF** - PDF oluşturma
- **jsPDF AutoTable** - PDF tabloları

## 📦 Kurulum

### Ön Gereksinimler
- Node.js (v18+)
- npm veya yarn
- Firebase projesi

### Adımlar

1. **Projeyi klonlayın**
   ```bash
   git clone https://github.com/username/chem-go-analiz-uygulamasi.git
   cd chem-go-analiz-uygulamasi
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Firebase konfigürasyonu**
   
   `.env.local` dosyası oluşturun:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```

5. **Build oluşturun**
   ```bash
   npm run build
   ```

## 🎯 Kullanım

### İlk Kurulum
1. Uygulamaya giriş yapın (Admin email: `efeyazgi@yahoo.com`)
2. Firebase'de kullanıcılar otomatik olarak kayıt edilir
3. Admin panelinden kullanıcı rollerini yönetin

### Veri Girişi
1. **Navbar**'dan deney türünü seçin (Gaz/Daniell)
2. **Form**'u doldurun (zorunlu alanlar *)
3. **Kaydet** butonuna tıklayın
4. **Dashboard**'da sonuçları görün

### Veri Analizi (Admin Only)
1. **Admin yetkisiyle giriş yapın**
2. **Analiz** sayfasına gidin
3. **Deney türünü** seçin
4. **Grafikleri** ve istatistikleri inceleyin
5. **PDF raporu** indirin

### Veri Yönetimi
1. **Geçmiş** sayfasında tüm kayıtları görün
2. **Filtrele** ve **sırala**
3. **Düzenle** butonuyla kayıtları güncelleyin
4. **Admin** olarak kayıtları silin

## 📁 Proje Yapısı

```
src/
├── components/           # Reusable components
│   ├── ModernNavBar.tsx # Ana navigasyon
│   └── MonthSelector.tsx # Ay seçici
├── lib/                 # Core libraries
│   ├── auth.tsx        # Authentication logic
│   └── firebase.ts     # Firebase config
├── pages/              # Page components
│   ├── Dashboard.tsx   # Ana sayfa
│   ├── Login.tsx       # Giriş sayfası
│   ├── GasForm.tsx     # Gaz deneyi formu
│   ├── DaniellForm.tsx # Daniell pili formu
│   ├── Analysis.tsx    # Analiz sayfası
│   ├── Prediction.tsx  # Tahmin sayfası
│   ├── ModernHistory.tsx # Geçmiş kayıtlar
│   ├── ImportData.tsx  # Veri içe aktarma
│   ├── DataManagement.tsx # Veri yönetimi
│   ├── UserManagement.tsx # Kullanıcı yönetimi
│   └── HowTo.tsx      # Yardım sayfası
├── utils/              # Utility functions
│   └── regression.ts   # Regresyon algoritmaları
├── App.tsx            # Ana uygulama
├── main.tsx           # Entry point
└── App.css           # Global styles
```

## 🚀 Deployment

### GitHub Pages

1. **Build oluşturun**
   ```bash
   npm run build
   ```

2. **GitHub Actions ayarlayın**
   
   `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '18'
             
         - name: Install dependencies
           run: npm ci
           
         - name: Build
           run: npm run build
           env:
             VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
             VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
             # ... diğer environment variables
             
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. **Environment secrets ekleyin**
   - Repository Settings > Secrets and variables > Actions
   - Firebase configuration değerlerini ekleyin

### Firebase Hosting

1. **Firebase CLI yükleyin**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase'e login olun**
   ```bash
   firebase login
   ```

3. **Firebase projesini başlatın**
   ```bash
   firebase init hosting
   ```

4. **Deploy edin**
   ```bash
   firebase deploy
   ```

## 👥 Kullanıcı Rolleri

| Rol | Dashboard | Veri Ekleme | Düzenleme | Silme | Kullanıcı Yönetimi |
|-----|-----------|-------------|-----------|-------|-------------------|
| 👑 Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| 👤 Kullanıcı | ✅ | ✅ | ✅ | ❌ | ❌ |
| 👁️ Görüntüleyici | ✅ | ❌ | ❌ | ❌ | ❌ |

## 📢 Son Güncellemeler

### v2.1.0 (Aralık 2024)
- ✅ **Araç kütlesi alanı opsiyonel yapıldı**
- ✅ **Mesafe alanı opsiyonel yapıldı**
- ✅ **Elektriksel ölçümler tam opsiyonel**
- ✅ **"Sirke" terimleri "Asetik Asit" olarak güncellendi**
- ✅ **Daniell pili tepkime açıklamaları eklendi**
- ✅ **Analiz sayfası admin-only yapıldı**
- ✅ **Enerji ve güç kavramları açıklandı**
- ✅ **Form validasyon sistemi iyileştirildi**

## 📈 Özellik Geliştirme Planı

- [ ] **Real-time notifications** (Firebase Cloud Messaging)
- [ ] **Advanced charting** (D3.js entegrasyonu)
- [ ] **Experiment templates** (Önceden tanımlı deney şablonları)
- [ ] **Team collaboration** (Takım çalışması özellikleri)
- [ ] **Mobile app** (React Native)
- [ ] **API endpoints** (REST API)
- [ ] **STP koşulları düzeltmeleri** (Gaz deneyleri için)

## 🤝 Katkıda Bulunma

1. **Fork** edin
2. **Feature branch** oluşturun (`git checkout -b feature/amazing-feature`)
3. **Commit** edin (`git commit -m 'Add amazing feature'`)
4. **Push** edin (`git push origin feature/amazing-feature`)
5. **Pull Request** açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 🙏 Teşekkürler

- **React Team** - Muhteşem framework için
- **Firebase Team** - Backend-as-a-Service için
- **Chart.js Community** - Grafik kütüphanesi için
- **Vite Team** - Hızlı build tool için

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

📧 İletişim: efeyazgi@yahoo.com