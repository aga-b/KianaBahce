"use client";
import { useState, useRef } from "react";
import { todayInIstanbul, validatePlan } from "./planning.mjs";
export function Planner() {
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const result = useRef<HTMLDivElement>(null);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const message = validatePlan(date, guests);
    setError(message);
    if (!message) {
      setStep(2);
      setTimeout(() => result.current?.focus(), 0);
    }
  }
  return (
    <div className="planner">
      <div className="planner-progress" aria-label={`Adım ${step}/2`}>
        <span className="active">01 · Tercihleriniz</span>
        <span className={step === 2 ? "active" : ""}>02 · Planınız</span>
      </div>
      {step === 1 ? (
        <form onSubmit={submit} noValidate>
          <h2>Hangi günü hayal ediyorsunuz?</h2>
          <p>Tarih ve yaklaşık davetli sayısıyla başlayın.</p>
          <div className="fields">
            <label htmlFor="date">
              Düşündüğünüz tarih
              <input
                id="date"
                name="date"
                type="date"
                min={todayInIstanbul()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                aria-describedby={error ? "plan-error" : "plan-note"}
              />
            </label>
            <label htmlFor="guests">
              Yaklaşık davetli sayısı
              <input
                id="guests"
                name="guests"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="Örn. 150"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                required
                aria-describedby={error ? "plan-error" : "plan-note"}
              />
            </label>
          </div>
          {error && (
            <p id="plan-error" role="alert" className="form-error">
              {error}
            </p>
          )}
          <p id="plan-note" className="quiet-note">
            Bu adım uygunluk sorgusu veya rezervasyon oluşturmaz. Tercihleriniz
            gönderilmez ve kaydedilmez.
          </p>
          <button className="button" type="submit">
            Planımı görüntüle <span aria-hidden="true">→</span>
          </button>
        </form>
      ) : (
        <div ref={result} tabIndex={-1} className="plan-result">
          <p className="eyebrow">GÜNÜNÜZE DAİR İLK NOTLAR</p>
          <h2>Güzel bir başlangıç.</h2>
          <dl>
            <div>
              <dt>Düşündüğünüz tarih</dt>
              <dd>
                {new Intl.DateTimeFormat("tr-TR", {
                  dateStyle: "long",
                  timeZone: "Europe/Istanbul",
                }).format(new Date(date + "T12:00:00Z"))}
              </dd>
            </div>
            <div>
              <dt>Yaklaşık davetli sayısı</dt>
              <dd>{Number(guests).toLocaleString("tr-TR")} kişi</dd>
            </div>
          </dl>
          <div className="notice">
            <strong>Henüz bir talep gönderilmedi.</strong>
            <p>
              Online uygunluk ve başvuru hizmeti açıldığında tercihlerinizi
              ekibe iletebileceksiniz. Seçtiğiniz tarihin uygunluğu ve mekân
              kapasitesi henüz doğrulanmadı.
            </p>
          </div>
          <button className="button outline" onClick={() => setStep(1)}>
            ← Tercihlerimi düzenle
          </button>
        </div>
      )}
    </div>
  );
}
