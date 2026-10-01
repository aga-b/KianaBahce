# K04 — Outbox, audit ve işçi temeli

**Kilometre taşı:** M0 — Temel ve hazırlık (K00–K04) · **Şartname:** §8.1, §12.4, §17.5, §18.1, §18.3 · [Plan dizini](README.md)

> Domain olay zarfı, outbox + dispatcher, pg-boss işçisi, idempotency, audit, log redaksiyonu ve silme defteri.

Ortak temelin son halkası: K05 ve K11 buradan sonra paralel başlar. Dış sağlayıcılar yalnız fake adaptörle çalışır.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K04-01](K04-outbox-audit-isci.md#K04-01) · pg-boss transaction katılımı değerlendirmesi ve ADR | M | 18 | K03-12 |  |
| [K04-02](K04-outbox-audit-isci.md#K04-02) · Domain olay zarfı ve sürümlü olay sözleşmeleri | S | 18 | K03-12 |  |
| [K04-03](K04-outbox-audit-isci.md#K04-03) · Outbox tablosu, yazma yardımcısı ve dispatcher | L | 19 | K04-01, K04-02 | migration |
| [K04-04](K04-outbox-audit-isci.md#K04-04) · Idempotency kayıtları ve komut sarmalayıcısı | M | 18 | K03-12 | migration |
| [K04-05](K04-outbox-audit-isci.md#K04-05) · İşçi çerçevesi: pg-boss, handler sarmalayıcı, retry ve failed jobs | L | 20 | K04-01, K04-03 | migration |
| [K04-06](K04-outbox-audit-isci.md#K04-06) · Audit: append-only kayıt ve AuditSink'in gerçek yazıcıya bağlanması | M | 18 | K03-12 | migration |
| [K04-07](K04-outbox-audit-isci.md#K04-07) · Gözlemlenebilirlik: yapılandırılmış log, redaksiyon, correlation id | M | 18 | K03-12 |  |
| [K04-08](K04-outbox-audit-isci.md#K04-08) · deletion_ledger ve yeniden uygulama iskeleti | M | 18 | K03-12 | migration |
| [K04-09](K04-outbox-audit-isci.md#K04-09) · İlgili kişi başvurusu: data_subject_request ve süre sayacı | M | 19 | K04-08, K04-06 | migration |
| [K04-10](K04-outbox-audit-isci.md#K04-10) · Dayanıklılık testleri: çökme, yeniden oynatma ve sahte sağlayıcı kanıtı | M | 21 | K04-03, K04-04, K04-05, K04-06, K04-07, K04-08, K04-09 |  |

<a id="K04-01"></a>
## K04-01 · pg-boss transaction katılımı değerlendirmesi ve ADR

**Boyut:** M · **Dalga:** 18 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-12](K03-kimlik-uyelik.md#K03-12)

**Dokunabileceğin yollar (yalnız bunlar):** `docs/adr/*-pgboss-outbox.md`, `apps/worker/spike/`, `docs/reports/K04-pgboss-poc.md`

**Teslim edilecekler**
- pg-boss sürümü sabitlenir; kullanılan sürümde `send` çağrısının çağıranın domain transaction'ına katılıp katılamadığı küçük bir PoC ile **gösterilir** (commit öncesi görünmezlik, rollback'te iş yok)
- ADR: katılabiliyorsa outbox + dispatcher yalnız dış/ertelenmiş işler için; katılamıyorsa outbox esas; iki yol aynı olayda birlikte kullanılmaz (§12.4)
- Bağlantı bütçesine etkisi (worker bağlantı sayısı) yazılır

**Kabul**
- ADR birleşmeden K04-03/05 başlamaz
- PoC testi `tests/integration/` altında koşar

**Kapsam dışı:** Üretim işçisi ve outbox tablosu K04-03/05'tedir.

**Oku:** `AGENTS.md`, §5.1, §12.4, §19.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-02](K04-outbox-audit-isci.md#K04-02), [K04-04](K04-outbox-audit-isci.md#K04-04), [K04-06](K04-outbox-audit-isci.md#K04-06), [K04-07](K04-outbox-audit-isci.md#K04-07), [K04-08](K04-outbox-audit-isci.md#K04-08), [K21-01](K21-yonetim-kabugu-takvim.md#K21-01)

**Bunu bekleyenler:** [K04-03](K04-outbox-audit-isci.md#K04-03), [K04-05](K04-outbox-audit-isci.md#K04-05)

---

<a id="K04-02"></a>
## K04-02 · Domain olay zarfı ve sürümlü olay sözleşmeleri

**Boyut:** S · **Dalga:** 18 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-12](K03-kimlik-uyelik.md#K03-12)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/contracts/src/events/`

**Teslim edilecekler**
- Zarf: `eventId`, `type`, `version`, `organizationId`, `aggregateId`, `occurredAt`, `actorRef`, `correlationId`, asgari `payload` (Zod)
- §18.3'teki ilk olay türleri için kayıt defteri (`reservation.requested.v1`, `booking.held.v1` … `publication.revoked.v1`); yalnız zarf ve payload şeması, tüketici yok
- Sürümleme kuralı: kırıcı değişiklik yeni sürüm; eski sürüm için test edilmiş handler şartı; alıcı listesi payload'a konmaz

**Kabul**
- Şema uyumluluk testi (eski sürüm yükü yeni okuyucuda reddedilmez/yanlış okunmaz)
- Bu paket **ortak sözleşme** olduğu için küçük PR olarak önce birleşir

**Kapsam dışı:** Notification consumer ve alıcı belirleme K10'dadır.

**Oku:** `AGENTS.md`, §18.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-01](K04-outbox-audit-isci.md#K04-01), [K04-04](K04-outbox-audit-isci.md#K04-04), [K04-06](K04-outbox-audit-isci.md#K04-06), [K04-07](K04-outbox-audit-isci.md#K04-07), [K04-08](K04-outbox-audit-isci.md#K04-08), [K21-01](K21-yonetim-kabugu-takvim.md#K21-01)

**Bunu bekleyenler:** [K04-03](K04-outbox-audit-isci.md#K04-03)

---

<a id="K04-03"></a>
## K04-03 · Outbox tablosu, yazma yardımcısı ve dispatcher

**Boyut:** L · **Dalga:** 19 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K04-01](K04-outbox-audit-isci.md#K04-01), [K04-02](K04-outbox-audit-isci.md#K04-02)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/outbox.ts`, `packages/db/migrations/*_outbox.sql`, `packages/application/src/outbox/`, `apps/worker/src/dispatcher/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `outbox_event` (işlenme zamanı indeksli): `appendOutbox(tx, event)` iş verisiyle **aynı transaction**; dış sağlayıcı transaction içinde çağrılmaz (NOT-01)
- Dispatcher: satırları `FOR UPDATE SKIP LOCKED` ile alır, K04-01 kararına göre kuyruğa iletir; publish–ack arası çökmede kopya iş normaldir (tüketici idempotent)
- Ölçüm: en eski outbox yaşı, kuyruk derinliği; sınırlı saklama/temizlik işi

**Kabul**
- Commit'ten önce yan etki yok; rollback'te outbox satırı yok
- İki dispatcher aynı satırı iki kez işleyemez (SKIP LOCKED testi)

**Kapsam dışı:** Bildirim/delivery tabloları K10'dadır.

**Oku:** `AGENTS.md`, §12.4, §18.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-09](K04-outbox-audit-isci.md#K04-09), [K21-02](K21-yonetim-kabugu-takvim.md#K21-02)

**Bunu bekleyenler:** [K04-05](K04-outbox-audit-isci.md#K04-05), [K04-10](K04-outbox-audit-isci.md#K04-10)

---

<a id="K04-04"></a>
## K04-04 · Idempotency kayıtları ve komut sarmalayıcısı

**Boyut:** M · **Dalga:** 18 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-12](K03-kimlik-uyelik.md#K03-12)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/idempotency.ts`, `packages/db/migrations/*_idempotency.sql`, `packages/application/src/idempotency/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `idempotency_record`: anahtar kapsamı aktör (tür+kimlik) + komut + payload hash; öneri 24 saat saklama (kritik işlerde daha uzun yapılandırılabilir)
- `withIdempotency(ctx, key, command, payload, fn)`: aynı anahtar+aynı payload önceki sonucu döndürür; aynı anahtar farklı payload reddedilir; yarım kalan işlem yeniden denenebilir
- `Idempotency-Key` başlık işleme ve hata kodu eşlemesi (§18.1)

**Kabul**
- Aynı komutun paralel iki çağrısı tek yan etki üretir
- Farklı aktörün aynı anahtarı çakışmaz (aktör türü kapsamda)

**Oku:** `AGENTS.md`, §8.1, §9.3, §18.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-01](K04-outbox-audit-isci.md#K04-01), [K04-02](K04-outbox-audit-isci.md#K04-02), [K04-06](K04-outbox-audit-isci.md#K04-06), [K04-07](K04-outbox-audit-isci.md#K04-07), [K04-08](K04-outbox-audit-isci.md#K04-08), [K21-01](K21-yonetim-kabugu-takvim.md#K21-01)

**Bunu bekleyenler:** [K04-10](K04-outbox-audit-isci.md#K04-10), [K11-06](K11-medya-temeli.md#K11-06), [K14-06](K14-belge-odeme.md#K14-06)

---

<a id="K04-05"></a>
## K04-05 · İşçi çerçevesi: pg-boss, handler sarmalayıcı, retry ve failed jobs

**Boyut:** L · **Dalga:** 20 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K04-01](K04-outbox-audit-isci.md#K04-01), [K04-03](K04-outbox-audit-isci.md#K04-03)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/worker/src/`, `packages/application/src/jobs/`, `packages/db/migrations/*_worker_role_grants.sql`, `tests/integration/worker/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- pg-boss kurulumu, kuyruk kayıt defteri, ayrı kuyruk önceliği (bildirim / bakım / medya ayrımına hazır)
- Handler sarmalayıcı: her iş `organization_id`, sistem eylemi ve hedef kayıt kapsamıyla doğrulanır; handler idempotent; `kiana_worker` dar rolüyle çalışır (genel bypass yok)
- Yeniden deneme: kesin geçici hatada üstel geri deneme + jitter (varsayılan en çok 5), kalıcı hata tekrar edilmez; başarısız iş görünümü (K16'daki `FailedJobs` ekranı bunu okuyacak)
- Süre dolumu/bakım işleri için zamanlayıcı iskeleti (içerik K05'te); düzgün kapanış; sağlık ucu

**Kabul**
- Worker çökmesi sonrası iş yeniden alınır; aynı iş iki kez çalışırsa tek etki (stub handler testi)
- Kapsamsız (organization_id'siz) iş reddedilir

**Kapsam dışı:** Gerçek bildirim handler'ları K10'dadır; medya işçisi K11'dedir.

**Oku:** `AGENTS.md`, §12.4, §17.2, §19.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K21-03](K21-yonetim-kabugu-takvim.md#K21-03)

**Bunu bekleyenler:** [K04-10](K04-outbox-audit-isci.md#K04-10), [K11-07](K11-medya-temeli.md#K11-07), [K11-09](K11-medya-temeli.md#K11-09), [K11-13](K11-medya-temeli.md#K11-13), [K16-04](K16-yonetim-butunlestirme.md#K16-04)

---

<a id="K04-06"></a>
## K04-06 · Audit: append-only kayıt ve AuditSink'in gerçek yazıcıya bağlanması

**Boyut:** M · **Dalga:** 18 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-12](K03-kimlik-uyelik.md#K03-12)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/audit.ts`, `packages/db/migrations/*_audit_event.sql`, `packages/application/src/audit/`, `tests/security/audit/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `audit_event`: aktör (tür+kimlik), eylem, hedef, gerekçe, correlation id; uygulama rolü için yalnız INSERT (UPDATE/DELETE yetkisi ve tetikleyici engeli)
- K02-05'te tanımlanan `AuditSink` portunun gerçek yazıcısı; K03'ün (bootstrap, MFA sıfırlama, davet, rol ataması) bellek/log tabanlı çağrıları gerçek yazıcıya bağlanır
- Redaksiyon: token, cookie, OTP, SMS içeriği, object URL ve Authorization değerleri denetime yazılmaz
- Veri envanteri güncellenir

**Kabul**
- Uygulama rolü bir denetim kaydını UPDATE/DELETE edemez (testle)
- Redaksiyon testi: bilinen gizli değerler kayıtta görünmez

**Oku:** `AGENTS.md`, §17.4, §17.5, §18.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-01](K04-outbox-audit-isci.md#K04-01), [K04-02](K04-outbox-audit-isci.md#K04-02), [K04-04](K04-outbox-audit-isci.md#K04-04), [K04-07](K04-outbox-audit-isci.md#K04-07), [K04-08](K04-outbox-audit-isci.md#K04-08), [K21-01](K21-yonetim-kabugu-takvim.md#K21-01)

**Bunu bekleyenler:** [K04-09](K04-outbox-audit-isci.md#K04-09), [K04-10](K04-outbox-audit-isci.md#K04-10), [K16-01](K16-yonetim-butunlestirme.md#K16-01), [K16-03](K16-yonetim-butunlestirme.md#K16-03)

---

<a id="K04-07"></a>
## K04-07 · Gözlemlenebilirlik: yapılandırılmış log, redaksiyon, correlation id

**Boyut:** M · **Dalga:** 18 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-12](K03-kimlik-uyelik.md#K03-12)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/observability/`, `apps/web/src/instrumentation/`

**Teslim edilecekler**
- Yapılandırılmış logger; ortak redaksiyon kuralları (Authorization, cookie, OTP, davet token'ı, SMS içeriği, object URL, sağlayıcı sırları, mesaj gövdesi)
- Correlation id üretimi/yayılımı (web → worker); hata sayfası stack/SQL/sağlayıcı sırrı göstermez
- OpenTelemetry uyumlu ölçüm iskeleti; ölçüm adları §19.3 listesine göre; sağlayıcıya bağımlı değil

**Kabul**
- Redaksiyon birim testleri: bilinen gizli desenler logda `[redacted]`
- Hata yanıtında yığın izi ve SQL yok (testle)

**Oku:** `AGENTS.md`, §17.3, §17.4, §19.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-01](K04-outbox-audit-isci.md#K04-01), [K04-02](K04-outbox-audit-isci.md#K04-02), [K04-04](K04-outbox-audit-isci.md#K04-04), [K04-06](K04-outbox-audit-isci.md#K04-06), [K04-08](K04-outbox-audit-isci.md#K04-08), [K21-01](K21-yonetim-kabugu-takvim.md#K21-01)

**Bunu bekleyenler:** [K04-10](K04-outbox-audit-isci.md#K04-10)

---

<a id="K04-08"></a>
## K04-08 · deletion_ledger ve yeniden uygulama iskeleti

**Boyut:** M · **Dalga:** 18 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-12](K03-kimlik-uyelik.md#K03-12)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/deletion-ledger.ts`, `packages/db/migrations/*_deletion_ledger.sql`, `packages/application/src/lifecycle/`, `tests/integration/lifecycle/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `deletion_ledger`: silinen kaynağın türü/kimliği, silme kapsamı (aktif DB, nesneler, türevler, arşiv, yedek takvimi), zaman, neden/talep bağı, legal hold işareti; kayıtta kişisel veri içeriği yok
- `applyDeletionLedger()` iskeleti: yedekten dönüşten sonra defterdeki silmeleri, iptal edilen üyelikleri ve kapatılan yayınları yeniden uygular (kaynak türleri sonraki kartlar eklendikçe genişler)
- Kayıt türü kayıt defteri: yeni modül silme kapsamını buraya kaydetmek zorunda

**Kabul**
- Silinen kaydı geri yüklenmiş DB kopyasında yeniden siler (T-29 iskelet testi)
- Legal hold işaretli kayıt silinmez ve raporlanır
- Bu paketin geçmesi gereken şartname testleri: T-29 (§20.1).

**Kapsam dışı:** Gerçek restore tatbikatı ve RPO/RTO ölçümü K17'dedir; T-29'un tam hali orada.

**Oku:** `AGENTS.md`, §17.5, §19.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-01](K04-outbox-audit-isci.md#K04-01), [K04-02](K04-outbox-audit-isci.md#K04-02), [K04-04](K04-outbox-audit-isci.md#K04-04), [K04-06](K04-outbox-audit-isci.md#K04-06), [K04-07](K04-outbox-audit-isci.md#K04-07), [K21-01](K21-yonetim-kabugu-takvim.md#K21-01)

**Bunu bekleyenler:** [K04-09](K04-outbox-audit-isci.md#K04-09), [K04-10](K04-outbox-audit-isci.md#K04-10), [K17-03](K17-staging-kabul.md#K17-03)

---

<a id="K04-09"></a>
## K04-09 · İlgili kişi başvurusu: data_subject_request ve süre sayacı

**Boyut:** M · **Dalga:** 19 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K04-08](K04-outbox-audit-isci.md#K04-08), [K04-06](K04-outbox-audit-isci.md#K04-06)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/data-subject-request.ts`, `packages/db/migrations/*_data_subject_request.sql`, `packages/application/src/data-subject/`, `apps/web/app/api/me/data-requests/`, `tests/integration/data-subject/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `data_subject_request` (erişim/düzeltme/silme), durumlar ve yanıt süresi sayacı (KVKK'da en geç 30 gün; süreler işletme/uzmanca doğrulanır)
- `POST /api/me/data-requests` (müşteri oturumu): kimlik doğrulaması §7.1 madde 8 gibi denetlenebilir; başka kişinin verisi sızmaz
- Silme kapsamı planlayıcısı: aktif DB, nesneler, türevler, arşiv, yedek takvimi ve legal hold'u listeler; `deletion_ledger`'a yazar
- Personel listesi/süre sayacı ekranı K16'da bütünleşir (veri ve servis burada hazır)

**Kabul**
- T-40 çekirdek: kapsam planı ve silme defteri doğru, süre sayacı hesaplanıyor, başka kişinin verisi sızmıyor
- Veri envanteri güncellenir (başvuru kaydı alanları)
- Bu paketin geçmesi gereken şartname testleri: T-40 (§20.1).

**Kapsam dışı:** Fiilen nesne/medya silme işi K11 ve sonraki kartlarda kaydedilen silme kapsamlarıyla tamamlanır.

**Oku:** `AGENTS.md`, §17.5, §17.6, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-03](K04-outbox-audit-isci.md#K04-03), [K21-02](K21-yonetim-kabugu-takvim.md#K21-02)

**Bunu bekleyenler:** [K04-10](K04-outbox-audit-isci.md#K04-10), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

---

<a id="K04-10"></a>
## K04-10 · Dayanıklılık testleri: çökme, yeniden oynatma ve sahte sağlayıcı kanıtı

**Boyut:** M · **Dalga:** 21 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K04-03](K04-outbox-audit-isci.md#K04-03), [K04-04](K04-outbox-audit-isci.md#K04-04), [K04-05](K04-outbox-audit-isci.md#K04-05), [K04-06](K04-outbox-audit-isci.md#K04-06), [K04-07](K04-outbox-audit-isci.md#K04-07), [K04-08](K04-outbox-audit-isci.md#K04-08), [K04-09](K04-outbox-audit-isci.md#K04-09)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/integration/reliability/`, `docs/reports/K04-kabul.md`

**Teslim edilecekler**
- T-18: outbox commit sonrası worker çökmesi ve aynı işin tekrarı: niyet kaybolmaz, uygulama içi bildirim tekilleşir (stub tüketici ve fake sağlayıcıyla deterministik)
- Commit öncesi yan etki yok; idempotency yarışı; audit redaksiyonu; ledger yeniden uygulama zinciri
- `K04-kabul.md`: pg-boss kararı, bağlantı bütçesi, bilinen sınırlar

**Kabul**
- T-18 CI'da yeşil; çökme noktası enjeksiyonu (commit sonrası/ack öncesi) testle kanıtlı
- Bu paket birleşmeden K05 ve K11 başlamaz
- Bu paketin geçmesi gereken şartname testleri: T-18 (§20.1).

**Kapsam dışı:** Bildirim şablonları ve gerçek sağlayıcı yoktur.

**Oku:** `AGENTS.md`, §12.4, §17.5, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K16-01](K16-yonetim-butunlestirme.md#K16-01), [K16-02](K16-yonetim-butunlestirme.md#K16-02), [K16-03](K16-yonetim-butunlestirme.md#K16-03)

**Bunu bekleyenler:** [K05-01](K05-rezervasyon-motoru.md#K05-01), [K05-03](K05-rezervasyon-motoru.md#K05-03), [K07-02](K07-kurumsal-site-icerik.md#K07-02), [K08-01](K08-dugunum-pano-onay.md#K08-01), [K09-01](K09-sohbet-canli-akis.md#K09-01), [K10-03](K10-bildirim-eposta-sms.md#K10-03), [K11-02](K11-medya-temeli.md#K11-02), [K13-02](K13-davetiye-takvim.md#K13-02), [K14-02](K14-belge-odeme.md#K14-02), [K15-02](K15-chatbot.md#K15-02), [K17-02](K17-staging-kabul.md#K17-02)

---
