# K17 — Staging, güvenlik ve performans kabulü

**Kilometre taşı:** M5 — Bütünleştirme, kabul ve yayın (K16–K18) · **Şartname:** §17, §19, §20, §21.3 · [Plan dizini](README.md)

> İlk sürümün tam kabulü: T-01–T-40 raporu, restore tatbikatı, yük ve performans ölçümü, secret/header/cache/rate-limit denetimleri, runbook, lisans envanteri, maliyet raporu, KVKK kontrol listesi, bakım sahipliği teyidi ve bağımsız harici güvenlik incelemesi.

Üretim hesabı veya gerçek müşteri verisi kullanılmaz; gerçek provider **sandbox** ve doğrulanmış test alıcıları kullanılır. Çözümlenmemiş kritik güvenlik sızıntısı varsa yayın durur (§20.3). Rakamlar ölçülmeden yazılmaz; ölçülemeyen madde nedeniyle açık bırakılır. Harici inceleme ürün sahibinin seçtiği bağımsız kişi/firma tarafından yapılır (§21.3).

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K17-01](K17-staging-kabul.md#K17-01) · Karar: bağımsız harici güvenlik inceleyicisi ve kapsam | S | 0 | — | ürün sahibi girdisi, karar |
| [K17-02](K17-staging-kabul.md#K17-02) · T-01–T-40 test matrisi: tam çalıştırma ve rapor | L | 40 | K16-11, K16-10, K03-12, K05-14, K04-10, K06-16, K07-10, K15-10 |  |
| [K17-03](K17-staging-kabul.md#K17-03) · Geri yükleme tatbikatı: DB restore, RPO/RTO ölçümü, T-29 ve T-40 kanıtı | L | 27 | K16-06, K01-09, K04-08 | insan inceleme |
| [K17-04](K17-staging-kabul.md#K17-04) · Yük ve performans ölçümü: 100 oturum + 20 sohbet bağlantısı, bütçeler | L | 40 | K16-11, K09-09, K12-06, K07-09 |  |
| [K17-05](K17-staging-kabul.md#K17-05) · Güvenlik yapılandırma denetimi: secret, başlık, cache, rate limit, bağımlılık ve imaj | L | 39 | K16-10, K13-10, K03-12, K01-09 |  |
| [K17-06](K17-staging-kabul.md#K17-06) · Gerçek sağlayıcı sandbox kabulü: SMS, e-posta, OAuth, depolama (test alıcılarıyla) | M | 40 | K16-11, K10-16, K03-13, K11-05 | ürün sahibi girdisi, kabul |
| [K17-07](K17-staging-kabul.md#K17-07) · Operasyon runbook'u, lisans envanteri ve bağımlılık planı | M | 40 | K16-11, K17-03, K11-11 | doküman |
| [K17-08](K17-staging-kabul.md#K17-08) · Maliyet raporu ve KVKK kontrol listesi | M | 41 | K17-04, K17-07, K15-01, K10-02, K11-01, K16-06 | ürün sahibi girdisi, doküman |
| [K17-09](K17-staging-kabul.md#K17-09) · Bağımsız harici güvenlik incelemesi ve bulgu kapatma | L | 41 | K17-01, K17-02, K17-05, K17-03, K16-10, K11-16, K13-14 | insan inceleme, ürün sahibi girdisi, kabul |
| [K17-10](K17-staging-kabul.md#K17-10) · Bakım sahipliği teyidi ve K17 kapanış raporu (yayın kapısı değerlendirmesi) | S | 42 | K17-02, K17-03, K17-04, K17-05, K17-06, K17-07, K17-08, K17-09 | ürün sahibi girdisi, kabul |

<a id="K17-01"></a>
## K17-01 · Karar: bağımsız harici güvenlik inceleyicisi ve kapsam

**Boyut:** S · **Dalga:** 0 · **Tür:** karar
**Başlamadan önce `main`'de olması gerekenler:** yok
**Ürün sahibinden gereken:** Bağımsız harici güvenlik inceleyicisi, bütçe ve zamanlama (veya yazılı risk kabulü).


**Dokunabileceğin yollar (yalnız bunlar):** `docs/adr/`, `docs/reports/` (yalnız bu kararın kaydı).

**Teslim edilecekler**
- Ürün sahibi için karar sayfası: inceleyici adayları (kişi/firma), bütçe, kapsam (yetki modeli, kimlik, medya geçidi, yayın/cache, rate limit, dağıtım yapılandırması), zamanlama (K16 sonrası staging erişimi), bulgu raporlama biçimi; yazılı risk kabulü alternatifi ve sınırı (§21.3)
- Karar `docs/adr/*-harici-inceleme.md` (ürün sahibi onayı); inceleyiciye verilecek **staging erişimi sahte veriyle** hazırlanır

**Kabul**
- Ürün sahibi inceleyiciyi, kapsamı ve tarihi yazılı belirlemiştir **veya** yazılı risk kabulünü kaydetmiştir (kritik açık için istisna yok)
- İnceleyici erişimi yalnız staging'dedir

**Oku:** `AGENTS.md`, §21.3, §19.6, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-01](K00-depo-kurallari.md#K00-01), [K00-06](K00-depo-kurallari.md#K00-06), [K00-07](K00-depo-kurallari.md#K00-07), [K10-01](K10-bildirim-eposta-sms.md#K10-01), [K13-01](K13-davetiye-takvim.md#K13-01), [K14-01](K14-belge-odeme.md#K14-01), [K15-01](K15-chatbot.md#K15-01)

**Bunu bekleyenler:** [K17-09](K17-staging-kabul.md#K17-09)

---

<a id="K17-02"></a>
## K17-02 · T-01–T-40 test matrisi: tam çalıştırma ve rapor

**Boyut:** L · **Dalga:** 40 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K16-10](K16-yonetim-butunlestirme.md#K16-10), [K03-12](K03-kimlik-uyelik.md#K03-12), [K05-14](K05-rezervasyon-motoru.md#K05-14), [K04-10](K04-outbox-audit-isci.md#K04-10), [K06-16](K06-talep-ziyaret-teklif.md#K06-16), [K07-10](K07-kurumsal-site-icerik.md#K07-10), [K15-10](K15-chatbot.md#K15-10)

**Dokunabileceğin yollar (yalnız bunlar):** `scripts/test-matrix.ts`, `tests/matrix/`, `docs/reports/K17-test-matrisi.md`

**Teslim edilecekler**
- Her T-xx için: karşılayan test dosyası/komutu, son çalıştırma sonucu, ortam (CI/staging) ve boşluk notu içeren **izlenebilirlik matrisi**; betik T-01..T-40'tan herhangi birinin eşlemesi eksikse hata verir
- Tüm matrisin tek komutla (`pnpm test:matrix`) CI ve staging'de çalıştırılması; çalıştırılamayan test açıkça 'çalıştırılmadı' + nedeniyle yazılır (geçti denmez)
- T-29 ve T-40 için ayrı kanıt K17-03'tedir; bu rapor onlara bağlantı verir

**Kabul**
- Matristeki 40 senaryonun tamamı eşlenmiş; eksik eşleme CI hatası; sonuç tablosu rapora commit edilmiş
- Başarısız veya çalıştırılamayan senaryo varsa K17 kapanışı bloklanır
- Bu paketin geçmesi gereken şartname testleri: T-01, T-02, T-03, T-04, T-05, T-06, T-07, T-08, T-09, T-10 (§20.1).

**Kapsam dışı:** Eksik test yazma gerekiyorsa ilgili karta düzeltme issue'su açılır; bu pakette yalnız matris ve çalıştırma.

**Oku:** `AGENTS.md`, §20.1, §20.2, §20.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K17-04](K17-staging-kabul.md#K17-04), [K17-06](K17-staging-kabul.md#K17-06), [K17-07](K17-staging-kabul.md#K17-07)

**Bunu bekleyenler:** [K17-09](K17-staging-kabul.md#K17-09), [K17-10](K17-staging-kabul.md#K17-10)

---

<a id="K17-03"></a>
## K17-03 · Geri yükleme tatbikatı: DB restore, RPO/RTO ölçümü, T-29 ve T-40 kanıtı

**Boyut:** L · **Dalga:** 27 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K16-06](K16-yonetim-butunlestirme.md#K16-06), [K01-09](K01-iskelet.md#K01-09), [K04-08](K04-outbox-audit-isci.md#K04-08)
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `scripts/restore-drill/`, `docs/runbook/restore.md`, `docs/reports/K17-restore.md`

**Teslim edilecekler**
- Staging DB yedeğinden **izole** ortama geri yükleme betiği/runbook'u; restore sonrası: RLS çalışıyor, üyelik/yayın iptalleri ve silme defteri **yeniden uygulanıyor** (K04-08), kullanıcı oturumları/anahtarlar yeniden değerlendiriliyor; RPO ve RTO **ölçülerek** raporlanır (hedef RPO ≤15 dk, RTO ≤4 sa; sağlayıcı yeteneğiyle doğrulanır)
- T-40 kanıtı: örnek silme başvurusunun yedeğe yansıma takvimi ve restore sonrası silme defterinin yeniden uygulanması
- Yedek şifreleme/erişim ayrımı ve nesne depolama sürümleme/geri yükleme politikası notları

**Kabul**
- T-29: restore sonrası veri açılır, iptal/silme kuralları yeniden uygulanır; rakamlar ölçülmüş (tahmin değil)
- Tatbikat sahte veriyle yapıldı; gerçek müşteri verisi kullanılmadı
- Bu paketin geçmesi gereken şartname testleri: T-29, T-40 (§20.1).

**Kapsam dışı:** Üretim tatbikatı K18 öncesi ayrıca yinelenir (K18-04).

**Oku:** `AGENTS.md`, §19.4, §17.5, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-13](K05-rezervasyon-motoru.md#K05-13), [K21-05](K21-yonetim-kabugu-takvim.md#K21-05), [K06-08](K06-talep-ziyaret-teklif.md#K06-08), [K07-09](K07-kurumsal-site-icerik.md#K07-09), [K11-10](K11-medya-temeli.md#K11-10), [K11-11](K11-medya-temeli.md#K11-11), [K13-08](K13-davetiye-takvim.md#K13-08), [K15-06](K15-chatbot.md#K15-06)

**Bunu bekleyenler:** [K17-07](K17-staging-kabul.md#K17-07), [K17-09](K17-staging-kabul.md#K17-09), [K17-10](K17-staging-kabul.md#K17-10), [K18-04](K18-canliya-gecis.md#K18-04)

---

<a id="K17-04"></a>
## K17-04 · Yük ve performans ölçümü: 100 oturum + 20 sohbet bağlantısı, bütçeler

**Boyut:** L · **Dalga:** 40 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K09-09](K09-sohbet-canli-akis.md#K09-09), [K12-06](K12-galeri-oynatici.md#K12-06), [K07-09](K07-kurumsal-site-icerik.md#K07-09)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/load/`, `docs/reports/K17-performans.md`

**Teslim edilecekler**
- Yük senaryosu betiği (k6/benzeri, lisansı notlanmış): 100 eşzamanlı gezinen oturum + 20 aktif sohbet bağlantısı; uygunluk API p95 (hedef ≤500 ms), mesaj kayıt p95 (≤500 ms) ve alıcıya görünürlük p95 (≤2 sn), outbox ilk işleme p95 (≤30 sn), video başlangıç p95 (≤3 sn tanımlı ağ profilinde), DB bağlantı havuzu/`max_connections` bütçesi, medya işçisi kaynak kullanımı
- Ziyaretçi deneyimi: p75 LCP/INP/CLS ve ilk JS (≤180 KB) ve ilk görünüm görsel bütçesi ölçümü (laboratuvar + varsa saha); test koşulları (cihaz/ağ/veri büyüklüğü) rapora yazılır
- Hedef tutmazsa güvenlik kontrolü gevşetilmez; iyileştirme önerisi ilgili karta issue olarak açılır

**Kabul**
- Her hedef için ölçülmüş sonuç + koşul + geçti/kaldı; rakam uydurulmamış; tutmayan hedef için gerekçeli karar kaydı
- Yük altında rezervasyon bütünlüğü bozulmadı (çift satış yok, T-01/T-02 örnekleri tekrarlandı)
- Bu paketin geçmesi gereken şartname testleri: T-02, T-09, T-37 (§20.1).

**Kapsam dışı:** Gerçek kullanıcı ölçümü (RUM) üretimde K18 sonrası izlenir.

**Oku:** `AGENTS.md`, §19.2, §19.3, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K17-02](K17-staging-kabul.md#K17-02), [K17-06](K17-staging-kabul.md#K17-06), [K17-07](K17-staging-kabul.md#K17-07)

**Bunu bekleyenler:** [K17-08](K17-staging-kabul.md#K17-08), [K17-10](K17-staging-kabul.md#K17-10)

---

<a id="K17-05"></a>
## K17-05 · Güvenlik yapılandırma denetimi: secret, başlık, cache, rate limit, bağımlılık ve imaj

**Boyut:** L · **Dalga:** 39 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K16-10](K16-yonetim-butunlestirme.md#K16-10), [K13-10](K13-davetiye-takvim.md#K13-10), [K03-12](K03-kimlik-uyelik.md#K03-12), [K01-09](K01-iskelet.md#K01-09)

**Dokunabileceğin yollar (yalnız bunlar):** `scripts/security-audit/`, `tests/security/staging-config/`, `docs/reports/K17-guvenlik-denetimi.md`

**Teslim edilecekler**
- Staging'e karşı otomatik denetim: güvenlik başlıkları (CSP, HSTS, çerçeve/yönlendirme politikası), çerez bayrakları, ters vekil ve `X-Forwarded-*` güveni, CORS/Origin, cache başlıkları (kayıtlı rotalar), health ucunun sızıntı yokluğu, hata sayfalarında yığın izi yokluğu, public bucket listeleme/ACL
- Rate limit doğrulaması (giriş, OTP, talep formu, chatbot, upload intent, davetiye token); secret taraması (depo geçmişi + imaj + istemci paketleri); bağımlılık güvenlik uyarısı ve lisans taraması çıktıları; imaj non-root/sabit sürüm kontrolü
- Bulgular şiddetiyle sınıflanır; kritik/yüksek için düzeltme issue'su ve yama hedefi (§19.6)

**Kabul**
- Denetim raporunda her kontrol geçti/kaldı; kritik/yüksek bulgu kalmadı veya bloklayıcı olarak işaretli
- Rate limit testleri gerçek limitleri doğruladı (yalnız yapılandırma okuması değil)
- Bu paketin geçmesi gereken şartname testleri: T-28, T-36, T-32 (§20.1).

**Kapsam dışı:** Bağımsız sızma testi K17-09'dadır.

**Oku:** `AGENTS.md`, §17.3, §17.4, §19.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K10-18](K10-bildirim-eposta-sms.md#K10-18), [K16-11](K16-yonetim-butunlestirme.md#K16-11)

**Bunu bekleyenler:** [K17-09](K17-staging-kabul.md#K17-09), [K17-10](K17-staging-kabul.md#K17-10)

---

<a id="K17-06"></a>
## K17-06 · Gerçek sağlayıcı sandbox kabulü: SMS, e-posta, OAuth, depolama (test alıcılarıyla)

**Boyut:** M · **Dalga:** 40 · **Tür:** kabul
**Başlamadan önce `main`'de olması gerekenler:** [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K10-16](K10-bildirim-eposta-sms.md#K10-16), [K03-13](K03-kimlik-uyelik.md#K03-13), [K11-05](K11-medya-temeli.md#K11-05)
**Ürün sahibinden gereken:** Sağlayıcı test hesapları ve doğrulanmış test alıcıları (K10-02, K03-13 çıktıları).

**Dokunabileceğin yollar (yalnız bunlar):** `docs/reports/K17-saglayici-kabul.md`, `tests/e2e/provider-sandbox/`

**Teslim edilecekler**
- Staging'de **gerçek sağlayıcı sandbox/test alıcılarıyla**: SMS (gönderim, `unknown` uzlaştırma, webhook, bütçe), e-posta (bounce/şikayet), Google/Facebook/Apple girişi (test hesabıyla), nesne depolama capability ve ClamAV gerçek servisi; staging'de gerçek müşteri alıcısına gönderim **engelleme** testi (T-32)
- Test hesabı olmayan sağlayıcı 'hazır' sayılmaz (§20.3); eksik sağlayıcı raporda 'kapsam kararı bekliyor' olarak işaretlenir

**Kabul**
- Her sağlayıcı için sandbox çalıştırma kanıtı veya açık bloklayıcı notu; T-32 gerçek ortamda doğrulandı
- Gerçek müşteri numarası/e-postası kullanılmadı
- Bu paketin geçmesi gereken şartname testleri: T-19, T-32, T-35, T-36 (§20.1).

**Kapsam dışı:** Üretim callback/hesapları K18'dedir.

**Oku:** `AGENTS.md`, §20.3, §12.4, §19.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K17-02](K17-staging-kabul.md#K17-02), [K17-04](K17-staging-kabul.md#K17-04), [K17-07](K17-staging-kabul.md#K17-07)

**Bunu bekleyenler:** [K17-10](K17-staging-kabul.md#K17-10)

---

<a id="K17-07"></a>
## K17-07 · Operasyon runbook'u, lisans envanteri ve bağımlılık planı

**Boyut:** M · **Dalga:** 40 · **Tür:** doküman
**Başlamadan önce `main`'de olması gerekenler:** [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K17-03](K17-staging-kabul.md#K17-03), [K11-11](K11-medya-temeli.md#K11-11)

**Dokunabileceğin yollar (yalnız bunlar):** `docs/runbook/`, `docs/license-inventory.md`, `docs/dependencies.md`, `docs/reports/K17-runbook-kontrol.md`

**Teslim edilecekler**
- Runbook: dağıtım/geri alma, sır döndürme, alarm yanıtı, sağlayıcı kesintisi (SMS/e-posta/LLM/depolama), DB bağlantı bütçesi, ClamAV imza gecikmesi, `unknown` SMS uzlaştırma, medya kuyruğu birikmesi, restore (K17-03), hesap ihlali müdahalesi ve **ihlal bildirimi iletişim noktası** (kişi adı yer tutucu; atama K17-10'da)
- Lisans envanteri: doğrudan ve geçişli bağımlılıklar, FFmpeg/sharp/ClamAV/S3 uyumlu servis/oynatıcı lisans notları, sorunlu lisans kontrolü; `dependencies.md` güncel; yıllık yükseltme planı (Node LTS/Next.js/Better Auth)
- Runbook adımları staging'de bir kez uygulanarak doğrulanır (sahte tatbikat notu raporda)

**Kabul**
- Runbook'taki her prosedür staging'de denenmiş veya 'denenmedi' + nedeni işaretli; lisans envanterinde sorunlu lisans yok veya gerekçeli karar var
- Hiçbir runbook sayfasında gerçek sır/kişi bilgisi yok

**Kapsam dışı:** Kod değişikliği yok; eksik operasyon aracı için ilgili karta issue.

**Oku:** `AGENTS.md`, §19.1, §19.3, §19.6 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K17-02](K17-staging-kabul.md#K17-02), [K17-04](K17-staging-kabul.md#K17-04), [K17-06](K17-staging-kabul.md#K17-06)

**Bunu bekleyenler:** [K17-08](K17-staging-kabul.md#K17-08), [K17-10](K17-staging-kabul.md#K17-10)

---

<a id="K17-08"></a>
## K17-08 · Maliyet raporu ve KVKK kontrol listesi

**Boyut:** M · **Dalga:** 41 · **Tür:** doküman
**Başlamadan önce `main`'de olması gerekenler:** [K17-04](K17-staging-kabul.md#K17-04), [K17-07](K17-staging-kabul.md#K17-07), [K15-01](K15-chatbot.md#K15-01), [K10-02](K10-bildirim-eposta-sms.md#K10-02), [K11-01](K11-medya-temeli.md#K11-01), [K16-06](K16-yonetim-butunlestirme.md#K16-06)
**Ürün sahibinden gereken:** Fiyat teklifleri ve KVKK/VERBİS konusunda işletme/uzman görüşü.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/reports/K17-maliyet.md`, `docs/reports/K17-kvkk-kontrol.md`

**Teslim edilecekler**
- Maliyet raporu (§19.6 kalemleri): **gerçek fiyat tekliflerinden/fiyat sayfalarından** aylık tahmin (barındırma, yönetilen PostgreSQL ve PITR, nesne depolama + çıkış, CDN, e-posta, SMS/OTP, LLM, alan adı/TLS, izleme/log, ClamAV belleği, harici inceleme, içerik hizmetleri); varsayım ve belirsizlikler yazılı; SMS/LLM/depolama çıkışı için önerilen tavan ve %80 uyarı değerleri (ürün sahibi belirler)
- KVKK kontrol listesi (§17.6): veri envanteri güncel mi (PRIV-01), aydınlatma/açık rıza metin sürümleri ve `consent_record`, saklama süreleri, ilgili kişi başvuru süreci (K16-06), yurt dışı aktarım (LLM/e-posta/SMS/depolama sağlayıcı bölgeleri), VERBİS gerekliliği **soru olarak** işletmeye; hukuki yorum yapılmaz
- Açık maddeler 'işletme/uzman onayı bekliyor' olarak işaretlenir (K18 bloklayıcı listesine girer)

**Kabul**
- Rapor yalnız doğrulanmış kaynaklı rakamlar içerir (kaynak/tarih/varsayım yazılı); belirsiz kalem 'teklif bekleniyor'
- KVKK listesinde her madde durumlu (tamam / açık / işletme kararı) ve sorumlu rolle

**Kapsam dışı:** Hukuki görüş yazılmaz; yalnız mühendislik kayıtları ve açık soru listesi.

**Oku:** `AGENTS.md`, §17.6, §19.6, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K17-09](K17-staging-kabul.md#K17-09)

**Bunu bekleyenler:** [K17-10](K17-staging-kabul.md#K17-10)

---

<a id="K17-09"></a>
## K17-09 · Bağımsız harici güvenlik incelemesi ve bulgu kapatma

**Boyut:** L · **Dalga:** 41 · **Tür:** kabul
**Başlamadan önce `main`'de olması gerekenler:** [K17-01](K17-staging-kabul.md#K17-01), [K17-02](K17-staging-kabul.md#K17-02), [K17-05](K17-staging-kabul.md#K17-05), [K17-03](K17-staging-kabul.md#K17-03), [K16-10](K16-yonetim-butunlestirme.md#K16-10), [K11-16](K11-medya-temeli.md#K11-16), [K13-14](K13-davetiye-takvim.md#K13-14)
**Ürün sahibinden gereken:** Harici inceleme çalışmasının yürütülmesi ve bulgu doğrulaması.
**İnsan inceleme kapısı:** evet (§21.3) — PR, ajan olmayan inceleyen onaylamadan birleştirilmez.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/reports/K17-harici-inceleme.md`, `docs/reports/K17-bulgu-kapatma.md`

**Teslim edilecekler**
- İnceleyiciye: kapsam belgesi, mimari özeti (`docs/Proje.md` ilgili bölümleri), staging erişimi (sahte veri), test hesapları; bulguların tek listede izlenmesi (şiddet, durum, düzeltme PR'ı, **yeniden doğrulama**)
- Kritik/yüksek bulgular yayından önce kapatılır ve inceleyici/yetkili kişi tarafından doğrulanır; orta/düşük için yama hedefi veya süreli, yazılı risk kabulü; kapsam ve sonuç özeti `docs/reports/K17-harici-inceleme.md`'ye (bulgu ayrıntısı hassassa özet + güvenli dosya bağlantısı)
- Yazılı risk kabulü seçildiyse kabul edilen risklerin listesi ve ürün sahibi onayı rapora eklenir (çözümlenmemiş **kritik** güvenlik açığı için bu yol yoktur)

**Kabul**
- Çözümlenmemiş kritik/yüksek bulgu yok; her bulgunun durumu ve doğrulaması yazılı; rapor birleşmeden K18 başlamaz
- Raporda sır, token, gerçek kişi verisi veya sömürü ayrıntısı herkese açık biçimde yer almaz (özet)

**Kapsam dışı:** İnceleme tamamlanmadan 'incelendi' notu eklenmez.

**Oku:** `AGENTS.md`, §21.3, §20.3, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K17-08](K17-staging-kabul.md#K17-08)

**Bunu bekleyenler:** [K17-10](K17-staging-kabul.md#K17-10)

---

<a id="K17-10"></a>
## K17-10 · Bakım sahipliği teyidi ve K17 kapanış raporu (yayın kapısı değerlendirmesi)

**Boyut:** S · **Dalga:** 42 · **Tür:** kabul
**Başlamadan önce `main`'de olması gerekenler:** [K17-02](K17-staging-kabul.md#K17-02), [K17-03](K17-staging-kabul.md#K17-03), [K17-04](K17-staging-kabul.md#K17-04), [K17-05](K17-staging-kabul.md#K17-05), [K17-06](K17-staging-kabul.md#K17-06), [K17-07](K17-staging-kabul.md#K17-07), [K17-08](K17-staging-kabul.md#K17-08), [K17-09](K17-staging-kabul.md#K17-09)
**Ürün sahibinden gereken:** Üç rolün atanması, yama hedeflerinin onayı ve K17 sonuç onayı.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/reports/K17-kabul.md`, `docs/runbook/ownership.md`

**Teslim edilecekler**
- İsimli üç rol: ürün sahibi, teknik sorumlu (kişi veya servis sözleşmesi), güvenlik/ihlal iletişim noktası — `docs/runbook/ownership.md`'de **rol** düzeyinde kayıt (kişisel iletişim bilgisi depoda değil, güvenli kanalda; depoda yalnız referans)
- Yama hedefleri (kritik 48 sa değerlendirme / 7 gün önlem; yüksek 14; orta 30) ve düzenli işler (haftalık triage, aylık restore, üç aylık `AccessReview`, yıllık sır döndürme/yükseltme planı) ürün sahibince kabul edildi mi
- `K17-kabul.md`: §20.3 yayın kapısı kontrol listesi — her madde geçti/açık/risk kabulü; açık bloklayıcıların listesi K18'e devredilir

**Kabul**
- Üç rol atanmış (boş rol varsa 'K18 başlamaz' yazılı); §20.3 kapı listesi eksiksiz ve dürüst
- Çözümlenmemiş kritik sızıntı yok; ürün sahibi K17 sonucunu yazılı onaylamıştır

**Oku:** `AGENTS.md`, §19.6, §20.3, §22.2 (+ zorunlu: §1, §4, §20.2)

**Bunu bekleyenler:** [K18-01](K18-canliya-gecis.md#K18-01), [K18-05](K18-canliya-gecis.md#K18-05)

---
