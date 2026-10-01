# K09 — Özel sohbet ve canlı akış

**Kilometre taşı:** M3 — Müşteri deneyimi (K08–K10) · **Şartname:** §11, §17.3, §19.1 · [Plan dizini](README.md)

> Düğün başına müşteri sohbeti: POST ile kalıcı kayıt, SSE ile değişiklik bildirimi, kullanıcı kapsamlı realtime inbox ve sıralı sayaç, doğrudan `LISTEN` dinleyicisi.

Mesaj kaydedilmeden 'gönderildi' denmez. İstemci saati sıralama otoritesi değildir. Personel iç sohbeti müşteri konuşmasıyla birleştirilmez; yakın rolü otomatik üye değildir. Uçtan uca şifreli pazarlanmaz.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K09-01](K09-sohbet-canli-akis.md#K09-01) · Sözleşmeler ve ADR: SSE protokolü, realtime inbox, LISTEN topolojisi | M | 22 | K04-10 |  |
| [K09-02](K09-sohbet-canli-akis.md#K09-02) · Sohbet şeması: conversation, member, message, realtime_inbox, realtime_counter | L | 31 | K09-01, K08-04 | migration |
| [K09-03](K09-sohbet-canli-akis.md#K09-03) · Mesaj gönderme ve sayfalı geçmiş | L | 32 | K09-02 |  |
| [K09-04](K09-sohbet-canli-akis.md#K09-04) · Realtime inbox ve sıralı sayaç kilidi | L | 32 | K09-02 |  |
| [K09-05](K09-sohbet-canli-akis.md#K09-05) · SSE ucu: kullanıcı kapsamlı tek bağlantı, replay ve yetki iptali | L | 33 | K09-04, K03-11 |  |
| [K09-06](K09-sohbet-canli-akis.md#K09-06) · Doğrudan LISTEN/NOTIFY dinleyicisi ve bağlantı bütçesi | M | 33 | K09-04 |  |
| [K09-07](K09-sohbet-canli-akis.md#K09-07) · Müşteri sohbet arayüzü | L | 34 | K09-03, K09-05, K06-15 |  |
| [K09-08](K09-sohbet-canli-akis.md#K09-08) · Personel sohbet arayüzü (atanmış düğünler) | L | 34 | K09-03, K09-05, K21-03 |  |
| [K09-09](K09-sohbet-canli-akis.md#K09-09) · Sohbet test/ölçüm paketi: T-09 (sohbet kısmı), T-37, çok süreç izolasyonu | M | 35 | K09-06, K09-07, K09-08, K03-11 |  |

<a id="K09-01"></a>
## K09-01 · Sözleşmeler ve ADR: SSE protokolü, realtime inbox, LISTEN topolojisi

**Boyut:** M · **Dalga:** 22 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K04-10](K04-outbox-audit-isci.md#K04-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/contracts/src/realtime/`, `packages/application/src/ports/wake-source.ts`, `docs/adr/*-realtime.md`

**Teslim edilecekler**
- SSE olay biçimi (değişiklik kimliği + sıra; ham mesaj/gizli içerik yok), `Last-Event-ID` kapsamlama kuralı, 'çok eski cursor' davranışı (tam yetkili özet), `message` DTO'ları, kuyruk/sıra kuralları (§11)
- `WakeSource` portu (uyandırma sinyali arayüzü): bellek içi test gerçeklemesi + Postgres `LISTEN` gerçeklemesi (K09-06)
- ADR: web örneği başına doğrudan tek dinleyici bağlantısı (havuzsuz, PgBouncer transaction-mode arkasında değil), bağlantı bütçesine katkısı, SSE destekleyen host/proxy şartı (buffering kapalı), heartbeat/bağlantı limitleri
- Ortak sözleşme: K09 tüketici işlerinden önce küçük PR

**Kabul**
- ADR ve sözleşmeler birleşmeden diğer K09 paketleri başlamaz
- Bağlantı bütçesi hesabı K01-08 hosting kararıyla uyumlu (çelişki raporlanır)

**Kapsam dışı:** Uygulama kodu yok.

**Oku:** `AGENTS.md`, §11, §19.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-01](K05-rezervasyon-motoru.md#K05-01), [K07-02](K07-kurumsal-site-icerik.md#K07-02), [K08-01](K08-dugunum-pano-onay.md#K08-01), [K10-03](K10-bildirim-eposta-sms.md#K10-03), [K11-02](K11-medya-temeli.md#K11-02), [K16-05](K16-yonetim-butunlestirme.md#K16-05)

**Bunu bekleyenler:** [K09-02](K09-sohbet-canli-akis.md#K09-02)

---

<a id="K09-02"></a>
## K09-02 · Sohbet şeması: conversation, member, message, realtime_inbox, realtime_counter

**Boyut:** L · **Dalga:** 31 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K09-01](K09-sohbet-canli-akis.md#K09-01), [K08-04](K08-dugunum-pano-onay.md#K08-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/chat.ts`, `packages/db/migrations/*_chat_schema.sql`, `packages/db/src/rls/chat.ts`, `tests/integration/db/chat/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `conversation` (düğün başına müşteri konuşması; personel iç sohbeti ayrı), `conversation_member` (alıcı kapsamı: çift üyeleri + atanmış ekip; yakın rolü varsayılan değil), `message` (`clientMessageId + sender + conversation` benzersiz, konuşma içi sıra)
- `realtime_inbox` (kullanıcı başına artan sıra) ve `realtime_counter` (kullanıcıya ait kilitlenen sayaç satırı); indeksler: konuşma+mesaj sırası; sınırlı saklama (7 gün öneri)
- RLS: yalnız konuşma üyeleri; atama kapsamı K08-04'ten
- Veri envanteri: mesaj gövdesi saklama/erişim satırı

**Kabul**
- Üye olmayan aktör mesaj/konuşma satırı göremez (T-08 mesaj uzantısı)
- `clientMessageId` tekrarında ikinci satır eklenemez

**Kapsam dışı:** Mesaj yazma ve inbox mantığı sonraki paketlerde.

**Oku:** `AGENTS.md`, §8, §11, §17.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-15](K06-talep-ziyaret-teklif.md#K06-15), [K08-05](K08-dugunum-pano-onay.md#K08-05), [K08-06](K08-dugunum-pano-onay.md#K08-06), [K08-07](K08-dugunum-pano-onay.md#K08-07), [K08-08](K08-dugunum-pano-onay.md#K08-08), [K08-09](K08-dugunum-pano-onay.md#K08-09), [K08-14](K08-dugunum-pano-onay.md#K08-14)

**Bunu bekleyenler:** [K09-03](K09-sohbet-canli-akis.md#K09-03), [K09-04](K09-sohbet-canli-akis.md#K09-04)

---

<a id="K09-03"></a>
## K09-03 · Mesaj gönderme ve sayfalı geçmiş

**Boyut:** L · **Dalga:** 32 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K09-02](K09-sohbet-canli-akis.md#K09-02)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/chat/`, `apps/web/app/api/conversations/`, `tests/integration/chat/`

**Teslim edilecekler**
- `POST /api/conversations/:id/messages`: üyelik doğrulama, `clientMessageId` idempotency, **konuşma satırı kilitli transaction** içinde sıra atama; mesaj kaydedilmeden başarı dönmez; boyut/hız limiti; metin güvenli (kaçışlı render, zengin metin yok)
- `GET .../messages`: cursor ile geçmiş, ilk 30 mesaj, sayfa üst sınırı
- `message.created.v1` outbox; mesaj gövdesi outbox payload'ında taşınmaz (kimlik + sıra)
- İptal edilmiş üyelik/yetki kaybı sonrası yeni gönderim/okuma reddedilir

**Kabul**
- Aynı `clientMessageId` tekrarında tek kopya; paralel gönderimde sıra tutarlı
- T-34 sohbet kısmı: script/HTML mesajı kaçışlanır; Üye olmayan göndermez
- Bu paketin geçmesi gereken şartname testleri: T-34 (§20.1).

**Kapsam dışı:** SSE ve inbox K09-04/05'tedir; SMS üretimi yoktur (yönetici seçimi K10'da).

**Oku:** `AGENTS.md`, §11, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-16](K06-talep-ziyaret-teklif.md#K06-16), [K08-10](K08-dugunum-pano-onay.md#K08-10), [K08-11](K08-dugunum-pano-onay.md#K08-11), [K08-12](K08-dugunum-pano-onay.md#K08-12), [K09-04](K09-sohbet-canli-akis.md#K09-04), [K13-11](K13-davetiye-takvim.md#K13-11), [K14-06](K14-belge-odeme.md#K14-06)

**Bunu bekleyenler:** [K09-07](K09-sohbet-canli-akis.md#K09-07), [K09-08](K09-sohbet-canli-akis.md#K09-08)

---

<a id="K09-04"></a>
## K09-04 · Realtime inbox ve sıralı sayaç kilidi

**Boyut:** L · **Dalga:** 32 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K09-02](K09-sohbet-canli-akis.md#K09-02)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/realtime/inbox/`, `apps/worker/src/jobs/realtime-inbox-cleanup.ts`, `tests/integration/realtime-inbox/`

**Teslim edilecekler**
- Kullanıcıya ait sayaç satırı üzerinde **kilitle-ve-ekle**: satır yoksa `INSERT ... ON CONFLICT` ile oluşturulur; birden çok kullanıcı etkileniyorsa sayaç satırları `user_id` artan sırada kilitlenir; yalnız auto-increment kimliğinin commit sırasını garanti ettiği varsayılmaz
- Asgari değişiklik bildirimi (değişiklik kimliği + tür), yalnız kullanıcıya ait; 7 gün saklama temizliği işi
- `realtime_inbox` yazımı mesaj yazma transaction'ında (K09-03 bu API'yi çağırır — API sözleşmesi bu pakette sabitlenir)

**Kabul**
- Paralel yazarlarla daha küçük sıra sonradan commit olup cursor arkasında kaybolmaz (yarış testi)
- Çok kullanıcılı güncellemede ters sıralı iki işlem deadlock'a düşmez
- Bu paketin geçmesi gereken şartname testleri: T-37 (§20.1).

**Kapsam dışı:** SSE bağlantı katmanı K09-05'tedir.

**Oku:** `AGENTS.md`, §11, §19.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-16](K06-talep-ziyaret-teklif.md#K06-16), [K08-10](K08-dugunum-pano-onay.md#K08-10), [K08-11](K08-dugunum-pano-onay.md#K08-11), [K08-12](K08-dugunum-pano-onay.md#K08-12), [K09-03](K09-sohbet-canli-akis.md#K09-03), [K13-11](K13-davetiye-takvim.md#K13-11), [K14-06](K14-belge-odeme.md#K14-06)

**Bunu bekleyenler:** [K09-05](K09-sohbet-canli-akis.md#K09-05), [K09-06](K09-sohbet-canli-akis.md#K09-06), [K10-06](K10-bildirim-eposta-sms.md#K10-06)

---

<a id="K09-05"></a>
## K09-05 · SSE ucu: kullanıcı kapsamlı tek bağlantı, replay ve yetki iptali

**Boyut:** L · **Dalga:** 33 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K09-04](K09-sohbet-canli-akis.md#K09-04), [K03-11](K03-kimlik-uyelik.md#K03-11)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/api/realtime/`, `packages/application/src/realtime/stream/`, `tests/integration/sse/`

**Teslim edilecekler**
- `GET /api/realtime`: oturum sahibi, kullanıcı başına tek bağlantı politikası, heartbeat, bağlantı limiti, proxy buffering kapalı başlıklar; ilk bağlantıda, yeniden bağlanmada ve **akış boyunca** üyelik/oturum doğrulaması
- `Last-Event-ID` sunucuda kullanıcıya göre kapsamlanır; başka kullanıcının sırası erişim vermez; çok eski cursor → tam yetkili özet; kaçırılanlar `realtime_inbox`'tan eksiksiz tamamlanır
- Yetki iptalinde (`membershipRevoked`) kanal kapatılır; her event gönderiminde güncel kapsam doğrulanır; akışta ham içerik yok
- `WakeSource` (K09-01) ile uyandırma; testlerde bellek içi kaynak

**Kabul**
- T-37: kopma + `Last-Event-ID` yeniden bağlantı → kaçırılanlar eksiksiz ve yalnız kullanıcıya ait; eski cursor'da tam özet; iptal sonrası içerik yok
- Başka kullanıcının `Last-Event-ID`'si ile akış açılamaz
- Bu paketin geçmesi gereken şartname testleri: T-37 (§20.1).

**Kapsam dışı:** Postgres LISTEN gerçeklemesi K09-06'dadır.

**Oku:** `AGENTS.md`, §11, §17.2, §17.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K07-10](K07-kurumsal-site-icerik.md#K07-10), [K08-13](K08-dugunum-pano-onay.md#K08-13), [K09-06](K09-sohbet-canli-akis.md#K09-06), [K10-06](K10-bildirim-eposta-sms.md#K10-06), [K11-15](K11-medya-temeli.md#K11-15), [K13-10](K13-davetiye-takvim.md#K13-10), [K13-12](K13-davetiye-takvim.md#K13-12), [K14-07](K14-belge-odeme.md#K14-07), [K14-08](K14-belge-odeme.md#K14-08)

**Bunu bekleyenler:** [K09-07](K09-sohbet-canli-akis.md#K09-07), [K09-08](K09-sohbet-canli-akis.md#K09-08)

---

<a id="K09-06"></a>
## K09-06 · Doğrudan LISTEN/NOTIFY dinleyicisi ve bağlantı bütçesi

**Boyut:** M · **Dalga:** 33 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K09-04](K09-sohbet-canli-akis.md#K09-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/listen/`, `apps/web/src/instrumentation/listen.ts`, `tests/integration/listen/`

**Teslim edilecekler**
- Her web örneği havuzdan **bağımsız tek dinleyici bağlantısı** açar (`WakeSource` Postgres gerçeklemesi); NOTIFY yalnız uyandırma sinyali, kalıcı teslimat değil
- Bağlantı koparsa üstel geri deneme ile yeniden bağlanır ve kaçırdığını `realtime_inbox`'tan tamamlar; PgBouncer transaction-mode arkasında çalışmayacağı belgelenir
- Bağlantı bütçesi ölçümü: web havuzu + worker + medya işçisi + dinleyiciler + migration `max_connections` hesabına işlenir (`docs/runbook/db-connections.md`)
- Dinleyici sağlık metrikleri; yeniden bağlanma sayacı

**Kabul**
- Dinleyici bağlantısı zorla kesilince istemci bir sonraki uyandırmada eksiksiz güncellenir (test)
- Bütçe tablosu mevcut yapılandırma değerleriyle çelişmez

**Kapsam dışı:** SSE ucu K09-05'tedir.

**Oku:** `AGENTS.md`, §11, §19.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K07-10](K07-kurumsal-site-icerik.md#K07-10), [K08-13](K08-dugunum-pano-onay.md#K08-13), [K09-05](K09-sohbet-canli-akis.md#K09-05), [K10-06](K10-bildirim-eposta-sms.md#K10-06), [K11-15](K11-medya-temeli.md#K11-15), [K13-10](K13-davetiye-takvim.md#K13-10), [K13-12](K13-davetiye-takvim.md#K13-12), [K14-07](K14-belge-odeme.md#K14-07), [K14-08](K14-belge-odeme.md#K14-08)

**Bunu bekleyenler:** [K09-09](K09-sohbet-canli-akis.md#K09-09)

---

<a id="K09-07"></a>
## K09-07 · Müşteri sohbet arayüzü

**Boyut:** L · **Dalga:** 34 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K09-03](K09-sohbet-canli-akis.md#K09-03), [K09-05](K09-sohbet-canli-akis.md#K09-05), [K06-15](K06-talep-ziyaret-teklif.md#K06-15)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/(customer)/dugunum/sohbet/`, `apps/web/src/customer/chat/`, `apps/web/src/customer/nav/sohbet.ts`, `tests/e2e/customer-chat/`

**Teslim edilecekler**
- `ConversationView`, `MessageList`, `MessageComposer`, `ConnectionStatus`: tek kullanıcı SSE bağlantısı, 'yeniden bağlanıyor' durumu, **görünür sekmede düşük sıklıklı** yedek sorgu (agresif polling yok), sayfalı geçmiş (en son 30)
- Gönderilemedi/yeniden dene durumu; mesaj kaydedilmeden 'gönderildi' işareti yok; küçük istemci adası (`use client`)
- Mobil, klavye, azaltılmış hareket; yükleniyor/boş/hata/yetkisiz

**Kabul**
- Playwright: iki müşteri üyesi arasında mesajlaşma; bağlantı kopması ve yeniden bağlanma; çift tıklama tek mesaj
- Üyeliği iptal edilen kullanıcının açık sohbeti kapanır

**Kapsam dışı:** Personel arayüzü K09-08'dedir.

**Oku:** `AGENTS.md`, §11, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K08-15](K08-dugunum-pano-onay.md#K08-15), [K09-08](K09-sohbet-canli-akis.md#K09-08), [K10-07](K10-bildirim-eposta-sms.md#K10-07), [K10-14](K10-bildirim-eposta-sms.md#K10-14), [K11-16](K11-medya-temeli.md#K11-16), [K13-14](K13-davetiye-takvim.md#K13-14), [K14-09](K14-belge-odeme.md#K14-09)

**Bunu bekleyenler:** [K09-09](K09-sohbet-canli-akis.md#K09-09), [K16-09](K16-yonetim-butunlestirme.md#K16-09)

---

<a id="K09-08"></a>
## K09-08 · Personel sohbet arayüzü (atanmış düğünler)

**Boyut:** L · **Dalga:** 34 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K09-03](K09-sohbet-canli-akis.md#K09-03), [K09-05](K09-sohbet-canli-akis.md#K09-05), [K21-03](K21-yonetim-kabugu-takvim.md#K21-03)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/chat/`, `apps/web/app/(admin)/mesajlar/`, `apps/web/src/admin/nav/mesajlar.ts`, `tests/e2e/admin-chat/`

**Teslim edilecekler**
- Atanmış düğünlerin konuşma listesi, okunmamış sayacı, mesajlaşma; personel iç notu/sohbeti ayrı yüzey (müşteri konuşmasıyla birleşmez)
- 'Ayrıca SMS gönder' kutusu yok (K10-15'te bağlanır); izin yoksa kontrol hiç gösterilmez

**Kabul**
- Playwright: atanmamış personel konuşmayı göremez; atama kalkınca erişim kapanır
- İç not alanı müşteriye gönderilemez

**Kapsam dışı:** Bildirim seçenekleri K10'dadır.

**Oku:** `AGENTS.md`, §11, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K08-15](K08-dugunum-pano-onay.md#K08-15), [K09-07](K09-sohbet-canli-akis.md#K09-07), [K10-07](K10-bildirim-eposta-sms.md#K10-07), [K10-14](K10-bildirim-eposta-sms.md#K10-14), [K11-16](K11-medya-temeli.md#K11-16), [K13-14](K13-davetiye-takvim.md#K13-14), [K14-09](K14-belge-odeme.md#K14-09)

**Bunu bekleyenler:** [K09-09](K09-sohbet-canli-akis.md#K09-09), [K10-15](K10-bildirim-eposta-sms.md#K10-15), [K16-08](K16-yonetim-butunlestirme.md#K16-08)

---

<a id="K09-09"></a>
## K09-09 · Sohbet test/ölçüm paketi: T-09 (sohbet kısmı), T-37, çok süreç izolasyonu

**Boyut:** M · **Dalga:** 35 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K09-06](K09-sohbet-canli-akis.md#K09-06), [K09-07](K09-sohbet-canli-akis.md#K09-07), [K09-08](K09-sohbet-canli-akis.md#K09-08), [K03-11](K03-kimlik-uyelik.md#K03-11)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/integration/chat-acceptance/`, `tests/load/chat-latency/`, `docs/reports/K09-kabul.md`

**Teslim edilecekler**
- T-09 sohbet kısmı: üyelik/oturum iptali sonrası açık SSE kapanır, yeni geçmiş/etkinlik erişimi reddedilir; müşteri oturum önbelleği gecikmesi K03 ADR sınırı içinde ölçülür
- T-37 uçtan uca; kopya/yeniden bağlantı; **iki web sürecinde** (iki örnek) izolasyon ve uyandırma
- Gecikme ölçümü: mesaj kaydı p95 ≤500 ms, alıcı görünürlüğü p95 ≤2 sn (test koşulları ve cihaz/ağ profili raporda; 20 aktif sohbet bağlantısı)

**Kabul**
- T-09 sohbet kısmı ve T-37 CI'da yeşil; hedef gecikmeler ölçülmüş rakamlarla raporlanır (uydurma rakam yok)
- Çalıştırılamayan ölçüm varsa nedeni yazılı
- Bu paketin geçmesi gereken şartname testleri: T-09, T-37 (§20.1).

**Kapsam dışı:** Video/medya oturum iptali (T-09'un diğer yarısı) K11'dedir.

**Oku:** `AGENTS.md`, §11, §19.2, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K10-08](K10-bildirim-eposta-sms.md#K10-08), [K10-09](K10-bildirim-eposta-sms.md#K10-09), [K10-12](K10-bildirim-eposta-sms.md#K10-12), [K10-13](K10-bildirim-eposta-sms.md#K10-13), [K15-11](K15-chatbot.md#K15-11), [K16-09](K16-yonetim-butunlestirme.md#K16-09)

**Bunu bekleyenler:** [K10-18](K10-bildirim-eposta-sms.md#K10-18), [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K17-04](K17-staging-kabul.md#K17-04)

---
