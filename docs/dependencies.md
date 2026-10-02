# Bağımlılıklar
Tam sürümler package.json ve pnpm-lock.yaml içinde sabittir.

| Paket | Lisans | Amaç |
|---|---|---|
| Next.js | MIT | Sunucu ağırlıklı web |
| React / React DOM | MIT | Arayüz |
| TypeScript | Apache-2.0 | Statik tip kontrolü |
| ESLint / typescript-eslint | MIT | Kod ve modül sınırı kontrolü |
| Playwright | Apache-2.0 | Tarayıcı kabul testleri |
| Zod | MIT | Ortam değişkeni şeması (packages/contracts) |
| Vitest | MIT | Entegrasyon ve güvenlik testleri (tests/integration, tests/security) |
| pg (node-postgres) / @types/pg | MIT | Gerçek PostgreSQL'e bağlanan testler; K02'de packages/db'ye taşınır |
| axe-core / Playwright adaptörü | MPL-2.0 | Erişilebilirlik denetimi |

Bu teslimat özel CSS tasarım tokenları kullanır; Tailwind/shadcn kurulumu eklenmemiştir. Harici font, analitik, harita veya ücretli servis yoktur.
