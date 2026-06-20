import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
              <Link href="/trade/feed" className="hover:text-accent">
                Job feed
              </Link>
              <Link href="/admin" className="hover:text-accent">
                Admin
              </Link>
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
          <div className="mx-auto max-w-6xl px-4 py-8 flex flex-wrap items-center justify-between gap-4">
            <p>Skill Trade. No hidden fees. No dead leads.</p>
            <p>Built by SquareTwo</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
