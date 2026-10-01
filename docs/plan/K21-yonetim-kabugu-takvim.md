# K21 — Yönetim kabuğu ve operasyon takvimi

**Kilometre taşı:** M1 — Personel takvimi (K05, K21) · **Şartname:** §7.2, §9.5, §16, §17.2, §17.4 · [Plan dizini](README.md)

> Personel giriş ekranı, izne göre yönetim gezintisi, `OperationsCalendar` ve hold/confirm/cancel ekranları. İlk 'ürün sahibi dener' dilimidir (M1).

K21-01..03 yalnız K03'e bağlıdır; K04/K05 ile **paralel** başlayabilir. Takvim ve komut ekranları K05 API'leri gerekir. Her kart kendi yönetim ekranını bu kabuğa kaydeder: menü öğeleri `apps/web/src/admin/nav/<ozellik>.ts` dosyasıyla kendini kaydeder, merkezi bir menü dosyası düzenlenmez (çakışma önleme).

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K21-01](K21-yonetim-kabugu-takvim.md#K21-01) · UI paketi: nötr yönetim teması ve durum bileşenleri | M | 18 | K03-12 |  |
| [K21-02](K21-yonetim-kabugu-takvim.md#K21-02) · Personel giriş ekranları: parola, TOTP, kurtarma kodu, bootstrap/davet tamamlama | M | 19 | K21-01, K03-05 |  |
| [K21-03](K21-yonetim-kabugu-takvim.md#K21-03) · Yönetim kabuğu: düzen, AdminNavigation, izne göre menü, oturum davranışı | M | 20 | K21-02 |  |
| [K21-04](K21-yonetim-kabugu-takvim.md#K21-04) · OperationsCalendar: ay/hafta/liste görünümleri | L | 26 | K21-03, K05-12 |  |
| [K21-05](K21-yonetim-kabugu-takvim.md#K21-05) · Hold, kesinleştirme, iptal ve uzatma ekranları | L | 27 | K21-04, K05-11 |  |
| [K21-06](K21-yonetim-kabugu-takvim.md#K21-06) · Arayüz üzerinden T-01–T-07 ve erişilebilirlik/mobil kontrol | M | 28 | K21-05, K05-13 |  |
| [K21-07](K21-yonetim-kabugu-takvim.md#K21-07) · M1 kabulü: ürün sahibi staging'de personel girişi, takvim, hold ve kesinleştirme | S | 29 | K21-06, K01-09, K05-14 | ürün sahibi girdisi, kabul |

<a id="K21-01"></a>
## K21-01 · UI paketi: nötr yönetim teması ve durum bileşenleri

**Boyut:** M · **Dalga:** 18 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-12](K03-kimlik-uyelik.md#K03-12)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/ui/`, `docs/ui/`

**Teslim edilecekler**
- `packages/ui`: tasarım tokenı katmanı (K20-03 hazırsa onu, değilse nötr yönetim temasını kullanır; token adları sabit olduğundan sonradan tema değişir, bileşen kodu değişmez)
- Temel bileşenler: `Button`, `FormField` (label/hata ilişkilendirme), `Dialog`, `Table`, `Toast`, `Tabs`; **durum bileşenleri** `LoadingState`, `EmptyState`, `ErrorState`, `ForbiddenState`, `OfflineState` (§16)
- Erişilebilirlik: klavye, görünür focus, ~44 px dokunma hedefi, azaltılmış hareket; axe tabanlı otomatik denetim bileşen testlerinde (tek başına uygunluk iddiası değil)
- Yeni bağımlılıklar `docs/dependencies.md`'ye sürüm/lisans/gerekçe ile işlenir

**Kabul**
- Bileşen testleri ve erişilebilirlik testleri yeşil; sunucu bileşeni olabilenler istemci JS'i gereksiz çekmez
- Bileşenler hiçbir domain/DB paketine bağımlı değildir (`ui` saf sunum)

**Kapsam dışı:** Genel site (K07) bileşenleri ve marka stili bu pakette yoktur.

**Oku:** `AGENTS.md`, §5.2, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-01](K04-outbox-audit-isci.md#K04-01), [K04-02](K04-outbox-audit-isci.md#K04-02), [K04-04](K04-outbox-audit-isci.md#K04-04), [K04-06](K04-outbox-audit-isci.md#K04-06), [K04-07](K04-outbox-audit-isci.md#K04-07), [K04-08](K04-outbox-audit-isci.md#K04-08)

**Bunu bekleyenler:** [K21-02](K21-yonetim-kabugu-takvim.md#K21-02), [K06-15](K06-talep-ziyaret-teklif.md#K06-15)

---

<a id="K21-02"></a>
## K21-02 · Personel giriş ekranları: parola, TOTP, kurtarma kodu, bootstrap/davet tamamlama

**Boyut:** M · **Dalga:** 19 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K21-01](K21-yonetim-kabugu-takvim.md#K21-01), [K03-05](K03-kimlik-uyelik.md#K03-05)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(staff-auth)/`, `apps/web/src/admin/auth-client/`, `tests/e2e/staff-auth/`

**Teslim edilecekler**
- Giriş akışı: parola → TOTP → (gerekirse) kurtarma kodu; MFA aşaması tamamlanmadan yönetim sayfasına yönlendirme yok; ilk kurulum tamamlama (K03-05 bootstrap token'ı) ve personel daveti tamamlama ekranı
- Türkçe, alanla ilişkili hata mesajları; hız limiti (`429`) ve hesap kilitli durumları; `Retry-After` gösterimi
- Sosyal giriş düğmesi **yok**; müşteri giriş alanından ayrı yol/cookie
- Yükleniyor/hata/yetkisiz durumları K21-01 bileşenleriyle

**Kabul**
- Tarayıcı (Playwright) testi: yanlış parola, yanlış TOTP, kurtarma kodu tek kullanımlık; MFA'sız yönetim URL'sine gidince girişe düşer
- T-33 UI tarafı: parola tamam/TOTP eksik oturumla yönetim ekranı açılmaz

**Kapsam dışı:** Hesap kurtarma/MFA sıfırlama personel arayüzü K16'dadır.

**Oku:** `AGENTS.md`, §7.1, §16, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-03](K04-outbox-audit-isci.md#K04-03), [K04-09](K04-outbox-audit-isci.md#K04-09)

**Bunu bekleyenler:** [K21-03](K21-yonetim-kabugu-takvim.md#K21-03)

---

<a id="K21-03"></a>
## K21-03 · Yönetim kabuğu: düzen, AdminNavigation, izne göre menü, oturum davranışı

**Boyut:** M · **Dalga:** 20 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K21-02](K21-yonetim-kabugu-takvim.md#K21-02)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(admin)/layout.tsx`, `apps/web/app/(admin)/page.tsx`, `apps/web/src/admin/shell/`, `apps/web/src/admin/nav/index.ts`, `tests/e2e/admin-shell/`

**Teslim edilecekler**
- `AdminNavigation`: menü öğeleri izin başına **sunucuda** süzülür (istemci gizleme yetki sayılmaz); kendini kaydeden `nav/<ozellik>.ts` deseni ve otomatik toplama (merkezi menü dosyası düzenlenmez)
- Düzen: mobil uyumlu kabuk, kullanıcı menüsü, çıkış; yönetim URL'sinin tahmin edilemez olması güvenlik sayılmaz (sunucu guard'ı her sayfada)
- Oturum zaman aşımı (personel 12 saat tavan/30 dk boşta, K03-04) davranışı: uyarı + yeniden giriş; yüksek riskli işlem için `requireRecentReauth` modalı
- Yetkisiz/404/hata sayfaları; hassas veri içermeyen `robots` ve `noindex` başlıkları, `Cache-Control: no-store`

**Kabul**
- İzni olmayan personelde menü öğesi hiç render edilmez ve doğrudan URL 403/404 verir (testle)
- Yönetim yanıtları paylaşılan cache'e girmez (T-17 ile uyumlu başlık testi)

**Kapsam dışı:** İçerik ekranları sonraki kartlardadır; yalnız kabuk.

**Oku:** `AGENTS.md`, §7.2, §16, §17.2, §17.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-05](K04-outbox-audit-isci.md#K04-05)

**Bunu bekleyenler:** [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-03](K07-kurumsal-site-icerik.md#K07-03), [K08-12](K08-dugunum-pano-onay.md#K08-12), [K08-14](K08-dugunum-pano-onay.md#K08-14), [K09-08](K09-sohbet-canli-akis.md#K09-08), [K10-14](K10-bildirim-eposta-sms.md#K10-14), [K10-15](K10-bildirim-eposta-sms.md#K10-15), [K11-14](K11-medya-temeli.md#K11-14), [K13-12](K13-davetiye-takvim.md#K13-12), [K14-08](K14-belge-odeme.md#K14-08), [K15-09](K15-chatbot.md#K15-09), [K16-01](K16-yonetim-butunlestirme.md#K16-01), [K16-02](K16-yonetim-butunlestirme.md#K16-02), [K16-03](K16-yonetim-butunlestirme.md#K16-03), [K16-04](K16-yonetim-butunlestirme.md#K16-04), [K16-06](K16-yonetim-butunlestirme.md#K16-06), [K16-07](K16-yonetim-butunlestirme.md#K16-07)

---

<a id="K21-04"></a>
## K21-04 · OperationsCalendar: ay/hafta/liste görünümleri

**Boyut:** L · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K21-03](K21-yonetim-kabugu-takvim.md#K21-03), [K05-12](K05-rezervasyon-motoru.md#K05-12)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/calendar/`, `apps/web/app/(admin)/takvim/`, `apps/web/src/admin/nav/takvim.ts`, `tests/e2e/admin-calendar/`

**Teslim edilecekler**
- FullCalendar **Standard** (MIT) ile ay/hafta/liste; ücretli/premium eklenti kullanılmaz (lisans notu `docs/dependencies.md`); veri K05-12 ucundan, görünür aralığa göre cursor/sınır
- Durum renkleri + metin/ikon (yalnız renge bağlı bilgi yok); `held` kalan süre; müşteri alanları yalnız izinli personelde
- Erişilebilir liste alternatifi; klavye ile gezinme; mobil tek sütun görünümü
- Yükleniyor/boş/hata/yetkisiz/bağlantı kesildi durumları

**Kabul**
- Playwright: ay/hafta/liste geçişi, aralık değişimi, boş takvim ve hata durumu
- Müşteri adı yetkisiz personelin DOM'unda/RSC çıktısında bulunmaz

**Kapsam dışı:** Hold/confirm/cancel işlemleri K21-05'tedir.

**Oku:** `AGENTS.md`, §9.4, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K11-08](K11-medya-temeli.md#K11-08), [K11-09](K11-medya-temeli.md#K11-09), [K13-05](K13-davetiye-takvim.md#K13-05), [K14-05](K14-belge-odeme.md#K14-05), [K15-04](K15-chatbot.md#K15-04), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

**Bunu bekleyenler:** [K21-05](K21-yonetim-kabugu-takvim.md#K21-05), [K16-08](K16-yonetim-butunlestirme.md#K16-08)

---

<a id="K21-05"></a>
## K21-05 · Hold, kesinleştirme, iptal ve uzatma ekranları

**Boyut:** L · **Dalga:** 27 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K05-11](K05-rezervasyon-motoru.md#K05-11)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/bookings/`, `apps/web/app/(admin)/rezervasyonlar/`, `apps/web/src/admin/nav/rezervasyonlar.ts`, `tests/e2e/admin-bookings/`

**Teslim edilecekler**
- Takvimden hold açma (alan/seans/tarih, davetli sayısı), tutmayı kesinleştirme, iptal (gerekçe zorunlu), uzatma (gerekçe zorunlu); `Idempotency-Key` istemci tarafında üretilir ve tekrar tıklamada korunur
- `409 SLOT_UNAVAILABLE` ve `VERSION_CONFLICT` için güvenli, Türkçe ve alanla ilişkili iletiler; karşı müşteriye dair bilgi gösterilmez
- Kesinleştirme ekranı K06-09'da kontrol listesiyle zenginleşir (burada `ConfirmationGate` varsayılanı: açık komut + izin)
- SMS/bildirim kutusu yok (K10)

**Kabul**
- Playwright: tutma aç → kesinleştir → iptal; çakışmalı ikinci tutma güvenli hata gösterir; çift tıklama tek tutma üretir
- İzinsiz personelde eylem düğmeleri yok ve API 403 verir

**Kapsam dışı:** Tarih taşıma (reschedule) ekranı müşteri onayıyla birlikte K08/K16'da bütünleşir; burada yalnız servis uçları var.

**Oku:** `AGENTS.md`, §9.2, §9.3, §16, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-13](K05-rezervasyon-motoru.md#K05-13), [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K11-10](K11-medya-temeli.md#K11-10), [K11-11](K11-medya-temeli.md#K11-11), [K13-08](K13-davetiye-takvim.md#K13-08), [K15-06](K15-chatbot.md#K15-06), [K17-03](K17-staging-kabul.md#K17-03)

**Bunu bekleyenler:** [K21-06](K21-yonetim-kabugu-takvim.md#K21-06), [K06-14](K06-talep-ziyaret-teklif.md#K06-14)

---

<a id="K21-06"></a>
## K21-06 · Arayüz üzerinden T-01–T-07 ve erişilebilirlik/mobil kontrol

**Boyut:** M · **Dalga:** 28 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K21-05](K21-yonetim-kabugu-takvim.md#K21-05), [K05-13](K05-rezervasyon-motoru.md#K05-13)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/e2e/admin-concurrency/`, `docs/reports/K21-erisilebilirlik.md`

**Teslim edilecekler**
- İki ayrı tarayıcı bağlamında aynı slota eşzamanlı hold/confirm ve süre dolumu senaryoları (T-01–T-07'nin arayüz sürümü; DB düzeyi K05-13'te)
- Klavye-yalnız akış, mobil görünüm, azaltılmış hareket kontrol listesi; otomatik axe taraması + elle kontrol notları rapora
- `pnpm test:e2e:admin` komutu; CI'da staging dağıtımı öncesi çalışır

**Kabul**
- T-01–T-07 arayüz üzerinden de geçer; ikinci istemci güvenli çakışma görür
- Elle kontrol edilemeyen madde açıkça 'yapılamadı' yazılır
- Bu paketin geçmesi gereken şartname testleri: T-01, T-02, T-03, T-04, T-05, T-06, T-07 (§20.1).

**Kapsam dışı:** DB düzeyi eşzamanlılık testi K05-13'tedir.

**Oku:** `AGENTS.md`, §16, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-14](K05-rezervasyon-motoru.md#K05-14), [K06-09](K06-talep-ziyaret-teklif.md#K06-09), [K11-14](K11-medya-temeli.md#K11-14), [K12-02](K12-galeri-oynatici.md#K12-02), [K13-06](K13-davetiye-takvim.md#K13-06), [K15-07](K15-chatbot.md#K15-07), [K15-09](K15-chatbot.md#K15-09)

**Bunu bekleyenler:** [K21-07](K21-yonetim-kabugu-takvim.md#K21-07)

---

<a id="K21-07"></a>
## K21-07 · M1 kabulü: ürün sahibi staging'de personel girişi, takvim, hold ve kesinleştirme

**Boyut:** S · **Dalga:** 29 · **Tür:** kabul
**Başlamadan önce `main`'de olması gerekenler:** [K21-06](K21-yonetim-kabugu-takvim.md#K21-06), [K01-09](K01-iskelet.md#K01-09), [K05-14](K05-rezervasyon-motoru.md#K05-14)
**Ürün sahibinden gereken:** Staging'e personel hesabı açma ve deneme; geri bildirim.


**Teslim edilecekler**
- Staging'de ürün sahibine kısa deneme senaryosu: personel girişi (TOTP kurulumu dahil) → takvim → test hold'u → kesinleştirme → iptal; geri bildirim `docs/reports/M1-geri-bildirim.md`'ye yazılır
- Geri bildirim sonraki kartların kapsamına yansıtılır; kapsam değişikliği §1 karar kuralına tabidir

**Kabul**
- Ürün sahibinin 'M1 yeterli' onayı veya düzeltme listesi yazılı
- Gerçek müşteri verisi kullanılmadı

**Oku:** `AGENTS.md`, §22.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-10](K06-talep-ziyaret-teklif.md#K06-10), [K12-03](K12-galeri-oynatici.md#K12-03), [K12-04](K12-galeri-oynatici.md#K12-04), [K12-05](K12-galeri-oynatici.md#K12-05), [K13-07](K13-davetiye-takvim.md#K13-07), [K15-08](K15-chatbot.md#K15-08)

---
