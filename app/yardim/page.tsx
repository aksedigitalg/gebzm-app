import { PageHeader } from "@/components/PageHeader";
import { HelpCircle, MessageCircle, Phone, Mail, ChevronRight } from "lucide-react";

const faqs = [
  { q: "Gebzem nedir?", a: "Gebzem, Gebze'ye özel bir şehir rehberi uygulamasıdır. Harita, etkinlikler, yemek siparişi, hizmetler ve daha fazlasını tek yerden sunar." },
  { q: "Nasıl kayıt olabilirim?", a: "Ana sayfada 'Giriş Yap' butonuna tıklayın, telefon numaranızı girin ve gelen doğrulama kodunu yazın. Hesabınız otomatik oluşturulur." },
  { q: "OTP kodu gelmiyor ne yapmalıyım?", a: "Telefon numarasını doğru girdiğinizi kontrol edin. Kod gelmezse 'Tekrar gönder' seçeneğini kullanın. Sorun devam ederse destek hattımızla iletişime geçin." },
  { q: "İşletmemi nasıl eklerim?", a: "Profil sayfasındaki 'İşletmenizi Ekleyin' kartına tıklayın. İşletme türünüzü seçin ve bilgileri doldurun. Onay sürecinden geçtikten sonra paneliniz aktifleşir." },
  { q: "Rezervasyon nasıl yaparım?", a: "Restoran veya hizmet detay sayfasında 'Rezervasyon' butonuna tıklayın, tarih ve saat seçin, talebinizi gönderin." },
  { q: "Mesajlarım nerede?", a: "Profil → Mesajlarım bölümünden işletmelerle yaptığınız tüm konuşmalara ulaşabilirsiniz." },
  { q: "Uygulama ücretsiz mi?", a: "Evet, kullanıcılar için tamamen ücretsizdir. İşletmeler için premium paketler mevcuttur." },
];

export default function YardimPage() {
  return (
    <>
      <PageHeader title="Yardım ve Destek" back="/profil" />
      <div className="space-y-6 px-5 pb-8 pt-4">
        {/* Hızlı iletişim */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Phone, label: "Telefon", value: "0262 000 00 00", color: "text-emerald-600 bg-emerald-500/10" },
            { icon: Mail, label: "E-posta", value: "destek@gebzem.app", color: "text-primary bg-primary/10" },
            { icon: MessageCircle, label: "Canlı Destek", value: "09:00 - 18:00", color: "text-violet-600 bg-violet-500/10" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SSS */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <HelpCircle className="h-4 w-4 text-primary" />
            Sık Sorulan Sorular
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {faqs.map((faq, i) => (
              <details key={i} className={`group ${i < faqs.length - 1 ? "border-b border-border" : ""}`}>
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-sm font-medium hover:bg-muted/40">
                  {faq.q}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-90" />
                </summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground">
          Gebzem Şehir Rehberi · v1.0 · info@gebzem.app
        </p>
      </div>
    </>
  );
}
