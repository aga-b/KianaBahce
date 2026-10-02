import Link from "next/link";
import { PageIntro, Invitation } from "../../src/site/components";
export const metadata = { title: "Hikâyeniz" };
export default function Story() {
  return (
    <main id="main">
      <PageIntro
        eyebrow="SİZİN HİKÂYENİZ"
        title="Her güzel gün, küçük bir hayalle başlar."
      >
        Her şeyi ilk günden bilmeniz gerekmiyor. Önce sizin için önemli olanları
        düşünün; geri kalanını adım adım netleştirin.
      </PageIntro>
      <section className="story-list section">
        {[
          [
            "01",
            "Size ait olanı bulun.",
            "Sakin bir akşam mı, uzun bir kutlama mı? Gününüzü tarif eden üç kelime seçin. Atmosferi düşünmek detayları kolaylaştırır.",
          ],
          [
            "02",
            "Tarihe ve sayılara yer açın.",
            "Aklınızdaki tarihleri ve yaklaşık davetli sayınızı not edin. Bunlar görüşmenizin başlangıç noktası olur.",
          ],
          [
            "03",
            "Detayları birlikte konuşun.",
            "Mekânın uygunluğu, hizmet kapsamı ve koşullar ekip tarafından doğrulanmalıdır. Tercih oluşturmak tek başına rezervasyon değildir.",
          ],
        ].map(([n, t, d]) => (
          <article key={n}>
            <span className="story-number">{n}</span>
            <div>
              <h2>{t}</h2>
              <p>{d}</p>
            </div>
          </article>
        ))}
        <Link className="button" href="/planla">
          Tercihlerinizi hazırlayın ↗
        </Link>
      </section>
      <Invitation />
    </main>
  );
}
