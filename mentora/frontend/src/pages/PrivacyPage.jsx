export default function PrivacyPage() {
  return (
    <div className="container section" style={{maxWidth:740}}>
      <h1 style={{fontSize:32,fontWeight:800,marginBottom:8}}>Məxfilik Siyasəti</h1>
      <p style={{color:'var(--grey-400)',marginBottom:36}}>Son yenilənmə: İyun 2026</p>
      {[
        ['Hansı məlumatları toplayırıq?', 'Ad, e-poçt ünvanı, profil fotoşəkili, yüklənmiş sənədlər (diplomlar, sertifikatlar) və platformadaxili mesajlar.'],
        ['Məlumatları necə istifadə edirik?', 'Hesabını idarə etmək, müəllim profilini göstərmək, mesajlaşma funksiyasını təmin etmək və sənəd yoxlaması aparmaq üçün.'],
        ['Məlumatları paylaşırıqmı?', 'Xeyr. Məlumatların üçüncü şəxslərə satılmır. Yalnız qanuni tələblər olduqda səlahiyyətli orqanlarla paylaşıla bilər.'],
        ['Sənəd faylları', 'Yüklənmiş sənədlər (diplomlar, sertifikatlar) yalnız Mentora yoxlama komandası tərəfindən görünür. Digər istifadəçilərə yüklənən fayl paylaşılmır — yalnız "Təsdiqlənmiş" nişanı göstərilir.'],
        ['Hesabını sil', 'İstənilən vaxt profil səhifəsindən hesabını silə bilərsən. Bu əməliyyat bütün şəxsi məlumatlarını sistemdən silir.'],
        ['Azərbaycan Qanunu', 'Bu platforma Azərbaycan Respublikasının "Şəxsi Məlumatlar haqqında" Qanununa uyğun işləyir. Açıq razılıq olmadan məlumat toplanmır.'],
        ['Əlaqə', 'Məxfiliklə bağlı suallar üçün: privacy@mentora.az'],
      ].map(([title, text]) => (
        <div key={title} style={{marginBottom:28}}>
          <h2 style={{fontSize:17,fontWeight:700,marginBottom:8}}>{title}</h2>
          <p style={{fontSize:14.5,color:'var(--grey-500)',lineHeight:1.7}}>{text}</p>
        </div>
      ))}
    </div>
  );
}
