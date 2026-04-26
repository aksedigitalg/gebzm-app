import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Konum Verisi Aydınlatma Metni — Gebzem",
};

export default function KonumAydinlatmaPage() {
  return (
    <div className="px-5 py-6 lg:px-0 lg:py-8">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Ana sayfa
      </Link>

      <h1 className="mb-1 text-2xl font-bold">Konum Verisi Aydınlatma Metni</h1>
      <p className="mb-6 text-xs text-muted-foreground">
        6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) m.10 kapsamında
        düzenlenmiştir. Yürürlük tarihi: 26.04.2026
      </p>

      <article className="prose prose-sm max-w-none space-y-5 text-sm leading-relaxed text-foreground">
        <Section title="1. Veri Sorumlusu">
          <p>
            <b>Akse Dijital Reklam ve Yazılım</b> ("Şirket"), gebzem.app
            uygulaması üzerinden sunduğu hizmetler kapsamında veri sorumlusu
            sıfatıyla hareket etmektedir.
          </p>
          <ul>
            <li>İletişim: info@aksedigital.com</li>
            <li>Web: gebzem.app</li>
          </ul>
        </Section>

        <Section title="2. İşlenen Konum Verisi">
          <p>Aşağıdaki veriler işlenebilir:</p>
          <ul>
            <li>Enlem (latitude) ve boylam (longitude) koordinatları</li>
            <li>
              Konum doğruluk yarıçapı (accuracy) — kaç metre hassasiyetle
              tespit edildiği
            </li>
            <li>
              Hareket halindeyken: yön (heading) ve hız (speed) — yalnızca
              "kurye takibi" gibi sürekli takip senaryolarında
            </li>
          </ul>
        </Section>

        <Section title="3. İşleme Amacı">
          <p>Konum verin yalnızca aşağıdaki amaçlarla işlenir:</p>
          <ul>
            <li>
              Harita üzerinde sana yakın yerleri (eczane, hastane, restoran,
              durak vb.) göstermek
            </li>
            <li>
              Arama ve listeleme sonuçlarını mevcut konumuna göre uzaklık
              sırasına göre sıralamak
            </li>
            <li>
              "Yakındaki ilanlar" gibi konuma duyarlı filtrelerde sonuçları
              kişiselleştirmek
            </li>
            <li>
              Yemek siparişi senaryosunda teslimat adresinin doğrulanması ve
              opsiyonel kurye takibi (yalnızca aktif sipariş süresince)
            </li>
          </ul>
        </Section>

        <Section title="4. İşleme Hukuki Sebebi">
          <p>
            Konum verisi, KVKK m.5/1 uyarınca <b>açık rızana</b> dayanılarak
            işlenmektedir. Belirli senaryolarda (örneğin sipariş teslim
            adresi) sözleşmenin ifası (m.5/2-c) hukuki sebebine de
            dayanılabilir.
          </p>
        </Section>

        <Section title="5. Saklama Süresi">
          <ul>
            <li>
              <b>Tarayıcı cache (anlık konum):</b> 30 dakika. Bu sürenin
              sonunda otomatik silinir.
            </li>
            <li>
              <b>Sipariş teslim adresi:</b> Vergi Usul Kanunu uyarınca 10 yıl
              (anonim hale getirilerek istatistik amacıyla saklanabilir).
            </li>
            <li>
              <b>Kurye anlık konumu:</b> Sipariş tamamlandıktan en fazla 24
              saat sonra silinir.
            </li>
          </ul>
        </Section>

        <Section title="6. Veri Aktarımı">
          <p>
            Konum verin <b>kalıcı olarak üçüncü kişilerle paylaşılmaz</b>.
            Sunucu altyapımız DigitalOcean Frankfurt (Almanya) bölgesinde
            bulunmaktadır; konum verisi açık rızanla yurt dışına
            aktarılabilir. AB üyesi ülkeler yeterli korumaya sahip ülkeler
            arasındadır.
          </p>
          <p>
            Yolculuk planlama özelliği kullanıldığında aşağıdaki üçüncü
            taraf hizmetlere <b>geçici sorgular</b> gönderilebilir:
          </p>
          <ul>
            <li>
              <b>Nominatim (OpenStreetMap)</b> — yazdığın adres metnini
              koordinata çevirmek için. Yalnızca arama metni iletilir;
              kişisel kimliğin paylaşılmaz. Yanıt 24 saat tarayıcında
              cache'lenir.
            </li>
            <li>
              <b>OSRM (Open Source Routing Machine)</b> — iki nokta arası
              yürüyüş yön tarifi için. Sadece başlangıç ve bitiş koordinatı
              iletilir.
            </li>
          </ul>
          <p>
            Bu hizmetler OpenStreetMap Vakfı tarafından işletilen ücretsiz
            kamu hizmetleridir. İstek geçmişi GeBZem sunucularında
            saklanmaz.
          </p>
        </Section>

        <Section title="7. Toplama Yöntemi">
          <p>
            Konum verisi tarayıcının W3C Geolocation API'si üzerinden, açık
            rızan ve tarayıcı izninle toplanır. GPS, Wi-Fi, baz istasyonu ve
            IP triangülasyonu yöntemleri tarayıcı tarafından kullanılabilir.
          </p>
        </Section>

        <Section title="8. KVKK Madde 11 Hakların">
          <p>KVKK m.11 kapsamında aşağıdaki haklara sahipsin:</p>
          <ul>
            <li>Konum verinin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içi/yurt dışı aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
            <li>
              KVKK m.7'de öngörülen şartlar çerçevesinde silinmesini veya yok
              edilmesini isteme
            </li>
            <li>Açık rızanı her zaman geri çekme</li>
            <li>Otomatik sistemler analizi sonucu aleyhine bir sonuç çıkarsa itiraz etme</li>
            <li>Zarar durumunda tazminat talep etme</li>
          </ul>
        </Section>

        <Section title="9. Başvuru">
          <p>
            Haklarını kullanmak için <b>info@aksedigital.com</b> adresine
            başvurabilir veya uygulama içinden "Profil → Konum İznimi Geri Çek"
            seçeneğini kullanabilirsin.
          </p>
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-bold">{title}</h2>
      <div className="space-y-2 text-muted-foreground">{children}</div>
    </section>
  );
}
