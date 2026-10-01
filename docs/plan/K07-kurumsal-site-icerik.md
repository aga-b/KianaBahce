# K07 — Kurumsal site ve içerik

**Kilometre taşı:** M2 — Başvurudan davete (K06, K07) · **Şartname:** §2, §5.2, §9.4, §16 · [Plan dizini](README.md)

> Onaylı ekranlara göre server-first genel site, içerik yönetimi, SSS, iletişim/talep formları ve uygunluk arayüzü.

**K20-07 (ürün sahibinin tasarım/içerik onayı) olmadan başlamaz.** Sahte hizmet, kapasite, fiyat veya fotoğraf kullanılmaz; yalnız K20 envanterinde kullanım hakkı belli içerik. Galeri slotları K11/K12'ye bağlıdır (burada yer tutucu `GalleryPreview`).

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K07-01](K07-kurumsal-site-icerik.md#K07-01) · Site iskeleti: server-first düzen, güvenlik başlıkları, JS bütçesi denetimi | M | 7 | K20-07, K01-09 |  |
| [K07-02](K07-kurumsal-site-icerik.md#K07-02) · İçerik modeli: sayfa, revizyon, SSS (taslak/yayın) ve yayın tetikleme | L | 22 | K20-07, K04-10 | migration |
| [K07-03](K07-kurumsal-site-icerik.md#K07-03) · Yönetim: içerik editörü, SSS ve SEO alanları ekranları | L | 23 | K07-02, K21-03 |  |
| [K07-04](K07-kurumsal-site-icerik.md#K07-04) · Ana sayfa ve kurumsal sayfalar (onaylı maketlere göre) | L | 23 | K07-01, K07-02 |  |
| [K07-05](K07-kurumsal-site-icerik.md#K07-05) · Uygunluk arayüzü: SpaceSelector, AvailabilityCalendar, SlotList | L | 26 | K07-01, K05-10 |  |
| [K07-06](K07-kurumsal-site-icerik.md#K07-06) · Talep, ziyaret ve iletişim formları | L | 26 | K07-01, K06-03, K06-06 |  |
| [K07-07](K07-kurumsal-site-icerik.md#K07-07) · SEO, yapılandırılmış veri, sitemap ve yönlendirme planı | M | 24 | K07-04 |  |
| [K07-08](K07-kurumsal-site-icerik.md#K07-08) · Hukuki sayfalar ve çerez/analitik tercihi | M | 8 | K07-01, K20-06 |  |
| [K07-09](K07-kurumsal-site-icerik.md#K07-09) · Site performans, erişilebilirlik ve kamu API sızıntı denetimi | M | 27 | K07-04, K07-05, K07-06, K07-07 |  |
| [K07-10](K07-kurumsal-site-icerik.md#K07-10) · M2 kabulü: ürün sahibi genel site, talep, teklif ve davet akışını dener | S | 33 | K07-09, K07-08, K06-16 | ürün sahibi girdisi, kabul |

<a id="K07-01"></a>
## K07-01 · Site iskeleti: server-first düzen, güvenlik başlıkları, JS bütçesi denetimi

**Boyut:** M · **Dalga:** 7 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K20-07](K20-tasarim-icerik.md#K20-07), [K01-09](K01-iskelet.md#K01-09)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(site)/layout.tsx`, `apps/web/src/site/shell/`, `apps/web/src/site/tokens/`, `apps/web/next.config.ts`, `scripts/check-bundle-budget.ts`, `.github/workflows/site-budget.yml`

**Teslim edilecekler**
- Kök layout istemci uygulamasına dönüşmez; `use client` yalnız küçük etkileşim sınırlarında (mobil menü); `SiteHeader`, `SiteFooter`, mobil menü; K20-03 tokenlarının uygulanması
- Güvenlik başlıkları (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`), kamu sayfaları için `Cache-Control` politikası; özel/portal/yönetim yolları `no-store` (T-17 ile uyumlu)
- CI: ana sayfa ilk yük JS ≤180 KB (sıkıştırılmış) bütçe denetimi; aşım gerekçe ister, sessizce yükseltilmez
- Üçüncü taraf betik/harita/analitik yok (harita yalnız yol tarifi bağlantısı, §5.2)

**Kabul**
- Bütçe denetimi CI'da çalışır ve bilinçli aşımda kırılır
- Başlık testi: kamu ve özel yolların cache başlıkları doğru

**Kapsam dışı:** Sayfa içerikleri ve formlar sonraki paketlerde.

**Oku:** `AGENTS.md`, §5.2, §16, §17.3, §19.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K02-02](K02-db-erisim-cekirdegi.md#K02-02), [K02-05](K02-db-erisim-cekirdegi.md#K02-05)

**Bunu bekleyenler:** [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K07-08](K07-kurumsal-site-icerik.md#K07-08), [K13-07](K13-davetiye-takvim.md#K13-07)

---

<a id="K07-02"></a>
## K07-02 · İçerik modeli: sayfa, revizyon, SSS (taslak/yayın) ve yayın tetikleme

**Boyut:** L · **Dalga:** 22 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K20-07](K20-tasarim-icerik.md#K20-07), [K04-10](K04-outbox-audit-isci.md#K04-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/content.ts`, `packages/db/migrations/*_content_schema.sql`, `packages/application/src/content/`, `packages/contracts/src/content/`, `tests/integration/content/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `content_page`, `content_revision`, `faq_entry`: kontrollü yapılandırılmış bloklar (başlık, paragraf, hizmet listesi, SSS, galeri seçimi, iletişim, SEO alanları); serbest HTML/JS yok; blok şemaları Zod ile; sürümlü revizyon, taslak → yayın
- Yayın: yayımlanan revizyon kamu sayfasını yeniler (talep üzerine yeniden doğrulama); taslak önizleme **yetkili** ve arama motoruna/genel cache'e sızmaz (`noindex`, `no-store`, imzasız URL yok)
- `faq_entry`: chatbot'un onaylı bilgi kaynağı olarak da okunacağı alan (K15 tüketir); onay durumu
- İzin `content.edit` / `content.publish` (K02-03 sözlüğüne küçük PR); audit; revizyon geri alma

**Kabul**
- Taslak revizyon kamu uçlarında/HTML'de görünmez; yayın sonrası yenilenir
- Blok şeması dışı alan/HTML/script içeren içerik reddedilir veya temizlenir (T-34 bağlantısı)

**Kapsam dışı:** Yönetim ekranı K07-03'tedir.

**Oku:** `AGENTS.md`, §8, §16, §17.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-01](K05-rezervasyon-motoru.md#K05-01), [K08-01](K08-dugunum-pano-onay.md#K08-01), [K09-01](K09-sohbet-canli-akis.md#K09-01), [K10-03](K10-bildirim-eposta-sms.md#K10-03), [K11-02](K11-medya-temeli.md#K11-02), [K16-05](K16-yonetim-butunlestirme.md#K16-05)

**Bunu bekleyenler:** [K07-03](K07-kurumsal-site-icerik.md#K07-03), [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K12-01](K12-galeri-oynatici.md#K12-01), [K15-03](K15-chatbot.md#K15-03)

---

<a id="K07-03"></a>
## K07-03 · Yönetim: içerik editörü, SSS ve SEO alanları ekranları

**Boyut:** L · **Dalga:** 23 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K07-02](K07-kurumsal-site-icerik.md#K07-02), [K21-03](K21-yonetim-kabugu-takvim.md#K21-03)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/content/`, `apps/web/app/(admin)/icerik/`, `apps/web/src/admin/nav/icerik.ts`, `tests/e2e/admin-content/`

**Teslim edilecekler**
- Blok tabanlı editör (sıralama, ekleme, silme), SEO alanları (başlık, açıklama, kanonik), SSS yönetimi, taslak/yayın/revizyon geçmişi, yetkili önizleme
- Yükleniyor/boş/hata/yetkisiz durumları; mobil ve klavye; sunucu doğrulamasının hata mesajları Türkçe ve alanla ilişkili

**Kabul**
- Playwright: taslak oluştur → önizle → yayımla → kamu sayfasında görünür; izinsiz personelde editör yok
- Önizleme URL'si oturumsuz açılmaz ve indekslenmez

**Kapsam dışı:** Galeri seçimi bloğunun gerçek medyaya bağlanması K12'dedir.

**Oku:** `AGENTS.md`, §16, §7.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-03](K05-rezervasyon-motoru.md#K05-03), [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K10-05](K10-bildirim-eposta-sms.md#K10-05), [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04), [K13-02](K13-davetiye-takvim.md#K13-02), [K15-02](K15-chatbot.md#K15-02)

**Bunu bekleyenler:** [K12-03](K12-galeri-oynatici.md#K12-03)

---

<a id="K07-04"></a>
## K07-04 · Ana sayfa ve kurumsal sayfalar (onaylı maketlere göre)

**Boyut:** L · **Dalga:** 23 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K07-01](K07-kurumsal-site-icerik.md#K07-01), [K07-02](K07-kurumsal-site-icerik.md#K07-02)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(site)/page.tsx`, `apps/web/app/(site)/[...slug]/`, `apps/web/src/site/sections/`, `apps/web/public/site/`, `tests/e2e/site-pages/`

**Teslim edilecekler**
- `Hero`, `VenueIntro`, `ServiceList`, `GalleryPreview` (K11/K12'ye kadar onaylı statik görseller), `FAQ`, `ContactSection`; organizasyon türleri, olanaklar, yol tarifi bağlantısı; içerik K07-02'den, **K20-05 onaylı metinleriyle**
- Görseller yalnız K20-01 envanterinde kullanım hakkı onaylı olanlar; responsive boyutlar; ilk görünüm görselleri toplam yaklaşık ≤500 KB hedefi
- Sahte hizmet/kapasite/fiyat/yorum uydurulmaz; veri yoksa bölüm gösterilmez
- Sunucuda üretilir/statik yayımlanır; `use client` yalnız küçük etkileşim sınırı

**Kabul**
- Onaylı maket ile ekran karşılaştırma notu (sapma varsa açıklamalı); mobil görünüm
- Sayfa HTML'inde özel alan/ham DB kaydı yok (RSC çıktısı dahil)

**Kapsam dışı:** Uygunluk ve formlar K07-05/06'dadır.

**Oku:** `AGENTS.md`, §2, §5.2, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-03](K05-rezervasyon-motoru.md#K05-03), [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K07-03](K07-kurumsal-site-icerik.md#K07-03), [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K10-05](K10-bildirim-eposta-sms.md#K10-05), [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04), [K13-02](K13-davetiye-takvim.md#K13-02), [K15-02](K15-chatbot.md#K15-02)

**Bunu bekleyenler:** [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K12-04](K12-galeri-oynatici.md#K12-04)

---

<a id="K07-05"></a>
## K07-05 · Uygunluk arayüzü: SpaceSelector, AvailabilityCalendar, SlotList

**Boyut:** L · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K07-01](K07-kurumsal-site-icerik.md#K07-01), [K05-10](K05-rezervasyon-motoru.md#K05-10)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(site)/uygunluk/`, `apps/web/src/site/availability/`, `tests/e2e/site-availability/`

**Teslim edilecekler**
- `GET /api/public/availability` tüketen küçük istemci adası: alan, tarih/seans, davetli sayısı; gün/alan/seans ayrımı; `available/unavailable/closed` durumları; 'ekranda uygun görünmesi kesin rezervasyon garantisi değildir' notu
- Aralık en çok 31 gün isteği; satış ufku sınırı; takvim için liste alternatifi; klavye, mobil, azaltılmış hareket
- Yükleniyor/boş/hata durumları; hata yanıtı güvenli; hover'a bağlı bilgi yok (T-30)

**Kabul**
- Playwright: tarih gezinme, seans seçme, talep formuna geçiş; hata durumları
- DOM/RSC'de müşteri adı veya iç gerekçe yok (public DTO allowlist)
- Bu paketin geçmesi gereken şartname testleri: T-30 (§20.1).

**Kapsam dışı:** Talep formu K07-06'dadır.

**Oku:** `AGENTS.md`, §9.4, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K11-08](K11-medya-temeli.md#K11-08), [K11-09](K11-medya-temeli.md#K11-09), [K13-05](K13-davetiye-takvim.md#K13-05), [K14-05](K14-belge-odeme.md#K14-05), [K15-04](K15-chatbot.md#K15-04), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

**Bunu bekleyenler:** [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K13-13](K13-davetiye-takvim.md#K13-13)

---

<a id="K07-06"></a>
## K07-06 · Talep, ziyaret ve iletişim formları

**Boyut:** L · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K07-01](K07-kurumsal-site-icerik.md#K07-01), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-06](K06-talep-ziyaret-teklif.md#K06-06)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(site)/talep/`, `apps/web/app/(site)/ziyaret/`, `apps/web/app/(site)/iletisim/`, `apps/web/src/site/forms/`, `tests/e2e/site-forms/`

**Teslim edilecekler**
- `BookingRequestForm`, ziyaret randevusu talebi, iletişim formu; sunucu doğrulaması hata mesajları alanla ilişkili Türkçe; `BotCheck` (K06-03) istemci parçası; hız limiti (`429`) iletisi
- Başarı ekranı: referans + 'talep alındı'; **'rezervasyon tamamlandı' denmez**; talep takvimi kapatmaz bilgisi
- Aydınlatma metni gösterimi ve onay kaydı (K03-08/K20-06 sürüm kimlikleri); gereksiz alan toplanmaz
- Girişsiz gönderim mümkün; sonradan hesaba otomatik bağlanma yok (K06-04 sahiplenme bağlantısı)

**Kabul**
- Playwright: talep gönder → referans; hız limiti ve spam yolu; klavye/mobil
- Sahte `status/organizationId` alanı gönderilemez (istemci zaten sunucu şemasıyla reddedilir)
- Bu paketin geçmesi gereken şartname testleri: T-30 (§20.1).

**Kapsam dışı:** Personel tarafı K06 ekranlarındadır.

**Oku:** `AGENTS.md`, §10.1, §16, §17.6 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K11-08](K11-medya-temeli.md#K11-08), [K11-09](K11-medya-temeli.md#K11-09), [K13-05](K13-davetiye-takvim.md#K13-05), [K14-05](K14-belge-odeme.md#K14-05), [K15-04](K15-chatbot.md#K15-04), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

**Bunu bekleyenler:** [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K15-08](K15-chatbot.md#K15-08)

---

<a id="K07-07"></a>
## K07-07 · SEO, yapılandırılmış veri, sitemap ve yönlendirme planı

**Boyut:** M · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K07-04](K07-kurumsal-site-icerik.md#K07-04)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts`, `apps/web/src/site/seo/`, `docs/migration/redirect-map.md`

**Teslim edilecekler**
- Meta/OG alanları içerik modelinden; `sitemap.xml`, `robots.txt` (özel/yönetim/portal/önizleme yolları `Disallow` + `noindex`); yalnız gerçek verilere dayalı yapılandırılmış veri (uydurma puan/yorum/fiyat yok)
- Eski siteden URL yönlendirme planı: K20-02 envanterinden `redirect-map.md` (K18'de uygulanır; DNS/üretim değişikliği yok)
- Kanonik URL'ler, 404/410 politikası

**Kabul**
- `robots`/`sitemap` testi: özel yollar listede yok; önizleme `noindex`
- Yönlendirme planındaki her eski URL için hedef veya bilinçli 410 yazılı

**Kapsam dışı:** Gerçek DNS/yönlendirme uygulaması K18'dedir.

**Oku:** `AGENTS.md`, §16, §19.5 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K11-05](K11-medya-temeli.md#K11-05), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K12-01](K12-galeri-oynatici.md#K12-01), [K13-03](K13-davetiye-takvim.md#K13-03), [K14-02](K14-belge-odeme.md#K14-02), [K15-03](K15-chatbot.md#K15-03), [K15-05](K15-chatbot.md#K15-05)

**Bunu bekleyenler:** [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K18-03](K18-canliya-gecis.md#K18-03)

---

<a id="K07-08"></a>
## K07-08 · Hukuki sayfalar ve çerez/analitik tercihi

**Boyut:** M · **Dalga:** 8 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K07-01](K07-kurumsal-site-icerik.md#K07-01), [K20-06](K20-tasarim-icerik.md#K20-06)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(site)/gizlilik/`, `apps/web/app/(site)/cerez/`, `apps/web/app/(site)/aydinlatma/`, `apps/web/src/site/consent-banner/`

**Teslim edilecekler**
- K20-06 hukuki metin taslakları sayfa olarak yayınlanır; metin sürüm kimlikleri `consent_record` ile eşleşir; **işletme/uzman onayı olmadan 'taslak' uyarısı kalkmaz**
- Çerez/analitik: varsayılan analitik ve izleme yok; ileride eklenecekse rıza gerektirir (bu pakette banner yalnız gerekliyse; zorunlu çerezlerde banner çıkarılmaz)
- Aydınlatma metni linkleri formlara (K07-06) bağlanır

**Kabul**
- Metin sürümü ile sayfa/onay kaydı sürüm kimliği eşleşir
- Onay bekleyen metinlerde 'taslak' işareti yayın öncesi görünür ve K17'de kontrol listesine alınır

**Kapsam dışı:** Hukuki metinlerin içeriği/onayı K20-06'dadır ve işletme/uzman işidir.

**Oku:** `AGENTS.md`, §17.6, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K02-03](K02-db-erisim-cekirdegi.md#K02-03)

**Bunu bekleyenler:** [K07-10](K07-kurumsal-site-icerik.md#K07-10)

---

<a id="K07-09"></a>
## K07-09 · Site performans, erişilebilirlik ve kamu API sızıntı denetimi

**Boyut:** M · **Dalga:** 27 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K07-07](K07-kurumsal-site-icerik.md#K07-07)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/e2e/site-a11y/`, `tests/security/public-surface/`, `docs/reports/K07-performans.md`

**Teslim edilecekler**
- Mobil/klavye/azaltılmış hareket testleri (T-30 site kısmı), axe taramaları + elle kontrol notları
- Performans ölçümü: Lighthouse/laboratuvar + tanımlı cihaz/ağ profili; LCP/INP/CLS ve JS/görsel bütçeleri raporlanır (gerçek kullanıcı ölçümü canlıda; bu rapor ölçüm koşullarını yazar)
- Kamu yüzeyi taraması: HTML, RSC, API ve metin içinde özel alan/sır/müşteri adı yok; kamu API yanıtları allowlist şemasına karşı

**Kabul**
- T-30 site kısmı yeşil; bütçeler raporlanmış (aşım gerekçeli)
- Kamu API'de özel alan yok (tarama testi); sahte hizmet/kapasite bilgisi yok (içerik denetimi notu)
- Bu paketin geçmesi gereken şartname testleri: T-30 (§20.1).

**Kapsam dışı:** Üretim gerçek kullanıcı ölçümü K17/K18'dedir.

**Oku:** `AGENTS.md`, §5.2, §19.2, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-13](K05-rezervasyon-motoru.md#K05-13), [K21-05](K21-yonetim-kabugu-takvim.md#K21-05), [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K11-10](K11-medya-temeli.md#K11-10), [K11-11](K11-medya-temeli.md#K11-11), [K13-08](K13-davetiye-takvim.md#K13-08), [K15-06](K15-chatbot.md#K15-06), [K17-03](K17-staging-kabul.md#K17-03)

**Bunu bekleyenler:** [K07-10](K07-kurumsal-site-icerik.md#K07-10), [K17-04](K17-staging-kabul.md#K17-04)

---

<a id="K07-10"></a>
## K07-10 · M2 kabulü: ürün sahibi genel site, talep, teklif ve davet akışını dener

**Boyut:** S · **Dalga:** 33 · **Tür:** kabul
**Başlamadan önce `main`'de olması gerekenler:** [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K07-08](K07-kurumsal-site-icerik.md#K07-08), [K06-16](K06-talep-ziyaret-teklif.md#K06-16)
**Ürün sahibinden gereken:** Staging'de deneme ve geri bildirim.


**Teslim edilecekler**
- Staging'de ürün sahibi için senaryo: genel site → uygunluk → talep → (personel) inceleme → teklif → kabul → tutma → kesinleştirme → davet (fake gönderim); geri bildirim `docs/reports/M2-geri-bildirim.md`
- Geri bildirim sonraki kartların kapsamına yansıtılır

**Kabul**
- Ürün sahibinin 'M2 yeterli' onayı veya düzeltme listesi yazılı
- Gerçek müşteri verisi kullanılmadı

**Oku:** `AGENTS.md`, §22.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K08-13](K08-dugunum-pano-onay.md#K08-13), [K09-05](K09-sohbet-canli-akis.md#K09-05), [K09-06](K09-sohbet-canli-akis.md#K09-06), [K10-06](K10-bildirim-eposta-sms.md#K10-06), [K11-15](K11-medya-temeli.md#K11-15), [K13-10](K13-davetiye-takvim.md#K13-10), [K13-12](K13-davetiye-takvim.md#K13-12), [K14-07](K14-belge-odeme.md#K14-07), [K14-08](K14-belge-odeme.md#K14-08)

**Bunu bekleyenler:** [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K17-02](K17-staging-kabul.md#K17-02)

---
