"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Check,
  EyeOff,
  Loader2,
  X,
} from "lucide-react";
import { adminSocialApi } from "@/lib/api";
import type { SocialReport } from "@/lib/types/social";
import { REPORT_REASON_LABEL } from "@/lib/types/social";

export default function AdminSocialPage() {
  const [reports, setReports] = useState<SocialReport[]>([]);
  const [filter, setFilter] = useState<"pending" | "resolved" | "dismissed">("pending");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const adminToken = (() => {
    if (typeof window === "undefined") return "";
    try {
      const a = JSON.parse(localStorage.getItem("gebzem_admin") || "null");
      return a?.token || "";
    } catch {
      return "";
    }
  })();

  const load = async () => {
    setLoading(true);
    try {
      const list = (await adminSocialApi.listReports(filter, adminToken)) as unknown as SocialReport[];
      setReports(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminToken) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, adminToken]);

  const resolve = async (id: string, action: "remove" | "ban" | "warn" | "dismiss") => {
    setActing(id);
    try {
      await adminSocialApi.resolveReport(id, action, adminToken);
      setReports(r => r.filter(x => x.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata");
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sosyal Medya Moderasyon</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Şikayetler, gönderi ve profil moderasyonu
          </p>
        </div>
      </header>

      <div className="flex gap-2">
        {(["pending", "resolved", "dismissed"] as const).map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === s
                ? "bg-primary text-white"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {s === "pending" ? "Bekleyen" : s === "resolved" ? "Çözülmüş" : "Reddedilmiş"}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <AlertTriangle className="h-9 w-9 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-semibold">Şikayet yok</p>
        </div>
      )}

      {!loading &&
        reports.map(r => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                  {REPORT_REASON_LABEL[r.reason] || r.reason}
                </span>
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {r.target_type === "post" ? "Gönderi" : "Profil"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {new Date(r.created_at).toLocaleString("tr-TR")}
              </p>
            </div>

            <p className="text-sm">
              <b>Şikayet eden:</b> {r.reporter_display_name || "Bilinmeyen"} (@
              {r.reporter_username || "?"})
            </p>
            <p className="text-sm">
              <b>Hedef ID:</b> <code className="rounded bg-muted px-1 text-xs">{r.target_id}</code>
            </p>
            {r.description && (
              <p className="mt-2 rounded-lg bg-muted/40 p-2 text-sm">
                {r.description}
              </p>
            )}

            {filter === "pending" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => resolve(r.id, "remove")}
                  disabled={acting === r.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  <EyeOff className="h-3 w-3" />
                  İçeriği Gizle
                </button>
                <button
                  type="button"
                  onClick={() => resolve(r.id, "ban")}
                  disabled={acting === r.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  <Ban className="h-3 w-3" />
                  Kullanıcıyı Banla
                </button>
                <button
                  type="button"
                  onClick={() => resolve(r.id, "warn")}
                  disabled={acting === r.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Uyar
                </button>
                <button
                  type="button"
                  onClick={() => resolve(r.id, "dismiss")}
                  disabled={acting === r.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold transition hover:bg-muted disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                  Reddet
                </button>
              </div>
            )}

            {filter !== "pending" && r.action_taken && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="h-3 w-3 text-emerald-600" />
                Aksiyon: <b>{r.action_taken}</b>
              </p>
            )}
          </div>
        ))}
    </div>
  );
}
