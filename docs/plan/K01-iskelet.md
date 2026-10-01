# K01 — Çalışan proje iskeleti

**Kilometre taşı:** M0 — Temel ve hazırlık (K00–K04) · **Şartname:** §5, §6, §19.1, §22.1 · [Plan dizini](README.md)

> Temiz checkout'tan tekrarlanabilir kurulum, çalışan minimal web ve işçiler, CI ve staging'e otomatik dağıtım.

Gerçek SMS/LLM/müşteri verisi yoktur; sağlayıcılar fake adaptördür ve yalnız development/test'te etkindir.

| İş paketi | Boyut | Dalga | Bağımlılık | Not |
|---|---|---|---|---|
| [K01-01](K01-iskelet.md#K01-01) · pnpm workspace ve TypeScript/lint temeli | M | 2 | K00-02, K00-04 |  |
| [K01-02](K01-iskelet.md#K01-02) · apps/web: minimal Next.js, sağlık ucu, baz güvenlik başlıkları | M | 3 | K01-01 |  |
| [K01-03](K01-iskelet.md#K01-03) · apps/worker ve apps/media-worker: minimal süreçler ve sağlık kontrolü | S | 3 | K01-01 |  |
| [K01-04](K01-iskelet.md#K01-04) · Ortam değişkeni şeması ve development/staging ayrımı | S | 3 | K01-01 |  |
| [K01-05](K01-iskelet.md#K01-05) · Sağlayıcı portları ve fake adaptörler (SMS, e-posta, asistan) | M | 4 | K01-04 |  |
| [K01-06](K01-iskelet.md#K01-06) · Test altyapısı ve tam CI (lint, typecheck, test, build, gerçek PostgreSQL) | M | 5 | K01-02, K01-03, K01-05 |  |
| [K01-07](K01-iskelet.md#K01-07) · Container imajları (non-root, sabit sürüm, health) | M | 4 | K01-02, K01-03 |  |
| [K01-08](K01-iskelet.md#K01-08) · Staging hosting seçimi ve hesabı | S | 1 | K00-01 | ürün sahibi girdisi, karar |
| [K01-09](K01-iskelet.md#K01-09) · Staging'e otomatik dağıtım (yalnız health + sürüm) | M | 6 | K01-06, K01-07, K01-08 |  |

<a id="K01-01"></a>
## K01-01 · pnpm workspace ve TypeScript/lint temeli

**Boyut:** M · **Dalga:** 2 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K00-02](K00-depo-kurallari.md#K00-02), [K00-04](K00-depo-kurallari.md#K00-04)

**Dokunabileceğin yollar (yalnız bunlar):** `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `tsconfig.base.json`, `.nvmrc`, `.npmrc`, `eslint.config.mjs`, `.prettierrc`, `packages/*/package.json`, `packages/*/tsconfig.json`, `packages/*/src/index.ts`, `docs/dependencies.md`

**Teslim edilecekler**
- pnpm workspace; Node.js desteklenen LTS (`.nvmrc` + `engines`); `tsconfig.base.json` strict
- §6'daki paket iskeletleri boş ama derlenen halde: `packages/{domain,application,db,auth,contracts,integrations,ui,observability}`
- ESLint + Prettier; bağımlılık yönü kuralı (domain → React/Next/SDK import edemez) lint kuralı olarak
- `docs/dependencies.md`: seçilen paketlerin tam sürümü, lisansı ve gerekçesi (§5.1 envanter şartı)

**Kabul**
- Temiz checkout'ta `pnpm install --frozen-lockfile && pnpm -r build && pnpm -r lint` geçer
- Domain paketinde `next` import'u eklemek lint hatası verir (kanıtlı)
- Kilit dosyası commit'li; sürümler sabit

**Kapsam dışı:** Next.js uygulaması, DB, auth ve testler bu pakette yoktur.

**Oku:** `AGENTS.md`, §5.1, §6 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-05](K00-depo-kurallari.md#K00-05), [K20-01](K20-tasarim-icerik.md#K20-01), [K20-02](K20-tasarim-icerik.md#K20-02), [K20-06](K20-tasarim-icerik.md#K20-06), [K03-13](K03-kimlik-uyelik.md#K03-13), [K10-02](K10-bildirim-eposta-sms.md#K10-02), [K11-01](K11-medya-temeli.md#K11-01)

**Bunu bekleyenler:** [K01-02](K01-iskelet.md#K01-02), [K01-03](K01-iskelet.md#K01-03), [K01-04](K01-iskelet.md#K01-04)

---

<a id="K01-02"></a>
## K01-02 · apps/web: minimal Next.js, sağlık ucu, baz güvenlik başlıkları

**Boyut:** M · **Dalga:** 3 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K01-01](K01-iskelet.md#K01-01)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/web/`

**Teslim edilecekler**
- Next.js App Router + TypeScript strict + Tailwind (+ shadcn/ui kurulumu); minimal ana sayfa ("yakında" içeriği, gerçek içerik yok)
- `GET /api/health` (readiness): yalnız `status` ve sürüm/commit; sır, tablo adı, istatistik yok
- Baz güvenlik başlıkları: `X-Content-Type-Options: nosniff`, `frame-ancestors` (CSP içinde), güvenli referrer politikası; CSP şimdilik raporlama modunda (sıkılaştırma K17'de)
- Kök layout `use client` değil; özel yolların `no-store` varsayılanı için yardımcı (kullanımı sonraki kartlarda)

**Kabul**
- `pnpm --filter web dev` ve `build` çalışır; ana sayfa ve `/api/health` yanıt verir
- Yanıt başlıkları testle doğrulanır
- İstemci bundle'ında `NEXT_PUBLIC_*` dışında sunucu değişkeni yok (basit denetim betiği)

**Kapsam dışı:** Gerçek sayfa, tasarım, kimlik, DB bağlantısı yoktur.

**Oku:** `AGENTS.md`, §5.1, §5.2, §17.3, §19.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K01-03](K01-iskelet.md#K01-03), [K01-04](K01-iskelet.md#K01-04), [K20-03](K20-tasarim-icerik.md#K20-03), [K20-05](K20-tasarim-icerik.md#K20-05)

**Bunu bekleyenler:** [K01-06](K01-iskelet.md#K01-06), [K01-07](K01-iskelet.md#K01-07)

---

<a id="K01-03"></a>
## K01-03 · apps/worker ve apps/media-worker: minimal süreçler ve sağlık kontrolü

**Boyut:** S · **Dalga:** 3 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K01-01](K01-iskelet.md#K01-01)

**Dokunabileceğin yollar (yalnız bunlar):** `apps/worker/`, `apps/media-worker/`

**Teslim edilecekler**
- İki ayrı Node.js süreci: başlar, `SIGTERM`'de düzgün kapanır, yapılandırılmış log yazar
- Her biri liveness/readiness için küçük HTTP ucu veya dosya tabanlı kontrol (sır içermez)
- pg-boss ve medya kütüphaneleri henüz eklenmez

**Kabul**
- Her işçi lokal olarak başlar ve sağlık kontrolü yeşil
- Kapatma sinyalinde süreç temiz çıkar

**Kapsam dışı:** Kuyruk, iş, FFmpeg/sharp bu pakette yoktur (K04, K11).

**Oku:** `AGENTS.md`, §5, §6, §19.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K01-02](K01-iskelet.md#K01-02), [K01-04](K01-iskelet.md#K01-04), [K20-03](K20-tasarim-icerik.md#K20-03), [K20-05](K20-tasarim-icerik.md#K20-05)

**Bunu bekleyenler:** [K01-06](K01-iskelet.md#K01-06), [K01-07](K01-iskelet.md#K01-07), [K11-09](K11-medya-temeli.md#K11-09)

---

<a id="K01-04"></a>
## K01-04 · Ortam değişkeni şeması ve development/staging ayrımı

**Boyut:** S · **Dalga:** 3 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K01-01](K01-iskelet.md#K01-01)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/contracts/src/env/`, `.env.example`

**Teslim edilecekler**
- Zod ile ortam değişkeni şeması: `development | test | staging | production`; eksik/geçersiz değerde süreç başlamaz
- `.env.example` yalnız sahte/yer tutucu değerler içerir; `.env*` `.gitignore`'da
- Fake adaptör bayrağı: üretimde `true` olursa süreç başlamaz

**Kabul**
- Şema birim testleri: eksik değişken, yanlış ortam, üretimde fake bayrağı → hata
- Repoda gerçek sır yok (CI sır taraması yeşil)

**Oku:** `AGENTS.md`, §5.1, §17.4, §19.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K01-02](K01-iskelet.md#K01-02), [K01-03](K01-iskelet.md#K01-03), [K20-03](K20-tasarim-icerik.md#K20-03), [K20-05](K20-tasarim-icerik.md#K20-05)

**Bunu bekleyenler:** [K01-05](K01-iskelet.md#K01-05), [K02-01](K02-db-erisim-cekirdegi.md#K02-01)

---

<a id="K01-05"></a>
## K01-05 · Sağlayıcı portları ve fake adaptörler (SMS, e-posta, asistan)

**Boyut:** M · **Dalga:** 4 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K01-04](K01-iskelet.md#K01-04)

**Dokunabileceğin yollar (yalnız bunlar):** `packages/integrations/`

**Teslim edilecekler**
- Port arayüzleri: `SmsProvider` (`send`, `lookup`, `verifyWebhook`), `EmailProvider` (`send`, `verifyWebhook`), `AssistantProvider`; capability bildirimi (idempotency anahtarı, durum sorgusu, teslim raporu)
- Fake adaptörler: deterministik, giden mesajları belleğe/dosyaya kaydeder, test için okunabilir; yalnız `development|test` ortamında yüklenir
- `ObjectStorage` portu bu pakette yoktur (K11-01)

**Kabul**
- Fake adaptör `staging`/`production`'da yüklenmeye çalışılırsa hata verir (test)
- İş kodunun sağlayıcı SDK'sı import etmediğini doğrulayan lint/import kuralı

**Kapsam dışı:** Gerçek sağlayıcı adaptörü yazılmaz (K10, K15).

**Oku:** `AGENTS.md`, §12.4, §15, §6 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K01-07](K01-iskelet.md#K01-07), [K20-04](K20-tasarim-icerik.md#K20-04)

**Bunu bekleyenler:** [K01-06](K01-iskelet.md#K01-06), [K03-09](K03-kimlik-uyelik.md#K03-09), [K10-03](K10-bildirim-eposta-sms.md#K10-03), [K15-02](K15-chatbot.md#K15-02)

---

<a id="K01-06"></a>
## K01-06 · Test altyapısı ve tam CI (lint, typecheck, test, build, gerçek PostgreSQL)

**Boyut:** M · **Dalga:** 5 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K01-02](K01-iskelet.md#K01-02), [K01-03](K01-iskelet.md#K01-03), [K01-05](K01-iskelet.md#K01-05)

**Dokunabileceğin yollar (yalnız bunlar):** `.github/workflows/`, `tests/`, `vitest.config.ts`, `playwright.config.ts`, `infra/dev/`

**Teslim edilecekler**
- Vitest (unit/integration) ve Playwright iskeleti; `tests/{integration,e2e,security}` dizinleri örnek bir testle
- Gerçek PostgreSQL: CI servis konteyneri ve yerel `infra/dev/docker-compose.yml` (üretim ana sürümüne yakın sürüm)
- CI işleri: lint, typecheck, unit, build, sır taraması; e2e/integration işi hazır ve DB'ye bağlı
- Gerekli kontrol adları `K00-04` ile uyumlu; sonuç özeti PR'da görünür

**Kabul**
- PR'da tüm işler yeşil; bilerek bozulan testte kırmızı
- Entegrasyon testi gerçek Postgres'e bağlanır (SQLite/mock yok)

**Kapsam dışı:** Domain testleri yazılmaz; yalnız altyapı ve örnek test.

**Oku:** `AGENTS.md`, §5.1, §20 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K20-07](K20-tasarim-icerik.md#K20-07)

**Bunu bekleyenler:** [K01-09](K01-iskelet.md#K01-09), [K02-01](K02-db-erisim-cekirdegi.md#K02-01)

---

<a id="K01-07"></a>
## K01-07 · Container imajları (non-root, sabit sürüm, health)

**Boyut:** M · **Dalga:** 4 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K01-02](K01-iskelet.md#K01-02), [K01-03](K01-iskelet.md#K01-03)

**Dokunabileceğin yollar (yalnız bunlar):** `infra/docker/`

**Teslim edilecekler**
- Web, worker, media-worker için çok aşamalı Dockerfile: non-root, sabit taban imaj ve bağımlılık, readiness/liveness
- Yerel `docker compose` ile üçü birden kalkar (sahte env ile)
- İmajda sır, `.env` ve kaynak dışı dosya yok (`.dockerignore`)

**Kabul**
- İmajlar derlenir, `docker run` ile sağlık uçları yeşil
- `docker inspect` kullanıcısı root değil

**Kapsam dışı:** Hosting'e dağıtım yoktur (K01-09).

**Oku:** `AGENTS.md`, §19.1, §17.4 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K01-05](K01-iskelet.md#K01-05), [K20-04](K20-tasarim-icerik.md#K20-04)

**Bunu bekleyenler:** [K01-09](K01-iskelet.md#K01-09), [K11-09](K11-medya-temeli.md#K11-09)

---

<a id="K01-08"></a>
## K01-08 · Staging hosting seçimi ve hesabı

**Boyut:** S · **Dalga:** 1 · **Tür:** karar
**Başlamadan önce `main`'de olması gerekenler:** [K00-01](K00-depo-kurallari.md#K00-01)
**Ürün sahibinden gereken:** Staging için hosting/DB/depolama sağlayıcısı, bütçe ve alan adı kararı + hesap erişimi.

**Dokunabileceğin yollar (yalnız bunlar):** `docs/adr/`, `docs/reports/`

**Teslim edilecekler**
- Ürün sahibinin seçtiği hosting + yönetilen PostgreSQL + nesne depolama (staging, düşük maliyet) için kısa karar kaydı: sağlayıcı, bölge, aylık tahmini maliyet, SSE/uzun bağlantı ve sürekli worker desteği
- Gerekli erişim (dağıtım token'ı, alan adı/alt alan adı) ürün sahibince korumalı environment sırlarına girilir; sırlar repoya girmez

**Kabul**
- Karar kaydı `docs/adr/` altında; §19.1 şartlarına (Docker/Node, sürekli worker, SSE) uyumu işaretli
- Bağlantı bütçesi için DB `max_connections` değeri kayda geçti

**Kapsam dışı:** Üretim hesabı açılmaz (K18).

**Oku:** `AGENTS.md`, §19.1, §19.6, §23 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K00-02](K00-depo-kurallari.md#K00-02), [K00-03](K00-depo-kurallari.md#K00-03), [K00-04](K00-depo-kurallari.md#K00-04)

**Bunu bekleyenler:** [K01-09](K01-iskelet.md#K01-09), [K03-13](K03-kimlik-uyelik.md#K03-13), [K10-02](K10-bildirim-eposta-sms.md#K10-02), [K11-01](K11-medya-temeli.md#K11-01), [K18-02](K18-canliya-gecis.md#K18-02)

---

<a id="K01-09"></a>
## K01-09 · Staging'e otomatik dağıtım (yalnız health + sürüm)

**Boyut:** M · **Dalga:** 6 · **Tür:** kod
**Başlamadan önce `main`'de olması gerekenler:** [K01-06](K01-iskelet.md#K01-06), [K01-07](K01-iskelet.md#K01-07), [K01-08](K01-iskelet.md#K01-08)

**Dokunabileceğin yollar (yalnız bunlar):** `.github/workflows/deploy-staging.yml`, `infra/staging/`

**Teslim edilecekler**
- `main` birleşince staging'e dağıtım; korumalı environment ve asgari izinli token; `main` birleşmesi üretim dağıtımını yetkilendirmez
- Staging'de web + worker + media-worker ayakta; `/api/health` sürüm/commit gösterir
- Staging'de gerçek veri ve gerçek SMS/LLM yok

**Kabul**
- Staging URL'sinde health yeşil ve sürüm son `main` commit'iyle eşleşir
- Dağıtım başarısızsa önceki sürüm ayakta kalır (kanıtlı)

**Kapsam dışı:** Üretim dağıtımı yoktur.

**Oku:** `AGENTS.md`, §19.1, §21.1 (+ zorunlu: §1, §4, §20.2)

**Aynı dalgada paralel çalışabilir:** [K02-01](K02-db-erisim-cekirdegi.md#K02-01)

**Bunu bekleyenler:** [K21-07](K21-yonetim-kabugu-takvim.md#K21-07), [K07-01](K07-kurumsal-site-icerik.md#K07-01), [K11-05](K11-medya-temeli.md#K11-05), [K17-03](K17-staging-kabul.md#K17-03), [K17-05](K17-staging-kabul.md#K17-05)

---
