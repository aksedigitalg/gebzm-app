"use client";

import { useEffect, useState } from "react";
import { Trash2, Camera, Plus } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";

const API = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";
function headers() { return { "Content-Type": "application/json", Authorization: `Bearer ${typeof window !== "undefined" ? JSON.parse(localStorage.getItem("gebzem_business") || "{}").token || "" : ""}` }; }

interface Photo { id: string; photo_url: string; caption: string; }

export default function GaleriPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [caption, setCaption] = useState("");

  const load = () => fetch(`${API}/business/gallery`, { headers: headers() })
    .then(r => r.json()).then(d => { setPhotos(d); setLoading(false); }).catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const addPhotos = async () => {
    if (newPhotos.length === 0) return;
    setUploading(true);
    for (const url of newPhotos) {
      await fetch(`${API}/business/gallery`, { method: "POST", headers: headers(), body: JSON.stringify({ photo_url: url, caption }) });
    }
    setNewPhotos([]);
    setCaption("");
    setUploading(false);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Fotoğrafı silmek istediğinizden emin misiniz?")) return;
    await fetch(`${API}/business/gallery/${id}`, { method: "DELETE", headers: headers() });
    setPhotos(p => p.filter(ph => ph.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Galeri</h1>
        <p className="mt-1 text-sm text-muted-foreground">{photos.length} fotoğraf · İşletme profil galeriniz</p>
      </header>

      {/* Yeni fotoğraf ekle */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold">Fotoğraf Ekle</h3>
        <PhotoUpload photos={newPhotos} onChange={setNewPhotos} max={10} />
        {newPhotos.length > 0 && (
          <div className="mt-3 space-y-2">
            <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Açıklama (opsiyonel)"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            <button onClick={addPhotos} disabled={uploading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              <Plus className="h-4 w-4" />{uploading ? "Ekleniyor..." : `${newPhotos.length} Fotoğraf Ekle`}
            </button>
          </div>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Camera className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold">Galeri boş</p>
          <p className="mt-1 text-xs text-muted-foreground">İşletmenizin fotoğraflarını ekleyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map(p => (
            <div key={p.id} className="group relative overflow-hidden rounded-2xl">
              <img src={p.photo_url} alt={p.caption} className="h-40 w-full object-cover" />
              {p.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 px-3 py-2">
                  <p className="text-xs text-white">{p.caption}</p>
                </div>
              )}
              <button onClick={() => del(p.id)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
