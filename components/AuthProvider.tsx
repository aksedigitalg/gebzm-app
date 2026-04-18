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
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const redirecting = useRef(false);

  // Hydration — sadece bir kez
  useEffect(() => {
    const u = getInitialUser();
    setUserState(u);
    setHydrated(true);
    redirecting.current = false;
  }, []);

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

  // Flash önleme: redirect gerekiyorsa ve hydrate olmadıysa spinner
  const needsRedirect = hydrated && !isPanel && (
    (!user && isProtected) ||
    (user && onAuth) ||
    pathname === "/onboarding"
  );

  const shouldShowContent = hydrated && !needsRedirect;

  if (!hydrated || needsRedirect) {
    return (
      <AuthContext.Provider value={value}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      <div
        className="contents"
        style={{
          opacity: shouldShowContent ? 1 : 0,
          transition: "opacity 0.15s ease",
        }}
      >
        {children}
      </div>
    </AuthContext.Provider>
  );
}
