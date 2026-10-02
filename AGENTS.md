# AGENTS.md — Kiana Bahçe

Düğün mekânı platformu (kurumsal site, rezervasyon motoru, düğün çalışma alanı, yönetim paneli). Bu dosya kodlama ajanları içindir; en çok ~2 sayfa tutulur, şartnamenin kopyası **değildir**. Çelişkide [`docs/Proje.md`](docs/Proje.md) (v1.1 şartname) geçerlidir.

## 2026-10-02 kapsam güncellemesi

Kullanıcı tek ajanla iskelet ve public arayüzün birlikte hazırlanmasını istedi. Bu teslimat için `docs/adr/001-public-foundation.md` geçerlidir; tek paket ve main bağımlılığı kısıtının yerini bu belgede kayıtlı bütünleşik kapsam alır. Diğer güvenlik ve yayın kuralları sürer.

## Bir işe başlamadan

1. Sana verilen iş **tek bir iş paketidir** (ör. `K05-06`). Yalnız onu yaparsın; başka iş paketini başlatmaz, komşu işi "kolay" diye yapmazsın.
2. Oku: bu dosya → şartname **§1, §4, §20.2** → [`docs/plan/README.md`](docs/plan/README.md) (kurallar, §1–§4) → iş paketinin kart dosyası ([`docs/plan/`](docs/plan/), bölüm `#Kxx-nn`) → bölümdeki **Oku** listesi (§22.4 + ilgili T-xx senaryoları, §20.1).
3. "Başlamadan önce `main`'de olması gerekenler" içindeki iş paketlerinin issue'ları kapalı mı bak. Değilse **başlama**; eksik bağımlılığı yapma, bildir.
4. Aynı yollara dokunan açık PR var mı bak (`gh pr list`). Varsa başlama, bildir.
5. Güncel `main`'den dal aç: `feat/Kxx-nn-kisa-konu` (düzeltme: `fix/Kxx-nn-kisa-konu`). Paralel çalışıyorsan ayrı çalışma dizini (worktree) kullan.

## Sınırlar

- **Yalnız iş paketinin "Dokunabileceğin yollar" listesindeki** dosyaları değiştir. Gerekiyorsa dur ve issue'da bildir; yolu sessizce genişletme.
- Küresel izinler (yalnız ekleme): `index.ts` export satırı, `docs/data-inventory.md` satırı, bağımlılık + `docs/dependencies.md` satırı, kayıt defterlerine kendi kaydın (ayrıntı: `docs/plan/README.md` kural 6 ve §6).
- Migration'lar zaman damgalı SQL'dir; birleştirme sırasını entegratör belirler (`docs/plan/README.md` kural 4). Birleşmiş migration'ı düzenleme, yeni migration yaz. Aynı migration/sözleşme dosyası iki ajana verilmez.
- Çelişkili, eksik veya fazla büyük iş paketi: `plan-sorunu` issue'su aç; kendi kafana göre kapsamı değiştirme.

## Değişmez kurallar (özet; tam metin şartname §4)

| Kimlik | Özet |
|---|---|
| SEC-01/02/03 | Her özel okuma/yazma sunucuda oturum+rol+işletme+düğün üyeliğiyle yetkilenir (UI gizlemesi yetmez); başka müşterinin kaydı/dosyası/sayısı sızmaz; özel içerik genel cache'e, herkese açık alana, analize, chatbot havuzuna girmez. |
| BOOK-01/02 | Çakışan zaman iki aktif hold/kesin rezervasyonla kapatılamaz (son savunma DB); talep, teklif kabulü ve kesin rezervasyon ayrı işlemlerdir. |
| PUB-01 | İsim/davetiye paylaşımı varsayılan kapalı; sürüm + hedef kitle için açık onay ister. |
| NOT-01/02 | Kayıt başarılı olmadan dış bildirim gönderilmez; SMS zaman aşımı "gönderilmedi" demek değildir, belirsiz sonuç körlemesine tekrarlanmaz. |
| MEDIA-01 | Özel medyanın küçük resmi, posteri, video parçası, altyazısı da özeldir. |
| OPS-01 | Gerçek müşteri verisi ve üretim sırları geliştirme/test ortamına konmaz. |
| GOV-01 | `main`'e her değişiklik PR + geçen CI ile girer; güvenlik-kritik alanda (§21.3) bağımsız **insan** incelemesi şart. |
| PRIV-01 | Amaç/dayanak/saklama süresi kaydedilmeden yeni kişisel veri alanı eklenmez. |
| SCOPE-01 | Yalnız atanan kapsam uygulanır; üretime çıkış yapılmaz. |

## PR kuralları

- Her iş paketi **tek dal, tek PR**; başlıkta iş paketi kimliği (`K05-06: …`), gövdede `Refs #<issue>`. Şablonu doldur: davranış değişikliği, test kanıtı, migration/geri dönüş, bilinen sınırlama, §21.3 kapısı (evet/hayır), yeni kişisel veri alanı, yeni bağımlılık/lisans.
- `main`'e doğrudan yazma, force-push yok, **kendi PR'ını birleştirme**. İş paketi "insan inceleme kapısı" taşıyorsa PR'da inceleyen insanın onayı olmadan birleşmez; yalnız şartname §21.3'teki kapsamı yazılı ürün sahibi risk kabulü istisnası uygulanabilir. Çözümlenmemiş kritik güvenlik açığı için istisna yoktur.
- Bitti tanımı: şartname §20.2 + iş paketinin tüm "Kabul" maddeleri + listelenen T-xx testleri **çalıştırılmış**. Çalıştırılmayan testi "geçti" yazma; nedenini yaz.
- Son rapor: değişen davranış, test kanıtı, migration/geri dönüş, bilinen sınırlama, PR bağlantısı.

## Sormadan yapılmayacaklar

- Yeni ücretli servis, provider hesabı, üretim sırrı, lisans şartı, canlıya etkili işlem, güvenlik sınırı değişikliği.
- Sessiz mock, sahte başarı, yetki kontrolünü/testi atlama, geçici "çalışıyormuş gibi" davranış. Fake adaptör yalnız iş paketinde adı geçen portlar için ve yalnız development/test'te.
- Gerçek sır, müşteri verisi, ayrıntılı açık/zafiyet notu repoya girmez (depo public olabilir). Sır görürsen dur, bildir.
- Depo ayarları ve görünürlüğü (public/private) değiştirilmez; bu ürün sahibinin kararıdır (K00-06).
- Yapay zekâ model adı/sürümü commit mesajına, PR'a, koda veya dokümana yazılmaz.
- Ürün sahibi girdisi gereken iş paketlerinde (karar, hesap, içerik, onay) kararı uydurma; eksik girdiyi bildir.

## Komutlar

`pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm check:plan`, `pnpm build`, `pnpm test:e2e`. Ayrıntılar README.md içinde. CI bu kontrolleri çalıştırır; kapsamlı sır taraması ve branch protection henüz tamamlanmış sayılmaz.

## Bağlantılar

- Şartname: [`docs/Proje.md`](docs/Proje.md) · Plan: [`docs/plan/README.md`](docs/plan/README.md) · Kartlar: [`docs/plan/`](docs/plan/)
- Durum ve atamalar: GitHub issue'ları (etiketler `kart:Kxx`, `durum:…`; kilometre taşları M0–M5)
