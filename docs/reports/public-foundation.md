# v0.1.0 — Public arayüz ve iskelet

2026-10-02. Tek ajanla, kullanıcının iskelet + public arayüz önceliği kapsamında hazırlandı.

## Teslim
- pnpm workspace, Node 24, TypeScript strict, modül sınırı lint kuralı.
- Next.js 16.3.8 / React 19.3.0; yedi public sayfa, 404, health ve robots.
- Mobil menü, klavye ile SSS, tarih/davetli planı. Gerçek uygunluk, kayıt veya gönderim iddiası yok.
- Özgün botanik SVG; üçüncü taraf font/analitik/fotoğraf yok. Renk, tipografi ve boşluk tokenları CSS içinde.
- İki boş işçi süreci; sağlık uçları ve SIGTERM kapanışı. Domain/auth/db vb. sekiz paket sınırı derleniyor; iş mantığı henüz yok.
- GitHub CI, SHA ile sabit action'lar, Docker/Compose başlangıcı, PR şablonu, bağımlılık ve içerik envanteri.
- Plan bağımlılık/dalga/link betiği; K00-06 yol ve K19 referans düzeltmesi, karar kartlarının çıktı yolları.

## Doğrulama
- `pnpm lint`, `pnpm typecheck`, `pnpm build`: geçti.
- `pnpm test`: 4/4 geçti; İstanbul tarih sınırı, geçmiş/bozuk tarih, tam sayı davetli denetimi.
- `pnpm check:plan`: 227 paket, döngü/eksik bağımlılık yok, dalgalar ve yerel bağlantılar geçerli.
- Playwright: masaüstü + mobil toplam 8/8 geçti. Yedi sayfada axe WCAG A/AA taraması, yatay taşma, planlama/düzenleme/yenileme, SSS klavye, mobil menü Escape, health/404.
- Chromium varsayılan CDN indirmesi bu ortamda bozuk arşiv döndürdü. Yerel doğrulama npm üzerinden alınan `@sparticuz/chromium` 143.0.4 tarayıcısıyla ve Playwright 1.57.0 ile yapıldı. Bu geçici tarayıcı uygulama bağımlılığı değildir. CI normal Playwright indirmesini kullanır.
- Her iki işçinin health yanıtı, no-store ve SIGTERM çıkışı doğrulandı.
- `pnpm audit --prod`: bilinen açık bulunmadı (kontrol anı).
- Ekran görüntüleri `docs/preview/`; masaüstü ve telefon düzeni görsel olarak incelendi.

## Sınırlar ve devam
- K00/K01/K07/K20 paketleri topluca kapatılmadı; asıl kabul kriterlerinin tamamı karşılanmış değildir.
- DB, RLS, auth/MFA, CMS, rezervasyon, gerçek başvuru, provider entegrasyonu ve medya pipeline yok.
- Gerçek iletişim, fotoğraf, kapasite/hizmet ve nihai hukuki içerik işletme girdisi bekliyor. Tüm sayfalar noindex.
- İnsan incelemesi gerektiren iş mantığı henüz uygulanmadı. Branch protection, CODEOWNERS ataması, sır taraması ve bağımlılık yönünün tüm katmanlara genişletilmesi sonraki depo işleri.
- Docker bu ortamda bulunmadığından container build/health testi çalıştırılmadı. Node imaj etiketi üretim öncesi digest ile sabitlenmeli.
- İlk yük JS bütçesi ve yük testi henüz uygulanmadı. Güvenlik başlıkları temel koruma düzeyindedir; tam CSP sonraki sertleştirme işidir.
- CI dosyası eklendi; yerel testlerin geçmesi uzaktaki GitHub Actions sonucunun geçtiği anlamına gelmez.

## Veri / geri dönüş
Yeni kişisel veri alanı veya migration yok; tercihler bellekte kalır. Dal main'e birleşmemiştir. Birleşme sonrası bu başlangıç commit'i geri alınarak dokümantasyon durumuna dönülebilir. Canlı dağıtım yapılmadı.
