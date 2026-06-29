import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/auth-actions";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-archivo",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Skill Trade | Post a job, get matched with local trades",
  description:
    "Skill Trade connects you with up to five local tradespeople across Ireland. No hidden fees, no dead leads.",
};

const footerLinks: [string, string][] = [
  ["/how-it-works", "How it works"],
  ["/pricing", "For trades"],
  ["/leaderboard", "Leaderboard"],
  ["/contact", "Contact"],
  ["/terms", "Terms"],
  ["/privacy", "Privacy"],
];

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <header className="bg-ink text-white">
          <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-extrabold uppercase tracking-tight font-[family-name:var(--font-archivo)]"
            >
              Skill<span className="text-accent">Trade</span>
            </Link>
            <div className="flex items-center gap-5 text-sm">
              <Link href="/pricing" className="hover:text-accent">
                For trades
              </Link>
              {user ? (
                <>
                  <Link href="/trade/dashboard" className="hover:text-accent">
                    Dashboard
                  </Link>
                  <Link href="/trade/feed" className="hover:text-accent">
                    Job feed
                  </Link>
                  <form action={signOut}>
                    <button className="hover:text-accent">Log out</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="hover:text-accent">
                  Trade log in
                </Link>
              )}
              <Link
                href="/post-job"
                className="bg-accent hover:bg-accent-dark text-ink font-semibold rounded-lg px-4 py-2"
              >
                Post a job
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-ink text-white/60 text-sm">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map(([href, label]) => (
                <Link key={href} href={href} className="hover:text-accent">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
              <p>Skill Trade. No hidden fees. No dead leads.</p>
              <p>Built by SquareTwo</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
