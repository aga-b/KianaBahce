# K16 — Yönetim bütünleştirmesi

**Kilometre taşı:** M5 — Bütünleştirme, kabul ve yayın (K16–K18) · **Şartname:** §7.2, §16, §19.3 · [Plan dizini](README.md)

> Kartların kendi yönetim ekranlarını tek personel ve müşteri deneyiminde birleştirme: gezinti, günlük pano, izin yönetimi, oturum iptali, denetim ve başarısız iş görünümleri, KVKK başvuru ekranı, operasyon ayarları ve baştan sona senaryo.

Her modül kendi ekranını kendi kartında teslim etti; bu kartta **yeni iş mantığı yoktur**, yalnız bütünleştirme, yönetim güvenliği ekranları ve baştan sona kanıt vardır. Modüllerin kendi paketlerine (başka kartın `paths` alanına) dokunulmaz; eksik görülen şey o karta düzeltme issue'su olarak açılır. Hassas aksiyonlarda yeniden doğrulama ve gerekçe zorunludur.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K16-01](K16-yonetim-butunlestirme.md#K16-01) · Personel ve izin yönetimi: StaffMembers, rol paketleri ve izin matrisi | L | 21 | K21-03, K02-03, K03-11, K04-06 |  |
| [K16-02](K16-yonetim-butunlestirme.md#K16-02) · SessionRevocation: oturum görünümü, uzaktan iptal, hesap kilitleme ve yeniden doğrulama | M | 21 | K21-03, K03-11 |  |
| [K16-03](K16-yonetim-butunlestirme.md#K16-03) · AuditViewer: denetim kaydı arama, filtre ve güvenli dışa aktarım | M | 21 | K21-03, K04-06 |  |
| [K16-04](K16-yonetim-butunlestirme.md#K16-04) · FailedJobs ve operasyon sağlığı: başarısız işler, unknown SMS, karantina ve outbox yaşı | L | 37 | K21-03, K04-05, K10-15, K11-14 |  |
| [K16-05](K16-yonetim-butunlestirme.md#K16-05) · AccessReview: üç aylık erişim gözden geçirme ve kullanılmayan erişim temizliği | M | 22 | K16-01, K16-02 | migration |
| [K16-06](K16-yonetim-butunlestirme.md#K16-06) · KVKK başvuru ekranı: veri talepleri, süre sayacı ve silme yürütücüsü | L | 26 | K21-03, K04-09, K11-13, K11-12 | insan inceleme |
| [K16-07](K16-yonetim-butunlestirme.md#K16-07) · Operasyon ayarları: tek yerden iş kuralı ve sınır yapılandırması | M | 36 | K21-03, K05-04, K10-12, K11-03, K13-09, K15-06 |  |
| [K16-08](K16-yonetim-butunlestirme.md#K16-08) · Personel gezintisi ve günlük pano: AdminNavigation bütünleştirme | L | 37 | K21-04, K06-12, K08-12, K09-08, K10-15, K11-14, K12-03, K13-12, K14-08, K15-09 |  |
| [K16-09](K16-yonetim-butunlestirme.md#K16-09) · Müşteri alanı bütünleştirme: Düğünüm gezintisi, bildirim zili ve boş durumlar | L | 35 | K08-11, K09-07, K10-14, K13-11, K14-07, K12-04 |  |
| [K16-10](K16-yonetim-butunlestirme.md#K16-10) · Yetki sınırı denetimi: rota/uç ↔ izin kaydı eşleşmesi ve yetkisiz personel matrisi | L | 38 | K16-01, K16-08, K16-09, K13-10 | insan inceleme |
| [K16-11](K16-yonetim-butunlestirme.md#K16-11) · Baştan sona personel + çift senaryosu (fake adaptörlerle) ve K16 raporu | L | 39 | K16-04, K16-05, K16-06, K16-07, K16-10, K12-06, K13-14, K14-09, K15-10, K11-16, K10-17, K09-09, K08-15, K07-10 |  |

<a id="K16-01"></a>
## K16-01 · Personel ve izin yönetimi: StaffMembers, rol paketleri ve izin matrisi

**Boyut:** L · **Dalga:** 21 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K21-03](K21-yonetim-kabugu-takvim.md#K21-03), [K02-03](K02-db-erisim-cekirdegi.md#K02-03), [K03-11](K03-kimlik-uyelik.md#K03-11), [K04-06](K04-outbox-audit-isci.md#K04-06)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/staff/`, `apps/web/app/api/admin/staff/`, `apps/web/src/admin/staff/`, `apps/web/app/(admin)/personel/`, `apps/web/src/admin/nav/personel.ts`, `tests/integration/staff/`, `tests/e2e/admin-staff/`

**Teslim edilecekler**
- Personel listesi (durum, rol paketi, MFA durumu, son giriş), rol paketi ve izin atama/kaldırma, pasifleştirme/yeniden etkinleştirme; **izin değişimi yeni isteklerde hemen etkili** (oturum önbelleği gecikmesi K03-01 ADR sınırı içinde)
- Hassas aksiyonlarda yeniden doğrulama (TOTP) + gerekçe + audit; kendi yetkisini yükseltme ve son yönetici pasifleştirme engeli; sahte rol/izin/status gövdesi yok sayılır (T-28)
- İzin sözlüğü K02-03'tedir; bu paket sözlüğe izin eklemez, yalnız atamayı yönetir (eksik izin için ortak sözleşme PR'ı)

**Kabul**
- Yetkisiz personel ekranı/API'yi göremez ve çağıramaz (403); kendi yetkisini yükseltemez; son yönetici pasifleştirilemez
- İzin kaldırma sonraki istekte etkili; audit satırı gerekçeyle yazılır
- Bu paketin geçmesi gereken şartname testleri: T-28, T-33 (§20.1).

**Kapsam dışı:** Personel daveti ve bootstrap K03-05'tedir.

**Oku:** `AGENTS.md`, §7.2, §17.2, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-10](K04-outbox-audit-isci.md#K04-10), [K16-02](K16-yonetim-butunlestirme.md#K16-02), [K16-03](K16-yonetim-butunlestirme.md#K16-03)

**Bunu bekleyenler:** [K16-05](K16-yonetim-butunlestirme.md#K16-05), [K16-10](K16-yonetim-butunlestirme.md#K16-10)

---

<a id="K16-02"></a>
## K16-02 · SessionRevocation: oturum görünümü, uzaktan iptal, hesap kilitleme ve yeniden doğrulama

**Boyut:** M · **Dalga:** 21 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K21-03](K21-yonetim-kabugu-takvim.md#K21-03), [K03-11](K03-kimlik-uyelik.md#K03-11)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/sessions/`, `apps/web/app/(admin)/oturumlar/`, `apps/web/app/api/admin/sessions/`, `apps/web/src/admin/nav/oturumlar.ts`, `tests/e2e/admin-sessions/`

**Teslim edilecekler**
- Personelin kendi oturumları ve yetkili yöneticinin başka personelin oturumlarını görüp iptal etmesi; hesabı kilitleme/açma; yeniden doğrulama (TOTP) bileşeni (diğer ekranların hassas aksiyonlarında yeniden kullanılır)
- İptal sonrası açık SSE/medya akışları K03-11/K09-05 mekanizmasıyla kesilir; iptal gecikmesi ölçümü bu pakette yeniden doğrulanır

**Kabul**
- İptal edilen oturum yeni istekte reddedilir; yeniden doğrulama gerektiren aksiyon süresi dolunca tekrar ister
- Müşteri oturumları personel ekranında MFA'sız yönetilemez (T-11 ile uyumlu)
- Bu paketin geçmesi gereken şartname testleri: T-09, T-11 (§20.1).

**Kapsam dışı:** Hesap kurtarma akışı K03-11'dedir.

**Oku:** `AGENTS.md`, §7.1, §17.2, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-10](K04-outbox-audit-isci.md#K04-10), [K16-01](K16-yonetim-butunlestirme.md#K16-01), [K16-03](K16-yonetim-butunlestirme.md#K16-03)

**Bunu bekleyenler:** [K16-05](K16-yonetim-butunlestirme.md#K16-05)

---

<a id="K16-03"></a>
## K16-03 · AuditViewer: denetim kaydı arama, filtre ve güvenli dışa aktarım

**Boyut:** M · **Dalga:** 21 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K21-03](K21-yonetim-kabugu-takvim.md#K21-03), [K04-06](K04-outbox-audit-isci.md#K04-06)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/audit/`, `apps/web/app/(admin)/denetim/`, `apps/web/app/api/admin/audit/`, `apps/web/src/admin/nav/denetim.ts`, `tests/e2e/admin-audit/`

**Teslim edilecekler**
- Aktör, varlık, işlem ve tarihe göre sayfalı denetim listesi; yalnız `audit.view` izniyle; kayıtlarda sır/kişisel veri **redaksiyonu** (K04-06) ekranda da korunur; kayıt güncelleme/silme düğmesi yok (append-only)
- CSV dışa aktarım: `=`, `+`, `-`, `@` ile başlayan hücreler güvenli kaçışlanır (T-34); dışa aktarım da audit'e yazılır ve satır sınırı vardır

**Kabul**
- Denetim satırı değiştirilemez/silinemez (UI ve API); izinsiz personel göremez; formül içeren değer export'ta çalışmaz
- Redakte alanlar ekranda ve dışa aktarımda açığa çıkmaz
- Bu paketin geçmesi gereken şartname testleri: T-34 (§20.1).

**Kapsam dışı:** Audit yazımı K04-06'dadır.

**Oku:** `AGENTS.md`, §17.5, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K04-10](K04-outbox-audit-isci.md#K04-10), [K16-01](K16-yonetim-butunlestirme.md#K16-01), [K16-02](K16-yonetim-butunlestirme.md#K16-02)

---

<a id="K16-04"></a>
## K16-04 · FailedJobs ve operasyon sağlığı: başarısız işler, unknown SMS, karantina ve outbox yaşı

**Boyut:** L · **Dalga:** 37 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K21-03](K21-yonetim-kabugu-takvim.md#K21-03), [K04-05](K04-outbox-audit-isci.md#K04-05), [K10-15](K10-bildirim-eposta-sms.md#K10-15), [K11-14](K11-medya-temeli.md#K11-14)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/operations-health/`, `apps/web/app/(admin)/operasyon/`, `apps/web/app/api/admin/operations/`, `apps/web/src/admin/nav/operasyon.ts`, `tests/e2e/admin-operations/`

**Teslim edilecekler**
- Tek ekranda: başarısız işler (K04-05; yeniden dene/yoksay + gerekçe + audit), `unknown` SMS uzlaştırma listesi (K10-07; **kör yeniden gönderme düğmesi yok**, uzlaştırma bağlantısı), karantinada biriken/başarısız medya (K11), en eski outbox yaşı ve kuyruk derinliği, ClamAV imza yaşı, bütçe uyarıları (SMS/LLM/depolama %80)
- Salt okunur sağlık özeti (K04-07 metrikleri); kişisel veri yerine kimlik/tür/sayı; yalnız `ops.view`/`ops.retry` izinleri

**Kabul**
- Başarısız iş yeniden denendiğinde yan etki idempotency ile kopya üretmez; `unknown` SMS yalnız uzlaştırma yoluyla kapanır
- İzinsiz personelde ekran yok; hata ekranı sır/kişi verisi göstermez
- Bu paketin geçmesi gereken şartname testleri: T-19, T-18 (§20.1).

**Kapsam dışı:** Alarm hedefleri ve dış izleme sağlayıcısı işletmenin kararıdır (§19.3).

**Oku:** `AGENTS.md`, §19.3, §12.4, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K10-16](K10-bildirim-eposta-sms.md#K10-16), [K16-08](K16-yonetim-butunlestirme.md#K16-08)

**Bunu bekleyenler:** [K16-11](K16-yonetim-butunlestirme.md#K16-11)

---

<a id="K16-05"></a>
## K16-05 · AccessReview: üç aylık erişim gözden geçirme ve kullanılmayan erişim temizliği

**Boyut:** M · **Dalga:** 22 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K16-01](K16-yonetim-butunlestirme.md#K16-01), [K16-02](K16-yonetim-butunlestirme.md#K16-02)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/access-review.ts`, `packages/db/migrations/*_access_review.sql`, `packages/application/src/access-review/`, `apps/web/src/admin/access-review/`, `apps/web/app/(admin)/erisim-gozden-gecirme/`, `tests/integration/access-review/`, `tests/e2e/admin-access-review/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- Gözden geçirme turu (`access_review` + kalemler): aktif personel, rol/izin, MFA durumu, son giriş, atanmış düğünler; kalem başına 'onayla / izni kaldır / pasifleştir' kararı; tur imzalama (kim, ne zaman) ve değişmez kayıt
- Kullanılmayan personel/sağlayıcı anahtarı kontrol listesi **yalnız isim/son kullanım tarihi** gösterir (sır değeri hiçbir yerde); eylem öğesi çıktısı `docs/runbook/` listesine dönüşür
- Tur hatırlatması için outbox olayı (üç ayda bir; gönderim kanalı yalnız uygulama içi)

**Kabul**
- Tur kaydı değiştirilemez; 'izni kaldır' kararı K16-01 yolundan uygulanır ve audit'lenir; izinsiz personel turu göremez
- Sır/anahtar değeri ekranda, logda ve DB'de bulunmaz

**Kapsam dışı:** Takvimli tekrarlı işler işletmenin sorumluluğundadır; yalnız araç sağlanır.

**Oku:** `AGENTS.md`, §19.6, §17.2, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-01](K05-rezervasyon-motoru.md#K05-01), [K07-02](K07-kurumsal-site-icerik.md#K07-02), [K08-01](K08-dugunum-pano-onay.md#K08-01), [K09-01](K09-sohbet-canli-akis.md#K09-01), [K10-03](K10-bildirim-eposta-sms.md#K10-03), [K11-02](K11-medya-temeli.md#K11-02)

**Bunu bekleyenler:** [K16-11](K16-yonetim-butunlestirme.md#K16-11)

---

<a id="K16-06"></a>
## K16-06 · KVKK başvuru ekranı: veri talepleri, süre sayacı ve silme yürütücüsü

**Boyut:** L · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K21-03](K21-yonetim-kabugu-takvim.md#K21-03), [K04-09](K04-outbox-audit-isci.md#K04-09), [K11-13](K11-medya-temeli.md#K11-13), [K11-12](K11-medya-temeli.md#K11-12)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/data-requests/`, `apps/web/app/(admin)/kvkk-basvurulari/`, `apps/web/app/api/admin/data-requests/`, `apps/web/src/admin/nav/kvkk.ts`, `packages/application/src/data-subject/execution/`, `apps/worker/src/jobs/deletion-execution.ts`, `tests/integration/data-subject/execution/`, `tests/e2e/admin-data-requests/`

**Teslim edilecekler**
- Personel listesi: başvuru türü, kalan süre sayacı, kimlik doğrulama durumu, kapsam planı (DB/nesne/türev/arşiv/yedek takvimi/legal hold), karar ve yanıt kaydı; yanıt süresi uyarısı **yalnız uygulama içi** gösterilir
- Silme yürütücüsü (onaylanmış plan üzerinde, idempotent iş): aktif DB kayıtları, nesneler ve türevler (K11 `deleting/deleted` durumları), arşivdeki kopyalar; her adım `deletion_ledger`'a yazılır; yedekler için bitiş takvimi ledger'da görünür, yedekten restore sonrası yeniden uygulama (K04-08) çalışır
- Hukuki saklama (legal hold) olan kayıt silinmez ve gerekçesiyle listelenir; başka kişinin verisi yanıt paketinde yer almaz

**Kabul**
- T-40: kapsam (DB, nesne, türev, arşiv, yedek takvimi) ve silme defteri doğru; süre sayacı görünür; başka kişinin verisi sızmaz
- Silme işi tekrar çalıştırılınca kopya işlem/ledger satırı oluşmaz; legal hold'lu kayıt korunur
- Bu paketin geçmesi gereken şartname testleri: T-40, T-29 (§20.1).

**Kapsam dışı:** Hukuki süre ve metin yorumu işletme/uzman kararıdır; mühendislik yalnız kayıt ve araç sağlar.

**Oku:** `AGENTS.md`, §17.5, §17.6, §19.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K11-08](K11-medya-temeli.md#K11-08), [K11-09](K11-medya-temeli.md#K11-09), [K13-05](K13-davetiye-takvim.md#K13-05), [K14-05](K14-belge-odeme.md#K14-05), [K15-04](K15-chatbot.md#K15-04)

**Bunu bekleyenler:** [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K17-03](K17-staging-kabul.md#K17-03), [K17-08](K17-staging-kabul.md#K17-08)

---

<a id="K16-07"></a>
## K16-07 · Operasyon ayarları: tek yerden iş kuralı ve sınır yapılandırması

**Boyut:** M · **Dalga:** 36 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K21-03](K21-yonetim-kabugu-takvim.md#K21-03), [K05-04](K05-rezervasyon-motoru.md#K05-04), [K10-12](K10-bildirim-eposta-sms.md#K10-12), [K11-03](K11-medya-temeli.md#K11-03), [K13-09](K13-davetiye-takvim.md#K13-09), [K15-06](K15-chatbot.md#K15-06)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/settings/`, `apps/web/app/(admin)/ayarlar/`, `apps/web/app/api/admin/settings/`, `apps/web/src/admin/nav/ayarlar.ts`, `tests/e2e/admin-settings/`

**Teslim edilecekler**
- `OperationsSettings`: tutma süresi ve uzatma sınırı, çalışma saatleri/tamponlar (K05-04 use-case'leri), SMS bütçesi/sessiz saatler (K10-12), medya kotaları ve saklama politikaları (K11-03), yayın varsayılan bitişi (K13-09), chatbot ayarına bağlantı (K15-09); her ayar **mevcut use-case/API'si üzerinden** değiştirilir, bu paket kendi tablosu/iş kuralı eklemez
- Değişiklikler yetki + gerekçe + audit; ayar doğrulama modül sözleşmesinden gelir; geçersiz/sınır dışı değerler reddedilir; kritik ayarlar (tavanlar, kapatma anahtarları) için yeniden doğrulama

**Kabul**
- Ayar değişiklikleri ilgili modül davranışına yansır (örnek: hold süresi, SMS tavanı) ve audit'e yazılır; sınır dışı değer reddedilir
- İzinsiz personelde ekran yok; hiçbir sır/sağlayıcı anahtarı ekranda gösterilmez

**Kapsam dışı:** Sağlayıcı sırları ve ortam değişkenleri uygulama dışındaki yapılandırma kanalındadır.

**Oku:** `AGENTS.md`, §19.3, §19.6, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K10-10](K10-bildirim-eposta-sms.md#K10-10), [K10-11](K10-bildirim-eposta-sms.md#K10-11), [K10-15](K10-bildirim-eposta-sms.md#K10-15)

**Bunu bekleyenler:** [K16-11](K16-yonetim-butunlestirme.md#K16-11)

---

<a id="K16-08"></a>
## K16-08 · Personel gezintisi ve günlük pano: AdminNavigation bütünleştirme

**Boyut:** L · **Dalga:** 37 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K08-12](K08-dugunum-pano-onay.md#K08-12), [K09-08](K09-sohbet-canli-akis.md#K09-08), [K10-15](K10-bildirim-eposta-sms.md#K10-15), [K11-14](K11-medya-temeli.md#K11-14), [K12-03](K12-galeri-oynatici.md#K12-03), [K13-12](K13-davetiye-takvim.md#K13-12), [K14-08](K14-belge-odeme.md#K14-08), [K15-09](K15-chatbot.md#K15-09)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/dashboard/`, `apps/web/app/(admin)/page.tsx`, `apps/web/src/admin/nav/index.ts`, `tests/e2e/admin-integration/`

**Teslim edilecekler**
- Bugün panosu: süresi dolmak üzere olan tutmalar, yeni talepler, yanıtlanmamış mesajlar, bekleyen onaylar, başarısız işler özeti ve yaklaşan etkinlikler — her kart yalnız kullanıcının izinli olduğu veriyi gösterir ve ilgili ekrana derin bağlantı verir (takvim → düğün çalışma alanı → sekmeler)
- Menü ve çalışma alanı sekmeleri kayıt dosyalarına (K21-03 nav kaydı, K08-12 sekme kaydı) **K16 öncesi eklenen kayıtların** tutarlı sırası/gruplaması; bu pakette yeni modül ekranı yazılmaz
- Kayıtlı ama izinsiz menü öğesi/sekme gizlenir (UI) ve ilgili API 403 verir; rota boş durumları ve hata sınırları

**Kabul**
- Playwright: farklı izin paketli üç personelde menü/pano farklı ve doğru; derin bağlantılar çalışır; izinsiz sekme yok
- Pano kartları tek istekle çalışır, N+1 yok (ölçüm notu)
- Bu paketin geçmesi gereken şartname testleri: T-30 (§20.1).

**Kapsam dışı:** Müşteri tarafı K16-09'dadır.

**Oku:** `AGENTS.md`, §16, §7.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K10-16](K10-bildirim-eposta-sms.md#K10-16), [K16-04](K16-yonetim-butunlestirme.md#K16-04)

**Bunu bekleyenler:** [K16-10](K16-yonetim-butunlestirme.md#K16-10)

---

<a id="K16-09"></a>
## K16-09 · Müşteri alanı bütünleştirme: Düğünüm gezintisi, bildirim zili ve boş durumlar

**Boyut:** L · **Dalga:** 35 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K08-11](K08-dugunum-pano-onay.md#K08-11), [K09-07](K09-sohbet-canli-akis.md#K09-07), [K10-14](K10-bildirim-eposta-sms.md#K10-14), [K13-11](K13-davetiye-takvim.md#K13-11), [K14-07](K14-belge-odeme.md#K14-07), [K12-04](K12-galeri-oynatici.md#K12-04)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/customer/shell/`, `apps/web/src/customer/nav/index.ts`, `apps/web/app/(customer)/layout.tsx`, `tests/e2e/customer-integration/`

**Teslim edilecekler**
- Tek Düğünüm kabuğu: özet, pano, sohbet, onaylar, belgeler, ödemeler, davetiye sekmeleri (**izin ve role göre**; yakın rolü belge/ödeme/yayın menüsü görmez); bildirim zili ve okunmamış sayaçları (K09/K10); çoklu etkinlik seçici; `Düğünüm/Etkinliğim` metin seçimi
- Yükleniyor/boş/hata/yetkisiz/bağlantı kesildi durumlarının hepsinde tutarlı içerik; mobil gezinti ve klavye; rota kayıtlarının `cache-isolation` kayıt dosyasında tamamlığı kontrolü

**Kabul**
- Playwright: çift üyesi ve yakın rolü farklı menü görür; başka etkinlik URL'si 404; sayaçlar gerçek veriyle tutarlı
- Cache-isolation kayıt eksiği CI'da hata verir
- Bu paketin geçmesi gereken şartname testleri: T-17, T-30 (§20.1).

**Kapsam dışı:** Personel gezintisi K16-08'dedir.

**Oku:** `AGENTS.md`, §16, §7.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K09-09](K09-sohbet-canli-akis.md#K09-09), [K10-08](K10-bildirim-eposta-sms.md#K10-08), [K10-09](K10-bildirim-eposta-sms.md#K10-09), [K10-12](K10-bildirim-eposta-sms.md#K10-12), [K10-13](K10-bildirim-eposta-sms.md#K10-13), [K15-11](K15-chatbot.md#K15-11)

**Bunu bekleyenler:** [K16-10](K16-yonetim-butunlestirme.md#K16-10)

---

<a id="K16-10"></a>
## K16-10 · Yetki sınırı denetimi: rota/uç ↔ izin kaydı eşleşmesi ve yetkisiz personel matrisi

**Boyut:** L · **Dalga:** 38 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K16-01](K16-yonetim-butunlestirme.md#K16-01), [K16-08](K16-yonetim-butunlestirme.md#K16-08), [K16-09](K16-yonetim-butunlestirme.md#K16-09), [K13-10](K13-davetiye-takvim.md#K13-10)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `tests/security/authz-matrix/`, `scripts/authz-inventory.ts`, `docs/reports/K16-yetki-matrisi.md`

**Teslim edilecekler**
- Envanter betiği: tüm `app/(admin)` rotaları, `app/api/admin/**` uçları, Server Action'lar ve müşteri API'leri → gerekli izin/oturum türü (kayıt eksikse CI hatası); üretilen matris `K16-yetki-matrisi.md`
- Test: her izin paketi × her admin rota/uç için beklenen ret/izin (anonim, müşteri oturumu, MFA'sız personel, izinsiz personel, atanmamış düğün personeli, yakın rolü); mass assignment/CSRF örnekleri (T-28), müşteri cookie'siyle admin çağrısı (T-11), MFA'sız personel (T-33)
- Yeni rota eklenince envanter güncellenmeden CI geçmez (kural README'ye yazılır)

**Kabul**
- Matris testleri yeşil; envanterde izin bağlantısı olmayan admin rota/uç yok; müşteri/anonim hiçbir admin uca ulaşamaz
- Çalıştırılamayan kombinasyon varsa nedeni raporda
- Bu paketin geçmesi gereken şartname testleri: T-11, T-28, T-33 (§20.1).

**Kapsam dışı:** Harici güvenlik incelemesi K17'dedir.

**Oku:** `AGENTS.md`, §7.2, §17.2, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K10-17](K10-bildirim-eposta-sms.md#K10-17)

**Bunu bekleyenler:** [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K17-02](K17-staging-kabul.md#K17-02), [K17-05](K17-staging-kabul.md#K17-05), [K17-09](K17-staging-kabul.md#K17-09)

---

<a id="K16-11"></a>
## K16-11 · Baştan sona personel + çift senaryosu (fake adaptörlerle) ve K16 raporu

**Boyut:** L · **Dalga:** 39 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K16-04](K16-yonetim-butunlestirme.md#K16-04), [K16-05](K16-yonetim-butunlestirme.md#K16-05), [K16-06](K16-yonetim-butunlestirme.md#K16-06), [K16-07](K16-yonetim-butunlestirme.md#K16-07), [K16-10](K16-yonetim-butunlestirme.md#K16-10), [K12-06](K12-galeri-oynatici.md#K12-06), [K13-14](K13-davetiye-takvim.md#K13-14), [K14-09](K14-belge-odeme.md#K14-09), [K15-10](K15-chatbot.md#K15-10), [K11-16](K11-medya-temeli.md#K11-16), [K10-17](K10-bildirim-eposta-sms.md#K10-17), [K09-09](K09-sohbet-canli-akis.md#K09-09), [K08-15](K08-dugunum-pano-onay.md#K08-15), [K07-10](K07-kurumsal-site-icerik.md#K07-10)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/e2e/end-to-end/`, `docs/reports/K16-kabul.md`

**Teslim edilecekler**
- Tek senaryo zinciri (Playwright, fake SMS/e-posta/LLM/depolama): genel site → talep → ziyaret → teklif → kesinleştirme kontrol listesi → davet → çift kabulü (kanal kanıtı) → pano/onay/sohbet → bildirim (audience ve SMS önizlemesi **gönderilenle aynı**, iç not sızmaz) → belge/ödeme → davetiye yayın onayı → takvimde nüans → iptalde kapanış
- Yan senaryolar: personel A atanmamış düğünde engellenir; yakın rolü finans/belge göremez; üyelik iptali sonrası sohbet/medya kapanır; worker kapalıyken kayıtlar korunur
- `K16-kabul.md`: çalıştırılan senaryolar, sınırlar, çalıştırılamayanlar (nedenleriyle) ve K17'ye bırakılan ölçümler

**Kabul**
- Zincir CI'da (veya staging'de belgeli çalıştırmayla) yeşil; sahte sağlayıcı başarısı üretim başarısı gibi sunulmaz (UI/rapor)
- T-14 uçtan uca: iç not + SMS seçeneği manipülasyonunda müşteriye hiçbir şey gitmez
- Bu paketin geçmesi gereken şartname testleri: T-14, T-30 (§20.1).

**Kapsam dışı:** Gerçek sağlayıcı ve yük ölçümü K17'dedir.

**Oku:** `AGENTS.md`, §22.2, §20.1, §20.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K10-18](K10-bildirim-eposta-sms.md#K10-18), [K17-05](K17-staging-kabul.md#K17-05)

**Bunu bekleyenler:** [K17-02](K17-staging-kabul.md#K17-02), [K17-04](K17-staging-kabul.md#K17-04), [K17-06](K17-staging-kabul.md#K17-06), [K17-07](K17-staging-kabul.md#K17-07)

---
