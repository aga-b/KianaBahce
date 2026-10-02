export function todayInIstanbul(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}
export function validatePlan(date, guests, today = todayInIstanbul()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Lütfen bir tarih seçin.";
  const parsed = new Date(`${date}T12:00:00Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  )
    return "Geçerli bir tarih seçin.";
  if (date < today)
    return "Geçmiş bir tarih yerine bugün veya sonrasını seçin.";
  if (
    !/^\d+$/.test(String(guests)) ||
    Number(guests) < 1 ||
    !Number.isSafeInteger(Number(guests))
  )
    return "Davetli sayısını pozitif bir tam sayı olarak girin.";
  return null;
}
