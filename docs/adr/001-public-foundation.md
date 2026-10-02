# ADR-001 — İskelet ve public arayüz önceliği
Tarih: 2026-10-02 · Durum: kullanıcının açık kapsam talimatıyla uygulandı.

Kullanıcı inceleme sonrası “tek başına, iskeleti çıkar, public arayüzü yaz, sıradan ne gerekiyorsa yap” talimatını verdi. Bu teslimat tek ajanla, ayrı geliştirme dalında yürütülür. Önceki tek iş paketi / bağımlılıkların main üzerinde kapanması kuralı bu bütünleşik başlangıç teslimatı için değiştirilmiştir. Mevcut K kartları tamamlanmış sayılmaz; yalnız karşılanan alt çıktılar raporlanır.

Kapsam: workspace, TypeScript, lint, build, CI, web ve iki işçi iskeleti, erişilebilir public sayfalar, tarih tercihleri ve açık servis-yok durumu. Public UI, CMS ve rezervasyon motorundan önce bağımsız geliştirilir. Kullanıcının bu talimatı nihai içerik/hukuki metin veya canlıya çıkış onayı değildir.

Gerçek iletişim, kapasite, fiyat, müşteri yorumu uydurulmaz. Mekân fotoğrafı yerine özgün dekoratif botanik SVG kullanılır. Tarih seçimi yalnız tarayıcı belleğindedir, uygunluk veya rezervasyon sonucu üretilmez; kişisel bilgi toplanmaz. Domain, auth, DB ve entegrasyon paketleri yalnız sınır iskeletidir. Üretime dağıtım yoktur.
