import React from "react";

type BadgeTone = "new" | "limited" | "soldout" | "sale" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  new: "bg-jisp-black text-white",
  limited: "bg-jisp-blue text-jisp-black",
  soldout: "bg-jisp-light text-jisp-grey",
  sale: "bg-jisp-blue-hover text-jisp-black",
  neutral: "bg-jisp-light text-jisp-dark",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block px-2 py-1 text-[10px] font-body uppercase tracking-wider ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
