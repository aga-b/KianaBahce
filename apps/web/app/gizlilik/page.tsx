import { PageIntro } from "../../src/site/components";
export const metadata = { title: "Gizlilik" };
export default function Privacy() {
  return (
    <main id="main">
      <PageIntro eyebrow="GİZLİLİK" title="Tercihleriniz size ait.">
        Bu arayüzün mevcut çalışma biçimi hakkında.
      </PageIntro>
      <section className="section narrow prose">
        <h2>Planlama ekranı</h2>
        <p>
          Tarih ve davetli sayısı tercihleriniz yalnız açık sayfanın belleğinde
          tutulur. Sunucuya gönderilmez, kalıcı olarak kaydedilmez ve sayfa
          yenilendiğinde silinir. Ad, e-posta veya telefon istenmez.
        </p>
        <h2>Çerez ve dış hizmetler</h2>
        <p>
          Bu sürüm analitik, reklam, harita veya üçüncü taraf font hizmeti
          yüklemez. Uygulama tercih saklayan çerez kullanmaz. Barındırma
          ortamının teknik erişim kayıtları ayrı olarak değerlendirilmelidir.
        </p>
        <h2>Online hizmetler açılmadan önce</h2>
        <p>
          Veri sorumlusu bilgileri ve ilgili aydınlatma metinleri işletme
          tarafından tamamlanacaktır. Bu açıklama nihai KVKK aydınlatma metni
          yerine geçmez.
        </p>
      </section>
    </main>
  );
}
