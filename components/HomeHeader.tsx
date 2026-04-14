"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useSearch } from "@/components/SearchProvider";
import { getGreeting } from "@/lib/greeting";

export function HomeHeader() {
  const { user } = useAuth();
  const { open } = useSearch();
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    // Her dakika selamlamayı kontrol et (gün geçişleri için)
    const id = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(id);
  }, []);

  const firstName = user?.firstName?.trim() || "";
  const lastName = user?.lastName?.trim() || "";
  const displayName =
    firstName || lastName
      ? [firstName, lastName].filter(Boolean).join(" ")
      : "Misafir";
  const initials =
    (firstName?.[0] || "") + (lastName?.[0] || "") ||
    (user?.phone?.slice(-2) ?? "GB");

  const GreetingIcon = greeting.icon;

  return (
    <header className="flex items-center gap-[10px] px-5 pt-5">
      {/* Avatar */}
      <Link
        href="/profil"
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-primary-foreground shadow-sm"
        aria-label="Profil"
      >
        {initials.toUpperCase()}
      </Link>

      {/* Greeting + name */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <GreetingIcon className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="text-[11px] font-medium">{greeting.text}</span>
        </div>
        <p className="truncate text-[15px] font-semibold leading-tight">
          {displayName}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Bildirimler"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={open}
          aria-label="Ara"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
