const STYLES: Record<string, string> = {
    pending: "bg-amber-400/10 text-amber-400",
    paid: "bg-green-500/10 text-green-400",
    shipped: "bg-blue-500/10 text-blue-400",
    delivered: "bg-emerald-500/10 text-emerald-400",
    cancelled: "bg-red-500/10 text-red-400",
  };
  
  const LABELS: Record<string, string> = {
    pending: "Pending",
    paid: "Paid",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  
  export function OrderStatusBadge({ status }: { status: string }) {
    return (
      <span
        className={`text-xs uppercase tracking-wider px-2.5 py-1 rounded ${
          STYLES[status] ?? "bg-gray-500/10 text-gray-400"
        }`}
      >
        {LABELS[status] ?? status}
      </span>
    );
  }