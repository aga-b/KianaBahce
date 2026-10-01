# K00 — Depo ve çalışma kuralları

**Kilometre taşı:** M0 — Temel ve hazırlık (K00–K04, K20) · **Şartname:** §21, §22.1 · [Plan dizini](README.md)

> Depoyu ajanların güvenle çalışabileceği hale getirir: kurallar, şablonlar, CI iskeleti, `main` koruması.

K00 kod yazmaz. Şartname `docs/Proje.md` altına taşınmış, `AGENTS.md` ve bu plan dizini yazılmıştır (K00-01, tamamlandı). Kalan işler hafif yönetişimdir (ADR-12): ajanlar arasında teknik yetki ayrımı kurulmaz.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K00-01](K00-depo-kurallari.md#K00-01) · Şartnameyi docs/ altına taşı, AGENTS.md ve plan dizinini yaz | M | 0 | — | doküman, tamamlandı |
| [K00-02](K00-depo-kurallari.md#K00-02) · PR şablonu, issue şablonları, CODEOWNERS, SECURITY.md | S | 1 | K00-01 | doküman |
| [K00-03](K00-depo-kurallari.md#K00-03) · ADR şablonu ve docs düzeni | S | 1 | K00-01 | doküman |
| [K00-04](K00-depo-kurallari.md#K00-04) · Temel CI iskeleti (sır taraması, markdown/bağlantı, yer tutucu kontroller) | S | 1 | K00-01 | yapılandırma |
| [K00-05](K00-depo-kurallari.md#K00-05) · main koruması (PR + CI) ve durum raporu | S | 2 | K00-02, K00-04 | ürün sahibi girdisi, yapılandırma |
| [K00-06](K00-depo-kurallari.md#K00-06) · Depo görünürlüğü kararı (public / private) | S | 0 | — | ürün sahibi girdisi, karar |
| [K00-07](K00-depo-kurallari.md#K00-07) · İnsan inceleyicinin atanması (§21.3 kapıları) | S | 0 | — | ürün sahibi girdisi, karar |

<a id="K00-01"></a>
## K00-01 · Şartnameyi docs/ altına taşı, AGENTS.md ve plan dizinini yaz

**Boyut:** M · **Dalga:** 0 · **Tür:** doküman · **Durum:** tamamlandı
**Başlamadan önce `main`'de olması gerekenler:** yok

**Dokunabileceğin yollar (yalnız bunlar):** `docs/Proje.md`, `AGENTS.md`, `docs/plan/`

**Teslim edilecekler**
- `docs/Proje.md` (v1.1 içeriği; v1.0 git geçmişinde `Proje.md` olarak kalır)
- `AGENTS.md` (en çok ~2 sayfa): görev seçme, "yalnız adı geçen iş paketini yap" kuralı, dal/PR kuralı, yasak listesi
- `docs/plan/README.md` ve K00–K21 kart dosyaları (iş paketleri, bağımlılık, paralellik haritası)
- GitHub etiketleri, kilometre taşları ve iş paketi issue'ları

**Kabul**
- Dosyalar `main`'de; plan içi bağlantılar çözülüyor
- Her iş paketi tek başına okunduğunda yapılacak işi, dokunulacak yolları, kabulü ve bağımlılığı veriyor

**Oku:** `AGENTS.md`, §1, §21, §22 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-06](K00-depo-kurallari.md#K00-06), [K00-07](K00-depo-kurallari.md#K00-07), [K10-01](K10-bildirim-eposta-sms.md#K10-01), [K13-01](K13-davetiye-takvim.md#K13-01), [K14-01](K14-belge-odeme.md#K14-01), [K15-01](K15-chatbot.md#K15-01), [K17-01](K17-staging-kabul.md#K17-01)

**Bunu bekleyenler:** [K00-02](K00-depo-kurallari.md#K00-02), [K00-03](K00-depo-kurallari.md#K00-03), [K00-04](K00-depo-kurallari.md#K00-04), [K01-08](K01-iskelet.md#K01-08)

---

<a id="K00-02"></a>
## K00-02 · PR şablonu, issue şablonları, CODEOWNERS, SECURITY.md

**Boyut:** S · **Dalga:** 1 · **Tür:** doküman
**Başlamadan önce `main`'de olması gerekenler:** [K00-01](K00-depo-kurallari.md#K00-01)

**Dokunabileceğin yollar (yalnız bunlar):** `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/`, `.github/CODEOWNERS`, `SECURITY.md`

**Teslim edilecekler**
- PR şablonu: iş paketi kimliği, davranış değişikliği, test kanıtı (çalıştırılmayan test açıkça belirtilir), migration/geri dönüş, bilinen sınırlama, §21.3 kapısı (evet/hayır), yeni kişisel veri alanı (PRIV-01), yeni bağımlılık/lisans
- `CODEOWNERS`: §21.3 dizinleri (`auth`, `access`, `db` migration/RLS, `publication`, medya geçidi, `infra`, `.github/workflows`) için ürün sahibini ister
- `SECURITY.md`: açık bildirim kanalı (özel bildirim; ayrıntılı zafiyet notu issue'ya yazılmaz)
- Issue şablonu: iş paketi (AGENTS.md'deki alanlarla), hata raporu

**Kabul**
- Şablonlar yeni bir deneme PR'ında görünür
- `CODEOWNERS` söz dizimi GitHub'da geçerli (hata uyarısı yok)
- `SECURITY.md` depo görünürlüğüyle uyumlu (K00-06 sonucu yoksa "karar bekliyor" notu)

**Kapsam dışı:** Gerçek e-posta adresi veya sır yazılmaz; iletişim kanalı olarak GitHub özel güvenlik bildirimi kullanılır.

**Oku:** `AGENTS.md`, §21.1, §21.3, §17.6 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-03](K00-depo-kurallari.md#K00-03), [K00-04](K00-depo-kurallari.md#K00-04), [K01-08](K01-iskelet.md#K01-08)

**Bunu bekleyenler:** [K00-05](K00-depo-kurallari.md#K00-05), [K01-01](K01-iskelet.md#K01-01)

---

<a id="K00-03"></a>
## K00-03 · ADR şablonu ve docs düzeni

**Boyut:** S · **Dalga:** 1 · **Tür:** doküman
**Başlamadan önce `main`'de olması gerekenler:** [K00-01](K00-depo-kurallari.md#K00-01)

**Dokunabileceğin yollar (yalnız bunlar):** `docs/adr/`, `docs/runbook/`, `docs/reports/`, `docs/README.md`

**Teslim edilecekler**
- `docs/adr/0000-sablon.md` (başlık, bağlam, karar, sonuçlar, durum) ve `docs/adr/README.md` (şartnamedeki ADR-01…16 tablosuna bağlantı)
- `docs/README.md`: hangi belge nerede (şartname, plan, ADR, veri envanteri, runbook, raporlar)
- Boş dizinler `.gitkeep` ile

**Kabul**
- ADR şablonu K03-01 ve K04-02 tarafından kullanılabilir durumda
- Bağlantılar çözülüyor

**Oku:** `AGENTS.md`, §1, §24 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-02](K00-depo-kurallari.md#K00-02), [K00-04](K00-depo-kurallari.md#K00-04), [K01-08](K01-iskelet.md#K01-08)

**Bunu bekleyenler:** [K20-01](K20-tasarim-icerik.md#K20-01), [K20-02](K20-tasarim-icerik.md#K20-02), [K20-06](K20-tasarim-icerik.md#K20-06)

---

<a id="K00-04"></a>
## K00-04 · Temel CI iskeleti (sır taraması, markdown/bağlantı, yer tutucu kontroller)

**Boyut:** S · **Dalga:** 1 · **Tür:** yapılandırma
**Başlamadan önce `main`'de olması gerekenler:** [K00-01](K00-depo-kurallari.md#K00-01)

**Dokunabileceğin yollar (yalnız bunlar):** `.github/workflows/ci.yml`, `.gitleaks.toml`

**Teslim edilecekler**
- `ci.yml`: PR ve `main` için çalışır; sır taraması (gitleaks veya eşdeğeri), markdown ve bağlantı kontrolü; `package.json` varsa lint/typecheck/test adımları (K01 gelene dek atlanır ve bu açıkça loglanır)
- İzinler asgari (`permissions: contents: read`); PR kodu sırlarla çalıştırılmaz; üçüncü taraf action'lar sürüm/SHA ile sabit
- Gerekli kontrol adları sabit ve belgelenmiş (K00-05 bunları gerekli yapacak)

**Kabul**
- Deneme PR'ında kontroller çalışır ve yeşil
- Bilinen sahte sır içeren deneme dalı CI'da kırmızı olur; PR kapatılır, dal silinir (gerçek sır kullanılmaz)

**Oku:** `AGENTS.md`, §17.4, §21.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-02](K00-depo-kurallari.md#K00-02), [K00-03](K00-depo-kurallari.md#K00-03), [K01-08](K01-iskelet.md#K01-08)

**Bunu bekleyenler:** [K00-05](K00-depo-kurallari.md#K00-05), [K01-01](K01-iskelet.md#K01-01)

---

<a id="K00-05"></a>
## K00-05 · main koruması (PR + CI) ve durum raporu

**Boyut:** S · **Dalga:** 2 · **Tür:** yapılandırma
**Başlamadan önce `main`'de olması gerekenler:** [K00-02](K00-depo-kurallari.md#K00-02), [K00-04](K00-depo-kurallari.md#K00-04)
**Ürün sahibinden gereken:** Ruleset ayarı depo yöneticisi yetkisi ister; token yetkisi yetmezse ürün sahibi GitHub arayüzünden etkinleştirir.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/reports/K00-main-korumasi.md`

**Teslim edilecekler**
- `main` için ruleset/korumalı dal: PR zorunlu, gerekli CI kontrolleri, force-push ve silme kapalı — hosting planının izin verdiği ölçüde
- Plan/izin yetmiyorsa kalan kısım çalışma kuralı olarak yazılır; `docs/reports/K00-main-korumasi.md` neyin teknik, neyin kural olduğunu söyler
- Bu iş paketi birleşince bootstrap dönemi biter: `main`'e doğrudan push yapılmaz

**Kabul**
- `main`'e force-push denemesi reddedilir (ya da raporda "planda yok" diye yazılı)
- Kontrolleri geçmeyen PR birleştirilemiyor (ya da raporda kural olarak yazılı)
- Ürün sahibi gerekirse bypass yetkisini koruyor

**Oku:** `AGENTS.md`, §1, §21.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K01-01](K01-iskelet.md#K01-01), [K20-01](K20-tasarim-icerik.md#K20-01), [K20-02](K20-tasarim-icerik.md#K20-02), [K20-06](K20-tasarim-icerik.md#K20-06), [K03-13](K03-kimlik-uyelik.md#K03-13), [K10-02](K10-bildirim-eposta-sms.md#K10-02), [K11-01](K11-medya-temeli.md#K11-01)

---

<a id="K00-06"></a>
## K00-06 · Depo görünürlüğü kararı (public / private)

**Boyut:** S · **Dalga:** 0 · **Tür:** karar
**Başlamadan önce `main`'de olması gerekenler:** yok
**Ürün sahibinden gereken:** Depo public mı kalacak, private mı olacak?

**Dokunabileceğin yollar (yalnız bunlar):** `SECURITY.md`, `AGENTS.md`

**Teslim edilecekler**
- Ürün sahibinin kararı kayda geçer; `SECURITY.md` ve `AGENTS.md` içindeki görünürlük notu güncellenir
- Public ise: şartname/ADR/kod kamuya açık kabul edilir; sır, üretim yapılandırması, müşteri verisi ve ayrıntılı zafiyet notu repoya girmez

**Kabul**
- Karar `docs/Proje.md` §23 ilgili satırına işlenir (kapalı/açık)
- Ajanlar kararı görünürlük değiştirmeden uygular; görünürlüğü ajan değiştirmez

**Kapsam dışı:** Görünürlüğü değiştirmek yalnız ürün sahibinin işidir; hiçbir ajan bunu kendiliğinden yapmaz.

**Oku:** `AGENTS.md`, §21.1, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-01](K00-depo-kurallari.md#K00-01), [K00-07](K00-depo-kurallari.md#K00-07), [K10-01](K10-bildirim-eposta-sms.md#K10-01), [K13-01](K13-davetiye-takvim.md#K13-01), [K14-01](K14-belge-odeme.md#K14-01), [K15-01](K15-chatbot.md#K15-01), [K17-01](K17-staging-kabul.md#K17-01)

---

<a id="K00-07"></a>
## K00-07 · İnsan inceleyicinin atanması (§21.3 kapıları)

**Boyut:** S · **Dalga:** 0 · **Tür:** karar
**Başlamadan önce `main`'de olması gerekenler:** yok
**Ürün sahibinden gereken:** Güvenlik-kritik PR'ları inceleyecek insan (isim) veya yazılı risk kabulü. İlk ihtiyaç K02'nin ilk PR'ı birleşmeden önce.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/reports/K00-inceleyici.md`, `.github/CODEOWNERS`

**Teslim edilecekler**
- Ürün sahibi, K02/K03/K05/K11/K13 PR'larını inceleyecek ajan olmayan, yazılım güvenliği deneyimli kişiyi atar (K17 harici incelemeci ayrıdır: K17-01)
- `K00-inceleyici.md`: inceleyenin GitHub kullanıcı adı, hangi kartlar, tahmini yanıt süresi; `CODEOWNERS` bu kişiyi §21.3 dizinlerine bağlar
- Kimse atanmazsa ürün sahibinin yazılı risk kabulü (hangi kart, hangi kapsam) aynı dosyaya yazılır; bu durumda ilgili PR'lar "incelenmedi" notuyla birleşir ve risk K17 harici incelemesinin kapsamına eklenir

**Kabul**
- Dosya `main`'de ve her §21.3 kartı için ya atanmış inceleyen ya da yazılı risk kabulü var
- Çözümlenmemiş kritik güvenlik açığı için risk kabulü yazılamaz (§21.3)

**Kapsam dışı:** Bu karar K02 koduna başlamayı engellemez; gate'li PR'ların birleşmesini engeller.

**Oku:** `AGENTS.md`, §21.3, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-01](K00-depo-kurallari.md#K00-01), [K00-06](K00-depo-kurallari.md#K00-06), [K10-01](K10-bildirim-eposta-sms.md#K10-01), [K13-01](K13-davetiye-takvim.md#K13-01), [K14-01](K14-belge-odeme.md#K14-01), [K15-01](K15-chatbot.md#K15-01), [K17-01](K17-staging-kabul.md#K17-01)

---
