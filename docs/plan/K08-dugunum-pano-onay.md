# K08 — Düğünüm, pano ve onaylar

**Kilometre taşı:** M3 — Müşteri deneyimi (K08–K10) · **Şartname:** §7.2, §10.2, §10.3, §10.4, §16, §17.3 · [Plan dizini](README.md)

> Müşteri özeti (Düğünüm), müşteri paylaşımı ile ekip notunun ayrı modeli, yorumlar, görev şablonu kopyası, sürümlü seçim/onay ve personel ataması; personel çalışma alanı ekranları.

İç not ile müşteri paylaşımı **ayrı tablo ve use-case**; iç notu paylaşmak bir bayrak çevirme değil, önizlemeli yeni paylaşımdır. Uydurma ilerleme yüzdesi yok. Kullanıcı içeriği kaçışlanır (T-34).

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K08-01](K08-dugunum-pano-onay.md#K08-01) · Sözleşmeler ve domain: pano, görev, onay (durum makineleri, sınırlı zengin metin) | M | 22 | K04-10 |  |
| [K08-02](K08-dugunum-pano-onay.md#K08-02) · Pano şeması: board_post, board_comment, internal_note | M | 30 | K08-01, K06-10 | migration |
| [K08-03](K08-dugunum-pano-onay.md#K08-03) · Görev ve onay şeması: task_template, event_task, approval_request/decision, değişmez öneri sürümü | M | 30 | K08-01, K06-10 | migration |
| [K08-04](K08-dugunum-pano-onay.md#K08-04) · Personel ataması ve düğün kapsamı yetkisi | M | 30 | K06-10 | migration |
| [K08-05](K08-dugunum-pano-onay.md#K08-05) · Düğünüm özeti ve müşteri etkinlik listesi API'si | M | 31 | K08-02, K08-03, K08-04 |  |
| [K08-06](K08-dugunum-pano-onay.md#K08-06) · Müşteri paylaşımı ve yorumlar: use-case'ler ve uçlar | L | 31 | K08-02, K08-04 |  |
| [K08-07](K08-dugunum-pano-onay.md#K08-07) · İç not ve 'notu müşteriyle paylaş' akışı (önizleme + açık yayın) | M | 31 | K08-02, K08-04 |  |
| [K08-08](K08-dugunum-pano-onay.md#K08-08) · Görev şablonu yönetimi ve düğüne kopyalama | M | 31 | K08-03, K08-04 |  |
| [K08-09](K08-dugunum-pano-onay.md#K08-09) · Sürümlü seçim/onay: istek, karar, geçersizleşme | L | 31 | K08-03, K08-04 |  |
| [K08-10](K08-dugunum-pano-onay.md#K08-10) · Müşteri ekranları: Düğünüm özeti, bekleyen işler, yaklaşan görevler | L | 32 | K08-05, K08-08, K06-15 |  |
| [K08-11](K08-dugunum-pano-onay.md#K08-11) · Müşteri ekranları: pano, yorum ve onay (ProposalVersion, ApprovalControls) | L | 32 | K08-06, K08-09, K06-15 |  |
| [K08-12](K08-dugunum-pano-onay.md#K08-12) · Personel ekranı: EventWorkspace (özet, görevler, onay istekleri) | L | 32 | K08-05, K08-08, K08-09, K21-03 |  |
| [K08-13](K08-dugunum-pano-onay.md#K08-13) · Personel ekranı: pano yönetimi ve iç notlar | L | 33 | K08-06, K08-07, K08-12 |  |
| [K08-14](K08-dugunum-pano-onay.md#K08-14) · Personel ekranı: TeamAssignments | M | 31 | K08-04, K21-03 |  |
| [K08-15](K08-dugunum-pano-onay.md#K08-15) · K08 güvenlik/kabul testleri ve rapor (T-08, T-14, T-26, T-34) | M | 34 | K08-10, K08-11, K08-12, K08-13, K08-14 |  |

<a id="K08-01"></a>
## K08-01 · Sözleşmeler ve domain: pano, görev, onay (durum makineleri, sınırlı zengin metin)

**Boyut:** M · **Dalga:** 22 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K04-10](K04-outbox-audit-isci.md#K04-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/contracts/src/event-workspace/`, `packages/domain/src/event-workspace/`, `packages/domain/src/rich-text/`

**Teslim edilecekler**
- Zod/DTO'lar: `EventSummary`, `BoardPost`, `Comment`, `InternalNote`, `EventTask`, `ApprovalRequest`/`Decision`; endpoint yolları (§18.2) kilitlenir
- Durum makineleri: pano `draft → published → withdrawn`; onay `draft → awaiting_customer → approved | changes_requested → superseded`; görev durumları
- Sınırlı zengin metin modeli (izinli biçim kümesi) + **sunucu tarafı temizleyici**; serbest HTML/script/iframe yok; düz metin varsayılan
- Ortak sözleşme: K08 tüketici işlerinden önce küçük PR

**Kabul**
- Durum makinesi tablo testleri; temizleyici için XSS yük listesi testi (T-34 temeli)
- Müşteri DTO'ları ile iç not DTO'su tipte ayrıdır (birbirine atanamaz)

**Kapsam dışı:** DB ve ekran yok.

**Oku:** `AGENTS.md`, §10.3, §10.4, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-01](K05-rezervasyon-motoru.md#K05-01), [K07-02](K07-kurumsal-site-icerik.md#K07-02), [K09-01](K09-sohbet-canli-akis.md#K09-01), [K10-03](K10-bildirim-eposta-sms.md#K10-03), [K11-02](K11-medya-temeli.md#K11-02), [K16-05](K16-yonetim-butunlestirme.md#K16-05)

**Bunu bekleyenler:** [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-03](K08-dugunum-pano-onay.md#K08-03)

---

<a id="K08-02"></a>
## K08-02 · Pano şeması: board_post, board_comment, internal_note

**Boyut:** M · **Dalga:** 30 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-01](K08-dugunum-pano-onay.md#K08-01), [K06-10](K06-talep-ziyaret-teklif.md#K06-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/board.ts`, `packages/db/migrations/*_board_schema.sql`, `packages/db/src/rls/board.ts`, `tests/integration/db/board/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `board_post` (sürümlü güncelleme, durum, hedef kitle daima görünür), `board_comment` (üst kaydın erişimini aşamaz), `internal_note` (**ayrı tablo**, yalnız yetkili personel RLS)
- Düğüne bağlı çocuk kayıtlarda `organization_id + event_id` composite FK (K02-04 şablonu)
- Ek referansları medya tablosuna K11'de bağlanacak yer tutucu sütun (FK'sız) — K11 FK ekler
- RLS politikaları, veri envanteri satırları

**Kabul**
- Farklı düğüne ait post'a yorum bağlama DB'de reddedilir; `internal_note` müşteri rolü için RLS ile görünmez (T-08 uzantısı)
- Müşteri post'u ile iç not tek tabloda birleşemez (şema)

**Kapsam dışı:** Use-case'ler K08-06/07'dedir.

**Oku:** `AGENTS.md`, §8, §8.1, §10.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-11](K06-talep-ziyaret-teklif.md#K06-11), [K06-14](K06-talep-ziyaret-teklif.md#K06-14), [K08-03](K08-dugunum-pano-onay.md#K08-03), [K08-04](K08-dugunum-pano-onay.md#K08-04), [K12-06](K12-galeri-oynatici.md#K12-06), [K13-09](K13-davetiye-takvim.md#K13-09), [K13-13](K13-davetiye-takvim.md#K13-13), [K15-10](K15-chatbot.md#K15-10)

**Bunu bekleyenler:** [K08-05](K08-dugunum-pano-onay.md#K08-05), [K08-06](K08-dugunum-pano-onay.md#K08-06), [K08-07](K08-dugunum-pano-onay.md#K08-07)

---

<a id="K08-03"></a>
## K08-03 · Görev ve onay şeması: task_template, event_task, approval_request/decision, değişmez öneri sürümü

**Boyut:** M · **Dalga:** 30 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-01](K08-dugunum-pano-onay.md#K08-01), [K06-10](K06-talep-ziyaret-teklif.md#K06-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/tasks-approvals.ts`, `packages/db/migrations/*_tasks_approvals_schema.sql`, `packages/db/src/rls/tasks-approvals.ts`, `tests/integration/db/tasks-approvals/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `task_template` (sürümlü), `event_task` (düğüne kopya: sorumlu, vade, durum), `proposal_version` (değişmez içerik + hash), `approval_request`, `approval_decision` (hangi sürüme, kim, ne zaman; yetkili onaylayıcı listesi)
- Composite FK'ler, RLS, veri envanteri; yetkili onaylayıcı bilgisi `event_member` izinleriyle uyumlu (mali/önemli onay için belirlenmiş kişi)
- `proposal_version` yazıldıktan sonra güncellenemez

**Kabul**
- Onay kararı yalnız ilgili değişmez sürüme bağlanır; sürüm içeriği güncellenemez (DB düzeyi)
- Başka düğünün görev/onay satırına erişim RLS ile reddedilir

**Kapsam dışı:** Use-case'ler K08-08/09'dadır.

**Oku:** `AGENTS.md`, §8, §10.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-11](K06-talep-ziyaret-teklif.md#K06-11), [K06-14](K06-talep-ziyaret-teklif.md#K06-14), [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-04](K08-dugunum-pano-onay.md#K08-04), [K12-06](K12-galeri-oynatici.md#K12-06), [K13-09](K13-davetiye-takvim.md#K13-09), [K13-13](K13-davetiye-takvim.md#K13-13), [K15-10](K15-chatbot.md#K15-10)

**Bunu bekleyenler:** [K08-05](K08-dugunum-pano-onay.md#K08-05), [K08-08](K08-dugunum-pano-onay.md#K08-08), [K08-09](K08-dugunum-pano-onay.md#K08-09)

---

<a id="K08-04"></a>
## K08-04 · Personel ataması ve düğün kapsamı yetkisi

**Boyut:** M · **Dalga:** 30 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K06-10](K06-talep-ziyaret-teklif.md#K06-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/assignments/`, `apps/web/app/api/admin/events/*/assignments/`, `packages/db/migrations/*_assignment_rls.sql`, `tests/integration/assignments/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `staff_assignment` use-case'leri: koordinatör düğüne atanır/ayrılır; atanan koordinatör yalnız atandığı düğünleri görür; yönetici/sahip işletme kapsamı; atama değişimi denetime ve `membershipRevoked`-benzeri personel kapsam olayına yazılır
- RLS yardımcıları K02-06 desenine göre atama kapsamını okur; `SECURITY DEFINER` kuralları aynı
- Atanma, düğün çalışma alanı ve sohbet erişimi için tek kaynak (K09 tüketir)

**Kabul**
- Atanmamış koordinatör düğünü göremez (RLS + use-case); atama kaldırılınca yeni isteklerde erişim kapanır
- T-08 uzantısı: atanmamış personel başka düğünün post/görev/onay ID'sini deneyince hiçbir şey dönmez

**Kapsam dışı:** Ekran K08-14'tedir.

**Oku:** `AGENTS.md`, §7.2, §17.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-11](K06-talep-ziyaret-teklif.md#K06-11), [K06-14](K06-talep-ziyaret-teklif.md#K06-14), [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-03](K08-dugunum-pano-onay.md#K08-03), [K12-06](K12-galeri-oynatici.md#K12-06), [K13-09](K13-davetiye-takvim.md#K13-09), [K13-13](K13-davetiye-takvim.md#K13-13), [K15-10](K15-chatbot.md#K15-10)

**Bunu bekleyenler:** [K08-05](K08-dugunum-pano-onay.md#K08-05), [K08-06](K08-dugunum-pano-onay.md#K08-06), [K08-07](K08-dugunum-pano-onay.md#K08-07), [K08-08](K08-dugunum-pano-onay.md#K08-08), [K08-09](K08-dugunum-pano-onay.md#K08-09), [K08-14](K08-dugunum-pano-onay.md#K08-14), [K09-02](K09-sohbet-canli-akis.md#K09-02)

---

<a id="K08-05"></a>
## K08-05 · Düğünüm özeti ve müşteri etkinlik listesi API'si

**Boyut:** M · **Dalga:** 31 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-03](K08-dugunum-pano-onay.md#K08-03), [K08-04](K08-dugunum-pano-onay.md#K08-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/event-summary/`, `apps/web/app/api/me/events/`, `apps/web/app/api/events/*/summary/`, `tests/integration/event-summary/`

**Teslim edilecekler**
- `GET /api/me/events` (yalnız üyelikleri), `GET /api/events/:id/summary`: tarih/alan, sorumlu ekip, son müşteri gelişmeleri, yaklaşan üç görev, bekleyen onaylar; gecikmiş işler açıklanır; **bilinmeyen hizmet/hazırlık yüzdesi uydurulmaz**
- İptal edilen etkinlik yazmaya kapalı olabilir; erişim/saklama politikası ayrı uygulanır (§10.2)
- DTO allowlist; yakın rolü varsayılan yalnız plan ve seçili pano (belge/ödeme/özel sohbet yok)

**Kabul**
- Yetkili özet DTO'su; farklı üye/etkinlik ID'sinde 404/403 ve metadata sızıntısı yok
- Yakın rolü senaryosu: kısıtlı içerik

**Kapsam dışı:** Ekran K08-10'dadır.

**Oku:** `AGENTS.md`, §7.2, §10.2, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-15](K06-talep-ziyaret-teklif.md#K06-15), [K08-06](K08-dugunum-pano-onay.md#K08-06), [K08-07](K08-dugunum-pano-onay.md#K08-07), [K08-08](K08-dugunum-pano-onay.md#K08-08), [K08-09](K08-dugunum-pano-onay.md#K08-09), [K08-14](K08-dugunum-pano-onay.md#K08-14), [K09-02](K09-sohbet-canli-akis.md#K09-02)

**Bunu bekleyenler:** [K08-10](K08-dugunum-pano-onay.md#K08-10), [K08-12](K08-dugunum-pano-onay.md#K08-12)

---

<a id="K08-06"></a>
## K08-06 · Müşteri paylaşımı ve yorumlar: use-case'ler ve uçlar

**Boyut:** L · **Dalga:** 31 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-04](K08-dugunum-pano-onay.md#K08-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/board/`, `apps/web/app/api/events/*/posts/`, `apps/web/app/api/events/*/comments/`, `tests/integration/board/`

**Teslim edilecekler**
- `GET/POST /api/events/:id/posts`: taslak/yayımlanmış/geri çekilmiş; güncelleme sürümlenir; önemli değişiklik `event.post_published.v1` outbox'ı (bildirim K10); yorumlar üst kaydın erişimini aşamaz; geri çekilen paylaşımın ekleri eski bağlantıyla açılmaz
- Sunucu tarafı temizleyici (K08-01): script/HTML kaçışlanır; `version` ile iyimser eşzamanlılık (`409`)
- İzin kapsamı: kimler paylaşabilir/yorumlar; `status`, `role`, `visibility` istemciden alınmaz

**Kabul**
- T-34 pano/yorum kısmı: script/HTML enjeksiyonu kaçışlanır/temizlenir
- Müşteri A, B'nin post/yorum ID'sini dener: hiçbir içerik/metadata dönmez
- Bu paketin geçmesi gereken şartname testleri: T-34 (§20.1).

**Kapsam dışı:** İç not ve iç notu paylaşma K08-07'dedir; dosya eki gerçek yüklemesi K11'dedir.

**Oku:** `AGENTS.md`, §10.3, §17.3, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-15](K06-talep-ziyaret-teklif.md#K06-15), [K08-05](K08-dugunum-pano-onay.md#K08-05), [K08-07](K08-dugunum-pano-onay.md#K08-07), [K08-08](K08-dugunum-pano-onay.md#K08-08), [K08-09](K08-dugunum-pano-onay.md#K08-09), [K08-14](K08-dugunum-pano-onay.md#K08-14), [K09-02](K09-sohbet-canli-akis.md#K09-02)

**Bunu bekleyenler:** [K08-11](K08-dugunum-pano-onay.md#K08-11), [K08-13](K08-dugunum-pano-onay.md#K08-13), [K11-15](K11-medya-temeli.md#K11-15)

---

<a id="K08-07"></a>
## K08-07 · İç not ve 'notu müşteriyle paylaş' akışı (önizleme + açık yayın)

**Boyut:** M · **Dalga:** 31 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-04](K08-dugunum-pano-onay.md#K08-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/internal-notes/`, `apps/web/app/api/admin/events/*/notes/`, `tests/integration/internal-notes/`

**Teslim edilecekler**
- `internal_note` use-case'leri (ayrı endpoint); ortak editörde varsayılan iç not, hedef kitle her zaman görünür
- 'Paylaş': seçilen içerikten **yeni** `board_post` taslağı hazırlanır, önizlenir, açıkça yayımlanır; iç yorum zinciri aktarılmaz; bayrak çevirme yok
- Müşteri DTO/uç yolları iç nota hiçbir koşulda erişmez (tip + RLS + test)

**Kabul**
- T-14 (iç not tarafı): aynı iç not müşteri zincirine taşınmaz; müşteriye içerik/bildirim gitmez
- Paylaşılan post'ta iç yorumlar/ek metadata yok
- Bu paketin geçmesi gereken şartname testleri: T-14 (§20.1).

**Kapsam dışı:** SMS/bildirim seçeneği manipülasyonunun bildirim tarafı K10-13'tedir.

**Oku:** `AGENTS.md`, §10.3, §17.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-15](K06-talep-ziyaret-teklif.md#K06-15), [K08-05](K08-dugunum-pano-onay.md#K08-05), [K08-06](K08-dugunum-pano-onay.md#K08-06), [K08-08](K08-dugunum-pano-onay.md#K08-08), [K08-09](K08-dugunum-pano-onay.md#K08-09), [K08-14](K08-dugunum-pano-onay.md#K08-14), [K09-02](K09-sohbet-canli-akis.md#K09-02)

**Bunu bekleyenler:** [K08-13](K08-dugunum-pano-onay.md#K08-13), [K10-13](K10-bildirim-eposta-sms.md#K10-13)

---

<a id="K08-08"></a>
## K08-08 · Görev şablonu yönetimi ve düğüne kopyalama

**Boyut:** M · **Dalga:** 31 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-03](K08-dugunum-pano-onay.md#K08-03), [K08-04](K08-dugunum-pano-onay.md#K08-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/tasks/`, `apps/web/app/api/events/*/tasks/`, `apps/web/app/api/admin/task-templates/`, `tests/integration/tasks/`

**Teslim edilecekler**
- Şablon sürümleri (etkinlik türüne göre veri olarak); düğüne **kopya** — sonraki şablon değişikliği eski düğünleri sessizce değiştirmez; görev sorumlusu, vade, durum, tamamlama; gecikmiş görev hesabı
- Müşteri yalnız kendisine açık görevleri görür/tamamlar; personel atama kapsamında
- Kopyalama etkinlik oluşturulunca ve elle tetiklenebilir; idempotent

**Kabul**
- Şablon değişikliği mevcut düğün görevlerini değiştirmez (test)
- Başka düğünün görevine yazma reddedilir

**Kapsam dışı:** Ekranlar K08-10/12'dedir.

**Oku:** `AGENTS.md`, §8, §10.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-15](K06-talep-ziyaret-teklif.md#K06-15), [K08-05](K08-dugunum-pano-onay.md#K08-05), [K08-06](K08-dugunum-pano-onay.md#K08-06), [K08-07](K08-dugunum-pano-onay.md#K08-07), [K08-09](K08-dugunum-pano-onay.md#K08-09), [K08-14](K08-dugunum-pano-onay.md#K08-14), [K09-02](K09-sohbet-canli-akis.md#K09-02)

**Bunu bekleyenler:** [K08-10](K08-dugunum-pano-onay.md#K08-10), [K08-12](K08-dugunum-pano-onay.md#K08-12)

---

<a id="K08-09"></a>
## K08-09 · Sürümlü seçim/onay: istek, karar, geçersizleşme

**Boyut:** L · **Dalga:** 31 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-03](K08-dugunum-pano-onay.md#K08-03), [K08-04](K08-dugunum-pano-onay.md#K08-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/approvals/`, `apps/web/app/api/approvals/`, `apps/web/app/api/admin/approvals/`, `tests/integration/approvals/`

**Teslim edilecekler**
- Personel değişmez `proposal_version` sunar (`awaiting_customer`); `POST /api/approvals/:id/decisions` yetkili onaylayıcı + sürüm/hash + idempotency; karar o sürüme bağlanır
- İçerik değişirse eski onay yeni sürümde kullanılamaz (`superseded`); onaylayanın **o anda** yetkili olduğu doğrulanır; yetkisi kalkan kişi karar veremez
- Metin: uygulama onayı nitelikli elektronik imza olarak adlandırılmaz
- Outbox: `approval.requested.v1`, `approval.decided.v1`

**Kabul**
- T-26: eski teklif/onay sürümünü onaylama veya eski ekranla güncelleme → `409` veya güvenli reddetme; yeni sürüm sessizce onaylanmaz
- Yetkisiz üye (ör. yakın rolü) onay veremez
- Bu paketin geçmesi gereken şartname testleri: T-26 (§20.1).

**Kapsam dışı:** Mali/ödeme onayları K14'te bu mekanizmayı kullanır.

**Oku:** `AGENTS.md`, §10.4, §17.2, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-15](K06-talep-ziyaret-teklif.md#K06-15), [K08-05](K08-dugunum-pano-onay.md#K08-05), [K08-06](K08-dugunum-pano-onay.md#K08-06), [K08-07](K08-dugunum-pano-onay.md#K08-07), [K08-08](K08-dugunum-pano-onay.md#K08-08), [K08-14](K08-dugunum-pano-onay.md#K08-14), [K09-02](K09-sohbet-canli-akis.md#K09-02)

**Bunu bekleyenler:** [K08-11](K08-dugunum-pano-onay.md#K08-11), [K08-12](K08-dugunum-pano-onay.md#K08-12), [K10-13](K10-bildirim-eposta-sms.md#K10-13), [K14-06](K14-belge-odeme.md#K14-06)

---

<a id="K08-10"></a>
## K08-10 · Müşteri ekranları: Düğünüm özeti, bekleyen işler, yaklaşan görevler

**Boyut:** L · **Dalga:** 32 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-05](K08-dugunum-pano-onay.md#K08-05), [K08-08](K08-dugunum-pano-onay.md#K08-08), [K06-15](K06-talep-ziyaret-teklif.md#K06-15)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(customer)/dugunum/page.tsx`, `apps/web/app/(customer)/dugunum/gorevler/`, `apps/web/src/customer/event-home/`, `apps/web/src/customer/nav/dugunum.ts`, `tests/e2e/customer-event-home/`

**Teslim edilecekler**
- `EventSummary`, `PendingActions`, `UpcomingTasks`, `RecentUpdates` bileşenleri; arayüz metni etkinlik türüne göre ('Düğünüm'/'Etkinliğim'); gecikmiş işlerin açıklaması
- Yükleniyor/boş/hata/yetkisiz durumları; mobil ve klavye; `no-store`
- Uydurma ilerleme yüzdesi yok; bilinmeyen alanlar 'henüz belirlenmedi' gösterilir

**Kabul**
- Playwright: iki müşteri ve yakın rolü senaryosu (içerik kapsamı farklı)
- Başka düğünün özeti URL ile açılamaz

**Kapsam dışı:** Pano ve onay ekranları K08-11'dedir.

**Oku:** `AGENTS.md`, §10.2, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-16](K06-talep-ziyaret-teklif.md#K06-16), [K08-11](K08-dugunum-pano-onay.md#K08-11), [K08-12](K08-dugunum-pano-onay.md#K08-12), [K09-03](K09-sohbet-canli-akis.md#K09-03), [K09-04](K09-sohbet-canli-akis.md#K09-04), [K13-11](K13-davetiye-takvim.md#K13-11), [K14-06](K14-belge-odeme.md#K14-06)

**Bunu bekleyenler:** [K08-15](K08-dugunum-pano-onay.md#K08-15), [K13-10](K13-davetiye-takvim.md#K13-10)

---

<a id="K08-11"></a>
## K08-11 · Müşteri ekranları: pano, yorum ve onay (ProposalVersion, ApprovalControls)

**Boyut:** L · **Dalga:** 32 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-06](K08-dugunum-pano-onay.md#K08-06), [K08-09](K08-dugunum-pano-onay.md#K08-09), [K06-15](K06-talep-ziyaret-teklif.md#K06-15)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(customer)/dugunum/pano/`, `apps/web/app/(customer)/dugunum/onaylar/`, `apps/web/src/customer/board/`, `apps/web/src/customer/approvals/`, `tests/e2e/customer-board/`

**Teslim edilecekler**
- `PostList`, `PostDetail`, `CommentComposer`, `AttachmentList` (ek gerçek yüklemesi K11'e kadar yer tutucu), `ProposalVersion`, `ApprovalControls`, `DecisionHistory`
- Sayfalı yükleme; kullanıcı içeriği güvenli render (kaçışlanmış); eski sürüm ekranında 'yeni sürüm var' uyarısı ve `409` iletisi

**Kabul**
- Playwright: yorum yaz, post oku, eski sürümü onaylamaya çalış → güvenli ret; script içeren yorum çalışmaz (T-34 UI)
- Yakın rolü onay düğmesi görmez
- Bu paketin geçmesi gereken şartname testleri: T-34 (§20.1).

**Kapsam dışı:** Sohbet ekranı K09-07'dedir.

**Oku:** `AGENTS.md`, §10.3, §10.4, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-16](K06-talep-ziyaret-teklif.md#K06-16), [K08-10](K08-dugunum-pano-onay.md#K08-10), [K08-12](K08-dugunum-pano-onay.md#K08-12), [K09-03](K09-sohbet-canli-akis.md#K09-03), [K09-04](K09-sohbet-canli-akis.md#K09-04), [K13-11](K13-davetiye-takvim.md#K13-11), [K14-06](K14-belge-odeme.md#K14-06)

**Bunu bekleyenler:** [K08-15](K08-dugunum-pano-onay.md#K08-15), [K11-15](K11-medya-temeli.md#K11-15), [K13-10](K13-davetiye-takvim.md#K13-10), [K16-09](K16-yonetim-butunlestirme.md#K16-09)

---

<a id="K08-12"></a>
## K08-12 · Personel ekranı: EventWorkspace (özet, görevler, onay istekleri)

**Boyut:** L · **Dalga:** 32 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-05](K08-dugunum-pano-onay.md#K08-05), [K08-08](K08-dugunum-pano-onay.md#K08-08), [K08-09](K08-dugunum-pano-onay.md#K08-09), [K21-03](K21-yonetim-kabugu-takvim.md#K21-03)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/event-workspace/`, `apps/web/app/(admin)/dugunler/`, `apps/web/src/admin/nav/dugunler.ts`, `tests/e2e/admin-event-workspace/`

**Teslim edilecekler**
- Düğün listesi (atama/işletme kapsamına göre), `EventWorkspace` sekmeleri: özet, görevler (şablondan kopyalama dahil), onay istekleri (sürüm hazırla/gönder/sürüm farkı)
- Yükleniyor/boş/hata/yetkisiz durumları; izne göre eylemler
- Sekme kaydı: `registerWorkspaceTab({id, label, permission, component})` (`apps/web/src/admin/event-workspace/tab-registry.ts`); sonraki kartlar (sohbet, pano, belgeler/ödeme, yayın) kendi sekmelerini kayıtla ekler, EventWorkspace dosyasını değiştirmez

**Kabul**
- Playwright: görev oluştur/ata, onay isteği gönder; atanmamış koordinatör düğünü listede görmez
- İzinsiz eylem düğmeleri yok ve API 403

**Kapsam dışı:** Pano/iç not ekranı K08-13'tedir.

**Oku:** `AGENTS.md`, §16, §7.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-16](K06-talep-ziyaret-teklif.md#K06-16), [K08-10](K08-dugunum-pano-onay.md#K08-10), [K08-11](K08-dugunum-pano-onay.md#K08-11), [K09-03](K09-sohbet-canli-akis.md#K09-03), [K09-04](K09-sohbet-canli-akis.md#K09-04), [K13-11](K13-davetiye-takvim.md#K13-11), [K14-06](K14-belge-odeme.md#K14-06)

**Bunu bekleyenler:** [K08-13](K08-dugunum-pano-onay.md#K08-13), [K08-15](K08-dugunum-pano-onay.md#K08-15), [K13-12](K13-davetiye-takvim.md#K13-12), [K14-08](K14-belge-odeme.md#K14-08), [K16-08](K16-yonetim-butunlestirme.md#K16-08)

---

<a id="K08-13"></a>
## K08-13 · Personel ekranı: pano yönetimi ve iç notlar

**Boyut:** L · **Dalga:** 33 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-06](K08-dugunum-pano-onay.md#K08-06), [K08-07](K08-dugunum-pano-onay.md#K08-07), [K08-12](K08-dugunum-pano-onay.md#K08-12)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/event-board/`, `apps/web/app/(admin)/dugunler/*/pano/`, `tests/e2e/admin-event-board/`

**Teslim edilecekler**
- Müşteri paylaşımı hazırlama (taslak/önizleme/yayın/geri çekme), yorumları görme, iç not editörü (**hedef kitle her zaman görünür**), 'müşteriyle paylaş' önizleme akışı
- SMS/bildirim kutusu K10-15'te bağlanır (burada yok)

**Kabul**
- Playwright: iç notu paylaş → önizleme → açık yayın; iç yorum zinciri müşteri görünümünde yok
- T-14 UI tarafı: iç not ekranından müşteriye gönderim yolu yok
- Bu paketin geçmesi gereken şartname testleri: T-14 (§20.1).

**Kapsam dışı:** Bildirim seçeneği K10'dadır.

**Oku:** `AGENTS.md`, §10.3, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K07-10](K07-kurumsal-site-icerik.md#K07-10), [K09-05](K09-sohbet-canli-akis.md#K09-05), [K09-06](K09-sohbet-canli-akis.md#K09-06), [K10-06](K10-bildirim-eposta-sms.md#K10-06), [K11-15](K11-medya-temeli.md#K11-15), [K13-10](K13-davetiye-takvim.md#K13-10), [K13-12](K13-davetiye-takvim.md#K13-12), [K14-07](K14-belge-odeme.md#K14-07), [K14-08](K14-belge-odeme.md#K14-08)

**Bunu bekleyenler:** [K08-15](K08-dugunum-pano-onay.md#K08-15), [K10-15](K10-bildirim-eposta-sms.md#K10-15)

---

<a id="K08-14"></a>
## K08-14 · Personel ekranı: TeamAssignments

**Boyut:** M · **Dalga:** 31 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-04](K08-dugunum-pano-onay.md#K08-04), [K21-03](K21-yonetim-kabugu-takvim.md#K21-03)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/team-assignments/`, `apps/web/app/(admin)/ekip/`, `apps/web/src/admin/nav/ekip.ts`, `tests/e2e/admin-team/`

**Teslim edilecekler**
- Koordinatör atama/ayırma, düğün başına sorumlu ekip görünümü; izin `staff.manage`/atama izni; değişiklikler denetim kaydında
- Rol/izin yönetimi (izin paketleri) K16'dadır

**Kabul**
- Playwright: atama ve ayırma; ayrılan koordinatör bir sonraki istekte erişimi kaybeder
- İzinsiz personelde ekran yok

**Kapsam dışı:** İzin paketi düzenleme, `AccessReview` K16'dadır.

**Oku:** `AGENTS.md`, §7.2, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-15](K06-talep-ziyaret-teklif.md#K06-15), [K08-05](K08-dugunum-pano-onay.md#K08-05), [K08-06](K08-dugunum-pano-onay.md#K08-06), [K08-07](K08-dugunum-pano-onay.md#K08-07), [K08-08](K08-dugunum-pano-onay.md#K08-08), [K08-09](K08-dugunum-pano-onay.md#K08-09), [K09-02](K09-sohbet-canli-akis.md#K09-02)

**Bunu bekleyenler:** [K08-15](K08-dugunum-pano-onay.md#K08-15)

---

<a id="K08-15"></a>
## K08-15 · K08 güvenlik/kabul testleri ve rapor (T-08, T-14, T-26, T-34)

**Boyut:** M · **Dalga:** 34 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-10](K08-dugunum-pano-onay.md#K08-10), [K08-11](K08-dugunum-pano-onay.md#K08-11), [K08-12](K08-dugunum-pano-onay.md#K08-12), [K08-13](K08-dugunum-pano-onay.md#K08-13), [K08-14](K08-dugunum-pano-onay.md#K08-14)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/security/event-workspace/`, `tests/e2e/event-workspace-acceptance/`, `docs/reports/K08-kabul.md`

**Teslim edilecekler**
- T-08 (post/yorum/görev/onay/atama kimlikleri), T-14, T-26, T-34 tek komutla (`pnpm test:event-workspace`)
- İki müşteri + yakın rolü + atanmış/atanmamış personel fikstürü; aynı iç not müşteri zincirine taşınmaz kanıtı
- `K08-kabul.md`: kapsam, bilinen sınırlar

**Kabul**
- Dört test CI'da yeşil; kullanıcı içeriği kaçışlanır; çalıştırılamayan test varsa nedeni yazılı
- Bu paketin geçmesi gereken şartname testleri: T-08, T-14, T-26, T-34 (§20.1).

**Kapsam dışı:** Belge/ödeme/medya/mesaj kimliklerinin T-08 kapsamı ilgili kartlarda tamamlanır.

**Oku:** `AGENTS.md`, §10, §17.3, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K09-07](K09-sohbet-canli-akis.md#K09-07), [K09-08](K09-sohbet-canli-akis.md#K09-08), [K10-07](K10-bildirim-eposta-sms.md#K10-07), [K10-14](K10-bildirim-eposta-sms.md#K10-14), [K11-16](K11-medya-temeli.md#K11-16), [K13-14](K13-davetiye-takvim.md#K13-14), [K14-09](K14-belge-odeme.md#K14-09)

**Bunu bekleyenler:** [K10-18](K10-bildirim-eposta-sms.md#K10-18), [K16-11](K16-yonetim-butunlestirme.md#K16-11)

---
