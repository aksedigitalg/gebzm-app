"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AuthUser,
  getUser,
  setUser as persistUser,
  clearUser as persistClear,
  isAuthRoute,
  syncBuildVersion,
} from "@/lib/auth";
import { isAdminRoute, isBusinessRoute } from "@/lib/panel-auth";

interface AuthContextValue {
  user: AuthUser | null;
  guest: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function isProtectedRoute(pathname: string) {
  return pathname === "/profil" || pathname.startsWith("/profil/");
}

// İlk render'da localStorage'ı SYNC oku — flash önlemek için
function getInitialUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    syncBuildVersion();
    return getUser();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Sync init — SSR'da null, client'ta localStorage'dan oku (flash olmaz)
  const [user, setUserState] = useState<AuthUser | null>(getInitialUser);
  const [hydrated, setHydrated] = useState(() => typeof window !== "undefined");
  const pathname = usePathname();
  const router = useRouter();
  const redirecting = useRef(false);

  // SSR'dan geliyorsa hydration'ı tamamla
  useEffect(() => {
    if (!hydrated) {
      const u = getInitialUser();
      setUserState(u);
      setHydrated(true);
    }
  }, []); // eslint-disable-line

  // Pathname değişince user'ı güncelle (login/logout sonrası)
  useEffect(() => {
    if (!hydrated) return;
    setUserState(getUser());
    redirecting.current = false;
  }, [pathname, hydrated]);

  // Rota koruması
  useEffect(() => {
    if (!hydrated) return;
    if (isAdminRoute(pathname) || isBusinessRoute(pathname)) return;
    if (redirecting.current) return;

    const onAuth = isAuthRoute(pathname);

    if (!user && isProtectedRoute(pathname)) {
      redirecting.current = true;
      router.replace("/giris");
      return;
    }

    if (pathname === "/onboarding") {
      redirecting.current = true;
      router.replace(user ? "/" : "/giris");
      return;
    }

    if (user && onAuth) {
      redirecting.current = true;
      router.replace("/");
      return;
    }
  }, [hydrated, user, pathname, router]);

  const signIn = useCallback((u: AuthUser) => {
    persistUser(u);
    setUserState(u);
    redirecting.current = false;
  }, []);

  const signOut = useCallback(() => {
    persistClear();
    setUserState(null);
    router.replace("/");
  }, [router]);

  const value = useMemo(
    () => ({ user, guest: !user, signIn, signOut }),
    [user, signIn, signOut]
  );

  const isPanel = isAdminRoute(pathname) || isBusinessRoute(pathname);
  const onAuth = isAuthRoute(pathname);
  const isProtected = isProtectedRoute(pathname);

  // Sadece REDIRECT gerektiğinde spinner göster
  // Korumalı olmayan sayfalar HEMEn gösterilir — loading yok!
  const needsRedirect = hydrated && !isPanel && (
    (!user && isProtected) ||
    (user && onAuth) ||
    pathname === "/onboarding"
  );

  // Spinner sadece: protected sayfada login yokken VEYA redirect sırasında
  if (needsRedirect) {
    return (
      <AuthContext.Provider value={value}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AuthContext.Provider>
    );
  }

  // Her durumda direkt içeriği göster — loading yok
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
