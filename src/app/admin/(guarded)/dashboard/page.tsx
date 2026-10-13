import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const instant = false;

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { name: true, email: true },
  });

  const [productCount, collectionCount, orderCount, postCount] =
    await Promise.all([
      prisma.product.count(),
      prisma.collectionMeta.count(),
      prisma.order.count(),
      prisma.post.count(),
    ]);

  const displayName = user?.name ?? session.email;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="relative mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(251,191,36,0.08),transparent_70%)]"
      />

      {/* Header */}
      <header className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-400/70">
            <span className="h-px w-8 bg-amber-400/40" />
            Admin
          </div>
          <h1 className="text-4xl font-light tracking-tight sm:text-5xl">
            Dashboard
          </h1>
          <p className="mt-3 text-sm text-neutral-400">
            Welcome back,{" "}
            <span className="text-neutral-200">{displayName}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 backdrop-blur-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/90 to-amber-500/70 text-sm font-medium text-neutral-950">
            {initials}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-neutral-100">
              {displayName}
            </p>
            <p className="text-xs text-neutral-500">{session.email}</p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="mb-14">
        <SectionLabel>Overview</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Products"
            value={productCount}
            href="/admin/products"
            hint="Active catalog items"
          />
          <Stat
            label="Collections"
            value={collectionCount}
            href="/admin/collections"
            hint="Curated groupings"
          />
          <Stat
            label="Orders"
            value={orderCount}
            href="/admin/dashboard"
            hint="All-time orders"
          />
          <Stat
            label="Posts"
            value={postCount}
            href="/admin/posts"
            hint="Published journal entries"
          />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <SectionLabel>Manage</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            href="/admin/products"
            title="Products"
            body="Add, edit, and remove products from your catalog."
            accent="from-amber-400/10"
          />
          <Card
            href="/admin/collections"
            title="Collections"
            body="Curate and manage collection metadata."
            accent="from-rose-400/10"
          />
          <Card
            href="/admin/account"
            title="Account"
            body="Update credentials and security settings."
            accent="from-sky-400/10"
          />
        </div>
      </section>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
        {children}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  hint,
}: {
  label: string;
  value: number;
  href: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-amber-400/30 hover:bg-white/[0.04]"
    >
      {/* Hover glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120px 80px at 100% 0%, rgba(251,191,36,0.10), transparent 70%)",
        }}
      />
      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
            {label}
          </p>
          <svg
            className="h-4 w-4 text-neutral-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-amber-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
          </svg>
        </div>
        <p className="mt-4 text-4xl font-light tracking-tight text-neutral-50 tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="mt-2 text-xs text-neutral-500">{hint}</p>
      </div>
    </Link>
  );
}

function Card({
  href,
  title,
  body,
  accent,
}: {
  href: string;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-7 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04]"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-gradient-to-b ${accent} to-transparent opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="relative flex h-full flex-col">
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-amber-400">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-100">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">{body}</p>
        <div className="mt-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-amber-400/80">
          Manage
          <svg
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}