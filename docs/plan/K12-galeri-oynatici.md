# K12 — Galeri ve oynatıcı

**Kilometre taşı:** M4 — Medya ve yayın (K11–K15) · **Şartname:** §5.2, §14.3, §16 · [Plan dizini](README.md)

> Onaylı kurumsal albüm, responsive görseller, native HLS/hls.js oynatıcı, erişilebilir kontroller ve yüklenme/hata durumları.

Yalnız açık onaylı kurumsal türev public CDN'e çıkar; özel medya ve orijinaller çıkmaz. Büyük özel albüm ikinci aşama bayrağında kapalıdır (K19). Ana görsel gereksiz lazy loading ile geciktirilmez; video otomatik ağır indirme/oynatma yapmaz.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K12-01](K12-galeri-oynatici.md#K12-01) · Albüm şeması: album, album_item ve kurumsal yayın durumu | M | 24 | K11-03, K07-02 | migration |
| [K12-02](K12-galeri-oynatici.md#K12-02) · Kurumsal albüm use-case'leri ve kurumsal yayın türevi | L | 28 | K12-01, K11-10, K11-04 |  |
| [K12-03](K12-galeri-oynatici.md#K12-03) · Yönetim ekranı: AlbumManager ve içerik bloğuna galeri seçimi bağlama | L | 29 | K12-02, K11-14, K07-03 |  |
| [K12-04](K12-galeri-oynatici.md#K12-04) · Kamu galeri bileşenleri: AlbumGrid, PhotoViewer ve GalleryPreview'ı gerçek veriye bağlama | L | 29 | K12-02, K07-04 |  |
| [K12-05](K12-galeri-oynatici.md#K12-05) · VideoPlayer ve ArchiveStatus: native HLS, hls.js, erişilebilir kontroller | L | 29 | K12-02, K11-11 |  |
| [K12-06](K12-galeri-oynatici.md#K12-06) · Cihaz/performans testleri ve K12 raporu (T-30 galeri/oynatıcı) | M | 30 | K12-03, K12-04, K12-05 |  |

<a id="K12-01"></a>
## K12-01 · Albüm şeması: album, album_item ve kurumsal yayın durumu

**Boyut:** M · **Dalga:** 24 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K11-03](K11-medya-temeli.md#K11-03), [K07-02](K07-kurumsal-site-icerik.md#K07-02)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/db/src/schema/album.ts`, `packages/db/migrations/*_album_schema.sql`, `packages/db/src/rls/album.ts`, `tests/integration/db/album/`
**Migration içerir:** birleştirme sırası entegratörce belirlenir; rebase sonrası migration adı/sırası çakışırsa yeniden numaralandır (README, kural 4).

**Teslim edilecekler**
- `album` (kurumsal/özel tür, başlık, sıralama, yayın durumu `draft/published/withdrawn`), `album_item` (medya referansı, sıra, alt metin zorunlu, başlık)
- Kurumsal albümde yalnız **kurumsal yayın** sınıfında türevi olan asset'ler; özel albüm tablosu yalnız şema olarak (UI/API bayrak arkasında K19)
- RLS: kamu okuması yalnız yayımlanmış kurumsal albümün allowlist alanları (SECURITY DEFINER görünüm); yazma `content.edit`; veri envanteri satırı

**Kabul**
- Taslak/geri çekilmiş albüm kamu okumasında görünmez; özel asset kurumsal albüme eklenemez (kısıt)
- Alt metinsiz öğe yayımlanamaz

**Kapsam dışı:** Use-case'ler K12-02'dedir.

**Oku:** `AGENTS.md`, §8, §14.1, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-04](K05-rezervasyon-motoru.md#K05-04), [K05-05](K05-rezervasyon-motoru.md#K05-05), [K06-02](K06-talep-ziyaret-teklif.md#K06-02), [K06-07](K06-talep-ziyaret-teklif.md#K06-07), [K07-07](K07-kurumsal-site-icerik.md#K07-07), [K11-05](K11-medya-temeli.md#K11-05), [K11-06](K11-medya-temeli.md#K11-06), [K11-12](K11-medya-temeli.md#K11-12), [K13-03](K13-davetiye-takvim.md#K13-03), [K14-02](K14-belge-odeme.md#K14-02), [K15-03](K15-chatbot.md#K15-03), [K15-05](K15-chatbot.md#K15-05)

**Bunu bekleyenler:** [K12-02](K12-galeri-oynatici.md#K12-02)

---

<a id="K12-02"></a>
## K12-02 · Kurumsal albüm use-case'leri ve kurumsal yayın türevi

**Boyut:** L · **Dalga:** 28 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K12-01](K12-galeri-oynatici.md#K12-01), [K11-10](K11-medya-temeli.md#K11-10), [K11-04](K11-medya-temeli.md#K11-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/application/src/gallery/`, `apps/web/app/api/public/gallery/`, `apps/web/app/api/admin/albums/`, `tests/integration/gallery/`

**Teslim edilecekler**
- Albüm oluştur/sırala/yayımla/geri çek; yayımlama: açık onaylı **kurumsal türev** public prefix'e kopyalanır (orijinal ACL'i public değil, özel prefix'te kalır); geri çekmede public türev silinir/erişim kapanır ve cache temizlenir
- `GET /api/public/gallery` allowlist DTO (yalnız türev URL'leri, alt metin, boyutlar); sayfalı; kamu cache başlıkları (kurumsal galeri için kısa/orta ömürlü; **davetiye kuralı uygulanmaz**)
- Kişi adı/telefon object key/URL'de yok; yayın denetimi audit'e

**Kabul**
- Özel/yayımlanmamış asset kamu DTO'sunda ve public prefix'te bulunmaz (test); geri çekilen albümün türev URL'si kapanır
- Public DTO şeması allowlist testi

**Kapsam dışı:** Ekranlar K12-03/04'tedir.

**Oku:** `AGENTS.md`, §14.1, §14.3, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K05-14](K05-rezervasyon-motoru.md#K05-14), [K21-06](K21-yonetim-kabugu-takvim.md#K21-06), [K06-09](K06-talep-ziyaret-teklif.md#K06-09), [K11-14](K11-medya-temeli.md#K11-14), [K13-06](K13-davetiye-takvim.md#K13-06), [K15-07](K15-chatbot.md#K15-07), [K15-09](K15-chatbot.md#K15-09)

**Bunu bekleyenler:** [K12-03](K12-galeri-oynatici.md#K12-03), [K12-04](K12-galeri-oynatici.md#K12-04), [K12-05](K12-galeri-oynatici.md#K12-05)

---

<a id="K12-03"></a>
## K12-03 · Yönetim ekranı: AlbumManager ve içerik bloğuna galeri seçimi bağlama

**Boyut:** L · **Dalga:** 29 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K12-02](K12-galeri-oynatici.md#K12-02), [K11-14](K11-medya-temeli.md#K11-14), [K07-03](K07-kurumsal-site-icerik.md#K07-03)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/admin/gallery/`, `apps/web/app/(admin)/galeri/`, `apps/web/src/admin/nav/galeri.ts`, `tests/e2e/admin-gallery/`

**Teslim edilecekler**
- Albüm oluşturma, medya kütüphanesinden öğe ekleme/sıralama, alt metin/başlık, yayımla/geri çek; K07-02'nin 'galeri seçimi' bloğu için albüm seçici (blok şemasını değiştirmez, seçici bileşen kaydı)
- Yükleniyor/boş/hata/yetkisiz durumları; klavye ve mobil sıralama alternatifi

**Kabul**
- Playwright: albüm oluştur → yayımla → kamu sayfasında görünür; geri çek → kapanır; alt metinsiz yayımlanamaz
- İzinsiz personelde ekran yok

**Kapsam dışı:** Kamu bileşenleri K12-04/05'tedir.

**Oku:** `AGENTS.md`, §16, §14.3 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K21-07](K21-yonetim-kabugu-takvim.md#K21-07), [K06-10](K06-talep-ziyaret-teklif.md#K06-10), [K12-04](K12-galeri-oynatici.md#K12-04), [K12-05](K12-galeri-oynatici.md#K12-05), [K13-07](K13-davetiye-takvim.md#K13-07), [K15-08](K15-chatbot.md#K15-08)

**Bunu bekleyenler:** [K12-06](K12-galeri-oynatici.md#K12-06), [K16-08](K16-yonetim-butunlestirme.md#K16-08), [K18-03](K18-canliya-gecis.md#K18-03)

---

<a id="K12-04"></a>
## K12-04 · Kamu galeri bileşenleri: AlbumGrid, PhotoViewer ve GalleryPreview'ı gerçek veriye bağlama

**Boyut:** L · **Dalga:** 29 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K12-02](K12-galeri-oynatici.md#K12-02), [K07-04](K07-kurumsal-site-icerik.md#K07-04)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/site/gallery/`, `apps/web/app/(site)/galeri/`, `tests/e2e/site-gallery/`

**Teslim edilecekler**
- `AlbumGrid`, `PhotoViewer` (klavye, odak yönetimi, kapatma, yakınlaştırma yerine büyük türev), responsive `srcset`, yükseklik/en rezervasyonu (CLS), ekran dışı lazy loading (**ana görsel lazy değil**)
- K07'nin `GalleryPreview` bölümü gerçek albüme bağlanır (yalnız veri kaynağı değişir); veri yoksa bölüm gösterilmez
- Görsel bütçesi ve JS bütçesi ölçümü; `use client` yalnız görüntüleyici adası

**Kabul**
- Playwright: klavye ile gezinme ve görüntüleyici; mobil dokunma hedefleri; azaltılmış hareket
- CLS ve ilk görünüm görsel bütçesi rapora ölçülmüş rakamla yazılır
- Bu paketin geçmesi gereken şartname testleri: T-30 (§20.1).

**Kapsam dışı:** Video K12-05'tedir.

**Oku:** `AGENTS.md`, §14.3, §16, §19.2 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K21-07](K21-yonetim-kabugu-takvim.md#K21-07), [K06-10](K06-talep-ziyaret-teklif.md#K06-10), [K12-03](K12-galeri-oynatici.md#K12-03), [K12-05](K12-galeri-oynatici.md#K12-05), [K13-07](K13-davetiye-takvim.md#K13-07), [K15-08](K15-chatbot.md#K15-08)

**Bunu bekleyenler:** [K12-06](K12-galeri-oynatici.md#K12-06), [K16-09](K16-yonetim-butunlestirme.md#K16-09)

---

<a id="K12-05"></a>
## K12-05 · VideoPlayer ve ArchiveStatus: native HLS, hls.js, erişilebilir kontroller

**Boyut:** L · **Dalga:** 29 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K12-02](K12-galeri-oynatici.md#K12-02), [K11-11](K11-medya-temeli.md#K11-11)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/src/site/video-player/`, `apps/web/src/media/archive-status/`, `tests/e2e/video-player/`

**Teslim edilecekler**
- Poster ile başlayan, otomatik ağır indirme/oynatma **yok**; oynatıcı yalnız kullanıcı etkileşiminde yüklenir (dinamik import); Safari/destekleyen cihazlarda native HLS, diğerlerinde hls.js; manuel kalite + otomatik seçim, ses, süre, tam ekran, klavye kontrolleri, altyazı; MP4 fallback yalnız aynı erişim kurallarıyla ve cihaz testinden sonra
- Site tokenlarıyla uyumlu stil; ticari/terk edilmiş player bağımlılığı yok (`docs/dependencies.md`); yükleniyor/hata/yeniden dene durumları
- `ArchiveStatus` bileşeni ('Arşivden hazırlanıyor', anlık oynatma vaadi yok) yalnız sunum olarak; özel albüm bayrağı kapalı

**Kabul**
- Playwright (Chromium + WebKit): oynatma, kalite değiştirme, klavye, altyazı; hata durumları
- Oynatıcı JS'i ilk yük bütçesine girmez (ölçüm)
- Bu paketin geçmesi gereken şartname testleri: T-30 (§20.1).

**Kapsam dışı:** Özel video izleme (üye) bayrak arkasında K19'dadır.

**Oku:** `AGENTS.md`, §14.3, §16 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K21-07](K21-yonetim-kabugu-takvim.md#K21-07), [K06-10](K06-talep-ziyaret-teklif.md#K06-10), [K12-03](K12-galeri-oynatici.md#K12-03), [K12-04](K12-galeri-oynatici.md#K12-04), [K13-07](K13-davetiye-takvim.md#K13-07), [K15-08](K15-chatbot.md#K15-08)

**Bunu bekleyenler:** [K12-06](K12-galeri-oynatici.md#K12-06)

---

<a id="K12-06"></a>
## K12-06 · Cihaz/performans testleri ve K12 raporu (T-30 galeri/oynatıcı)

**Boyut:** M · **Dalga:** 30 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K12-03](K12-galeri-oynatici.md#K12-03), [K12-04](K12-galeri-oynatici.md#K12-04), [K12-05](K12-galeri-oynatici.md#K12-05)

**Dokunabileceğin yollar (yalnız bunlar):** `tests/e2e/gallery-acceptance/`, `docs/reports/K12-performans.md`

**Teslim edilecekler**
- Mobil, Safari (Playwright WebKit; gerçek cihaz notu), Chromium; klavye ve azaltılmış hareket; axe + elle kontrol notları
- Video başlangıç süresi (hedef p95 ≤3 sn, **tanımlı test ağı/cihaz profiliyle**) ve görüntü performansı ölçümü; sonuç ve koşullar raporda, rakam uydurulmaz

**Kabul**
- T-30 galeri/oynatıcı kısmı yeşil; ölçüm koşulları ve sonuçlar raporlanmış
- Gerçek cihaz testi yapılamadıysa nedeni ve kalan risk yazılı
- Bu paketin geçmesi gereken şartname testleri: T-30 (§20.1).

**Kapsam dışı:** Üretim gerçek kullanıcı ölçümü K17/K18'dedir.

**Oku:** `AGENTS.md`, §14.3, §19.2, §20.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K06-11](K06-talep-ziyaret-teklif.md#K06-11), [K06-14](K06-talep-ziyaret-teklif.md#K06-14), [K08-02](K08-dugunum-pano-onay.md#K08-02), [K08-03](K08-dugunum-pano-onay.md#K08-03), [K08-04](K08-dugunum-pano-onay.md#K08-04), [K13-09](K13-davetiye-takvim.md#K13-09), [K13-13](K13-davetiye-takvim.md#K13-13), [K15-10](K15-chatbot.md#K15-10)

**Bunu bekleyenler:** [K15-11](K15-chatbot.md#K15-11), [K16-11](K16-yonetim-butunlestirme.md#K16-11), [K17-04](K17-staging-kabul.md#K17-04)

---
