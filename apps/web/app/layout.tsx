import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../src/site/header";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Kiana Bahçe — Birlikte, en güzel başlangıca",
    template: "%s | Kiana Bahçe",
  },
  description:
    "Kiana Bahçe ile düğününüze giden yolu keşfedin. Hikâyenizin başlangıcı için ilham alın, tarih tercihlerinizi planlayın.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <a className="skip" href="#main">
          İçeriğe geç
        </a>
        <Header />
        {children}
        <footer>
          <div className="footer-top">
            <Link className="brand footer-brand" href="/">
              kiana<span>BAHÇE</span>
            </Link>
            <p>
              Bazı günler bir ömre değer.
              <br />O güzel başlangıca, birlikte.
            </p>
            <Link className="text-link" href="/planla">
              Gününüzü planlayın <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Kiana Bahçe</span>
            <nav aria-label="Alt menü">
              <Link href="/sikca-sorulan-sorular">Sıkça sorulan sorular</Link>
              <Link href="/iletisim">İletişim</Link>
              <Link href="/gizlilik">Gizlilik</Link>
            </nav>
            <span>Doğadan ilhamla.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
