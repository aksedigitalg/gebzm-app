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
  isOnboarded,
  syncBuildVersion,
} from "@/lib/auth";
import { isAdminRoute, isBusinessRoute } from "@/lib/panel-auth";
import { isPWA } from "@/lib/platform";

interface AuthContextValue {
  user: AuthUser | null;
  guest: boolean; // PWA değil + user yok → guest browsing
  signIn: (user: AuthUser) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [pwa, setPwa] = useState(false); // client-only
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    syncBuildVersion();
    setUserState(getUser());
    setPwa(isPWA());
    setReady(true);
  }, [pathname]);

  // Rota koruma
  useEffect(() => {
    if (!ready) return;
    if (isAdminRoute(pathname) || isBusinessRoute(pathname)) return;

    const onAuth = isAuthRoute(pathname);

    if (!user && !onAuth) {
      // PWA'da zorunlu login, tarayıcıda serbest browsing
      if (pwa) {
        router.replace(isOnboarded() ? "/giris" : "/onboarding");
      }
      return;
    }

    if (user && onAuth) {
      router.replace("/");
      return;
    }
  }, [ready, user, pathname, router, pwa]);

  const signIn = useCallback((u: AuthUser) => {
    persistUser(u);
    setUserState(u);
  }, []);

  const signOut = useCallback(() => {
    persistClear();
    setUserState(null);
    if (pwa) router.replace("/giris");
  }, [router, pwa]);

  const guest = !user && !pwa; // tarayıcıda giriş yapmamış

  const value = useMemo(
    () => ({ user, guest, signIn, signOut }),
    [user, guest, signIn, signOut]
  );

  const onAuth = isAuthRoute(pathname);
  const isPanel = isAdminRoute(pathname) || isBusinessRoute(pathname);
  // Render koşulu: panel / auth sayfası / giriş yapmış / guest (tarayıcı)
  const shouldRender =
    ready &&
    (isPanel || (user && !onAuth) || (!user && onAuth) || (!user && !onAuth && !pwa));

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
