# K02 — DB, alan temeli ve erişim çekirdeği

**Kilometre taşı:** M0 — Temel ve hazırlık (K00–K04) · **Şartname:** §6, §7, §8, §17.2, §17.3, §17.6 · [Plan dizini](README.md)

> PostgreSQL şeması, migration altyapısı, ActorContext, veri erişim katmanı (DAL) ve RLS. Sonraki bütün kartlar bu temelin üstüne kurulur.

**§21.3 insan inceleme kapısı:** K02'nin şema/RLS/ActorContext paketleri atanmış insan inceleyici onaylamadan birleşmez (K00-07). K03 ve sonrası bu paketler birleşmeden başlamaz. Gerçek alan sayısı/seans/kapasite uydurulmaz; örnek tek alan yalnız test fixture'ıdır.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K02-01](K02-db-erisim-cekirdegi.md#K02-01) · packages/db iskeleti, roller ve migration altyapısı | M | 6 | K01-04, K01-06 | insan inceleme, migration |
| [K02-02](K02-db-erisim-cekirdegi.md#K02-02) · Çekirdek şema: organization, alan, kaynak, seans şablonu | M | 7 | K02-01 | insan inceleme, migration |
| [K02-03](K02-db-erisim-cekirdegi.md#K02-03) · Kimlik ve personel üyelik şeması | M | 8 | K02-02 | insan inceleme, migration |
| [K02-04](K02-db-erisim-cekirdegi.md#K02-04) · Event, üyelik ve davet şeması | M | 9 | K02-03 | insan inceleme, migration |
| [K02-05](K02-db-erisim-cekirdegi.md#K02-05) · ActorContext, DAL çekirdeği ve AuditSink portu | M | 7 | K02-01 | insan inceleme |
| [K02-06](K02-db-erisim-cekirdegi.md#K02-06) · RLS politikaları ve dar SECURITY DEFINER yardımcıları | L | 10 | K02-04, K02-05 | insan inceleme, migration |
| [K02-07](K02-db-erisim-cekirdegi.md#K02-07) · İki işletme/iki düğün fixture'ı ve çekirdek T-08/T-10 testleri | M | 11 | K02-06 | insan inceleme |
| [K02-08](K02-db-erisim-cekirdegi.md#K02-08) · Veri envanteri iskeleti ve CI denetimi (PRIV-01) | S | 10 | K02-04 |  |

<a id="K02-01"></a>
## K02-01 · packages/db iskeleti, roller ve migration altyapısı

**Boyut:** M · **Dalga:** 6 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K01-04](K01-iskelet.md#K01-04), [K01-06](K01-iskelet.md#K01-06)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/package.json`, `packages/db/drizzle.config.ts`, `packages/db/src/client/`, `packages/db/src/migrate/`, `packages/db/migrations/.gitkeep`, `infra/db/`, `docs/adr/*-db-roller-migration.md`, `tests/integration/helpers/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- Drizzle ORM + node-postgres bağlantı katmanı; bağlantı havuzu boyutu env'den (§19.1 bağlantı bütçesi)
- Sürümlü SQL migration çalıştırıcısı: zaman damgalı dosya adı (`YYYYMMDDHHMM_ad.sql`), uygulanan migration tablosu, journal dosyası yok — paralel PR'lar çakışmasın; `pnpm db:migrate`, üretimde `push` komutu yok
- Roller: `kiana_migrator` (sahip, yalnız migration), `kiana_app` (web runtime: sahip değil, superuser değil, `BYPASSRLS` yok), `kiana_worker` (dar yetkili); `infra/db/roles.sql` idempotent betik, sırsız
- Test DB yardımcıları: her test dosyası için temiz şema/şablon veritabanı, migration'ları uygular
- ADR: DB rolleri, migration biçimi, genişlet → taşı → daralt politikası, geri dönüş yaklaşımı

**Kabul**
- Boş DB'de tüm migration'lar sırayla uygulanır, ikinci çalıştırma değişiklik yapmaz
- `kiana_app` ile `SELECT current_setting('is_superuser')` ve rol özellikleri testi: sahip/superuser/bypassrls değil
- Migration çalıştırıcısı runtime kimlik bilgisiyle çalışmayı reddeder

**Kapsam dışı:** Tablolar bu pakette yoktur (yalnız altyapı). Üretim DB'sine bağlanılmaz.

**Oku:** `AGENTS.md`, §5.1, §8.1, §17.2, §19.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K01-09](K01-iskelet.md#K01-09)

**Bunu bekleyenler:** [K02-02](K02-db-erisim-cekirdegi.md#K02-02), [K02-05](K02-db-erisim-cekirdegi.md#K02-05)

---

<a id="K02-02"></a>
## K02-02 · Çekirdek şema: organization, alan, kaynak, seans şablonu

**Boyut:** M · **Dalga:** 7 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K02-01](K02-db-erisim-cekirdegi.md#K02-01)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/core.ts`, `packages/db/migrations/*_core_schema.sql`, `packages/domain/src/venue/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `organization` (timezone varsayılanı Europe/Istanbul, ayar sürümü), `venue_space`, `resource` (`kind`: fiziksel alan / personel / ziyaret alanı), `space_resource`, `session_template`, `opening_rule`
- Her alan tablosunda `organization_id`, `timestamptz`, `version`, `created_at/updated_at`; para ve kapasite kuralları §8.1'e uygun; kimlikler tahmin edilmesi zor ama güvenlik onlara dayanmaz
- Composite FK deseni (`organization_id`, `id`) ile farklı işletmenin ebeveynine bağlanma engeli
- Domain tipleri: saf `Resource`, `VenueSpace`, `SessionTemplate` (React/Next import yok)

**Kabul**
- Migration ileri uygulanır; FK/check kısıtlarını ihlal eden eklemeler testte reddedilir
- Farklı işletmenin alanına `space_resource` bağlama denemesi DB tarafından reddedilir

**Kapsam dışı:** `resource_allocation`, `booking`, exclusion constraint ve `btree_gist` K05'tedir. Gerçek alan/seans verisi girilmez.

**Oku:** `AGENTS.md`, §6, §8, §8.1, §9.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K02-05](K02-db-erisim-cekirdegi.md#K02-05), [K07-01](K07-kurumsal-site-icerik.md#K07-01)

**Bunu bekleyenler:** [K02-03](K02-db-erisim-cekirdegi.md#K02-03)

---

<a id="K02-03"></a>
## K02-03 · Kimlik ve personel üyelik şeması

**Boyut:** M · **Dalga:** 8 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K02-02](K02-db-erisim-cekirdegi.md#K02-02)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/identity.ts`, `packages/db/migrations/*_identity_schema.sql`, `packages/domain/src/identity/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- Ayrı şema/namespace: `auth_customer` ve `auth_staff` (Better Auth tabloları K03'te kütüphane şemasıyla gelir; burada yalnız şema, rol hakları ve uygulama düzeyi `customer_user`, `staff_user`)
- `staff_membership` (işletme rolü + izin listesi), `staff_assignment` (düğün ataması); izinler açık dizgeler (`booking.confirm`, `notification.sms.send`, `publication.publish`, `finance.record`, `member.invite`, `export.private`, `staff.manage`) — roller yalnız izin paketi
- Aktör kimliği `customer|staff|system` türüyle birlikte tutulur (§8.1)
- `staff_user` ile `customer_user` arasında ortak e-posta bile kimlik birleştirmez; FK/unique yok

**Kabul**
- Müşteri ve personel kimliği aynı tabloda/FK ile birleştirilemez (testle kanıtlı)
- Rol → izin eşlemesi veri olarak tanımlı; kod içinde sabit `isAdmin` bayrağı yok

**Kapsam dışı:** Giriş akışları, parola, TOTP ve oturum K03'tedir.

**Oku:** `AGENTS.md`, §7.1, §7.2, §8, §8.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K07-08](K07-kurumsal-site-icerik.md#K07-08)

**Bunu bekleyenler:** [K02-04](K02-db-erisim-cekirdegi.md#K02-04), [K16-01](K16-yonetim-butunlestirme.md#K16-01)

---

<a id="K02-04"></a>
## K02-04 · Event, üyelik ve davet şeması

**Boyut:** M · **Dalga:** 9 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K02-03](K02-db-erisim-cekirdegi.md#K02-03)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/event.ts`, `packages/db/migrations/*_event_schema.sql`, `packages/domain/src/event/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `event` (`event_type` kontrollü değer; yalnız düğün açık), `event_member` (rol + açık izin seti; yakın rolü için şema desteği, bayrakla kapalı), `event_invitation` (hedef kanal: doğrulanmış e-posta veya E.164 telefon, rol, **token hash**, son kullanma, tüketim zamanı, deneme sayacı)
- Düğüne bağlı çocuk kayıtlar için `organization_id` + `event_id` composite FK şablonu (sonraki kartlar kopyalayacak)
- İptal edilmiş etkinlik için yazma kapatma durumu alanı; saklama politikasından ayrı
- Domain: üyelik/izin saf fonksiyonları

**Kabul**
- Farklı işletmenin event'ine üye/davet bağlama denemesi reddedilir
- Davet token'ı düz metin saklanamaz (şemada yalnız hash kolonu; kontrol testi)
- `event_type` geçersiz değerde DB reddeder

**Kapsam dışı:** Davet oluşturma/gönderme/kabul akışı K03/K06/K10'dadır.

**Oku:** `AGENTS.md`, §7.1, §8, §8.1, §9.5 (+ zorunlu: §1, §4, §20.2)

**Bunu bekleyenler:** [K02-06](K02-db-erisim-cekirdegi.md#K02-06), [K02-08](K02-db-erisim-cekirdegi.md#K02-08), [K11-03](K11-medya-temeli.md#K11-03), [K13-03](K13-davetiye-takvim.md#K13-03)

---

<a id="K02-05"></a>
## K02-05 · ActorContext, DAL çekirdeği ve AuditSink portu

**Boyut:** M · **Dalga:** 7 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K02-01](K02-db-erisim-cekirdegi.md#K02-01)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/domain/src/actor/`, `packages/application/src/actor/`, `packages/application/src/ports/`, `packages/db/src/actor/`, `packages/db/src/dal/`

**Teslim edilecekler**
- `ActorContext` tipi: `kind: customer|staff|system`, kullanıcı kimliği, `organizationId`, izin listesi, oturum/MFA aşaması bilgisi, correlation id; yalnız sunucu üretir
- `withActor(ctx, fn)`: tek transaction içinde `set_config(..., true)` ile transaction-local bağlam; bağlam yoksa DAL çağrısı reddeder; havuzda bağlam sızmaz (`SET LOCAL`)
- `sql` ham sorgu yardımcıları parametreli; `SELECT *` sonucunu dışarı veren yardımcı yok; allowlist DTO eşleyici deseni
- `AuditSink` portu (arayüz) ve test için bellek içi uygulama; gerçek yazıcı K04-06'da bağlanır
- Sistem aktörü (`system`) için dar kapsamlı `withSystemActor(scope)`: `organization_id`, eylem ve hedef kayıt kapsamı zorunlu

**Kabul**
- Birim/entegrasyon testi: bağlamsız DAL çağrısı hata verir; art arda iki farklı aktörle aynı bağlantıda ilkinin bağlamı ikincisine taşınmaz
- ActorContext istemciden gelen header/body alanıyla kurulamaz (tip seviyesinde yapıcı yok)

**Kapsam dışı:** RLS politikaları K02-06'dadır; oturumdan ActorContext üretimi K03-06'dadır.

**Oku:** `AGENTS.md`, §6, §8.1, §17.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K02-02](K02-db-erisim-cekirdegi.md#K02-02), [K07-01](K07-kurumsal-site-icerik.md#K07-01)

**Bunu bekleyenler:** [K02-06](K02-db-erisim-cekirdegi.md#K02-06)

---

<a id="K02-06"></a>
## K02-06 · RLS politikaları ve dar SECURITY DEFINER yardımcıları

**Boyut:** L · **Dalga:** 10 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K02-04](K02-db-erisim-cekirdegi.md#K02-04), [K02-05](K02-db-erisim-cekirdegi.md#K02-05)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/rls/`, `packages/db/migrations/*_rls_core.sql`, `tests/security/rls/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- Özel/işletme/düğün kapsamlı tüm K02 tablolarında `ENABLE` + gereken yerde `FORCE ROW LEVEL SECURITY`; politika yoksa erişim kapalı
- Transaction-local bağlamı okuyan politika yardımcıları; üyelik soruları için `SECURITY DEFINER` fonksiyonlar: sabit `search_path`, yalnız dar `EXECUTE` izni, dinamik SQL yok; döngüsel RLS sorgusu yok
- Runtime rolü ve worker rolü için tablo bazlı `GRANT` matrisi (en az yetki); auth şemaları ayrı rol sınırında
- RLS politika testi yardımcısı: aktör/bağlam kurup tablo başına deny-by-default doğrulama (sonraki kartlar yeni tabloda aynı yardımcıyı kullanır)

**Kabul**
- Bağlam eksikken hiçbir özel tabloda satır okunamaz/yazılamaz
- Başka işletme/düğüne ait satıra SELECT/UPDATE/DELETE bağlam doğru kurulsa da yetkisiz aktör için 0 satır
- Her `SECURITY DEFINER` fonksiyonu sabit `search_path` ve kısıtlı execute izniyle (katalog sorgusuyla test)

**Kapsam dışı:** Hizmet katmanı (use-case) yetkisi ve DTO'lar sonraki kartlarda; bu paket yalnız ikinci savunma hattıdır.

**Oku:** `AGENTS.md`, §8.1, §17.2, §17.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K02-08](K02-db-erisim-cekirdegi.md#K02-08)

**Bunu bekleyenler:** [K02-07](K02-db-erisim-cekirdegi.md#K02-07), [K03-06](K03-kimlik-uyelik.md#K03-06)

---

<a id="K02-07"></a>
## K02-07 · İki işletme/iki düğün fixture'ı ve çekirdek T-08/T-10 testleri

**Boyut:** M · **Dalga:** 11 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K02-06](K02-db-erisim-cekirdegi.md#K02-06)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `tests/integration/fixtures/`, `tests/integration/db/`, `tests/security/core/`, `packages/db/src/testing/`

**Teslim edilecekler**
- Fixture: iki işletme × iki düğün × çift üyesi / yakın / personel / sistem aktörleri; sahte, kişisel veri içermeyen sabit kimlikler
- T-08 çekirdek: müşteri A, B'nin event/üyelik/davet kimliğini DAL ve doğrudan SQL ile dener: hiçbir satır/sayı/metadata dönmez
- T-10: bağlamı eksik DB oturumu ve pool reuse: RLS kapalı erişim; önceki isteğin actor'ı taşınmaz
- Roller testi: runtime/worker rolü sahip, superuser veya `BYPASSRLS` değil

**Kabul**
- Testler gerçek PostgreSQL'e karşı CI'da yeşil (SQLite/mock yok)
- RLS devre dışı bırakılan bir deneme migration'ında testler kırmızı olur (mutasyon kanıtı raporda)
- Bu paketin geçmesi gereken şartname testleri: T-08, T-10 (§20.1).

**Kapsam dışı:** Medya/mesaj/belge/ödeme kimlikleriyle T-08'in tam hali sonraki kartlarda tamamlanır.

**Oku:** `AGENTS.md`, §8.1, §17.2, §20.1 (+ zorunlu: §1, §4, §20.2)

**Bunu bekleyenler:** [K03-01](K03-kimlik-uyelik.md#K03-01)

---

<a id="K02-08"></a>
## K02-08 · Veri envanteri iskeleti ve CI denetimi (PRIV-01)

**Boyut:** S · **Dalga:** 10 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K02-04](K02-db-erisim-cekirdegi.md#K02-04)

**Dokunabileceğin yollar (yalnız bunlar):** `docs/data-inventory.md`, `scripts/check-data-inventory.ts`, `.github/workflows/data-inventory.yml`

**Teslim edilecekler**
- `docs/data-inventory.md`: her kişisel veri alanı için amaç, hukuki dayanak/aydınlatma, saklama süresi, erişen roller, aktarılan sağlayıcı ve işleme yeri sütunları; K02 tablolarının alanları dolu (karar bekleyenler `işletme kararı bekliyor`)
- `check-data-inventory.ts`: şemadaki her tablo/kolon için envanterde satır ya da açıkça `kişisel veri değil` işareti arar; eksikte CI kırılır
- Envanter şablonu PR şablonundaki PRIV-01 maddesine bağlanır

**Kabul**
- Envanterde karşılığı olmayan yeni kolon ekleyen deneme PR'ı CI'da kırmızı olur
- Gerçek kişisel veri/örnek kişi bilgisi dosyada yok

**Oku:** `AGENTS.md`, §17.6, §4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K02-06](K02-db-erisim-cekirdegi.md#K02-06)

**Bunu bekleyenler:** [K03-01](K03-kimlik-uyelik.md#K03-01)

---
