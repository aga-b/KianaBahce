# K14 — Belgeler ve ödeme takibi

**Kilometre taşı:** M4 — Medya ve yayın (K11–K15) · **Şartname:** §7.2, §8, §10.5 · [Plan dizini](README.md)

> Sürümlü özel belge, finans izinleri, vade planı, ödeme/tahsilat ve ters kayıt, onaylı teklif bağlantısı, KDV oranı/tutarı ve fatura referansı; müşteri ve personel ekranları.

Ödeme planı takip amaçlıdır; platform e-Fatura/e-Arşiv düzenlemez ve vergi hesabı sorumluluğu üstlenmez. Geçmiş ödeme **silinip değiştirilmez**: düzeltme ters kayıt + yeni kayıtla. Müşterinin yüklediği dekont otomatik ödeme kanıtı sayılmaz. Para kayan noktalı değildir (küçük birim tam sayı + ISO para birimi). Yakın rolü finans/belge göremez.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K14-01](K14-belge-odeme.md#K14-01) · Karar: KDV oranları, para birimi ve fatura referans süreci | S | 0 | — | ürün sahibi girdisi, karar |
| [K14-02](K14-belge-odeme.md#K14-02) · Sözleşmeler: para/KDV hesabı, belge ve ödeme DTO'ları, finans izinleri | M | 24 | K14-01, K06-01, K04-10 |  |
| [K14-03](K14-belge-odeme.md#K14-03) · Belge şeması: document, document_version, erişim grubu | M | 25 | K14-02, K11-03 | migration |
| [K14-04](K14-belge-odeme.md#K14-04) · Ödeme şeması: payment_schedule, payment_entry (append-only), KDV ve fatura referansı | M | 25 | K14-02, K06-07 | migration |
| [K14-05](K14-belge-odeme.md#K14-05) · Belge use-case'leri: sürüm, erişim grubu ve medya geçidi politikası | L | 26 | K14-03, K11-07, K11-12 |  |
| [K14-06](K14-belge-odeme.md#K14-06) · Ödeme planı, tahsilat ve ters kayıt use-case'leri | L | 32 | K14-04, K08-09, K04-04 |  |
| [K14-07](K14-belge-odeme.md#K14-07) · Müşteri ekranları: DocumentList, PaymentSchedule, PaymentHistory, dekont bildirimi | L | 33 | K14-05, K14-06, K06-15 |  |
| [K14-08](K14-belge-odeme.md#K14-08) · Personel ekranları: belge yönetimi, ödeme planı, tahsilat ve ters kayıt | L | 33 | K14-05, K14-06, K21-03, K08-12 |  |
| [K14-09](K14-belge-odeme.md#K14-09) · K14 güvenlik/kabul paketi ve rapor (T-08, T-26, T-31) | M | 34 | K14-07, K14-08 | doküman |

<a id="K14-01"></a>
## K14-01 · Karar: KDV oranları, para birimi ve fatura referans süreci

**Boyut:** S · **Dalga:** 0 · **Tür:** karar
**Başlamadan önce `main`'de olması gerekenler:** yok
**Ürün sahibinden gereken:** KDV oranları, yuvarlama, fatura referans süreci ve ödeme yöntemleri.


**Dokunabileceğin yollar (yalnız bunlar):** `docs/adr/`, `docs/reports/` (yalnız bu kararın kaydı).

**Teslim edilecekler**
- Ürün sahibi/mali müşavir için karar sayfası: KDV oranları (kodda sabitlenmez, yapılandırılır), varsayılan para birimi (öneri TRY), fiyat girişi KDV hariç mi dahil mi, yuvarlama kuralı, fatura referansı süreci (resmi fatura işletmenin mali müşavir sürecinde kesilir; platforma numara/tarih/belge bağlantısı girilir), ödeme yöntemleri listesi
- Karar `docs/adr/*-kdv-fatura.md`; hukuki/mali yorum yapılmaz

**Kabul**
- Ürün sahibi kararları yazılı onaylamış; oranlar yapılandırma değeri olarak kayıtlı (kodda sabit değil)
- Platformun fatura kesmediği açıkça yazılı

**Oku:** `AGENTS.md`, §10.5, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-01](K00-depo-kurallari.md#K00-01), [K00-06](K00-depo-kurallari.md#K00-06), [K00-07](K00-depo-kurallari.md#K00-07), [K10-01](K10-bildirim-eposta-sms.md#K10-01), [K13-01](K13-davetiye-takvim.md#K13-01), [K15-01](K15-chatbot.md#K15-01), [K17-01](K17-staging-kabul.md#K17-01)

**Bunu bekleyenler:** [K14-02](K14-belge-odeme.md#K14-02)

---

<a id="K14-02"></a>
## K14-02 · Sözleşmeler: para/KDV hesabı, belge ve ödeme DTO'ları, finans izinleri

**Boyut:** M · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K14-01](K14-belge-odeme.md#K14-01), [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K04-10](K04-outbox-audit-isci.md#K04-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/contracts/src/finance/`, `packages/domain/src/finance/`, `packages/application/src/ports/finance.ts`

**Teslim edilecekler**
- K06-01 ortak money yardımcısını genişletir: KDV oranı, **hariç + KDV = dahil** tutarlılık kuralı ve küçük birimde yuvarlama; para birimleri sessizce toplanmaz
- DTO'lar: `Document`, `DocumentVersion`, `PaymentSchedule`, `PaymentEntry` (tahsilat/tahsis/ters kayıt), fatura referansı alanları; durum makineleri
- İzin sözlüğü eklemeleri (`document.manage`, `finance.view`, `finance.record`) küçük PR olarak K02-03 sözlüğüne; **yakın rolü finans/belge izinleri varsayılan yok**
- Ortak sözleşme: K14 tüketici işlerinden önce küçük PR

**Kabul**
- Tablo testleri: hariç + KDV = dahil tutarlılığı, yuvarlama, çoklu para birimi karışımı reddi
- KDV oranları yapılandırmadan okunur (kodda sabit sayı yok)
- Bu paketin geçmesi gereken şartname testleri: T-31 (§20.1).

**Kapsam dışı:** DB ve ekran yok.

**Oku:** `AGENTS.md`, §8, §10.5, §7.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K11-05](K11-medya-temeli.md#K11-05), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K12-01](K12-galeri-oynatici.md#K12-01), [K13-03](K13-davetiye-takvim.md#K13-03), [K15-03](K15-chatbot.md#K15-03), [K15-05](K15-chatbot.md#K15-05)

**Bunu bekleyenler:** [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

---

<a id="K14-03"></a>
## K14-03 · Belge şeması: document, document_version, erişim grubu

**Boyut:** M · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K14-02](K14-belge-odeme.md#K14-02), [K11-03](K11-medya-temeli.md#K11-03)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/documents.ts`, `packages/db/migrations/*_documents_schema.sql`, `packages/db/src/rls/documents.ts`, `tests/integration/db/documents/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `document` (düğün/teklif bağlamı, tür, erişim grubu), `document_version` (medya referansı, değişmez sürüm, hash), `document_access` (izinli kişi/grup); composite FK (`organization_id + event_id`)
- RLS: yalnız izinli üye/personel; yakın rolü varsayılan dışı; veri envanteri satırları (belge içeriği/adı)

**Kabul**
- B'nin belge satırı A için RLS ile görünmez; sürüm içeriği güncellenemez (yeni sürüm eklenir)
- Erişim grubu dışındaki üye belgeyi/metadata'sını okuyamaz

**Kapsam dışı:** Ödeme şeması K14-04'tedir.

**Oku:** `AGENTS.md`, §8, §8.1, §10.5 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-07](K11-medya-temeli.md#K11-07), [K11-13](K11-medya-temeli.md#K11-13), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K14-05](K14-belge-odeme.md#K14-05)

---

<a id="K14-04"></a>
## K14-04 · Ödeme şeması: payment_schedule, payment_entry (append-only), KDV ve fatura referansı

**Boyut:** M · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K14-02](K14-belge-odeme.md#K14-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/payments.ts`, `packages/db/migrations/*_payments_schema.sql`, `packages/db/src/rls/payments.ts`, `tests/integration/db/payments/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `payment_schedule` (vade planı, sürüm, **kabul edilen `offer_version`** bağlantısı), `payment_entry` (planlanan/tahsilat/tahsis/**ters kayıt**; küçük birim tam sayı + ISO para birimi; KDV oranı, KDV hariç/dahil; fatura referansı numara/tarih/belge bağlantısı)
- `payment_entry` **append-only** (UPDATE/DELETE yetkisi yok, tetikleyici/yetkiyle zorlanır); tutar tutarlılık CHECK kısıtı; idempotency anahtarı benzersiz; composite FK
- RLS: yakın rolü okuyamaz; finans izni; veri envanteri satırları

**Kabul**
- Mevcut ödeme kaydı güncellenemez/silinemez (DB); hariç + KDV ≠ dahil olan satır eklenemez
- Aynı idempotency anahtarıyla ikinci tahsilat satırı eklenemez (T-31 temeli)
- Bu paketin geçmesi gereken şartname testleri: T-31 (§20.1).

**Kapsam dışı:** Use-case'ler K14-06'dadır.

**Oku:** `AGENTS.md`, §8, §10.5 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-07](K11-medya-temeli.md#K11-07), [K11-13](K11-medya-temeli.md#K11-13), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-03](K14-belge-odeme.md#K14-03)

**Bunu bekleyenler:** [K14-06](K14-belge-odeme.md#K14-06)

---

<a id="K14-05"></a>
## K14-05 · Belge use-case'leri: sürüm, erişim grubu ve medya geçidi politikası

**Boyut:** L · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K14-03](K14-belge-odeme.md#K14-03), [K11-07](K11-medya-temeli.md#K11-07), [K11-12](K11-medya-temeli.md#K11-12)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/documents/`, `apps/web/app/api/documents/`, `apps/web/app/api/admin/documents/`, `packages/application/src/media/policy/documents.ts`, `tests/integration/documents/`

**Teslim edilecekler**
- Belge oluştur/yeni sürüm yükle (K11 upload intent, PDF 20 MB, **güvenli indirme**, aktif içerikli gömme yok), erişim grubu atama, sürüm geçmişi; indirme **yalnız K11-12 geçidi** üzerinden: politika satırı (belge izni + üyelik + sürüm erişimi)
- Kişi adı/telefon dosya anahtarında/URL'sinde yok; belge adı kaçışlanır (T-34); audit
- Belge erişim kaldırılınca yeni istekler reddedilir

**Kabul**
- T-08 belge kısmı: Müşteri A, B'nin belge ID'sini dener → hiçbir içerik/metadata dönmez; yakın rolü izinsiz belge açamaz
- Doğrudan origin/signed URL yok; indirme geçitten
- Bu paketin geçmesi gereken şartname testleri: T-08, T-34 (§20.1).

**Kapsam dışı:** Ödeme K14-06'dadır.

**Oku:** `AGENTS.md`, §10.5, §14.4, §17.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K11-08](K11-medya-temeli.md#K11-08), [K11-09](K11-medya-temeli.md#K11-09), [K13-05](K13-davetiye-takvim.md#K13-05), [K15-04](K15-chatbot.md#K15-04), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

**Bunu bekleyenler:** [K14-07](K14-belge-odeme.md#K14-07), [K14-08](K14-belge-odeme.md#K14-08)

---

<a id="K14-06"></a>
## K14-06 · Ödeme planı, tahsilat ve ters kayıt use-case'leri

**Boyut:** L · **Dalga:** 32 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K14-04](K14-belge-odeme.md#K14-04), [K08-09](K08-dugunum-pano-onay.md#K08-09), [K04-04](K04-outbox-audit-isci.md#K04-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/payments/`, `apps/web/app/api/payments/`, `apps/web/app/api/admin/payments/`, `tests/integration/payments/`

**Teslim edilecekler**
- Vade planı oluştur/sürümle (sözleşme/finans düzenlemeleri yetki + gerekçe + audit; **önemli değişiklik K08-09 onay mekanizmasıyla** yetkili onaylayıcıya), kabul edilen teklif sürümüne bağlama (K06-08/09 kabul kaydı)
- Tahsilat kaydı **finans yetkilisince doğrulanır**; müşterinin yüklediği dekont yalnız 'ödeme bildirimi' (otomatik kanıt değil, ödeme kesinleşmez); düzeltme **ters kayıt + yeni kayıt**; geçmiş silinip değiştirilmez
- Komut idempotency (`Idempotency-Key`): tekrarlanan komut kopya tahsilat kaydı üretmez; sürüm çakışması `409`; fatura referansı kaydı (numara/tarih/belge bağlantısı)

**Kabul**
- T-31: ödeme düzeltmesi ve tekrarlanan komut → tutar tutarlı, ters kayıt korunur, kopya tahsilat yok
- T-26: eski plan/teklif sürümüyle güncelleme → `409`; dekont yüklemesi ödemeyi kesinleştirmez
- Bu paketin geçmesi gereken şartname testleri: T-26, T-31 (§20.1).

**Kapsam dışı:** Ekranlar K14-07/08'dedir.

**Oku:** `AGENTS.md`, §10.5, §17.2, §18.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-16](K06-talep-ziyaret-teklif.md#K06-16), [K08-10](K08-dugunum-pano-onay.md#K08-10), [K08-11](K08-dugunum-pano-onay.md#K08-11), [K08-12](K08-dugunum-pano-onay.md#K08-12), [K09-03](K09-sohbet-canli-akis.md#K09-03), [K09-04](K09-sohbet-canli-akis.md#K09-04), [K13-11](K13-davetiye-takvim.md#K13-11)

**Bunu bekleyenler:** [K14-07](K14-belge-odeme.md#K14-07), [K14-08](K14-belge-odeme.md#K14-08)

---

<a id="K14-07"></a>
## K14-07 · Müşteri ekranları: DocumentList, PaymentSchedule, PaymentHistory, dekont bildirimi

**Boyut:** L · **Dalga:** 33 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K14-05](K14-belge-odeme.md#K14-05), [K14-06](K14-belge-odeme.md#K14-06), [K06-15](K06-talep-ziyaret-teklif.md#K06-15)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(customer)/dugunum/belgeler/`, `apps/web/app/(customer)/dugunum/odemeler/`, `apps/web/src/customer/documents/`, `apps/web/src/customer/payments/`, `apps/web/src/customer/nav/belgeler-odemeler.ts`, `tests/e2e/customer-finance/`

**Teslim edilecekler**
- İzinli belgeler listesi/indirme (geçit), ödeme planı, ödeme geçmişi (tahsilat/ters kayıt ayrı görünür), KDV hariç/dahil gösterimi, dekont/ödeme bildirimi yükleme (durum 'doğrulama bekliyor')
- **Yakın rolü bu sayfaları ve menü öğelerini görmez**; yükleniyor/boş/hata/yetkisiz durumları; rotalar `cache-isolation` kayıt dosyasına eklenir
- Resmi fatura olmadığı notu; fatura referansı varsa gösterilir

**Kabul**
- Playwright: çift üyesi belge/ödeme görür, yakın rolü göremez (UI ve API); dekont yükleme ödemeyi kesinleştirmez
- Başka düğünün belge/ödeme URL'si açılamaz
- Bu paketin geçmesi gereken şartname testleri: T-08 (§20.1).

**Kapsam dışı:** Personel ekranı K14-08'dedir.

**Oku:** `AGENTS.md`, §10.5, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K07-10](K07-kurumsal-site-icerik.md#K07-10), [K08-13](K08-dugunum-pano-onay.md#K08-13), [K09-05](K09-sohbet-canli-akis.md#K09-05), [K09-06](K09-sohbet-canli-akis.md#K09-06), [K10-06](K10-bildirim-eposta-sms.md#K10-06), [K11-15](K11-medya-temeli.md#K11-15), [K13-10](K13-davetiye-takvim.md#K13-10), [K13-12](K13-davetiye-takvim.md#K13-12), [K14-08](K14-belge-odeme.md#K14-08)

**Bunu bekleyenler:** [K14-09](K14-belge-odeme.md#K14-09), [K16-09](K16-yonetim-butunlestirme.md#K16-09)

---

<a id="K14-08"></a>
## K14-08 · Personel ekranları: belge yönetimi, ödeme planı, tahsilat ve ters kayıt

**Boyut:** L · **Dalga:** 33 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K14-05](K14-belge-odeme.md#K14-05), [K14-06](K14-belge-odeme.md#K14-06), [K21-03](K21-yonetim-kabugu-takvim.md#K21-03), [K08-12](K08-dugunum-pano-onay.md#K08-12)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/documents/`, `apps/web/src/admin/payments/`, `apps/web/app/(admin)/dugunler/*/belgeler/`, `apps/web/app/(admin)/dugunler/*/odemeler/`, `tests/e2e/admin-finance/`

**Teslim edilecekler**
- EventWorkspace sekmeleri (`registerWorkspaceTab`): Belgeler, Ödemeler; vade planı sürümleme, tahsilat doğrulama, ters kayıt + yeni kayıt akışı, fatura referansı girişi, dekont bildirimlerini inceleme; yalnız `finance.*`/`document.manage` izniyle
- Her hassas aksiyonda gerekçe ve onay ekranı; yükleniyor/boş/hata/yetkisiz durumları

**Kabul**
- Playwright: finans izinli personel tahsilat doğrular ve ters kayıt açar; izinsiz personelde sekme yok ve API 403
- Çift tıklama tek kayıt üretir (idempotency)

**Kapsam dışı:** Rol/izin paketi düzenleme K16'dadır.

**Oku:** `AGENTS.md`, §7.2, §10.5, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K07-10](K07-kurumsal-site-icerik.md#K07-10), [K08-13](K08-dugunum-pano-onay.md#K08-13), [K09-05](K09-sohbet-canli-akis.md#K09-05), [K09-06](K09-sohbet-canli-akis.md#K09-06), [K10-06](K10-bildirim-eposta-sms.md#K10-06), [K11-15](K11-medya-temeli.md#K11-15), [K13-10](K13-davetiye-takvim.md#K13-10), [K13-12](K13-davetiye-takvim.md#K13-12), [K14-07](K14-belge-odeme.md#K14-07)

**Bunu bekleyenler:** [K14-09](K14-belge-odeme.md#K14-09), [K16-08](K16-yonetim-butunlestirme.md#K16-08)

---

<a id="K14-09"></a>
## K14-09 · K14 güvenlik/kabul paketi ve rapor (T-08, T-26, T-31)

**Boyut:** M · **Dalga:** 34 · **Tür:** doküman
**Başlamadan önce `main`'de olması gerekenler:** [K14-07](K14-belge-odeme.md#K14-07), [K14-08](K14-belge-odeme.md#K14-08)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/security/finance-acceptance/`, `tests/e2e/finance-acceptance/`, `docs/reports/K14-kabul.md`

**Teslim edilecekler**
- Tek komut `pnpm test:finance`: T-08 (belge/ödeme kimlikleri), T-26 (eski sürüm), T-31 (düzeltme + tekrar), hariç + KDV = dahil tutarlılık tablosu, yakın rolü finans göremez, dekont ödeme kesinleştirmez, geçmiş kayıt değiştirilemez
- `K14-kabul.md`: kapsam, KDV/fatura sınırı notu, bilinen sınırlar

**Kabul**
- Üç test grubu + tutarlılık testleri CI'da yeşil; çalıştırılamayan varsa nedeni yazılı
- Bu paketin geçmesi gereken şartname testleri: T-08, T-26, T-31 (§20.1).

**Kapsam dışı:** Kod değişikliği yalnız test/rapor.

**Oku:** `AGENTS.md`, §10.5, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K08-15](K08-dugunum-pano-onay.md#K08-15), [K09-07](K09-sohbet-canli-akis.md#K09-07), [K09-08](K09-sohbet-canli-akis.md#K09-08), [K10-07](K10-bildirim-eposta-sms.md#K10-07), [K10-14](K10-bildirim-eposta-sms.md#K10-14), [K11-16](K11-medya-temeli.md#K11-16), [K13-14](K13-davetiye-takvim.md#K13-14)

**Bunu bekleyenler:** [K15-11](K15-chatbot.md#K15-11), [K16-11](K16-yonetim-butunlestirme.md#K16-11)

---
