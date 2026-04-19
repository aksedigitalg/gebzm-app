"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Wrench, Clock, Tag } from "lucide-react";
import { api } from "@/lib/api";

interface Service {
  id: string; name: string; description: string;
  price: number; duration: string; category: string; is_active: boolean;
}

function Modal({ svc, onClose, onSave }: { svc?: Service | null; onClose: () => void; onSave: () => void }) {
  const [name, setName] = useState(svc?.name || "");
  const [desc, setDesc] = useState(svc?.description || "");
  const [price, setPrice] = useState(svc?.price?.toString() || "");
  const [dur, setDur] = useState(svc?.duration || "");
  const [cat, setCat] = useState(svc?.category || "");
  const [active, setActive] = useState(svc?.is_active !== false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErr("Hizmet adı zorunlu."); return; }
    setLoading(true);
    try {
      const d = { name, description: desc, price: parseInt(price) || 0, duration: dur, category: cat, is_active: active };
      if (svc?.id) await api.business.updateService(svc.id, d);
      else await api.business.createService(d);
      onSave(); onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Hata";
      setErr(msg.includes("401") || msg.includes("403") ? "Oturum süresi dolmuş. Çıkış yapıp tekrar giriş yapın." : msg);
    }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{svc ? "Hizmet Düzenle" : "Yeni Hizmet"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Hizmet Adı *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Saç Kesimi" autoFocus
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Açıklama</label>
            <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Detay..."
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Fiyat (₺)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Süre</label>
              <input value={dur} onChange={e => setDur(e.target.value)} placeholder="30 dk"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Kategori</label>
              <input value={cat} onChange={e => setCat(e.target.value)} placeholder="Saç"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          {svc && (
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="h-4 w-4 accent-primary" />
              <span className="text-sm">Aktif (müşterilere göster)</span>
            </label>
          )}
          {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">{err}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold hover:bg-muted">İptal</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {loading ? "Kaydediliyor..." : svc ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Service | null>(null);

  const load = () => api.business.getMyServices()
    .then(d => { setServices(d as Service[]); setLoading(false); })
    .catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const del = async (id: string, name: string) => {
    if (!confirm(`"${name}" silinsin mi?`)) return;
    await api.business.deleteService(id);
    setServices(p => p.filter(s => s.id !== id));
  };

  const grouped = services.reduce<Record<string, Service[]>>((acc, s) => {
    const c = s.category || "Genel";
    if (!acc[c]) acc[c] = [];
    acc[c].push(s);
    return acc;
  }, {});

  if (loading) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hizmetlerim</h1>
          <p className="mt-1 text-sm text-muted-foreground">{services.length} hizmet · Müşterilere gösterilen liste</p>
        </div>
        <button onClick={() => { setEdit(null); setModal(true); }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" />Hizmet Ekle
        </button>
      </header>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
          <Wrench className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold">Henüz hizmet eklenmemiş</p>
          <p className="mt-1 text-xs text-muted-foreground">Sunduğunuz hizmetleri ekleyin, müşteriler randevu alırken görsün.</p>
          <button onClick={() => { setEdit(null); setModal(true); }}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground">
            <Plus className="h-3.5 w-3.5" />İlk Hizmeti Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([c, svcs]) => (
            <section key={c}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c}</h2>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {svcs.map((s, i) => (
                  <div key={s.id} className={`flex items-start justify-between gap-3 p-4 ${i < svcs.length - 1 ? "border-b border-border" : ""} ${!s.is_active ? "opacity-50" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{s.name}</p>
                        {!s.is_active && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Pasif</span>}
                      </div>
                      {s.description && <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>}
                      <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground">
                        {s.price > 0 && <span className="inline-flex items-center gap-1 font-semibold text-primary"><Tag className="h-3 w-3" />{s.price.toLocaleString("tr-TR")} ₺</span>}
                        {s.duration && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEdit(s); setModal(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => del(s.id, s.name)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      {modal && <Modal svc={edit} onClose={() => { setModal(false); setEdit(null); }} onSave={load} />}
    </div>
  );
}
