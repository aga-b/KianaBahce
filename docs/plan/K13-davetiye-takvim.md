# K13 — İzinli davetiye ve takvim nüansı

**Kilometre taşı:** M4 — Medya ve yayın (K11–K15) · **Şartname:** §9.4, §13, §14.1, §14.4 · [Plan dizini](README.md)

> Ayrı yayın modeli: sürümlü publication, kapsam/sürüm bazlı onay, private/link_only/public_calendar görünürlüğü, kamu davetiye sayfası, takvimde izinli ipucu, iptal ve süre dolumu.

**§21.3 insan incelemesi** (yayın/onay modeli, özel veri → kamu DTO ayrımı, iptal ve cache davranışı). Özel `event` kaydının görünürlük bayrağı açılmaz; kamu için ayrı `publication_version`. Genel hizmet şartı kabulü yayın onayı sayılmaz; personel eksik kişi yerine onay veremez. Telefon/ödeme/özel not/belge/üyelik kimliği/sohbet hiçbir yayında yok. Davetiye HTML/medya genel CDN'de uzun süre cache'lenmez.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K13-01](K13-davetiye-takvim.md#K13-01) · Karar: yayın onayı kapsamı, kullanım hakkı süreci ve varsayılan süre | S | 0 | — | ürün sahibi girdisi, karar |
| [K13-02](K13-davetiye-takvim.md#K13-02) · Sözleşmeler ve ADR: publication DTO'ları, durum makinesi, izinli alan allowlist, paylaşım token'ı | M | 23 | K13-01, K05-01, K04-10 |  |
| [K13-03](K13-davetiye-takvim.md#K13-03) · Yayın şeması: invitation_publication, publication_version, publication_consent | L | 24 | K13-02, K05-03, K02-04 | insan inceleme, migration |
| [K13-04](K13-davetiye-takvim.md#K13-04) · Yayın use-case'leri: taslak, sürüm, gerekli onaylar, durum geçişleri | L | 25 | K13-03, K03-06, K03-08 | insan inceleme |
| [K13-05](K13-davetiye-takvim.md#K13-05) · Onay endpoint'i ve geri alma: POST /api/publications/:id/consents | M | 26 | K13-04 | insan inceleme |
| [K13-06](K13-davetiye-takvim.md#K13-06) · Yayın medyası: 'izinli davetiye dosyası' sınıfı ve erişim politikası | M | 28 | K13-04, K11-12, K11-10 | insan inceleme |
| [K13-07](K13-davetiye-takvim.md#K13-07) · Kamu davetiye sayfası: GET /davetiye/:publicId ve link_only token | L | 29 | K13-05, K13-06, K07-01 | insan inceleme |
| [K13-08](K13-davetiye-takvim.md#K13-08) · Uygunluk DTO'suna izinli ipucu: publicPublicationId | M | 27 | K13-05, K05-10 |  |
| [K13-09](K13-davetiye-takvim.md#K13-09) · İptal ve süre dolumu: yayın kapatma, cache temizliği, medya erişimi | L | 30 | K13-05, K13-06, K13-07, K05-07 | insan inceleme |
| [K13-10](K13-davetiye-takvim.md#K13-10) · Cache izolasyonu denetimi: iki kullanıcı, aynı URL (T-17) | M | 33 | K13-07, K08-10, K08-11 |  |
| [K13-11](K13-davetiye-takvim.md#K13-11) · Müşteri ekranı: yayın tercihi ve onay (PublicationConsent) | L | 32 | K13-05, K06-15 |  |
| [K13-12](K13-davetiye-takvim.md#K13-12) · Yönetim ekranı: PublicationManager sekmesi | L | 33 | K13-04, K13-09, K21-03, K08-12 |  |
| [K13-13](K13-davetiye-takvim.md#K13-13) · Takvim nüansı: PublicEventHint, hover/focus/dokunma kartı ve davetiye bağlantısı | L | 30 | K13-07, K13-08, K07-05 |  |
| [K13-14](K13-davetiye-takvim.md#K13-14) · K13 güvenlik/kabul paketi ve rapor (T-15, T-16, T-17) | M | 34 | K13-09, K13-10, K13-11, K13-12, K13-13 | insan inceleme |

<a id="K13-01"></a>
## K13-01 · Karar: yayın onayı kapsamı, kullanım hakkı süreci ve varsayılan süre

**Boyut:** S · **Dalga:** 0 · **Tür:** karar
**Başlamadan önce `main`'de olması gerekenler:** yok
**Ürün sahibinden gereken:** Yayın onayı kapsamı, görsel kullanım hakkı süreci ve varsayılan yayın süresi.


**Teslim edilecekler**
- Ürün sahibi için karar sayfası: (1) gerekli onay tarafları (öneri: çiftin iki tarafı hesapla bağlı), (2) temsil/diğer kişi görselleri için işletmenin yetki ve kullanım hakkı süreci, (3) varsayılan yayın bitişi (öneri: etkinlikten 7 gün sonrası), (4) `link_only` ve `public_calendar` varsayılan metinleri, (5) yayın görsel kuralları
- Karar `docs/adr/*-yayin-onayi.md`; hukuki metin gerektiren kısımlar K20-06 çıktısıyla ve işletme/uzman onayıyla

**Kabul**
- Ürün sahibi kararları yazılı onaylamıştır veya spec varsayılanlarını kabul ettiğini yazmıştır
- Hukuki yorum yapılmamıştır; ilgili metin 'taslak' işaretlidir

**Oku:** `AGENTS.md`, §13.2, §17.6, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-01](K00-depo-kurallari.md#K00-01), [K00-06](K00-depo-kurallari.md#K00-06), [K00-07](K00-depo-kurallari.md#K00-07), [K10-01](K10-bildirim-eposta-sms.md#K10-01), [K14-01](K14-belge-odeme.md#K14-01), [K15-01](K15-chatbot.md#K15-01), [K17-01](K17-staging-kabul.md#K17-01)

**Bunu bekleyenler:** [K13-02](K13-davetiye-takvim.md#K13-02)

---

<a id="K13-02"></a>
## K13-02 · Sözleşmeler ve ADR: publication DTO'ları, durum makinesi, izinli alan allowlist, paylaşım token'ı

**Boyut:** M · **Dalga:** 23 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-01](K13-davetiye-takvim.md#K13-01), [K05-01](K05-rezervasyon-motoru.md#K05-01), [K04-10](K04-outbox-audit-isci.md#K04-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/contracts/src/publication/`, `packages/domain/src/publication/`, `docs/adr/*-publication-cache.md`

**Teslim edilecekler**
- Durum makinesi: `draft → awaiting_consent → published → revoked / expired`; değişiklik **yeni sürüm ve yeni gerekli onaylar**; görünürlük `private` (varsayılan), `link_only`, `public_calendar`
- İzinli alan **allowlist**: açıkça seçilmiş görünen isimler, tarih/saat, mekânın herkese açık konumu, davetiye metni, seçilmiş yayın görseli — başka alan DTO'ya girmez (tip düzeyinde); onay içeriği hash'i
- `link_only`: yüksek entropili, **hash'i saklanan**, iptal edilebilir token (ADR); listelenmez; `public_calendar` kopyalanabilirlik uyarı metni anahtarları; cache/`noindex` kuralları ADR'de (`noindex` yardımcıdır, erişim kontrolü değildir)
- Ortak sözleşme: K13 tüketici işlerinden önce küçük PR

**Kabul**
- ADR ve sözleşmeler birleşmeden diğer K13 paketleri başlamaz; allowlist dışı alan tip testiyle derlenmez/reddedilir
- K05-10 DTO'sundaki `publicPublicationId` yer tutucusuyla uyumlu
- Bu paketin geçmesi gereken şartname testleri: T-15 (§20.1).

**Kapsam dışı:** DB ve uç noktalar yok.

**Oku:** `AGENTS.md`, §13.2, §9.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-03](K05-rezervasyon-motoru.md#K05-03), [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K07-03](K07-kurumsal-site-icerik.md#K07-03), [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K10-05](K10-bildirim-eposta-sms.md#K10-05), [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04), [K15-02](K15-chatbot.md#K15-02)

**Bunu bekleyenler:** [K13-03](K13-davetiye-takvim.md#K13-03)

---

<a id="K13-03"></a>
## K13-03 · Yayın şeması: invitation_publication, publication_version, publication_consent

**Boyut:** L · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-02](K13-davetiye-takvim.md#K13-02), [K05-03](K05-rezervasyon-motoru.md#K05-03), [K02-04](K02-db-erisim-cekirdegi.md#K02-04)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/publication.ts`, `packages/db/migrations/*_publication_schema.sql`, `packages/db/src/rls/publication.ts`, `tests/integration/db/publication/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `invitation_publication` (event + booking bağlantısı, görünürlük, durum, token hash, bitiş), `publication_version` (**değişmez** içerik + hash), `publication_consent` (`principal`, amaç, hedef kitle, içerik hash/sürümü, zaman, geri alma bilgisi)
- Composite FK (`organization_id + event_id`); onay yalnız ilgili sürüm hash'ine bağlanır; yayımlanmış sürüm güncellenemez; kamu okuma yalnız dar `SECURITY DEFINER` görünümü/fonksiyonu (özel tablolara kamu rolü erişmez)
- RLS, veri envanteri satırları (görünen isimler, yayın görseli, onay kaydı)

**Kabul**
- Onay başka sürüm/hash'e uygulanamaz (DB); kamu rolü özel tabloları okuyamaz (T-10 ile uyumlu)
- Başka düğünün yayınına onay bağlanamaz

**Kapsam dışı:** İş mantığı K13-04'tedir.

**Oku:** `AGENTS.md`, §8, §8.1, §13.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K11-05](K11-medya-temeli.md#K11-05), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K12-01](K12-galeri-oynatici.md#K12-01), [K14-02](K14-belge-odeme.md#K14-02), [K15-03](K15-chatbot.md#K15-03), [K15-05](K15-chatbot.md#K15-05)

**Bunu bekleyenler:** [K13-04](K13-davetiye-takvim.md#K13-04)

---

<a id="K13-04"></a>
## K13-04 · Yayın use-case'leri: taslak, sürüm, gerekli onaylar, durum geçişleri

**Boyut:** L · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-03](K13-davetiye-takvim.md#K13-03), [K03-06](K03-kimlik-uyelik.md#K03-06), [K03-08](K03-kimlik-uyelik.md#K03-08)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/publication/`, `apps/web/app/api/publications/`, `tests/integration/publication/`

**Teslim edilecekler**
- Taslak oluştur, izinli alanları seç, sürüm üret (hash), gerekli onay taraflarını belirle (çiftin iki tarafı hesapla bağlı ve onayı gerekli kişi olarak kayıtlı), `awaiting_consent`; tüm gerekli onaylar tamamlanınca `published`; **içerik değişirse yeni sürüm + yeni onaylar, eski onay geçersiz**
- Personel eksik kişi yerine onay veremez; onay verme yetkisi use-case'te (yalnız ilgili `principal`); temsil/diğer kişi görseli için karar kaydı (K13-01) alanı doldurulmadan yayımlanmaz
- `audit` ve outbox olayları (`publication.*`); `consent_record`/aydınlatma metni sürümü bağlanır

**Kabul**
- T-15: onay yok/eksik veya eski sürüme ait onay → yayınlanmaz; isim ve medya hiçbir kamu yüzeyinde bulunmaz
- Personel onay veremez; sürüm değişince onaylar sıfırlanır
- Bu paketin geçmesi gereken şartname testleri: T-15 (§20.1).

**Kapsam dışı:** Onay endpoint'i K13-05'tedir.

**Oku:** `AGENTS.md`, §13.2, §17.2, §17.6 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-07](K11-medya-temeli.md#K11-07), [K11-13](K11-medya-temeli.md#K11-13), [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K13-05](K13-davetiye-takvim.md#K13-05), [K13-06](K13-davetiye-takvim.md#K13-06), [K13-12](K13-davetiye-takvim.md#K13-12)

---

<a id="K13-05"></a>
## K13-05 · Onay endpoint'i ve geri alma: POST /api/publications/:id/consents

**Boyut:** M · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-04](K13-davetiye-takvim.md#K13-04)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/api/publications/*/consents/`, `packages/application/src/publication/consents/`, `tests/integration/publication/consents/`

**Teslim edilecekler**
- Yalnız ilgili onay tarafı **tam içerik sürümü/hash'ine** onay verir; onay ekranı için metinler (aydınlatma metni gösterimi + `consent_record`); `public_calendar` seçiminde 'internette herkesçe görülebilir ve kopyalanabilir; geri alma önceden indirilmiş kopyayı silemez' uyarısı onayın parçasıdır
- Onay geri alma → yayın kapanır (`revoked`); idempotency; sürüm/hash uyumsuzluğu `409`
- Genel hizmet şartı kabulü onay sayılmaz (test)

**Kabul**
- Eski sürüm hash'i ile onay → `409`; başka kişinin yerine onay → reddedilir; geri alma yayını kapatır
- Aydınlatma metni sürümü onay kaydına yazılır
- Bu paketin geçmesi gereken şartname testleri: T-15 (§20.1).

**Kapsam dışı:** Ekran K13-11'dedir.

**Oku:** `AGENTS.md`, §13.2, §17.6, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K11-08](K11-medya-temeli.md#K11-08), [K11-09](K11-medya-temeli.md#K11-09), [K14-05](K14-belge-odeme.md#K14-05), [K15-04](K15-chatbot.md#K15-04), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

**Bunu bekleyenler:** [K13-07](K13-davetiye-takvim.md#K13-07), [K13-08](K13-davetiye-takvim.md#K13-08), [K13-09](K13-davetiye-takvim.md#K13-09), [K13-11](K13-davetiye-takvim.md#K13-11)

---

<a id="K13-06"></a>
## K13-06 · Yayın medyası: 'izinli davetiye dosyası' sınıfı ve erişim politikası

**Boyut:** M · **Dalga:** 28 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-04](K13-davetiye-takvim.md#K13-04), [K11-12](K11-medya-temeli.md#K11-12), [K11-10](K11-medya-temeli.md#K11-10)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/publication/media/`, `packages/application/src/media/policy/publication.ts`, `tests/integration/publication/media/`

**Teslim edilecekler**
- Yayın görseli yalnız seçilmiş ve işlenmiş (`ready`) asset'ten; türev 'izinli davetiye dosyası' sınıfında; K11-12 `MediaAccessPolicy` kaydına **yayın politikası satırı**: istek anındaki güncel yayın durumu/onay/bitiş denetlenir; özel orijinal asla public değil
- Yayın iptali/bitişinde medya yolu yeni isteklere kapanır; davetiye medyası genel CDN'de uzun cache'lenmez (`private/no-store` veya çok kısa)

**Kabul**
- T-15 medya kısmı: onaysız/eski sürüm medyası hiçbir yolla döndürülmez; T-16 başlangıcı: iptal sonrası medya yolu kapalı
- Medya yolunda başka yayının/özel albümün asset'i erişilemez
- Bu paketin geçmesi gereken şartname testleri: T-15, T-16 (§20.1).

**Kapsam dışı:** Kamu sayfası K13-07'dedir.

**Oku:** `AGENTS.md`, §13.2, §14.1, §14.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-14](K05-rezervasyon-motoru.md#K05-14), [K21-06](K21-yonetim-kabugu-takvim.md#K21-06), [K06-09](K06-talep-ziyaret-teklif.md#K06-09), [K11-14](K11-medya-temeli.md#K11-14), [K12-02](K12-galeri-oynatici.md#K12-02), [K15-07](K15-chatbot.md#K15-07), [K15-09](K15-chatbot.md#K15-09)

**Bunu bekleyenler:** [K13-07](K13-davetiye-takvim.md#K13-07), [K13-09](K13-davetiye-takvim.md#K13-09)

---

<a id="K13-07"></a>
## K13-07 · Kamu davetiye sayfası: GET /davetiye/:publicId ve link_only token

**Boyut:** L · **Dalga:** 29 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-05](K13-davetiye-takvim.md#K13-05), [K13-06](K13-davetiye-takvim.md#K13-06), [K07-01](K07-kurumsal-site-icerik.md#K07-01)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(site)/davetiye/`, `apps/web/src/site/invitation/`, `packages/application/src/publication/public-read/`, `tests/e2e/site-invitation/`, `tests/security/invitation-public/`

**Teslim edilecekler**
- Sunucu bileşeni: yayın politikasına göre (etkin onay, bitiş tarihi, görünürlük) allowlist DTO'dan `InvitationView` + `PublicationMedia`; `link_only`: token doğrulaması (hash karşılaştırma, zamanlama güvenli), listelenmez/sitemap'e girmez/`noindex`; özel alan RSC çıktısında da yok
- `Cache-Control`: davetiye HTML ve medyası genel CDN'de uzun süre cache'lenmez; kamu kurumsal galeri cache kuralı uygulanmaz; `noindex` erişim kontrolü sayılmaz
- Geçersiz/iptal/süresi dolmuş yayın için tutarlı 404/410 (varlık sızdırmayan); token brute-force hız limiti

**Kabul**
- T-15: onaysız veya eski sürüm → isim/medya HTML/RSC/API'de bulunmaz; `link_only` yanlış token → 404
- Yayın URL'si sitemap/arama listelerinde yok (`robots` testi)
- Bu paketin geçmesi gereken şartname testleri: T-15, T-17 (§20.1).

**Kapsam dışı:** Takvim ipucu K13-08/13'tedir.

**Oku:** `AGENTS.md`, §13.2, §17.3, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K21-07](K21-yonetim-kabugu-takvim.md#K21-07), [K06-10](K06-talep-ziyaret-teklif.md#K06-10), [K12-03](K12-galeri-oynatici.md#K12-03), [K12-04](K12-galeri-oynatici.md#K12-04), [K12-05](K12-galeri-oynatici.md#K12-05), [K15-08](K15-chatbot.md#K15-08)

**Bunu bekleyenler:** [K13-09](K13-davetiye-takvim.md#K13-09), [K13-10](K13-davetiye-takvim.md#K13-10), [K13-13](K13-davetiye-takvim.md#K13-13)

---

<a id="K13-08"></a>
## K13-08 · Uygunluk DTO'suna izinli ipucu: publicPublicationId

**Boyut:** M · **Dalga:** 27 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-05](K13-davetiye-takvim.md#K13-05), [K05-10](K05-rezervasyon-motoru.md#K05-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/booking/availability/public-hints.ts`, `tests/integration/publication/availability-hint/`

**Teslim edilecekler**
- K05-10 DTO'sundaki `publicPublicationId` yer tutucusunu doldurur: yalnız **kesin rezervasyon + `public_calendar` + yayımlanmış** slotlarda; diğer her durumda `Rezerve/Uygun değil` genel gösterimi; özel kimlik/sayı çıkarımı yok
- İptal/yayın iptali sonrası ipucu hemen kapanır; anonim kısa ömürlü teknik önbellek sınırı (≤15 sn) korunur

**Kabul**
- T-15/T-16: yayınsız, onaysız veya iptal edilmiş slot ipucu vermez; DTO allowlist testi geçer
- K05-10 testleri (müşteri bilgisi sızıntısı) değişmeden yeşil
- Bu paketin geçmesi gereken şartname testleri: T-15, T-16 (§20.1).

**Kapsam dışı:** UI K13-13'tedir.

**Oku:** `AGENTS.md`, §9.4, §13.1, §13.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-13](K05-rezervasyon-motoru.md#K05-13), [K21-05](K21-yonetim-kabugu-takvim.md#K21-05), [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K11-10](K11-medya-temeli.md#K11-10), [K11-11](K11-medya-temeli.md#K11-11), [K15-06](K15-chatbot.md#K15-06), [K17-03](K17-staging-kabul.md#K17-03)

**Bunu bekleyenler:** [K13-13](K13-davetiye-takvim.md#K13-13)

---

<a id="K13-09"></a>
## K13-09 · İptal ve süre dolumu: yayın kapatma, cache temizliği, medya erişimi

**Boyut:** L · **Dalga:** 30 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-05](K13-davetiye-takvim.md#K13-05), [K13-06](K13-davetiye-takvim.md#K13-06), [K13-07](K13-davetiye-takvim.md#K13-07), [K05-07](K05-rezervasyon-motoru.md#K05-07)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/publication/revocation/`, `apps/worker/src/jobs/publication-expiry.ts`, `tests/integration/publication/revocation/`

**Teslim edilecekler**
- İzin geri alma veya rezervasyon iptali (`booking.cancelled.v1`) ilgili yayını kapatır (`revoked`); süre dolumu işi (öneri etkinlikten 7 gün sonrası, kullanıcı daha kısa seçebilir) `expired`; her ikisi `publication.revoked.v1` yayar
- Yeni istekler yayın servisinde reddedilir; ilişkili medya yayın denetiminden geçer; aktif cache'ler (sayfa/etiket) temizlenir; gizli origin bağlantısı açığa çıkmaz
- Tekrarlanan iptal/süre olayı idempotent; worker kapalıyken süre dolumu **okuma yolunda** da doğrulanır (K13-07)

**Kabul**
- T-16: yayın iptali sonrası doğrudan URL, önizleme ve media yolu yeni isteklerde kapalı; cache karışması yok
- Rezervasyon iptali yayını kapatır; worker kapalıyken bitmiş yayın okunmaz
- Bu paketin geçmesi gereken şartname testleri: T-16 (§20.1).

**Kapsam dışı:** Silme/arşivleme ayrı karardır (K19/KVKK).

**Oku:** `AGENTS.md`, §13.2, §14.4, §18.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-11](K06-talep-ziyaret-teklif.md#K06-11), [K06-14](K06-talep-ziyaret-teklif.md#K06-14), [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-03](K08-dugunum-pano-onay.md#K08-03), [K08-04](K08-dugunum-pano-onay.md#K08-04), [K12-06](K12-galeri-oynatici.md#K12-06), [K13-13](K13-davetiye-takvim.md#K13-13), [K15-10](K15-chatbot.md#K15-10)

**Bunu bekleyenler:** [K13-12](K13-davetiye-takvim.md#K13-12), [K13-14](K13-davetiye-takvim.md#K13-14), [K16-07](K16-yonetim-butunlestirme.md#K16-07)

---

<a id="K13-10"></a>
## K13-10 · Cache izolasyonu denetimi: iki kullanıcı, aynı URL (T-17)

**Boyut:** M · **Dalga:** 33 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-07](K13-davetiye-takvim.md#K13-07), [K08-10](K08-dugunum-pano-onay.md#K08-10), [K08-11](K08-dugunum-pano-onay.md#K08-11)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/security/cache-isolation/`, `apps/web/src/security/cache-headers/`, `docs/reports/K13-cache.md`

**Teslim edilecekler**
- Özel/yarı özel yüzeylerin (müşteri sayfaları, davetiye, API, RSC yükleri, medya geçidi) `Cache-Control`/`Vary`/framework cache davranışının tek yerde (yardımcı + test) tanımı; **rota kayıt dosyası** `tests/security/cache-isolation/routes.ts` (sonraki kartlar kendi rotalarını satır ekleyerek kaydeder)
- Test: iki farklı oturum aynı URL'yi tekrar tekrar ister (CDN/Next fetch/data cache simülasyonu); kişiye özel veri diğerine taşınmaz

**Kabul**
- T-17: tüm kayıtlı rotalarda kişiye özel veri başka oturuma taşınmaz; CDN'e uygun olmayan rotalar `no-store`
- Yeni rota kaydı olmayan portal sayfası CI uyarısı üretir (kayıt eksik denetimi)
- Bu paketin geçmesi gereken şartname testleri: T-17 (§20.1).

**Kapsam dışı:** K14 ve sonraki kartlar rotalarını kayıt dosyasına satır olarak ekler.

**Oku:** `AGENTS.md`, §17.3, §13.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K07-10](K07-kurumsal-site-icerik.md#K07-10), [K08-13](K08-dugunum-pano-onay.md#K08-13), [K09-05](K09-sohbet-canli-akis.md#K09-05), [K09-06](K09-sohbet-canli-akis.md#K09-06), [K10-06](K10-bildirim-eposta-sms.md#K10-06), [K11-15](K11-medya-temeli.md#K11-15), [K13-12](K13-davetiye-takvim.md#K13-12), [K14-07](K14-belge-odeme.md#K14-07), [K14-08](K14-belge-odeme.md#K14-08)

**Bunu bekleyenler:** [K13-14](K13-davetiye-takvim.md#K13-14), [K16-10](K16-yonetim-butunlestirme.md#K16-10), [K17-05](K17-staging-kabul.md#K17-05)

---

<a id="K13-11"></a>
## K13-11 · Müşteri ekranı: yayın tercihi ve onay (PublicationConsent)

**Boyut:** L · **Dalga:** 32 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-05](K13-davetiye-takvim.md#K13-05), [K06-15](K06-talep-ziyaret-teklif.md#K06-15)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(customer)/dugunum/davetiye/`, `apps/web/src/customer/publication/`, `apps/web/src/customer/nav/davetiye.ts`, `tests/e2e/customer-publication/`

**Teslim edilecekler**
- Davetiye yayını önerisi (hangi alanlar, hangi görünürlük), **tam içerik önizlemesi**, 'herkese açık/kopyalanabilir' uyarısı, onay ve geri alma; her gerekli taraf kendi hesabıyla onaylar; bekleyen kişi durumu görünür
- Yükleniyor/boş/hata/yetkisiz durumları; mobil/klavye; yakın rolü yayın onayı veremez

**Kabul**
- Playwright: iki taraf onaylar → yayınlanır; biri geri alır → kapanır; yakın rolü onay düğmesi görmez
- Eski sürüm ekranı onaylanamaz (409 iletisi)

**Kapsam dışı:** Personel hazırlama ekranı K13-12'dedir.

**Oku:** `AGENTS.md`, §13.2, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-16](K06-talep-ziyaret-teklif.md#K06-16), [K08-10](K08-dugunum-pano-onay.md#K08-10), [K08-11](K08-dugunum-pano-onay.md#K08-11), [K08-12](K08-dugunum-pano-onay.md#K08-12), [K09-03](K09-sohbet-canli-akis.md#K09-03), [K09-04](K09-sohbet-canli-akis.md#K09-04), [K14-06](K14-belge-odeme.md#K14-06)

**Bunu bekleyenler:** [K13-14](K13-davetiye-takvim.md#K13-14), [K16-09](K16-yonetim-butunlestirme.md#K16-09)

---

<a id="K13-12"></a>
## K13-12 · Yönetim ekranı: PublicationManager sekmesi

**Boyut:** L · **Dalga:** 33 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-04](K13-davetiye-takvim.md#K13-04), [K13-09](K13-davetiye-takvim.md#K13-09), [K21-03](K21-yonetim-kabugu-takvim.md#K21-03), [K08-12](K08-dugunum-pano-onay.md#K08-12)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/publication/`, `apps/web/app/(admin)/dugunler/*/davetiye/`, `tests/e2e/admin-publication/`

**Teslim edilecekler**
- EventWorkspace sekmesi (K08-12 `registerWorkspaceTab`): yayın taslağı hazırlama, izinli alan seçimi, onay durumu (kim bekliyor), sürüm geçmişi, iptal; personel eksik kişi yerine onay veremez (düğme yok, API 403)
- Yükleniyor/boş/hata/yetkisiz durumları; izin: `publication.manage`

**Kabul**
- Playwright: taslak → onay bekleniyor → yayınlandı; iptal sonrası kamu sayfası kapanır
- İzinsiz personelde sekme yok

**Kapsam dışı:** Müşteri ekranı K13-11'dedir.

**Oku:** `AGENTS.md`, §13.2, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K07-10](K07-kurumsal-site-icerik.md#K07-10), [K08-13](K08-dugunum-pano-onay.md#K08-13), [K09-05](K09-sohbet-canli-akis.md#K09-05), [K09-06](K09-sohbet-canli-akis.md#K09-06), [K10-06](K10-bildirim-eposta-sms.md#K10-06), [K11-15](K11-medya-temeli.md#K11-15), [K13-10](K13-davetiye-takvim.md#K13-10), [K14-07](K14-belge-odeme.md#K14-07), [K14-08](K14-belge-odeme.md#K14-08)

**Bunu bekleyenler:** [K13-14](K13-davetiye-takvim.md#K13-14), [K16-08](K16-yonetim-butunlestirme.md#K16-08)

---

<a id="K13-13"></a>
## K13-13 · Takvim nüansı: PublicEventHint, hover/focus/dokunma kartı ve davetiye bağlantısı

**Boyut:** L · **Dalga:** 30 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-07](K13-davetiye-takvim.md#K13-07), [K13-08](K13-davetiye-takvim.md#K13-08), [K07-05](K07-kurumsal-site-icerik.md#K07-05)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/site/availability/public-event-hint.tsx`, `apps/web/src/site/availability/hint-card.tsx`, `tests/e2e/site-event-hint/`

**Teslim edilecekler**
- Kesin rezervasyon + onaylı herkese açık yayında slotta küçük çiçek/zarif işaret; hover/focus ile izinli kısa başlık; **dokunma/Enter ile aynı kart** (bilgi yalnız hover'a bağlı değil); tıklayınca `/davetiye/:publicId`; hafif CSS geçişi, `prefers-reduced-motion`
- Uygun / uygun değil / ipucu durumları; 'dolu tarihe gelmek kendiliğinden özel müşteri verisi istemez'; K07-05 bileşenine yalnız işaret/slot kartı kaydı eklenir

**Kabul**
- Playwright: klavye + mobil dokunma + azaltılmış hareket; ipucu yokken yalnız 'Rezerve/Uygun değil'
- Ağ yanıtında izinsiz alan yok
- Bu paketin geçmesi gereken şartname testleri: T-30 (§20.1).

**Kapsam dışı:** Davetiye sayfası K13-07'dedir.

**Oku:** `AGENTS.md`, §13.1, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-11](K06-talep-ziyaret-teklif.md#K06-11), [K06-14](K06-talep-ziyaret-teklif.md#K06-14), [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-03](K08-dugunum-pano-onay.md#K08-03), [K08-04](K08-dugunum-pano-onay.md#K08-04), [K12-06](K12-galeri-oynatici.md#K12-06), [K13-09](K13-davetiye-takvim.md#K13-09), [K15-10](K15-chatbot.md#K15-10)

**Bunu bekleyenler:** [K13-14](K13-davetiye-takvim.md#K13-14)

---

<a id="K13-14"></a>
## K13-14 · K13 güvenlik/kabul paketi ve rapor (T-15, T-16, T-17)

**Boyut:** M · **Dalga:** 34 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K13-09](K13-davetiye-takvim.md#K13-09), [K13-10](K13-davetiye-takvim.md#K13-10), [K13-11](K13-davetiye-takvim.md#K13-11), [K13-12](K13-davetiye-takvim.md#K13-12), [K13-13](K13-davetiye-takvim.md#K13-13)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `tests/security/publication-acceptance/`, `tests/e2e/publication-acceptance/`, `docs/reports/K13-kabul.md`

**Teslim edilecekler**
- Tek komut `pnpm test:publication`: T-15 (onay yok/eski sürüm: isim ve medya API/HTML/RSC'de yok), T-16 (iptal sonrası URL/önizleme/medya), T-17; sürüm değişiminde eski onay geçersiz; onaysız isim DOM'da yok
- `K13-kabul.md`: kamu DTO allowlist özeti, cache davranışı, bilinen sınırlar, inceleyici odak listesi (§21.3)

**Kabul**
- Üç test grubu CI'da yeşil; çalıştırılamayan varsa nedeni yazılı
- **§21.3 insan incelemesi** için PR açıklamasında odaklar: yayın/onay modeli, özel→kamu DTO ayrımı, iptal ve cache
- Bu paketin geçmesi gereken şartname testleri: T-15, T-16, T-17 (§20.1).

**Kapsam dışı:** Medya tarafı testleri K11-16'dadır.

**Oku:** `AGENTS.md`, §13, §17.3, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K08-15](K08-dugunum-pano-onay.md#K08-15), [K09-07](K09-sohbet-canli-akis.md#K09-07), [K09-08](K09-sohbet-canli-akis.md#K09-08), [K10-07](K10-bildirim-eposta-sms.md#K10-07), [K10-14](K10-bildirim-eposta-sms.md#K10-14), [K11-16](K11-medya-temeli.md#K11-16), [K14-09](K14-belge-odeme.md#K14-09)

**Bunu bekleyenler:** [K15-11](K15-chatbot.md#K15-11), [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K17-09](K17-staging-kabul.md#K17-09)

---
