"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
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

// Sadece bu rotalar login gerektirir
function isProtectedRoute(pathname: string) {
  return pathname === "/profil" || pathname.startsWith("/profil/");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    syncBuildVersion();
    setUserState(getUser());
    setReady(true);
  }, [pathname]);

  useEffect(() => {
    if (!ready) return;
    if (isAdminRoute(pathname) || isBusinessRoute(pathname)) return;

    const onAuth = isAuthRoute(pathname);

    // Sadece /profil sayfaları login gerektirir
    if (!user && isProtectedRoute(pathname)) {
      router.replace("/giris");
      return;
    }

    // Onboarding'i tamamen atla — direkt ana sayfaya
    if (pathname === "/onboarding") {
      router.replace(user ? "/" : "/giris");
      return;
    }

    // Giriş yapmış kullanıcı auth sayfasındaysa ana sayfaya
    if (user && onAuth) {
      router.replace("/");
      return;
    }
  }, [ready, user, pathname, router]);

  const signIn = useCallback((u: AuthUser) => {
    persistUser(u);
    setUserState(u);
  }, []);

  const signOut = useCallback(() => {
    persistClear();
    setUserState(null);
    router.replace("/");
  }, [router]);

  const guest = !user;

  const value = useMemo(
    () => ({ user, guest, signIn, signOut }),
    [user, guest, signIn, signOut]
  );

  const isPanel = isAdminRoute(pathname) || isBusinessRoute(pathname);
  const onAuth = isAuthRoute(pathname);
  const isProtected = isProtectedRoute(pathname);

  const shouldRender =
    ready &&
    (
      isPanel ||
      user ||
      onAuth ||
      (!isProtected && !onAuth)
    );

  return (
    <AuthContext.Provider value={value}>
      {shouldRender ? (
        children
      ) : (
        <div className="flex h-[100svh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </AuthContext.Provider>
  );
}
