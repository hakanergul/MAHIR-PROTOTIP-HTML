# MAHİR Roadmap

Bu belge, MAHİR projesinin geliştirme yönünü ve sprint bazlı ilerleme başlıklarını izlemek için hazırlanmıştır.

## Proje Odağı

MAHİR, öğretmen kontrollü bir eğitim evrakı prototipi olarak geliştirilmektedir. Kurumsal Giriş Ekranı tamamlanmış, "Sınav Analizi ve Değerlendirme Raporu" akışı (Hazırlık → Veri → Veri Onay → Analiz → Rapor) uçtan uca çalışır durumdadır: öğretmen `.docx` şablonunu doldurup yükler, veriler öğretmen onayına sunulur, ölçme/program eşleştirme/pedagojik analiz motorlarından geçirilir ve yazdırma tabanlı bir rapor çıktısı üretilir.

## Tamamlanan Sprintler

- **Sprint 1 - Kurumsal Giriş Ekranı**: Semantik HTML iskeleti, sayfa layout düzeni, tipografi hiyerarşisi, assets klasör yapısı, design system belgesi, wireframe, UI Contract, visual identity, screen flow & navigation motoru (bkz. [SPRINT_1_REVIEW.md](SPRINT_1_REVIEW.md)).
- **Sprint 2 - Welcome Screen & Trust Engine**: Güven ilkeleri kartları, UI refinement, SVG ikon kütüphanesi, karşılama ekranının nihai sürümü.
- **Sprint 3 - Core Workflow Screens**: Altı ekranlı akışın (Karşılama/Hazırlık/Veri/Veri Onay/Analiz/Rapor) temel iskeleti.
- **Sprint 4-6 - MAHIR AI Engine Core (denendi, sonradan kaldırıldı)**: Mock çoklu-agent orkestrasyon sistemi denendi; gerçek akışa hiç bağlanmadı ve modülerleştirme çalışmasında kaldırıldı.
- **Backend ve Analiz Motoru**: CSV→CED dönüşümü, program eşleştirme motoru, ölçme motoru, pedagojik analiz motoru, raporlama motoru, `.docx` şablon okuma, dosya yükleme akışı, analiz görselleştirme, öğretmen onaylı veri analizi, yazdırma tabanlı rapor çıktısı.
- **Modülerleştirme ve Dev Tooling**: `script.js`/`styles.css` monolitleri `js/`/`styles/` altında modüllere bölündü, ölü AI Engine kodu silindi, `package.json` (eslint/prettier) ve backend için `ruff`+`pytest` iskelesi eklendi.

## Değerlendirilen Fikirler (henüz kapsam değil)

- **Öğrenci bazlı veri girişinin CSV/Excel odaklı hale getirilmesi**: Şu anda öğretmen `.docx` tablosuna öğrenci başına satır, soru başına hücre olacak şekilde elle veri giriyor; büyük sınıflarda bu yavaş ve hataya açık. CSV/Excel yapıştırma tabanlı bir alternatif tartışıldı ancak henüz bir sprint olarak planlanmadı; mevcut CSV şeması yalnızca soru metadata'sı için var, öğrenci puan matrisi için yeni bir şema gerekir.

## Yaklaşan Çalışmalar

Sonraki sprint, kullanıcı onayıyla ve [DEVELOPMENT_CHARTER.md](DEVELOPMENT_CHARTER.md) kurallarına göre belirlenecektir.

## Çalışma İlkesi

- Her görev küçük kapsamlı ilerler.
- Kapsam dışı özellik eklenmez.
- Kullanıcı onayı olmadan sonraki göreve geçilmez.
- Kod ve belge değişiklikleri ayrı ayrı raporlanır.
