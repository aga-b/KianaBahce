# K05 — Rezervasyon motoru

**Kilometre taşı:** M1 — Personel takvimi (K05, K21) · **Şartname:** §8, §9, §18.2, §19.2 · [Plan dizini](README.md)

> Alan/kaynak/seans yapılandırması, tutma/kesinleştirme/iptal/taşıma komutları, çakışmayı DB'nin reddettiği allocation modeli, tutma süre dolumu ve anonim uygunluk.

**§21.3 insan inceleme kapısı:** kilit sırası, izolasyon, exclusion constraint, süre dolumu ve hata eşlemesini değiştiren PR'lar (işaretli iş paketleri) atanmış insan inceleyici onaylamadan birleşmez. Gerçek alan sayısı, seans saati, kapasite ve tampon süreleri uydurulmaz; yalnız `dev` seed'i ve test fixture'ı örnek alan içerir. `booking.event_id` boş olabilir (talep/tutma aşamasında etkinlik yoktur); etkinlik bağlama K06-10'dadır.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K05-01](K05-rezervasyon-motoru.md#K05-01) · Rezervasyon sözleşmeleri: komutlar, DTO'lar, hata kodları | S | 22 | K04-10 |  |
| [K05-02](K05-rezervasyon-motoru.md#K05-02) · Zaman modeli: [başlangıç, bitiş), tampon, timezone, çalışma kuralı (domain) | M | 23 | K05-01 |  |
| [K05-03](K05-rezervasyon-motoru.md#K05-03) · Rezervasyon şeması: booking, allocation, kapanış, durum geçmişi, exclusion constraint | L | 23 | K05-01, K04-10 | insan inceleme, migration |
| [K05-04](K05-rezervasyon-motoru.md#K05-04) · Alan/kaynak/seans yapılandırma use-case'leri ve yalnız-dev seed | M | 24 | K05-02, K05-03 |  |
| [K05-05](K05-rezervasyon-motoru.md#K05-05) · Transaction çatısı: kilit sırası, karar zamanı, süre dolumu, hata eşlemesi, test fixture'ları | L | 24 | K05-03 | insan inceleme |
| [K05-06](K05-rezervasyon-motoru.md#K05-06) · Tutma komutu (hold) | M | 25 | K05-02, K05-05 | insan inceleme |
| [K05-07](K05-rezervasyon-motoru.md#K05-07) · Kesinleştirme ve iptal komutları (confirm/cancel) + ConfirmationGate portu | M | 25 | K05-02, K05-05 | insan inceleme |
| [K05-08](K05-rezervasyon-motoru.md#K05-08) · Tarih/alan taşıma komutu (reschedule) | M | 25 | K05-02, K05-05 | insan inceleme |
| [K05-09](K05-rezervasyon-motoru.md#K05-09) · Tutma süre dolumu işi ve uzatma komutu | M | 25 | K05-05 | insan inceleme |
| [K05-10](K05-rezervasyon-motoru.md#K05-10) · Anonim uygunluk sorgusu ve DTO'su | M | 25 | K05-02, K05-04 |  |
| [K05-11](K05-rezervasyon-motoru.md#K05-11) · Admin booking uçları: hold, confirm, cancel, reschedule, extend | M | 26 | K05-06, K05-07, K05-08, K05-09 |  |
| [K05-12](K05-rezervasyon-motoru.md#K05-12) · Operasyon takvimi okuma ucu (personel DTO'su) | M | 25 | K05-03, K05-04 |  |
| [K05-13](K05-rezervasyon-motoru.md#K05-13) · Eşzamanlılık test paketi (T-01–T-07, T-38) | L | 27 | K05-06, K05-07, K05-08, K05-09, K05-10, K05-11 | insan inceleme |
| [K05-14](K05-rezervasyon-motoru.md#K05-14) · Kabul raporu, performans ölçümü ve insan inceleme paketi | S | 28 | K05-13, K05-12 | insan inceleme, doküman |

<a id="K05-01"></a>
## K05-01 · Rezervasyon sözleşmeleri: komutlar, DTO'lar, hata kodları

**Boyut:** S · **Dalga:** 22 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K04-10](K04-outbox-audit-isci.md#K04-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/contracts/src/booking/`

**Teslim edilecekler**
- Zod şemaları: `HoldBooking`, `ConfirmBooking`, `CancelBooking`, `RescheduleBooking`, `ExtendHold`, `AvailabilityQuery`/`AvailabilityDto`, `OperationsCalendarQuery`/`CalendarItemDto`; zaman DTO'ları offset'li ISO 8601 (§18.1)
- Hata kodları: `SLOT_UNAVAILABLE`, `VERSION_CONFLICT`, `HOLD_EXPIRED`, `CHECKLIST_INCOMPLETE`, `FORBIDDEN`, `VALIDATION_FAILED`; 409 gövdesi **müşteri adı/booking kimliği içermez**
- Endpoint yolları tek sürümde kilitlenir (§18.2 admin/booking satırları + `GET /api/public/availability`); bu iş birleşmeden K05 tüketici işleri ve K21 başlamaz
- Ortak sözleşme olduğu için tek başına küçük PR

**Kabul**
- Şemalar tek başına derlenir ve sözleşme testleri (geçerli/geçersiz örnek) yeşildir
- Yeni alan eklemek tüketici kodunu kırmadan yapılabilir (isteğe bağlı alan kuralı belgelenmiş)

**Kapsam dışı:** Uygulama/DB kodu yok.

**Oku:** `AGENTS.md`, §9.3, §9.4, §18.1, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K07-02](K07-kurumsal-site-icerik.md#K07-02), [K08-01](K08-dugunum-pano-onay.md#K08-01), [K09-01](K09-sohbet-canli-akis.md#K09-01), [K10-03](K10-bildirim-eposta-sms.md#K10-03), [K11-02](K11-medya-temeli.md#K11-02), [K16-05](K16-yonetim-butunlestirme.md#K16-05)

**Bunu bekleyenler:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-03](K05-rezervasyon-motoru.md#K05-03), [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K13-02](K13-davetiye-takvim.md#K13-02), [K15-02](K15-chatbot.md#K15-02)

---

<a id="K05-02"></a>
## K05-02 · Zaman modeli: [başlangıç, bitiş), tampon, timezone, çalışma kuralı (domain)

**Boyut:** M · **Dalga:** 23 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-01](K05-rezervasyon-motoru.md#K05-01)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/domain/src/booking/time/`, `packages/domain/src/booking/opening-rules/`, `packages/domain/test/booking/`

**Teslim edilecekler**
- Saf fonksiyonlar (framework/DB importu yok): yerel gün ve seans → gerçek `[start,end)` aralığı; gece yarısını aşan seans; kurulum/temizlik tamponu eklenmiş bloke aralık; `Europe/Istanbul` ve parametrik timezone; DST geçişi güvenli
- `opening_rule` değerlendirici: çalışma/tatil düzeni, satış ufku (varsayılan 18 ay, ayardan), kapasite (yalnız davetli sayısı) kontrolü
- Süre dolumu kuralı tek yerde: `isBlockActive(block, decisionTime)` — public okuma ve yazma aynı kuralı kullanır (§9.3)
- Özellik tabanlı (property-based) testler: bitişle başlangıcın eşitliği çakışma değildir, tamponlar dahil

**Kabul**
- T-07 domain katmanı: gece yarısı, tampon ve timezone için takvim hesabı ile çakışma hesabı aynı aralığı kullanır
- Sınır değerler (tam bitiş = sonraki başlangıç, DST günü, ay sonu) testli
- Bu paketin geçmesi gereken şartname testleri: T-07 (§20.1).

**Kapsam dışı:** DB, komut ve endpoint yok.

**Oku:** `AGENTS.md`, §8.1, §9.1, §9.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-03](K05-rezervasyon-motoru.md#K05-03), [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K07-03](K07-kurumsal-site-icerik.md#K07-03), [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K10-05](K10-bildirim-eposta-sms.md#K10-05), [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04), [K13-02](K13-davetiye-takvim.md#K13-02), [K15-02](K15-chatbot.md#K15-02)

**Bunu bekleyenler:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-10](K05-rezervasyon-motoru.md#K05-10)

---

<a id="K05-03"></a>
## K05-03 · Rezervasyon şeması: booking, allocation, kapanış, durum geçmişi, exclusion constraint

**Boyut:** L · **Dalga:** 23 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-01](K05-rezervasyon-motoru.md#K05-01), [K04-10](K04-outbox-audit-isci.md#K04-10)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/booking.ts`, `packages/db/migrations/*_booking_schema.sql`, `packages/db/migrations/*_btree_gist.sql`, `packages/db/src/rls/booking.ts`, `tests/integration/db/booking-schema/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `btree_gist` uzantısı (ayrı migration; yönetilen DB'de izin gerekliliği ADR/ rapora not)
- `booking` (durumlar §9.2, `expires_at` zorunlu `held` için, `version`, `event_id` boş olabilir), `resource_allocation` (kaynak, `[start,end)` aralığı `tstzrange`, `blocking` bayrağı, **sahip XOR**: `booking_id` / `appointment_id` / `resource_closure_id` — `appointment` tablosu K06'da geleceği için `appointment_id` sütunu şimdi FK'sız, K06-02 FK ekler), `resource_closure`, `booking_change`, `status_history`
- GiST exclusion constraint: aynı `organization_id + resource_id` için `blocking = true` aralıklar kesişemez; predicate'te `expires_at > now()` **yok** (§9.3); `blocking` kalıcı durum alanı
- Composite FK'ler (`organization_id`), check kısıtları (başlangıç < bitiş, XOR), indeksler (§8.1: kaynak+zaman), RLS politikaları ve grant matrisi K02-06 yardımcılarıyla
- `booking_policy` (işletme başına): tutma süresi (24 saat varsayılan), satış ufku, tampon varsayılanları, uzatma kuralları; ayar sürümü

**Kabul**
- Doğrudan SQL ile iki aktif allocation aynı kaynağa/kesişen aralığa eklenemez (`23P01`); `blocking=false` olan eklenebilir; bitiş = başlangıç kesişme sayılmaz
- Sahip XOR kuralını bozan satır reddedilir; farklı işletmenin kaynağına allocation reddedilir
- RLS: başka işletme aktörü booking/allocation satırı göremez (T-08 çekirdeğinin rezervasyon uzantısı)

**Kapsam dışı:** Komutlar, süre dolumu işçisi ve uygunluk sorgusu sonraki paketlerdedir.

**Oku:** `AGENTS.md`, §8.1, §9.1, §9.2, §9.3, §9.5 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K07-03](K07-kurumsal-site-icerik.md#K07-03), [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K10-05](K10-bildirim-eposta-sms.md#K10-05), [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04), [K13-02](K13-davetiye-takvim.md#K13-02), [K15-02](K15-chatbot.md#K15-02)

**Bunu bekleyenler:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K13-03](K13-davetiye-takvim.md#K13-03)

---

<a id="K05-04"></a>
## K05-04 · Alan/kaynak/seans yapılandırma use-case'leri ve yalnız-dev seed

**Boyut:** M · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-03](K05-rezervasyon-motoru.md#K05-03)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/venue-config/`, `packages/contracts/src/venue-config/`, `scripts/seed-dev-venue.ts`, `tests/integration/venue-config/`

**Teslim edilecekler**
- `venue_space`, `resource`, `space_resource`, `session_template`, `opening_rule`, `booking_policy` için oluştur/güncelle/pasifleştir use-case'leri; izin `staff.manage` (veya ayrı `venue.configure` izni eklenir ve K02-03 izin sözlüğüne küçük PR'la işlenir); `version` ile iyimser eşzamanlılık; denetim kaydı
- Pasifleştirme: aktif/gelecek allocation'ı olan kaynak sessizce silinemez; çakışan kayıt varsa güvenli hata
- `scripts/seed-dev-venue.ts`: **yalnız development**; tek örnek alan + kaynak + iki seans; üretim/staging'de çalışmayı reddeder; gerçek alan verisi uydurulmaz
- Yönetim ekranı yok (K16 'operasyon ayarları'); burada yalnız servis katmanı

**Kabul**
- Use-case testleri: yetkisiz personel reddedilir, farklı işletmenin kaynağı değiştirilemez, eski sürüm 409
- Seed betiği `NODE_ENV=production` veya staging'de hata verir (test)

**Kapsam dışı:** Gerçek kaynak haritası ürün sahibince onaylanır (§9.1, §23); bu iş yalnız mekanizmayı kurar.

**Oku:** `AGENTS.md`, §7.2, §8.1, §9.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-05](K05-rezervasyon-motoru.md#K05-05), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K11-05](K11-medya-temeli.md#K11-05), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K12-01](K12-galeri-oynatici.md#K12-01), [K13-03](K13-davetiye-takvim.md#K13-03), [K14-02](K14-belge-odeme.md#K14-02), [K15-03](K15-chatbot.md#K15-03), [K15-05](K15-chatbot.md#K15-05)

**Bunu bekleyenler:** [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K16-07](K16-yonetim-butunlestirme.md#K16-07)

---

<a id="K05-05"></a>
## K05-05 · Transaction çatısı: kilit sırası, karar zamanı, süre dolumu, hata eşlemesi, test fixture'ları

**Boyut:** L · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-03](K05-rezervasyon-motoru.md#K05-03)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/booking/shared/`, `packages/db/src/booking/locks.ts`, `packages/db/src/booking/clock.ts`, `packages/application/src/booking/testing/`, `tests/integration/booking/shared/`

**Teslim edilecekler**
- `withBookingTransaction`: `READ COMMITTED`, `lock_timeout` (öneri 3 sn) ve `statement_timeout`; K04-04 idempotency ve K04-06 audit ile sarmalı
- `lockInOrder()`: önce (varsa) değiştirilen booking satırı, sonra kaynaklar `(organization_id, resource_id)` artan sırada; çok kaynaklı komutlar kaynakları baştan sıralar — bu sırayı tersine çeviren API yok
- Tek DB karar zamanı: kilitler alındıktan sonra `clock_timestamp()` değeri sabitlenir; kilit beklemesinden önce alınmış zaman süre denetiminde kullanılmaz
- `expireStaleHolds(tx, resourceIds, decisionTime)`: kilitli kaynaklardaki süresi dolmuş tutmaları aynı transaction'da `expired` yapar ve blokları kaldırır; durum geçmişi + audit
- Hata eşlemesi: `23P01` → `SLOT_UNAVAILABLE` 409; `40P01`/`40001`/`55P03` → aynı idempotency anahtarıyla en çok 3 yeniden deneme (jitter), sonra güvenli 409/503; yeniden deneme kısmi kayıt veya çift outbox üretmez
- Test fixture fabrikaları: hazır alan/kaynak/seans, `held`/`confirmed` booking kurucuları (K05-06/07/08 testleri bunları kullanır)

**Kabul**
- T-38: ters kaynak sırasıyla iki çok kaynaklı komut ve `lock_timeout` aşımı: deadlock yok; olursa güvenli yeniden deneme; kısmi kayıt/çift outbox yok
- Süresi dolmuş tutma, worker kapalıyken yeni yetkili komut tarafından transaction içinde temizlenir (helper testi)
- Bu paketin geçmesi gereken şartname testleri: T-38 (§20.1).

**Kapsam dışı:** Komutların kendisi (hold/confirm/…) ayrı paketlerdedir.

**Oku:** `AGENTS.md`, §9.3, §17.2, §18.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K11-05](K11-medya-temeli.md#K11-05), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K12-01](K12-galeri-oynatici.md#K12-01), [K13-03](K13-davetiye-takvim.md#K13-03), [K14-02](K14-belge-odeme.md#K14-02), [K15-03](K15-chatbot.md#K15-03), [K15-05](K15-chatbot.md#K15-05)

**Bunu bekleyenler:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K06-06](K06-talep-ziyaret-teklif.md#K06-06)

---

<a id="K05-06"></a>
## K05-06 · Tutma komutu (hold)

**Boyut:** M · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-05](K05-rezervasyon-motoru.md#K05-05)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/booking/hold/`, `tests/integration/booking/hold/`

**Teslim edilecekler**
- `holdBooking`: §9.3 sekiz adımının tamamı; izin `booking.hold`; varsayılan süre 24 saat (`booking_policy`), sonlu `expires_at` zorunlu; tampon dahil bloke aralık; kapasite ve çalışma kuralı; çok kaynaklı alan seçiminde (A+B) tüm kaynaklar bloke
- Aynı transaction'da: booking + allocation'lar + durum geçmişi + audit + `booking.held.v1` outbox; commit öncesi dış yan etki yok
- Çakışma yanıtı güvenli `409 SLOT_UNAVAILABLE`, karşı müşteri bilgisi yok

**Kabul**
- T-02: aynı slota 20 paralel tutma → tek aktif allocation kümesi; hata yanıtlarında müşteri bilgisi yok
- Aynı idempotency anahtarı aynı sonucu döndürür; farklı içerikle reddedilir
- Bu paketin geçmesi gereken şartname testleri: T-02 (§20.1).

**Kapsam dışı:** Konfirmasyon, taşıma ve süre dolumu işçisi ayrı paketlerdedir. HTTP yolu K05-11'dedir.

**Oku:** `AGENTS.md`, §9.1, §9.2, §9.3, §18.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-07](K11-medya-temeli.md#K11-07), [K11-13](K11-medya-temeli.md#K11-13), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K05-13](K05-rezervasyon-motoru.md#K05-13)

---

<a id="K05-07"></a>
## K05-07 · Kesinleştirme ve iptal komutları (confirm/cancel) + ConfirmationGate portu

**Boyut:** M · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-05](K05-rezervasyon-motoru.md#K05-05)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/booking/confirm/`, `packages/application/src/booking/cancel/`, `packages/application/src/booking/gates/`, `tests/integration/booking/confirm/`

**Teslim edilecekler**
- `confirmBooking`: açık personel komutu, izin `booking.confirm`, `version` kontrolü; `ConfirmationGate` portu (varsayılan gerçekleme: açık komut + izin; K06-09 kontrol listesini bağlar); müşteri/chatbot teklif kabulü doğrudan `confirmed` üretemez; istisna yalnız özel yetki + gerekçe + audit
- `cancelBooking`: `held/confirmed → cancelled`, blokları aynı transaction'da kaldırır; gerekçe zorunlu; durum geçmişi + audit + `booking.cancelled.v1`
- Süresi dolmuş tutma `confirm` ile kesinleştirilemez: önce kilit + karar zamanı + süre kontrolü (`HOLD_EXPIRED`)
- Outbox: `booking.confirmed.v1`; alıcı listesi taşınmaz

**Kabul**
- T-01: aynı kaynağa aynı anda iki farklı müşteri için kesinleştirme → yalnız biri başarılı; diğeri conflict; kısmi kayıt yok
- T-04: hold'un bittiği anda confirm ve başka hold yarışı → tek tutarlı sonuç; çift satış yok
- Bu paketin geçmesi gereken şartname testleri: T-01, T-04 (§20.1).

**Kapsam dışı:** Kontrol listesinin içeriği/şeması K06-09'dadır.

**Oku:** `AGENTS.md`, §9.2, §9.3, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-07](K11-medya-temeli.md#K11-07), [K11-13](K11-medya-temeli.md#K11-13), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K05-13](K05-rezervasyon-motoru.md#K05-13), [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K06-09](K06-talep-ziyaret-teklif.md#K06-09), [K13-09](K13-davetiye-takvim.md#K13-09)

---

<a id="K05-08"></a>
## K05-08 · Tarih/alan taşıma komutu (reschedule)

**Boyut:** M · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-05](K05-rezervasyon-motoru.md#K05-05)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/booking/reschedule/`, `tests/integration/booking/reschedule/`

**Teslim edilecekler**
- `rescheduleBooking`: yeni alan/zaman ile eski allocation'lar **aynı transaction'da** değiştirilir; kilit sırası: değiştirilen booking satırı → kaynaklar artan sırada; müşterinin onayladığı değişiklik sürümü (`booking_change`) esas alınır
- Yeni slot alınamazsa rollback eski rezervasyonu korur; önce bırakıp sonra almaya çalışan kod yolu yoktur
- Başarıda `booking.rescheduled.v1` outbox; başarısızlıkta bildirim/olay üretilmez
- `booking_change` durumları: `proposed → customer_accepted → applied` (+ `rejected/withdrawn/conflict`); müşteri kabul adımının API'si K08/K06 UI'larında bağlanır, burada servis

**Kabul**
- T-05: hedef dolu → eski rezervasyon eksiksiz korunur; bildirim gitmez
- T-06: çok kaynaklı son kaynak çakışır → bütün işlem rollback; ilk kaynaklar tutulmaz
- Bu paketin geçmesi gereken şartname testleri: T-05, T-06 (§20.1).

**Kapsam dışı:** Müşteriye tarih değişikliği önerisi ekranı kapsam dışı.

**Oku:** `AGENTS.md`, §9.2, §9.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-07](K11-medya-temeli.md#K11-07), [K11-13](K11-medya-temeli.md#K11-13), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K05-13](K05-rezervasyon-motoru.md#K05-13)

---

<a id="K05-09"></a>
## K05-09 · Tutma süre dolumu işi ve uzatma komutu

**Boyut:** M · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-05](K05-rezervasyon-motoru.md#K05-05)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/booking/expiry/`, `apps/worker/src/jobs/booking-expiry.ts`, `packages/application/src/booking/extend/`, `tests/integration/booking/expiry/`

**Teslim edilecekler**
- Zamanlanmış `expireHolds` işi: süresi dolmuş `held` kayıtlarını `expired` yapar, blokları kaldırır (K05-05 helper'ı ile); idempotent, tekrar çalıştırmaya güvenli; en eski dolmuş tutma yaşı ölçümü
- `extendHold`: izinli, gerekçeli, denetime yazılan işlem; sonsuz tutma yok; yalnız `held` ve süresi dolmamışken (dolmuşsa yeniden hold gerekir)
- Süre dolumu yeni outbox olayı üretir (`booking.expired` iç olay; bildirim yok)

**Kabul**
- T-03: worker kapalıyken süresi dolmuş hold: yeni yetkili komut transaction içinde temizleyip ilerler (işçi çalışmadan)
- İş iki kez çalışırsa tek etki; uzatma geçmişi denetimde görünür
- Bu paketin geçmesi gereken şartname testleri: T-03 (§20.1).

**Kapsam dışı:** Hatırlatma bildirimi (tutma bitiyor) K10'dadır.

**Oku:** `AGENTS.md`, §9.2, §9.3, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-07](K11-medya-temeli.md#K11-07), [K11-13](K11-medya-temeli.md#K11-13), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K05-13](K05-rezervasyon-motoru.md#K05-13)

---

<a id="K05-10"></a>
## K05-10 · Anonim uygunluk sorgusu ve DTO'su

**Boyut:** M · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-04](K05-rezervasyon-motoru.md#K05-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/booking/availability/`, `apps/web/app/api/public/availability/`, `tests/integration/booking/availability/`, `tests/security/public-availability/`

**Teslim edilecekler**
- `GET /api/public/availability`: DTO yalnız `space`, `slotStart`, `slotEnd`, `availability: available|unavailable|closed` (+ ileride `publicPublicationId` alanı yer tutucusu, K13 doldurur); tarih aralığı en çok 31 gün sunucuda zorlanır; varsayılan satış ufku 18 ay
- `held`, bakım, özel kullanım hepsi müşteri bilgisi vermeden `unavailable`; seans bazlı gösterim (bir seans dolu diye gün dolu görünmez)
- Aktiflik hesabı K05-02'deki `isBlockActive` ile aynı kuralı SQL'de uygular; son karar daima yazma transaction'ındadır
- Teknik önbellek yalnız anonim DTO için ve ≤15 sn; rate limit profili (K03-07) bağlanır
- Performans: sıcak durumda p95 ≤500 ms ölçümü ve test koşulları rapora

**Kabul**
- Yanıtta müşteri adı, booking kimliği, iç gerekçe, sayı farkıyla çıkarım yok (şema allowlist + testle); 31 günden geniş aralık 400
- Süresi dolmuş tutma okuma yolunda dolu görünmez

**Kapsam dışı:** Genel site arayüzü (`AvailabilityCalendar`) K07'dedir.

**Oku:** `AGENTS.md`, §9.4, §17.3, §19.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-12](K05-rezervasyon-motoru.md#K05-12), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-07](K11-medya-temeli.md#K11-07), [K11-13](K11-medya-temeli.md#K11-13), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K05-13](K05-rezervasyon-motoru.md#K05-13), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K13-08](K13-davetiye-takvim.md#K13-08), [K15-04](K15-chatbot.md#K15-04)

---

<a id="K05-11"></a>
## K05-11 · Admin booking uçları: hold, confirm, cancel, reschedule, extend

**Boyut:** M · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/api/admin/bookings/`, `tests/security/admin-bookings/`

**Teslim edilecekler**
- Route handler'lar: `POST /api/admin/bookings/hold`, `/:id/confirm`, `/:id/cancel`, `/:id/reschedule`, `/:id/extend`; her biri `requireStaff({permission, mfa:true})`, Zod doğrulama, `Idempotency-Key` zorunlu, standart hata biçimi
- Olumlu ve olumsuz yetki testleri: müşteri oturumu, MFA'sız personel, izinsiz personel, başka işletme
- Server Action kullanılırsa aynı guard (K03-06 sarmalayıcısı)

**Kabul**
- T-11/T-28 ile uyumlu: müşteri sosyal cookie'siyle uçlar reddedilir; sahte `status`/`organizationId` alanları reddedilir
- Her uç idempotency tekrarında aynı yanıtı verir

**Kapsam dışı:** Takvim okuma ucu K05-12'dedir; ekranlar K21'dedir.

**Oku:** `AGENTS.md`, §17.2, §18.1, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K11-08](K11-medya-temeli.md#K11-08), [K11-09](K11-medya-temeli.md#K11-09), [K13-05](K13-davetiye-takvim.md#K13-05), [K14-05](K14-belge-odeme.md#K14-05), [K15-04](K15-chatbot.md#K15-04), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

**Bunu bekleyenler:** [K05-13](K05-rezervasyon-motoru.md#K05-13), [K21-05](K21-yonetim-kabugu-takvim.md#K21-05)

---

<a id="K05-12"></a>
## K05-12 · Operasyon takvimi okuma ucu (personel DTO'su)

**Boyut:** M · **Dalga:** 25 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-03](K05-rezervasyon-motoru.md#K05-03), [K05-04](K05-rezervasyon-motoru.md#K05-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/booking/queries/`, `apps/web/app/api/admin/calendar/`, `tests/security/admin-calendar/`

**Teslim edilecekler**
- `GET /api/admin/calendar?from&to&space`: personel DTO'su (booking durumu, alan/seans, süre, tutma bitiş zamanı; müşteri/iletişim bilgisi yalnız ilgili izinle); aralık ve sayfa sınırları sunucuda; cursor tabanlı
- Ay/hafta/liste görünümlerinin üçü aynı uçtan beslenir; liste alternatifi için sıralı çıktı
- DTO allowlist; kamu DTO'su ile karışmaz

**Kabul**
- Müşteri oturumu ve MFA'sız personel reddedilir; izinsiz personel müşteri alanlarını görmez
- Aralık sınırı aşıldığında 400; sonuç 100 öğe üst sınırına uyar

**Kapsam dışı:** UI K21-04'tedir.

**Oku:** `AGENTS.md`, §9.4, §17.2, §18.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K06-03](K06-talep-ziyaret-teklif.md#K06-03), [K06-05](K06-talep-ziyaret-teklif.md#K06-05), [K06-06](K06-talep-ziyaret-teklif.md#K06-06), [K11-07](K11-medya-temeli.md#K11-07), [K11-13](K11-medya-temeli.md#K11-13), [K13-04](K13-davetiye-takvim.md#K13-04), [K14-03](K14-belge-odeme.md#K14-03), [K14-04](K14-belge-odeme.md#K14-04)

**Bunu bekleyenler:** [K05-14](K05-rezervasyon-motoru.md#K05-14), [K21-04](K21-yonetim-kabugu-takvim.md#K21-04)

---

<a id="K05-13"></a>
## K05-13 · Eşzamanlılık test paketi (T-01–T-07, T-38)

**Boyut:** L · **Dalga:** 27 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K05-06](K05-rezervasyon-motoru.md#K05-06), [K05-07](K05-rezervasyon-motoru.md#K05-07), [K05-08](K05-rezervasyon-motoru.md#K05-08), [K05-09](K05-rezervasyon-motoru.md#K05-09), [K05-10](K05-rezervasyon-motoru.md#K05-10), [K05-11](K05-rezervasyon-motoru.md#K05-11)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `tests/integration/booking/concurrency/`, `tests/integration/booking/time/`

**Teslim edilecekler**
- Gerçek PostgreSQL'de paralel transaction testleri: T-01, T-02, T-03, T-04, T-05, T-06, T-07 (uçtan uca: API → DB), T-38
- Deterministik yarış kurgusu (barrier/advisory hook ile kilit sırasını zorlama); rastgele uyku yok
- Mutasyon kanıtı: exclusion constraint'i veya kilit sırasını bozan geçici değişiklikte testlerin kırmızı olması raporlanır
- `pnpm test:booking-concurrency` tek komut; CI'da zorunlu iş

**Kabul**
- T-01–T-07 ve T-38 CI'da yeşil; testler SQLite/mock kullanmaz
- Çalıştırılamayan test varsa nedeni açıkça yazılı
- Bu paketin geçmesi gereken şartname testleri: T-01, T-02, T-03, T-04, T-05, T-06, T-07, T-38 (§20.1).

**Kapsam dışı:** Arayüz üzerinden koşum K21-06'dadır.

**Oku:** `AGENTS.md`, §9.3, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K21-05](K21-yonetim-kabugu-takvim.md#K21-05), [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K11-10](K11-medya-temeli.md#K11-10), [K11-11](K11-medya-temeli.md#K11-11), [K13-08](K13-davetiye-takvim.md#K13-08), [K15-06](K15-chatbot.md#K15-06), [K17-03](K17-staging-kabul.md#K17-03)

**Bunu bekleyenler:** [K05-14](K05-rezervasyon-motoru.md#K05-14), [K21-06](K21-yonetim-kabugu-takvim.md#K21-06)

---

<a id="K05-14"></a>
## K05-14 · Kabul raporu, performans ölçümü ve insan inceleme paketi

**Boyut:** S · **Dalga:** 28 · **Tür:** doküman
**Başlamadan önce `main`'de olması gerekenler:** [K05-13](K05-rezervasyon-motoru.md#K05-13), [K05-12](K05-rezervasyon-motoru.md#K05-12)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/reports/K05-kabul.md`, `docs/data-inventory.md`

**Teslim edilecekler**
- `K05-kabul.md`: tasarım kararları (kilit sırası, karar zamanı, hata eşlemesi), uygunluk API p95 ölçümü (koşullar, veri büyüklüğü), bilinen sınırlar
- İnsan inceleyici için kontrol listesi: kilit sırası, izolasyon, exclusion constraint, süre dolumu, hata eşlemesi; ilgili dosya/test bağlantıları
- Veri envanteri: rezervasyon alanları (kişisel veri içeriyorsa) güncellenir (PRIV-01)

**Kabul**
- İnsan inceleyici onayı PR'a işlenmiş (§21.3); onay yoksa K05 'incelenmedi' notuyla kapanmaz
- T-01–T-07, T-38 raporu bağlı

**Kapsam dışı:** Kod değişikliği yok.

**Oku:** `AGENTS.md`, §19.2, §20.2, §21.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K21-06](K21-yonetim-kabugu-takvim.md#K21-06), [K06-09](K06-talep-ziyaret-teklif.md#K06-09), [K11-14](K11-medya-temeli.md#K11-14), [K12-02](K12-galeri-oynatici.md#K12-02), [K13-06](K13-davetiye-takvim.md#K13-06), [K15-07](K15-chatbot.md#K15-07), [K15-09](K15-chatbot.md#K15-09)

**Bunu bekleyenler:** [K21-07](K21-yonetim-kabugu-takvim.md#K21-07), [K17-02](K17-staging-kabul.md#K17-02)

---
