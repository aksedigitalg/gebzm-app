"use client";

import { Bell, Search, Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearch } from "@/components/SearchProvider";
import { useAuth } from "@/components/AuthProvider";
import { getGreeting } from "@/lib/greeting";

export function DesktopTopBar() {
  const { open } = useSearch();
  const { user, guest } = useAuth();
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    const id = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(id);
  }, []);

  const GreetingIcon = greeting.icon;
  const displayName = user
    ? user.firstName || "Kullanıcı"
    : "Misafir";

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Arama */}
      <button
        type="button"
        onClick={open}
        className="flex flex-1 items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-muted max-w-2xl"
      >
        <Search className="h-4 w-4" />
        <span>Ara...</span>
        <span className="ml-auto hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] md:block">
          ⌘K
        </span>
      </button>

      {/* Selamlama */}
      {!guest && (
        <div className="hidden items-center gap-1.5 text-muted-foreground lg:flex">
          <GreetingIcon className="h-4 w-4" />
          <span className="text-xs font-medium">
            {greeting.text}, {displayName}
          </span>
        </div>
      )}

      {/* Bildirim */}
      <button
        type="button"
        aria-label="Bildirimler"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
      </button>
    </header>
  );
}
