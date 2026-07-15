export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-jisp-white border border-jisp-light p-5 flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-jisp-grey">{label}</span>
      <span className="text-2xl font-display">{value}</span>
    </div>
  );
}
