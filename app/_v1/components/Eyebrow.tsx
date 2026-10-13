export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted mb-6">
      <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
      {children}
    </p>
  );
}
