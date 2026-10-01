# K18 — İçerik geçişi ve kontrollü yayın

**Kilometre taşı:** M5 — Bütünleştirme, kabul ve yayın (K16–K18) · **Şartname:** §19.5, §19.6, §20.3 · [Plan dizini](README.md)

> Onaylı eski içerik ve URL aktarımı, üretim ortamı, DNS/TLS, provider üretim ayarları, son yedek, rollback ve canlı smoke test.

Bu kart **ürün sahibinin ayrı ve açık yayın onayı** olmadan başlamaz ve hiçbir WP bu onayı varsaymaz. Mevcut `kianabahce.com` yayını kullanıcı açıkça onaylamadan değiştirilmez; kişisel veri içeren eski formlar toplu aktarılmaz. İsimli bakım sahipleri atanmamışsa kart başlamaz. Smoke test gerçek müşteri bilgisi içermez. Ürün sahibinin onay metni olmadan DNS/TLS/üretim yapılandırması değiştirilmez.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K18-01](K18-canliya-gecis.md#K18-01) · Yayın onayı, canlıya geçiş tarihi ve kesinti toleransı kararı | S | 43 | K17-10 | ürün sahibi girdisi, karar |
| [K18-02](K18-canliya-gecis.md#K18-02) · Üretim ortamı, sırlar ve provider üretim ayarları | L | 44 | K18-01, K01-08, K10-02, K11-01, K03-13 | ürün sahibi girdisi |
| [K18-03](K18-canliya-gecis.md#K18-03) · Onaylı içerik ve URL aktarımı (staging'e) ve yönlendirme planı doğrulaması | L | 44 | K18-01, K20-01, K20-02, K07-07, K12-03 | ürün sahibi girdisi |
| [K18-04](K18-canliya-gecis.md#K18-04) · Üretim restore tatbikatı, son yedek ve rollback provası | M | 45 | K18-02, K17-03 |  |
| [K18-05](K18-canliya-gecis.md#K18-05) · Canlıya geçiş öncesi kapı kontrolü ve smoke test planı (üretim, DNS'den önce) | M | 46 | K18-02, K18-03, K18-04, K17-10 | ürün sahibi girdisi, kabul |
| [K18-06](K18-canliya-gecis.md#K18-06) · DNS/TLS geçişi, üretim içerik aktarımı ve canlı smoke test | M | 47 | K18-05 | ürün sahibi girdisi, kabul |
| [K18-07](K18-canliya-gecis.md#K18-07) · Geçiş sonrası izleme ve ilk hafta kapanış raporu | S | 48 | K18-06 | ürün sahibi girdisi, doküman |

<a id="K18-01"></a>
## K18-01 · Yayın onayı, canlıya geçiş tarihi ve kesinti toleransı kararı

**Boyut:** S · **Dalga:** 43 · **Tür:** karar
**Başlamadan önce `main`'de olması gerekenler:** [K17-10](K17-staging-kabul.md#K17-10)
**Ürün sahibinden gereken:** Canlıya geçiş onayı, penceresi ve kesinti toleransı.


**Teslim edilecekler**
- Ürün sahibi için karar sayfası: canlıya geçiş penceresi, kabul edilebilir kesinti süresi, K17 açık maddeleri (§20.3) ve risk kabulleri özeti, rollback tetikleyicileri, ilk gün izleme sorumlusu; `docs/adr/*-canliya-gecis.md`
- **Yazılı ve açık onay** (tarih + kapsam) olmadan sonraki WP'ler başlamaz; onay metni ADR'ye ve K18 tracking issue'suna bağlanır

**Kabul**
- Ürün sahibi yayın onayını, pencereyi ve kesinti toleransını yazılı vermiştir; bakım sahipleri atanmış (K17-10); açık kritik sızıntı yok
- Onay verilmediyse K18 durur (yeniden planlama)

**Oku:** `AGENTS.md`, §19.5, §19.6, §20.3, §23 (+ zorunlu: §1, §4, §20.2)

**Bunu bekleyenler:** [K18-02](K18-canliya-gecis.md#K18-02), [K18-03](K18-canliya-gecis.md#K18-03)

---

<a id="K18-02"></a>
## K18-02 · Üretim ortamı, sırlar ve provider üretim ayarları

**Boyut:** L · **Dalga:** 44 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K18-01](K18-canliya-gecis.md#K18-01), [K01-08](K01-iskelet.md#K01-08), [K10-02](K10-bildirim-eposta-sms.md#K10-02), [K11-01](K11-medya-temeli.md#K11-01), [K03-13](K03-kimlik-uyelik.md#K03-13)
**Ürün sahibinden gereken:** Üretim hesapları (hosting, alan adı, sağlayıcılar) ve sır girişi.

**Dokunabileceğin yollar (yalnız bunlar):** `infra/production/`, `docs/runbook/production-setup.md`, `docs/reports/K18-uretim-ortami.md`

**Teslim edilecekler**
- Üretim ortamının **staging'den ayrı** DB, bucket, sağlayıcı sırları ve callback adresleriyle kurulumu; yönetilen PostgreSQL yedek/PITR açık; web + worker + medya işçisi; ClamAV ve nesne depolama kuralları (anonim liste kapalı); üretim OAuth uygulamaları ve callback'leri; SMS/e-posta gönderen kimlikleri (SPF/DKIM/DMARC ayarları kaydı) ve bütçe tavanları
- Sırlar yalnız sır yönetim kanalında (depoda veya raporda değer yok); `production` environment'ı korumalı onaylı dağıtım; fake adaptörler üretimde **devre dışı** (env guard testi); alan adı/TLS hazırlığı (henüz DNS geçişi yok)
- İlk personel (bootstrap) hesabı ve MFA kurulumu, test alıcısı olmadan üretimde doğrulama; üretim sağlık ve izleme/alarm hedeflerinin bağlanması (hedef işletme kararı)

**Kabul**
- Üretim ortamı sağlık kontrolünden geçer; fake adaptör/sandbox anahtarı üretimde yok; yedek ve PITR açık doğrulanmış
- Hiçbir üretim sırrı repoda/raporda/logda yok; rapor yalnız yapılandırma durumunu yazar

**Kapsam dışı:** DNS yönlendirmesi K18-06'dadır.

**Oku:** `AGENTS.md`, §19.1, §17.4, §19.6 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K18-03](K18-canliya-gecis.md#K18-03)

**Bunu bekleyenler:** [K18-04](K18-canliya-gecis.md#K18-04), [K18-05](K18-canliya-gecis.md#K18-05)

---

<a id="K18-03"></a>
## K18-03 · Onaylı içerik ve URL aktarımı (staging'e) ve yönlendirme planı doğrulaması

**Boyut:** L · **Dalga:** 44 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K18-01](K18-canliya-gecis.md#K18-01), [K20-01](K20-tasarim-icerik.md#K20-01), [K20-02](K20-tasarim-icerik.md#K20-02), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K12-03](K12-galeri-oynatici.md#K12-03)
**Ürün sahibinden gereken:** Aktarılacak içeriğin ve kullanım hakkı olan varlıkların onayı.

**Dokunabileceğin yollar (yalnız bunlar):** `scripts/content-migration/`, `docs/reports/K18-icerik-gecisi.md`, `docs/plan/data/redirects.csv`

**Teslim edilecekler**
- Onaylı kaynak envanteri (K20-01/02) üzerinden fotoğraf/marka varlıkları ve sayfa içeriğinin **staging'e** aktarılması (K11 yükleme yolu, kontrol listesi: erişim hakları, kullanım izni, EXIF temizliği); **kişisel veri içeren eski formlar aktarılmaz**; aktarım betiği idempotent ve kuru çalıştırma (dry-run) modlu
- Eski URL → yeni URL yönlendirme tablosu (K07-07 planından) test edilir: 301 doğruluğu, döngü/zincir yok, kırık URL listesi; sitemap ve canonical kontrolleri
- Ürün sahibi içerik onayı (staging'de gözle kontrol) rapora yazılır

**Kabul**
- Yönlendirme tablosu staging'de otomatik doğrulanır (kırık/zincir/döngü sayısı sıfır veya gerekçeli); aktarılan her varlığın hak durumu kayıtlı
- Kişisel veri içeren kayıt aktarılmadı (tarama kanıtı)

**Kapsam dışı:** Üretim aktarımı K18-06 penceresinde aynı betikle yapılır.

**Oku:** `AGENTS.md`, §19.5, §14.1, §5.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K18-02](K18-canliya-gecis.md#K18-02)

**Bunu bekleyenler:** [K18-05](K18-canliya-gecis.md#K18-05)

---

<a id="K18-04"></a>
## K18-04 · Üretim restore tatbikatı, son yedek ve rollback provası

**Boyut:** M · **Dalga:** 45 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K18-02](K18-canliya-gecis.md#K18-02), [K17-03](K17-staging-kabul.md#K17-03)

**Dokunabileceğin yollar (yalnız bunlar):** `docs/runbook/rollback.md`, `docs/reports/K18-rollback-provasi.md`, `scripts/restore-drill/production/`

**Teslim edilecekler**
- Üretim DB'si için yedek alma + **izole restore** provası (üretim verisi henüz sahte/boş), uygulama sürümü geri alma ve DNS geri dönüş adımı yazılı ve zamanlanmış; rollback tetikleyicileri ve karar sahibi (K18-01 ADR'siyle uyumlu)
- Geçiş öncesi 'son yedek' alma betiği ve doğrulama; geri dönüşün geçiş penceresi içinde yapılabildiği ölçülür

**Kabul**
- Rollback provası çalıştırıldı ve süre ölçüldü; geri dönüş adımları insan olmadan belirsizlik bırakmaz
- Prova üretim müşteri verisi içermeden yapıldı

**Kapsam dışı:** Gerçek geçiş ve DNS değişikliği K18-06'dadır.

**Oku:** `AGENTS.md`, §19.4, §19.5, §20.3 (+ zorunlu: §1, §4, §20.2)

**Bunu bekleyenler:** [K18-05](K18-canliya-gecis.md#K18-05)

---

<a id="K18-05"></a>
## K18-05 · Canlıya geçiş öncesi kapı kontrolü ve smoke test planı (üretim, DNS'den önce)

**Boyut:** M · **Dalga:** 46 · **Tür:** kabul
**Başlamadan önce `main`'de olması gerekenler:** [K18-02](K18-canliya-gecis.md#K18-02), [K18-03](K18-canliya-gecis.md#K18-03), [K18-04](K18-canliya-gecis.md#K18-04), [K17-10](K17-staging-kabul.md#K17-10)
**Ürün sahibinden gereken:** Geçişe son 'git/gitme' onayı (K18-01 penceresi içinde).

**Dokunabileceğin yollar (yalnız bunlar):** `tests/smoke/production/`, `docs/reports/K18-on-kontrol.md`

**Teslim edilecekler**
- Üretim URL'sine (geçici adres / hosts yönlendirmesi) karşı **veri bırakmayan** smoke test seti: ana sayfa, uygunluk, talep formu (test işareti ve temizleme yolu), giriş (test personeli), health, güvenlik başlıkları, sitemap/robots, yönlendirmeler; fake adaptör yokluğu doğrulaması
- §20.3 kapısının son kontrolü: açık bloklayıcı yok, risk kabulleri yazılı, bakım sahipleri atanmış, KVKK açık maddeleri ürün sahibince kabul edilmiş; sonuç `K18-on-kontrol.md`
- Smoke testin ürettiği her kayıt sahte işaretlidir ve sonrasında kaldırılır; **gerçek müşteri bilgisi yok**

**Kabul**
- Smoke test üretim ortamında yeşil; kapı kontrolü maddeleri durumlu ve ürün sahibi 'geçiş yapılabilir' demiştir
- Smoke kayıtları temizlendi; üretimde sahte veri kalmadı

**Kapsam dışı:** DNS değişikliği yok.

**Oku:** `AGENTS.md`, §20.3, §19.5 (+ zorunlu: §1, §4, §20.2)

**Bunu bekleyenler:** [K18-06](K18-canliya-gecis.md#K18-06)

---

<a id="K18-06"></a>
## K18-06 · DNS/TLS geçişi, üretim içerik aktarımı ve canlı smoke test

**Boyut:** M · **Dalga:** 47 · **Tür:** kabul
**Başlamadan önce `main`'de olması gerekenler:** [K18-05](K18-canliya-gecis.md#K18-05)
**Ürün sahibinden gereken:** DNS/TLS değişikliği ve canlı geçişin yürütülmesi/onayı.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/reports/K18-gecis-gunlugu.md`, `docs/runbook/cutover.md`

**Teslim edilecekler**
- Ürün sahibinin yazılı onayladığı pencerede: son yedek → üretime içerik aktarımı (K18-03 betiği) → DNS/TLS değişikliği → canlı smoke test; geçiş günlüğü (zaman damgalı adımlar, sapmalar, geri dönüş gerekirse tetik kararı); **ürün sahibi dışında kimse DNS'i değiştirmez**
- İlk gerçek talep/mesajın izlenmesi: ilk saatler için alarm/sağlık gözlemi, hata oranı, e-posta/SMS test teslimi; sorun varsa rollback (K18-04) uygulanır

**Kabul**
- Geçiş penceresi içinde canlı smoke test yeşil veya rollback uygulanıp doğrulandı; günlük eksiksiz
- Canlıya geçişte gerçek müşteri verisi hiçbir rapor/depoya sızmadı

**Kapsam dışı:** Geçiş sonrası bakım rutinleri işletme sorumluluğundadır (runbook).

**Oku:** `AGENTS.md`, §19.5, §19.6, §20.3 (+ zorunlu: §1, §4, §20.2)

**Bunu bekleyenler:** [K18-07](K18-canliya-gecis.md#K18-07)

---

<a id="K18-07"></a>
## K18-07 · Geçiş sonrası izleme ve ilk hafta kapanış raporu

**Boyut:** S · **Dalga:** 48 · **Tür:** doküman
**Başlamadan önce `main`'de olması gerekenler:** [K18-06](K18-canliya-gecis.md#K18-06)
**Ürün sahibinden gereken:** Geçiş sonrası gözlem ve kapanış onayı.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/reports/K18-ilk-hafta.md`

**Teslim edilecekler**
- İlk hafta: hata oranı, outbox gecikmesi, SMS/LLM/depolama bütçe kullanımı, `unknown` SMS sayısı, medya karantina birikimi, ClamAV imza yaşı, ilk gerçek talep akışı; aksaklıklar ve düzeltme issue'ları; bakım rutininin başladığı teyidi (haftalık triage, aylık restore, üç aylık erişim gözden geçirme)
- Rapor yalnız ölçülmüş değerleri yazar; gerçek müşteri bilgisi içermez

**Kabul**
- İlk hafta raporu yazıldı; açık aksaklıklar issue'lara bağlandı; ürün sahibi 'yayın kapandı' demiştir

**Oku:** `AGENTS.md`, §19.3, §19.6 (+ zorunlu: §1, §4, §20.2)

---
