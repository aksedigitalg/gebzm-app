"use client";

import { useEffect, useState } from "react";
import { Check, X, Plus, Pencil, Trash2, Eye, EyeOff, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { getAdminSession } from "@/lib/panel-auth";

interface Business {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  address?: string;
  description?: string;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
}

const typeLabel: Record<string, string> = {
  restoran: "Restoran", yemek: "Yemek", kafe: "Kafe", market: "Market",
  magaza: "Mağaza", doktor: "Doktor", kuafor: "Kuaför", usta: "Usta",
  emlakci: "Emlakçı", galerici: "Galerici",
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";

function BusinessModal({ biz, token, onClose, onSave }: {
  biz?: Business | null;
  token: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(biz?.name || "");
  const [type, setType] = useState(biz?.type || "restoran");
  const [email, setEmail] = useState(biz?.email || "");
  const [phone, setPhone] = useState(biz?.phone || "");
  const [address, setAddress] = useState(biz?.address || "");
  const [description, setDescription] = useState(biz?.description || "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!biz;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email) { setError("Ad ve email zorunlu."); return; }
    setLoading(true);
    try {
      if (isEdit) {
        // Güncelle
        const res = await fetch(`${API}/admin/businesses/${biz.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, type, email, phone, address, description, ...(password ? { password } : {}) }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Güncelleme başarısız");
      } else {
        // Yeni oluştur (kayıt + onayla)
        if (!password) { setError("Yeni işletme için şifre zorunlu."); setLoading(false); return; }
        const regRes = await fetch(`${API}/auth/business/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type, email, password, phone }),
        });
        const reg = await regRes.json();
        if (!regRes.ok) throw new Error(reg.error || "Kayıt başarısız");
        // Otomatik onayla
        await fetch(`${API}/admin/businesses/${reg.id}/approve`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ approve: true }),
        });
        // Profil güncelle
        if (address || description) {
          const loginRes = await fetch(`${API}/auth/business/login`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const loginD = await loginRes.json();
          if (loginD.token) {
            await fetch(`${API}/business/me`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${loginD.token}` },
              body: JSON.stringify({ name, phone, address, description }),
            });
          }
        }
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEdit ? "İşletme Düzenle" : "Yeni İşletme Ekle"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">İşletme Adı *</label>
              <input value={name} onChange={e => setName(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Tür *</label>
              <select value={type} onChange={e => setType(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary">
                {Object.entries(typeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">E-posta *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Telefon</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Adres</label>
            <input value={address} onChange={e => setAddress(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Açıklama</label>
            <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {isEdit ? "Şifre (değiştirmek için)" : "Şifre *"}
            </label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder={isEdit ? "Boş bırak = değişmez" : "En az 6 karakter"}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-10 text-sm outline-none focus:border-primary" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold transition hover:bg-muted">İptal</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Ekle ve Onayla"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BusinessDetail({ biz, token, onClose, onUpdate }: {
  biz: Business; token: string; onClose: () => void; onUpdate: () => void;
}) {
  const approve = async (val: boolean) => {
    await api.admin.approveBusiness(biz.id, val, token);
    onUpdate();
  };
  const deleteBiz = async () => {
    if (!confirm(`"${biz.name}" işletmesini silmek istediğinizden emin misiniz?`)) return;
    await fetch(`${API}/admin/businesses/${biz.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{biz.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <dl className="space-y-2 text-sm">
          {[
            ["Tür", typeLabel[biz.type] || biz.type],
            ["E-posta", biz.email],
            ["Telefon", biz.phone || "-"],
            ["Durum", biz.is_approved ? "Onaylı" : "Onay Bekliyor"],
            ["Kayıt", new Date(biz.created_at).toLocaleDateString("tr-TR")],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          {!biz.is_approved && (
            <button onClick={() => approve(true)} className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20">
              <Check className="h-3.5 w-3.5" />Onayla
            </button>
          )}
          {biz.is_approved && (
            <button onClick={() => approve(false)} className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-600 transition hover:bg-amber-500/20">
              <X className="h-3.5 w-3.5" />Askıya Al
            </button>
          )}
          <button onClick={deleteBiz} className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500/20">
            <Trash2 className="h-3.5 w-3.5" />Sil
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [list, setList] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editBiz, setEditBiz] = useState<Business | null>(null);
  const [detailBiz, setDetailBiz] = useState<Business | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const load = (t?: string) => {
    const tk = t || token;
    api.admin.getBusinesses(tk).then(data => {
      setList(data as Business[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    const session = getAdminSession();
    const t = session?.token || "";
    setToken(t);
    load(t);
  }, []);

  // Backend'e DELETE endpoint eklenene kadar client-side sil
  const filteredList = filter === "all" ? list
    : filter === "pending" ? list.filter(b => !b.is_approved)
    : list.filter(b => b.is_approved);

  const pendingCount = list.filter(b => !b.is_approved).length;

  if (loading) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">İşletmeler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pendingCount > 0 && <span className="text-amber-600 font-semibold">{pendingCount} onay bekliyor · </span>}
            Toplam {list.length} işletme
          </p>
        </div>
        <button onClick={() => { setEditBiz(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
          <Plus className="h-4 w-4" />Yeni İşletme
        </button>
      </header>

      {/* Filtreler */}
      <div className="flex gap-2">
        {[["all","Tümü"], ["pending","Onay Bekleyen"], ["approved","Onaylı"]].map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f as typeof filter)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Onay bekleyenler - öne çıkar */}
      {filteredList.filter(b => !b.is_approved).length > 0 && filter !== "approved" && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600">Onay Bekleyenler</h2>
          <div className="space-y-2">
            {filteredList.filter(b => !b.is_approved).map(b => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/30 p-4 dark:border-amber-900/30 dark:bg-amber-950/10">
                <div>
                  <p className="text-sm font-semibold">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{typeLabel[b.type]} · {b.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setDetailBiz(b); }} className="rounded-full border border-border bg-background p-1.5 hover:bg-muted"><Eye className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { setEditBiz(b); setShowModal(true); }} className="rounded-full border border-border bg-background p-1.5 hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={async () => { await api.admin.approveBusiness(b.id, true, token); load(); }}
                    className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20">
                    <Check className="h-3.5 w-3.5" />Onayla
                  </button>
                  <button onClick={async () => { await api.admin.approveBusiness(b.id, false, token); load(); }}
                    className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/20">
                    <X className="h-3.5 w-3.5" />Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tüm liste */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">İşletme</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tür</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Telefon</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Durum</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredList.map(b => (
              <tr key={b.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.email}</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{typeLabel[b.type] || b.type}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{b.phone || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${b.is_approved ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {b.is_approved ? "Onaylı" : "Bekliyor"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setDetailBiz(b)} className="rounded-lg border border-border p-1.5 hover:bg-muted" title="Detay"><Eye className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { setEditBiz(b); setShowModal(true); }} className="rounded-lg border border-border p-1.5 hover:bg-muted" title="Düzenle"><Pencil className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredList.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">Bu filtrede işletme yok.</div>
        )}
      </div>

      {/* Modal: Ekle/Düzenle */}
      {showModal && (
        <BusinessModal
          biz={editBiz}
          token={token}
          onClose={() => { setShowModal(false); setEditBiz(null); }}
          onSave={() => load()}
        />
      )}

      {/* Modal: Detay */}
      {detailBiz && (
        <BusinessDetail
          biz={detailBiz}
          token={token}
          onClose={() => setDetailBiz(null)}
          onUpdate={() => { load(); setDetailBiz(null); }}
        />
      )}
    </div>
  );
}
