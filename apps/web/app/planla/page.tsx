export const dynamic = "force-dynamic";
import { PageIntro } from "../../src/site/components";
import { Planner } from "../../src/site/planner";
export const metadata = { title: "Gününüzü planlayın" };
export default function Plan() {
  return (
    <main id="main">
      <PageIntro
        eyebrow="İLK ADIM, SİZDEN"
        title="Gününüzü birlikte düşünelim."
      >
        Bir tarih, sevdikleriniz ve size ait bir hikâye. İlk tercihlerinizi
        hazırlayın.
      </PageIntro>
      <section className="section planning-layout">
        <Planner />
        <aside>
          <span className="step-icon" aria-hidden="true">
            ❋
          </span>
          <h3>
            Her detayın
            <br />
            bir zamanı var.
          </h3>
          <p>
            Şimdilik yalnızca aklınızdaki günü düşünün. Kesin tarihiniz yoksa
            tercih ettiğiniz bir günle başlayabilirsiniz.
          </p>
          <hr />
          <p className="quiet-note">
            Online rezervasyon henüz açılmadı. Bu ekran yalnızca plan hazırlığı
            içindir.
          </p>
        </aside>
      </section>
    </main>
  );
}
