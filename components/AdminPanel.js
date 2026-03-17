'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPanel() {
  const [file, setFile] = useState(null)

  const handleUpload = async () => {
    if (!file) return;

    // 1. Upload to Storage bucket 'gallery'
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('gallery')
      .upload(fileName, file)

    if (error) return alert("Upload failed")

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(fileName)

    // 3. Save to SQL Table 'photos'
    await supabase.from('photos').insert([{ url: publicUrl }])
    alert("Photo live on site!")
  }

  return (
    <div className="p-8 border rounded-lg max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Admin: Add New Nail Art</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-4" />
      <button onClick={handleUpload} className="bg-black text-white px-4 py-2 rounded">Upload Now</button>
    </div>
  )
}