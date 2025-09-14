import * as React from "react";

type LoaderProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  fullscreen?: boolean;
  overlay?: boolean;
  className?: string;
};

const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-9 w-9" };

export default function Loader({
  label = "Loading…",
  size = "md",
  fullscreen = false,
  overlay = false,
  className = "",
}: LoaderProps) {
  const spinner = (
    <div role="status" aria-live="polite" aria-busy="true" className={`relative ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-muted-foreground/20 border-t-current ${sizeMap[size]}`} />
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullscreen) {
    return (
      <div className={`fixed inset-0 grid place-items-center z-50 ${overlay ? "bg-black/5" : ""}`}>
        {spinner}
      </div>
    );
  }
  if (overlay) {
    return <div className="absolute inset-0 grid place-items-center bg-white/60">{spinner}</div>;
  }
  return spinner;
}
