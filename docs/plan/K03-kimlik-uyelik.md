# K03 — Kimlik ve kontrollü üyelik

**Kilometre taşı:** M0 — Temel ve hazırlık (K00–K04) · **Şartname:** §7, §12.3, §17.2, §17.3, §17.4 · [Plan dizini](README.md)

> Müşteri sosyal girişi, ayrı personel girişi (parola + TOTP), kontrollü düğün daveti, OTP ve oturum yönetimi.

**§21.3 insan inceleme kapısı** (kimlik ayrımı, MFA şartı, oturum iptali, davet token'ı + kanal kanıtı, OAuth ayarı). Bu kart birleşmeden K04 başlamaz. Gerçek sağlayıcı hesapları ürün sahibinden gelir (K03-13); gelmeden kod fake/test OIDC ile doğrulanır ve eksik açıkça raporlanır.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K03-01](K03-kimlik-uyelik.md#K03-01) · Better Auth erken doğrulama ve ADR (iki instance, oturum önbelleği) | M | 12 | K02-07, K02-08 | insan inceleme |
| [K03-02](K03-kimlik-uyelik.md#K03-02) · Müşteri kimliği: Better Auth instance'ı + Google | L | 13 | K03-01 | insan inceleme, migration |
| [K03-03](K03-kimlik-uyelik.md#K03-03) · Facebook, Apple ve güvenli hesap bağlama | M | 14 | K03-02 | insan inceleme |
| [K03-04](K03-kimlik-uyelik.md#K03-04) · Personel kimliği: ayrı instance, parola + TOTP + kurtarma kodları | L | 13 | K03-01 | insan inceleme, migration |
| [K03-05](K03-kimlik-uyelik.md#K03-05) · İlk personel kurulumu (bootstrap) ve personel daveti | M | 14 | K03-04 | insan inceleme, migration |
| [K03-06](K03-kimlik-uyelik.md#K03-06) · Oturumdan ActorContext üretimi ve sunucu guard'ları | M | 14 | K03-02, K03-04, K02-06 | insan inceleme |
| [K03-07](K03-kimlik-uyelik.md#K03-07) · Giriş katmanı: origin/CSRF, şema doğrulama, toplu atama koruması, hız limiti ilkeli | L | 15 | K03-06 | insan inceleme, migration |
| [K03-08](K03-kimlik-uyelik.md#K03-08) · consent_record ve hukuki metin sürüm kaydı | S | 15 | K03-06 | insan inceleme, migration |
| [K03-09](K03-kimlik-uyelik.md#K03-09) · Düğün daveti kabulü (kanal kanıtı) | L | 16 | K03-06, K03-07, K03-08, K01-05 | insan inceleme, migration |
| [K03-10](K03-kimlik-uyelik.md#K03-10) · Telefon doğrulama portu ve OTP/SMS istismar korumaları | M | 16 | K03-06, K03-07, K03-08 | insan inceleme, migration |
| [K03-11](K03-kimlik-uyelik.md#K03-11) · Oturum yönetimi, hesabı kilitleme ve hesap kurtarma | M | 15 | K03-05, K03-06 | insan inceleme |
| [K03-12](K03-kimlik-uyelik.md#K03-12) · Kimlik test paketi ve Better Auth yükseltme CI işi | M | 17 | K03-03, K03-05, K03-09, K03-10, K03-11, K03-07 | insan inceleme |
| [K03-13](K03-kimlik-uyelik.md#K03-13) · OAuth sağlayıcı hesapları ve staging callback kayıtları | M | 2 | K01-08 | ürün sahibi girdisi, hesap |

<a id="K03-01"></a>
## K03-01 · Better Auth erken doğrulama ve ADR (iki instance, oturum önbelleği)

**Boyut:** M · **Dalga:** 12 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K02-07](K02-db-erisim-cekirdegi.md#K02-07), [K02-08](K02-db-erisim-cekirdegi.md#K02-08)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/adr/*-better-auth.md`, `packages/auth/package.json`, `packages/auth/spike/`, `docs/reports/K03-better-auth-olcum.md`

**Teslim edilecekler**
- Better Auth sürümü sabitlenir (güvenlik duyuruları izlenir); ADR §7.1 doğrulama listesinin tamamını yanıtlar
- Kanıt: iki ayrı instance (müşteri/personel) farklı `basePath`, cookie adı/öneki ve tablo şemasıyla aynı Postgres'te çalışıyor; adapter ve migration uyumu; uyumsuzsa personel için ayrı örnek/şema kararı
- Ölçüm: cookie cache/stateless oturum açıkken oturum iptalinin etkili olma gecikmesi; müşteri için kabul edilen azami gecikme (öneri ≤1 dk) yazılı karar; personelde her istekte DB doğrulaması
- Karar: sağlayıcı access/refresh token'ları saklanmaz (veya şifreli ve asgari kapsamlı); sosyal sağlayıcı API'sine kullanıcı adına çağrı yok
- Spike kodu (`packages/auth/spike/`) K03-02/04'te silinir veya gerçek koda dönüşür

**Kabul**
- ADR birleşmeden diğer K03 paketleri başlamaz
- Ölçüm betiği ve sonuç tablosu `docs/reports/` altında; sır içermez

**Kapsam dışı:** Üretim akışı, UI ve sağlayıcı yapılandırması bu pakette yok.

**Oku:** `AGENTS.md`, §5.1, §7.1, §17.4, §24 (+ zorunlu: §1, §4, §20.2)

**Bunu bekleyenler:** [K03-02](K03-kimlik-uyelik.md#K03-02), [K03-04](K03-kimlik-uyelik.md#K03-04)

---

<a id="K03-02"></a>
## K03-02 · Müşteri kimliği: Better Auth instance'ı + Google

**Boyut:** L · **Dalga:** 13 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-01](K03-kimlik-uyelik.md#K03-01)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/auth/src/customer/`, `packages/db/src/schema/auth-customer.ts`, `packages/db/migrations/*_auth_customer.sql`, `apps/web/app/api/auth/customer/`, `tests/integration/auth/customer/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `/api/auth/customer/*` altında Better Auth müşteri örneği; PostgreSQL'de kalıcı oturum; ayrı cookie öneki, `HttpOnly`/`Secure`, uygun `SameSite`; token `localStorage`'da yok
- Google ile giriş; kimlik anahtarı `(provider, subject)`; e-posta eşleşti diye hesap birleştirilmez; hesap açılması ≠ düğün üyeliği ≠ telefon doğrulaması
- Testlerde gerçek Google yerine yerel test OIDC sağlayıcısı (üretimde etkin değil)
- Oturum süreleri (öneri: müşteri 7 gün tavan / 24 saat boşta) yapılandırılabilir

**Kabul**
- Aynı e-postalı ikinci sağlayıcı hesabı, mevcut hesaba otomatik bağlanmaz (testle)
- Müşteri oturumu hiçbir koşulda personel tablolarına/yetkisine işaret etmez

**Kapsam dışı:** Facebook/Apple ve hesap bağlama K03-03'te; personel girişi K03-04'te.

**Oku:** `AGENTS.md`, §7.1, §17.3, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K03-04](K03-kimlik-uyelik.md#K03-04)

**Bunu bekleyenler:** [K03-03](K03-kimlik-uyelik.md#K03-03), [K03-06](K03-kimlik-uyelik.md#K03-06)

---

<a id="K03-03"></a>
## K03-03 · Facebook, Apple ve güvenli hesap bağlama

**Boyut:** M · **Dalga:** 14 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-02](K03-kimlik-uyelik.md#K03-02)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/auth/src/customer/providers/`, `tests/integration/auth/providers/`

**Teslim edilecekler**
- Facebook Login ve Apple ile giriş; Apple gizli/relay e-posta ve Facebook'tan e-posta gelmemesi hata sayılmaz, hesap sahipliğine dönüştürülmez; iletişim adresi ayrıca doğrulanabilir
- Hesap bağlama: mevcut hesaba giriş + yeniden doğrulama + yeni sağlayıcı doğrulaması şart
- Profilden ad ve e-posta dışında alan alınmaz (minimizasyon, §17.6); veri envanteri güncellenir

**Kabul**
- T-12 senaryolarının sağlayıcı katmanı geçer: aynı e-posta/farklı sağlayıcı, Apple relay, eksik e-posta
- Gerçek sağlayıcı kimlik bilgileri yoksa test OIDC ile doğrulanır ve eksiklik raporda yazılı

**Kapsam dışı:** Sağlayıcı konsol hesapları (K03-13) bu pakette açılmaz.

**Oku:** `AGENTS.md`, §7.1, §17.6 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K03-05](K03-kimlik-uyelik.md#K03-05), [K03-06](K03-kimlik-uyelik.md#K03-06)

**Bunu bekleyenler:** [K03-12](K03-kimlik-uyelik.md#K03-12)

---

<a id="K03-04"></a>
## K03-04 · Personel kimliği: ayrı instance, parola + TOTP + kurtarma kodları

**Boyut:** L · **Dalga:** 13 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-01](K03-kimlik-uyelik.md#K03-01)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/auth/src/staff/`, `packages/db/src/schema/auth-staff.ts`, `packages/db/migrations/*_auth_staff.sql`, `apps/web/app/api/auth/staff/`, `tests/integration/auth/staff/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `/api/auth/staff/*` altında ayrı Better Auth örneği: ayrı cookie, tablo şeması ve `basePath`; sosyal giriş yok
- Parola + TOTP; tek kullanımlık kurtarma kodları; MFA aşaması tamamlanmadan oturum yönetim yetkisi taşımaz (aşama bilgisi sunucuda oturumda)
- Personel oturum tavanı 12 saat, boşta 30 dakika (yapılandırılabilir); her istekte DB'den doğrulama
- Parola politikası ve kaba kuvvet/hız sınırı (hız sınırı ilkeli K03-07'de ortaklaşa)

**Kabul**
- T-33 temel durumu: parolayı girmiş fakat TOTP'yi tamamlamamış hesap yönetim isteği atınca reddedilir
- Personel ve müşteri cookie'leri birbirinin uç noktasında geçersiz

**Kapsam dışı:** İlk personel kurulumu ve personel daveti K03-05'te.

**Oku:** `AGENTS.md`, §7.1, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K03-02](K03-kimlik-uyelik.md#K03-02)

**Bunu bekleyenler:** [K03-05](K03-kimlik-uyelik.md#K03-05), [K03-06](K03-kimlik-uyelik.md#K03-06)

---

<a id="K03-05"></a>
## K03-05 · İlk personel kurulumu (bootstrap) ve personel daveti

**Boyut:** M · **Dalga:** 14 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-04](K03-kimlik-uyelik.md#K03-04)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/auth/src/staff/bootstrap/`, `packages/auth/src/staff/invite/`, `packages/db/migrations/*_staff_bootstrap.sql`, `docs/runbook/staff-bootstrap.md`, `tests/integration/auth/bootstrap/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- Tek kullanımlık güvenli bootstrap: sunucu tarafı CLI komutu bir kez gösterilen süreli token üretir (hash'i saklanır); ilk işletme sahibi bununla hesap açar; varsayılan parola veya herkese açık admin kayıt ekranı yok
- Davetle personel açma: `staff.manage`/`member.invite` izniyle, süreli tek kullanımlık davet; rol/izin atamasına denetim kaydı (AuditSink)
- Runbook: bootstrap adımları ve sır hijyeni (token'ı kopyalayıp saklama yok)

**Kabul**
- Bootstrap token ikinci kez kullanılamaz, süresi dolunca geçersiz, düz metin hiçbir yerde saklanmaz
- Davetsiz personel kaydı yolu yoktur (route taraması testi)

**Kapsam dışı:** Personel arayüzü K21'dedir; burada API/CLI düzeyi.

**Oku:** `AGENTS.md`, §7.1, §7.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K03-03](K03-kimlik-uyelik.md#K03-03), [K03-06](K03-kimlik-uyelik.md#K03-06)

**Bunu bekleyenler:** [K03-11](K03-kimlik-uyelik.md#K03-11), [K03-12](K03-kimlik-uyelik.md#K03-12), [K21-02](K21-yonetim-kabugu-takvim.md#K21-02)

---

<a id="K03-06"></a>
## K03-06 · Oturumdan ActorContext üretimi ve sunucu guard'ları

**Boyut:** M · **Dalga:** 14 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-02](K03-kimlik-uyelik.md#K03-02), [K03-04](K03-kimlik-uyelik.md#K03-04), [K02-06](K02-db-erisim-cekirdegi.md#K02-06)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/auth/src/actor/`, `packages/auth/src/guards/`, `tests/security/auth-guards/`

**Teslim edilecekler**
- `resolveActor(request)`: oturumu doğrular, `ActorContext` üretir (`customer|staff|system`), K02-05 `withActor` ile DB bağlamını kurar
- Guard'lar: `requireCustomer()`, `requireStaff({ permission, mfa: true })`; yönetim yolları müşteri sosyal oturumuyla asla geçilemez; MFA aşaması sunucuda şart
- Yüksek riskli işlemler için `requireRecentReauth(maxAgeSec)`
- Server Action ve route handler'larda aynı guard'ı çağıran ince sarmalayıcı (yetkiyi middleware'e bırakmaz)

**Kabul**
- T-11: müşteri sosyal cookie'siyle admin API/Action çağrısı reddedilir
- Personel oturumu iptali bir sonraki istekte etkili (ölçümlü); müşteri iptali K03-01 ADR sınırı içinde
- Bu paketin geçmesi gereken şartname testleri: T-11 (§20.1).

**Kapsam dışı:** Davet kabulü, OTP ve oturum listesi sonraki paketlerde.

**Oku:** `AGENTS.md`, §7.1, §17.2, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K03-03](K03-kimlik-uyelik.md#K03-03), [K03-05](K03-kimlik-uyelik.md#K03-05)

**Bunu bekleyenler:** [K03-07](K03-kimlik-uyelik.md#K03-07), [K03-08](K03-kimlik-uyelik.md#K03-08), [K03-09](K03-kimlik-uyelik.md#K03-09), [K03-10](K03-kimlik-uyelik.md#K03-10), [K03-11](K03-kimlik-uyelik.md#K03-11), [K13-04](K13-davetiye-takvim.md#K13-04)

---

<a id="K03-07"></a>
## K03-07 · Giriş katmanı: origin/CSRF, şema doğrulama, toplu atama koruması, hız limiti ilkeli

**Boyut:** L · **Dalga:** 15 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-06](K03-kimlik-uyelik.md#K03-06)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/auth/src/request/`, `packages/contracts/src/http/`, `packages/db/src/schema/rate-limit.ts`, `packages/db/migrations/*_rate_limit.sql`, `packages/application/src/rate-limit/`, `tests/security/request-layer/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- Cookie kullanan yazma isteklerinde origin/CSRF doğrulaması; güvenli redirect allowlist; OAuth callback istisnası uygulamanın geri kalanında CSRF'yi gevşetmez
- Zod ile body/query doğrulama sarmalayıcısı: bilinmeyen alan reddedilir (toplu atama); `status`, `role`, `organization_id`, `visibility` istemciden doğrudan alınmaz
- Standart hata biçimi `code`, `message`, `fieldErrors`, `correlationId` ve durum kodu eşlemesi (400/401/403/404/409/429) — ham DB/provider yanıtı yok
- DB tabanlı hız limiti ilkeli (çok örnekte çalışır): anahtar × pencere × limit, anonim talep/giriş/OTP/SMS/chatbot/export için ayrı profiller; `429` + `Retry-After`

**Kabul**
- T-28 çekirdek: sahte fiyat/rol/status alanı gönderen ve cross-site isteği yapan testler reddedilir; yetki değişmez
- Hız limiti iki farklı süreç örneğinde ortak sayaçla çalışır (entegrasyon testi)
- Bu paketin geçmesi gereken şartname testleri: T-28 (§20.1).

**Kapsam dışı:** Her yeni endpoint kendi şemasını kendi kartında yazar; K17 tüm endpoint'lerde T-28'i tekrar koşar.

**Oku:** `AGENTS.md`, §17.2, §17.3, §17.4, §18.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K03-08](K03-kimlik-uyelik.md#K03-08), [K03-11](K03-kimlik-uyelik.md#K03-11)

**Bunu bekleyenler:** [K03-09](K03-kimlik-uyelik.md#K03-09), [K03-10](K03-kimlik-uyelik.md#K03-10), [K03-12](K03-kimlik-uyelik.md#K03-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K15-06](K15-chatbot.md#K15-06)

---

<a id="K03-08"></a>
## K03-08 · consent_record ve hukuki metin sürüm kaydı

**Boyut:** S · **Dalga:** 15 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-06](K03-kimlik-uyelik.md#K03-06)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/consent.ts`, `packages/db/migrations/*_consent_record.sql`, `packages/application/src/consent/`, `packages/contracts/src/consent/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `consent_record`: kişi/aktör, amaç, metin sürüm kimliği, gösterim zamanı, onay/ret, kaynak ekran; açık rıza hizmet şartı kabulüne gömülmez
- `recordConsent(tx, ...)` ve metin sürüm kimlikleri sözlüğü (K20-06 listesine bağlanır); K06, K10, K13 aynı yardımcıyı kullanır
- Veri envanteri güncellenir

**Kabul**
- Aynı işlemin transaction'ında consent kaydı atomik yazılır
- Aydınlatma sürümü olmadan kaydetme denemesi reddedilir

**Kapsam dışı:** Metinlerin içeriği K20-06'dadır; ekranlardaki gösterim ilgili kartlarda.

**Oku:** `AGENTS.md`, §17.6, §8 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K03-07](K03-kimlik-uyelik.md#K03-07), [K03-11](K03-kimlik-uyelik.md#K03-11)

**Bunu bekleyenler:** [K03-09](K03-kimlik-uyelik.md#K03-09), [K03-10](K03-kimlik-uyelik.md#K03-10), [K13-04](K13-davetiye-takvim.md#K13-04)

---

<a id="K03-09"></a>
## K03-09 · Düğün daveti kabulü (kanal kanıtı)

**Boyut:** L · **Dalga:** 16 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-06](K03-kimlik-uyelik.md#K03-06), [K03-07](K03-kimlik-uyelik.md#K03-07), [K03-08](K03-kimlik-uyelik.md#K03-08), [K01-05](K01-iskelet.md#K01-05)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/invitations/`, `apps/web/app/api/invitations/`, `packages/db/migrations/*_invitation_proof.sql`, `tests/integration/invitations/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `POST /api/invitations/accept`: yüksek entropili, DB'de hash'i tutulan, süreli (varsayılan 48 saat), tek kullanımlık token; oluşturulurken tek hedef kanala bağlı (`event_invitation`)
- Kanal kanıtı iki yoldan biri: (a) giriş yapan hesabın sağlayıcıca doğrulanmış e-postası davet hedefiyle eşleşir (Apple relay/doğrulanmamış e-posta eşleşme sayılmaz); (b) hedef kanala kabul anında gönderilen ikinci, kısa ömürlü, tek kullanımlık kod
- Token tüketimi + kanal kanıtı + üyelik kaydı **tek transaction**; başarısız deneme sınırı (öneri 5); atanan rol aynı kontrolün parçası
- Kod gönderimi `ChannelProofSender` portundan; K10'a kadar fake adaptör; token ve kod loglara/denetim kaydına düz yazılmaz
- Aydınlatma metni gösterimi `consent_record` ile kaydedilir

**Kabul**
- T-13: kullanılmış/süresi dolmuş/başkasına ait/başkasına iletilmiş token, kanal kanıtı eksik hesap: üyelik oluşmaz, deneme sınırı çalışır, token logda yok
- Bağlantıyı açıp oturum açmak tek başına üyelik üretmez (testle)
- Bu paketin geçmesi gereken şartname testleri: T-13 (§20.1).

**Kapsam dışı:** Davet oluşturma ekranı ve gerçek gönderim K06/K10'dadır.

**Oku:** `AGENTS.md`, §7.1, §17.3, §17.6, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K03-10](K03-kimlik-uyelik.md#K03-10)

**Bunu bekleyenler:** [K03-12](K03-kimlik-uyelik.md#K03-12), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-10](K06-talep-ziyaret-teklif.md#K06-10)

---

<a id="K03-10"></a>
## K03-10 · Telefon doğrulama portu ve OTP/SMS istismar korumaları

**Boyut:** M · **Dalga:** 16 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-06](K03-kimlik-uyelik.md#K03-06), [K03-07](K03-kimlik-uyelik.md#K03-07), [K03-08](K03-kimlik-uyelik.md#K03-08)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/phone-verification/`, `packages/db/migrations/*_phone_verification.sql`, `tests/integration/otp/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- E.164 doğrulama, OTP üretimi/doğrulama: süre, deneme limiti, gönderim kotası; OTP düz metin loglanmaz
- Hız limitleri: numara, IP/cihaz ve ülke öneki başına; izinli ülke öneki listesi işletme ayarı (başlangıç +90); işletme toplam SMS bütçesi sayacı; olağandışı oran için alarm olayı (SMS pumping)
- `SmsProvider` portundan gönderim (fake adaptör); telefon doğrulaması düğün sahipliği kanıtı değildir
- `consent_record` ile aydınlatma kaydı; veri envanteri güncellenir

**Kabul**
- Aynı numaraya/IP'ye/ülke önekine ardışık istek limitte durur, rezervasyon etkilenmez
- OTP log ve denetim kaydında düz görünmez (redaksiyon testi)

**Kapsam dışı:** Gerçek SMS sağlayıcısı ve K10'daki tam maliyet/webhook (T-36) kapsam dışı.

**Oku:** `AGENTS.md`, §7.1, §12.3, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K03-09](K03-kimlik-uyelik.md#K03-09)

**Bunu bekleyenler:** [K03-12](K03-kimlik-uyelik.md#K03-12), [K10-16](K10-bildirim-eposta-sms.md#K10-16)

---

<a id="K03-11"></a>
## K03-11 · Oturum yönetimi, hesabı kilitleme ve hesap kurtarma

**Boyut:** M · **Dalga:** 15 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-05](K03-kimlik-uyelik.md#K03-05), [K03-06](K03-kimlik-uyelik.md#K03-06)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/sessions/`, `packages/application/src/recovery/`, `tests/integration/sessions/`

**Teslim edilecekler**
- Sunucuda oturum iptali, cihaz/oturum listesi, hesabı kilitleme; üyelik iptali sonrası yeni istek/dosya/akış reddi için `membershipRevoked` olayı
- Personel MFA sıfırlama ve hesap kurtarma: denetlenebilir sahiplik doğrulaması şart; destek personeli yalnız e-posta/telefon bilerek erişim veremez
- Müşteri kurtarma: sosyal hesaba erişemeyen/sağlayıcısı olmayan müşteri için personelin sahiplik doğrulamasıyla yeniden davet göndermesi (yedek giriş yok)
- Her adım `AuditSink`'e yazılır (K04-06'da gerçek yazıcıya bağlanır)

**Kabul**
- Oturum iptali sonrası aynı cookie ile istek reddedilir (personel anında; müşteri ADR sınırı içinde)
- Sahiplik doğrulaması olmadan MFA sıfırlama/yeniden davet yapılamaz

**Kapsam dışı:** Sohbet/medya kanallarının canlı kapatılması K09/K11'dedir; burada olay/API tarafı.

**Oku:** `AGENTS.md`, §7.1, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K03-07](K03-kimlik-uyelik.md#K03-07), [K03-08](K03-kimlik-uyelik.md#K03-08)

**Bunu bekleyenler:** [K03-12](K03-kimlik-uyelik.md#K03-12), [K09-05](K09-sohbet-canli-akis.md#K09-05), [K09-09](K09-sohbet-canli-akis.md#K09-09), [K16-01](K16-yonetim-butunlestirme.md#K16-01), [K16-02](K16-yonetim-butunlestirme.md#K16-02)

---

<a id="K03-12"></a>
## K03-12 · Kimlik test paketi ve Better Auth yükseltme CI işi

**Boyut:** M · **Dalga:** 17 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K03-03](K03-kimlik-uyelik.md#K03-03), [K03-05](K03-kimlik-uyelik.md#K03-05), [K03-09](K03-kimlik-uyelik.md#K03-09), [K03-10](K03-kimlik-uyelik.md#K03-10), [K03-11](K03-kimlik-uyelik.md#K03-11), [K03-07](K03-kimlik-uyelik.md#K03-07)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `tests/security/identity/`, `tests/e2e/auth/`, `.github/workflows/auth-regression.yml`, `docs/reports/K03-kabul.md`

**Teslim edilecekler**
- T-09 (kimlik katmanı: iptal gecikmesi ölçümü ve kabul edilen sınır), T-11, T-12, T-13, T-33 tek komutla (`pnpm test:auth-regression`) koşar
- Better Auth sürümü değişen PR'larda bu iş zorunlu çalışır (yükseltme sonrası T-09/T-11/T-12/T-33 yeniden)
- `K03-kabul.md`: neyin gerçek sağlayıcıyla, neyin test OIDC ile doğrulandığı; K03-13 eksikleri açıkça

**Kabul**
- Sosyal hesap admin olamaz; MFA'sız personel yönetim API'sine giremez; sınırlar rapora yazılı
- İnsan inceleyici onayı PR'a işlenmiş (§21.3)
- Bu paketin geçmesi gereken şartname testleri: T-09, T-11, T-12, T-13, T-33 (§20.1).

**Kapsam dışı:** Sohbet/medyada oturum iptali sonrası kanal kapanışı (T-09'un geri kalanı) K09/K11'de tamamlanır.

**Oku:** `AGENTS.md`, §7.1, §20.1 (+ zorunlu: §1, §4, §20.2)

**Bunu bekleyenler:** [K04-01](K04-outbox-audit-isci.md#K04-01), [K04-02](K04-outbox-audit-isci.md#K04-02), [K04-04](K04-outbox-audit-isci.md#K04-04), [K04-06](K04-outbox-audit-isci.md#K04-06), [K04-07](K04-outbox-audit-isci.md#K04-07), [K04-08](K04-outbox-audit-isci.md#K04-08), [K21-01](K21-yonetim-kabugu-takvim.md#K21-01), [K17-02](K17-staging-kabul.md#K17-02), [K17-05](K17-staging-kabul.md#K17-05)

---

<a id="K03-13"></a>
## K03-13 · OAuth sağlayıcı hesapları ve staging callback kayıtları

**Boyut:** M · **Dalga:** 2 · **Tür:** hesap
**Başlamadan önce `main`'de olması gerekenler:** [K01-08](K01-iskelet.md#K01-08)
**Ürün sahibinden gereken:** Apple Developer, Facebook/Meta ve Google Cloud hesapları ve callback/domain kayıtları.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/reports/K03-oauth-hesaplari.md`

**Teslim edilecekler**
- Google OAuth istemcisi, Facebook uygulaması ve Apple hizmet kimliği/anahtarı: staging ve (ayrı) üretim callback adresleriyle; gizli değerler yalnız korumalı environment'a girilir
- `docs/reports/K03-oauth-hesaplari.md`: hangi sağlayıcı hazır/bekliyor, test kullanıcıları, inceleme/onay süreleri (sır yok)

**Kabul**
- Üç sağlayıcıyla staging'de giriş denenmiş (ya da hangisinin neden hazır olmadığı yazılı)
- Hesap/inceleme süreleri kod tesliminde garanti edilmez; eksik sağlayıcı ürün sahibinin açık kapsam kararıyla kapatılır (§20.3)

**Oku:** `AGENTS.md`, §7.1, §23, §20.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-05](K00-depo-kurallari.md#K00-05), [K01-01](K01-iskelet.md#K01-01), [K20-01](K20-tasarim-icerik.md#K20-01), [K20-02](K20-tasarim-icerik.md#K20-02), [K20-06](K20-tasarim-icerik.md#K20-06), [K10-02](K10-bildirim-eposta-sms.md#K10-02), [K11-01](K11-medya-temeli.md#K11-01)

**Bunu bekleyenler:** [K17-06](K17-staging-kabul.md#K17-06), [K18-02](K18-canliya-gecis.md#K18-02)

---
