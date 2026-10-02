# Kiana Bahçe

v0.1.0 — public arayüz ve geliştirme iskeleti. Rezervasyon, kimlik, CMS ve ileti gönderimi henüz bağlı değildir.

## Çalıştırma
Node.js 24, pnpm 11.25.0 ve plan denetimi için Python 3 gerekir.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

http://localhost:3000 üzerinde açılır.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm check:plan
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

İşçiler: `pnpm --filter @kiana/worker start` (3101), `pnpm --filter @kiana/media-worker start` (3102). Önce build gerekir. `/health` yalnız süreç sağlığını bildirir, iş kuyruğu hazır olduğu anlamına gelmez.

## Yapı
- apps/web: Next.js public site
- apps/worker, apps/media-worker: kapanma/sağlık kontrollü boş süreçler
- packages/*: gelecek modüllerin derlenen sınırları
- docs/adr/001-public-foundation.md: kullanıcı talimatıyla uygulanan kapsam

Varsayılan tüm sayfalar noindex; gerçek içerik ve backend kabulü yapılmadan yayınlanmamalıdır. Tarih planı kişisel bilgi toplamaz, saklanmaz ve talep göndermez.

## Container
`docker compose up --build` web ve boş işçi süreçlerini başlatır. Bu ortamda Docker bulunmadığı için imaj build testi yapılmadı. İmajların Node 24 etiketi üretim öncesi digest ile sabitlenmelidir.

Tarayıcı indirmesi kısıtlı ortamlarda `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` ile mevcut Chromium yolu verilebilir. CI varsayılan Playwright tarayıcısını kurar.
