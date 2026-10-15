import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { totalRevenue, revenueInRange } from "@/lib/revenue";
import { formatMoneyPair } from "@/lib/currency";

export const instant = false;

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect("/");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [productCount, collectionCount, orderCount, postCount, revenue, thisMonth] =
    await Promise.all([
      prisma.product.count(),
      prisma.collectionMeta.count(),
      prisma.order.count(),
      prisma.post.count(),
      totalRevenue(),
      revenueInRange(startOfMonth, now),
    ]);

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { name: true, email: true },
  });

  const displayName = user?.name || session.email;
  const initials = displayName
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="relative isolate mx-auto max-w-6xl px-6 py-12 selection:bg-cyan-400/20 selection:text-cyan-100 lg:px-10 lg:py-20">
      {/* Single, quiet ambient line at top — no radial glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      {/* Header */}
      <header className="mb-16 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
            <span className="h-px w-6 bg-neutral-700" />
            Admin
          </div>
          <h1 className="text-4xl font-light tracking-[-0.02em] text-neutral-100 sm:text-5xl">
            Dashboard
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Welcome back,{" "}
            <span className="text-neutral-300">{displayName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.015] py-1.5 pl-1.5 pr-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] font-medium tracking-wide text-neutral-300">
            {initials}
          </div>
          <div className="leading-tight">
            <p className="text-xs font-medium text-neutral-200">{displayName}</p>
            <p className="truncate text-[10px] text-neutral-500">{session.email}</p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="mb-16">
        <SectionLabel>Overview</SectionLabel>
        <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            label="Products"
            value={productCount.toLocaleString()}
            href="/admin/products"
            hint="Active catalog items"
          />
          <Stat
            label="Collections"
            value={collectionCount.toLocaleString()}
            href="/admin/collections"
            hint="Curated groupings"
          />
          <Stat
            label="Orders"
            value={orderCount.toLocaleString()}
            href="/admin/dashboard"
            hint="All-time orders"
          />
          <Stat
            label="Posts"
            value={postCount.toLocaleString()}
            href="/admin/posts"
            hint="Published entries"
          />
          <Stat
            label="Total revenue"
            value={formatMoneyPair(revenue)}
            href="/admin/analytics"
            hint="All-time revenue"
          />
          <Stat
            label="This month"
            value={formatMoneyPair(thisMonth)}
            href="/admin/analytics"
            hint="Month-to-date"
          />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <SectionLabel>Manage</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            href="/admin/products"
            title="Products"
            body="Add, edit, and remove catalog items."
          />
          <Card
            href="/admin/collections"
            title="Collections"
            body="Curate groupings and metadata."
          />
          <Card
            href="/admin/account"
            title="Account"
            body="Credentials and security."
          />
          <Card
            href="/admin/analytics"
            title="Analytics"
            body="Revenue, orders, and performance."
          />
        </div>
      </section>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <h2 className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
        {children}
      </h2>
      <div className="h-px flex-1 bg-white/[0.06]" />
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
  value: string;
  href: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between bg-neutral-950 p-6 transition-colors duration-300 hover:bg-white/[0.02] focus-visible:outline-none focus-visible:bg-white/[0.02]"
    >
      {/* Active indicator on hover — a hairline on the left edge */}
      <span
        aria-hidden
        className="absolute inset-y-4 left-0 w-px scale-y-0 bg-cyan-400/70 transition-transform duration-300 group-hover:scale-y-100 group-focus-visible:scale-y-100"
      />

      <div className="flex items-start justify-between">
        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">
          {label}
        </p>
        <svg
          aria-hidden="true"
          className="h-3.5 w-3.5 text-neutral-700 transition-colors duration-300 group-hover:text-cyan-400"
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

      <div className="mt-10">
        <p className="text-3xl font-light tracking-tight text-neutral-100 tabular-nums">
          {value}
        </p>
        <p className="mt-2 text-[11px] text-neutral-600">{hint}</p>
      </div>
    </Link>
  );
}

function Card({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 transition-colors duration-300 hover:border-white/[0.12] hover:bg-white/[0.025] focus-visible:outline-none focus-visible:border-cyan-400/40"
    >
      <h3 className="text-sm font-medium text-neutral-200">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{body}</p>

      <div className="mt-5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-600 transition-colors duration-300 group-hover:text-cyan-400">
        Open
        <svg
          aria-hidden="true"
          className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
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
    </Link>
  );
}