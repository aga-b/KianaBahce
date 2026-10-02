import Link from "next/link";
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow">
      <span aria-hidden="true">✳</span> {children}
    </p>
  );
}
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page-intro">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      <p className="intro-copy">{children}</p>
    </div>
  );
}
export function Invitation() {
  return (
    <section className="invitation">
      <span className="invitation-flower" aria-hidden="true">
        ✳
      </span>
      <Eyebrow>GÜZEL BİR BAŞLANGIÇ</Eyebrow>
      <h2>
        Hayalinizdeki gün,
        <br />
        <em>sizinle başlasın.</em>
      </h2>
      <p>
        Bir tarih, bir heyecan, anlatılacak bir hikâye.
        <br />
        İlk adımı birlikte düşünelim.
      </p>
      <Link className="button cream" href="/planla">
        Gününüzü planlayın <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
export const faqs = [
  [
    "Tarih seçmem rezervasyon oluşturur mu?",
    "Hayır. Tarih seçimi yalnızca tercihlerinizi hazırlamanızı sağlar. Kesin rezervasyon, mekân ekibinin uygunluğu doğrulaması ve koşulların birlikte netleştirilmesiyle yapılır.",
  ],
  [
    "Düğün planlamasına nereden başlayabilirim?",
    "Önce düşündüğünüz tarihi, yaklaşık davetli sayınızı ve gününüz için önem verdiğiniz detayları belirleyebilirsiniz. Gününüzü planlayın ekranı bu tercihleri bir araya getirmenize yardımcı olur.",
  ],
  [
    "Fiyat ve kapasite bilgisini nereden öğrenebilirim?",
    "Doğru bilgi, düşündüğünüz tarih ve organizasyonun ihtiyaçlarıyla birlikte mekân ekibinden alınmalıdır. Bu sitede henüz doğrulanmış fiyat ve kapasite bilgisi yayımlanmıyor.",
  ],
  [
    "Bu siteden talep gönderebilir miyim?",
    "Online talep ve rezervasyon hizmeti henüz açılmadı. Planlama ekranında hazırladığınız tercihler gönderilmez veya kaydedilmez; sayfa kapandığında silinir.",
  ],
];
export function FAQ({ short = false }: { short?: boolean }) {
  return (
    <div className="faq-list">
      {(short ? faqs.slice(0, 3) : faqs).map(([q, a], i) => (
        <details key={q}>
          <summary>
            <span className="faq-number">0{i + 1}</span>
            {q}
            <span className="plus" aria-hidden="true">
              +
            </span>
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
