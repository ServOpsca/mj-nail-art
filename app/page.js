'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// ADD "Camera" (and any other icons you are using) to this list:
import { Camera, Calendar, Instagram, Send, Moon, Sun, Star, Loader2 } from 'lucide-react';

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);

  // Toggle function
  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Fetch photos from Supabase on load
  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      setPhotos(data || []);
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch('/api/book', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    if (res.ok) alert("Booking request sent to MJ Nail Art!");
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 font-sans">
      {/* --- Navigation --- */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-light tracking-widest uppercase italic">MJ Nail Art</h1>
        <div className="space-x-8 text-sm uppercase tracking-tight">
  <a href="#gallery" className="hover:text-pink-400 transition">Gallery</a>
  <a href="#services" className="hover:text-pink-400 transition">Services</a>
  <a href="#book" className="bg-stone-800 text-white px-5 py-2 rounded-full hover:bg-stone-700 transition">Book Now</a>
    <button onClick={toggleDark} className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 transition-colors">
  {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-stone-600" />}
</button>
</div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="py-20 text-center px-4">
        <span className="text-pink-400 text-sm font-medium tracking-widest uppercase">Expert Manicure & Art</span>
        <h2 className="text-5xl md:text-7xl font-light mt-4 mb-8">Elevate your <br/> everyday aesthetic.</h2>
        <div className="w-20 h-[1px] bg-stone-300 mx-auto"></div>
      </header>

      {/* --- Gallery Section --- */}
      <section id="gallery" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-8 border-b border-stone-200 pb-4">
          <Camera size={20} className="text-stone-400" />
          <h3 className="text-lg font-light uppercase tracking-widest">Recent Creations</h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-square bg-stone-200 rounded-lg"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-lg aspect-square bg-stone-100">
                <img 
                  src={photo.url} 
                  alt="Nail Art" 
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        )}
      </section>

{/* --- Service Menu Section --- */}
<section id="services" className="max-w-4xl mx-auto px-6 py-20">
  <div className="text-center mb-12">
    <h3 className="text-3xl font-light tracking-widest uppercase">Service Menu</h3>
    <p className="text-stone-500 mt-2 italic font-serif">Tailored excellence for your hands.</p>
  </div>

  <div className="space-y-6">
    {[
      { name: "Gel Extensions", price: "$85+", desc: "Full set with custom shaping and one-color gel polish." },
      { name: "Custom Nail Art", price: "$20+", desc: "Hand-painted designs, charms, or French tips (per 2 nails)." },
      { name: "Hard Gel Overlay", price: "$65+", desc: "Strengthening layer for natural nails. Includes gel color." },
      { name: "Luxury Manicure", price: "$45", desc: "Detailed cuticle care, scrub, massage, and polish." },
    ].map((service, index) => (
      <div key={index} className="flex justify-between items-end border-b border-stone-200 pb-4 group hover:border-pink-200 transition-colors">
        <div className="max-w-[70%]">
          <h4 className="text-lg font-medium text-stone-700">{service.name}</h4>
          <p className="text-sm text-stone-400 mt-1">{service.desc}</p>
        </div>
        <div className="text-xl font-light text-stone-800 group-hover:text-pink-400 transition-colors">
          {service.price}
        </div>
      </div>
    ))}
  </div>
  
  <p className="text-center text-[10px] text-stone-400 uppercase tracking-widest mt-10">
    * Prices may vary based on length and design complexity.
  </p>
</section>

{/* --- Reviews Section --- */}
<section className="bg-white dark:bg-stone-900 py-20 px-6 transition-colors">
  <div className="max-w-7xl mx-auto">
    <div className="flex justify-center gap-1 mb-4">
      {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-pink-300 text-pink-300" />)}
    </div>
    <h3 className="text-center text-3xl font-light mb-16 dark:text-stone-100 uppercase tracking-widest">Client Love</h3>
    
    <div className="grid md:grid-cols-3 gap-12">
      {[
        { name: "Sophia R.", text: "MJ is a literal artist. My extensions lasted 4 weeks without a single chip!" },
        { name: "Elena V.", text: "The cleanest studio and the most intricate hand-painted designs I've ever seen." },
        { name: "Chloe M.", text: "Finally found someone who understands minimalist nail art. 10/10 recommend." }
      ].map((review, i) => (
        <div key={i} className="text-center italic text-stone-600 dark:text-stone-400">
          <p className="mb-4">"{review.text}"</p>
          <span className="text-xs uppercase tracking-widest font-bold text-stone-400">— {review.name}</span>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* --- Booking Section --- */}
      <section id="book" className="bg-stone-100 py-24 px-6">
        <div className="max-w-xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-stone-200">
          <div className="text-center mb-10">
            <Calendar className="mx-auto mb-4 text-pink-300" size={32} />
            <h3 className="text-3xl font-light">Reserve an Appointment</h3>
            <p className="text-stone-500 mt-2">Let’s create something beautiful together.</p>
          </div>

          <form onSubmit={handleBooking} className="space-y-4">
            <input name="name" type="text" placeholder="Full Name" required className="w-full p-4 border border-stone-100 bg-stone-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-200" />
            <input name="email" type="email" placeholder="Email Address" required className="w-full p-4 border border-stone-100 bg-stone-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-200" />
            <select name="service" className="w-full p-4 border border-stone-100 bg-stone-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-200">
              <option>Gel Extensions</option>
              <option>Custom Nail Art</option>
              <option>Hard Gel Overlay</option>
              <option>Luxury Manicure</option>
            </select>
            <input name="date" type="datetime-local" required className="w-full p-4 border border-stone-100 bg-stone-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-200" />
            <button type="submit" className="w-full bg-stone-800 text-white p-4 rounded-lg flex items-center justify-center gap-2 hover:bg-black transition group">
              Send Request <Send size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 text-center text-stone-400 text-xs tracking-widest uppercase">
        <div className="flex justify-center gap-6 mb-6">
          <Instagram size={18} className="cursor-pointer hover:text-pink-400" />
        </div>
        © 2026 MJ Nail Art. All Rights Reserved.
      </footer>
    </div>
  );
}