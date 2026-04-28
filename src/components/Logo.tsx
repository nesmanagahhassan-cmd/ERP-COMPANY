export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="relative grid place-items-center rounded-xl"
        style={{
          width: size, height: size,
          background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
          boxShadow: "0 6px 20px -6px hsl(var(--primary) / 0.5)",
        }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.6" opacity="0.3" />
          <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="1.8" opacity="0.6" />
          <circle cx="12" cy="12" r="2.4" fill="white" />
          <circle cx="20" cy="6" r="1.6" fill="white" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="font-bold text-base tracking-tight">أوربت</div>
        <div className="text-[10px] text-muted-foreground">ORBIT ERP</div>
      </div>
    </div>
  );
}
