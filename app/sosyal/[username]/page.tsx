"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Flag,
  Lock,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Settings,
  UserPlus,
  UserCheck,
  UserMinus,
  UserX,
} from "lucide-react";
import { socialApi } from "@/lib/api";
import { PostCard } from "@/components/social/PostCard";
import type { SocialPost, SocialProfile } from "@/lib/types/social";

export default function SocialProfilePage() {
  const router = useRouter();
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followingState, setFollowingState] = useState<"idle" | "loading">("idle");
  const [reportOpen, setReportOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const p = (await socialApi.getProfile(username)) as unknown as SocialProfile;
      setProfile(p);
      setError("");
      try {
        const list = (await socialApi.getUserPosts(username)) as unknown as SocialPost[];
        setPosts(list);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("gizli") || msg.includes("private")) {
          setPosts([]);
        } else {
          setPosts([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleFollow = async () => {
    if (!profile) return;
    setFollowingState("loading");
    try {
      if (profile.is_following || profile.follow_pending) {
        await socialApi.unfollow(username);
      } else {
        await socialApi.follow(username);
      }
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata");
    } finally {
      setFollowingState("idle");
    }
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-rose-600">{error || "Kullanıcı bulunamadı"}</p>
      </div>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  const cantSeePosts = profile.is_private && !profile.is_me && !profile.is_following;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-extrabold">{profile.display_name}</h1>
          <p className="text-xs text-muted-foreground">{profile.posts_count} gönderi</p>
        </div>
      </header>

      {/* Cover */}
      <div className="relative h-36 w-full bg-gradient-to-br from-primary/20 via-secondary/20 to-fuchsia-500/20">
        {profile.cover_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={profile.cover_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Avatar + actions */}
        <div className="flex items-end justify-between">
          <div className="-mt-12 h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-card shadow-md">
            {profile.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                {profile.display_name[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {profile.is_me ? (
              <Link
                href="/sosyal/ayarlar"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-bold transition hover:bg-muted"
              >
                <Pencil className="h-3.5 w-3.5" />
                Profili Düzenle
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => router.push(`/sosyal/mesajlar/yeni?to=${profile.user_id}`)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition hover:bg-muted"
                  title="Mesaj Gönder"
                >
                  <Mail className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted"
                  title="Şikayet Et"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleFollow}
                  disabled={followingState === "loading"}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
                    profile.is_following
                      ? "border border-border hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                      : profile.follow_pending
                        ? "border border-border bg-muted text-muted-foreground"
                        : "bg-primary text-white"
                  }`}
                >
                  {profile.is_following ? (
                    <>
                      <UserCheck className="h-3.5 w-3.5" /> Takiptesin
                    </>
                  ) : profile.follow_pending ? (
                    <>
                      <UserMinus className="h-3.5 w-3.5" /> İstek bekliyor
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" /> Takip Et
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile info */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold">{profile.display_name}</h2>
            {profile.is_verified && <CheckCircle2 className="h-4 w-4 fill-primary text-white" />}
            {profile.is_private && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 whitespace-pre-line text-sm">{profile.bio}</p>
          )}
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {joinDate}'dan beri Gebzem'de
          </p>
          <div className="mt-2 flex gap-4 text-sm">
            <Link
              href={`/sosyal/${profile.username}/takip-edilenler`}
              className="hover:underline"
            >
              <span className="font-bold">{profile.following_count}</span>{" "}
              <span className="text-muted-foreground">Takip</span>
            </Link>
            <Link
              href={`/sosyal/${profile.username}/takipciler`}
              className="hover:underline"
            >
              <span className="font-bold">{profile.followers_count}</span>{" "}
              <span className="text-muted-foreground">Takipçi</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="border-t border-border">
        {cantSeePosts ? (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-base font-bold">Bu hesap gizli</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Gönderileri görmek için takip isteği gönder
            </p>
          </div>
        ) : posts.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Henüz gönderi yok
          </p>
        ) : (
          posts.map(p => <PostCard key={p.id} post={p} />)
        )}
      </div>

      {reportOpen && profile && !profile.is_me && (
        <ReportProfileDialog
          targetId={profile.user_id}
          username={profile.username}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}

function ReportProfileDialog({
  targetId,
  username,
  onClose,
}: {
  targetId: string;
  username: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await socialApi.report({
        target_type: "profile",
        target_id: targetId,
        reason,
      });
      alert("Şikayetin alındı");
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata");
    } finally {
      setSubmitting(false);
    }
  };

  const reasons = [
    { value: "spam", label: "Spam" },
    { value: "hate", label: "Nefret söylemi" },
    { value: "harassment", label: "Taciz" },
    { value: "fake", label: "Sahte hesap" },
    { value: "other", label: "Diğer" },
  ];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-card p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <Flag className="h-5 w-5 text-rose-600" />
          <h3 className="text-base font-bold">@{username} şikayet et</h3>
        </div>
        <div className="mb-3 space-y-1">
          {reasons.map(r => (
            <label
              key={r.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm ${
                reason === r.value ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={e => setReason(e.target.value)}
                className="accent-primary"
              />
              {r.label}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-semibold"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!reason || submitting}
            className="flex-1 rounded-full bg-rose-600 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? "..." : "Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}
