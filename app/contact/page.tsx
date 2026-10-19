
import Image from "next/image";
import Link from "next/link";

const contacts = [
  {
    icon: "✉",
    title: "Email",
    detail: "kushagrabajpai2007@gmail.com",
    description: "For questions, feedback, and collaboration.",
    href: "mailto:kushagrabajpai2007@gmail.com",
    action: "Send an email",
  },
  {
    icon: "in",
    title: "LinkedIn",
    detail: "Kushagra Bajpai",
    description: "Connect professionally and discuss ideas.",
    href: "https://www.linkedin.com/in/kushagra-bajpai-180187320/",
    action: "View LinkedIn profile",
  },
  {
    icon: "⌘",
    title: "GitHub",
    detail: "InternShield AI",
    description: "Explore the project and its development.",
    href: "https://github.com/KushagraTechie/internshield-ai",
    action: "Explore repository",
  },
];

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080B16] px-5 py-8 text-white sm:px-8">
      <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-violet-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Navigation */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="InternShield logo"
              width={56}
              height={56}
              priority
              className="h-12 w-12 object-contain"
            />
            <div>
              <p className="text-lg font-bold">
                InternShield <span className="text-violet-400">AI</span>
              </p>
              <p className="text-xs text-slate-400">by ByteSentinels</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
            <Link href="/" className="text-slate-300 transition hover:text-violet-400">
              Home
            </Link>
            <Link href="/login" className="text-slate-300 transition hover:text-violet-400">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-violet-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
            >
              Sign up →
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="grid gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold tracking-[0.15em] text-violet-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              GET IN TOUCH
            </div>

            <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Let&apos;s connect.
              <span className="mt-2 block bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Ideas start here.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-slate-400 sm:text-lg">
              Have a question, a suggestion, or an idea for collaboration?
              I&apos;d love to hear from you. Choose the channel that works
              best for you.
            </p>

            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xl text-emerald-400">
                ✓
              </div>
              <div>
                <p className="font-semibold">Let&apos;s build something meaningful</p>
                <p className="mt-1 text-sm text-slate-400">
                  Questions, feedback, and project discussions are welcome.
                </p>
              </div>
            </div>
          </div>

          {/* Contact cards */}
          <div className="space-y-4">
            {contacts.map((contact) => (
              <article
                key={contact.title}
                className="group rounded-2xl border border-white/10 bg-[#101426]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-violet-500/[0.04] sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-lg font-bold text-violet-300 transition group-hover:bg-violet-500/20">
                    {contact.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold">{contact.title}</h2>
                    <p className="mt-1 break-words text-sm font-medium text-violet-300">
                      {contact.detail}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {contact.description}
                    </p>
                  </div>

                  <span className="text-xl text-violet-400 transition group-hover:translate-x-1">
                    ↗
                  </span>
                </div>

                <a
                  href={contact.href}
                  target={contact.href.startsWith("http") ? "_blank" : undefined}
                  rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white"
                >
                  {contact.action}
                  <span aria-hidden="true">→</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Mission banner */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/10 via-[#101426] to-cyan-500/[0.06] p-7 sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">
                The mission
              </p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Trust starts with transparency.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                InternShield AI aims to help students assess internship
                opportunities using explainable indicators and available
                evidence, so they can make more informed decisions.
              </p>
            </div>

            <Link
              href="/#features"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500"
            >
              Explore the platform →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-col gap-4 border-t border-white/10 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span>
              <span className="font-semibold text-slate-300">InternShield AI</span>
              <span className="ml-2">by ByteSentinels</span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-5">
            <Link href="/login" className="transition hover:text-violet-300">
              Log in
            </Link>
            <Link href="/signup" className="transition hover:text-violet-300">
              Sign up
            </Link>
            <Link href="/verify" className="transition hover:text-violet-300">
              Verify
            </Link>
          </div>

          <p>© 2026 ByteSentinels</p>
        </footer>
      </div>
    </main>
  );
}
