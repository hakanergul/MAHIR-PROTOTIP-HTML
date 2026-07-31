# MAHIR-PROTOTIP-HTML

MAHİR, "Maarif Anlayışıyla Hizmet İşleme ve Raporlama Ajanı" fikrine dayanan, Türkçe çalışan ve öğretmen kontrollü bir eğitim evrakı prototipidir.

İlk geliştirme hedefi, "Sınav Analizi ve Değerlendirme Raporu" için sade, modern ve tek sayfalık bir HTML/CSS/JavaScript prototipi hazırlamaktır.

## Word Şablonunu Okuma

`MAHIR_Veri_Giris_Sablonu_Surum_1.docx` dosyası doldurulup Veri Ekleme ekranından
yüklendiğinde sınav, soru ve öğrenci tabloları yerel Python servisi tarafından
okunur. Sonuçlar analizden önce düzenlenebilir Veri Onay tablolarında gösterilir.

## Güncel Çalışan Akış

Uygulama altı ekranlı bir akış izler: Karşılama → Hazırlık → Veri → Veri Onay → Analiz → Rapor.

- **Hazırlık**: Öğretmen öğretim kademesi, okul türü, sınıf düzeyi ve ders bilgilerini seçer.
- **Veri**: Öğretmen standart MAHİR Veri Giriş Şablonu'nu indirebilir; doldurduğu Word, PDF veya görüntü belgesini yükleyebilir. Dosya türü ve boyutu denetlendikten sonra `.docx` şablonları gerçek tablo yapısından okunur (sınav bilgisi, soru–öğrenme çıktısı eşleştirmeleri, öğrenci puanları).
- **Veri Onay**: Okunan veriler düzenlenebilir tablolarda gösterilir; öğretmen hücreleri düzeltip veriyi onaylar.
- **Analiz**: Onaylanan veriler ölçme, program eşleştirme ve pedagojik analiz motorlarından geçirilir.
- **Rapor**: Öğretmen onaylı bir rapor taslağı üretilir; öğretmen son onayı verdikten sonra yazdırma/PDF çıktısı alınabilir.

Proje dosyaları ekran/bileşen bazlı modüllere ayrılmıştır: JavaScript `js/`, CSS `styles/`, dosya alıcı ve analiz motoru `backend/app/` altındadır (bkz. [DEVELOPMENT_CHARTER.md](DEVELOPMENT_CHARTER.md) §4).

Yerel prototipi dosya alıcısıyla çalıştırmak için:

```bash
python3 backend/run_file_receiver.py
```

Ardından `http://127.0.0.1:8000/index.html` adresi açılır.

## Geliştirme Kuralları

Bu projede geliştirme adım adım, küçük ve onaylı sürümler halinde yapılır. Her sprintte yalnızca belirlenen kapsam uygulanır. Dosya yükleme, `.docx` şablon okuma ve yazdırma tabanlı PDF çıktısı artık uygulanmış durumdadır; gerçek yapay zekâ/OCR entegrasyonu, veritabanı ve harici API entegrasyonu hâlâ kapsam dışıdır.

Ayrıntılı geliştirme kuralları, sürümleme sistemi, dosya düzeni ve kontrol listeleri için bkz. [DEVELOPMENT_CHARTER.md](DEVELOPMENT_CHARTER.md).

## Sprint 1 - v1.1

MAHİR Kurumsal Giriş Ekranı için yalnızca HTML iskeleti oluşturulmuştur.

Bu sürümde oluşturulan ana bölümler:

- Header
- Hero
- Information Cards
- Primary Button Area
- Values Band
- Footer

Bu sprintte tasarım, renk, responsive yapı, animasyon, logo, ikon, bayrak, hero görseli, framework veya dış kütüphane eklenmemiştir.

## Sprint 1 - v1.2

v1.1'de oluşturulan semantik HTML iskeleti korunarak yalnızca sayfa yerleşimi oluşturulmuştur.

Bu sürümde yapılan layout düzenlemeleri:

- Header, Hero, Information Cards, Primary Button Area, Values Band ve Footer akışı kuruldu.
- Hero alanı iki sütunlu yerleşime alındı; sağ sütun boş bırakıldı.
- Information Cards alanı üç eşit kart düzenine alındı.
- Primary Button Area sayfa ortasında konumlandırıldı.
- Values Band dört sütunlu yatay yapıya alındı.
- Footer sayfanın alt alanında sade biçimde konumlandırıldı.

Bu sprintte renk, gölge, border-radius, gradient, animasyon, responsive yapı, font değişikliği, logo, ikon, bayrak, görsel, framework veya dış kütüphane eklenmemiştir.
## Sprint 1 - v1.3

v1.1 HTML iskeleti ve v1.2 layout düzeni korunarak yalnızca tipografi hiyerarşisi oluşturulmuştur.

Bu sürümde yapılan tipografi düzenlemeleri:

- Sistem fontları tanımlandı.
- Ana başlık, alt başlık ve açıklama metinleri için okunabilir font ölçüleri ve satır yükseklikleri ayarlandı.
- Kart başlıkları ve küçük açıklamalar için sade bir metin hiyerarşisi kuruldu.
- Buton metni daha güçlü görünecek şekilde düzenlendi.

Bu sprintte HTML yapısı, JavaScript, renk sistemi, logo, ikon, bayrak, hero görseli, gölge, gradient, border-radius, animasyon, responsive yapı, framework veya dış kütüphane eklenmemiştir.
## Sprint 1 - v1.4

