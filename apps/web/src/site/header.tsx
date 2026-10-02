"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
const links = [
  ["/mekan", "Kiana’yı keşfedin"],
  ["/hikayeniz", "Hikâyeniz"],
  ["/sikca-sorulan-sorular", "Merak ettikleriniz"],
  ["/iletisim", "İletişim"],
];
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, []);
  return (
    <header className="site-header">
      <Link
        href="/"
        className="brand"
        aria-label="Kiana Bahçe ana sayfa"
        onClick={() => setOpen(false)}
      >
        kiana<span>BAHÇE</span>
      </Link>
      <button
        ref={button}
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? "Kapat ×" : "Menü ☰"}
      </button>
      <nav
        id="navigation"
        aria-label="Ana menü"
        className={open ? "navigation open" : "navigation"}
      >
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={path === href ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
        <Link
          className="button small"
          href="/planla"
          onClick={() => setOpen(false)}
        >
          Gününüzü planlayın <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </header>
  );
}
