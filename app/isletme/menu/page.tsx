"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, Camera } from "lucide-react";
import { getBusinessSession } from "@/lib/panel-auth";
import { PhotoUpload } from "@/components/PhotoUpload";

const API = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";

interface Category { id: string; name: string; description: string; is_active: boolean; }
interface Item { id: string; category_id: string; name: string; description: string; price: number; photo_url: string; is_available: boolean; }

function getToken() { return typeof window !== "undefined" ? JSON.parse(localStorage.getItem("gebzem_business") || "{}").token || "" : ""; }
function headers() { return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }; }

function CategoryModal({ cat, onClose, onSave }: { cat?: Category | null; onClose: () => void; onSave: () => void }) {
  const [name, setName] = useState(cat?.name || "");
  const [desc, setDesc] = useState(cat?.description || "");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const method = cat ? "PUT" : "POST";
    const url = cat ? `${API}/business/menu/categories/${cat.id}` : `${API}/business/menu/categories`;
    await fetch(url, { method, headers: headers(), body: JSON.stringify({ name, description: desc, is_active: true }) });
    onSave(); onClose(); setLoading(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{cat ? "Kategori Düzenle" : "Kategori Ekle"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Kategori adı (Çorbalar, Pizzalar...)" autoFocus
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Açıklama (opsiyonel)"
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold hover:bg-muted">İptal</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {loading ? "..." : cat ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ItemModal({ item, categories, onClose, onSave }: { item?: Item | null; categories: Category[]; onClose: () => void; onSave: () => void }) {
  const [name, setName] = useState(item?.name || "");
  const [desc, setDesc] = useState(item?.description || "");
  const [price, setPrice] = useState(item?.price?.toString() || "");
  const [catId, setCatId] = useState(item?.category_id || "");
  const [photos, setPhotos] = useState<string[]>(item?.photo_url ? [item.photo_url] : []);
  const [avail, setAvail] = useState(item?.is_available !== false);
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const method = item ? "PUT" : "POST";
    const url = item ? `${API}/business/menu/items/${item.id}` : `${API}/business/menu/items`;
    await fetch(url, { method, headers: headers(), body: JSON.stringify({ name, description: desc, price: parseInt(price) || 0, category_id: catId, photo_url: photos[0] || "", is_available: avail }) });
    onSave(); onClose(); setLoading(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{item ? "Ürün Düzenle" : "Ürün Ekle"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Ürün Adı *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Adana Kebap" autoFocus
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Açıklama</label>
            <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="El çekimi, közde pişirilmiş..."
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Fiyat (₺)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Kategori</label>
              <select value={catId} onChange={e => setCatId(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary">
                <option value="">Seçin</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Fotoğraf</label>
            <PhotoUpload photos={photos} onChange={setPhotos} max={1} folder="menu/items" />
          </div>
          {item && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={avail} onChange={e => setAvail(e.target.checked)} className="h-4 w-4 accent-primary" />
              <span className="text-sm">Mevcut (müşterilere göster)</span>
            </label>
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold hover:bg-muted">İptal</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {loading ? "..." : item ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [catModal, setCatModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [itemModal, setItemModal] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const load = async () => {
    const [cats, itms] = await Promise.all([
      fetch(`${API}/business/menu/categories`, { headers: headers() }).then(r => r.json()).catch(() => []),
      fetch(`${API}/business/menu/items`, { headers: headers() }).then(r => r.json()).catch(() => []),
    ]);
    setCategories(cats);
    setItems(itms);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const delCat = async (id: string) => {
    if (!confirm("Kategoriyi silmek istiyor musunuz? İçindeki ürünler kategorisiz kalır.")) return;
    await fetch(`${API}/business/menu/categories/${id}`, { method: "DELETE", headers: headers() });
    load();
  };

  const delItem = async (id: string) => {
    if (!confirm("Ürünü silmek istiyor musunuz?")) return;
    await fetch(`${API}/business/menu/items/${id}`, { method: "DELETE", headers: headers() });
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Yükleniyor...</div>;

  const uncategorized = items.filter(it => !it.category_id || !categories.find(c => c.id === it.category_id));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Menü Yönetimi</h1>
          <p className="mt-1 text-sm text-muted-foreground">{categories.length} kategori · {items.length} ürün</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditCat(null); setCatModal(true); }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold transition hover:bg-muted">
            <Plus className="h-3.5 w-3.5" />Kategori
          </button>
          <button onClick={() => { setEditItem(null); setItemModal(true); }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
            <Plus className="h-3.5 w-3.5" />Ürün Ekle
          </button>
        </div>
      </header>

      {categories.length === 0 && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
          <Camera className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold">Menü henüz boş</p>
          <p className="mt-1 text-xs text-muted-foreground">Önce kategori, sonra ürün ekleyin.</p>
          <div className="mt-5 flex gap-2">
            <button onClick={() => { setEditCat(null); setCatModal(true); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-xs font-semibold hover:bg-muted">
              <Plus className="h-3.5 w-3.5" />Kategori Ekle
            </button>
            <button onClick={() => { setEditItem(null); setItemModal(true); }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">
              <Plus className="h-3.5 w-3.5" />Ürün Ekle
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => {
            const catItems = items.filter(it => it.category_id === cat.id);
            const open = !collapsed[cat.id];
            return (
              <div key={cat.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/20">
                  <button onClick={() => setCollapsed(p => ({ ...p, [cat.id]: !p[cat.id] }))} className="flex flex-1 items-center gap-2 text-left">
                    {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-semibold">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">({catItems.length})</span>
                  </button>
                  <button onClick={() => { setEditItem(null); setItemModal(true); /* pre-select cat */ }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { setEditCat(cat); setCatModal(true); }}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-muted">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => delCat(cat.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                {open && (
                  <div className="divide-y divide-border">
                    {catItems.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-muted-foreground">Bu kategoride ürün yok.</p>
                    ) : catItems.map(it => (
                      <div key={it.id} className={`flex items-start gap-3 px-4 py-3 ${!it.is_available ? "opacity-50" : ""}`}>
                        {it.photo_url ? (
                          <img src={it.photo_url} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground/40">
                            <Camera className="h-6 w-6" strokeWidth={1.5} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{it.name}</p>
                            {!it.is_available && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Mevcut Değil</span>}
                          </div>
                          {it.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{it.description}</p>}
                          {it.price > 0 && <p className="mt-1 text-sm font-bold text-primary">{it.price.toLocaleString("tr-TR")} ₺</p>}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button onClick={() => { setEditItem(it); setItemModal(true); }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted">
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button onClick={() => delItem(it.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {uncategorized.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-card">
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground">Kategorisiz Ürünler</p>
              <div className="divide-y divide-border">
                {uncategorized.map(it => (
                  <div key={it.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <p className="text-sm">{it.name} — <span className="font-bold text-primary">{it.price > 0 ? it.price.toLocaleString("tr-TR") + " ₺" : ""}</span></p>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditItem(it); setItemModal(true); }} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted"><Pencil className="h-3 w-3" /></button>
                      <button onClick={() => delItem(it.id)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {catModal && <CategoryModal cat={editCat} onClose={() => { setCatModal(false); setEditCat(null); }} onSave={load} />}
      {itemModal && <ItemModal item={editItem} categories={categories} onClose={() => { setItemModal(false); setEditItem(null); }} onSave={load} />}
    </div>
  );
}
