import Image from "next/image";
import { PageIntro, Invitation } from "../../src/site/components";
export const metadata = { title: "Kiana’yı keşfedin" };
export default function Venue() {
  return (
    <main id="main">
      <PageIntro
        eyebrow="KIANA’YI KEŞFEDİN"
        title="Doğadan ilham alan bir başlangıç."
      >
        Bir günün güzelliği, o gün kendinizi nasıl hissettiğinizde saklı. Kiana
        Bahçe için hayal ettiğimiz duygu: doğal, samimi, size ait.
      </PageIntro>
      <section className="venue-story section">
        <div className="venue-art">
          <Image
            src="/garden.svg"
            alt="Botanik bahçe illüstrasyonu; mekân fotoğrafı değildir"
            fill
            sizes="(max-width:760px) 100vw, 45vw"
          />
        </div>
        <div>
          <p className="eyebrow">BİRLİKTE OLMANIN GÜZELLİĞİ</p>
          <h2>
            Bir mekândan önce,
            <br />
            <em>bir his.</em>
          </h2>
          <p className="large-copy">
            Bir bakış, uzun bir sohbet, aynı şarkıda buluşan sevdikleriniz.
          </p>
          <p>
            Gününüzü planlarken önce size iyi gelen anları düşünün. Detayları
            birlikte netleştirmenin ilk adımı, nasıl bir gün istediğinizi
            anlatmak.
          </p>
          <p className="quiet-note">
            Bu sayfadaki görsel dekoratif bir illüstrasyondur. Mekâna ait
            fotoğraf, kapasite ve olanak bilgileri doğrulandığında burada
            paylaşılacaktır.
          </p>
        </div>
      </section>
      <Invitation />
    </main>
  );
}
