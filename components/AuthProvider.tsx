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
  isOnboarded,
  isAuthRoute,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
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
  const pathname = usePathname();
  const router = useRouter();

  // İlk yüklemede localStorage'dan oku
  useEffect(() => {
    setUserState(getUser());
    setReady(true);
  }, []);

  // Rota koruma
  useEffect(() => {
    if (!ready) return;
    const onAuth = isAuthRoute(pathname);

    if (!user && !onAuth) {
      // Giriş yok, korumalı sayfaya erişmeye çalışıyor
      router.replace(isOnboarded() ? "/giris" : "/onboarding");
      return;
    }

    if (user && onAuth) {
      // Zaten giriş yapmış, auth sayfasına geldi → ana sayfa
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
    router.replace("/giris");
  }, [router]);

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);

  // Hidrasyon tamamlanmadan veya redirect sırasında içerik göstermeyelim (flash önle)
  const onAuth = isAuthRoute(pathname);
  const shouldRender =
    ready && ((user && !onAuth) || (!user && onAuth));

  return (
    <AuthContext.Provider value={value}>
      {shouldRender ? (
        children
      ) : (
        <div className="flex min-h-[100svh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </AuthContext.Provider>
  );
}
