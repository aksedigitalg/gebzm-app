"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Bookmark,
  Compass,
  Home,
  Mail,
  Search,
  User as UserIcon,
} from "lucide-react";
import { socialApi } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { SocialProfile } from "@/lib/types/social";

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u?.token) {
      router.replace("/giris");
      return;
    }
    socialApi
      .getMyProfile()
      .then(p => {
        setProfile(p as unknown as SocialProfile);
        setNeedsOnboarding(false);
      })
      .catch(err => {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("Sosyal profil yok") || msg.includes("needs_onboarding")) {
          setNeedsOnboarding(true);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Onboarding'a yönlendir
  useEffect(() => {
    if (!loading && needsOnboarding && pathname !== "/sosyal/onboarding") {
      router.replace("/sosyal/onboarding");
    }
  }, [loading, needsOnboarding, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Onboarding sayfası kendi başına render
  if (pathname === "/sosyal/onboarding") {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl gap-4 px-4 py-4">
      {/* Sol Sidebar (desktop) */}
      <aside className="sticky top-4 hidden w-56 self-start lg:block">
        <SocialNav profile={profile} pathname={pathname} />
      </aside>

      {/* Ana içerik */}
      <main className="flex-1 min-w-0 pb-20 lg:pb-4">{children}</main>

      {/* Sağ Sidebar — trends (desktop) */}
      <aside className="sticky top-4 hidden w-72 self-start xl:block">
        <RightSidebar />
      </aside>

      {/* Mobil bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
        <MobileNavItem href="/sosyal" icon={Home} active={pathname === "/sosyal"} />
        <MobileNavItem href="/sosyal/kesfet" icon={Compass} active={pathname === "/sosyal/kesfet"} />
        <MobileNavItem href="/sosyal/ara" icon={Search} active={pathname === "/sosyal/ara"} />
        <MobileNavItem href="/sosyal/bildirimler" icon={Bell} active={pathname === "/sosyal/bildirimler"} />
        <MobileNavItem href="/sosyal/mesajlar" icon={Mail} active={pathname?.startsWith("/sosyal/mesajlar")} />
        <MobileNavItem
          href={profile ? `/sosyal/${profile.username}` : "/sosyal"}
          icon={UserIcon}
          active={pathname?.startsWith(`/sosyal/${profile?.username}`)}
        />
      </nav>
    </div>
  );
}

function SocialNav({ profile, pathname }: { profile: SocialProfile | null; pathname: string | null }) {
  const items = [
    { href: "/sosyal", label: "Anasayfa", icon: Home },
    { href: "/sosyal/kesfet", label: "Keşfet", icon: Compass },
    { href: "/sosyal/ara", label: "Ara", icon: Search },
    { href: "/sosyal/bildirimler", label: "Bildirimler", icon: Bell },
    { href: "/sosyal/mesajlar", label: "Mesajlar", icon: Mail },
    { href: "/sosyal/kayitlar", label: "Kayıtlar", icon: Bookmark },
    {
      href: profile ? `/sosyal/${profile.username}` : "/sosyal",
      label: "Profil",
      icon: UserIcon,
    },
  ];
  return (
    <div className="space-y-1">
      <Link href="/profil" className="mb-3 block text-xs text-muted-foreground hover:underline">
        ← Gebzem'e dön
      </Link>
      <h2 className="mb-2 text-lg font-extrabold">GebzemSosyal</h2>
      {items.map(item => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-base font-medium transition ${
              isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} />
            {item.label}
          </Link>
        );
      })}
      {profile && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserIcon className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{profile.display_name}</p>
              <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavItem({
  href,
  icon: Icon,
  active,
}: {
  href: string;
  icon: typeof Home;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-10 w-10 items-center justify-center rounded-full ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
    </Link>
  );
}

function RightSidebar() {
  const [trends, setTrends] = useState<Array<{ tag: string; posts_count: number }>>([]);

  useEffect(() => {
    socialApi
      .getTrendingHashtags()
      .then(t => setTrends(t.slice(0, 7)))
      .catch(() => setTrends([]));
  }, []);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-bold">Gündem</h3>
        {trends.length === 0 && (
          <p className="text-xs text-muted-foreground">Henüz trend yok</p>
        )}
        <ul className="space-y-2">
          {trends.map(t => (
            <li key={t.tag}>
              <Link
                href={`/sosyal/etiket/${t.tag}`}
                className="block rounded-lg px-2 py-1.5 transition hover:bg-muted"
              >
                <p className="text-sm font-bold text-primary">#{t.tag}</p>
                <p className="text-[11px] text-muted-foreground">{t.posts_count} gönderi</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
