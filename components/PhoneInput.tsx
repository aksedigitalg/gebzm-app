"use client";

import { Phone } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
}

function formatTR(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 8),
    digits.slice(8, 10),
  ].filter(Boolean);
  return parts.join(" ");
}

export function PhoneInput({
  value,
  onChange,
  autoFocus,
  placeholder = "5xx xxx xx xx",
}: Props) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
      <Phone className="h-5 w-5 text-muted-foreground" />
      <span className="select-none text-sm font-medium text-muted-foreground">
        +90
      </span>
      <input
        type="tel"
        inputMode="numeric"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(formatTR(e.target.value))}
        className="h-12 w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

export function isValidPhone(v: string) {
  return v.replace(/\D/g, "").length === 10;
}
