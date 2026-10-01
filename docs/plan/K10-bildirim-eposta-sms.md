# K10 — Bildirim, e-posta ve SMS

**Kilometre taşı:** M3 — Müşteri deneyimi (K08–K10) · **Şartname:** §12, §17.4, §18.3, §19.3 · [Plan dizini](README.md)

> Kanal tercihleri, güvenli şablonlar, yönetici seçimiyle ek SMS (önizleme dahil), delivery ledger, sağlayıcı adaptörleri/webhook'ları, bütçe/istismar korumaları ve davet/OTP gönderiminin gerçek kanala bağlanması.

Dış sağlayıcı transaction içinde çağrılmaz (NOT-01). Sağlayıcıya kabul edilmeden 'SMS ulaştı' denmez. Timeout `unknown` olur, kör retry yok. Staging'den gerçek müşteriye ileti gitmez. **Sağlayıcı seçimi ve hesapları ürün sahibi kararıdır (K10-01/02)**; hesaplar gelmeden kod fake adaptörle ilerler ve engel açıkça raporlanır.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K10-01](K10-bildirim-eposta-sms.md#K10-01) · Karar: SMS ve e-posta sağlayıcı seçimi | S | 0 | — | ürün sahibi girdisi, karar |
| [K10-02](K10-bildirim-eposta-sms.md#K10-02) · Sağlayıcı hesapları, test alıcıları ve staging yapılandırması | M | 2 | K10-01, K01-08 | ürün sahibi girdisi, hesap |
| [K10-03](K10-bildirim-eposta-sms.md#K10-03) · Sözleşmeler ve ADR: delivery durum makinesi, şablon, tekilleştirme anahtarı | M | 22 | K04-10, K01-05 |  |
| [K10-04](K10-bildirim-eposta-sms.md#K10-04) · Bildirim şeması: tercih, bildirim, delivery, bastırma, webhook alındısı | M | 23 | K10-03 | migration |
| [K10-05](K10-bildirim-eposta-sms.md#K10-05) · Güvenli şablon sistemi, SMS segment/ücret tahmini | M | 23 | K10-03 |  |
| [K10-06](K10-bildirim-eposta-sms.md#K10-06) · Bildirim tüketicisi: alıcı belirleme, tercih/sessiz saat değerlendirme | L | 33 | K10-04, K09-04 |  |
| [K10-07](K10-bildirim-eposta-sms.md#K10-07) · Delivery ledger ve gönderim işçisi: yeniden değerlendirme, unknown, uzlaştırma | L | 34 | K10-04, K10-05, K10-06 |  |
| [K10-08](K10-bildirim-eposta-sms.md#K10-08) · Ortam koruması: staging'de gerçek alıcıya gönderimi engelleme | S | 35 | K10-07 |  |
| [K10-09](K10-bildirim-eposta-sms.md#K10-09) · Webhook alımı: imza, tekilleştirme, sıra, bastırma | L | 35 | K10-07 |  |
| [K10-10](K10-bildirim-eposta-sms.md#K10-10) · SMS sağlayıcı adaptörü (gerçek) ve sandbox doğrulaması | L | 36 | K10-02, K10-07, K10-09 |  |
| [K10-11](K10-bildirim-eposta-sms.md#K10-11) · E-posta sağlayıcı adaptörü (gerçek) ve sandbox doğrulaması | L | 36 | K10-02, K10-07, K10-09 |  |
| [K10-12](K10-bildirim-eposta-sms.md#K10-12) · SMS bütçesi, hız limiti, tekrar engeli ve alarm olayları | M | 35 | K10-07 | migration |
| [K10-13](K10-bildirim-eposta-sms.md#K10-13) · Yönetici gönderim API'si: preview/publish ve 'Ayrıca SMS gönder' | L | 35 | K10-05, K10-07, K08-07, K08-09 |  |
| [K10-14](K10-bildirim-eposta-sms.md#K10-14) · Bildirim merkezi ve tercih ekranları (müşteri ve personel) | L | 34 | K10-06, K06-15, K21-03 |  |
| [K10-15](K10-bildirim-eposta-sms.md#K10-15) · Yönetim ekranları: AudienceSelector, UpdateComposer, SmsPreview, DeliveryHistory | L | 36 | K10-13, K10-12, K08-13, K09-08, K21-03 |  |
| [K10-16](K10-bildirim-eposta-sms.md#K10-16) · Davet, OTP ve kanal kanıtı gönderimini gerçek kanallara bağlama | M | 37 | K10-10, K10-11, K06-10, K03-10 |  |
| [K10-17](K10-bildirim-eposta-sms.md#K10-17) · K10 kabul testleri ve raporu | M | 38 | K10-08, K10-12, K10-13, K10-14, K10-15, K10-16 | doküman |
| [K10-18](K10-bildirim-eposta-sms.md#K10-18) · M3 kabulü: ürün sahibi Düğünüm, onay, sohbet ve bildirimleri test alıcılarıyla dener | S | 39 | K10-17, K09-09, K08-15 | ürün sahibi girdisi, kabul |

<a id="K10-01"></a>
## K10-01 · Karar: SMS ve e-posta sağlayıcı seçimi

**Boyut:** S · **Dalga:** 0 · **Tür:** karar
**Başlamadan önce `main`'de olması gerekenler:** yok
**Ürün sahibinden gereken:** SMS ve e-posta sağlayıcı seçimi (maliyet, veri işleme, başlık kaydı).


**Teslim edilecekler**
- Aday sağlayıcılar için karşılaştırma: test hesabı, veri işleme şartları/konum, alfanümerik başlık (gönderici kimliği) kaydı, limitler, Unicode/Türkçe ücretlendirme, idempotency/status query/teslim raporu/imzalı webhook desteği, bounce/şikayet olayları, maliyet
- Karar kaydı `docs/adr/*-bildirim-saglayicilari.md` (ürün sahibi onayıyla); seçilmeyen alternatifler ve gerekçe

**Kabul**
- Ürün sahibi iki sağlayıcıyı (SMS, e-posta) yazılı seçmiştir; capability tablosu doldurulmuştur
- Üretim hesabı **açılmaz**; yalnız test/sandbox

**Oku:** `AGENTS.md`, §12.4, §19.6, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-01](K00-depo-kurallari.md#K00-01), [K00-06](K00-depo-kurallari.md#K00-06), [K00-07](K00-depo-kurallari.md#K00-07), [K13-01](K13-davetiye-takvim.md#K13-01), [K14-01](K14-belge-odeme.md#K14-01), [K15-01](K15-chatbot.md#K15-01), [K17-01](K17-staging-kabul.md#K17-01)

**Bunu bekleyenler:** [K10-02](K10-bildirim-eposta-sms.md#K10-02)

---

<a id="K10-02"></a>
## K10-02 · Sağlayıcı hesapları, test alıcıları ve staging yapılandırması

**Boyut:** M · **Dalga:** 2 · **Tür:** hesap
**Başlamadan önce `main`'de olması gerekenler:** [K10-01](K10-bildirim-eposta-sms.md#K10-01), [K01-08](K01-iskelet.md#K01-08)
**Ürün sahibinden gereken:** Sağlayıcı hesapları, alan adı DNS kayıtları ve test alıcıları.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/reports/K10-saglayici-hesaplari.md`

**Teslim edilecekler**
- Seçilen sağlayıcılar için test/sandbox hesapları, gönderici alan adı/başlık kayıtları (SPF/DKIM/DMARC vb.), imzalı webhook adresleri; gizli değerler yalnız korumalı environment'a girilir
- Kayıtlı test alıcıları (ürün sahibinin kendi e-posta/telefonu) allowlist olarak yazılır (K10-08 okur); rapor sır içermez

**Kabul**
- Test e-postası ve test SMS'i staging allowlist alıcılarına ulaşır (kanıt notu); eksik olanlar açıkça yazılı
- Gerçek müşteri numarası/adresi hiçbir yerde kullanılmadı

**Oku:** `AGENTS.md`, §12.4, §19.1, §20.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-05](K00-depo-kurallari.md#K00-05), [K01-01](K01-iskelet.md#K01-01), [K20-01](K20-tasarim-icerik.md#K20-01), [K20-02](K20-tasarim-icerik.md#K20-02), [K20-06](K20-tasarim-icerik.md#K20-06), [K03-13](K03-kimlik-uyelik.md#K03-13), [K11-01](K11-medya-temeli.md#K11-01)

**Bunu bekleyenler:** [K10-10](K10-bildirim-eposta-sms.md#K10-10), [K10-11](K10-bildirim-eposta-sms.md#K10-11), [K17-08](K17-staging-kabul.md#K17-08), [K18-02](K18-canliya-gecis.md#K18-02)

---

<a id="K10-03"></a>
## K10-03 · Sözleşmeler ve ADR: delivery durum makinesi, şablon, tekilleştirme anahtarı

**Boyut:** M · **Dalga:** 22 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K04-10](K04-outbox-audit-isci.md#K04-10), [K01-05](K01-iskelet.md#K01-05)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/contracts/src/notifications/`, `packages/domain/src/notifications/`, `packages/application/src/ports/providers.ts`

**Teslim edilecekler**
- `delivery` durumları ve geçiş kuralları (`queued → sending → accepted → delivered`; `deferred`, `suppressed`, `failed`, `unknown`, `expired`), **geriye gitmeyen** (monoton) durum kuralı; tekilleştirme anahtarı `domainEventId + recipientId + channel + templateVersion`
- `SmsProvider` (`send`, `lookup`, `verifyWebhook`) ve `EmailProvider` (`send`, `verifyWebhook`) portları + açık **capability** bildirimi (idempotency, status query, teslim raporu); K01-05 fake portlarıyla uyumlu genişleme
- Bildirim kategorileri × kanal tablosu (§12.1) veri olarak; kampanya/tanıtım yok
- Ortak sözleşme: K10 tüketici işlerinden önce küçük PR

**Kabul**
- Durum makinesi testleri: `delivered` geç gelen `accepted` ile geriye düşmez
- Capability tablosu fake adaptörde ve test çiftlerinde doldurulmuş
- Bu paketin geçmesi gereken şartname testleri: T-20 (§20.1).

**Kapsam dışı:** DB ve işçi yok.

**Oku:** `AGENTS.md`, §12.1, §12.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-01](K05-rezervasyon-motoru.md#K05-01), [K07-02](K07-kurumsal-site-icerik.md#K07-02), [K08-01](K08-dugunum-pano-onay.md#K08-01), [K09-01](K09-sohbet-canli-akis.md#K09-01), [K11-02](K11-medya-temeli.md#K11-02), [K16-05](K16-yonetim-butunlestirme.md#K16-05)

**Bunu bekleyenler:** [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K10-05](K10-bildirim-eposta-sms.md#K10-05)

---

<a id="K10-04"></a>
## K10-04 · Bildirim şeması: tercih, bildirim, delivery, bastırma, webhook alındısı

**Boyut:** M · **Dalga:** 23 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-03](K10-bildirim-eposta-sms.md#K10-03)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/notifications.ts`, `packages/db/migrations/*_notifications_schema.sql`, `packages/db/src/rls/notifications.ts`, `tests/integration/db/notifications/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `notification_preference` (olay kategorisi × kanal; işletme varsayılanı ve kullanıcı tercihi ayrı), `notification` (uygulama içi kayıt), `delivery` (kanal/alıcı başına durum + zaman + neden), `contact_suppression` (bounce/şikayet/iptal kaynaklı), `webhook_receipt` (sağlayıcı+mesaj kimliği tekilleştirme)
- Benzersizlik kısıtı `domainEventId + recipientId + channel + templateVersion`; indeks sağlayıcı+mesaj kimliği; kullanıcı+bildirim durumu
- RLS: kullanıcı yalnız kendi bildirim/tercihi; personel kapsamı; veri envanteri satırları (telefon/e-posta bastırma kaydı)

**Kabul**
- Aynı anahtarla ikinci `notification`/`delivery` eklenemez
- Başka kullanıcının bildirim kaydı RLS ile görünmez

**Kapsam dışı:** İş mantığı sonraki paketlerde.

**Oku:** `AGENTS.md`, §8, §12.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-03](K05-rezervasyon-motoru.md#K05-03), [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K07-03](K07-kurumsal-site-icerik.md#K07-03), [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K10-05](K10-bildirim-eposta-sms.md#K10-05), [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04), [K13-02](K13-davetiye-takvim.md#K13-02), [K15-02](K15-chatbot.md#K15-02)

**Bunu bekleyenler:** [K10-06](K10-bildirim-eposta-sms.md#K10-06), [K10-07](K10-bildirim-eposta-sms.md#K10-07)

---

<a id="K10-05"></a>
## K10-05 · Güvenli şablon sistemi, SMS segment/ücret tahmini

**Boyut:** M · **Dalga:** 23 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-03](K10-bildirim-eposta-sms.md#K10-03)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/notification-templates/`, `packages/application/src/sms-segments/`, `tests/unit/notification-templates/`

**Teslim edilecekler**
- Sürümlü şablonlar (uygulama içi, e-posta, SMS); varsayılan güvenli SMS metni 'Kiana Bahçe hesabınızda onayınızı bekleyen bir güncelleme var.'; özel açıklama/ödeme tutarı/belge adı/mesaj metni varsayılan önizlemeye **alınmaz**; bağlantı giriş gerektiren kendi alanına gider, giriş atlatan token içermez
- Davet e-postası/SMS şablonları (token yalnız davet bağlantısında); e-posta HTML kaçışlama; kullanıcı içeriği şablona kaçışlı girer
- SMS segment hesabı: GSM-7/UCS-2 (Türkçe karakter) parça sayısı sağlayıcı kurallarına göre; kullanıcı metni sessizce harfsizleştirilmez; ücret önizlemesi 'kesin fatura vaadi değildir'

**Kabul**
- T-22 segment kısmı: Unicode/Türkçe metin için doğru parça tahmini (tablo testleri)
- T-34 e-posta şablonu kısmı: HTML/script içeren kullanıcı içeriği şablonda çalışmaz
- Bu paketin geçmesi gereken şartname testleri: T-22, T-34 (§20.1).

**Kapsam dışı:** Gönderim ve sağlayıcı yok.

**Oku:** `AGENTS.md`, §12.2, §12.3, §17.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-03](K05-rezervasyon-motoru.md#K05-03), [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K07-03](K07-kurumsal-site-icerik.md#K07-03), [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04), [K13-02](K13-davetiye-takvim.md#K13-02), [K15-02](K15-chatbot.md#K15-02)

**Bunu bekleyenler:** [K10-07](K10-bildirim-eposta-sms.md#K10-07), [K10-13](K10-bildirim-eposta-sms.md#K10-13)

---

<a id="K10-06"></a>
## K10-06 · Bildirim tüketicisi: alıcı belirleme, tercih/sessiz saat değerlendirme

**Boyut:** L · **Dalga:** 33 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K09-04](K09-sohbet-canli-akis.md#K09-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/notifications/consumer/`, `packages/application/src/notifications/recipients/`, `apps/worker/src/jobs/notification-consumer.ts`, `tests/integration/notification-consumer/`

**Teslim edilecekler**
- Outbox olaylarını (§18.3) tüketir; **kendi izinli alıcılarını belirler** (alıcı listesi olaya konmaz); `notification` (uygulama içi) kaydı tekilleşir ve `realtime_inbox`'a değişiklik yazar
- Tercih ve işletme varsayılanı çözümü; sessiz saat (22:00–09:00 işletme yerel saati, ayarlanabilir) ve erteleme; OTP/güvenlik akışı ayrı politika; 'acil' işareti ayrı yetki + gerekçe
- Sohbet mesajı e-postası kısa aralıkla birleştirilir; yönetici SMS seçimi olmadan her sohbet mesajı SMS üretmez
- Handler idempotent; K04-05 işçi çerçevesinde

**Kabul**
- T-18: aynı olay iki kez işlenirse uygulama içi bildirim tekilleşir; niyet kaybolmaz
- Yakın rolü/üyeliği iptal edilen kişi alıcı kümesine girmez
- Bu paketin geçmesi gereken şartname testleri: T-18 (§20.1).

**Kapsam dışı:** Dış kanal gönderimi (ledger/işçi) K10-07'dedir.

**Oku:** `AGENTS.md`, §12.1, §12.3, §12.4, §18.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K07-10](K07-kurumsal-site-icerik.md#K07-10), [K08-13](K08-dugunum-pano-onay.md#K08-13), [K09-05](K09-sohbet-canli-akis.md#K09-05), [K09-06](K09-sohbet-canli-akis.md#K09-06), [K11-15](K11-medya-temeli.md#K11-15), [K13-10](K13-davetiye-takvim.md#K13-10), [K13-12](K13-davetiye-takvim.md#K13-12), [K14-07](K14-belge-odeme.md#K14-07), [K14-08](K14-belge-odeme.md#K14-08)

**Bunu bekleyenler:** [K10-07](K10-bildirim-eposta-sms.md#K10-07), [K10-14](K10-bildirim-eposta-sms.md#K10-14)

---

<a id="K10-07"></a>
## K10-07 · Delivery ledger ve gönderim işçisi: yeniden değerlendirme, unknown, uzlaştırma

**Boyut:** L · **Dalga:** 34 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K10-05](K10-bildirim-eposta-sms.md#K10-05), [K10-06](K10-bildirim-eposta-sms.md#K10-06)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/notifications/delivery/`, `apps/worker/src/jobs/delivery-send.ts`, `apps/worker/src/jobs/delivery-reconcile.ts`, `tests/integration/delivery/`

**Teslim edilecekler**
- Gönderim işçisi: `queued → sending → accepted ...`; **gönderimden hemen önce** alıcı üyeliği, telefon, tercih ve gönderim yetkisi yeniden okunur (gerekirse `suppressed`); içeriğin güncel durumu yeniden okunur
- Sağlayıcı isteği timeout → **`unknown`**, kör retry yok; client reference/idempotency + durum sorgusu varsa uzlaştırma işi; destek yoksa otomatik tekrar durur ve personele görünür
- Kesin geçici hata: üstel geri deneme + jitter (en çok 5, olay türüne göre ayarlı); kalıcı hata tekrar edilmez; OTP/geçmiş bildirimlerde kısa süre aşımı (`expired`)
- SMS/e-posta kapalıyken rezervasyon korunur; bildirim bekleyen/başarısız görünür ve alarm olayı üretir

**Kabul**
- T-19: sağlayıcı kabul edip yanıt vermeden timeout → `unknown`; kör retry yok; uzlaştırma görünür
- T-21: kuyruktaki SMS öncesi alıcı üyeliği/telefonu/tercihi değişir → gönderim yeniden değerlendirilir, gerekirse bastırılır
- Bu paketin geçmesi gereken şartname testleri: T-19, T-21 (§20.1).

**Kapsam dışı:** Webhook alımı K10-09'dadır; gerçek sağlayıcı adaptörleri K10-10/11'dedir.

**Oku:** `AGENTS.md`, §12.2, §12.4, §19.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K08-15](K08-dugunum-pano-onay.md#K08-15), [K09-07](K09-sohbet-canli-akis.md#K09-07), [K09-08](K09-sohbet-canli-akis.md#K09-08), [K10-14](K10-bildirim-eposta-sms.md#K10-14), [K11-16](K11-medya-temeli.md#K11-16), [K13-14](K13-davetiye-takvim.md#K13-14), [K14-09](K14-belge-odeme.md#K14-09)

**Bunu bekleyenler:** [K10-08](K10-bildirim-eposta-sms.md#K10-08), [K10-09](K10-bildirim-eposta-sms.md#K10-09), [K10-10](K10-bildirim-eposta-sms.md#K10-10), [K10-11](K10-bildirim-eposta-sms.md#K10-11), [K10-12](K10-bildirim-eposta-sms.md#K10-12), [K10-13](K10-bildirim-eposta-sms.md#K10-13)

---

<a id="K10-08"></a>
## K10-08 · Ortam koruması: staging'de gerçek alıcıya gönderimi engelleme

**Boyut:** S · **Dalga:** 35 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-07](K10-bildirim-eposta-sms.md#K10-07)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/notifications/env-guard/`, `packages/integrations/src/provider-factory.ts`, `tests/integration/env-guard/`

**Teslim edilecekler**
- Sağlayıcı fabrikası: development/test'te yalnız fake adaptör; staging'de yalnız kayıtlı alıcı allowlist'ine (K10-02) gönderim, diğerleri `suppressed (env)`; üretim bayrağı olmadan gerçek adaptör yüklenmez
- Yanlış yapılandırmada uygulama başlamaz (K01-04 env şemasıyla uyumlu)

**Kabul**
- T-32: staging'den allowlist dışı numara/adrese gerçek gönderim denenir → engellenir ve kayıtlıdır; fake adaptör üretimde etkin değil (test)
- Allowlist'siz staging çalıştırma gönderim yapmaz
- Bu paketin geçmesi gereken şartname testleri: T-32 (§20.1).

**Kapsam dışı:** Gerçek adaptörlerin kendisi K10-10/11'dedir.

**Oku:** `AGENTS.md`, §12.4, §19.1, §20.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K09-09](K09-sohbet-canli-akis.md#K09-09), [K10-09](K10-bildirim-eposta-sms.md#K10-09), [K10-12](K10-bildirim-eposta-sms.md#K10-12), [K10-13](K10-bildirim-eposta-sms.md#K10-13), [K15-11](K15-chatbot.md#K15-11), [K16-09](K16-yonetim-butunlestirme.md#K16-09)

**Bunu bekleyenler:** [K10-17](K10-bildirim-eposta-sms.md#K10-17)

---

<a id="K10-09"></a>
## K10-09 · Webhook alımı: imza, tekilleştirme, sıra, bastırma

**Boyut:** L · **Dalga:** 35 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-07](K10-bildirim-eposta-sms.md#K10-07)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/api/webhooks/`, `packages/application/src/webhooks/`, `tests/security/webhooks/`

**Teslim edilecekler**
- `POST /api/webhooks/sms/:provider` ve `POST /api/webhooks/email/:provider`: imzalı doğrulama (yalnız IP allowlist yeterli değil); `webhook_receipt` ile tekrar/sırasız yönetimi; `delivered` geç gelen `accepted` ile geriye düşmez
- E-posta bounce/şikayet: kalıcı bounce ve şikayet adresi `contact_suppression`'a yazar; normal hizmet e-postası bastırılır (OTP/güvenlik politikası ayrı); panelde neden gereksiz kişisel veri olmadan
- Hata yanıtları ham sağlayıcı verisi sızdırmaz; hız limiti; gövde boyutu sınırı

**Kabul**
- T-20: aynı/sırasız/sahte provider webhook → tek güvenilir sonuç; teslim durumu geriye gitmez
- T-35: sahte, tekrarlanan, sırasız bounce/şikayet → imzasız reddedilir; kalıcı bounce adresi bastırılır; durum geriye gitmez
- Bu paketin geçmesi gereken şartname testleri: T-20, T-35 (§20.1).

**Kapsam dışı:** Sağlayıcıya özel imza şeması K10-10/11'de eklenir; bu pakette fake sağlayıcı imzasıyla.

**Oku:** `AGENTS.md`, §12.4, §17.4, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K09-09](K09-sohbet-canli-akis.md#K09-09), [K10-08](K10-bildirim-eposta-sms.md#K10-08), [K10-12](K10-bildirim-eposta-sms.md#K10-12), [K10-13](K10-bildirim-eposta-sms.md#K10-13), [K15-11](K15-chatbot.md#K15-11), [K16-09](K16-yonetim-butunlestirme.md#K16-09)

**Bunu bekleyenler:** [K10-10](K10-bildirim-eposta-sms.md#K10-10), [K10-11](K10-bildirim-eposta-sms.md#K10-11)

---

<a id="K10-10"></a>
## K10-10 · SMS sağlayıcı adaptörü (gerçek) ve sandbox doğrulaması

**Boyut:** L · **Dalga:** 36 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-02](K10-bildirim-eposta-sms.md#K10-02), [K10-07](K10-bildirim-eposta-sms.md#K10-07), [K10-09](K10-bildirim-eposta-sms.md#K10-09)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/integrations/src/sms/`, `tests/integration/sms-provider/`

**Teslim edilecekler**
- Seçilen sağlayıcı için `SmsProvider` gerçeklemesi (`send`, `lookup`, `verifyWebhook`) + capability bildirimi; SDK iş koduna sızmaz; sağlayıcı hata kodu eşlemesi (geçici/kalıcı)
- Sandbox/test alıcılarıyla doğrulama notları; üretim bayrağı olmadan etkin değil (K10-08)

**Kabul**
- Test numarasına gönderim `accepted` → teslim raporu `delivered` akışı kanıtlı; sağlayıcı yoksa nedeni rapora yazılı
- Sağlayıcı SDK importu yalnız `packages/integrations` içinde

**Kapsam dışı:** E-posta K10-11'dedir. Hesap yoksa bu paket başlamaz (K10-02).

**Oku:** `AGENTS.md`, §12.4, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K10-11](K10-bildirim-eposta-sms.md#K10-11), [K10-15](K10-bildirim-eposta-sms.md#K10-15), [K16-07](K16-yonetim-butunlestirme.md#K16-07)

**Bunu bekleyenler:** [K10-16](K10-bildirim-eposta-sms.md#K10-16)

---

<a id="K10-11"></a>
## K10-11 · E-posta sağlayıcı adaptörü (gerçek) ve sandbox doğrulaması

**Boyut:** L · **Dalga:** 36 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-02](K10-bildirim-eposta-sms.md#K10-02), [K10-07](K10-bildirim-eposta-sms.md#K10-07), [K10-09](K10-bildirim-eposta-sms.md#K10-09)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/integrations/src/email/`, `tests/integration/email-provider/`

**Teslim edilecekler**
- Seçilen sağlayıcı için `EmailProvider` gerçeklemesi (`send`, `verifyWebhook`) + bounce/şikayet olay eşlemesi; capability bildirimi; SPF/DKIM/DMARC doğrulama notu
- Test alıcılarıyla doğrulama; üretim bayrağı olmadan etkin değil

**Kabul**
- Test e-postası gönderimi ve bounce/şikayet olayı sandbox'ta doğrulandı; eksik varsa nedeni yazılı

**Kapsam dışı:** SMS K10-10'dadır.

**Oku:** `AGENTS.md`, §12.4, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K10-10](K10-bildirim-eposta-sms.md#K10-10), [K10-15](K10-bildirim-eposta-sms.md#K10-15), [K16-07](K16-yonetim-butunlestirme.md#K16-07)

**Bunu bekleyenler:** [K10-16](K10-bildirim-eposta-sms.md#K10-16)

---

<a id="K10-12"></a>
## K10-12 · SMS bütçesi, hız limiti, tekrar engeli ve alarm olayları

**Boyut:** M · **Dalga:** 35 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-07](K10-bildirim-eposta-sms.md#K10-07)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/notifications/budget/`, `packages/db/migrations/*_sms_budget.sql`, `packages/db/src/schema/sms-budget.ts`, `tests/integration/sms-budget/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- İşletme günlük/aylık SMS bütçesi, alıcı başına hız limiti, aynı içerik tekrar engeli, personel kotası; %80 uyarı, %100 yeni normal gönderim engeli (gerçek parasal tavanı ürün sahibi ayarlar)
- K03-10'daki OTP/SMS sayaçlarını bu servise bağlar (tek bütçe görünümü); olağandışı oran → alarm olayı (SMS pumping); tavan aşımında rezervasyon/mesaj kaydı etkilenmez
- Sessiz saat erteleme ile birlikte karar sırası belgelenir

**Kabul**
- T-36: tek numara/IP/ülke önekinden OTP/SMS istismarı ve bütçe aşımı → gönderim durur; alarm üretilir; rezervasyon etkilenmez
- T-22: limit aşımı, sessiz saat, Unicode metin → doğru erteleme/engelleme; segment tahmini ve neden görünür
- Bu paketin geçmesi gereken şartname testleri: T-22, T-36 (§20.1).

**Kapsam dışı:** Alarm hedefi/alıcısı işletme tarafından belirlenir; bu pakette yalnız olay.

**Oku:** `AGENTS.md`, §12.3, §19.3, §19.6 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K09-09](K09-sohbet-canli-akis.md#K09-09), [K10-08](K10-bildirim-eposta-sms.md#K10-08), [K10-09](K10-bildirim-eposta-sms.md#K10-09), [K10-13](K10-bildirim-eposta-sms.md#K10-13), [K15-11](K15-chatbot.md#K15-11), [K16-09](K16-yonetim-butunlestirme.md#K16-09)

**Bunu bekleyenler:** [K10-15](K10-bildirim-eposta-sms.md#K10-15), [K10-17](K10-bildirim-eposta-sms.md#K10-17), [K16-07](K16-yonetim-butunlestirme.md#K16-07)

---

<a id="K10-13"></a>
## K10-13 · Yönetici gönderim API'si: preview/publish ve 'Ayrıca SMS gönder'

**Boyut:** L · **Dalga:** 35 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-05](K10-bildirim-eposta-sms.md#K10-05), [K10-07](K10-bildirim-eposta-sms.md#K10-07), [K08-07](K08-dugunum-pano-onay.md#K08-07), [K08-09](K08-dugunum-pano-onay.md#K08-09)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/admin-updates/`, `apps/web/app/api/admin/updates/`, `tests/integration/admin-updates/`

**Teslim edilecekler**
- `POST /api/admin/updates/preview`: hedef kitle (ekibe özel / müşteri / izinli kamu yayını), gerçek alıcılar, doğrulanmış numaralar, metin ve tahmini parça sayısı; kayıtlı kişinin gereksiz verisi gösterilmez
- `POST /api/admin/updates/publish`: **önizleme sürümü** alıcı kümesi + şablon sürümü + işlem sürümüyle bağlıdır; biri değişmişse yeniden önizleme zorunlu; işlem kaydı + SMS niyeti **aynı transaction**; dış SMS API'si çağrılmaz
- SMS yalnız `notification.sms.send` izniyle; izin yoksa API reddeder; seçim normal kanal ayarlarını değiştirmez, işleme ait ek istektir; ekibe özel hedefte SMS reddedilir
- UI metni: 'işlem kaydedildi, SMS gönderim sırasına alındı'

**Kabul**
- T-14: iç not + müşteri SMS seçeneği manipülasyonu → müşteriye içerik/bildirim gitmez; UI ve API korumalı
- Önizleme sonrası alıcı/şablon değişirse publish reddedilir
- Bu paketin geçmesi gereken şartname testleri: T-14 (§20.1).

**Kapsam dışı:** Ekran K10-15'tedir.

**Oku:** `AGENTS.md`, §12.1, §12.2, §17.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K09-09](K09-sohbet-canli-akis.md#K09-09), [K10-08](K10-bildirim-eposta-sms.md#K10-08), [K10-09](K10-bildirim-eposta-sms.md#K10-09), [K10-12](K10-bildirim-eposta-sms.md#K10-12), [K15-11](K15-chatbot.md#K15-11), [K16-09](K16-yonetim-butunlestirme.md#K16-09)

**Bunu bekleyenler:** [K10-15](K10-bildirim-eposta-sms.md#K10-15), [K10-17](K10-bildirim-eposta-sms.md#K10-17)

---

<a id="K10-14"></a>
## K10-14 · Bildirim merkezi ve tercih ekranları (müşteri ve personel)

**Boyut:** L · **Dalga:** 34 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-06](K10-bildirim-eposta-sms.md#K10-06), [K06-15](K06-talep-ziyaret-teklif.md#K06-15), [K21-03](K21-yonetim-kabugu-takvim.md#K21-03)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(customer)/hesabim/bildirimler/`, `apps/web/src/customer/notifications/`, `apps/web/app/(admin)/bildirimlerim/`, `apps/web/src/admin/notifications/`, `apps/web/app/api/me/notifications/`, `tests/e2e/notifications-center/`

**Teslim edilecekler**
- Uygulama içi bildirim listesi/okundu, okunmamış sayacı; olay kategorisi × kanal tercih ekranı (tanıtım rızası ayrı, hizmet bildirimiyle birleşmez); personel tercihleri
- `GET/PATCH /api/me/notifications*`, `/api/me/notification-preferences`; yalnız kendi kayıtları; `consent_record` bağlantısı

**Kabul**
- Playwright: tercih değişimi sonraki bildirimlerde uygulanır; başka kullanıcının bildirimi erişilemez
- Tercih ekranında yükleniyor/boş/hata durumları, klavye ve mobil

**Kapsam dışı:** Yönetim gönderim ekranı K10-15'tedir.

**Oku:** `AGENTS.md`, §12.3, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K08-15](K08-dugunum-pano-onay.md#K08-15), [K09-07](K09-sohbet-canli-akis.md#K09-07), [K09-08](K09-sohbet-canli-akis.md#K09-08), [K10-07](K10-bildirim-eposta-sms.md#K10-07), [K11-16](K11-medya-temeli.md#K11-16), [K13-14](K13-davetiye-takvim.md#K13-14), [K14-09](K14-belge-odeme.md#K14-09)

**Bunu bekleyenler:** [K10-17](K10-bildirim-eposta-sms.md#K10-17), [K16-09](K16-yonetim-butunlestirme.md#K16-09)

---

<a id="K10-15"></a>
## K10-15 · Yönetim ekranları: AudienceSelector, UpdateComposer, SmsPreview, DeliveryHistory

**Boyut:** L · **Dalga:** 36 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-13](K10-bildirim-eposta-sms.md#K10-13), [K10-12](K10-bildirim-eposta-sms.md#K10-12), [K08-13](K08-dugunum-pano-onay.md#K08-13), [K09-08](K09-sohbet-canli-akis.md#K09-08), [K21-03](K21-yonetim-kabugu-takvim.md#K21-03)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/updates/`, `apps/web/app/(admin)/guncellemeler/`, `apps/web/src/admin/delivery/`, `apps/web/app/(admin)/gonderimler/`, `apps/web/src/admin/nav/gonderimler.ts`, `tests/e2e/admin-updates/`

**Teslim edilecekler**
- `AudienceSelector`, `UpdateComposer`, `NotificationOptions` ('Ayrıca SMS gönder' varsayılan işaretsiz; izin yoksa **hiç gösterilmez**), `SmsPreview` (alıcılar, numara doğrulama, metin, parça sayısı), `DeliveryHistory` (durum, `unknown` uzlaştırma görünümü, bastırma nedeni, bütçe uyarısı)
- K08-13 pano ekranı ve K09-08 sohbet ekranındaki bildirim seçeneklerini bu bileşenlerle bağlar (iki WP'nin dosyalarına yalnız tek satırlık içe aktarma ekler; ayrı PR ve sıralı)
- Gönderim sonrası mesaj: 'SMS ulaştı' değil 'gönderim sırasına alındı'

**Kabul**
- Playwright: SMS izinli/izinsiz personel; önizleme değişince yeniden önizleme istenir; unknown görünür
- Normal kanal ayarlarının SMS seçimiyle değişmediği testle doğrulanır

**Kapsam dışı:** Tercih/bildirim merkezi K10-14'tedir.

**Oku:** `AGENTS.md`, §12.2, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K10-10](K10-bildirim-eposta-sms.md#K10-10), [K10-11](K10-bildirim-eposta-sms.md#K10-11), [K16-07](K16-yonetim-butunlestirme.md#K16-07)

**Bunu bekleyenler:** [K10-17](K10-bildirim-eposta-sms.md#K10-17), [K16-04](K16-yonetim-butunlestirme.md#K16-04), [K16-08](K16-yonetim-butunlestirme.md#K16-08)

---

<a id="K10-16"></a>
## K10-16 · Davet, OTP ve kanal kanıtı gönderimini gerçek kanallara bağlama

**Boyut:** M · **Dalga:** 37 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K10-10](K10-bildirim-eposta-sms.md#K10-10), [K10-11](K10-bildirim-eposta-sms.md#K10-11), [K06-10](K06-talep-ziyaret-teklif.md#K06-10), [K03-10](K03-kimlik-uyelik.md#K03-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/integrations/src/channel-senders/`, `packages/application/src/invitations/senders/`, `tests/integration/channel-senders/`

**Teslim edilecekler**
- K03/K06'daki fake `ChannelProofSender`, `InvitationSender` ve OTP gönderimi, K10-05 şablonları ve K10-07 ledger üzerinden gerçek e-posta/SMS adaptörlerine bağlanır; güvenlik akışı politikası (bastırılmış e-posta için OTP/güvenlik istisnası ayrı karar kaydı)
- Token/kod loglara girmez (redaksiyon), ledger kaydında içerik yok; bastırılmış/doğrulanmamış numaraya normal hizmet SMS'i gitmez

**Kabul**
- Staging'de test alıcısına davet bağlantısı ve kanal kanıtı kodu ulaşır; kabul akışı gerçek kanalla çalışır (hesap yoksa fake'le ve engel raporda)
- Token/OTP hiçbir logda/denetimde düz görünmez

**Kapsam dışı:** Hesaplar K10-02 olmadan bu paket tamamlanamaz.

**Oku:** `AGENTS.md`, §7.1, §12.4, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K16-04](K16-yonetim-butunlestirme.md#K16-04), [K16-08](K16-yonetim-butunlestirme.md#K16-08)

**Bunu bekleyenler:** [K10-17](K10-bildirim-eposta-sms.md#K10-17), [K17-06](K17-staging-kabul.md#K17-06)

---

<a id="K10-17"></a>
## K10-17 · K10 kabul testleri ve raporu

**Boyut:** M · **Dalga:** 38 · **Tür:** doküman
**Başlamadan önce `main`'de olması gerekenler:** [K10-08](K10-bildirim-eposta-sms.md#K10-08), [K10-12](K10-bildirim-eposta-sms.md#K10-12), [K10-13](K10-bildirim-eposta-sms.md#K10-13), [K10-14](K10-bildirim-eposta-sms.md#K10-14), [K10-15](K10-bildirim-eposta-sms.md#K10-15), [K10-16](K10-bildirim-eposta-sms.md#K10-16)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/integration/notifications-acceptance/`, `docs/reports/K10-kabul.md`

**Teslim edilecekler**
- T-18–T-22, T-32, T-35, T-36 için tek komut (`pnpm test:notifications`); sağlayıcı sandbox doğrulama sonuçları; test alıcılarıyla M3 kontrol listesi
- `K10-kabul.md`: sağlayıcı capability tablosu, unknown uzlaştırma davranışı, bilinen sınırlar, maliyet notları (rakam uydurulmaz)

**Kabul**
- Sekiz test grubu CI'da yeşil; çalıştırılamayanlar ve nedeni yazılı
- Yinelenen webhook güvenli; timeout `unknown`; staging gerçek alıcıya göndermez
- Bu paketin geçmesi gereken şartname testleri: T-18, T-19, T-20, T-21, T-22, T-32, T-35, T-36 (§20.1).

**Kapsam dışı:** Kod değişikliği yalnız test/rapor.

**Oku:** `AGENTS.md`, §12, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K16-10](K16-yonetim-butunlestirme.md#K16-10)

**Bunu bekleyenler:** [K10-18](K10-bildirim-eposta-sms.md#K10-18), [K16-11](K16-yonetim-butunlestirme.md#K16-11)

---

<a id="K10-18"></a>
## K10-18 · M3 kabulü: ürün sahibi Düğünüm, onay, sohbet ve bildirimleri test alıcılarıyla dener

**Boyut:** S · **Dalga:** 39 · **Tür:** kabul
**Başlamadan önce `main`'de olması gerekenler:** [K10-17](K10-bildirim-eposta-sms.md#K10-17), [K09-09](K09-sohbet-canli-akis.md#K09-09), [K08-15](K08-dugunum-pano-onay.md#K08-15)
**Ürün sahibinden gereken:** Staging'de deneme ve geri bildirim.


**Teslim edilecekler**
- Staging'de iki test hesabıyla (çift üyesi + personel) Düğünüm → pano → onay → sohbet → bildirim (e-posta/SMS test alıcılarına) senaryosu; geri bildirim `docs/reports/M3-geri-bildirim.md`

**Kabul**
- Ürün sahibinin 'M3 yeterli' onayı veya düzeltme listesi yazılı
- Gerçek müşteri verisi/alıcısı kullanılmadı

**Oku:** `AGENTS.md`, §22.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K17-05](K17-staging-kabul.md#K17-05)

---
