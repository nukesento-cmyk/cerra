import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/");
  if (session.role !== "admin") redirect("/");
  if (session.mustChangePassword) redirect("/admin/first-login");

  return (
    <div className="min-h-dvh bg-black text-white">
      <header className="border-b border-amber-400/20">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="text-lg font-light tracking-wide"
          >
            Cerrá <span className="text-amber-400">Admin</span>
          </Link>

          <AdminNav />
        </div>
      </header>
      {children}
    </div>
  );
}