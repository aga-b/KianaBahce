import { PageIntro, FAQ } from "../../src/site/components";
export const metadata = { title: "Sıkça sorulan sorular" };
export default function Questions() {
  return (
    <main id="main">
      <PageIntro eyebrow="MERAK ETTİKLERİNİZ" title="Sorularınıza yer var.">
        İlk adımdan önce aklınızdakileri netleştirin.
      </PageIntro>
      <section className="section narrow">
        <FAQ />
      </section>
    </main>
  );
}
