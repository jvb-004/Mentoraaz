export default function TermsPage() {
  return (
    <div className="container section" style={{maxWidth:740}}>
      <h1 style={{fontSize:32,fontWeight:800,marginBottom:8}}>İstifadə Şərtləri</h1>
      <p style={{color:'var(--grey-400)',marginBottom:36}}>Son yenilənmə: İyun 2026</p>
      {[
        ['1. Platformanın rolu', 'Mentora bir kəşf və əlaqə platformasıdır. Müəllim və tələbələri bir-biri ilə tanış edir, lakin aralarındakı müqavilənin tərəfi deyildir. Ödənişlər birbaşa müəllim ilə razılaşdırılır.'],
        ['2. Qeydiyyat', 'Hesab yaratmaqla dəqiq məlumat verməyi öhdəsinə götürürsən. Saxta profil yaratmaq qadağandır.'],
        ['3. Məzmun', 'Platforma istifadəçilər tərəfindən yerləşdirilən məzmuna görə məsuliyyət daşımır. Nalayiq, yanlış və ya zərərli məzmun hesabın bloklanmasına səbəb ola bilər.'],
        ['4. Müəllim doğrulaması', 'Yüklənmiş sənədlər Mentora komandası tərəfindən yoxlanılır. Doğrulama nişanı sənədin yoxlanıldığını bildirir, lakin tədris keyfiyyətinə zəmanət vermir.'],
        ['5. Hesabın silinməsi', 'İstənilən vaxt hesabını silə bilərsən. Silinmiş hesabın məlumatları 30 gün ərzində tamamilə sistemdən çıxarılır.'],
        ['6. Dəyişikliklər', 'Bu şərtlər vaxtaşırı yenilənə bilər. Əhəmiyyətli dəyişikliklər e-poçt ilə bildiriləcək.'],
      ].map(([title, text]) => (
        <div key={title} style={{marginBottom:28}}>
          <h2 style={{fontSize:17,fontWeight:700,marginBottom:8}}>{title}</h2>
          <p style={{fontSize:14.5,color:'var(--grey-500)',lineHeight:1.7}}>{text}</p>
        </div>
      ))}
    </div>
  );
}
