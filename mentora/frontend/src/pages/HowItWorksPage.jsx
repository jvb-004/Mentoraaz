export default function HowItWorksPage() {
  return (
    <div>
      <div style={{background:'var(--teal)',color:'#fff',padding:'52px 0'}}>
        <div className="container">
          <h1 style={{fontSize:'clamp(28px,4vw,42px)',fontWeight:800,color:'#fff',marginBottom:10}}>Necə işləyir?</h1>
          <p style={{fontSize:17,color:'rgba(255,255,255,0.8)'}}>Sadə, şəffaf, etibarlı.</p>
        </div>
      </div>
      <div className="container section">
        <div style={{maxWidth:700,margin:'0 auto',display:'flex',flexDirection:'column',gap:40}}>
          {[
            { step:'1', title:'Axtarış et', body:'Fənn adını yaz — məsələn "SAT Riyaziyyat" — və ya kateqoriyaya görə filtr et. Onlayn / üz-üzə, qiymət aralığı, rayon seç.' },
            { step:'2', title:'Profillərə bax', body:'Hər müəllimin bio, fənnlər, qiymət, rəylər və diplom/sertifikat məlumatları var. Yoxlanılmış profillər ✓ Təsdiqlənmiş etiketi ilə işarələnib.' },
            { step:'3', title:'Mesaj yaz', body:'Müəllimlə birbaşa platformada mesajlaş. Cədvəli müzakirə et, suallar ver. Heç bir ödəniş tələb olunmur.' },
            { step:'4', title:'Dərsə başla', body:'Razılaşdıqdan sonra birinci dərsi keçir. Ödəniş müəllimlə birbaşa razılaşılır — platforma vasitəçilik etmir.' },
            { step:'5', title:'Rəy yaz', body:'Dərsdən sonra rəyin digər valideynlərə kömək edir. Yalnız mesajlaşmış istifadəçilər rəy yaza bilir.' },
          ].map(s => (
            <div key={s.step} style={{display:'flex',gap:24}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'var(--teal)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:18,flexShrink:0}}>{s.step}</div>
              <div>
                <h3 style={{fontSize:19,fontWeight:700,marginBottom:8}}>{s.title}</h3>
                <p style={{fontSize:15,color:'var(--grey-500)',lineHeight:1.7}}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
