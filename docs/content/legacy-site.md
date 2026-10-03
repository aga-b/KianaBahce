# Mevcut site içeriği ve URL envanteri (K20-02)

Kapsam: `kianabahce.com` mevcut yayınının sayfa, URL, form ve SEO dayanaklarının envanteri. Kaynak: 2026-10-03 tarihinde yalnız herkese açık sayfalara salt okunur HTTP GET istekleri (site haritası, sayfalar, herkese açık WordPress REST listesi). Yönetim paneline giriş, form gönderimi, tarama dışı istek, DNS/TLS değişikliği yapılmadı; yayın değiştirilmedi (§19.5).

Bu belge öneri içerir; hedef kararları ürün sahibinindir. Kişisel veri (müşteri adı, form içeriği, e-posta/telefon değerleri) repoya alınmadı; var olduğu yerde yalnız "var" diye belirtildi. Sır niteliğinde değer (ör. reCAPTCHA anahtarı) alınmadı.

## 1. Teknik özet

| Başlık | Gözlem |
|---|---|
| Yazılım | WordPress; Yoast SEO Premium v15.9 (eski sürüm), Contact Form 7, Mailchimp for WP (`mc4wp`), Google reCAPTCHA v3, sayfa oluşturucu eklentisi |
| Dil | `tr` |
| Yönlendirme | `http` -> `https` (301); sonda eğik çizgisiz URL -> eğik çizgili (301) |
| `www` | `http://www` 301 verir; `https://www` geçerli sertifikaya sahip değil (sertifika konu adı uyuşmuyor). K18'de DNS/TLS planında ele alınır |
| `robots.txt` | Yalnız `/wp-admin/` kapalı (`admin-ajax.php` açık); sitemap satırı yok |
| Site haritası | `/sitemap_index.xml` (`/sitemap.xml` ve `/wp-sitemap.xml` buraya yönlenir) -> yalnız `page-sitemap.xml`; içinde 5 sayfa. Sitemap içindeki bağlantılar `http://` biçiminde |
| Yazı (blog) | 0 yazı; `/feed/` içinde öğe yok |
| Medya | WordPress medya kütüphanesinde 63 öğe (haklar teyitsiz, aktarılmadı; bkz. `asset-inventory.md`, K20-01) |
| Meta açıklama | Hiçbir sayfada `meta description` yok |
| Analitik | Sayfa kaynağında analitik/etiket yöneticisi/piksel kodu görülmedi |
| Son değişiklik | Ana sayfa, Hakkımızda, Hizmetlerimiz: 2022-09-22; Galeri: 2021-02-24; İletişim: 2021-06-09 |

## 2. URL envanteri ve hedef önerisi

Hedef sütunu öneridir; seçenekler: aynen taşı / birleştir / yönlendir / kaldır. Yeni sitedeki hedef yolların kesinleşmesi K07, yönlendirme haritası K07-07 (`docs/migration/redirect-map.md`) işidir.

| # | Eski URL | Başlık | Durum | İçerik gözlemi | Öneri | Gerekçe |
|---|---|---|---|---|---|---|
| 1 | `/` | Anasayfa | 200, sitemap'te | Kayan görseller (3 fotoğraf), bülten ve iletişim formu; menü atanmamış ("No menu assigned!" metni görünür) | Aynen taşı (yeni ana sayfa, aynı yol) | Kök URL korunur; içerik K20-05 ile yeniden yazılır |
| 2 | `/hakkimizda/` | Hakkımızda | 200, sitemap'te | Metin Latince yer tutucu (lorem ipsum); "Müşteri Yorumları" bölümünde sayfa oluşturucu kodu çıplak görünüyor ve kişi adları içeriyor; 1 YouTube video bağlantısı | Birleştir (yeni "Hakkımızda"/mekân sayfası); yorumlar taşınmaz | Gerçek metin yok; adlandırılmış yorumların rızası/doğruluğu teyitsiz |
| 3 | `/hizmetler/` | Hizmetlerimiz | 200, sitemap'te | Lorem ipsum; sekmeler: Düğün, Nişan, Organizasyon; kırık sayfa oluşturucu kodu görünür; "Bilgi al!" düğmesi `#`'a gider | Birleştir (yeni hizmetler/organizasyon türleri sayfası) | Gerçek hizmet kapsamı ürün sahibi girdisi (K20-05) |
| 4 | `/galeri/` | Galeri | 200, sitemap'te | ~12 başlıklı fotoğraf kartı (başlıklardan biri çift isim içeriyor, olası gerçek çift), 1 YouTube bağlantısı (izleme parametreli) | Yönlendir (yeni galeri) | Fotoğraf hakları ve çift izinleri teyit edilene dek aktarılmaz (K20-01, K11) |
| 5 | `/iletisim/` | İletişim | 200, sitemap'te | Genel e-posta adresleri (2), adres, telefon (aynı numara iki kez yazılı), harita bağlantısı, iletişim formu | Yönlendir (yeni iletişim/talep) | Değerler K20-05'te ürün sahibince doğrulanıp yeniden girilir; telefon yinelemesi hata görünümlü |
| 6 | `/feed/`, `/comments/feed/` | RSS | 200, içerik boş | Yazı/yorum yok | Kaldır | Kullanımı yok |
| 7 | `/?s=...` | Site araması | Yoast arama eylemi tanımlı | Kullanılmıyor görünüyor | Kaldır | Yeni sitede arama kapsam dışı |
| 8 | `/wp-json/`, `/xmlrpc.php`, `/wp-admin/` ve diğer `wp-*` yolları | WordPress altyapısı | Var | Yayın içeriği değil | Kaldır (taşınmaz; yeni sitede yok) | Eski altyapıya özgü |
| 9 | `/wp-content/uploads/...` | Medya dosyaları | 200 | 63 öğe; bazıları sayfalarda doğrudan bağlı | Kaldır, gerekirse yönlendir | Dosya aktarımı K20-01 hak onayına bağlı; dış sitelerden gelen doğrudan görsel bağlantısı varsa K18-03'te kontrol edilir |
| 10 | Bilinmeyen yollar | 404 | 404 | Standart WordPress 404 | Yeni sitenin 404'ü | |

