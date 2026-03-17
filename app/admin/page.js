'use client'
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // We climb two levels to get out of /app/admin/
import imageCompression from 'browser-image-compression';
import { 
  LogIn, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Plus 
} from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  

// ... inside your AdminPage component ...

const handleUpload = async (e) => {
  const imageFile = e.target.files[0];
  if (!imageFile) return;

  setLoading(true);

  // --- Compression Settings ---
  const options = {
    maxSizeMB: 1,            // Max file size 1MB
    maxWidthOrHeight: 1920,  // Max width 1920px
    useWebWorker: true,
  };

  try {
    // Compress the image
    const compressedFile = await imageCompression(imageFile, options);
    
    const fileName = `${Date.now()}-${compressedFile.name}`;

    // 1. Upload the COMPRESSED file to Storage
    const { error: storageError } = await supabase.storage
      .from('gallery')
      .upload(fileName, compressedFile);

    if (storageError) throw storageError;

    // 2. Get URL and Save to DB
    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
    await supabase.from('photos').insert([{ url: publicUrl }]);

    alert("Compressed & Uploaded successfully!");
  } catch (error) {
    console.error(error);
    alert("Error during upload");
  } finally {
    setLoading(false);
  }
};

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-100">
          <h1 className="text-2xl font-light mb-6 text-center tracking-widest uppercase">Admin Portal</h1>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mb-4 bg-stone-50 border rounded-lg outline-none" required />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mb-6 bg-stone-50 border rounded-lg outline-none" required />
          <button className="w-full bg-stone-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-black">
            <LogIn size={18} /> Sign In
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-light tracking-tight">Manage Gallery</h2>
          <button onClick={() => supabase.auth.signOut()} className="text-stone-400 hover:text-red-400 text-sm">Logout</button>
        </div>

        <div className="border-2 border-dashed border-stone-200 rounded-xl p-12 text-center">
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-pink-400 mb-2" size={32} />
              <p className="text-stone-500">Uploading to MJ Nail Art...</p>
            </div>
          ) : (
            <label className="cursor-pointer group">
              <ImageIcon className="mx-auto text-stone-300 group-hover:text-pink-300 transition-colors mb-4" size={48} />
              <span className="bg-stone-100 px-4 py-2 rounded-full text-sm text-stone-600 group-hover:bg-stone-200">Select Nail Photo</span>
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
            </label>
          )}
        </div>
      </div>
    </div>
  )
}