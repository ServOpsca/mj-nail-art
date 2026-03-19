'use client'
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Camera, Moon, Sun, Star, Loader2 } from 'lucide-react';

const AdminModal = dynamic(() => import('@/components/AdminModal'), { ssr: false });

const DEFAULT_SERVICES = [
  { id:1, name:'Gel Extensions',  price:'₹2,500+', description:'Full set with custom shaping and one-color gel polish. Built for longevity.', sort_order:1 },
  { id:2, name:'Custom Nail Art',  price:'₹500+',   description:'Hand-painted designs, charms, or French tips. Each nail a canvas.', sort_order:2 },
  { id:3, name:'Hard Gel Overlay', price:'₹1,800+', description:'A strengthening layer over natural nails, finished with gel color.', sort_order:3 },
  { id:4, name:'Luxury Manicure',  price:'₹1,200',  description:'Cuticle care, exfoliating scrub, hand massage, and your choice of polish.', sort_order:4 },
];

export default function LandingPage() {
  const [darkMode,       setDarkMode]       = useState(true);
  const [photos,         setPhotos]         = useState([]);
  const [photosLoading,  setPhotosLoading]  = useState(true);
  const [services,       setServices]       = useState(DEFAULT_SERVICES);
  const [navScrolled,    setNavScrolled]    = useState(false);
  const [bookingStatus,  setBookingStatus]  = useState(null);
  const [showAdmin,      setShowAdmin]      = useState(false);
  const [aiOccasion,     setAiOccasion]     = useState('');
  const [aiStyle,        setAiStyle]        = useState('');
  const [aiShape,        setAiShape]        = useState('');
  const [aiLength,       setAiLength]       = useState('');
  const [aiExtra,        setAiExtra]        = useState('');
  const [aiLoading,      setAiLoading]      = useState(false);
  const [aiResult,       setAiResult]       = useState('');

  // Hidden admin trigger: click footer logo 5× within 2s
  const adminClicks = useRef(0);
  const adminTimer  = useRef(null);
  const handleLogoClick = () => {
    adminClicks.current += 1;
    clearTimeout(adminTimer.current);
    if (adminClicks.current >= 5) { setShowAdmin(true); adminClicks.current = 0; }
    else adminTimer.current = setTimeout(() => { adminClicks.current = 0; }, 2000);
  };

  useEffect(() => { document.documentElement.classList.add('dark'); }, []);
  const toggleDark = () => { setDarkMode(d => !d); document.documentElement.classList.toggle('dark'); };

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Fetch gallery
  useEffect(() => {
    supabase.from('photos').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setPhotos(data || []); setPhotosLoading(false); });
  }, []);

  // Fetch live prices from Supabase (admin can change them anytime)
  useEffect(() => {
    supabase.from('services').select('*').order('sort_order')
      .then(({ data }) => { if (data?.length) setServices(data); });
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingStatus('sending');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
      });
      if (res.ok) { setBookingStatus('sent'); e.target.reset(); }
      else setBookingStatus('error');
    } catch { setBookingStatus('error'); }
  };

  const generateNailAdvice = async () => {
    if (!aiOccasion && !aiStyle) return;
    setAiLoading(true); setAiResult('');
    const msg = [
      aiOccasion && `Occasion: ${aiOccasion}`,
      aiStyle    && `Aesthetic: ${aiStyle}`,
      aiShape    && `Nail shape: ${aiShape}`,
      aiLength   && `Length: ${aiLength}`,
      aiExtra    && `Extra: ${aiExtra}`,
    ].filter(Boolean).join('\n');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 900,
          system: `You are MJ, a luxury nail artist in India. Suggest 2 bespoke nail design concepts. For each: **bold name**, color palette, finish/technique, art details, which MJ service to book (with ₹ prices), one pairing tip. Poetic, luxurious language. 4-5 sentences each. Warm closing.`,
          messages: [{ role: 'user', content: msg }],
        }),
      });
      const data = await res.json();
      setAiResult(data.content?.[0]?.text || 'Unable to generate suggestions.');
    } catch { setAiResult('Something went wrong. Please try again.'); }
    setAiLoading(false);
  };

  const formatAi = t =>
    t.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#c9a46e]">$1</strong>')
     .replace(/\n\n/g, '</p><p class="mt-4">')
     .replace(/\n/g, '<br/>');

  const fi = "w-full bg-[#1c1510] border border-[#c9a46e]/10 text-[#ede4d8] text-sm px-3 py-2.5 focus:outline-none focus:border-[#c9a46e]/40 placeholder-[#7d6e5f] transition-colors";
  const as = "bg-[#241b13] border border-[#c9a46e]/12 text-[#ede4d8] text-sm px-3 py-2.5 focus:outline-none focus:border-[#c9a46e]/40 transition-colors";

  const reviews = [
    { name:'Priya S.',  text:'MJ is absolutely brilliant — my extensions lasted 4 weeks without a single chip!' },
    { name:'Anika V.',  text:'The cleanest studio and most intricate hand-painted designs I\'ve ever seen in India.' },
    { name:'Meera K.',  text:'Finally found someone who truly understands minimalist nail art. 10/10 recommend.' },
  ];

  return (
    <div className="min-h-screen bg-[#0c0a08] text-[#ede4d8] font-light">
      {showAdmin && <AdminModal onClose={() => setShowAdmin(false)}/>}

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-8 md:px-16 flex justify-between items-center transition-all duration-300
        ${navScrolled ? 'py-4 bg-[#0c0a08]/90 backdrop-blur-lg border-b border-[#c9a46e]/10' : 'py-6'}`}>
        <a href="#" className="font-serif text-xl tracking-[0.15em] text-[#e2c99a]">
          MJ <em className="text-[#c9a46e]">Nail Art</em>
        </a>
        <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.2em]">
          {[['Gallery','#gallery'],['Advisor','#advisor'],['Services','#services'],['Book','#book']].map(([l,h]) => (
            <a key={l} href={h} className="text-[#a0917e] hover:text-[#e2c99a] transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleDark} className="p-2 border border-[#c9a46e]/20 text-[#c9a46e] hover:border-[#c9a46e]/50 transition-colors">
            {darkMode ? <Sun size={14}/> : <Moon size={14}/>}
          </button>
          <a href="#book" className="hidden md:block bg-[#c9a46e] text-[#0c0a08] px-5 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-[#e2c99a] transition-colors">
            Book Now
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="min-h-screen flex flex-col justify-center px-8 md:px-16 pt-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{backgroundImage:'repeating-linear-gradient(45deg,#c9a46e,#c9a46e 1px,transparent 1px,transparent 8px)'}}/>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(201,164,110,0.06) 0%,transparent 70%)'}}/>
        <p className="text-xs tracking-[0.35em] uppercase text-[#c9a46e] mb-8 opacity-0 animate-[fadeUp_0.8s_ease_0.3s_forwards]">
          India's Premier Nail Studio
        </p>
        <h1 className="font-serif font-light leading-[0.95] text-[clamp(3.5rem,9vw,8rem)] opacity-0 animate-[fadeUp_0.9s_ease_0.45s_forwards]">
          Where <em className="text-[#c9a46e]">Art</em><br/>Meets<br/>Your Hands
        </h1>
        <p className="mt-8 text-[#a0917e] max-w-sm text-base leading-relaxed opacity-0 animate-[fadeUp_0.8s_ease_0.65s_forwards]">
          Bespoke nail artistry crafted for the modern woman. Each set a one-of-a-kind wearable masterpiece.
        </p>
        <div className="flex gap-4 mt-10 opacity-0 animate-[fadeUp_0.8s_ease_0.8s_forwards]">
          <a href="#book" className="bg-[#c9a46e] text-[#0c0a08] px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#e2c99a] transition-colors">
            Reserve Your Visit
          </a>
          <a href="#gallery" className="border border-[#c9a46e]/30 text-[#a0917e] px-8 py-4 text-xs uppercase tracking-[0.2em] hover:border-[#c9a46e] hover:text-[#e2c99a] transition-colors">
            View Gallery
          </a>
        </div>
        <div className="absolute bottom-10 left-8 md:left-16 flex items-center gap-3 text-[#7d6e5f] text-[10px] uppercase tracking-[0.3em] opacity-0 animate-[fadeUp_0.8s_ease_1s_forwards]">
          <span className="w-10 h-px bg-[#7a5f3a]"/>Scroll to explore
        </div>
      </header>

      {/* MARQUEE */}
      <div className="bg-[#c9a46e] overflow-hidden py-3">
        <div className="flex animate-[marquee_22s_linear_infinite] whitespace-nowrap">
          {[...Array(2)].flatMap((_, ri) =>
            ['Gel Extensions','Custom Nail Art','Hard Gel Overlay','Luxury Manicure','Chrome Finishes','Floral Designs','Minimalist Art','French Tips']
            .map((item, i) => (
              <span key={`${ri}-${i}`} className="font-serif italic text-[#0c0a08] px-8">
                {item} <span className="text-[10px] not-italic mx-4">✦</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* GALLERY */}
      <section id="gallery" className="px-8 md:px-16 py-24 bg-[#141009]">
        <div className="flex justify-between items-end mb-14">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[#c9a46e] mb-3 flex items-center gap-3">
              <span className="w-8 h-px bg-[#c9a46e]"/>Recent Creations
            </p>
            <h2 className="font-serif font-light text-[clamp(2rem,5vw,4rem)] leading-[1.1] text-[#f0e4d4]">
              Our <em className="text-[#c9a46e]">Latest</em><br/>Masterpieces
            </h2>
          </div>
          <Camera size={18} className="text-[#7a5f3a] hidden md:block"/>
        </div>

        {photosLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
            {[500,220,220,220,220,220].map((h,i) => (
              <div key={i} className={`bg-[#1c1510] ${i===0?'md:row-span-2':''} ${i===3?'md:col-span-2':''}`} style={{minHeight:`${h}px`}}/>
            ))}
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, i) => (
              <div key={photo.id}
                className={`group relative overflow-hidden bg-[#1c1510] ${i===0?'md:row-span-2':''} ${i===3?'md:col-span-2':''}`}
                style={{minHeight: i===0?'500px':'220px'}}>
                <img src={photo.url} alt="Nail Art" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-[10px] tracking-[0.15em] uppercase text-[#e2c99a]">View Design</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {l:'Rose Gold Gel',  bg:'from-[#2d1810] to-[#1a0e0a]', e:'md:row-span-2', h:'500px'},
              {l:'Chrome French',  bg:'from-[#1a1028] to-[#0a0820]', e:'', h:'220px'},
              {l:'Minimalist',     bg:'from-[#2a2010] to-[#1a1208]', e:'', h:'220px'},
              {l:'Sunset Ombré',   bg:'from-[#101e28] to-[#0a1218]', e:'md:col-span-2', h:'220px'},
              {l:'Floral Garden',  bg:'from-[#28101e] to-[#180a12]', e:'', h:'220px'},
              {l:'Dark Marble',    bg:'from-[#142018] to-[#0a1410]', e:'', h:'220px'},
            ].map((item, i) => (
              <div key={i} className={`group relative overflow-hidden ${item.e} bg-gradient-to-br ${item.bg} flex items-center justify-center border border-[#c9a46e]/8`}
                style={{minHeight:item.h}}>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#7a5f3a] group-hover:text-[#c9a46e] transition-colors">{item.l}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI ADVISOR */}
      <section id="advisor" className="px-8 md:px-16 py-24 bg-[#0c0a08] relative overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle,rgba(201,164,110,0.05) 0%,transparent 70%)'}}/>
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[#c9a46e] mb-4 flex items-center gap-3">
              <span className="w-8 h-px bg-[#c9a46e]"/>✦ Powered by AI
            </p>
            <h2 className="font-serif font-light text-[clamp(2rem,5vw,4rem)] leading-[1.1] text-[#f0e4d4]">
              Your Personal<br/><em className="text-[#c9a46e]">Nail Design</em><br/>Advisor
            </h2>
            <p className="mt-6 text-[#a0917e] leading-relaxed max-w-md">
              Describe your vision, occasion, or mood — and our AI consultant will craft bespoke nail design recommendations tailored specifically for you.
            </p>
            <ul className="mt-8 space-y-3">
              {['Personalised designs for any Indian occasion','Color palette & finish recommendations','Which service suits your desired look','Nail shape guidance for your lifestyle'].map(f => (
                <li key={f} className="flex items-center gap-3 text-[#7d6e5f] text-sm">
                  <span className="w-1.5 h-1.5 bg-[#c9a46e] rounded-full flex-shrink-0"/>{f}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative bg-[#1c1510] border border-[#c9a46e]/15 p-8 before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-[#c9a46e] before:via-[#c4826e] before:to-transparent">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#c9a46e]">AI Design Advisor</span>
              <span className="text-[9px] px-2 py-0.5 bg-[#c9a46e]/15 text-[#c9a46e]">✦ Live</span>
            </div>
            <p className="font-serif italic text-xl text-[#f0e4d4] mb-6">Design Your Dream Nails</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                {v:aiOccasion, s:setAiOccasion, label:'Occasion',   opts:['Everyday / Office','Wedding / Mehndi','Birthday Party','Date Night','Puja / Festival','Vacation','Corporate']},
                {v:aiStyle,    s:setAiStyle,    label:'Aesthetic',  opts:['Minimalist / Clean','Maximalist / Bold','Romantic / Feminine','Dark / Edgy','Natural / Earthy','Glamorous / Luxe','Festive / Colourful','Classic / Timeless']},
                {v:aiShape,    s:setAiShape,    label:'Nail Shape', opts:['Almond','Coffin / Ballerina','Square','Oval','Stiletto','Round','Advise Me']},
                {v:aiLength,   s:setAiLength,   label:'Length',     opts:['Short — Natural','Medium','Long','Extra Long / Drama']},
              ].map((f, i) => (
                <select key={i} value={f.v} onChange={e => f.s(e.target.value)} className={as}>
                  <option value="">{f.label}</option>
                  {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
            </div>
            <textarea value={aiExtra} onChange={e => setAiExtra(e.target.value)}
              placeholder="Colours you love, inspo, or specific details… (optional)"
              className={as + ' w-full h-20 resize-none mb-4'}/>
            <button onClick={generateNailAdvice} disabled={aiLoading || (!aiOccasion && !aiStyle)}
              className="w-full bg-[#c9a46e] text-[#0c0a08] py-3 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#e2c99a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {aiLoading ? <><Loader2 size={14} className="animate-spin"/>Designing…</> : <>✦&nbsp; Generate My Design</>}
            </button>
            {aiResult && (
              <div className="mt-5 pt-5 border-t border-[#c9a46e]/10">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#7a5f3a] mb-3">✦ Your Personalised Design</p>
                <div className="text-sm text-[#a0917e] leading-relaxed"
                  dangerouslySetInnerHTML={{__html:'<p>'+formatAi(aiResult)+'</p>'}}/>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SERVICES — prices pulled live from Supabase */}
      <section id="services" className="px-8 md:px-16 py-24 bg-[#141009]">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.35em] uppercase text-[#c9a46e] mb-3">Our Offerings</p>
          <h2 className="font-serif font-light text-[clamp(2rem,5vw,4rem)] text-[#f0e4d4]">
            The <em className="text-[#c9a46e]">Service</em> Menu
          </h2>
          <p className="mt-3 text-[#7d6e5f] text-sm italic">Tailored excellence, crafted for your hands.</p>
        </div>
        <div className="grid md:grid-cols-4 border border-[#c9a46e]/10">
          {services.map((s, i) => (
            <div key={s.id}
              className={`group relative p-8 md:p-10 hover:bg-[#1c1510] transition-colors overflow-hidden ${i>0?'border-t md:border-t-0 md:border-l border-[#c9a46e]/10':''}`}>
              <div className="absolute top-0 left-0 right-0 h-px bg-[#c9a46e] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"/>
              <div className="font-serif text-5xl font-light text-[#c9a46e]/12 group-hover:text-[#c9a46e]/20 transition-colors mb-6">
                {String(i+1).padStart(2,'0')}
              </div>
              <h3 className="font-serif text-xl text-[#f0e4d4] mb-3">{s.name}</h3>
              <p className="text-xs text-[#7d6e5f] leading-relaxed mb-6">{s.description}</p>
              <p className="font-serif italic text-2xl text-[#c9a46e]">{s.price}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-[#7d6e5f] uppercase tracking-[0.1em] italic mt-5">
          * Prices may vary based on length and design complexity
        </p>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-8 md:px-16 py-24 bg-[#0c0a08] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-serif italic text-[18vw] text-[#c9a46e]/[0.025] whitespace-nowrap">Love</span>
        </div>
        <div className="text-center mb-14 relative">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_,i) => <Star key={i} size={14} className="fill-[#c9a46e] text-[#c9a46e]"/>)}
          </div>
          <h2 className="font-serif font-light text-[clamp(2rem,4vw,3.5rem)] text-[#f0e4d4]">
            What Our Clients <em className="text-[#c9a46e]">Say</em>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {reviews.map((r, i) => (
            <div key={i} className={`bg-[#1c1510] border border-[#c9a46e]/10 p-8 ${i===1?'md:mt-8':''}`}>
              <div className="font-serif text-5xl leading-none text-[#c9a46e]/40 mb-3">"</div>
              <p className="font-serif italic text-[#a0917e] leading-relaxed mb-5">{r.text}</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a46e]">— {r.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOOKING */}
      <section id="book" className="px-8 md:px-16 py-24 bg-[#1c1510] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-50"
          style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(201,164,110,0.02) 60px,rgba(201,164,110,0.02) 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(201,164,110,0.02) 60px,rgba(201,164,110,0.02) 61px)'}}/>
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[#c9a46e] mb-4 flex items-center gap-3">
              <span className="w-8 h-px bg-[#c9a46e]"/>Reserve a Visit
            </p>
            <h2 className="font-serif font-light text-[clamp(2rem,5vw,4rem)] leading-[1.1] text-[#f0e4d4]">
              Let's Create<br/>Something <em className="text-[#c9a46e]">Beautiful</em><br/>Together
            </h2>
            <div className="mt-10 space-y-6">
              {[
                {icon:'✦', label:'Studio Hours',   val:'Tue – Sat  ·  10am – 7pm'},
                {icon:'◎', label:'Location',       val:'India'},
                {icon:'◇', label:'Booking Policy', val:'48 hours advance notice appreciated'},
              ].map(d => (
                <div key={d.label} className="flex gap-4">
                  <div className="w-9 h-9 border border-[#c9a46e]/20 flex items-center justify-center text-[#c9a46e] text-sm flex-shrink-0">{d.icon}</div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#7a5f3a] mb-1">{d.label}</p>
                    <p className="text-sm text-[#a0917e]">{d.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0c0a08] border border-[#c9a46e]/10 p-8 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-[#c9a46e] before:via-[#c4826e] before:to-transparent">
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[{n:'name',l:'First Name',p:'Priya'},{n:'surname',l:'Last Name',p:'Sharma'}].map(f => (
                  <div key={f.n}>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-[#7a5f3a] mb-1.5">{f.l}</label>
                    <input name={f.n} type="text" placeholder={f.p} required className={fi}/>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#7a5f3a] mb-1.5">Email Address</label>
                <input name="email" type="email" placeholder="your@email.com" required className={fi}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#7a5f3a] mb-1.5">Phone</label>
                  <input name="phone" type="tel" placeholder="+91 98765 43210" className={fi}/>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#7a5f3a] mb-1.5">Preferred Date</label>
                  <input name="date" type="datetime-local" required style={{colorScheme:'dark'}} className={fi}/>
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#7a5f3a] mb-1.5">Service</label>
                <select name="service" className={fi}>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name} — {s.price}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#7a5f3a] mb-1.5">Design Notes (optional)</label>
                <textarea name="notes" placeholder="Describe your vision, share inspo, or mention your occasion…" className={fi + ' h-20 resize-none'}/>
              </div>
              <button type="submit" disabled={bookingStatus==='sending'}
                className="w-full bg-[#c9a46e] text-[#0c0a08] py-4 text-xs uppercase tracking-[0.25em] font-medium hover:bg-[#e2c99a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {bookingStatus==='sending' ? <><Loader2 size={14} className="animate-spin"/>Sending…</>
                  : bookingStatus==='sent'  ? '✦  Request Sent!'
                  : bookingStatus==='error' ? 'Error — Please Try Again'
                  : <>✦&nbsp; Send Booking Request</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER
          HIDDEN ADMIN TRIGGER: Click "MJ Nail Art" logo text in the footer exactly 5 times quickly.
          Share this only with the studio owner — no visible indicator anywhere on the page. */}
      <footer className="px-8 md:px-16 py-8 bg-[#0c0a08] border-t border-[#c9a46e]/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <button onClick={handleLogoClick} className="font-serif text-lg text-[#e2c99a] cursor-default select-none" aria-hidden="true">
          MJ <em>Nail Art</em>
        </button>
        <p className="text-[10px] text-[#7d6e5f] tracking-[0.1em]">© 2026 MJ Nail Art. All Rights Reserved.</p>
        <div className="flex gap-6">
          {['Gallery','Services','Book'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-[10px] tracking-[0.15em] uppercase text-[#7d6e5f] hover:text-[#c9a46e] transition-colors">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
