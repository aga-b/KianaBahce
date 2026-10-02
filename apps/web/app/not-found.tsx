import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="page-intro">
      <p className="eyebrow">404 · SAYFA BULUNAMADI</p>
      <h1>
        Yolunuz güzel
        <br />
        bir başlangıca çıksın.
      </h1>
      <p>Aradığınız sayfa burada değil.</p>
      <Link href="/" className="button">
        Ana sayfaya dön ↗
      </Link>
    </main>
  );
}
