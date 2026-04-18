import { PageHeader } from "@/components/PageHeader";
import { Shield } from "lucide-react";

export default function GizlilikPage() {
  return (
    <>
      <PageHeader title="Gizlilik Politikası" back="/profil" />
      <div className="space-y-5 px-5 pb-8 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-primary/5 p-4">
          <Shield className="h-8 w-8 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">Gizliliğiniz bizim önceliğimiz</p>
            <p className="text-xs text-muted-foreground">Son güncelleme: Nisan 2026</p>
          </div>
        </div>

        {[
          { title: "Topladığımız Veriler", content: "Gebzem, telefon numaranızı kimlik doğrulama için toplar. Rezervasyon ve mesajlaşma verileriniz güvenli sunucularımızda saklanır. Konum bilginiz yalnızca harita özelliği aktifken ve izin vermeniz durumunda kullanılır." },
          { title: "Verilerinizi Nasıl Kullanıyoruz", content: "Verileriniz; hesap yönetimi, işletmelerle iletişim, rezervasyon işlemleri ve hizmet kalitesini artırmak amacıyla kullanılır. Verileriniz hiçbir koşulda üçüncü taraflara satılmaz." },
          { title: "Veri Güvenliği", content: "Tüm veriler SSL/TLS şifreleme ile korunmaktadır. Şifreler bcrypt algoritması ile güvenli şekilde saklanır. Sunucularımız Avrupa'daki güvenli veri merkezlerinde barındırılmaktadır." },
          { title: "Çerezler", content: "Gebzem web uygulaması yalnızca oturum yönetimi için gerekli çerezleri kullanır. Reklam amaçlı takip çerezi kullanılmaz." },
          { title: "Verilerinizi Silme", content: "Hesabınızı silmek için Profil → Yardım ve Destek üzerinden bizimle iletişime geçebilirsiniz. Talepleriniz 30 gün içinde işleme alınır." },
          { title: "İletişim", content: "Gizlilik ile ilgili sorularınız için: gizlilik@gebzem.app adresine yazabilirsiniz." },
        ].map(({ title, content }) => (
          <section key={title} className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{content}</p>
          </section>
        ))}
      </div>
    </>
  );
}
