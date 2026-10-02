# K11 — Güvenli dosya ve medya temeli

**Kilometre taşı:** M4 — Medya ve yayın (K11–K15) · **Şartname:** §14, §17.3, §17.4 · [Plan dizini](README.md)

> Yükleme izni ve boyut zorlaması, karantina, ayrı ClamAV, izole sharp/FFmpeg işçisi, asset/türev şeması, özel medya geçidi (HLS/Range dahil), arşiv adaptör sözleşmesi ve medya yönetim ekranı.

K11, K04-10 sonrası K05 ile paralel başlayabilir (yalnız K02–K04'e bağlıdır). **§21.3 insan incelemesi:** upload izni ve boyut zorlaması, karantina, medya geçidi yetkisi, işçi izolasyonu. Taranamayan veya tarama servisine ulaşılamayan dosya asla `ready` olmaz. Özel dosya public CDN'e/bucket ACL'ine taşınmaz; orijinalin ACL'i public yapılmaz. Gerçek otomatik cold storage geçişi bu kartta yoktur (yalnız adaptör ve durum modeli).

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K11-01](K11-medya-temeli.md#K11-01) · Karar: nesne depolama sağlayıcısı, bölge ve staging bucket'ları | S | 2 | K01-08 | ürün sahibi girdisi, karar |
| [K11-02](K11-medya-temeli.md#K11-02) · Sözleşmeler ve ADR: ObjectStorage portu, medya durumları, limitler, yükleme yöntemi | M | 22 | K04-10 |  |
| [K11-03](K11-medya-temeli.md#K11-03) · Medya şeması: media_asset, media_variant, upload_intent, retention_policy, media_restore_job | L | 23 | K11-02, K02-04 | migration |
| [K11-04](K11-medya-temeli.md#K11-04) · S3 uyumlu depolama adaptörü (yerel S3 uyumlu servisle test) | L | 23 | K11-02 |  |
| [K11-05](K11-medya-temeli.md#K11-05) · Staging bucket yapılandırması: IAM ayrımı, anonim liste kapalı, yaşam döngüsü | M | 24 | K11-04, K11-01, K01-09 |  |
| [K11-06](K11-medya-temeli.md#K11-06) · Upload intent API: yetki, kota, MIME, boyutu zorlayan izin | L | 24 | K11-03, K11-04, K03-07, K04-04 | insan inceleme |
| [K11-07](K11-medya-temeli.md#K11-07) · Yükleme tamamlama: HEAD boyut doğrulaması, MIME/imza kontrolü, süre dolumu temizliği | L | 25 | K11-06, K04-05 | insan inceleme |
| [K11-08](K11-medya-temeli.md#K11-08) · Büyük dosya: çok parçalı, devam ettirilebilir yükleme | L | 26 | K11-07 |  |
| [K11-09](K11-medya-temeli.md#K11-09) · İzole medya işçisi iskeleti ve ClamAV servisi (taranamayan dosya ready olmaz) | L | 26 | K11-07, K01-03, K01-07, K04-05 | insan inceleme |
| [K11-10](K11-medya-temeli.md#K11-10) · Fotoğraf işleme: decoder doğrulaması, bomba limiti, türevler, EXIF/GPS temizliği | L | 27 | K11-09 |  |
| [K11-11](K11-medya-temeli.md#K11-11) · Video işleme: HLS katmanları, poster, altyazı, limitler | L | 27 | K11-09 |  |
| [K11-12](K11-medya-temeli.md#K11-12) · Özel medya geçidi: yetki, byte streaming, HLS/Range/HEAD, erişim politikası kaydı | L | 24 | K11-03, K11-04, K03-07 | insan inceleme |
| [K11-13](K11-medya-temeli.md#K11-13) · Arşiv adaptörü ve geri çağırma işi (fake adaptörle) | L | 25 | K11-03, K11-04, K11-12, K04-05 |  |
| [K11-14](K11-medya-temeli.md#K11-14) · Yönetim ekranı: MediaLibrary ve yükleme bileşeni (UploadWidget) | L | 28 | K11-08, K11-10, K21-03 |  |
| [K11-15](K11-medya-temeli.md#K11-15) · Pano/yorum eki bağlama (K08 AttachmentList yer tutucusunun gerçekleştirilmesi) | M | 33 | K11-12, K11-14, K08-06, K08-11 | migration |
| [K11-16](K11-medya-temeli.md#K11-16) · K11 güvenlik/kabul paketi: T-08, T-23, T-24, T-25, T-39 ve T-09 (video) | L | 34 | K11-08, K11-10, K11-11, K11-12, K11-13, K11-15 | insan inceleme |

<a id="K11-01"></a>
## K11-01 · Karar: nesne depolama sağlayıcısı, bölge ve staging bucket'ları

**Boyut:** S · **Dalga:** 2 · **Tür:** karar
**Başlamadan önce `main`'de olması gerekenler:** [K01-08](K01-iskelet.md#K01-08)
**Ürün sahibinden gereken:** Nesne depolama sağlayıcısı, bölge ve maliyet kararı; staging hesabı.


**Dokunabileceğin yollar (yalnız bunlar):** `docs/adr/`, `docs/reports/` (yalnız bu kararın kaydı).

**Teslim edilecekler**
- Sağlayıcı karşılaştırması: S3 uyumluluğu, boyutu zorlayan imzalı POST politikası, multipart, `AbortIncompleteMultipartUpload`/yaşam döngüsü, sürümleme, restore/arşiv davranışı, veri işleme konumu/şartları, egress ve depolama maliyeti
- Karar kaydı `docs/adr/*-nesne-depolama.md` (ürün sahibi onayı) ve staging için ayrı bucket/prefix'ler (karantina, özel orijinal, özel türev, kurumsal yayın); yalnız test/staging hesabı, üretim açılmaz

**Kabul**
- Ürün sahibi sağlayıcıyı ve bölgeyi yazılı seçmiştir; capability tablosu doldurulmuştur; erişim anahtarları yalnız korumalı environment'ta
- Üretim bucket'ı veya gerçek müşteri dosyası yok

**Oku:** `AGENTS.md`, §14.1, §14.2, §19.6, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-05](K00-depo-kurallari.md#K00-05), [K01-01](K01-iskelet.md#K01-01), [K20-01](K20-tasarim-icerik.md#K20-01), [K20-02](K20-tasarim-icerik.md#K20-02), [K20-06](K20-tasarim-icerik.md#K20-06), [K03-13](K03-kimlik-uyelik.md#K03-13), [K10-02](K10-bildirim-eposta-sms.md#K10-02)

**Bunu bekleyenler:** [K11-05](K11-medya-temeli.md#K11-05), [K17-08](K17-staging-kabul.md#K17-08), [K18-02](K18-canliya-gecis.md#K18-02)

---

<a id="K11-02"></a>
## K11-02 · Sözleşmeler ve ADR: ObjectStorage portu, medya durumları, limitler, yükleme yöntemi

**Boyut:** M · **Dalga:** 22 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K04-10](K04-outbox-audit-isci.md#K04-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/contracts/src/media/`, `packages/domain/src/media/`, `packages/application/src/ports/object-storage.ts`, `packages/integrations/src/fakes/object-storage.ts`, `docs/adr/*-medya-yukleme.md`

**Teslim edilecekler**
- `ObjectStorage` portu ve **capability** bildirimi (imzalı POST politikası/`content-length-range`, multipart, `HEAD`, silme, yaşam döngüsü, restore); bellek içi fake gerçekleme
- Medya durum makinesi: `awaiting_upload → quarantined → scanning → processing → ready`; `rejected / failed / deleting / deleted`; **arşiv durumu ayrı alan** (aynı enum'a sıkıştırılmaz); object key şeması (kişi adı/telefon yok, asset+sürüm anahtarı)
- ADR: yükleme yöntemi (boyutu zorlayan imzalı POST **veya** sağlayıcı desteklemiyorsa yetkili geçit üzerinden sayaçlı akış), büyük dosya protokolü (S3 multipart / tus), eşik (öneri 20 MB), limit tablosu (foto 20 MB/40 MP, PDF 20 MB, tanıtım videosu 500 MB/5 dk — işletme ve altyapı testiyle onaylanır), ClamAV topolojisi, FFmpeg lisans/codec incelemesi, kota profili
- Ortak sözleşme: K11 tüketici işlerinden önce küçük PR

**Kabul**
- ADR ve sözleşmeler birleşmeden diğer K11 paketleri başlamaz; seçilen yöntemin gerekçesi capability tablosuyla uyumlu
- SVG/HTML/çalıştırılabilir dosya türleri izin listesinde yok
- Bu paketin geçmesi gereken şartname testleri: T-39 (§20.1).

**Kapsam dışı:** DB, depolama adaptörü ve uç noktalar yok.

**Oku:** `AGENTS.md`, §14.1, §14.2, §14.5, §17.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-01](K05-rezervasyon-motoru.md#K05-01), [K07-02](K07-kurumsal-site-icerik.md#K07-02), [K08-01](K08-dugunum-pano-onay.md#K08-01), [K09-01](K09-sohbet-canli-akis.md#K09-01), [K10-03](K10-bildirim-eposta-sms.md#K10-03), [K16-05](K16-yonetim-butunlestirme.md#K16-05)

**Bunu bekleyenler:** [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04)

---

<a id="K11-03"></a>
## K11-03 · Medya şeması: media_asset, media_variant, upload_intent, retention_policy, media_restore_job

**Boyut:** L · **Dalga:** 23 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-02](K11-medya-temeli.md#K11-02), [K02-04](K02-db-erisim-cekirdegi.md#K02-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/media.ts`, `packages/db/migrations/*_media_schema.sql`, `packages/db/src/rls/media.ts`, `tests/integration/db/media/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `media_asset` (sahip aktör türü+kimliği, üst varlık türü/kimliği, işleme durumu, `storage_class`, `archived_at`, `restore_status`, `restore_expires_at`, `checksum`, `retention_policy_id`, boyut/MIME), `media_variant` (tür, object key, boyut, hash, görünürlük sınıfı), `upload_intent` (yükleyen aktör, üst varlık, karantina anahtarı, boyut/tür sınırı, son tarih, doğrulanmış object sürümü), `retention_policy`, `media_restore_job`
- Üst varlık polimorfiktir: bütünlük `organization_id + event_id` composite FK ve uygulama kuralıyla; `media_asset` işletme/düğün kapsamı olmadan yazılamaz; aynı asset+sürüm için tek türev kaydı (benzersiz)
- RLS: yalnız yetkili aktör ve işçi rolü (işçi yalnız karantina/işleme alanında); veri envanteri satırları (müşteri fotoğrafı/dosya adı/ EXIF temizliği)

**Kabul**
- Başka işletme/düğünün üst kaydına bağlama DB'de reddedilir; aynı asset+sürüm için kopya türev eklenemez
- Medya durumu geçersiz sıçramaları (ör. `awaiting_upload → ready`) kısıtla reddedilir

**Kapsam dışı:** Pano ekinin yer tutucu sütunu K11-15'tedir.

**Oku:** `AGENTS.md`, §8, §8.1, §14.2, §14.5 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-03](K05-rezervasyon-motoru.md#K05-03), [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K07-03](K07-kurumsal-site-icerik.md#K07-03), [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K10-05](K10-bildirim-eposta-sms.md#K10-05), [K11-04](K11-medya-temeli.md#K11-04), [K13-02](K13-davetiye-takvim.md#K13-02), [K15-02](K15-chatbot.md#K15-02)

**Bunu bekleyenler:** [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K11-13](K11-medya-temeli.md#K11-13), [K12-01](K12-galeri-oynatici.md#K12-01), [K14-03](K14-belge-odeme.md#K14-03), [K16-07](K16-yonetim-butunlestirme.md#K16-07)

---

<a id="K11-04"></a>
## K11-04 · S3 uyumlu depolama adaptörü (yerel S3 uyumlu servisle test)

**Boyut:** L · **Dalga:** 23 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-02](K11-medya-temeli.md#K11-02)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/integrations/src/storage/`, `tests/integration/storage/`, `infra/storage/compose.storage.yml`

**Teslim edilecekler**
- `ObjectStorage` gerçeklemesi: imzalı POST politikası üretimi, `HEAD`, aralıklı/akışlı okuma, silme, multipart başlat/parça/tamamla/iptal, yaşam döngüsü kuralı uygulama; SDK iş koduna sızmaz
- CI'da kullanılan S3 uyumlu yerel servis seçimi **lisansı notlanarak** `compose.storage.yml`'de; capability testleri: desteklenmeyen yetenekte açık hata
- Object key üretimi yalnız sunucuda; kullanıcı girdisi anahtara girmez

**Kabul**
- Capability testleri yerel serviste yeşil; imza süresi dolmuş/boyutu aşan POST reddedilir
- SDK importu yalnız `packages/integrations/storage` içinde
- Bu paketin geçmesi gereken şartname testleri: T-39 (§20.1).

**Kapsam dışı:** Gerçek sağlayıcı yapılandırması K11-05'tedir.

**Oku:** `AGENTS.md`, §14.2, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-03](K05-rezervasyon-motoru.md#K05-03), [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K07-03](K07-kurumsal-site-icerik.md#K07-03), [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K10-05](K10-bildirim-eposta-sms.md#K10-05), [K11-03](K11-medya-temeli.md#K11-03), [K13-02](K13-davetiye-takvim.md#K13-02), [K15-02](K15-chatbot.md#K15-02)

**Bunu bekleyenler:** [K11-05](K11-medya-temeli.md#K11-05), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K11-13](K11-medya-temeli.md#K11-13), [K12-02](K12-galeri-oynatici.md#K12-02)

---

<a id="K11-05"></a>
## K11-05 · Staging bucket yapılandırması: IAM ayrımı, anonim liste kapalı, yaşam döngüsü

**Boyut:** M · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-04](K11-medya-temeli.md#K11-04), [K11-01](K11-medya-temeli.md#K11-01), [K01-09](K01-iskelet.md#K01-09)

**Dokunabileceğin yollar (yalnız bunlar):** `docs/runbook/storage.md`, `scripts/storage-capability-check.ts`, `infra/storage/`

**Teslim edilecekler**
- Karantina, özel orijinal, özel türev, kurumsal yayın için ayrı prefix/bucket ve **ayrı IAM kuralları**; anonim bucket listeleme kapalı; orijinal ACL'i public değil; `AbortIncompleteMultipartUpload` ve karantina süre dolumu kuralı
- `storage-capability-check` betiği: gerçek staging'de capability'leri (POST politikası boyut zorlaması, multipart, HEAD, silme) sınar ve sonucu `docs/reports/K11-storage-capability.md`'ye yazar; sır içermez
- Anahtarlar yalnız korumalı environment'tan; yapılandırma kodda yok

**Kabul**
- Capability raporu: boyutu aşan imzalı yükleme **reddedilir** (gerçek sağlayıcıda kanıtlı); desteklenmeyen yetenek varsa ADR'deki yedek yola (sayaçlı geçit) geçildiği yazılı
- Anonim liste denemesi reddedilir; kurumsal yayın prefix'i dışında anonim erişim yok
- Bu paketin geçmesi gereken şartname testleri: T-39 (§20.1).

**Kapsam dışı:** Üretim bucket'ı açılmaz.

**Oku:** `AGENTS.md`, §14.1, §14.2, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K12-01](K12-galeri-oynatici.md#K12-01), [K13-03](K13-davetiye-takvim.md#K13-03), [K14-02](K14-belge-odeme.md#K14-02), [K15-03](K15-chatbot.md#K15-03), [K15-05](K15-chatbot.md#K15-05)

**Bunu bekleyenler:** [K17-06](K17-staging-kabul.md#K17-06)

---

<a id="K11-06"></a>
## K11-06 · Upload intent API: yetki, kota, MIME, boyutu zorlayan izin

**Boyut:** L · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04), [K03-07](K03-kimlik-uyelik.md#K03-07), [K04-04](K04-outbox-audit-isci.md#K04-04)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/media/upload-intent/`, `apps/web/app/api/media/upload-intents/`, `tests/integration/media/upload-intent/`

**Teslim edilecekler**
- `POST /api/media/upload-intents`: üst varlık upload izni, MIME/uzantı izin listesi, kalan kota, hız limiti; karantina object key sunucuda üretilir; kısa ömürlü **tek nesne + sunucuda zorlanan boyut sınırı** izni (imzalı POST politikası veya ADR'deki sayaçlı geçit); genel bucket yetkisi verilmez
- Idempotent (`Idempotency-Key`); `upload_intent` son tarihi; sahte `status/organizationId/ownerId` yok sayılır
- Hata yanıtlarında üst kaydın varlığı/diğer müşteri bilgisi sızmaz; yetkisiz → 404/403 tutarlı

**Kabul**
- Yetkisiz aktör intent açamaz; kota/boyut/MIME aşımı reddedilir; aynı `Idempotency-Key` aynı intent'i döner
- İmzalı izin başka nesneye/anahtara/daha büyük boyuta kullanılamaz (adaptör testiyle)
- Bu paketin geçmesi gereken şartname testleri: T-28, T-39 (§20.1).

**Kapsam dışı:** Tamamlama komutu K11-07'dedir.

**Oku:** `AGENTS.md`, §14.2, §17.3, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K11-05](K11-medya-temeli.md#K11-05), [K11-12](K11-medya-temeli.md#K11-12), [K12-01](K12-galeri-oynatici.md#K12-01), [K13-03](K13-davetiye-takvim.md#K13-03), [K14-02](K14-belge-odeme.md#K14-02), [K15-03](K15-chatbot.md#K15-03), [K15-05](K15-chatbot.md#K15-05)

**Bunu bekleyenler:** [K11-07](K11-medya-temeli.md#K11-07)

---

<a id="K11-07"></a>
## K11-07 · Yükleme tamamlama: HEAD boyut doğrulaması, MIME/imza kontrolü, süre dolumu temizliği

**Boyut:** L · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-06](K11-medya-temeli.md#K11-06), [K04-05](K04-outbox-audit-isci.md#K04-05)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/media/upload-complete/`, `apps/web/app/api/media/*/complete/`, `apps/worker/src/jobs/upload-intent-expiry.ts`, `tests/integration/media/upload-complete/`

**Teslim edilecekler**
- `POST /api/media/:id/complete`: upload sahibi/izinli ekip; **gerçek boyut `HEAD` ile** doğrulanır, sınırı aşan nesne silinir ve intent reddedilir; hash/sahip doğrulaması; uzantı + MIME + dosya imzası (magic bytes) kontrolü; metadata'ya güvenilmez
- Başarılıda asset `quarantined` olur ve tarama işi outbox ile kuyruğa girer (dosya hâlâ yalnız karantinada); dosya adı güvenli saklanır/gösterilir (kaçışlı, yol ayırıcı yok)
- Yarım/süresi dolmuş `upload_intent` temizleme işi (idempotent); karantinada bekleyen yüklemeler için süre dolumu

**Kabul**
- T-39: boyut aşan nesne (imzalı bağlantıyla) reddedilip silinir; yarım yükleme süre dolunca temizlenir
- T-24 başlangıcı: sahte MIME/uzantı uyumsuz dosya karantinadan çıkmaz; T-34 dosya adı: script/HTML içeren ad kaçışlanır
- Bu paketin geçmesi gereken şartname testleri: T-24, T-34, T-39 (§20.1).

**Kapsam dışı:** Tarama ve işleme K11-09/10/11'dedir.

**Oku:** `AGENTS.md`, §14.2, §17.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-13](K11-medya-temeli.md#K11-13), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K11-08](K11-medya-temeli.md#K11-08), [K11-09](K11-medya-temeli.md#K11-09), [K14-05](K14-belge-odeme.md#K14-05)

---

<a id="K11-08"></a>
## K11-08 · Büyük dosya: çok parçalı, devam ettirilebilir yükleme

**Boyut:** L · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-07](K11-medya-temeli.md#K11-07)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/media/multipart/`, `apps/web/app/api/media/*/parts/`, `apps/web/src/media/upload-client/`, `tests/integration/media/multipart/`

**Teslim edilecekler**
- Eşik üstü (öneri 20 MB) dosyalar için çok parçalı akış (ADR'deki protokol): parça boyutu, toplam boyut ve eşzamanlı parça sayısı **sunucuda** sınırlanır; parça başına kısa ömürlü izin; tamamlamada toplam boyut/hash doğrulaması
- İstemci yükleme kütüphanesi: kaldığı yerden devam (mobil ağ kesintisi), ilerleme/iptal/yeniden dene, küçük istemci adası
- Tamamlanmayan yüklemeler yaşam döngüsü kuralı ve `upload_intent` süre dolumuyla temizlenir

**Kabul**
- T-39: yarım çok parçalı yükleme temizlenir; kesilen yükleme devam eder (test: parça kaybı/yeniden gönderim)
- Parça sayısı/boyutu sunucu sınırını aşan istek reddedilir
- Bu paketin geçmesi gereken şartname testleri: T-39 (§20.1).

**Kapsam dışı:** Yönetim ekranı K11-14'tedir.

**Oku:** `AGENTS.md`, §14.2, §17.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K11-09](K11-medya-temeli.md#K11-09), [K13-05](K13-davetiye-takvim.md#K13-05), [K14-05](K14-belge-odeme.md#K14-05), [K15-04](K15-chatbot.md#K15-04), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

**Bunu bekleyenler:** [K11-14](K11-medya-temeli.md#K11-14), [K11-16](K11-medya-temeli.md#K11-16)

---

<a id="K11-09"></a>
## K11-09 · İzole medya işçisi iskeleti ve ClamAV servisi (taranamayan dosya ready olmaz)

**Boyut:** L · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-07](K11-medya-temeli.md#K11-07), [K01-03](K01-iskelet.md#K01-03), [K01-07](K01-iskelet.md#K01-07), [K04-05](K04-outbox-audit-isci.md#K04-05)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `apps/media-worker/src/runtime/`, `apps/media-worker/src/scan/`, `infra/clamav/`, `docs/runbook/clamav.md`, `tests/integration/media/scan/`

**Teslim edilecekler**
- Medya işçisi: düşük yetki, CPU/bellek/zaman limitleri, gereksiz ağ erişimi yok (yalnız depolama ve clamd); işçiye kullanıcıdan serbest komut/URL geçirilmez; işlem başına geçici dizin ve temizleme
- ClamAV **ayrı servis (clamd)**: belleği/imza veritabanı medya işçisinden ayrı hesaplanır; `StreamMaxLength`/`MaxFileSize`/zaman aşımı izin verilen en büyük dosyayla uyumlu; freshclam izlemesi; **imza yaşı eşiği aşarsa alarm olayı üretilir ve yeni dosya işleme duraklatılır**
- Tarama işi: `quarantined → scanning`; temiz → `processing` kuyruğu; zararlı → `rejected`; limit/erişilemezlik → `failed` (yeniden denenebilir) — **asla `ready` değil**; tarama/işleme metrikleri (K04-07)

**Kabul**
- T-39: tarama limitini aşan dosya ve ClamAV erişilemez → `failed`, `ready` olmaz, web servisi etkilenmez; imza yaşı eşiği aşınca işleme duraklar ve alarm olayı görünür
- T-24 zararlı PDF (EICAR testi) `rejected`; işçi komut/URL girişi kabul etmez
- Bu paketin geçmesi gereken şartname testleri: T-24, T-39 (§20.1).

**Kapsam dışı:** Fotoğraf ve video işleme K11-10/11'dedir.

**Oku:** `AGENTS.md`, §14.2, §17.3, §19.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K11-08](K11-medya-temeli.md#K11-08), [K13-05](K13-davetiye-takvim.md#K13-05), [K14-05](K14-belge-odeme.md#K14-05), [K15-04](K15-chatbot.md#K15-04), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

**Bunu bekleyenler:** [K11-10](K11-medya-temeli.md#K11-10), [K11-11](K11-medya-temeli.md#K11-11)

---

<a id="K11-10"></a>
## K11-10 · Fotoğraf işleme: decoder doğrulaması, bomba limiti, türevler, EXIF/GPS temizliği

**Boyut:** L · **Dalga:** 27 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-09](K11-medya-temeli.md#K11-09)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/media-worker/src/photo/`, `packages/application/src/media/derivatives/photo.ts`, `tests/integration/media/photo/`, `tests/fixtures/media/photo/`

**Teslim edilecekler**
- sharp ile gerçek decoder doğrulaması; piksel/sıkıştırma bombası limiti (40 MP ve çözülmüş bellek tavanı); responsive türevler (kaynaktan büyük üretilmez), yön bilgisi güvenle uygulanır, **GPS/EXIF temizlenir**
- Türevlerin varlığı ve bütünlüğü doğrulanınca asset `ready` (asset+sürüm anahtarıyla idempotent: tekrar işte kopya dosya yok); bozuk dosya `rejected/failed`
- `media.ready.v1` outbox olayı; işleme süresi metriği

**Kabul**
- T-24: çok büyük görsel/bozuk dosya karantinadan çıkmaz ve işçi/web süreci çökmez; çıktıda EXIF/GPS yok (test fikstürü)
- İş tekrar çalıştırılınca kopya türev/ücret doğmaz
- Bu paketin geçmesi gereken şartname testleri: T-24 (§20.1).

**Kapsam dışı:** Video K11-11'dedir.

**Oku:** `AGENTS.md`, §14.2, §14.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-13](K05-rezervasyon-motoru.md#K05-13), [K21-05](K21-yonetim-kabugu-takvim.md#K21-05), [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K11-11](K11-medya-temeli.md#K11-11), [K13-08](K13-davetiye-takvim.md#K13-08), [K15-06](K15-chatbot.md#K15-06), [K17-03](K17-staging-kabul.md#K17-03)

**Bunu bekleyenler:** [K11-14](K11-medya-temeli.md#K11-14), [K11-16](K11-medya-temeli.md#K11-16), [K12-02](K12-galeri-oynatici.md#K12-02), [K13-06](K13-davetiye-takvim.md#K13-06)

---

<a id="K11-11"></a>
## K11-11 · Video işleme: HLS katmanları, poster, altyazı, limitler

**Boyut:** L · **Dalga:** 27 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-09](K11-medya-temeli.md#K11-09)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/media-worker/src/video/`, `packages/application/src/media/derivatives/video.ts`, `docs/license/ffmpeg.md`, `tests/integration/media/video/`, `tests/fixtures/media/video/`

**Teslim edilecekler**
- FFmpeg işçisi: çözünürlük/süre/track limitleri (tanıtım videosu 500 MB/5 dk önerisi), kaynaktan büyük kalite üretilmez, 360p/720p/1080p kademeleri kaynak ve kullanıma göre; poster ve (varsa) altyazı; dosya protokolleri **izin listesi**, kullanıcıdan komut/URL yok
- FFmpeg derlemesi ve codec seçimi için lisans incelemesi notu `docs/license/ffmpeg.md` (ticari/terk edilmiş bağımlılık yok); işçi zaman/bellek limitiyle öldürülür
- Türev bütünlüğü doğrulanınca `ready`; asset+sürüm idempotensi; HLS manifest'indeki bütün URI'ler **göreli/geçit anahtarı** olarak üretilir (public origin adresi yok)

**Kabul**
- T-24: bozuk video karantinadan çıkmaz, işçi limit aşımında kapanır, web servisi etkilenmez
- Üretilen manifest/segment/poster listesi doğrulanır (hepsi geçit anahtarıyla adreslenebilir)
- Bu paketin geçmesi gereken şartname testleri: T-24 (§20.1).

**Kapsam dışı:** Oynatıcı K12'dedir; gerçek kullanıcı cihaz testi K12-06'dadır.

**Oku:** `AGENTS.md`, §14.2, §14.3, §14.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-13](K05-rezervasyon-motoru.md#K05-13), [K21-05](K21-yonetim-kabugu-takvim.md#K21-05), [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K11-10](K11-medya-temeli.md#K11-10), [K13-08](K13-davetiye-takvim.md#K13-08), [K15-06](K15-chatbot.md#K15-06), [K17-03](K17-staging-kabul.md#K17-03)

**Bunu bekleyenler:** [K11-16](K11-medya-temeli.md#K11-16), [K12-05](K12-galeri-oynatici.md#K12-05), [K17-07](K17-staging-kabul.md#K17-07)

---

<a id="K11-12"></a>
## K11-12 · Özel medya geçidi: yetki, byte streaming, HLS/Range/HEAD, erişim politikası kaydı

**Boyut:** L · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04), [K03-07](K03-kimlik-uyelik.md#K03-07)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/api/media/[id]/`, `packages/application/src/media/gateway/`, `packages/application/src/media/policy/`, `tests/integration/media/gateway/`, `tests/security/media-gateway/`

**Teslim edilecekler**
- `GET/HEAD /api/media/:id/*`: **her istekte** session + event membership + asset visibility kontrolü; origin object adresi istemciye dönmez; gövde RAM'e tamamen yüklenmez (byte streaming); `Range` desteği; yol traversal ve alternatif object key reddedilir
- HLS: master/media manifest, segment, poster, thumbnail, altyazı, indirme, `HEAD` ve `Range` dahil **her yol** korunur; manifest URI'leri geçide işaret eder (yalnız master'ı korumak yetmez); özel medya framework'ün public image optimizer/cache'ine verilmez; `Cache-Control: private, no-store`
- Üyelik/yayın iptalinden sonra yeni istek reddedilir; uzun stream kısa yetki kontrol aralıklarıyla/iptal sinyaliyle kesilir; mutlak iptal vaadi yok
- `MediaAccessPolicy` kayıt arayüzü: üst varlık türü başına politika (düğün üyesi, belge izni, yayın) kaydı; K13/K14 kendi politikalarını **kayıt satırıyla** ekler

**Kabul**
- T-23: özel HLS segment, poster, altyazı, HEAD/Range doğrudan istenir → her yol yetki ister; public origin kaçışı yok; üyelik iptalinden sonra yeni dosya isteği reddedilir
- T-08 medya kısmı: Müşteri A, B'nin asset ID'sini dener → hiçbir içerik/metadata dönmez
- Bu paketin geçmesi gereken şartname testleri: T-08, T-23 (§20.1).

**Kapsam dışı:** Edge authorization/CDN yok; yalnız aynı origin geçidi.

**Oku:** `AGENTS.md`, §14.4, §17.3, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K11-05](K11-medya-temeli.md#K11-05), [K11-06](K11-medya-temeli.md#K11-06), [K12-01](K12-galeri-oynatici.md#K12-01), [K13-03](K13-davetiye-takvim.md#K13-03), [K14-02](K14-belge-odeme.md#K14-02), [K15-03](K15-chatbot.md#K15-03), [K15-05](K15-chatbot.md#K15-05)

**Bunu bekleyenler:** [K11-13](K11-medya-temeli.md#K11-13), [K11-15](K11-medya-temeli.md#K11-15), [K11-16](K11-medya-temeli.md#K11-16), [K13-06](K13-davetiye-takvim.md#K13-06), [K14-05](K14-belge-odeme.md#K14-05), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

---

<a id="K11-13"></a>
## K11-13 · Arşiv adaptörü ve geri çağırma işi (fake adaptörle)

**Boyut:** L · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04), [K11-12](K11-medya-temeli.md#K11-12), [K04-05](K04-outbox-audit-isci.md#K04-05)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/media/archive/`, `packages/integrations/src/fakes/archive.ts`, `apps/worker/src/jobs/media-restore.ts`, `tests/integration/media/archive/`

**Teslim edilecekler**
- `ArchiveAdapter` sözleşmesi (arşivle, geri çağır, durum sorgu, capability) + fake; geri çağırma durumları `archived → restore_requested → restoring → restored_until`, başarısızlık ve süre dolumu ayrı işlenir; **aynı object için mükerrer restore tekilleştirilir** (benzersiz anahtar + idempotent iş)
- Müşteri 'Arşivden hazırlanıyor' durumunu görür (DTO); anlık oynatma vaadi yok; geri çağırma sonrası da güncel erişim kontrolü gerekir; erişim iptali sonrası restore edilmiş kopya indirilemez
- Gerçek otomatik cold storage geçişi ve sağlayıcı geri çağırma etkinleştirmesi **yok** (ADR'ye bağlı bayrak kapalı); maliyet notu raporda (rakam uydurulmaz)

**Kabul**
- T-25: arşiv restore tekrarı → tek iş; erişim iptali/süre dolumu sonrası yetkisiz indirme oluşmaz; fake adaptörle uçtan uca
- Restore süre dolumunda dosya yeniden `archived` görünür ve erişim kapanır
- Bu paketin geçmesi gereken şartname testleri: T-25 (§20.1).

**Kapsam dışı:** Büyük özel albüm ve otomatik arşivleme K19'dadır.

**Oku:** `AGENTS.md`, §14.5, §17.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-07](K11-medya-temeli.md#K11-07), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K11-16](K11-medya-temeli.md#K11-16), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

---

<a id="K11-14"></a>
## K11-14 · Yönetim ekranı: MediaLibrary ve yükleme bileşeni (UploadWidget)

**Boyut:** L · **Dalga:** 28 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-08](K11-medya-temeli.md#K11-08), [K11-10](K11-medya-temeli.md#K11-10), [K21-03](K21-yonetim-kabugu-takvim.md#K21-03)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/media/`, `apps/web/app/(admin)/medya/`, `apps/web/src/admin/nav/medya.ts`, `tests/e2e/admin-media/`

**Teslim edilecekler**
- Yükleme bileşeni (ilerleme, devam ettir, iptal, hata/ret nedeni), medya listesi (durum: karantina/tarama/işleniyor/hazır/reddedildi/başarısız), yeniden dene, sil; `FailedJobs` bağlantısı K16'ya bırakılır
- İzin: upload/yönetim izinleri; kota görünümü; yükleniyor/boş/hata/yetkisiz durumları; mobil ve klavye

**Kabul**
- Playwright: foto yükle → durum ilerler → hazır; reddedilen dosya nedeni görünür; izinsiz personelde ekran yok
- Büyük dosya yüklemesi ağ kesintisinde devam eder (test çifti ile)

**Kapsam dışı:** Albüm yönetimi K12-03'tedir.

**Oku:** `AGENTS.md`, §14.2, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-14](K05-rezervasyon-motoru.md#K05-14), [K21-06](K21-yonetim-kabugu-takvim.md#K21-06), [K06-09](K06-talep-ziyaret-teklif.md#K06-09), [K12-02](K12-galeri-oynatici.md#K12-02), [K13-06](K13-davetiye-takvim.md#K13-06), [K15-07](K15-chatbot.md#K15-07), [K15-09](K15-chatbot.md#K15-09)

**Bunu bekleyenler:** [K11-15](K11-medya-temeli.md#K11-15), [K12-03](K12-galeri-oynatici.md#K12-03), [K16-04](K16-yonetim-butunlestirme.md#K16-04), [K16-08](K16-yonetim-butunlestirme.md#K16-08)

---

<a id="K11-15"></a>
## K11-15 · Pano/yorum eki bağlama (K08 AttachmentList yer tutucusunun gerçekleştirilmesi)

**Boyut:** M · **Dalga:** 33 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-12](K11-medya-temeli.md#K11-12), [K11-14](K11-medya-temeli.md#K11-14), [K08-06](K08-dugunum-pano-onay.md#K08-06), [K08-11](K08-dugunum-pano-onay.md#K08-11)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/media-attachments.ts`, `packages/db/migrations/*_board_attachments.sql`, `packages/application/src/media/attachments/`, `apps/web/src/customer/board/attachments/`, `tests/integration/media/attachments/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- K08-02'deki yer tutucu sütuna/`board_post` ek ilişkisine FK; ek ekle/çıkar use-case'leri (üst kaydın erişimine tabi); geri çekilen paylaşımın ekleri eski bağlantıyla açılmaz
- K11-12 politika kaydına 'pano eki' satırı; K08-11'deki `AttachmentList` gerçek yüklemeye bağlanır (yalnız ek bileşeni değişir)
- Mesaj eki v1 kapsamında değildir

**Kabul**
- Üst kayıt erişimi olmayan kullanıcı eki açamaz; geri çekilen post eki 404/403
- T-08: B'nin ek asset ID'sini A deneyince hiçbir metadata dönmez
- Bu paketin geçmesi gereken şartname testleri: T-08 (§20.1).

**Kapsam dışı:** Belge ekleri K14'tedir.

**Oku:** `AGENTS.md`, §10.3, §14.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K07-10](K07-kurumsal-site-icerik.md#K07-10), [K08-13](K08-dugunum-pano-onay.md#K08-13), [K09-05](K09-sohbet-canli-akis.md#K09-05), [K09-06](K09-sohbet-canli-akis.md#K09-06), [K10-06](K10-bildirim-eposta-sms.md#K10-06), [K13-10](K13-davetiye-takvim.md#K13-10), [K13-12](K13-davetiye-takvim.md#K13-12), [K14-07](K14-belge-odeme.md#K14-07), [K14-08](K14-belge-odeme.md#K14-08)

**Bunu bekleyenler:** [K11-16](K11-medya-temeli.md#K11-16)

---

<a id="K11-16"></a>
## K11-16 · K11 güvenlik/kabul paketi: T-08, T-23, T-24, T-25, T-39 ve T-09 (video)

**Boyut:** L · **Dalga:** 34 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-08](K11-medya-temeli.md#K11-08), [K11-10](K11-medya-temeli.md#K11-10), [K11-11](K11-medya-temeli.md#K11-11), [K11-12](K11-medya-temeli.md#K11-12), [K11-13](K11-medya-temeli.md#K11-13), [K11-15](K11-medya-temeli.md#K11-15)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `tests/security/media-acceptance/`, `tests/integration/media/acceptance/`, `docs/reports/K11-kabul.md`

**Teslim edilecekler**
- Tek komut `pnpm test:media`: T-08 (medya ID'leri), T-23, T-24 (sahte MIME/dev görsel/bozuk video/zararlı PDF), T-25, T-39 (boyut aşımı, yarım multipart, tarama limiti, ClamAV erişilemez), **T-09 video yarısı** (üyelik iptali sonrası yeni dosya isteği ve açık stream kesilir; gecikme ölçülür)
- İşçi izolasyon kanıtı: medya işi web sürecinin bellek/CPU'sunu tüketmez (yük altında web health yeşil)
- `K11-kabul.md`: kapsam, sınırlar, inceleyici kontrol listesi (§21.3 odakları)

**Kabul**
- Beş test grubu CI'da yeşil; doğrudan segment/HEAD/Range kaçışı yok; çalıştırılamayan test varsa nedeni yazılı
- **§21.3 insan incelemesi** için PR açıklamasında odak listesi (izin/boyut zorlaması, karantina, geçit, işçi izolasyonu)
- Bu paketin geçmesi gereken şartname testleri: T-08, T-09, T-23, T-24, T-25, T-39 (§20.1).

**Kapsam dışı:** Metin/dosya adı XSS testleri (T-34) ilgili kartlarda; bu pakette yalnız dosya adı kısmı.

**Oku:** `AGENTS.md`, §14, §17.3, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K08-15](K08-dugunum-pano-onay.md#K08-15), [K09-07](K09-sohbet-canli-akis.md#K09-07), [K09-08](K09-sohbet-canli-akis.md#K09-08), [K10-07](K10-bildirim-eposta-sms.md#K10-07), [K10-14](K10-bildirim-eposta-sms.md#K10-14), [K13-14](K13-davetiye-takvim.md#K13-14), [K14-09](K14-belge-odeme.md#K14-09)

**Bunu bekleyenler:** [K15-11](K15-chatbot.md#K15-11), [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K17-09](K17-staging-kabul.md#K17-09)

---
