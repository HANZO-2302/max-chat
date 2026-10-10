import { User } from "lucide-react";

const palette = [
  "bg-pink-500",
  "bg-sky-600",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-600",
  "bg-rose-500",
];

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function Avatar({
  id,
  title,
  className = "size-12",
}: {
  id: string;
  title: string;
  className?: string;
}) {
  const letter = /^\p{L}/u.test(title) ? title[0].toUpperCase() : null;
  return (
    <div
      className={`${className} ${palette[hash(id) % palette.length]} grid shrink-0 place-items-center rounded-full text-lg font-semibold text-white`}
    >
      {letter ?? <User className="size-1/2" />}
    </div>
  );
}