Sitemap dışında sayfa bulunmadı: herkese açık REST sayfa listesi de aynı 5 sayfayı döndürdü (taslak/özel sayfalar görünmez; bunlar bu yöntemle bilinemez). Wayback/arama motoru dizini gibi harici kaynaklara bu çalışmada erişilmedi; yayında olmayıp dışarıdan bağlanılan eski URL'ler varsa ürün sahibi bildirmelidir.

## 3. Formlar

| Form | Yer | Alanlar | Veri / aktarım kararı |
|---|---|---|---|
| İletişim formu (Contact Form 7, reCAPTCHA v3) | Her sayfanın alt bölümü (5 sayfa) | ad, e-posta, telefon, konu, mesaj | Kişisel veri toplar. Önerilen: eski gönderimler (e-posta kutusu/eklenti kaydı) aktarılmaz; yeni talep formu K06/K07'de kendi aydınlatma ve onay metniyle yapılır |
| Bülten kaydı (Mailchimp for WP) | Her sayfanın alt bölümü | e-posta | Abone listesi Mailchimp hesabındadır; toplu aktarım kişisel veri ve açık rıza meselesidir. Önerilen: aktarılmaz; ürün sahibi bülten kullanacaksa ayrı karar (yeni rıza) |
| Onay kutusu / aydınlatma bağlantısı | Yok | - | Sitede gizlilik, çerez, KVKK aydınlatma sayfası ve rıza metni bulunmadı (K20-06 ile yeni yazılır) |

Hiçbir form gönderilmedi; mevcut gönderim içerikleri okunmadı.

## 4. Ölçülebilir trafik ve SEO dayanakları

- Trafik verisi: ölçülemedi. Sitede analitik kodu yok; Search Console/Mailchimp/barındırma günlüklerine erişim yok. **Ürün sahibinden beklenen:** varsa Search Console, barındırma erişim günlüğü özetleri veya Mailchimp liste büyüklüğü (kişisel veri olmadan, yalnız sayılar).
- SEO durumu (yeniden yönlendirme önceliği için): 5 URL dizine açık (`index, follow`), kanonik adresler `https://` ve eğik çizgili; açıklama etiketi yok; sitemap bağlantıları `http://`; sitemap `robots.txt`'te bildirilmemiş; son güncelleme 2022'ye uzanıyor. Mevcut içeriğin çoğu yer tutucu olduğundan korunacak sıralama değeri düşük varsayılır; bu bir tahmindir ve trafik verisiyle doğrulanmalıdır.
- Yönlendirme planı girdisi: 5 içerik URL'si için 301 yönlendirmesi yeterlidir (bkz. §2); K07-07 `redirect-map.md` bu tablodan beslenir.

## 5. Ürün sahibinden beklenen girdiler

1. Tablo §2 öneri sütununun onayı veya düzeltmesi.
2. Sitede görünmeyen (taslak, özel, eski) ama dışarıdan bağlanılan URL'ler varsa listesi.
3. Trafik/SEO sayıları (§4) veya "ölçülmüyor" teyidi.
4. İletişim değerlerinin (e-posta, adres, telefon) hangilerinin yeni sitede kullanılacağı (K20-05).
5. Bülten listesi için devam/bırak kararı (§3).
6. `www` için hedef alan adı kararı (K18).

## 6. Sınırlamalar

- Salt okunur ve yalnız herkese açık yüzey incelendi; oturumlu yönetim görünümü, eklenti ayarları ve taslak içerik görülmedi.
- Kayan görsellerin ve galerinin kesin sayısı sayfa oluşturucu çıktısına göre yaklaşıktır.
- Trafik/SEO ölçümü yapılamadı (§4).
