# ADR-002 — DB rolleri, migration biçimi ve geri dönüş
Tarih: 2026-10-03 · Durum: önerildi (insan inceleme kapısı: §21.3, K02-01) · Şartname bağı: SEC-01, §8.1, §17.2, §19.1

**Roller.** Üç ayrı giriş rolü, hiçbiri superuser/`BYPASSRLS`/rol-DB yaratma yetkili değil: `kiana_migrator` (şema sahibi, yalnız migration), `kiana_app` (web runtime; sahip değil, tam DML), `kiana_worker` (dar yetki; varsayılan yalnız SELECT, tablo bazında genişletilir). `infra/db/roles.sql` idempotent ve sırsızdır; parolalar dışarıdan `ALTER ROLE ... PASSWORD` ile verilir. `public` şemada `CREATE` yalnız migrator'dadır; `PUBLIC` yetkileri kaldırılır.

**Migration biçimi.** Zaman damgalı SQL dosyaları `YYYYMMDDHHMM_ad.sql`, `packages/db/migrations/`. Journal dosyası yoktur (paralel PR çakışmasın). Uygulananlar `schema_migrations` tablosunda ad + SHA-256 ile tutulur; her dosya tek transaction'da çalışır, hata tamamen geri alınır. Uygulanmış dosyanın değişmesi hata verir ("yeni migration yaz"). Eşzamanlı çalıştırmalar `pg_advisory_lock` ile sıralanır. Çalıştırıcı yalnız `kiana_migrator` ile çalışır; runtime rolleriyle başlamayı reddeder. Üretimde `drizzle-kit push` yoktur; `drizzle-kit` yalnız şema farkı üretmek için kullanılır.

**Genişlet → taşı → daralt.** Şema değişiklikleri üç ayrı dağıtımda yapılır: (1) geriye uyumlu genişletme (yeni nullable kolon/tablo), (2) uygulama yeni şemaya geçer ve veri taşınır, (3) eski kolon/tablo ayrı bir migration ile kaldırılır. Yıkıcı adım, önceki sürüm artık çalışmıyorken yapılır.

**Geri dönüş.** İleri yönlü migration esastır; geri alma = eski uygulama sürümü + genişletilmiş şemanın uyumluluğu. Veri kaybettiren daraltma öncesi yedek şarttır (K18 runbook). Gerekirse düzeltme yeni bir ileri migration'dır.

**Test.** `tests/integration/helpers/db.ts`: migration içeriğinin hash'ine bağlı şablon veritabanı bir kez kurulur, her test dosyası `CREATE DATABASE ... TEMPLATE` ile temiz kopya alır.
