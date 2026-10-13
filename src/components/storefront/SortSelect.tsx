"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

const OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name" },
];

export function SortSelect({ defaultValue = "latest" }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, start] = useTransition();

  const current = searchParams.get("sort") ?? defaultValue;

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "latest") {
      params.delete("sort");
    } else {
      params.set("sort", e.target.value);
    }
    const qs = params.toString();
    start(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <select
      value={current}
      onChange={onChange}
      disabled={pending}
      className="h-10 rounded-md bg-black/50 border border-gray-700 text-white px-3 text-sm focus:outline-none focus:border-amber-400 disabled:opacity-50"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}