import Link from "next/link";
import Image from "next/image";
import { Eyebrow, FAQ, Invitation } from "../src/site/components";
export default function Home() {
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-copy">
          <Eyebrow>KIANA BAHÇE’YE HOŞ GELDİNİZ</Eyebrow>
          <h1>
            Birlikte,
            <br />
            en güzel
            <br />
            <em>başlangıca.</em>
          </h1>
          <p>
            Doğadan ilham alan bir atmosfer.
            <br />
            Size ait bir hikâye. Bir ömür hatırlanacak bir gün.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/planla">
              Gününüzü planlayın <span aria-hidden="true">↗</span>
            </Link>
            <Link className="text-link" href="/mekan">
              Kiana’yı keşfedin <span aria-hidden="true">↓</span>
            </Link>
          </div>
          <div className="hero-note">
            <span className="line" /> SİZİN HİKÂYENİZ, SİZİN GÜNÜNÜZ.
          </div>
        </div>
        <div className="hero-art">
          <Image
            src="/garden.svg"
            alt="Doğadan ilham alan dekoratif bahçe illüstrasyonu"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 50vw"
          />
          <div className="art-label">
            BİR GÜNDEN
            <br />
            <em>çok daha fazlası.</em>
          </div>
          <div className="art-caption">KIANA BAHÇE · BOTANİK İLLÜSTRASYON</div>
          <span className="hero-seal" aria-hidden="true">
            birlikte
            <br />
            <b>✳</b>
            <br />
            her şey güzel
          </span>
        </div>
      </section>
      <div className="manifesto-strip">
        <span>DOĞADAN İLHAMLA</span>
        <span aria-hidden="true">✳</span>
        <span>SİZE ÖZEL BİR HİKÂYE</span>
        <span aria-hidden="true">✳</span>
        <span>GÜZEL BAŞLANGIÇLARA</span>
      </div>
      <section className="intro-section section">
        <div>
          <Eyebrow>KIANA RUHU</Eyebrow>
          <h2>
            En güzel anlar,
            <br />
            <em>olduğu gibi.</em>
          </h2>
        </div>
        <div className="intro-text">
          <p className="large-copy">
            Telaştan uzak bir his.
            <br />
            Sevdiklerinizle aynı masada,
            <br />
            kendiniz gibi olduğunuz bir gün.
          </p>
          <p>
            Kiana Bahçe’nin hikâyesi, birlikte olmanın güzelliğinden ilham
            alıyor. Sizin için anlamlı olan detaylarla, size ait bir başlangıç
            hayal ediyoruz.
          </p>
          <Link className="text-link" href="/mekan">
            Kiana’yı yakından tanıyın <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <section className="journey section">
        <div className="section-heading">
          <div>
            <Eyebrow>HİKÂYENİZİN İLK ADIMLARI</Eyebrow>
            <h2>
              O güne giden
              <br />
              <em>güzel bir yol.</em>
            </h2>
          </div>
          <Link className="text-link" href="/hikayeniz">
            Yolculuğu keşfedin ↗
          </Link>
        </div>
        <div className="steps">
          {[
            [
              "01",
              "Hayal edin",
              "Nasıl bir gün düşlüyorsunuz? Sizin için vazgeçilmez olan detaylarla başlayın.",
              "✧",
            ],
            [
              "02",
              "Bir tarih düşünün",
              "Aklınızdaki tarihi ve davetli sayınızı belirleyin. Alternatiflere de yer açın.",
              "☼",
            ],
            [
              "03",
              "Birlikte netleştirin",
              "Uygunluk ve koşulları mekân ekibiyle görüşerek planınızı şekillendirin.",
              "❋",
            ],
          ].map(([n, t, d, icon]) => (
            <article key={n}>
              <div className="step-top">
                <span>{n}</span>
                <span className="step-icon" aria-hidden="true">
                  {icon}
                </span>
              </div>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="faq-section section">
        <div>
          <Eyebrow>AKLINIZDAKİ SORULAR</Eyebrow>
          <h2>
            Küçük detaylar,
            <br />
            <em>içiniz rahat olsun.</em>
          </h2>
          <Link className="text-link" href="/sikca-sorulan-sorular">
            Tüm sorular ↗
          </Link>
        </div>
        <FAQ short />
      </section>
      <Invitation />
    </main>
  );
}
