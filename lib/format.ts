export const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

export function formatListTime(ts: number) {
  const d = new Date(ts);
  if (d.toDateString() === new Date().toDateString()) return formatTime(ts);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}