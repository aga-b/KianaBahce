# K20 — Tasarım, marka ve içerik hazırlığı

**Kilometre taşı:** M2 — Başvurudan davete (K06, K07, K20) · **Şartname:** §2, §3, §13.1, §16, §19.5, §23 · [Plan dizini](README.md)

> Marka, ekran akışları, gerçek fotoğraf/metin ve hukuki metin taslakları. K07'nin önkoşuludur.

Büyük bölümü kod ajanı işi değildir; ürün sahibi/tasarımcı/fotoğrafçı/hukuk girdisi ister. K00'dan hemen sonra, kod kartlarından bağımsız başlar ve **en uzun belirsizlik kalemidir** — erken başlatın. Kilometre taşı M2'dir ama çalışma M0'la birlikte yürür.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K20-01](K20-tasarim-icerik.md#K20-01) · Marka varlıkları ile fotoğraf/video envanteri | M | 2 | K00-03 | ürün sahibi girdisi, envanter |
| [K20-02](K20-tasarim-icerik.md#K20-02) · Mevcut site içeriği ve URL envanteri | S | 2 | K00-03 | envanter |
| [K20-03](K20-tasarim-icerik.md#K20-03) · Tasarım sistemi: renk, tipografi, bileşen tokenları | M | 3 | K20-01 | ürün sahibi girdisi, tasarım |
| [K20-04](K20-tasarim-icerik.md#K20-04) · Kritik ekran akışları ve onaylı maketler | L | 4 | K20-03 | ürün sahibi girdisi, tasarım |
| [K20-05](K20-tasarim-icerik.md#K20-05) · Sayfa metinleri ve SSS içeriği | M | 3 | K20-01, K20-02 | ürün sahibi girdisi, içerik |
| [K20-06](K20-tasarim-icerik.md#K20-06) · Hukuki metin taslakları (gizlilik, çerez, aydınlatma, açık rıza) | M | 2 | K00-03 | ürün sahibi girdisi, içerik |
| [K20-07](K20-tasarim-icerik.md#K20-07) · Çekim planı ve K20 kabul raporu (K07 başlatma onayı) | S | 5 | K20-03, K20-04, K20-05, K20-06 | ürün sahibi girdisi, karar |

<a id="K20-01"></a>
## K20-01 · Marka varlıkları ile fotoğraf/video envanteri

**Boyut:** M · **Dalga:** 2 · **Tür:** envanter
**Başlamadan önce `main`'de olması gerekenler:** [K00-03](K00-depo-kurallari.md#K00-03)
**Ürün sahibinden gereken:** Logo, mevcut fotoğraf/video dosyaları ve kullanım hakkı bilgisi.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/content/asset-inventory.md`

**Teslim edilecekler**
- Ürün sahibinden: logo/marka dosyaları, mevcut fotoğraf ve videolar, her biri için kaynak ve kullanım hakkı (çeken kişi, sözleşme, izin)
- `asset-inventory.md`: kalem listesi (dosya adı, tür, çözünürlük, hak durumu, kullanılabilir/eksik)
- Eksikler için çekim ihtiyacı listesi

**Kabul**
- Envanterdeki her görsel için kullanım hakkı alanı dolu ya da "belirsiz" diye işaretli
- Hakkı belirsiz görsel hiçbir sayfada kullanılmaz

**Oku:** `AGENTS.md`, §2, §3, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-05](K00-depo-kurallari.md#K00-05), [K01-01](K01-iskelet.md#K01-01), [K20-02](K20-tasarim-icerik.md#K20-02), [K20-06](K20-tasarim-icerik.md#K20-06), [K03-13](K03-kimlik-uyelik.md#K03-13), [K10-02](K10-bildirim-eposta-sms.md#K10-02), [K11-01](K11-medya-temeli.md#K11-01)

**Bunu bekleyenler:** [K20-03](K20-tasarim-icerik.md#K20-03), [K20-05](K20-tasarim-icerik.md#K20-05), [K18-03](K18-canliya-gecis.md#K18-03)

---

<a id="K20-02"></a>
## K20-02 · Mevcut site içeriği ve URL envanteri

**Boyut:** S · **Dalga:** 2 · **Tür:** envanter
**Başlamadan önce `main`'de olması gerekenler:** [K00-03](K00-depo-kurallari.md#K00-03)

**Dokunabileceğin yollar (yalnız bunlar):** `docs/content/legacy-site.md`

**Teslim edilecekler**
- `kianabahce.com` mevcut sayfalarının, URL'lerinin, formlarının ve ölçülebilir trafik/SEO dayanaklarının listesi (yalnız okuma; siteye müdahale yok)
- Her URL için hedef: aynen taşı / birleştir / yönlendir / kaldır önerisi (karar ürün sahibinin)

**Kabul**
- Liste tüm bilinen URL'leri içerir; kişisel veri içeren form içeriği aktarılmaz (§19.5)
- Mevcut yayın değiştirilmedi

**Kapsam dışı:** Mevcut siteyi değiştirmek veya DNS'e dokunmak yasaktır.

**Oku:** `AGENTS.md`, §19.5 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-05](K00-depo-kurallari.md#K00-05), [K01-01](K01-iskelet.md#K01-01), [K20-01](K20-tasarim-icerik.md#K20-01), [K20-06](K20-tasarim-icerik.md#K20-06), [K03-13](K03-kimlik-uyelik.md#K03-13), [K10-02](K10-bildirim-eposta-sms.md#K10-02), [K11-01](K11-medya-temeli.md#K11-01)

**Bunu bekleyenler:** [K20-05](K20-tasarim-icerik.md#K20-05), [K18-03](K18-canliya-gecis.md#K18-03)

---

<a id="K20-03"></a>
## K20-03 · Tasarım sistemi: renk, tipografi, bileşen tokenları

**Boyut:** M · **Dalga:** 3 · **Tür:** tasarım
**Başlamadan önce `main`'de olması gerekenler:** [K20-01](K20-tasarim-icerik.md#K20-01)
**Ürün sahibinden gereken:** Tasarım yönü ve token onayı (tasarımcı varsa onun çıktısı esas).

**Dokunabileceğin yollar (yalnız bunlar):** `docs/design/`, `packages/ui/src/tokens/`

**Teslim edilecekler**
- Marka yönü (kırık beyaz, koyu yeşil, ölçülü şampanya) için renk paleti, tipografi, aralık/gölge/köşe tokenları, kontrast değerleri
- `packages/ui/src/tokens/`: Tailwind tema tokenları (kod yalnız token dosyası)
- Bileşen kuralları: düğme, form alanı, kart, takvim hücresi, durum etiketleri; `prefers-reduced-motion` ilkesi

**Kabul**
- Tüm metin/arka plan çiftleri WCAG 2.2 AA kontrastını sağlar (tabloyla kanıtlı)
- Ürün sahibi tokenları onaylar

**Oku:** `AGENTS.md`, §2, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K01-02](K01-iskelet.md#K01-02), [K01-03](K01-iskelet.md#K01-03), [K01-04](K01-iskelet.md#K01-04), [K20-05](K20-tasarim-icerik.md#K20-05)

**Bunu bekleyenler:** [K20-04](K20-tasarim-icerik.md#K20-04), [K20-07](K20-tasarim-icerik.md#K20-07)

---

<a id="K20-04"></a>
## K20-04 · Kritik ekran akışları ve onaylı maketler

**Boyut:** L · **Dalga:** 4 · **Tür:** tasarım
**Başlamadan önce `main`'de olması gerekenler:** [K20-03](K20-tasarim-icerik.md#K20-03)
**Ürün sahibinden gereken:** Maketlerin onayı ve geri bildirimi.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/design/screens/`

**Teslim edilecekler**
- Genel site: ana sayfa, uygunluk + talep, galeri, iletişim, SSS; müşteri portalı: Düğünüm, pano, sohbet, onaylar; yönetim: takvim, talep hattı, düğün çalışma alanı
- Her ekran için: akış, durumlar (yükleniyor/boş/hata/yetkisiz/bağlantı kesildi), mobil ve masaüstü maketi, bileşen adları (§16)
- Takvimde davetiye nüansı (§13.1) için küçük etkileşim maketi

**Kabul**
- Ürün sahibi maketleri onaylar (onay kaydı `docs/design/approvals.md`)
- Her ekranda erişilebilirlik notu (klavye, odak, takvim için liste alternatifi)

**Oku:** `AGENTS.md`, §2, §13.1, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K01-05](K01-iskelet.md#K01-05), [K01-07](K01-iskelet.md#K01-07)

**Bunu bekleyenler:** [K20-07](K20-tasarim-icerik.md#K20-07)

---

<a id="K20-05"></a>
## K20-05 · Sayfa metinleri ve SSS içeriği

**Boyut:** M · **Dalga:** 3 · **Tür:** içerik
**Başlamadan önce `main`'de olması gerekenler:** [K20-01](K20-tasarim-icerik.md#K20-01), [K20-02](K20-tasarim-icerik.md#K20-02)
**Ürün sahibinden gereken:** Hizmet, kapasite, kural ve iletişim bilgilerinin doğrulanması; metin onayı.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/content/pages/`, `docs/content/faq.md`

**Teslim edilecekler**
- Ana sayfa, mekân, hizmetler/olanaklar, organizasyon türleri, yol tarifi ve iletişim metinleri
- SSS maddeleri (chatbot'un onaylı bilgi kaynağı da bunlardır); her madde için kaynak/onay notu
- Doğrulanmamış bilgi (kapasite, fiyat, hizmet) uydurulmaz; eksikler "ürün sahibinden bekleniyor" diye işaretlenir

**Kabul**
- Ürün sahibi metinleri onaylar; her olgusal iddia kaynağa bağlı
- SSS maddeleri taslak/yayın durumuyla işaretli

**Oku:** `AGENTS.md`, §2, §3, §15, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K01-02](K01-iskelet.md#K01-02), [K01-03](K01-iskelet.md#K01-03), [K01-04](K01-iskelet.md#K01-04), [K20-03](K20-tasarim-icerik.md#K20-03)

**Bunu bekleyenler:** [K20-07](K20-tasarim-icerik.md#K20-07)

---

<a id="K20-06"></a>
## K20-06 · Hukuki metin taslakları (gizlilik, çerez, aydınlatma, açık rıza)

**Boyut:** M · **Dalga:** 2 · **Tür:** içerik
**Başlamadan önce `main`'de olması gerekenler:** [K00-03](K00-depo-kurallari.md#K00-03)
**Ürün sahibinden gereken:** Hukuk danışmanı/uzman onayı; VERBİS ve yurt dışı aktarım kararları.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/legal/`

**Teslim edilecekler**
- Taslaklar: gizlilik politikası, çerez bildirimi, KVKK aydınlatma metni, açık rıza (yayın onayı, tanıtım iletisi) ve kullanım şartları taslağı
- Her metnin sürüm kimliği (`consent_record` sürüm alanı için) ve hangi ekranda gösterileceği listesi
- VERBİS gerekliliği ve yurt dışı aktarım sorusu "işletme/uzman kararı" diye açık soru olarak yazılır

**Kabul**
- Taslaklar işletmenin hukuk danışmanına gönderilebilir durumda; hukuki görüş iddia edilmez
- Metin sürümleri K06/K13 ekranlarının kullanacağı kimliklerle listelenmiş

**Oku:** `AGENTS.md`, §17.6, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-05](K00-depo-kurallari.md#K00-05), [K01-01](K01-iskelet.md#K01-01), [K20-01](K20-tasarim-icerik.md#K20-01), [K20-02](K20-tasarim-icerik.md#K20-02), [K03-13](K03-kimlik-uyelik.md#K03-13), [K10-02](K10-bildirim-eposta-sms.md#K10-02), [K11-01](K11-medya-temeli.md#K11-01)

**Bunu bekleyenler:** [K20-07](K20-tasarim-icerik.md#K20-07), [K07-08](K07-kurumsal-site-icerik.md#K07-08)

---

<a id="K20-07"></a>
## K20-07 · Çekim planı ve K20 kabul raporu (K07 başlatma onayı)

**Boyut:** S · **Dalga:** 5 · **Tür:** karar
**Başlamadan önce `main`'de olması gerekenler:** [K20-03](K20-tasarim-icerik.md#K20-03), [K20-04](K20-tasarim-icerik.md#K20-04), [K20-05](K20-tasarim-icerik.md#K20-05), [K20-06](K20-tasarim-icerik.md#K20-06)
**Ürün sahibinden gereken:** K07'nin başlaması için yazılı onay.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/design/`, `docs/content/`, `docs/reports/K20-kabul.md`

**Teslim edilecekler**
- Eksik fotoğraf/video için çekim planı (gerekiyorsa) ve tahmini takvim
- `K20-kabul.md`: onaylanan çıktılar, hâlâ eksik olanlar, K07'nin kullanabileceği içerik/tasarım listesi
- Ürün sahibinin "K07 başlayabilir" onayı

**Kabul**
- Onay kaydı mevcut; K07 başlamadan önce eksik kalemler açıkça listeli
- Hakkı belirsiz görsel kullanılabilir listesinde yok

**Oku:** `AGENTS.md`, §22.2, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K01-06](K01-iskelet.md#K01-06)

**Bunu bekleyenler:** [K07-01](K07-kurumsal-site-icerik.md#K07-01), [K07-02](K07-kurumsal-site-icerik.md#K07-02)

---
