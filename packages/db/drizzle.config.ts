import { defineConfig } from "drizzle-kit";

// Yalnız şema farkı üretmek içindir; uygulama migration'ları src/migrate çalıştırıcısıyla uygulanır, `push` kullanılmaz.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./migrations/.drizzle-diff",
});
