"use client";

import { Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Şifre",
  autoFocus,
}: Props) {
  const [show, setShow] = useState(false);
  return (
    <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
      <Lock className="h-5 w-5 text-muted-foreground" />
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="p-1 text-muted-foreground transition hover:text-foreground"
        aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </label>
  );
}
