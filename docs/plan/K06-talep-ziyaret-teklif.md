# K06 — Talep, ziyaret ve teklif akışı

**Kilometre taşı:** M2 — Başvurudan davete (K06, K07) · **Şartname:** §7.1, §9.2, §9.5, §10.1, §10.5, §12 · [Plan dizini](README.md)

> Ziyaretçi talebi, ziyaret randevusu, teklif sürümü/kabulü, kesinleştirme kontrol listesi ve müşteri daveti (gönderim K10'da; o zamana dek fake adaptör), ayrıca personel ekranları.

Talep ve teklif takvimi **kapatmaz**; yalnız `held`/`confirmed` booking kapatır. Randevu çakışması K05'in aynı kilit/exclusion mekanizmasını kullanır. Bu kart public form arayüzünü (`BookingRequestForm`) içermez — K07'dedir; burada API.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K06-01](K06-talep-ziyaret-teklif.md#K06-01) · Sözleşmeler ve durum makineleri: talep, randevu, teklif (domain) | M | 23 | K05-01 |  |
| [K06-02](K06-talep-ziyaret-teklif.md#K06-02) · Talep ve randevu şeması; allocation sahibi olarak appointment | M | 24 | K06-01, K05-03 | migration |
| [K06-03](K06-talep-ziyaret-teklif.md#K06-03) · Public talep ve iletişim uçları: spam, hız limiti, kopya eşleme | L | 25 | K06-02, K03-07 |  |
| [K06-04](K06-talep-ziyaret-teklif.md#K06-04) · Talep sahiplenme: doğrulanmış kanal kanıtıyla müşteri hesabına bağlama | M | 26 | K06-03, K03-09 |  |
| [K06-05](K06-talep-ziyaret-teklif.md#K06-05) · Personel talep yönetimi use-case'leri | M | 25 | K06-02 |  |
| [K06-06](K06-talep-ziyaret-teklif.md#K06-06) · Ziyaret randevusu: talep, onay ve kaynak çakışma kontrolü | L | 25 | K06-02, K05-05, K05-04 |  |
| [K06-07](K06-talep-ziyaret-teklif.md#K06-07) · Teklif şeması: offer, sürüm ve satırlar | M | 24 | K06-01 | migration |
| [K06-08](K06-talep-ziyaret-teklif.md#K06-08) · Teklif use-case'leri: hazırlama, gönderme, müşteri kabulü, süre dolumu | L | 27 | K06-07, K06-04, K05-07 |  |
| [K06-09](K06-talep-ziyaret-teklif.md#K06-09) · Kesinleştirme kontrol listesi (ConfirmationGate gerçeklemesi) | M | 28 | K06-08, K05-07 | migration |
| [K06-10](K06-talep-ziyaret-teklif.md#K06-10) · Etkinlik oluşturma ve müşteri daveti: kayıt, token üretimi, yeniden gönderme/iptal | L | 29 | K06-09, K03-09 |  |
| [K06-11](K06-talep-ziyaret-teklif.md#K06-11) · Davet kabulü uçtan uca (fake adaptörle): talepten üyeliğe | M | 30 | K06-10, K06-04 |  |
| [K06-12](K06-talep-ziyaret-teklif.md#K06-12) · Personel ekranı: LeadPipeline ve talep detayı | L | 26 | K06-05, K21-03 |  |
| [K06-13](K06-talep-ziyaret-teklif.md#K06-13) · Personel ekranı: ziyaret randevuları | M | 26 | K06-06, K21-03 |  |
| [K06-14](K06-talep-ziyaret-teklif.md#K06-14) · Personel ekranları: teklif editörü, kesinleştirme kontrol listesi, davet | L | 30 | K06-08, K06-09, K06-10, K21-05 |  |
| [K06-15](K06-talep-ziyaret-teklif.md#K06-15) · Kayıtlı aday sayfaları: taleplerim, teklif ve davet kabulü (işlevsel) | L | 31 | K06-04, K06-08, K06-11, K21-01 |  |
| [K06-16](K06-talep-ziyaret-teklif.md#K06-16) · K06 kabul testleri ve raporu | S | 32 | K06-11, K06-12, K06-13, K06-14, K06-15 | doküman |

<a id="K06-01"></a>
## K06-01 · Sözleşmeler ve durum makineleri: talep, randevu, teklif (domain)

**Boyut:** M · **Dalga:** 23 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-01](K05-rezervasyon-motoru.md#K05-01)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/contracts/src/requests/`, `packages/contracts/src/offers/`, `packages/domain/src/requests/`, `packages/domain/src/offers/`, `packages/domain/src/money/`

**Teslim edilecekler**
- Zod: `CreateReservationRequest`, `CreateContactLead`, `RequestVisit`, teklif komutları ve DTO'ları; endpoint yolları kilitlenir (§18.2 `public/*`, `me/*`)
- Saf durum makineleri (§9.2): talep `new → reviewing → offered → converted | declined | withdrawn`; teklif sürümü `draft → sent → accepted | declined | expired | superseded`; randevu `requested → confirmed → completed | cancelled | no_show`; geçersiz geçiş hata
- Para yardımcıları (`packages/domain/src/money/`): küçük birimde tam sayı + ISO para birimi, KDV hariç/dahil ve yuvarlama kuralı (hariç + KDV = dahil), para birimleri sessizce toplanmaz — K14 aynı yardımcıyı kullanır
- Ortak sözleşme olduğu için K06 tüketici işlerinden önce küçük PR

**Kabul**
- Durum makinesi tablo testleri: her geçerli/geçersiz geçiş
- Para testleri: yuvarlama, farklı para birimi toplama reddi, KDV oranı yapılandırmadan gelir (kodda sabit yok)

**Kapsam dışı:** DB, endpoint ve UI yok.

**Oku:** `AGENTS.md`, §8.1, §9.2, §10.5, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-03](K05-rezervasyon-motoru.md#K05-03), [K07-03](K07-kurumsal-site-icerik.md#K07-03), [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K10-05](K10-bildirim-eposta-sms.md#K10-05), [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04), [K13-02](K13-davetiye-takvim.md#K13-02), [K15-02](K15-chatbot.md#K15-02)

**Bunu bekleyenler:** [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K14-02](K14-belge-odeme.md#K14-02)

---

<a id="K06-02"></a>
## K06-02 · Talep ve randevu şeması; allocation sahibi olarak appointment

**Boyut:** M · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K05-03](K05-rezervasyon-motoru.md#K05-03)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/requests.ts`, `packages/db/migrations/*_request_appointment_schema.sql`, `packages/db/src/schema/booking.ts`, `packages/db/src/rls/requests.ts`, `tests/integration/db/requests/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `lead`, `reservation_request` (iletişim, istenen tarih/alan, davetli sayısı, kaynak, durum, talep referansı, sahiplik alanı: boş/`claimed_by_customer_user_id`), `appointment` (ziyaret saati, süre, atanmış personel, durum, `event_id` boş olabilir)
- `resource_allocation.appointment_id` için FK eklenir (K05-03 bırakmıştı); XOR kuralı değişmez; randevu allocation'ı da exclusion constraint'e girer
- RLS: anonim yazma yalnız kontrollü use-case yolundan (SECURITY DEFINER yardımcı yok; sistem aktörü kapsamlı); personel okuma izne bağlı; müşteri yalnız sahip olduğu talebi
- Veri envanteri satırları (talep/randevu kişisel alanları)

**Kabul**
- Randevu allocation'ı aynı kaynakta kesişen booking/allocation ile çakışamaz (DB düzeyi)
- Başka müşterinin talebi RLS ile görünmez

**Kapsam dışı:** Public uçlar ve use-case'ler sonraki paketlerde.

**Oku:** `AGENTS.md`, §8, §9.5, §17.6 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K11-05](K11-medya-temeli.md#K11-05), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K12-01](K12-galeri-oynatici.md#K12-01), [K13-03](K13-davetiye-takvim.md#K13-03), [K14-02](K14-belge-odeme.md#K14-02), [K15-03](K15-chatbot.md#K15-03), [K15-05](K15-chatbot.md#K15-05)

**Bunu bekleyenler:** [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06)

---

<a id="K06-03"></a>
## K06-03 · Public talep ve iletişim uçları: spam, hız limiti, kopya eşleme

**Boyut:** L · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K03-07](K03-kimlik-uyelik.md#K03-07)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/requests/public/`, `apps/web/app/api/public/requests/`, `apps/web/app/api/public/contact/`, `packages/application/src/bot-check/`, `tests/security/public-requests/`

**Teslim edilecekler**
- `POST /api/public/requests` ve `POST /api/public/contact`: Zod doğrulama, hız limiti profili, `BotCheck` portu (fake + bal küpü alanı + zaman tuzağı; gerçek CAPTCHA sağlayıcısı K17'de karar), talep referansı üretimi (tahmin edilemez kısa kod)
- Başarı yanıtı 'talep alındı' + referans; asla 'rezervasyon tamamlandı' (§10.1); talep **takvimi kapatmaz**
- Kontrollü çift kayıt eşleştirmesi: aynı normalize e-posta/telefon + aynı tarih/alan için kısa pencerede kopya birleştirme önerisi (otomatik silme yok; personel görür)
- Bildirim niyeti outbox'a (`reservation.requested.v1`); gerçek gönderim K10'a kadar fake; personel bildirimi 'yeni talep' uygulama içi kayda hazır
- Gereksiz kişisel veri toplanmaz; aydınlatma metni sürümü `consent_record` ile (K03-08)

**Kabul**
- Hız limiti aşımı 429; bal küpü dolu istekler sessizce reddedilir; sahte `status`/`organizationId` alanları reddedilir (T-28 bağlantısı)
- Talep sonrası availability yanıtı değişmez (takvim kapanmadığı testle)

**Kapsam dışı:** Form arayüzü K07'dedir; e-posta/SMS gerçek gönderimi K10'dadır.

**Oku:** `AGENTS.md`, §10.1, §12, §17.4, §17.6, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-07](K11-medya-temeli.md#K11-07), [K11-13](K11-medya-temeli.md#K11-13), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K07-06](K07-kurumsal-site-icerik.md#K07-06)

---

<a id="K06-04"></a>
## K06-04 · Talep sahiplenme: doğrulanmış kanal kanıtıyla müşteri hesabına bağlama

**Boyut:** M · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K03-09](K03-kimlik-uyelik.md#K03-09)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/requests/claim/`, `apps/web/app/api/me/requests/`, `tests/integration/requests-claim/`

**Teslim edilecekler**
- Talep, sonradan hesaba e-posta eşleşmesiyle **otomatik bağlanmaz**; sahiplik, talebin iletişim kanalına gönderilen kısa ömürlü tek kullanımlık kod/bağlantı (K03-09 `ChannelProofSender` portu; fake adaptör) ve giriş yapmış müşteri hesabıyla yapılır
- `GET /api/me/requests`: yalnız sahiplenilmiş talepler; deneme sayacı ve süre sınırı
- Doğrulanmamış hesap başkasının talebini sahiplenemez; Apple relay/doğrulanmamış e-posta tek başına yetmez

**Kabul**
- Doğrulanmamış hesap talebi sahiplenemez; yanlış/eski kod reddedilir ve deneme sınırı çalışır
- Sahiplenme sonrası başka müşteri aynı talebi göremez (RLS + use-case)

**Kapsam dışı:** Davet kabulü (üyelik) farklıdır; K06-10/11'dedir.

**Oku:** `AGENTS.md`, §7.1, §10.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K11-08](K11-medya-temeli.md#K11-08), [K11-09](K11-medya-temeli.md#K11-09), [K13-05](K13-davetiye-takvim.md#K13-05), [K14-05](K14-belge-odeme.md#K14-05), [K15-04](K15-chatbot.md#K15-04), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

**Bunu bekleyenler:** [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K06-11](K06-talep-ziyaret-teklif.md#K06-11), [K06-15](K06-talep-ziyaret-teklif.md#K06-15)

---

<a id="K06-05"></a>
## K06-05 · Personel talep yönetimi use-case'leri

**Boyut:** M · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-02](K06-talep-ziyaret-teklif.md#K06-02)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/requests/staff/`, `apps/web/app/api/admin/requests/`, `tests/integration/requests-staff/`

**Teslim edilecekler**
- Liste/arama (cursor, sayfa 20/üst sınır 100), detay, `new → reviewing`, reddet/geri çek, `offered`/`converted` geçişleri; durum geçmişi ve audit; iç not (ayrı tablo/use-case yolu — müşteri DTO'suna girmez)
- Yetki: rezervasyon görevlisi talep/takvim/teklif; kesinleştirme ve fiyat istisnası ayrı izin (§7.2)
- Kopya eşleme önerisini birleştir/ayır işlemi (denetimli)

**Kabul**
- Yetkisiz personel ve müşteri oturumu reddedilir; durum makinesi dışı geçiş reddedilir
- Talep durumu değişimi takvimi/allocation'ı değiştirmez

**Kapsam dışı:** Ekran K06-12'dedir.

**Oku:** `AGENTS.md`, §7.2, §9.2, §10.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-07](K11-medya-temeli.md#K11-07), [K11-13](K11-medya-temeli.md#K11-13), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K06-12](K06-talep-ziyaret-teklif.md#K06-12)

---

<a id="K06-06"></a>
## K06-06 · Ziyaret randevusu: talep, onay ve kaynak çakışma kontrolü

**Boyut:** L · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K05-04](K05-rezervasyon-motoru.md#K05-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/appointments/`, `apps/web/app/api/public/appointments/`, `apps/web/app/api/admin/appointments/`, `tests/integration/appointments/`

**Teslim edilecekler**
- `POST /api/public/appointments`: ziyaret **talebi** personel takvimini otomatik kapatmaz; anonim/kayıtlı; hız limiti ve spam
- Personel onayı: gereken personel ve ziyaret alanı `resource.kind` ile ayrılmış kaynaklar olarak ayrılır; K05-05 kilit sırası/karar zamanı/hata eşlemesi yeniden kullanılır; aynı fiziksel kaynak düğün rezervasyonuyla da çakışma kontrolüne girer
- Randevu süresi ve personel vardiyaları ayarlanabilir (gerçek süre uydurulmaz); `requested → confirmed → completed | cancelled | no_show`; audit
- `event_id` boş olabilir; yetki işletme/personel kapsamında

**Kabul**
- Randevu çakışması engellenir (aynı personel/ziyaret alanı; ayrıca düğün rezervasyonunun kullandığı aynı kaynak)
- Talep aşamasında allocation yazılmaz; onayda yazılır ve yarışlarda tek sonuç

**Kapsam dışı:** Ekran K06-13'tedir.

**Oku:** `AGENTS.md`, §9.3, §9.5, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K11-07](K11-medya-temeli.md#K11-07), [K11-13](K11-medya-temeli.md#K11-13), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-06](K07-kurumsal-site-icerik.md#K07-06)

---

<a id="K06-07"></a>
## K06-07 · Teklif şeması: offer, sürüm ve satırlar

**Boyut:** M · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-01](K06-talep-ziyaret-teklif.md#K06-01)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/offers.ts`, `packages/db/migrations/*_offer_schema.sql`, `packages/db/src/rls/offers.ts`, `tests/integration/db/offers/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `offer`, `offer_version` (değişmez sürüm: yazıldıktan sonra güncellenemez; tetikleyici/yetki ile), `offer_line` (hizmet/tutar/dahil olanlar; KDV oranı, KDV hariç/dahil tutar; küçük birim + para birimi)
- Geçerlilik tarihi, koşullar, davetli sayısı; talep ve (varsa) tutma bağlantısı; sürüm durumları §9.2
- RLS: yalnız yetkili personel ve teklif muhatabı müşteri; veri envanteri satırları

**Kabul**
- `sent` olmuş sürümün satır/tutarı güncellenemez (DB düzeyi); kabul edilen sürüm saklanır
- Tutarlar tam sayı; hariç + KDV = dahil check/test

**Kapsam dışı:** Ödeme şeması K14'tedir.

**Oku:** `AGENTS.md`, §8, §9.2, §10.5 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K11-05](K11-medya-temeli.md#K11-05), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K12-01](K12-galeri-oynatici.md#K12-01), [K13-03](K13-davetiye-takvim.md#K13-03), [K14-02](K14-belge-odeme.md#K14-02), [K15-03](K15-chatbot.md#K15-03), [K15-05](K15-chatbot.md#K15-05)

**Bunu bekleyenler:** [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K14-04](K14-belge-odeme.md#K14-04)

---

<a id="K06-08"></a>
## K06-08 · Teklif use-case'leri: hazırlama, gönderme, müşteri kabulü, süre dolumu

**Boyut:** L · **Dalga:** 27 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K05-07](K05-rezervasyon-motoru.md#K05-07)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/offers/`, `apps/web/app/api/admin/offers/`, `apps/web/app/api/me/offers/`, `apps/worker/src/jobs/offer-expiry.ts`, `tests/integration/offers/`

**Teslim edilecekler**
- Personel: taslak oluştur/düzenle, yeni sürüm (eskisi `superseded`), gönder (`sent`; müşteriye bildirim niyeti outbox'a, gerçek gönderim K10); izin `offer.write` (K02-03 sözlüğüne küçük PR)
- Müşteri: yalnız kendisine sunulan (sahiplenilmiş talep) teklifi görür; **kabul** o sürüme bağlanır; eski sürüm kabul edilemez (`409`, T-26 bağlantısı); kabul **`confirmed` booking üretmez** — yalnız kontrol listesi maddesini ilerletir
- Süre dolumu işi: `sent` sürümler geçerlilik tarihinde `expired`; idempotent
- Tutar tutarlılığı K06-01 para yardımcısıyla

**Kabul**
- Müşteri kabulü doğrudan rezervasyonu `confirmed` yapmaz (testle); eski sürümü kabul `409`
- Başka müşterinin teklifi görünmez (T-08 uzantısı)

**Kapsam dışı:** Sözleşme belgesi yükleme/ödeme planı K14'tedir.

**Oku:** `AGENTS.md`, §9.2, §10.5, §17.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-13](K05-rezervasyon-motoru.md#K05-13), [K21-05](K21-yonetim-kabugu-takvim.md#K21-05), [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K11-10](K11-medya-temeli.md#K11-10), [K11-11](K11-medya-temeli.md#K11-11), [K13-08](K13-davetiye-takvim.md#K13-08), [K15-06](K15-chatbot.md#K15-06), [K17-03](K17-staging-kabul.md#K17-03)

**Bunu bekleyenler:** [K06-09](K06-talep-ziyaret-teklif.md#K06-09), [K06-14](K06-talep-ziyaret-teklif.md#K06-14), [K06-15](K06-talep-ziyaret-teklif.md#K06-15)

---

<a id="K06-09"></a>
## K06-09 · Kesinleştirme kontrol listesi (ConfirmationGate gerçeklemesi)

**Boyut:** M · **Dalga:** 28 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K05-07](K05-rezervasyon-motoru.md#K05-07)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/confirmation-checklist.ts`, `packages/db/migrations/*_confirmation_checklist.sql`, `packages/application/src/booking/confirmation-checklist/`, `tests/integration/confirmation-checklist/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- Ayarlanabilir kontrol listesi **veri olarak**: madde türleri (teklif kabul edildi, sözleşme alındı, kapora alındı vb.), her booking için madde durumları; işletmenin belge/kapora şartları kodda sabit değil (§9.2: şartlar belli değil)
- K05-07 `ConfirmationGate` portunun gerçeklemesi: liste tamamlanmadan `confirm` `CHECKLIST_INCOMPLETE`; istisna yalnız özel izin + gerekçe + audit
- Teklif kabulü ilgili maddeyi otomatik ilerletir; sözleşme/kapora maddeleri personel onayıyla (finans doğrulaması K14'te bağlanır)

**Kabul**
- Liste eksikken confirm reddedilir; özel izinli istisna gerekçeyle denetime yazılır
- Madde şablonu değişince mevcut booking'lerin listeleri sessizce değişmez (sürümlü)

**Kapsam dışı:** Ödeme/kapora tahsilat doğrulaması K14'tedir.

**Oku:** `AGENTS.md`, §9.2, §10.5 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-14](K05-rezervasyon-motoru.md#K05-14), [K21-06](K21-yonetim-kabugu-takvim.md#K21-06), [K11-14](K11-medya-temeli.md#K11-14), [K12-02](K12-galeri-oynatici.md#K12-02), [K13-06](K13-davetiye-takvim.md#K13-06), [K15-07](K15-chatbot.md#K15-07), [K15-09](K15-chatbot.md#K15-09)

**Bunu bekleyenler:** [K06-10](K06-talep-ziyaret-teklif.md#K06-10), [K06-14](K06-talep-ziyaret-teklif.md#K06-14)

---

<a id="K06-10"></a>
## K06-10 · Etkinlik oluşturma ve müşteri daveti: kayıt, token üretimi, yeniden gönderme/iptal

**Boyut:** L · **Dalga:** 29 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-09](K06-talep-ziyaret-teklif.md#K06-09), [K03-09](K03-kimlik-uyelik.md#K03-09)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/events/`, `packages/application/src/invitations/create/`, `apps/web/app/api/admin/events/`, `apps/web/app/api/admin/invitations/`, `packages/application/src/ports/invitation-sender.ts`, `tests/integration/invitations-create/`

**Teslim edilecekler**
- `createEventForBooking` (izin `member.invite` veya koordinatör; `event_type` düğün): kesinleştirilmiş booking'e etkinlik bağlar (`booking.event_id`), çift üyeleri için davet üretir
- `createInvitation`: yüksek entropili token, yalnız **hash** DB'de, 48 saat, tek hedef kanal (doğrulanmış e-posta/E.164), rol + açık izin seti; token yalnız gönderim niyetine bir kez aktarılır, loglara/denetime girmez
- `InvitationSender` portu + fake adaptör (dev/test); gerçek e-posta/SMS K10'da bağlanır; yeniden gönderme (eski token geçersiz), iptal, süre dolumu
- Yakın rolü daveti özellik bayrağıyla kapalı; şema desteği K02-04'te

**Kabul**
- Token düz metin hiçbir tabloda/logda/denetimde yok (redaksiyon testi); yeniden gönderme eskiyi geçersiz kılar
- Yalnız `member.invite` izinli personel davet üretir

**Kapsam dışı:** Gerçek gönderim, şablonlar ve teslim defteri K10'dadır.

**Oku:** `AGENTS.md`, §7.1, §7.2, §10.1, §12 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K21-07](K21-yonetim-kabugu-takvim.md#K21-07), [K12-03](K12-galeri-oynatici.md#K12-03), [K12-04](K12-galeri-oynatici.md#K12-04), [K12-05](K12-galeri-oynatici.md#K12-05), [K13-07](K13-davetiye-takvim.md#K13-07), [K15-08](K15-chatbot.md#K15-08)

**Bunu bekleyenler:** [K06-11](K06-talep-ziyaret-teklif.md#K06-11), [K06-14](K06-talep-ziyaret-teklif.md#K06-14), [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-03](K08-dugunum-pano-onay.md#K08-03), [K08-04](K08-dugunum-pano-onay.md#K08-04), [K10-16](K10-bildirim-eposta-sms.md#K10-16)

---

<a id="K06-11"></a>
## K06-11 · Davet kabulü uçtan uca (fake adaptörle): talepten üyeliğe

**Boyut:** M · **Dalga:** 30 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-10](K06-talep-ziyaret-teklif.md#K06-10), [K06-04](K06-talep-ziyaret-teklif.md#K06-04)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/e2e/request-to-member/`, `tests/integration/request-to-member/`

**Teslim edilecekler**
- Uçtan uca senaryo: public talep → personel inceleme → teklif → müşteri kabulü → tutma → kontrol listesi → kesinleştirme → etkinlik + davet → müşteri girişi → kanal kanıtı → üyelik; her adımda fake adaptör çıktıları doğrulanır
- Olumsuz yollar: yanlış kanal, süresi dolmuş/iptal edilmiş davet, başkasına iletilmiş bağlantı (T-13 ile uyumlu)
- `pnpm test:e2e:request-to-member`

**Kabul**
- Davet kabulü fake adaptörle uçtan uca çalışır; kanal kanıtı olmadan üyelik oluşmaz
- Senaryo boyunca takvim yalnız hold/confirm ile kapanır (talep/teklif adımlarında kapanmaz)
- Bu paketin geçmesi gereken şartname testleri: T-13 (§20.1).

**Kapsam dışı:** Gerçek e-posta/SMS ve kullanıcı arayüzü cilası kapsam dışı.

**Oku:** `AGENTS.md`, §7.1, §10.1, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-14](K06-talep-ziyaret-teklif.md#K06-14), [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-03](K08-dugunum-pano-onay.md#K08-03), [K08-04](K08-dugunum-pano-onay.md#K08-04), [K12-06](K12-galeri-oynatici.md#K12-06), [K13-09](K13-davetiye-takvim.md#K13-09), [K13-13](K13-davetiye-takvim.md#K13-13), [K15-10](K15-chatbot.md#K15-10)

**Bunu bekleyenler:** [K06-15](K06-talep-ziyaret-teklif.md#K06-15), [K06-16](K06-talep-ziyaret-teklif.md#K06-16)

---

<a id="K06-12"></a>
## K06-12 · Personel ekranı: LeadPipeline ve talep detayı

**Boyut:** L · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K21-03](K21-yonetim-kabugu-takvim.md#K21-03)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/leads/`, `apps/web/app/(admin)/talepler/`, `apps/web/src/admin/nav/talepler.ts`, `tests/e2e/admin-leads/`

**Teslim edilecekler**
- `LeadPipeline` (durum sütunları + liste alternatifi), talep detayı, durum değiştirme, kopya eşleme önerisi, iç not (müşteriyle paylaşım yok); izne göre eylemler
- Yükleniyor/boş/hata/yetkisiz durumları; mobil ve klavye

**Kabul**
- Playwright: talep inceleme → teklif hazırlamaya geçiş; izinsiz personelde eylemler yok
- Müşteri iletişim bilgisi izinsiz personelin DOM'unda bulunmaz

**Kapsam dışı:** Teklif editörü K06-14'tedir.

**Oku:** `AGENTS.md`, §16, §7.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K11-08](K11-medya-temeli.md#K11-08), [K11-09](K11-medya-temeli.md#K11-09), [K13-05](K13-davetiye-takvim.md#K13-05), [K14-05](K14-belge-odeme.md#K14-05), [K15-04](K15-chatbot.md#K15-04), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

**Bunu bekleyenler:** [K06-16](K06-talep-ziyaret-teklif.md#K06-16), [K16-08](K16-yonetim-butunlestirme.md#K16-08)

---

<a id="K06-13"></a>
## K06-13 · Personel ekranı: ziyaret randevuları

**Boyut:** M · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K21-03](K21-yonetim-kabugu-takvim.md#K21-03)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/appointments/`, `apps/web/app/(admin)/randevular/`, `apps/web/src/admin/nav/randevular.ts`, `tests/e2e/admin-appointments/`

**Teslim edilecekler**
- Randevu listesi/takvim görünümü, onayla (personel + ziyaret alanı seçimi), iptal, `no_show`/tamamlandı; çakışma hatası güvenli ve Türkçe
- Randevu vardiyaları/süreleri için ayarlanabilir alanlar (gerçek değer uydurulmaz)

**Kabul**
- Playwright: çakışan randevu onayı güvenli hata gösterir
- İzinsiz personelde eylemler yok

**Kapsam dışı:** Genel ziyaret formu K07'dedir.

**Oku:** `AGENTS.md`, §9.5, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K11-08](K11-medya-temeli.md#K11-08), [K11-09](K11-medya-temeli.md#K11-09), [K13-05](K13-davetiye-takvim.md#K13-05), [K14-05](K14-belge-odeme.md#K14-05), [K15-04](K15-chatbot.md#K15-04), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

**Bunu bekleyenler:** [K06-16](K06-talep-ziyaret-teklif.md#K06-16)

---

<a id="K06-14"></a>
## K06-14 · Personel ekranları: teklif editörü, kesinleştirme kontrol listesi, davet

**Boyut:** L · **Dalga:** 30 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K06-09](K06-talep-ziyaret-teklif.md#K06-09), [K06-10](K06-talep-ziyaret-teklif.md#K06-10), [K21-05](K21-yonetim-kabugu-takvim.md#K21-05)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/offers/`, `apps/web/app/(admin)/teklifler/`, `apps/web/src/admin/nav/teklifler.ts`, `apps/web/src/admin/invitations/`, `tests/e2e/admin-offers/`

**Teslim edilecekler**
- Teklif editörü: sürüm listesi, satırlar, KDV hariç/dahil gösterimi, gönder; sürüm farkı; kesinleştirme kontrol listesi kartı (K21-05 kesinleştirme diyaloğuna bağlanır); davet oluştur/yeniden gönder/iptal; etkinlik oluştur
- `sent` sürüm düzenlenemez; yeni sürüm aç akışı; eski ekranla güncelleme `409` mesajı

**Kabul**
- Playwright: talep → teklif → gönder → müşteri kabulü sonrası liste ilerler → kesinleştirme → davet
- Kontrol listesi eksikken kesinleştirme düğmesi reddedilir ve neden gösterilir

**Kapsam dışı:** Ödeme planı ve belgeler K14'tedir.

**Oku:** `AGENTS.md`, §10.5, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-11](K06-talep-ziyaret-teklif.md#K06-11), [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-03](K08-dugunum-pano-onay.md#K08-03), [K08-04](K08-dugunum-pano-onay.md#K08-04), [K12-06](K12-galeri-oynatici.md#K12-06), [K13-09](K13-davetiye-takvim.md#K13-09), [K13-13](K13-davetiye-takvim.md#K13-13), [K15-10](K15-chatbot.md#K15-10)

**Bunu bekleyenler:** [K06-16](K06-talep-ziyaret-teklif.md#K06-16)

---

<a id="K06-15"></a>
## K06-15 · Kayıtlı aday sayfaları: taleplerim, teklif ve davet kabulü (işlevsel)

**Boyut:** L · **Dalga:** 31 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K06-11](K06-talep-ziyaret-teklif.md#K06-11), [K21-01](K21-yonetim-kabugu-takvim.md#K21-01)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(customer)/hesabim/`, `apps/web/src/customer/`, `tests/e2e/customer-candidate/`

**Teslim edilecekler**
- Müşteri girişi sonrası: talebi sahiplenme (kod girişi), taleplerim, teklif görüntüle/kabul, davet kabul sayfası (kanal kanıtı kodu girişi dahil); işlevsel nötr bileşenler (K20 tokenları hazırsa kullanılır, değilse sonradan tema değişir)
- Hata/yükleniyor/boş/yetkisiz durumları; erişilebilirlik; müşteri sayfaları `no-store`
- 'Düğünüm' ekranı K08'dedir; davet kabulünden sonra yönlendirme yalnız yer tutucu

**Kabul**
- Playwright: aday sahiplenir, teklifi kabul eder, daveti kabul eder (fake adaptör); yanlış kod reddedilir
- Müşteri başkasının teklif/talebini göremez

**Kapsam dışı:** Genel site ve form K07'dedir; marka cilası K20 çıktısıyla sonra.

**Oku:** `AGENTS.md`, §10.1, §10.5, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K08-05](K08-dugunum-pano-onay.md#K08-05), [K08-06](K08-dugunum-pano-onay.md#K08-06), [K08-07](K08-dugunum-pano-onay.md#K08-07), [K08-08](K08-dugunum-pano-onay.md#K08-08), [K08-09](K08-dugunum-pano-onay.md#K08-09), [K08-14](K08-dugunum-pano-onay.md#K08-14), [K09-02](K09-sohbet-canli-akis.md#K09-02)

**Bunu bekleyenler:** [K06-16](K06-talep-ziyaret-teklif.md#K06-16), [K08-10](K08-dugunum-pano-onay.md#K08-10), [K08-11](K08-dugunum-pano-onay.md#K08-11), [K09-07](K09-sohbet-canli-akis.md#K09-07), [K10-14](K10-bildirim-eposta-sms.md#K10-14), [K13-11](K13-davetiye-takvim.md#K13-11), [K14-07](K14-belge-odeme.md#K14-07)

---

<a id="K06-16"></a>
## K06-16 · K06 kabul testleri ve raporu

**Boyut:** S · **Dalga:** 32 · **Tür:** doküman
**Başlamadan önce `main`'de olması gerekenler:** [K06-11](K06-talep-ziyaret-teklif.md#K06-11), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K06-14](K06-talep-ziyaret-teklif.md#K06-14), [K06-15](K06-talep-ziyaret-teklif.md#K06-15)

**Dokunabileceğin yollar (yalnız bunlar):** `docs/reports/K06-kabul.md`

**Teslim edilecekler**
- Kabul ölçütleri kanıt tablosu: talep/teklif takvimi kapatmaz; randevu çakışması engellenir; doğrulanmamış hesap talebi sahiplenemez; davet kabulü fake adaptörle uçtan uca
- Bilinen sınırlar ve K10'a bırakılanlar (gerçek gönderim) açık yazılır

**Kabul**
- Dört kabul ölçütü için test bağlantıları raporda; çalıştırılamayan varsa nedeni yazılı

**Kapsam dışı:** Kod değişikliği yok.

**Oku:** `AGENTS.md`, §20.2, §22.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K08-10](K08-dugunum-pano-onay.md#K08-10), [K08-11](K08-dugunum-pano-onay.md#K08-11), [K08-12](K08-dugunum-pano-onay.md#K08-12), [K09-03](K09-sohbet-canli-akis.md#K09-03), [K09-04](K09-sohbet-canli-akis.md#K09-04), [K13-11](K13-davetiye-takvim.md#K13-11), [K14-06](K14-belge-odeme.md#K14-06)

**Bunu bekleyenler:** [K07-10](K07-kurumsal-site-icerik.md#K07-10), [K17-02](K17-staging-kabul.md#K17-02)

---
