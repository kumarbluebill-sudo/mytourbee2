const tone: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900", new: "bg-amber-100 text-amber-900", unpaid: "bg-amber-100 text-amber-900",
  confirmed: "bg-green-100 text-green-900", approved: "bg-green-100 text-green-900", paid: "bg-green-100 text-green-900", won: "bg-green-100 text-green-900", replied: "bg-green-100 text-green-900",
  completed: "bg-blue-100 text-blue-900", contacted: "bg-blue-100 text-blue-900", quoted: "bg-blue-100 text-blue-900",
  cancelled: "bg-red-100 text-red-900", rejected: "bg-red-100 text-red-900", lost: "bg-red-100 text-red-900", refunded: "bg-red-100 text-red-900",
  closed: "bg-gray-200 text-gray-800",
};

export default function StatusBadge({ value }: { value: string }) {
  return <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${tone[value] ?? "bg-gray-200 text-gray-800"}`}>{value}</span>;
}