Kurumsal görsel varlık klasör yapısı hazırlanmıştır. Bu sürümde görseller HTML'ye bağlanmamış, görseller için CSS yazılmamış ve yeni görsel/ikon dosyası üretilmemiştir.

Oluşturulan varlık klasörleri:

- `assets/`
- `assets/logo/`
- `assets/hero/`
- `assets/flag/`
- `assets/icons/`

### MAHİR UI Kit Varlık Adlandırma Standardı

Genel kurallar:

- Dosya adları küçük harfle yazılır.
- Türkçe karakter kullanılmaz.
- Kelimeler tire işaretiyle ayrılır.
- MAHİR'e ait kurumsal varlıklarda `mahir-` öneki kullanılır.
- Varlıklar kullanım alanına göre ilgili alt klasöre yerleştirilir.
- Belirsiz `yeni`, `son`, `final` gibi adlar kullanılmaz.

Önerilen varlık dosya adları:

Logo:

- `assets/logo/mahir-logo.png`

Hero:

- `assets/hero/mahir-hero-teacher.png`

Bayrak:

- `assets/flag/mahir-kurumsal-bayrak.png`

İkonlar:

- `assets/icons/document.png`
- `assets/icons/chart.png`
- `assets/icons/brain.png`
- `assets/icons/clipboard.png`
- `assets/icons/shield-check.png`
- `assets/icons/upload-file.png`
- `assets/icons/sparkles.png`
- `assets/icons/report-file.png`
- `assets/icons/trust.png`
- `assets/icons/target.png`
- `assets/icons/analytics.png`
- `assets/icons/teacher-control.png`

Bu sprintte `index.html`, `styles.css` ve `script.js` dosyaları değiştirilmemiştir.
## Sprint 1 - v1.5

MAHİR UI Kit görsel varlıklarının standart dosya adlarıyla `assets` klasör yapısına yerleştirilmesi hedeflenmiştir.

Bu sprint için beklenen dosya yolları:

Logo:

- `assets/logo/mahir-logo.png`

Hero:

- `assets/hero/mahir-hero-teacher.png`

Bayrak:

- `assets/flag/mahir-kurumsal-bayrak.png`

İkonlar:

- `assets/icons/document.png`
- `assets/icons/chart.png`
- `assets/icons/brain.png`
- `assets/icons/clipboard.png`
- `assets/icons/shield-check.png`
- `assets/icons/upload-file.png`
- `assets/icons/sparkles.png`
- `assets/icons/report-file.png`
- `assets/icons/trust.png`
- `assets/icons/target.png`
- `assets/icons/analytics.png`
- `assets/icons/teacher-control.png`

Kontrol notu: Bu kontrol sırasında varlık dosyaları henüz klasörlere eklenmemiş görünmektedir. Görseller HTML'ye bağlanmamış, CSS yazılmamış, yeni görsel/ikon üretilmemiş ve `index.html`, `styles.css`, `script.js` dosyaları değiştirilmemiştir.
## Sprint 1 / Task 03

Project management documents oluşturuldu.

## Sprint 1 (devamı) - Tasarım ve Yapı Belgeleri

Low-fidelity wireframe, wireframe davranışları, UI Contract, Semantic HTML Foundation, Visual Identity, Layout Foundation, Screen Flow & Navigation ve Navigation Engine tamamlanarak Sprint 1 kapatıldı (bkz. [SPRINT_1_REVIEW.md](SPRINT_1_REVIEW.md)).

## Sprint 2 - Welcome Screen & Trust Engine

Güven ilkeleri ("Trust Engine") kartları eklendi, UI refinement yapıldı, SVG ikon kütüphanesi oluşturuldu; karşılama ekranı birkaç iterasyonla yeniden inşa edilip kilitlendi.

## Sprint 3 - Core Workflow Screens

Karşılama → Hazırlık → Veri → Veri Onay → Analiz → Rapor akışının temel altı ekranlı iskeleti kuruldu.

## Sprint 4-6 - MAHIR AI Engine Core (sonradan kaldırıldı)

Mock bir çoklu-agent orkestrasyon sistemi (Document Agent, Structuring Agent, agent contracts, event bus, mock OCR sağlayıcıları) denendi. Bu sistem hiçbir zaman gerçek veri akışına bağlanmadı; sonraki sprintlerde yerini doğrudan bir Python backend'e bıraktı ve aşağıdaki "Modülerleştirme ve Dev Tooling" çalışmasında `script.js`'den tamamen silindi.

## Backend ve Analiz Motoru

Gerçek veri işleme hattı kuruldu: CSV→CED dönüşümü, program eşleştirme motoru, ölçme motoru, pedagojik analiz motoru, raporlama motoru, `.docx` şablon okuma, öğretmen dosya yükleme akışı (frontend↔backend entegrasyonu), analiz ilerleme görselleştirmesi, öğretmen onaylı veri analizi ve yazdırma tabanlı rapor çıktısı ("PDF export").

## Modülerleştirme ve Dev Tooling - 2026-08-01

- `script.js` (2797 satır) ve `styles.css` (1694 satır) ekran/bileşen bazlı modüllere bölündü (`js/`, `styles/`).
- Hiçbir yerden çağrılmayan "MAHIR AI Engine Core" mock alt sistemi (Sprint 4-6, ~1663 satır) silindi.
- Dev-tooling eklendi: `package.json` (eslint/prettier, build adımı yok), `backend/` için `ruff` + `pytest` iskelesi ve smoke testler.
- `DEVELOPMENT_CHARTER.md` güncel klasör yapısını ve dev-tooling istisnasını yansıtacak şekilde güncellendi.
