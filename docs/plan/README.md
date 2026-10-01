# Kiana Bahçe — Uygulama planı (iş paketleri)

Bu dizin, [`../Proje.md`](../Proje.md) (v1.1 şartname) içindeki K00–K21 görev kartlarını **küçük, tek PR'lık iş paketlerine (İP)** böler. Kimlik biçimi `Kxx-nn` (ör. `K05-06`). Şartname ile bu plan çelişirse **şartname geçerlidir**; çelişkiyi issue olarak bildir, kendi kararınla çözme.

- **22 kart · 227 iş paketi** (31 S / 107 M / 89 L) · **49 dalga** · kritik yol 49 halka
- Her kartın kendi dosyası var (`K05-rezervasyon-motoru.md` gibi); her iş paketi o dosyada kendi bölümünde ve `#K05-06` bağlantısıyla adreslenir.
- İşin **durumu** (hazır / devam / incelemede / bitti) GitHub issue'larında tutulur; bu dizin durum içermez (K00-01 dışında, o da başlangıç notudur).

## 1. "Şunu yap" dendiğinde ne olur

Kullanıcı veya entegratör bir ajana **"K05-06'yı yap"** dediğinde ajan:

1. `docs/plan/K05-….md` içinde `#K05-06` bölümünü açar; `AGENTS.md`'yi ve bölümdeki **Oku** listesini (zorunlu §1, §4, §20.2 dahil) okur.
2. **Başlamadan önce `main`'de olması gerekenler** satırındaki iş paketlerinin issue'ları kapalı mı (= `main`'e birleşmiş mi) kontrol eder. Biri eksikse **işe başlamaz**, eksik olanı yapmaz; hangi bağımlılığın eksik olduğunu bildirir.
3. Aynı yollara dokunan açık bir PR var mı bakar (açık PR'ları `gh pr list` ile gez). Varsa başlamaz, entegratöre bildirir.
4. Güncel `main`'den `feat/K05-06-kisa-konu` dalını (düzeltme için `fix/…`) açar; paralel çalışıyorsa ayrı çalışma dizini (worktree) kullanır.
5. **Yalnız o iş paketinin "Teslim edilecekler" maddelerini** yapar ve yalnız **"Dokunabileceğin yollar"** içinde değişiklik yapar. İşin içinde başka bir iş paketinin işi görünüyorsa yapmaz; "Kapsam dışı" satırı ve issue ile bildirir.
6. "Kabul" maddelerini ve listelenen T-xx testlerini **çalıştırarak** doğrular; çalıştırılamayanı "çalıştırılmadı, nedeni" diye yazar (çalışmamış testi "geçti" yazmak yasak).
7. PR açar (`main`'e doğrudan yazmaz, kendi PR'ını birleştirmez), PR şablonunu doldurur, başlığa iş paketi kimliğini yazar, ve gövdede `Refs #<issue>` yazar (`Closes` değil: issue'yu birleştirme sonrası entegratör kapatır; kapılıysa inceleme onayından sonra).
8. Bitirince son raporu verir: değişen davranış, test kanıtı, migration/geri dönüş, bilinen sınırlama, PR bağlantısı. Başka iş paketini **başlatmaz**.

Kullanıcı bir **aşama** isterse ("M1'i yap", "K05'i yap"), entegratör iş paketlerini dalga sırasıyla ayrı ajanlara/oturumlara dağıtır; her iş paketi yine kendi dalı ve PR'ıdır. Tek ajan birden çok iş paketini tek PR'a koymaz.

## 2. İş paketi bölümü nasıl okunur

| Alan | Anlamı |
|---|---|
| **Boyut** | S ≈ yarım gün, M ≈ 1–2 gün, L ≈ 3–4 gün ajan işi; L'den büyük iş yoktur. İş paketi beklenenden büyürse dur, issue'da bölünmesini iste. |
| **Dalga** | Bağımlılık derinliği (aşağıdaki tablo). Aynı dalgadaki işler birbirine bağımlı değildir. |
| **Tür** | `kod`, `doküman`, `karar`, `kabul`, `yapılandırma`, `hesap`, `envanter`, `içerik`, `tasarım`. `kod` dışındakilerin çoğu ürün sahibi girdisi veya rapor işidir. |
| **Başlamadan önce `main`'de olması gerekenler** | Doğrudan bağımlılıklar. Hepsi birleşmeden başlanmaz. Dolaylı bağımlılıklar zaten bunların içindedir. |
| **Dokunabileceğin yollar (yalnız bunlar)** | Değiştirebileceğin/ekleyebileceğin dosya alanı. Yol `/` ile bitiyorsa dizin altı, değilse tek dosya. Küresel izinler (aşağıda, kural 6) bunun dışında geçerlidir. |
| **Migration** | Bu iş paketi migration/şema değiştirir. Kural 4 geçerlidir. |
| **İnsan inceleme kapısı** | §21.3. PR'ı yazılım güvenliği deneyimli bir insan onaylamadan birleştirilmez; bu iş paketine bağımlı işler kapı geçilene dek **başlamaz**. |
| **Ürün sahibi girdisi** | Ajan kararı/hesabı/içeriği uyduramaz. Eksik girdiyi issue'da ister; girdi gelene dek ilerlemez veya (kapsam açıkça izin veriyorsa) fake adaptörle ilerler. |
| **Teslim / Kabul / Test** | Teslim = yapılacak; Kabul = "bitti" ölçütü; Test = ilgili T-xx senaryoları (şartname §20.1). |
| **Kapsam dışı** | Özellikle yapılmayacak komşu işler (hangi iş paketine ait olduğu yazılıdır). |
| **Aynı dalgada paralel çalışabilir / yol çakışması** | Aynı anda başka ajana verilebilecek işler; çakışma işaretliyse sırayla yapılır. |
| **Bunu bekleyenler** | Bu iş paketine bağımlı işler (gecikmenin etkisi). |

## 3. Çalışma kuralları

1. **Yalnız adı geçen iş paketini yap.** Komşu işi "kolay olduğu için" yapma; fark ettiğin eksiği issue'ya yaz.
2. **Yol sınırı.** "Dokunabileceğin yollar" dışına yazma. Gerekiyorsa dur: entegratör ya yolu genişletir ya işi böler. Sessizce genişletme.
3. **Bağımlılık sınırı.** Bağımlılığı `main`'de olmayan iş başlamaz; geçici gerçek-dışı davranış (sessiz mock, sahte başarı) yazılmaz. İzin verilen tek istisna, iş paketinde adı geçen **fake adaptörler**dir (portun sahte uygulaması; üretimde kapalı).
4. **Migration / birleştirme sırası.** Migration dosyaları zaman damgalı SQL'dir (`YYYYMMDDHHMM_ad.sql`), sıra defteri yoktur. Birleştirme sırasını **entegratör** belirler. Aynı tabloya dokunan migration iş paketleri sırayla birleştirilir. Rebase'te sıra çakışırsa kendi migration'ının zaman damgasını sonraya al; **başkasının dosyasını değiştirme**. Birleştirilmiş migration düzenlenmez; düzeltme yeni migration olur. Aynı migration/sözleşme dosyası iki ajana aynı anda verilmez.
5. **Paylaşılan sözleşme.** Birden çok iş paketinin kullandığı sözleşme (`packages/contracts`, port arayüzü) değişecekse önce küçük, ayrı bir PR olarak birleşir; tüketici işler ondan sonra başlar. İş paketleri bu sırayı zaten bağımlılık olarak taşır.
6. **Küresel izinler (yol çakışması sayılmaz).** Aşağıdakiler her iş paketinde, yalnız **ekleme** olarak serbesttir; başka satıra dokunma:
   - `index.ts` barrel dosyalarına kendi modülünün export satırı;
   - `docs/data-inventory.md`'ye yeni kişisel veri alanı satırı (PRIV-01 gereği zorunlu);
   - bağımlılık eklemek: `package.json` + kilit dosyası + `docs/dependencies.md` satırı (lisans dahil; ücretli/kısıtlı lisans ürün sahibi kararıdır);
   - ekleme-yalnız kayıt defterleri (aşağıda §6): menü kaydı `nav/<ozellik>.ts` (kendi dosyan), sekme kaydı, `MediaAccessPolicy` kaydı, `tests/security/cache-isolation/routes.ts` satırı.
7. **PR ve inceleme.** Her iş paketi tek dal, tek PR. Kendi PR'ını birleştirme. §21.3 kapılı iş paketlerinde PR'da inceleyen insanın onayı yoksa birleştirme yok ("incelenmedi" notu yetmez).
8. **Yapılmaz listesi.** Yeni ücretli servis, provider hesabı, üretim sırrı, lisans şartı, canlıya etkili işlem ya da güvenlik sınırı değişikliği ajan tarafından kendiliğinden yapılmaz. Gerçek sır ve müşteri verisi repoya girmez (depo public olabilir). Depo görünürlüğünü değiştirme.
9. **Rapor dürüstlüğü.** Çalıştırılmayan testi "geçti" yazma; eksik provider/erişimi, belirsizliği ve bilinen sınırlamayı açıkça yaz.
10. **Çakışma.** Rebase/merge çakışması çıkarsa yalnız **kendi** değişikliğini çöz. Çakışan dosya "Dokunabileceğin yollar" dışındaysa dur ve entegratöre bildir.
11. **Plan yanlışsa / yetersizse.** İş paketi uygulanamaz, çelişkili veya fazla büyükse **issue aç** (`plan-sorunu` etiketi; ilgili İP kimliği + şartname bölümü + önerin). İşi kendi kafana göre genişletme. Entegratör planı günceller; plan değişikliği küçük bir doküman PR'ıdır.

## 4. Hazır / Bitti tanımı

**Hazır (başlayabilir):** doğrudan bağımlılıkların issue'ları kapalı; aynı yollara dokunan açık PR yok; ürün sahibi girdisi gerekiyorsa gelmiş; kapılı bir bağımlılık varsa kapıdan geçmiş.

**Bitti (issue kapanır):** (a) şartname §20.2 Definition of Done; (b) iş paketindeki tüm "Kabul" maddeleri kanıtlı; (c) listelenen T-xx testleri çalışıp geçmiş (veya çalıştırılamama nedeni kabul edilmiş); (d) PR şablonu dolu; (e) kapılıysa insan onayı; (f) `main`'e birleşmiş. Kapalı issue = bağımlı işlerin başlayabileceği an.

## 5. Kilometre taşları

Kilometre taşları GitHub milestone'larıdır (`M0`–`M5`); her birinin bir takip issue'su vardır (kontrol listesi). Çıkış ölçütü = ürün sahibinin staging'de gerçekten deneyebilmesi (§22.2).

| Kilometre taşı | Kartlar | Çıkış ölçütü (ürün sahibi ne dener) |
|---|---|---|
| **M0 — Temel ve hazırlık** | K00–K04 | Depo kuralları, çalışan iskelet, DB/RLS çekirdeği, kimlik, outbox/işçi. Temiz checkout'ta kurulum, CI yeşil, staging health yeşil. |
| **M1 — Personel takvimi** | K05, K21 | Staging'de gerçek personel girişi (MFA), takvim, test hold'u açma ve kesinleştirme; T-01–T-07 arayüzden de koşar. (K21-07 ürün sahibi kabulü) |
| **M2 — Başvurudan davete** | K06, K07, K20 | Genel site, talep, ziyaret/teklif, müşteri daveti (fake gönderim); K20: onaylı tasarım ve içerik (K20 M0 döneminde, kod hattıyla paralel başlar ve K07'den önce bitmelidir). (K07-10) |
| **M3 — Müşteri deneyimi** | K08, K09, K10 | Düğünüm, pano, onaylar, sohbet, bildirimler (test alıcılarıyla). (K10-18) |
| **M4 — Medya ve yayın** | K11–K15 | Galeri, izinli davetiye, belgeler/ödeme takibi, chatbot. (K15-11) |
| **M5 — Bütünleştirme ve yayın** | K16, K17, K18, (K19) | Uçtan uca personel+çift senaryosu, T-01–T-40 raporu, harici güvenlik incelemesi, canlıya geçiş. K19 sonraki sürümdür; iş paketi yoktur, kapsamı kullanıcı seçince yazılır. |

## 6. Kayıt defterleri (kart arası dikiş yerleri)

Kartların birbirinin dosyasını düzenlememesi için ortak noktalar **kendini kaydeden** desenle kuruldu. Kaydı yapan iş paketi yalnız kendi kayıt satırını/dosyasını ekler:

| Kayıt defteri | Kuran iş paketi | Kayıt ekleyenler |
|---|---|---|
| Yönetim menüsü: `apps/web/src/admin/nav/<ozellik>.ts` (otomatik toplanır) | K21-03 | Yönetim ekranı teslim eden her kart (K08, K11, K13, K14, K15, K16 …) |
| EventWorkspace sekmesi: `registerWorkspaceTab({id,label,permission,component})` (`apps/web/src/admin/event-workspace/tab-registry.ts`) | K08-12 | Sohbet, pano, belgeler/ödeme, yayın sekmeleri |
| `MediaAccessPolicy` kaydı (özel medya geçidi) | K11-12 | Yayın medyası (K13-06), belge dosyaları (K14-05) |
| Cache-isolation rota listesi: `tests/security/cache-isolation/routes.ts` | K13-10 | Kamu/özel rota ekleyen herkes (T-17) |
| Yetki envanteri betiği (rota/uç ↔ izin kaydı) | K16-10 | Her yeni uç (kayıtsız uç CI'ı düşürür) |

Yer tutucu bağlantılar (sonradan dolan): `publicPublicationId` (K05-10 → K13-08), K08-02 ek yer tutucusu (→ K11-15 FK), K04-09 veri talebi arayüzü (→ K16-06).

## 7. Paralellik: nasıl okunur

Aynı anda birden çok ajan çalışabilir; sınır **bağımlılık** ve **yol çakışması**dır.

- **Aynı dalga:** Tablodaki (aşağıda) aynı dalgadaki işler birbirine bağımlı değildir; her iş paketi bölümünde "Aynı dalgada paralel çalışabilir" ve "yol çakışması" satırı otomatik üretilmiştir.
- **Farklı dalga:** Birbirinin ata/torunu olmayan iki iş, dalgaları farklı olsa da paralel yapılabilir (dalga yalnız *en erken* başlama zamanıdır). Her iş paketinin tek geçerli koşulu "Başlamadan önce `main`'de olması gerekenler" satırıdır; ek olarak **başka açık PR'ın aynı yollara dokunmaması**.
- **Doğrulanmış:** Birbirinin ata/torunu olmayan **hiçbir iki kod iş paketinin** "Dokunabileceğin yollar" kümeleri örtüşmez (üretici betik bunu denetler); paylaşılan noktalar yalnız kural 6'daki ekleme-yalnız küresel izinlerdir.

**Şeritler (kart düzeyinde):**

| Şerit | Ne zaman başlar | Not |
|---|---|---|
| **Karar/hesap şeridi** (ürün sahibi) | Hemen (dalga 0–2) | K00-06 görünürlük, **K00-07 insan inceleyici**, K10-01/02, K11-01, K13-01, K14-01, K15-01, K17-01, K01-08 staging, K03-13 OAuth hesapları. Kod bunları beklemeden ilerler; karar kodu **yalnız ilgili iş paketi** başlamadan önce gerekir. |
| **Depo kuralları** | Hemen | K00-02 … K00-05 (şablonlar, CI iskeleti, main koruması) birbirinden bağımsız küçük işlerdir. |
| **K20 tasarım/içerik** | K00-01'den sonra, **kod hattından bağımsız** | Ürün sahibi işi (marka, fotoğraf, metin, onay). K07-01/02 K20-07'yi, K07-08 K20-06'yı bekler; en uzun belirsizlik burada. |
| **Temel hat** | K00 → K01 → K02 → K03 → K04 | Büyük ölçüde sıralıdır (ortak veri modeli). Kart içinde paralellik dalga tablosunda. **K02 ve K03 iş paketlerinin neredeyse tümü insan kapılıdır** → asıl takvim riski inceleme gecikmesi. |
| **Yönetim kabuğu** | K21-01…03 yalnız K03'e bağlı | K04/K05 ile **paralel** başlar. Takvim/komut ekranları (K21-04…) K05 uçlarını bekler. |
| **Rezervasyon ‖ Medya** | K04-10'dan sonra | K05 (rezervasyon, kapılı) ile K11 (medya temeli, kapılı) farklı modül alanlarındadır; **paralel**. |
| **Talep/teklif** | K05 + K03 sonrası | K06; K21 ekranlarıyla paralel. |
| **Site ‖ Düğünüm** | K06 sonrası | K07 (K20 onaylıysa) ve K08 paralel. Sonra K09 → K10 (zincir). |
| **Medya sonrası** | K11 (ve kendi önkoşulları) sonrası | K12, K13, K14, K15 ayrı ajanlara verilebilir; K15 kamu sözleşmeleri sabitken K11'i beklemez (K15-11 M4 kabulü hepsini bekler). |
| **Bütünleştirme** | K16 | Modül ajanlarının "bitti" raporu yerine geçmez; K16-11 uçtan uca senaryo. |
| **Kabul ve yayın** | K17 → K18 | Sıralı. K17-09 harici inceleme ve K18 ürün sahibi onayına bağlı. |

**İnsan inceleme beklerken** (§21.3): kapılı iş paketine bağımlı olmayan işler sürer, bağımlılar başlamaz. Bu yüzden inceleyenin **erken atanması** (K00-07) en yüksek kaldıraçlı tek karardır.

## 8. Kart özeti

| Kart | Başlık | Taşı | İP | S/M/L | Dalga aralığı | Kapı | Ürün sahibi |
|---|---|---|---|---|---|---|---|
| [K00](K00-depo-kurallari.md) | Depo ve çalışma kuralları | M0 | 7 | 6/1/0 | 0–2 | 0 | 3 |
| [K01](K01-iskelet.md) | Çalışan proje iskeleti | M0 | 9 | 3/6/0 | 1–6 | 0 | 1 |
| [K20](K20-tasarim-icerik.md) | Tasarım, marka ve içerik hazırlığı | M2 | 7 | 2/4/1 | 2–5 | 0 | 6 |
| [K02](K02-db-erisim-cekirdegi.md) | DB, alan temeli ve erişim çekirdeği | M0 | 8 | 1/6/1 | 6–11 | 7 | 0 |
| [K03](K03-kimlik-uyelik.md) | Kimlik ve kontrollü üyelik | M0 | 13 | 1/8/4 | 2–17 | 12 | 1 |
| [K04](K04-outbox-audit-isci.md) | Outbox, audit ve işçi temeli | M0 | 10 | 1/7/2 | 18–21 | 0 | 0 |
| [K05](K05-rezervasyon-motoru.md) | Rezervasyon motoru | M1 | 14 | 2/9/3 | 22–28 | 8 | 0 |
| [K21](K21-yonetim-kabugu-takvim.md) | Yönetim kabuğu ve operasyon takvimi | M1 | 7 | 1/4/2 | 18–29 | 0 | 1 |
| [K06](K06-talep-ziyaret-teklif.md) | Talep, ziyaret ve teklif akışı | M2 | 16 | 1/8/7 | 23–32 | 0 | 0 |
| [K07](K07-kurumsal-site-icerik.md) | Kurumsal site ve içerik | M2 | 10 | 1/4/5 | 7–33 | 0 | 1 |
| [K08](K08-dugunum-pano-onay.md) | Düğünüm, pano ve onaylar | M3 | 15 | 0/9/6 | 22–34 | 0 | 0 |
| [K09](K09-sohbet-canli-akis.md) | Özel sohbet ve canlı akış | M3 | 9 | 0/3/6 | 22–35 | 0 | 0 |
| [K10](K10-bildirim-eposta-sms.md) | Bildirim, e-posta ve SMS | M3 | 18 | 3/7/8 | 0–39 | 0 | 3 |
| [K11](K11-medya-temeli.md) | Güvenli dosya ve medya temeli | M4 | 16 | 1/3/12 | 2–34 | 5 | 1 |
| [K12](K12-galeri-oynatici.md) | Galeri ve oynatıcı | M4 | 6 | 0/2/4 | 24–30 | 0 | 0 |
| [K13](K13-davetiye-takvim.md) | İzinli davetiye ve takvim nüansı | M4 | 14 | 1/6/7 | 0–34 | 7 | 1 |
| [K14](K14-belge-odeme.md) | Belgeler ve ödeme takibi | M4 | 9 | 1/4/4 | 0–34 | 0 | 1 |
| [K15](K15-chatbot.md) | Sınırlı chatbot | M4 | 11 | 2/6/3 | 0–35 | 0 | 2 |
| [K16](K16-yonetim-butunlestirme.md) | Yönetim bütünleştirmesi | M5 | 11 | 0/4/7 | 21–39 | 2 | 0 |
| [K17](K17-staging-kabul.md) | Staging, güvenlik ve performans kabulü | M5 | 10 | 2/3/5 | 0–42 | 2 | 5 |
| [K18](K18-canliya-gecis.md) | İçerik geçişi ve kontrollü yayın | M5 | 7 | 2/3/2 | 43–48 | 0 | 6 |
| [K19](K19-sonraki-surum.md) | Sonraki sürüm paketleri | M5 | 0 | — | — | — | — |

## 9. İnsan inceleme kapılı iş paketleri (§21.3)

PR'ları "ajan olmayan, yazılım güvenliği deneyimli bir insan" onaylamadan birleşmez. Bu iş paketlerine bağımlı işler kapı geçilene dek bekler.

**K02 — DB, alan temeli ve erişim çekirdeği**

- [K02-01](K02-db-erisim-cekirdegi.md#K02-01) · packages/db iskeleti, roller ve migration altyapısı
- [K02-02](K02-db-erisim-cekirdegi.md#K02-02) · Çekirdek şema: organization, alan, kaynak, seans şablonu
- [K02-03](K02-db-erisim-cekirdegi.md#K02-03) · Kimlik ve personel üyelik şeması
- [K02-04](K02-db-erisim-cekirdegi.md#K02-04) · Event, üyelik ve davet şeması
- [K02-05](K02-db-erisim-cekirdegi.md#K02-05) · ActorContext, DAL çekirdeği ve AuditSink portu
- [K02-06](K02-db-erisim-cekirdegi.md#K02-06) · RLS politikaları ve dar SECURITY DEFINER yardımcıları
- [K02-07](K02-db-erisim-cekirdegi.md#K02-07) · İki işletme/iki düğün fixture'ı ve çekirdek T-08/T-10 testleri

**K03 — Kimlik ve kontrollü üyelik**

- [K03-01](K03-kimlik-uyelik.md#K03-01) · Better Auth erken doğrulama ve ADR (iki instance, oturum önbelleği)
- [K03-02](K03-kimlik-uyelik.md#K03-02) · Müşteri kimliği: Better Auth instance'ı + Google
- [K03-03](K03-kimlik-uyelik.md#K03-03) · Facebook, Apple ve güvenli hesap bağlama
- [K03-04](K03-kimlik-uyelik.md#K03-04) · Personel kimliği: ayrı instance, parola + TOTP + kurtarma kodları
- [K03-05](K03-kimlik-uyelik.md#K03-05) · İlk personel kurulumu (bootstrap) ve personel daveti
- [K03-06](K03-kimlik-uyelik.md#K03-06) · Oturumdan ActorContext üretimi ve sunucu guard'ları
- [K03-07](K03-kimlik-uyelik.md#K03-07) · Giriş katmanı: origin/CSRF, şema doğrulama, toplu atama koruması, hız limiti ilkeli
- [K03-08](K03-kimlik-uyelik.md#K03-08) · consent_record ve hukuki metin sürüm kaydı
- [K03-09](K03-kimlik-uyelik.md#K03-09) · Düğün daveti kabulü (kanal kanıtı)
- [K03-10](K03-kimlik-uyelik.md#K03-10) · Telefon doğrulama portu ve OTP/SMS istismar korumaları
- [K03-11](K03-kimlik-uyelik.md#K03-11) · Oturum yönetimi, hesabı kilitleme ve hesap kurtarma
- [K03-12](K03-kimlik-uyelik.md#K03-12) · Kimlik test paketi ve Better Auth yükseltme CI işi

**K05 — Rezervasyon motoru**

- [K05-03](K05-rezervasyon-motoru.md#K05-03) · Rezervasyon şeması: booking, allocation, kapanış, durum geçmişi, exclusion constraint
- [K05-05](K05-rezervasyon-motoru.md#K05-05) · Transaction çatısı: kilit sırası, karar zamanı, süre dolumu, hata eşlemesi, test fixture'ları
- [K05-06](K05-rezervasyon-motoru.md#K05-06) · Tutma komutu (hold)
- [K05-07](K05-rezervasyon-motoru.md#K05-07) · Kesinleştirme ve iptal komutları (confirm/cancel) + ConfirmationGate portu
- [K05-08](K05-rezervasyon-motoru.md#K05-08) · Tarih/alan taşıma komutu (reschedule)
- [K05-09](K05-rezervasyon-motoru.md#K05-09) · Tutma süre dolumu işi ve uzatma komutu
- [K05-13](K05-rezervasyon-motoru.md#K05-13) · Eşzamanlılık test paketi (T-01–T-07, T-38)
- [K05-14](K05-rezervasyon-motoru.md#K05-14) · Kabul raporu, performans ölçümü ve insan inceleme paketi

**K11 — Güvenli dosya ve medya temeli**

- [K11-06](K11-medya-temeli.md#K11-06) · Upload intent API: yetki, kota, MIME, boyutu zorlayan izin
- [K11-07](K11-medya-temeli.md#K11-07) · Yükleme tamamlama: HEAD boyut doğrulaması, MIME/imza kontrolü, süre dolumu temizliği
- [K11-09](K11-medya-temeli.md#K11-09) · İzole medya işçisi iskeleti ve ClamAV servisi (taranamayan dosya ready olmaz)
- [K11-12](K11-medya-temeli.md#K11-12) · Özel medya geçidi: yetki, byte streaming, HLS/Range/HEAD, erişim politikası kaydı
- [K11-16](K11-medya-temeli.md#K11-16) · K11 güvenlik/kabul paketi: T-08, T-23, T-24, T-25, T-39 ve T-09 (video)

**K13 — İzinli davetiye ve takvim nüansı**

- [K13-03](K13-davetiye-takvim.md#K13-03) · Yayın şeması: invitation_publication, publication_version, publication_consent
- [K13-04](K13-davetiye-takvim.md#K13-04) · Yayın use-case'leri: taslak, sürüm, gerekli onaylar, durum geçişleri
- [K13-05](K13-davetiye-takvim.md#K13-05) · Onay endpoint'i ve geri alma: POST /api/publications/:id/consents
- [K13-06](K13-davetiye-takvim.md#K13-06) · Yayın medyası: 'izinli davetiye dosyası' sınıfı ve erişim politikası
- [K13-07](K13-davetiye-takvim.md#K13-07) · Kamu davetiye sayfası: GET /davetiye/:publicId ve link_only token
- [K13-09](K13-davetiye-takvim.md#K13-09) · İptal ve süre dolumu: yayın kapatma, cache temizliği, medya erişimi
- [K13-14](K13-davetiye-takvim.md#K13-14) · K13 güvenlik/kabul paketi ve rapor (T-15, T-16, T-17)

**K16 — Yönetim bütünleştirmesi**

- [K16-06](K16-yonetim-butunlestirme.md#K16-06) · KVKK başvuru ekranı: veri talepleri, süre sayacı ve silme yürütücüsü
- [K16-10](K16-yonetim-butunlestirme.md#K16-10) · Yetki sınırı denetimi: rota/uç ↔ izin kaydı eşleşmesi ve yetkisiz personel matrisi

**K17 — Staging, güvenlik ve performans kabulü**

- [K17-03](K17-staging-kabul.md#K17-03) · Geri yükleme tatbikatı: DB restore, RPO/RTO ölçümü, T-29 ve T-40 kanıtı
- [K17-09](K17-staging-kabul.md#K17-09) · Bağımsız harici güvenlik incelemesi ve bulgu kapatma

## 10. Ürün sahibi girdisi bekleyen iş paketleri

Ajan bunları uyduramaz; ürün sahibi karar/hesap/içerik/onay verir (veya entegratör sorar). Kararlar `docs/adr/` veya ilgili rapora yazılır; hesap/sır içeren hiçbir şey repoya girmez.

**K00 — Depo ve çalışma kuralları**

- [K00-05](K00-depo-kurallari.md#K00-05) · main koruması (PR + CI) ve durum raporu
- [K00-06](K00-depo-kurallari.md#K00-06) · Depo görünürlüğü kararı (public / private)
- [K00-07](K00-depo-kurallari.md#K00-07) · İnsan inceleyicinin atanması (§21.3 kapıları)

**K01 — Çalışan proje iskeleti**

- [K01-08](K01-iskelet.md#K01-08) · Staging hosting seçimi ve hesabı

**K03 — Kimlik ve kontrollü üyelik**

- [K03-13](K03-kimlik-uyelik.md#K03-13) · OAuth sağlayıcı hesapları ve staging callback kayıtları

**K07 — Kurumsal site ve içerik**

- [K07-10](K07-kurumsal-site-icerik.md#K07-10) · M2 kabulü: ürün sahibi genel site, talep, teklif ve davet akışını dener

**K10 — Bildirim, e-posta ve SMS**

- [K10-01](K10-bildirim-eposta-sms.md#K10-01) · Karar: SMS ve e-posta sağlayıcı seçimi
- [K10-02](K10-bildirim-eposta-sms.md#K10-02) · Sağlayıcı hesapları, test alıcıları ve staging yapılandırması
- [K10-18](K10-bildirim-eposta-sms.md#K10-18) · M3 kabulü: ürün sahibi Düğünüm, onay, sohbet ve bildirimleri test alıcılarıyla dener

**K11 — Güvenli dosya ve medya temeli**

- [K11-01](K11-medya-temeli.md#K11-01) · Karar: nesne depolama sağlayıcısı, bölge ve staging bucket'ları

**K13 — İzinli davetiye ve takvim nüansı**

- [K13-01](K13-davetiye-takvim.md#K13-01) · Karar: yayın onayı kapsamı, kullanım hakkı süreci ve varsayılan süre

**K14 — Belgeler ve ödeme takibi**

- [K14-01](K14-belge-odeme.md#K14-01) · Karar: KDV oranları, para birimi ve fatura referans süreci

**K15 — Sınırlı chatbot**

- [K15-01](K15-chatbot.md#K15-01) · Karar: LLM sağlayıcısı, bütçe tavanı ve chatbot'un açılması
- [K15-11](K15-chatbot.md#K15-11) · M4 kabulü: ürün sahibi galeri, davetiye, belge/ödeme ve chatbot'u dener

**K17 — Staging, güvenlik ve performans kabulü**

- [K17-01](K17-staging-kabul.md#K17-01) · Karar: bağımsız harici güvenlik inceleyicisi ve kapsam
- [K17-06](K17-staging-kabul.md#K17-06) · Gerçek sağlayıcı sandbox kabulü: SMS, e-posta, OAuth, depolama (test alıcılarıyla)
- [K17-08](K17-staging-kabul.md#K17-08) · Maliyet raporu ve KVKK kontrol listesi
- [K17-09](K17-staging-kabul.md#K17-09) · Bağımsız harici güvenlik incelemesi ve bulgu kapatma
- [K17-10](K17-staging-kabul.md#K17-10) · Bakım sahipliği teyidi ve K17 kapanış raporu (yayın kapısı değerlendirmesi)

**K18 — İçerik geçişi ve kontrollü yayın**

- [K18-01](K18-canliya-gecis.md#K18-01) · Yayın onayı, canlıya geçiş tarihi ve kesinti toleransı kararı
- [K18-02](K18-canliya-gecis.md#K18-02) · Üretim ortamı, sırlar ve provider üretim ayarları
- [K18-03](K18-canliya-gecis.md#K18-03) · Onaylı içerik ve URL aktarımı (staging'e) ve yönlendirme planı doğrulaması
- [K18-05](K18-canliya-gecis.md#K18-05) · Canlıya geçiş öncesi kapı kontrolü ve smoke test planı (üretim, DNS'den önce)
- [K18-06](K18-canliya-gecis.md#K18-06) · DNS/TLS geçişi, üretim içerik aktarımı ve canlı smoke test
- [K18-07](K18-canliya-gecis.md#K18-07) · Geçiş sonrası izleme ve ilk hafta kapanış raporu

**K20 — Tasarım, marka ve içerik hazırlığı**

- [K20-01](K20-tasarim-icerik.md#K20-01) · Marka varlıkları ile fotoğraf/video envanteri
- [K20-03](K20-tasarim-icerik.md#K20-03) · Tasarım sistemi: renk, tipografi, bileşen tokenları
- [K20-04](K20-tasarim-icerik.md#K20-04) · Kritik ekran akışları ve onaylı maketler
- [K20-05](K20-tasarim-icerik.md#K20-05) · Sayfa metinleri ve SSS içeriği
- [K20-06](K20-tasarim-icerik.md#K20-06) · Hukuki metin taslakları (gizlilik, çerez, aydınlatma, açık rıza)
- [K20-07](K20-tasarim-icerik.md#K20-07) · Çekim planı ve K20 kabul raporu (K07 başlatma onayı)

**K21 — Yönetim kabuğu ve operasyon takvimi**

- [K21-07](K21-yonetim-kabugu-takvim.md#K21-07) · M1 kabulü: ürün sahibi staging'de personel girişi, takvim, hold ve kesinleştirme

## 11. Entegratör (yönetici) nasıl işletir

- **Kaynak:** `docs/Proje.md` şartname → bu dizin planı → GitHub issue'ları (iş paketi başına bir issue, `docs/plan/<kart>.md#<İP>` bağlantılı).
- **Etiketler:** `iş-paketi`, `kart:Kxx`, `boyut:S|M|L`, `tür:…`, `kapı:insan-inceleme`, `girdi:ürün-sahibi`, `migration`, `durum:hazır|devam|inceleme|engelli`, `plan-sorunu`, `takip`.
- **Kilometre taşları:** M0–M5 (milestone) + her biri için tek takip issue'su (iş paketi kontrol listesi, dalga sırasıyla).
- **Sıra:** Birleştirme sırası ve migration sırası entegratördedir. Bir iş paketi kapanınca bağımlıları `durum:hazır`a alınır.
- **Ajan atama:** Aynı anda çalışan ajanlara dalga tablosundan **birbirine bağımlı olmayan ve yolları örtüşmeyen** iş paketleri verilir; her biri ayrı dal ve ayrı çalışma dizini.
- **Önyükleme istisnası:** K00-05 (`main` koruması) bitene dek plan/doküman güncellemeleri doğrudan `main`'e itilebilir (force-push asla); sonrasında her değişiklik PR'dır.
- **GitHub Projects panosu yok:** Kullanılan token'ın kapsamında Projects v2 yok; takip issue/etiket/milestone ile yapılır. (Pano istenirse token kapsamı eklendikten sonra kurulur.)
- **Depo görünürlüğü:** Karar K00-06'dadır. Bu plan görünürlüğü değiştirmez; depo public kabul edilerek çalışılır (sır/müşteri verisi/ayrıntılı açık notu yok).

## 12. Dalga tablosu ve kritik yol

## Dalga tablosu (otomatik üretildi)

Dalga = bağımlılık derinliği. Aynı dalgadaki işler birbirine bağımlı değildir; **bağımlılıkları `main`'e birleşmiş** her iş başlayabilir. `yol çakışması` işaretli çiftler aynı dosya alanına dokunur, sırayla yapılmalıdır. `M` = migration içerir (birleştirme sırası kuralı), `İ` = insan inceleme kapısı, `Ü` = ürün sahibi girdisi bekler, `D` = kod olmayan iş (doküman/karar/hesap).

### Dalga 0 (8 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K00-01](K00-depo-kurallari.md#K00-01) | Şartnameyi docs/ altına taşı, AGENTS.md ve plan dizinini yaz | M | D |  |
| [K00-06](K00-depo-kurallari.md#K00-06) | Depo görünürlüğü kararı (public / private) | S | ÜD |  |
| [K00-07](K00-depo-kurallari.md#K00-07) | İnsan inceleyicinin atanması (§21.3 kapıları) | S | ÜD |  |
| [K10-01](K10-bildirim-eposta-sms.md#K10-01) | Karar: SMS ve e-posta sağlayıcı seçimi | S | ÜD |  |
| [K13-01](K13-davetiye-takvim.md#K13-01) | Karar: yayın onayı kapsamı, kullanım hakkı süreci ve varsayılan süre | S | ÜD |  |
| [K14-01](K14-belge-odeme.md#K14-01) | Karar: KDV oranları, para birimi ve fatura referans süreci | S | ÜD |  |
| [K15-01](K15-chatbot.md#K15-01) | Karar: LLM sağlayıcısı, bütçe tavanı ve chatbot'un açılması | S | ÜD |  |
| [K17-01](K17-staging-kabul.md#K17-01) | Karar: bağımsız harici güvenlik inceleyicisi ve kapsam | S | ÜD |  |

### Dalga 1 (4 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K00-02](K00-depo-kurallari.md#K00-02) | PR şablonu, issue şablonları, CODEOWNERS, SECURITY.md | S | D |  |
| [K00-03](K00-depo-kurallari.md#K00-03) | ADR şablonu ve docs düzeni | S | D |  |
| [K00-04](K00-depo-kurallari.md#K00-04) | Temel CI iskeleti (sır taraması, markdown/bağlantı, yer tutucu kontroller) | S | D |  |
| [K01-08](K01-iskelet.md#K01-08) | Staging hosting seçimi ve hesabı | S | ÜD |  |

### Dalga 2 (8 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K00-05](K00-depo-kurallari.md#K00-05) | main koruması (PR + CI) ve durum raporu | S | ÜD |  |
| [K01-01](K01-iskelet.md#K01-01) | pnpm workspace ve TypeScript/lint temeli | M |  |  |
| [K20-01](K20-tasarim-icerik.md#K20-01) | Marka varlıkları ile fotoğraf/video envanteri | M | ÜD |  |
| [K20-02](K20-tasarim-icerik.md#K20-02) | Mevcut site içeriği ve URL envanteri | S | D |  |
| [K20-06](K20-tasarim-icerik.md#K20-06) | Hukuki metin taslakları (gizlilik, çerez, aydınlatma, açık rıza) | M | ÜD |  |
| [K03-13](K03-kimlik-uyelik.md#K03-13) | OAuth sağlayıcı hesapları ve staging callback kayıtları | M | ÜD |  |
| [K10-02](K10-bildirim-eposta-sms.md#K10-02) | Sağlayıcı hesapları, test alıcıları ve staging yapılandırması | M | ÜD |  |
| [K11-01](K11-medya-temeli.md#K11-01) | Karar: nesne depolama sağlayıcısı, bölge ve staging bucket'ları | S | ÜD |  |

### Dalga 3 (5 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K01-02](K01-iskelet.md#K01-02) | apps/web: minimal Next.js, sağlık ucu, baz güvenlik başlıkları | M |  |  |
| [K01-03](K01-iskelet.md#K01-03) | apps/worker ve apps/media-worker: minimal süreçler ve sağlık kontrolü | S |  |  |
| [K01-04](K01-iskelet.md#K01-04) | Ortam değişkeni şeması ve development/staging ayrımı | S |  |  |
| [K20-03](K20-tasarim-icerik.md#K20-03) | Tasarım sistemi: renk, tipografi, bileşen tokenları | M | ÜD |  |
| [K20-05](K20-tasarim-icerik.md#K20-05) | Sayfa metinleri ve SSS içeriği | M | ÜD |  |

### Dalga 4 (3 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K01-05](K01-iskelet.md#K01-05) | Sağlayıcı portları ve fake adaptörler (SMS, e-posta, asistan) | M |  |  |
| [K01-07](K01-iskelet.md#K01-07) | Container imajları (non-root, sabit sürüm, health) | M |  |  |
| [K20-04](K20-tasarim-icerik.md#K20-04) | Kritik ekran akışları ve onaylı maketler | L | ÜD |  |

### Dalga 5 (2 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K01-06](K01-iskelet.md#K01-06) | Test altyapısı ve tam CI (lint, typecheck, test, build, gerçek PostgreSQL) | M |  |  |
| [K20-07](K20-tasarim-icerik.md#K20-07) | Çekim planı ve K20 kabul raporu (K07 başlatma onayı) | S | ÜD |  |

### Dalga 6 (2 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K01-09](K01-iskelet.md#K01-09) | Staging'e otomatik dağıtım (yalnız health + sürüm) | M |  |  |
| [K02-01](K02-db-erisim-cekirdegi.md#K02-01) | packages/db iskeleti, roller ve migration altyapısı | M | Mİ |  |

### Dalga 7 (3 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K02-02](K02-db-erisim-cekirdegi.md#K02-02) | Çekirdek şema: organization, alan, kaynak, seans şablonu | M | Mİ |  |
| [K02-05](K02-db-erisim-cekirdegi.md#K02-05) | ActorContext, DAL çekirdeği ve AuditSink portu | M | İ |  |
| [K07-01](K07-kurumsal-site-icerik.md#K07-01) | Site iskeleti: server-first düzen, güvenlik başlıkları, JS bütçesi denetimi | M |  |  |

### Dalga 8 (2 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K02-03](K02-db-erisim-cekirdegi.md#K02-03) | Kimlik ve personel üyelik şeması | M | Mİ |  |
| [K07-08](K07-kurumsal-site-icerik.md#K07-08) | Hukuki sayfalar ve çerez/analitik tercihi | M |  |  |

### Dalga 9 (1 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K02-04](K02-db-erisim-cekirdegi.md#K02-04) | Event, üyelik ve davet şeması | M | Mİ |  |

### Dalga 10 (2 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K02-06](K02-db-erisim-cekirdegi.md#K02-06) | RLS politikaları ve dar SECURITY DEFINER yardımcıları | L | Mİ |  |
| [K02-08](K02-db-erisim-cekirdegi.md#K02-08) | Veri envanteri iskeleti ve CI denetimi (PRIV-01) | S |  |  |

### Dalga 11 (1 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K02-07](K02-db-erisim-cekirdegi.md#K02-07) | İki işletme/iki düğün fixture'ı ve çekirdek T-08/T-10 testleri | M | İ |  |

### Dalga 12 (1 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K03-01](K03-kimlik-uyelik.md#K03-01) | Better Auth erken doğrulama ve ADR (iki instance, oturum önbelleği) | M | İ |  |

### Dalga 13 (2 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K03-02](K03-kimlik-uyelik.md#K03-02) | Müşteri kimliği: Better Auth instance'ı + Google | L | Mİ |  |
| [K03-04](K03-kimlik-uyelik.md#K03-04) | Personel kimliği: ayrı instance, parola + TOTP + kurtarma kodları | L | Mİ |  |

### Dalga 14 (3 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K03-03](K03-kimlik-uyelik.md#K03-03) | Facebook, Apple ve güvenli hesap bağlama | M | İ |  |
| [K03-05](K03-kimlik-uyelik.md#K03-05) | İlk personel kurulumu (bootstrap) ve personel daveti | M | Mİ |  |
| [K03-06](K03-kimlik-uyelik.md#K03-06) | Oturumdan ActorContext üretimi ve sunucu guard'ları | M | İ |  |

### Dalga 15 (3 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K03-07](K03-kimlik-uyelik.md#K03-07) | Giriş katmanı: origin/CSRF, şema doğrulama, toplu atama koruması, hız limiti ilkeli | L | Mİ |  |
| [K03-08](K03-kimlik-uyelik.md#K03-08) | consent_record ve hukuki metin sürüm kaydı | S | Mİ |  |
| [K03-11](K03-kimlik-uyelik.md#K03-11) | Oturum yönetimi, hesabı kilitleme ve hesap kurtarma | M | İ |  |

### Dalga 16 (2 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K03-09](K03-kimlik-uyelik.md#K03-09) | Düğün daveti kabulü (kanal kanıtı) | L | Mİ |  |
| [K03-10](K03-kimlik-uyelik.md#K03-10) | Telefon doğrulama portu ve OTP/SMS istismar korumaları | M | Mİ |  |

### Dalga 17 (1 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K03-12](K03-kimlik-uyelik.md#K03-12) | Kimlik test paketi ve Better Auth yükseltme CI işi | M | İ |  |

### Dalga 18 (7 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K04-01](K04-outbox-audit-isci.md#K04-01) | pg-boss transaction katılımı değerlendirmesi ve ADR | M |  |  |
| [K04-02](K04-outbox-audit-isci.md#K04-02) | Domain olay zarfı ve sürümlü olay sözleşmeleri | S |  |  |
| [K04-04](K04-outbox-audit-isci.md#K04-04) | Idempotency kayıtları ve komut sarmalayıcısı | M | M |  |
| [K04-06](K04-outbox-audit-isci.md#K04-06) | Audit: append-only kayıt ve AuditSink'in gerçek yazıcıya bağlanması | M | M |  |
| [K04-07](K04-outbox-audit-isci.md#K04-07) | Gözlemlenebilirlik: yapılandırılmış log, redaksiyon, correlation id | M |  |  |
| [K04-08](K04-outbox-audit-isci.md#K04-08) | deletion_ledger ve yeniden uygulama iskeleti | M | M |  |
| [K21-01](K21-yonetim-kabugu-takvim.md#K21-01) | UI paketi: nötr yönetim teması ve durum bileşenleri | M |  |  |

### Dalga 19 (3 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K04-03](K04-outbox-audit-isci.md#K04-03) | Outbox tablosu, yazma yardımcısı ve dispatcher | L | M |  |
| [K04-09](K04-outbox-audit-isci.md#K04-09) | İlgili kişi başvurusu: data_subject_request ve süre sayacı | M | M |  |
| [K21-02](K21-yonetim-kabugu-takvim.md#K21-02) | Personel giriş ekranları: parola, TOTP, kurtarma kodu, bootstrap/davet tamamlama | M |  |  |

### Dalga 20 (2 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K04-05](K04-outbox-audit-isci.md#K04-05) | İşçi çerçevesi: pg-boss, handler sarmalayıcı, retry ve failed jobs | L | M |  |
| [K21-03](K21-yonetim-kabugu-takvim.md#K21-03) | Yönetim kabuğu: düzen, AdminNavigation, izne göre menü, oturum davranışı | M |  |  |

### Dalga 21 (4 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K04-10](K04-outbox-audit-isci.md#K04-10) | Dayanıklılık testleri: çökme, yeniden oynatma ve sahte sağlayıcı kanıtı | M |  |  |
| [K16-01](K16-yonetim-butunlestirme.md#K16-01) | Personel ve izin yönetimi: StaffMembers, rol paketleri ve izin matrisi | L |  |  |
| [K16-02](K16-yonetim-butunlestirme.md#K16-02) | SessionRevocation: oturum görünümü, uzaktan iptal, hesap kilitleme ve yeniden doğrulama | M |  |  |
| [K16-03](K16-yonetim-butunlestirme.md#K16-03) | AuditViewer: denetim kaydı arama, filtre ve güvenli dışa aktarım | M |  |  |

### Dalga 22 (7 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K05-01](K05-rezervasyon-motoru.md#K05-01) | Rezervasyon sözleşmeleri: komutlar, DTO'lar, hata kodları | S |  |  |
| [K07-02](K07-kurumsal-site-icerik.md#K07-02) | İçerik modeli: sayfa, revizyon, SSS (taslak/yayın) ve yayın tetikleme | L | M |  |
| [K08-01](K08-dugunum-pano-onay.md#K08-01) | Sözleşmeler ve domain: pano, görev, onay (durum makineleri, sınırlı zengin metin) | M |  |  |
| [K09-01](K09-sohbet-canli-akis.md#K09-01) | Sözleşmeler ve ADR: SSE protokolü, realtime inbox, LISTEN topolojisi | M |  |  |
| [K10-03](K10-bildirim-eposta-sms.md#K10-03) | Sözleşmeler ve ADR: delivery durum makinesi, şablon, tekilleştirme anahtarı | M |  |  |
| [K11-02](K11-medya-temeli.md#K11-02) | Sözleşmeler ve ADR: ObjectStorage portu, medya durumları, limitler, yükleme yöntemi | M |  |  |
| [K16-05](K16-yonetim-butunlestirme.md#K16-05) | AccessReview: üç aylık erişim gözden geçirme ve kullanılmayan erişim temizliği | M | M |  |

### Dalga 23 (11 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K05-02](K05-rezervasyon-motoru.md#K05-02) | Zaman modeli: [başlangıç, bitiş), tampon, timezone, çalışma kuralı (domain) | M |  |  |
| [K05-03](K05-rezervasyon-motoru.md#K05-03) | Rezervasyon şeması: booking, allocation, kapanış, durum geçmişi, exclusion constraint | L | Mİ |  |
| [K06-01](K06-talep-ziyaret-teklif.md#K06-01) | Sözleşmeler ve durum makineleri: talep, randevu, teklif (domain) | M |  |  |
| [K07-03](K07-kurumsal-site-icerik.md#K07-03) | Yönetim: içerik editörü, SSS ve SEO alanları ekranları | L |  |  |
| [K07-04](K07-kurumsal-site-icerik.md#K07-04) | Ana sayfa ve kurumsal sayfalar (onaylı maketlere göre) | L |  |  |
| [K10-04](K10-bildirim-eposta-sms.md#K10-04) | Bildirim şeması: tercih, bildirim, delivery, bastırma, webhook alındısı | M | M |  |
| [K10-05](K10-bildirim-eposta-sms.md#K10-05) | Güvenli şablon sistemi, SMS segment/ücret tahmini | M |  |  |
| [K11-03](K11-medya-temeli.md#K11-03) | Medya şeması: media_asset, media_variant, upload_intent, retention_policy, media_restore_job | L | M |  |
| [K11-04](K11-medya-temeli.md#K11-04) | S3 uyumlu depolama adaptörü (yerel S3 uyumlu servisle test) | L |  |  |
| [K13-02](K13-davetiye-takvim.md#K13-02) | Sözleşmeler ve ADR: publication DTO'ları, durum makinesi, izinli alan allowlist, paylaşım token'ı | M |  |  |
| [K15-02](K15-chatbot.md#K15-02) | Sözleşmeler: AssistantProvider genişletme, tool şemaları, /api/assistant/message DTO'ları | M |  |  |

### Dalga 24 (13 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K05-04](K05-rezervasyon-motoru.md#K05-04) | Alan/kaynak/seans yapılandırma use-case'leri ve yalnız-dev seed | M |  |  |
| [K05-05](K05-rezervasyon-motoru.md#K05-05) | Transaction çatısı: kilit sırası, karar zamanı, süre dolumu, hata eşlemesi, test fixture'ları | L | İ |  |
| [K06-02](K06-talep-ziyaret-teklif.md#K06-02) | Talep ve randevu şeması; allocation sahibi olarak appointment | M | M |  |
| [K06-07](K06-talep-ziyaret-teklif.md#K06-07) | Teklif şeması: offer, sürüm ve satırlar | M | M |  |
| [K07-07](K07-kurumsal-site-icerik.md#K07-07) | SEO, yapılandırılmış veri, sitemap ve yönlendirme planı | M |  |  |
| [K11-05](K11-medya-temeli.md#K11-05) | Staging bucket yapılandırması: IAM ayrımı, anonim liste kapalı, yaşam döngüsü | M |  |  |
| [K11-06](K11-medya-temeli.md#K11-06) | Upload intent API: yetki, kota, MIME, boyutu zorlayan izin | L | İ |  |
| [K11-12](K11-medya-temeli.md#K11-12) | Özel medya geçidi: yetki, byte streaming, HLS/Range/HEAD, erişim politikası kaydı | L | İ |  |
| [K12-01](K12-galeri-oynatici.md#K12-01) | Albüm şeması: album, album_item ve kurumsal yayın durumu | M | M |  |
| [K13-03](K13-davetiye-takvim.md#K13-03) | Yayın şeması: invitation_publication, publication_version, publication_consent | L | Mİ |  |
| [K14-02](K14-belge-odeme.md#K14-02) | Sözleşmeler: para/KDV hesabı, belge ve ödeme DTO'ları, finans izinleri | M |  |  |
| [K15-03](K15-chatbot.md#K15-03) | Onaylı bilgi kaynağı ve kontrollü retrieval (vector DB yok) | L | M |  |
| [K15-05](K15-chatbot.md#K15-05) | Gerçek sağlayıcı adaptörü: sunucu tarafı çağrı, zaman aşımı, log maskeleme | M |  |  |

### Dalga 25 (14 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K05-06](K05-rezervasyon-motoru.md#K05-06) | Tutma komutu (hold) | M | İ |  |
| [K05-07](K05-rezervasyon-motoru.md#K05-07) | Kesinleştirme ve iptal komutları (confirm/cancel) + ConfirmationGate portu | M | İ |  |
| [K05-08](K05-rezervasyon-motoru.md#K05-08) | Tarih/alan taşıma komutu (reschedule) | M | İ |  |
| [K05-09](K05-rezervasyon-motoru.md#K05-09) | Tutma süre dolumu işi ve uzatma komutu | M | İ |  |
| [K05-10](K05-rezervasyon-motoru.md#K05-10) | Anonim uygunluk sorgusu ve DTO'su | M |  |  |
| [K05-12](K05-rezervasyon-motoru.md#K05-12) | Operasyon takvimi okuma ucu (personel DTO'su) | M |  |  |
| [K06-03](K06-talep-ziyaret-teklif.md#K06-03) | Public talep ve iletişim uçları: spam, hız limiti, kopya eşleme | L |  |  |
| [K06-05](K06-talep-ziyaret-teklif.md#K06-05) | Personel talep yönetimi use-case'leri | M |  |  |
| [K06-06](K06-talep-ziyaret-teklif.md#K06-06) | Ziyaret randevusu: talep, onay ve kaynak çakışma kontrolü | L |  |  |
| [K11-07](K11-medya-temeli.md#K11-07) | Yükleme tamamlama: HEAD boyut doğrulaması, MIME/imza kontrolü, süre dolumu temizliği | L | İ |  |
| [K11-13](K11-medya-temeli.md#K11-13) | Arşiv adaptörü ve geri çağırma işi (fake adaptörle) | L |  |  |
| [K13-04](K13-davetiye-takvim.md#K13-04) | Yayın use-case'leri: taslak, sürüm, gerekli onaylar, durum geçişleri | L | İ |  |
| [K14-03](K14-belge-odeme.md#K14-03) | Belge şeması: document, document_version, erişim grubu | M | M |  |
| [K14-04](K14-belge-odeme.md#K14-04) | Ödeme şeması: payment_schedule, payment_entry (append-only), KDV ve fatura referansı | M | M |  |

### Dalga 26 (13 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K05-11](K05-rezervasyon-motoru.md#K05-11) | Admin booking uçları: hold, confirm, cancel, reschedule, extend | M |  |  |
| [K21-04](K21-yonetim-kabugu-takvim.md#K21-04) | OperationsCalendar: ay/hafta/liste görünümleri | L |  |  |
| [K06-04](K06-talep-ziyaret-teklif.md#K06-04) | Talep sahiplenme: doğrulanmış kanal kanıtıyla müşteri hesabına bağlama | M |  |  |
| [K06-12](K06-talep-ziyaret-teklif.md#K06-12) | Personel ekranı: LeadPipeline ve talep detayı | L |  |  |
| [K06-13](K06-talep-ziyaret-teklif.md#K06-13) | Personel ekranı: ziyaret randevuları | M |  |  |
| [K07-05](K07-kurumsal-site-icerik.md#K07-05) | Uygunluk arayüzü: SpaceSelector, AvailabilityCalendar, SlotList | L |  |  |
| [K07-06](K07-kurumsal-site-icerik.md#K07-06) | Talep, ziyaret ve iletişim formları | L |  |  |
| [K11-08](K11-medya-temeli.md#K11-08) | Büyük dosya: çok parçalı, devam ettirilebilir yükleme | L |  |  |
| [K11-09](K11-medya-temeli.md#K11-09) | İzole medya işçisi iskeleti ve ClamAV servisi (taranamayan dosya ready olmaz) | L | İ |  |
| [K13-05](K13-davetiye-takvim.md#K13-05) | Onay endpoint'i ve geri alma: POST /api/publications/:id/consents | M | İ |  |
| [K14-05](K14-belge-odeme.md#K14-05) | Belge use-case'leri: sürüm, erişim grubu ve medya geçidi politikası | L |  |  |
| [K15-04](K15-chatbot.md#K15-04) | Tool yürütücü ve güvenlik katmanı: allowlist, parametre doğrulama, injection direnci | L |  |  |
| [K16-06](K16-yonetim-butunlestirme.md#K16-06) | KVKK başvuru ekranı: veri talepleri, süre sayacı ve silme yürütücüsü | L | İ |  |

### Dalga 27 (9 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K05-13](K05-rezervasyon-motoru.md#K05-13) | Eşzamanlılık test paketi (T-01–T-07, T-38) | L | İ |  |
| [K21-05](K21-yonetim-kabugu-takvim.md#K21-05) | Hold, kesinleştirme, iptal ve uzatma ekranları | L |  |  |
| [K06-08](K06-talep-ziyaret-teklif.md#K06-08) | Teklif use-case'leri: hazırlama, gönderme, müşteri kabulü, süre dolumu | L |  |  |
| [K07-09](K07-kurumsal-site-icerik.md#K07-09) | Site performans, erişilebilirlik ve kamu API sızıntı denetimi | M |  |  |
| [K11-10](K11-medya-temeli.md#K11-10) | Fotoğraf işleme: decoder doğrulaması, bomba limiti, türevler, EXIF/GPS temizliği | L |  |  |
| [K11-11](K11-medya-temeli.md#K11-11) | Video işleme: HLS katmanları, poster, altyazı, limitler | L |  |  |
| [K13-08](K13-davetiye-takvim.md#K13-08) | Uygunluk DTO'suna izinli ipucu: publicPublicationId | M |  |  |
| [K15-06](K15-chatbot.md#K15-06) | Oturum limitleri ve maliyet bütçesi: asistan kullanım kaydı, tavan, kapatma anahtarı | M | M |  |
| [K17-03](K17-staging-kabul.md#K17-03) | Geri yükleme tatbikatı: DB restore, RPO/RTO ölçümü, T-29 ve T-40 kanıtı | L | İ |  |

### Dalga 28 (8 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K05-14](K05-rezervasyon-motoru.md#K05-14) | Kabul raporu, performans ölçümü ve insan inceleme paketi | S | İD |  |
| [K21-06](K21-yonetim-kabugu-takvim.md#K21-06) | Arayüz üzerinden T-01–T-07 ve erişilebilirlik/mobil kontrol | M |  |  |
| [K06-09](K06-talep-ziyaret-teklif.md#K06-09) | Kesinleştirme kontrol listesi (ConfirmationGate gerçeklemesi) | M | M |  |
| [K11-14](K11-medya-temeli.md#K11-14) | Yönetim ekranı: MediaLibrary ve yükleme bileşeni (UploadWidget) | L |  |  |
| [K12-02](K12-galeri-oynatici.md#K12-02) | Kurumsal albüm use-case'leri ve kurumsal yayın türevi | L |  |  |
| [K13-06](K13-davetiye-takvim.md#K13-06) | Yayın medyası: 'izinli davetiye dosyası' sınıfı ve erişim politikası | M | İ |  |
| [K15-07](K15-chatbot.md#K15-07) | POST /api/assistant/message: orkestrasyon, SSS yedeği ve insan iletişimine geçiş | L |  |  |
| [K15-09](K15-chatbot.md#K15-09) | Yönetim ekranı: AssistantSettings (aç/kapat, limitler, maliyet görünümü) | M |  |  |

### Dalga 29 (7 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K21-07](K21-yonetim-kabugu-takvim.md#K21-07) | M1 kabulü: ürün sahibi staging'de personel girişi, takvim, hold ve kesinleştirme | S | ÜD |  |
| [K06-10](K06-talep-ziyaret-teklif.md#K06-10) | Etkinlik oluşturma ve müşteri daveti: kayıt, token üretimi, yeniden gönderme/iptal | L |  |  |
| [K12-03](K12-galeri-oynatici.md#K12-03) | Yönetim ekranı: AlbumManager ve içerik bloğuna galeri seçimi bağlama | L |  |  |
| [K12-04](K12-galeri-oynatici.md#K12-04) | Kamu galeri bileşenleri: AlbumGrid, PhotoViewer ve GalleryPreview'ı gerçek veriye bağlama | L |  |  |
| [K12-05](K12-galeri-oynatici.md#K12-05) | VideoPlayer ve ArchiveStatus: native HLS, hls.js, erişilebilir kontroller | L |  |  |
| [K13-07](K13-davetiye-takvim.md#K13-07) | Kamu davetiye sayfası: GET /davetiye/:publicId ve link_only token | L | İ |  |
| [K15-08](K15-chatbot.md#K15-08) | Ön yüz: AssistantWidget (etkileşimde yüklenen küçük istemci adası) | M |  |  |

### Dalga 30 (9 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K06-11](K06-talep-ziyaret-teklif.md#K06-11) | Davet kabulü uçtan uca (fake adaptörle): talepten üyeliğe | M |  |  |
| [K06-14](K06-talep-ziyaret-teklif.md#K06-14) | Personel ekranları: teklif editörü, kesinleştirme kontrol listesi, davet | L |  |  |
| [K08-02](K08-dugunum-pano-onay.md#K08-02) | Pano şeması: board_post, board_comment, internal_note | M | M |  |
| [K08-03](K08-dugunum-pano-onay.md#K08-03) | Görev ve onay şeması: task_template, event_task, approval_request/decision, değişmez öneri sürümü | M | M |  |
| [K08-04](K08-dugunum-pano-onay.md#K08-04) | Personel ataması ve düğün kapsamı yetkisi | M | M |  |
| [K12-06](K12-galeri-oynatici.md#K12-06) | Cihaz/performans testleri ve K12 raporu (T-30 galeri/oynatıcı) | M |  |  |
| [K13-09](K13-davetiye-takvim.md#K13-09) | İptal ve süre dolumu: yayın kapatma, cache temizliği, medya erişimi | L | İ |  |
| [K13-13](K13-davetiye-takvim.md#K13-13) | Takvim nüansı: PublicEventHint, hover/focus/dokunma kartı ve davetiye bağlantısı | L |  |  |
| [K15-10](K15-chatbot.md#K15-10) | K15 güvenlik/kabul paketi ve rapor (T-27) | M | D |  |

### Dalga 31 (8 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K06-15](K06-talep-ziyaret-teklif.md#K06-15) | Kayıtlı aday sayfaları: taleplerim, teklif ve davet kabulü (işlevsel) | L |  |  |
| [K08-05](K08-dugunum-pano-onay.md#K08-05) | Düğünüm özeti ve müşteri etkinlik listesi API'si | M |  |  |
| [K08-06](K08-dugunum-pano-onay.md#K08-06) | Müşteri paylaşımı ve yorumlar: use-case'ler ve uçlar | L |  |  |
| [K08-07](K08-dugunum-pano-onay.md#K08-07) | İç not ve 'notu müşteriyle paylaş' akışı (önizleme + açık yayın) | M |  |  |
| [K08-08](K08-dugunum-pano-onay.md#K08-08) | Görev şablonu yönetimi ve düğüne kopyalama | M |  |  |
| [K08-09](K08-dugunum-pano-onay.md#K08-09) | Sürümlü seçim/onay: istek, karar, geçersizleşme | L |  |  |
| [K08-14](K08-dugunum-pano-onay.md#K08-14) | Personel ekranı: TeamAssignments | M |  |  |
| [K09-02](K09-sohbet-canli-akis.md#K09-02) | Sohbet şeması: conversation, member, message, realtime_inbox, realtime_counter | L | M |  |

### Dalga 32 (8 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K06-16](K06-talep-ziyaret-teklif.md#K06-16) | K06 kabul testleri ve raporu | S | D |  |
| [K08-10](K08-dugunum-pano-onay.md#K08-10) | Müşteri ekranları: Düğünüm özeti, bekleyen işler, yaklaşan görevler | L |  |  |
| [K08-11](K08-dugunum-pano-onay.md#K08-11) | Müşteri ekranları: pano, yorum ve onay (ProposalVersion, ApprovalControls) | L |  |  |
| [K08-12](K08-dugunum-pano-onay.md#K08-12) | Personel ekranı: EventWorkspace (özet, görevler, onay istekleri) | L |  |  |
| [K09-03](K09-sohbet-canli-akis.md#K09-03) | Mesaj gönderme ve sayfalı geçmiş | L |  |  |
| [K09-04](K09-sohbet-canli-akis.md#K09-04) | Realtime inbox ve sıralı sayaç kilidi | L |  |  |
| [K13-11](K13-davetiye-takvim.md#K13-11) | Müşteri ekranı: yayın tercihi ve onay (PublicationConsent) | L |  |  |
| [K14-06](K14-belge-odeme.md#K14-06) | Ödeme planı, tahsilat ve ters kayıt use-case'leri | L |  |  |

### Dalga 33 (10 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K07-10](K07-kurumsal-site-icerik.md#K07-10) | M2 kabulü: ürün sahibi genel site, talep, teklif ve davet akışını dener | S | ÜD |  |
| [K08-13](K08-dugunum-pano-onay.md#K08-13) | Personel ekranı: pano yönetimi ve iç notlar | L |  |  |
| [K09-05](K09-sohbet-canli-akis.md#K09-05) | SSE ucu: kullanıcı kapsamlı tek bağlantı, replay ve yetki iptali | L |  |  |
| [K09-06](K09-sohbet-canli-akis.md#K09-06) | Doğrudan LISTEN/NOTIFY dinleyicisi ve bağlantı bütçesi | M |  |  |
| [K10-06](K10-bildirim-eposta-sms.md#K10-06) | Bildirim tüketicisi: alıcı belirleme, tercih/sessiz saat değerlendirme | L |  |  |
| [K11-15](K11-medya-temeli.md#K11-15) | Pano/yorum eki bağlama (K08 AttachmentList yer tutucusunun gerçekleştirilmesi) | M | M |  |
| [K13-10](K13-davetiye-takvim.md#K13-10) | Cache izolasyonu denetimi: iki kullanıcı, aynı URL (T-17) | M |  |  |
| [K13-12](K13-davetiye-takvim.md#K13-12) | Yönetim ekranı: PublicationManager sekmesi | L |  |  |
| [K14-07](K14-belge-odeme.md#K14-07) | Müşteri ekranları: DocumentList, PaymentSchedule, PaymentHistory, dekont bildirimi | L |  |  |
| [K14-08](K14-belge-odeme.md#K14-08) | Personel ekranları: belge yönetimi, ödeme planı, tahsilat ve ters kayıt | L |  |  |

### Dalga 34 (8 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K08-15](K08-dugunum-pano-onay.md#K08-15) | K08 güvenlik/kabul testleri ve rapor (T-08, T-14, T-26, T-34) | M |  |  |
| [K09-07](K09-sohbet-canli-akis.md#K09-07) | Müşteri sohbet arayüzü | L |  |  |
| [K09-08](K09-sohbet-canli-akis.md#K09-08) | Personel sohbet arayüzü (atanmış düğünler) | L |  |  |
| [K10-07](K10-bildirim-eposta-sms.md#K10-07) | Delivery ledger ve gönderim işçisi: yeniden değerlendirme, unknown, uzlaştırma | L |  |  |
| [K10-14](K10-bildirim-eposta-sms.md#K10-14) | Bildirim merkezi ve tercih ekranları (müşteri ve personel) | L |  |  |
| [K11-16](K11-medya-temeli.md#K11-16) | K11 güvenlik/kabul paketi: T-08, T-23, T-24, T-25, T-39 ve T-09 (video) | L | İ |  |
| [K13-14](K13-davetiye-takvim.md#K13-14) | K13 güvenlik/kabul paketi ve rapor (T-15, T-16, T-17) | M | İ |  |
| [K14-09](K14-belge-odeme.md#K14-09) | K14 güvenlik/kabul paketi ve rapor (T-08, T-26, T-31) | M | D |  |

### Dalga 35 (7 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K09-09](K09-sohbet-canli-akis.md#K09-09) | Sohbet test/ölçüm paketi: T-09 (sohbet kısmı), T-37, çok süreç izolasyonu | M |  |  |
| [K10-08](K10-bildirim-eposta-sms.md#K10-08) | Ortam koruması: staging'de gerçek alıcıya gönderimi engelleme | S |  |  |
| [K10-09](K10-bildirim-eposta-sms.md#K10-09) | Webhook alımı: imza, tekilleştirme, sıra, bastırma | L |  |  |
| [K10-12](K10-bildirim-eposta-sms.md#K10-12) | SMS bütçesi, hız limiti, tekrar engeli ve alarm olayları | M | M |  |
| [K10-13](K10-bildirim-eposta-sms.md#K10-13) | Yönetici gönderim API'si: preview/publish ve 'Ayrıca SMS gönder' | L |  |  |
| [K15-11](K15-chatbot.md#K15-11) | M4 kabulü: ürün sahibi galeri, davetiye, belge/ödeme ve chatbot'u dener | S | ÜD |  |
| [K16-09](K16-yonetim-butunlestirme.md#K16-09) | Müşteri alanı bütünleştirme: Düğünüm gezintisi, bildirim zili ve boş durumlar | L |  |  |

### Dalga 36 (4 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K10-10](K10-bildirim-eposta-sms.md#K10-10) | SMS sağlayıcı adaptörü (gerçek) ve sandbox doğrulaması | L |  |  |
| [K10-11](K10-bildirim-eposta-sms.md#K10-11) | E-posta sağlayıcı adaptörü (gerçek) ve sandbox doğrulaması | L |  |  |
| [K10-15](K10-bildirim-eposta-sms.md#K10-15) | Yönetim ekranları: AudienceSelector, UpdateComposer, SmsPreview, DeliveryHistory | L |  |  |
| [K16-07](K16-yonetim-butunlestirme.md#K16-07) | Operasyon ayarları: tek yerden iş kuralı ve sınır yapılandırması | M |  |  |

### Dalga 37 (3 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K10-16](K10-bildirim-eposta-sms.md#K10-16) | Davet, OTP ve kanal kanıtı gönderimini gerçek kanallara bağlama | M |  |  |
| [K16-04](K16-yonetim-butunlestirme.md#K16-04) | FailedJobs ve operasyon sağlığı: başarısız işler, unknown SMS, karantina ve outbox yaşı | L |  |  |
| [K16-08](K16-yonetim-butunlestirme.md#K16-08) | Personel gezintisi ve günlük pano: AdminNavigation bütünleştirme | L |  |  |

### Dalga 38 (2 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K10-17](K10-bildirim-eposta-sms.md#K10-17) | K10 kabul testleri ve raporu | M | D |  |
| [K16-10](K16-yonetim-butunlestirme.md#K16-10) | Yetki sınırı denetimi: rota/uç ↔ izin kaydı eşleşmesi ve yetkisiz personel matrisi | L | İ |  |

### Dalga 39 (3 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K10-18](K10-bildirim-eposta-sms.md#K10-18) | M3 kabulü: ürün sahibi Düğünüm, onay, sohbet ve bildirimleri test alıcılarıyla dener | S | ÜD |  |
| [K16-11](K16-yonetim-butunlestirme.md#K16-11) | Baştan sona personel + çift senaryosu (fake adaptörlerle) ve K16 raporu | L |  |  |
| [K17-05](K17-staging-kabul.md#K17-05) | Güvenlik yapılandırma denetimi: secret, başlık, cache, rate limit, bağımlılık ve imaj | L |  |  |

### Dalga 40 (4 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K17-02](K17-staging-kabul.md#K17-02) | T-01–T-40 test matrisi: tam çalıştırma ve rapor | L |  |  |
| [K17-04](K17-staging-kabul.md#K17-04) | Yük ve performans ölçümü: 100 oturum + 20 sohbet bağlantısı, bütçeler | L |  |  |
| [K17-06](K17-staging-kabul.md#K17-06) | Gerçek sağlayıcı sandbox kabulü: SMS, e-posta, OAuth, depolama (test alıcılarıyla) | M | ÜD |  |
| [K17-07](K17-staging-kabul.md#K17-07) | Operasyon runbook'u, lisans envanteri ve bağımlılık planı | M | D |  |

### Dalga 41 (2 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K17-08](K17-staging-kabul.md#K17-08) | Maliyet raporu ve KVKK kontrol listesi | M | ÜD |  |
| [K17-09](K17-staging-kabul.md#K17-09) | Bağımsız harici güvenlik incelemesi ve bulgu kapatma | L | İÜD |  |

### Dalga 42 (1 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K17-10](K17-staging-kabul.md#K17-10) | Bakım sahipliği teyidi ve K17 kapanış raporu (yayın kapısı değerlendirmesi) | S | ÜD |  |

### Dalga 43 (1 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K18-01](K18-canliya-gecis.md#K18-01) | Yayın onayı, canlıya geçiş tarihi ve kesinti toleransı kararı | S | ÜD |  |

### Dalga 44 (2 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K18-02](K18-canliya-gecis.md#K18-02) | Üretim ortamı, sırlar ve provider üretim ayarları | L | Ü |  |
| [K18-03](K18-canliya-gecis.md#K18-03) | Onaylı içerik ve URL aktarımı (staging'e) ve yönlendirme planı doğrulaması | L | Ü |  |

### Dalga 45 (1 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K18-04](K18-canliya-gecis.md#K18-04) | Üretim restore tatbikatı, son yedek ve rollback provası | M |  |  |

### Dalga 46 (1 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K18-05](K18-canliya-gecis.md#K18-05) | Canlıya geçiş öncesi kapı kontrolü ve smoke test planı (üretim, DNS'den önce) | M | ÜD |  |

### Dalga 47 (1 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K18-06](K18-canliya-gecis.md#K18-06) | DNS/TLS geçişi, üretim içerik aktarımı ve canlı smoke test | M | ÜD |  |

### Dalga 48 (1 iş)

| İş | Başlık | Boyut | Bayrak | Yol çakışması |
|---|---|---|---|---|
| [K18-07](K18-canliya-gecis.md#K18-07) | Geçiş sonrası izleme ve ilk hafta kapanış raporu | S | ÜD |  |

## Kritik yol (otomatik üretildi)

En uzun bağımlılık zinciri (bunun gecikmesi bütün planı geciktirir): K00-01 → K00-02 → K01-01 → K01-04 → K01-05 → K01-06 → K02-01 → K02-02 → K02-03 → K02-04 → K02-06 → K02-07 → K03-01 → K03-02 → K03-06 → K03-07 → K03-09 → K03-12 → K04-01 → K04-03 → K04-05 → K04-10 → K05-01 → K05-03 → K06-02 → K06-03 → K06-04 → K06-08 → K06-09 → K06-10 → K08-04 → K09-02 → K09-04 → K10-06 → K10-07 → K10-09 → K10-10 → K10-16 → K10-17 → K16-11 → K17-02 → K17-09 → K17-10 → K18-01 → K18-02 → K18-04 → K18-05 → K18-06 → K18-07 (49 halka).
