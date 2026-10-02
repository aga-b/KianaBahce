import Link from "next/link";
import { PageIntro } from "../../src/site/components";
export const metadata = { title: "İletişim" };
export default function Contact() {
  return (
    <main id="main">
      <PageIntro eyebrow="TANIŞALIM" title="Güzel bir günün ilk sözü.">
        Aklınızdaki günü anlatmak için önce tercihlerinizi bir araya
        getirebilirsiniz.
      </PageIntro>
      <section className="section contact-grid">
        <div className="contact-card">
          <span className="step-icon" aria-hidden="true">
            ✳
          </span>
          <h2>Birlikte planlamak için.</h2>
          <p>
            Doğrulanmış telefon, adres ve ziyaret bilgileri yakında burada yer
            alacak. Online mesaj gönderimi henüz açılmadı.
          </p>
          <Link className="text-link" href="/planla">
            Tarih tercihlerinizi hazırlayın ↗
          </Link>
        </div>
        <div className="contact-aside">
          <p className="eyebrow">GÖRÜŞMEDEN ÖNCE</p>
          <h3>Küçük bir hazırlık.</h3>
          <ul>
            <li>Düşündüğünüz tarih ve alternatifleri</li>
            <li>Yaklaşık davetli sayınız</li>
            <li>Gününüzde önem verdiğiniz detaylar</li>
          </ul>
          <p>Hazırladığınız tercihler bu aşamada ekibe iletilmez.</p>
        </div>
      </section>
    </main>
  );
}
