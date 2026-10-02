# K15 — Sınırlı chatbot

**Kilometre taşı:** M4 — Medya ve yayın (K11–K15) · **Şartname:** §9.4, §15, §17.3 · [Plan dizini](README.md)

> Salon bilgisi ve başvuru yardımcısı: onaylı bilgi kaynağı, sunucu tarafı provider adaptörü, yalnız salt okunur public tool'lar, oturum/maliyet limitleri, insan iletişimine geçiş.

Bot **rezervasyonu kesinleştiremez, tarih tutamaz, SMS gönderemez, yayını açamaz, ödeme değiştiremez, özel mesaj/belge okuyamaz** — bu yetenekler tool kaydında bulunmaz (prompt'a bırakılmaz). Kullanıcı/ek içerik talimatı sistem yetkisi değildir. LLM kapalıyken SSS ve insan iletişimi çalışır. Sohbet geçmişi onaysız eğitim verisi yapılmaz. API anahtarı tarayıcıya gitmez.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K15-01](K15-chatbot.md#K15-01) · Karar: LLM sağlayıcısı, bütçe tavanı ve chatbot'un açılması | S | 0 | — | ürün sahibi girdisi, karar |
| [K15-02](K15-chatbot.md#K15-02) · Sözleşmeler: AssistantProvider genişletme, tool şemaları, /api/assistant/message DTO'ları | M | 23 | K04-10, K01-05, K05-01 |  |
| [K15-03](K15-chatbot.md#K15-03) · Onaylı bilgi kaynağı ve kontrollü retrieval (vector DB yok) | L | 24 | K15-02, K07-02 | migration |
| [K15-04](K15-chatbot.md#K15-04) · Tool yürütücü ve güvenlik katmanı: allowlist, parametre doğrulama, injection direnci | L | 26 | K15-02, K15-03, K05-10 |  |
| [K15-05](K15-chatbot.md#K15-05) · Gerçek sağlayıcı adaptörü: sunucu tarafı çağrı, zaman aşımı, log maskeleme | M | 24 | K15-01, K15-02 |  |
| [K15-06](K15-chatbot.md#K15-06) · Oturum limitleri ve maliyet bütçesi: asistan kullanım kaydı, tavan, kapatma anahtarı | M | 27 | K15-04, K03-07 | migration |
| [K15-07](K15-chatbot.md#K15-07) · POST /api/assistant/message: orkestrasyon, SSS yedeği ve insan iletişimine geçiş | L | 28 | K15-04, K15-05, K15-06 |  |
| [K15-08](K15-chatbot.md#K15-08) · Ön yüz: AssistantWidget (etkileşimde yüklenen küçük istemci adası) | M | 29 | K15-07, K07-06 |  |
| [K15-09](K15-chatbot.md#K15-09) · Yönetim ekranı: AssistantSettings (aç/kapat, limitler, maliyet görünümü) | M | 28 | K15-06, K21-03 |  |
| [K15-10](K15-chatbot.md#K15-10) · K15 güvenlik/kabul paketi ve rapor (T-27) | M | 30 | K15-08, K15-09 | doküman |
| [K15-11](K15-chatbot.md#K15-11) · M4 kabulü: ürün sahibi galeri, davetiye, belge/ödeme ve chatbot'u dener | S | 35 | K12-06, K13-14, K14-09, K15-10, K11-16 | ürün sahibi girdisi, kabul |

<a id="K15-01"></a>
## K15-01 · Karar: LLM sağlayıcısı, bütçe tavanı ve chatbot'un açılması

**Boyut:** S · **Dalga:** 0 · **Tür:** karar
**Başlamadan önce `main`'de olması gerekenler:** yok
**Ürün sahibinden gereken:** LLM sağlayıcısı, günlük/aylık maliyet tavanı ve chatbot'un açılma kararı.


**Dokunabileceğin yollar (yalnız bunlar):** `docs/adr/`, `docs/reports/` (yalnız bu kararın kaydı).

**Teslim edilecekler**
- Sağlayıcı karşılaştırması: işleme bölgesi, saklama/eğitim şartları, Türkçe kalitesi, maliyet, araç çağırma desteği, zaman aşımı; aylık/günlük maliyet tavanı ve %80 uyarı; oturum başına limit onayı (öneri 10 mesaj/10 dk)
- Karar `docs/adr/*-llm-saglayici.md`; test API anahtarı korumalı environment'a girilir (ürün sahibi); yurt dışı aktarım envantere işlenir (§17.6), hukuki adımlar işletmeye aittir

**Kabul**
- Ürün sahibi sağlayıcıyı, tavanı ve chatbot'un ilk sürümde açılıp açılmayacağını yazılı belirlemiştir (kapalı kalırsa K15 yalnız SSS yoluyla tamamlanır)
- Üretim anahtarı veya gerçek müşteri verisi yok

**Oku:** `AGENTS.md`, §15, §17.6, §19.6, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-01](K00-depo-kurallari.md#K00-01), [K00-06](K00-depo-kurallari.md#K00-06), [K00-07](K00-depo-kurallari.md#K00-07), [K10-01](K10-bildirim-eposta-sms.md#K10-01), [K13-01](K13-davetiye-takvim.md#K13-01), [K14-01](K14-belge-odeme.md#K14-01), [K17-01](K17-staging-kabul.md#K17-01)

**Bunu bekleyenler:** [K15-05](K15-chatbot.md#K15-05), [K17-08](K17-staging-kabul.md#K17-08)

---

<a id="K15-02"></a>
## K15-02 · Sözleşmeler: AssistantProvider genişletme, tool şemaları, /api/assistant/message DTO'ları

**Boyut:** M · **Dalga:** 23 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K04-10](K04-outbox-audit-isci.md#K04-10), [K01-05](K01-iskelet.md#K01-05), [K05-01](K05-rezervasyon-motoru.md#K05-01)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/contracts/src/assistant/`, `packages/application/src/ports/assistant-provider.ts`, `packages/integrations/src/fakes/assistant.ts`

**Teslim edilecekler**
- `AssistantProvider` portu (K01-05'in fake portunu genişletir): tool çağırma, zaman aşımı, token/maliyet sayacı, capability bildirimi; fake sağlayıcı deterministik senaryolar (tool çağırma, injection girişimi, zaman aşımı) üretir
- İzinli tool şemaları: **yalnız** `search_public_faq` ve salt okunur `check_public_availability` (§9.4 DTO'su); istek/yanıt DTO'ları, anonim oturum kimliği, 'insana geç' eylemi ve form ön doldurma önerisi DTO'su (kayıt oluşturmaz)
- Ortak sözleşme: K15 tüketici işlerinden önce küçük PR

**Kabul**
- Tool kaydı statik ve yalnız iki araç içerir (kayıt/SMS/yayın/ödeme aracı tipte yok); şema testleri
- Fake sağlayıcı ile örnek senaryolar deterministik
- Bu paketin geçmesi gereken şartname testleri: T-27 (§20.1).

**Kapsam dışı:** Gerçek sağlayıcı K15-05'tedir.

**Oku:** `AGENTS.md`, §15, §9.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-02](K05-rezervasyon-motoru.md#K05-02), [K05-03](K05-rezervasyon-motoru.md#K05-03), [K06-01](K06-talep-ziyaret-teklif.md#K06-01), [K07-03](K07-kurumsal-site-icerik.md#K07-03), [K07-04](K07-kurumsal-site-icerik.md#K07-04), [K10-04](K10-bildirim-eposta-sms.md#K10-04), [K10-05](K10-bildirim-eposta-sms.md#K10-05), [K11-03](K11-medya-temeli.md#K11-03), [K11-04](K11-medya-temeli.md#K11-04), [K13-02](K13-davetiye-takvim.md#K13-02)

**Bunu bekleyenler:** [K15-03](K15-chatbot.md#K15-03), [K15-04](K15-chatbot.md#K15-04), [K15-05](K15-chatbot.md#K15-05)

---

<a id="K15-03"></a>
## K15-03 · Onaylı bilgi kaynağı ve kontrollü retrieval (vector DB yok)

**Boyut:** L · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K15-02](K15-chatbot.md#K15-02), [K07-02](K07-kurumsal-site-icerik.md#K07-02)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/assistant/knowledge/`, `packages/db/migrations/*_assistant_knowledge_index.sql`, `packages/db/src/schema/assistant-knowledge.ts`, `tests/integration/assistant/knowledge/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- Bilgi kümesi yalnız **yayımlanmış** SSS (`faq_entry` onaylı), hizmet açıklamaları, iletişim ve onaylı politika metinleri; taslak, iç not, özel belge, müşteri verisi **dahil edilmez** (kaynak allowlist)
- Küçük küme için Postgres tam metin araması (Türkçe yapılandırma) + kontrollü sorgu; ayrı vector DB kurulmaz; kaynak içeriği yayınlandığında/geri çekildiğinde indeks güncellenir
- Her yanıt parçası kaynağına işaret eder (atıf); eşik altı → 'bilmiyorum' ve iletişim yönlendirmesi

**Kabul**
- Taslak/yayımlanmamış SSS ve iç not sorguda **hiç** dönmez; geri çekilen içerik kısa sürede kaynaktan düşer
- Türkçe karakter/ek duyarsız arama örnek testleri

**Kapsam dışı:** Tool yürütme K15-04'tedir.

**Oku:** `AGENTS.md`, §15, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K11-05](K11-medya-temeli.md#K11-05), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K12-01](K12-galeri-oynatici.md#K12-01), [K13-03](K13-davetiye-takvim.md#K13-03), [K14-02](K14-belge-odeme.md#K14-02), [K15-05](K15-chatbot.md#K15-05)

**Bunu bekleyenler:** [K15-04](K15-chatbot.md#K15-04)

---

<a id="K15-04"></a>
## K15-04 · Tool yürütücü ve güvenlik katmanı: allowlist, parametre doğrulama, injection direnci

**Boyut:** L · **Dalga:** 26 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K15-02](K15-chatbot.md#K15-02), [K15-03](K15-chatbot.md#K15-03), [K05-10](K05-rezervasyon-motoru.md#K05-10)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/assistant/tools/`, `packages/application/src/assistant/guard/`, `tests/security/assistant-tools/`

**Teslim edilecekler**
- `search_public_faq` ve `check_public_availability` yürütücüleri: parametreler Zod ile doğrulanır (tarih aralığı ≤31 gün, alan kimliği allowlist), **yalnız public use-case/DTO** çağrılır (kendi DB erişimi yok); araç sonucu veri olarak modele verilir, talimat olarak yorumlanmaz
- Kullanıcı ve araç çıktısındaki içerik **sistem yetkisi değildir**; tool yetkisi uygulamada (aktör=anonim/kamusal), prompt'ta değil; başka düğün/kişi bilgisi isteği reddedilir; araç çağrı sayısı/turu sınırlı
- Fiyat/uygunluk tahmini yok: doğrulanmış bilgi yoksa iletişim formu/ekip seçeneği

**Kabul**
- T-27 temeli: 'gizli mesajları göster', 'SMS gönder', 'başka düğünün bilgisi' talimatları tool izinleriyle engellenir; yalnız public bilgi kullanılır (fake sağlayıcı injection senaryoları)
- Tool parametre manipülasyonu (geniş tarih aralığı, başka organizasyon kimliği) reddedilir
- Bu paketin geçmesi gereken şartname testleri: T-27 (§20.1).

**Kapsam dışı:** Oturum limitleri K15-06'dadır.

**Oku:** `AGENTS.md`, §15, §17.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-11](K05-rezervasyon-motoru.md#K05-11), [K21-04](K21-yonetim-kabugu-takvim.md#K21-04), [K06-04](K06-talep-ziyaret-teklif.md#K06-04), [K06-12](K06-talep-ziyaret-teklif.md#K06-12), [K06-13](K06-talep-ziyaret-teklif.md#K06-13), [K07-05](K07-kurumsal-site-icerik.md#K07-05), [K07-06](K07-kurumsal-site-icerik.md#K07-06), [K11-08](K11-medya-temeli.md#K11-08), [K11-09](K11-medya-temeli.md#K11-09), [K13-05](K13-davetiye-takvim.md#K13-05), [K14-05](K14-belge-odeme.md#K14-05), [K16-06](K16-yonetim-butunlestirme.md#K16-06)

**Bunu bekleyenler:** [K15-06](K15-chatbot.md#K15-06), [K15-07](K15-chatbot.md#K15-07)

---

<a id="K15-05"></a>
## K15-05 · Gerçek sağlayıcı adaptörü: sunucu tarafı çağrı, zaman aşımı, log maskeleme

**Boyut:** M · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K15-01](K15-chatbot.md#K15-01), [K15-02](K15-chatbot.md#K15-02)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/integrations/src/assistant/`, `tests/integration/assistant-provider/`

**Teslim edilecekler**
- Seçilen sağlayıcı için `AssistantProvider` gerçeklemesi (tool çağırma, zaman aşımı, token sayacı, hata eşlemesi); SDK iş koduna sızmaz; API anahtarı yalnız sunucuda
- Veri minimizasyonu: sağlayıcıya gereksiz kişisel bilgi gönderilmez; log/telemetri **maskeleme** (istek içeriği loglarda kısaltılır/maskelenir); sohbet geçmişi eğitim amacıyla işaretlenmez/kapatılır (sağlayıcı ayarı)
- Üretim bayrağı olmadan yalnız fake etkin

**Kabul**
- Test anahtarıyla örnek soru/tool çağrısı doğrulandı (sandbox/test); anahtar yoksa nedeni rapora yazılı ve fake'le ilerlenir
- Tarayıcı paketinde anahtar/SDK yok (bundle denetimi)

**Kapsam dışı:** Maliyet limitleri K15-06'dadır.

**Oku:** `AGENTS.md`, §15, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K11-05](K11-medya-temeli.md#K11-05), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K12-01](K12-galeri-oynatici.md#K12-01), [K13-03](K13-davetiye-takvim.md#K13-03), [K14-02](K14-belge-odeme.md#K14-02), [K15-03](K15-chatbot.md#K15-03)

**Bunu bekleyenler:** [K15-07](K15-chatbot.md#K15-07)

---

<a id="K15-06"></a>
## K15-06 · Oturum limitleri ve maliyet bütçesi: asistan kullanım kaydı, tavan, kapatma anahtarı

**Boyut:** M · **Dalga:** 27 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K15-04](K15-chatbot.md#K15-04), [K03-07](K03-kimlik-uyelik.md#K03-07)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/assistant/limits/`, `packages/db/src/schema/assistant-usage.ts`, `packages/db/migrations/*_assistant_usage.sql`, `tests/integration/assistant/limits/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- Oturum başına en çok 10 mesaj/10 dakika (yapılandırılabilir), mesaj/token boyutu üst sınırı, zaman aşımı; işletme günlük/aylık **maliyet tavanı** (`assistant_usage` kaydı) ve %80 uyarı olayı; tavan aşımında yeni LLM çağrısı durur, SSS/iletişim çalışır
- Global kapatma anahtarı (ayar/ortam bayrağı): chatbot kapalıyken SSS ve insan iletişimi yolu çalışır; IP/oturum hız limiti (K03-07 profili)
- Bütçe/limit ölçümleri K04-07 metriklerine

**Kabul**
- Limit aşımı → anlaşılır ret ve SSS yönlendirmesi; tavan aşımında LLM çağrılmaz; kapatma anahtarı çalışır
- Rezervasyon/mesajlaşma/takvim etkilenmez (bağımsızlık testi)

**Kapsam dışı:** Endpoint orkestrasyonu K15-07'dedir.

**Oku:** `AGENTS.md`, §15, §19.3, §19.6 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-13](K05-rezervasyon-motoru.md#K05-13), [K21-05](K21-yonetim-kabugu-takvim.md#K21-05), [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K11-10](K11-medya-temeli.md#K11-10), [K11-11](K11-medya-temeli.md#K11-11), [K13-08](K13-davetiye-takvim.md#K13-08), [K17-03](K17-staging-kabul.md#K17-03)

**Bunu bekleyenler:** [K15-07](K15-chatbot.md#K15-07), [K15-09](K15-chatbot.md#K15-09), [K16-07](K16-yonetim-butunlestirme.md#K16-07)

---

<a id="K15-07"></a>
## K15-07 · POST /api/assistant/message: orkestrasyon, SSS yedeği ve insan iletişimine geçiş

**Boyut:** L · **Dalga:** 28 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K15-04](K15-chatbot.md#K15-04), [K15-05](K15-chatbot.md#K15-05), [K15-06](K15-chatbot.md#K15-06)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/app/api/assistant/`, `packages/application/src/assistant/orchestrator/`, `tests/integration/assistant/orchestrator/`

**Teslim edilecekler**
- Anonim/kayıtlı kullanıcı için tek uç: limit → bilgi/tool döngüsü → yanıt; **sağlayıcı kapalı/hatalı/zaman aşımı** → SSS aramasıyla yedek yanıt + iletişim seçeneği (site/takvim/mesajlaşma etkilenmez)
- Başvuru bilgilerini yalnız **kullanıcıya gösterilen forma hazırlama önerisi** olarak döner; kullanıcı açıkça formu göndermeden hiçbir kayıt oluşmaz; rezervasyon kesinleştirme/tarih tutma/SMS/yayın/ödeme yolu yok
- Yanıt DTO'su atıf ve 'insana geç' bağlantısı içerir; hata yanıtları ham sağlayıcı verisi sızdırmaz

**Kabul**
- Playwright/entegrasyon: sağlayıcı kapalıyken SSS çalışır; bilinmeyen soruda iletişim formu/ekip yönlendirmesi; bot kayıt oluşturmaz (DB sayımı)
- Hız/maliyet limitleri uçtan uca uygulanır

**Kapsam dışı:** Arayüz K15-08'dedir.

**Oku:** `AGENTS.md`, §15, §18.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-14](K05-rezervasyon-motoru.md#K05-14), [K21-06](K21-yonetim-kabugu-takvim.md#K21-06), [K06-09](K06-talep-ziyaret-teklif.md#K06-09), [K11-14](K11-medya-temeli.md#K11-14), [K12-02](K12-galeri-oynatici.md#K12-02), [K13-06](K13-davetiye-takvim.md#K13-06), [K15-09](K15-chatbot.md#K15-09)

**Bunu bekleyenler:** [K15-08](K15-chatbot.md#K15-08)

---

<a id="K15-08"></a>
## K15-08 · Ön yüz: AssistantWidget (etkileşimde yüklenen küçük istemci adası)

**Boyut:** M · **Dalga:** 29 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K15-07](K15-chatbot.md#K15-07), [K07-06](K07-kurumsal-site-icerik.md#K07-06)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/site/assistant/`, `apps/web/app/(site)/asistan/`, `tests/e2e/site-assistant/`

**Teslim edilecekler**
- Kapalı başlayan, **yalnız kullanıcı etkileşiminde yüklenen** dinamik import widget'ı (ilk yük JS bütçesine girmez); mesaj listesi, atıf bağlantıları, 'insanla iletişim' ve form ön doldurma düğmesi; yükleniyor/hata/limit/kapalı durumları; klavye/mobil/ekran okuyucu
- 'Yapay zekâ yardımcısı; rezervasyon/ödeme/özel kayıt işlemez' bilgilendirmesi; sohbet geçmişi için aydınlatma notu

**Kabul**
- Playwright: klavye ve mobil kullanım; sağlayıcı kapalıyken SSS yedeği; ilk yük bundle'ında widget kodu yok (K07-01 bütçe denetimi geçer)
- Form ön doldurma kullanıcı onayı olmadan gönderim yapmaz
- Bu paketin geçmesi gereken şartname testleri: T-30 (§20.1).

**Kapsam dışı:** Admin ayar ekranı K15-10'dadır.

**Oku:** `AGENTS.md`, §15, §16, §5.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K21-07](K21-yonetim-kabugu-takvim.md#K21-07), [K06-10](K06-talep-ziyaret-teklif.md#K06-10), [K12-03](K12-galeri-oynatici.md#K12-03), [K12-04](K12-galeri-oynatici.md#K12-04), [K12-05](K12-galeri-oynatici.md#K12-05), [K13-07](K13-davetiye-takvim.md#K13-07)

**Bunu bekleyenler:** [K15-10](K15-chatbot.md#K15-10)

---

<a id="K15-09"></a>
## K15-09 · Yönetim ekranı: AssistantSettings (aç/kapat, limitler, maliyet görünümü)

**Boyut:** M · **Dalga:** 28 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K15-06](K15-chatbot.md#K15-06), [K21-03](K21-yonetim-kabugu-takvim.md#K21-03)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/assistant/`, `apps/web/app/(admin)/asistan/`, `apps/web/src/admin/nav/asistan.ts`, `tests/e2e/admin-assistant/`

**Teslim edilecekler**
- Chatbot aç/kapat anahtarı, oturum limiti ve maliyet tavanı ayarları, günlük/aylık kullanım ve %80 uyarı görünümü, SSS yönetimine (K07-03) bağlantı; ayar değişimi audit'te; izin `assistant.manage`

**Kabul**
- Playwright: kapat → site widget'ı SSS moduna geçer; limit değişimi uygulanır; izinsiz personelde ekran yok

**Kapsam dışı:** Maliyet rakamı uydurulmaz; gerçek kullanım verisini gösterir.

**Oku:** `AGENTS.md`, §15, §16, §19.6 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-14](K05-rezervasyon-motoru.md#K05-14), [K21-06](K21-yonetim-kabugu-takvim.md#K21-06), [K06-09](K06-talep-ziyaret-teklif.md#K06-09), [K11-14](K11-medya-temeli.md#K11-14), [K12-02](K12-galeri-oynatici.md#K12-02), [K13-06](K13-davetiye-takvim.md#K13-06), [K15-07](K15-chatbot.md#K15-07)

**Bunu bekleyenler:** [K15-10](K15-chatbot.md#K15-10), [K16-08](K16-yonetim-butunlestirme.md#K16-08)

---

<a id="K15-10"></a>
## K15-10 · K15 güvenlik/kabul paketi ve rapor (T-27)

**Boyut:** M · **Dalga:** 30 · **Tür:** doküman
**Başlamadan önce `main`'de olması gerekenler:** [K15-08](K15-chatbot.md#K15-08), [K15-09](K15-chatbot.md#K15-09)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/security/assistant-acceptance/`, `docs/reports/K15-kabul.md`

**Teslim edilecekler**
- Tek komut `pnpm test:assistant`: **T-27** (gizli mesaj isteme, SMS gönderme talimatı, başka düğün bilgisi, ek/kullanıcı içeriğinden gelen talimat, tool parametre manipülasyonu), bot özel kayıt okuyamaz/rezervasyon kesinleştiremez, sağlayıcı kapalıyken SSS çalışır, maliyet/oturum limitleri, loglarda kişisel veri maskeleme
- `K15-kabul.md`: tool allowlist özeti, veri minimizasyonu ve sağlayıcı şartları notu (hukuki yorum yok)

**Kabul**
- T-27 ve limit/maskeleme testleri CI'da yeşil; çalıştırılamayan varsa nedeni yazılı
- Bu paketin geçmesi gereken şartname testleri: T-27 (§20.1).

**Kapsam dışı:** Kod değişikliği yalnız test/rapor.

**Oku:** `AGENTS.md`, §15, §17.3, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-11](K06-talep-ziyaret-teklif.md#K06-11), [K06-14](K06-talep-ziyaret-teklif.md#K06-14), [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-03](K08-dugunum-pano-onay.md#K08-03), [K08-04](K08-dugunum-pano-onay.md#K08-04), [K12-06](K12-galeri-oynatici.md#K12-06), [K13-09](K13-davetiye-takvim.md#K13-09), [K13-13](K13-davetiye-takvim.md#K13-13)

**Bunu bekleyenler:** [K15-11](K15-chatbot.md#K15-11), [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K17-02](K17-staging-kabul.md#K17-02)

---

<a id="K15-11"></a>
## K15-11 · M4 kabulü: ürün sahibi galeri, davetiye, belge/ödeme ve chatbot'u dener

**Boyut:** S · **Dalga:** 35 · **Tür:** kabul
**Başlamadan önce `main`'de olması gerekenler:** [K12-06](K12-galeri-oynatici.md#K12-06), [K13-14](K13-davetiye-takvim.md#K13-14), [K14-09](K14-belge-odeme.md#K14-09), [K15-10](K15-chatbot.md#K15-10), [K11-16](K11-medya-temeli.md#K11-16)
**Ürün sahibinden gereken:** Staging'de deneme ve geri bildirim.


**Teslim edilecekler**
- Staging'de ürün sahibi için senaryo: yükleme → galeri/oynatıcı → davetiye onayı ve takvim nüansı → belge/ödeme takibi → chatbot; geri bildirim `docs/reports/M4-geri-bildirim.md`
- Geri bildirim sonraki kartların (K16–K18) kapsamına yansıtılır; sahte müşteri verisi kullanılır

**Kabul**
- Ürün sahibinin 'M4 yeterli' onayı veya düzeltme listesi yazılı
- Gerçek müşteri verisi/dosyası kullanılmadı

**Oku:** `AGENTS.md`, §22.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K09-09](K09-sohbet-canli-akis.md#K09-09), [K10-08](K10-bildirim-eposta-sms.md#K10-08), [K10-09](K10-bildirim-eposta-sms.md#K10-09), [K10-12](K10-bildirim-eposta-sms.md#K10-12), [K10-13](K10-bildirim-eposta-sms.md#K10-13), [K16-09](K16-yonetim-butunlestirme.md#K16-09)

---
