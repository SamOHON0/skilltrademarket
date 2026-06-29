import type { ContactMethod } from "@/lib/types";

// Turns a customer phone number into a wa.me link. Handles Irish formats:
// 0XXXXXXXXX -> 353XXXXXXXXX, +353..., 00353..., already-international.
function waNumber(phone: string): string {
  let d = phone.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "353" + d.slice(1);
  return d;
}

export default function ContactButtons({
  phone,
  email,
  preferred,
}: {
  phone: string;
  email: string;
  preferred: ContactMethod;
}) {
  const items: { method: ContactMethod; label: string; href: string; ext?: boolean }[] = [
    { method: "whatsapp", label: "WhatsApp", href: `https://wa.me/${waNumber(phone)}`, ext: true },
    { method: "call", label: "Call", href: `tel:${phone.replace(/\s/g, "")}` },
    { method: "email", label: "Email", href: `mailto:${email}` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((it) => {
        const isPref = it.method === preferred;
        return (
          <a
            key={it.method}
            href={it.href}
            target={it.ext ? "_blank" : undefined}
            rel={it.ext ? "noopener noreferrer" : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              isPref
                ? "bg-accent text-ink hover:bg-accent-dark"
                : "border border-ink/20 hover:bg-paper"
            }`}
          >
            {it.label}
            {isPref ? " ·  preferred" : ""}
          </a>
        );
      })}
    </div>
  );
}
