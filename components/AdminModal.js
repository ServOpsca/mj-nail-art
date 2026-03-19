'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'
import {
  X, LogIn, Upload, Trash2, Loader2,
  ImageIcon, Settings, ClipboardList, LogOut,
  Edit2, Save, XCircle, Eye, EyeOff,
} from 'lucide-react'

const inp = "w-full bg-[#0c0a08] border border-[#c9a46e]/15 text-[#ede4d8] text-sm px-3 py-2.5 focus:outline-none focus:border-[#c9a46e]/50 placeholder-[#7d6e5f] transition-colors"

export default function AdminModal({ onClose }) {
  const [user, setUser]                 = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [tab, setTab]                   = useState('gallery')

  // Auth
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Gallery
  const [photos, setPhotos]             = useState([])
  const [photosLoading, setPhotosLoading] = useState(false)
  const [uploading, setUploading]       = useState(false)
  const [deleteId, setDeleteId]         = useState(null)

  // Services
  const [services, setServices]         = useState([])
  const [svcLoading, setSvcLoading]     = useState(false)
  const [editSvc, setEditSvc]           = useState(null)
  const [savingSvc, setSavingSvc]       = useState(false)

  // Bookings
  const [bookings, setBookings]         = useState([])
  const [bkLoading, setBkLoading]       = useState(false)
  const [deleteBkId, setDeleteBkId]     = useState(null)
  const [bkFilter, setBkFilter]         = useState('upcoming')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setCheckingAuth(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) { fetchPhotos(); fetchServices(); fetchBookings() }
  }, [user])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthLoading(true); setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    setAuthLoading(false)
  }

  // ── Gallery ──
  const fetchPhotos = async () => {
    setPhotosLoading(true)
    const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false })
    setPhotos(data || [])
    setPhotosLoading(false)
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true })
      const fileName = `${Date.now()}-${compressed.name.replace(/\s+/g, '-')}`
      const { error: stErr } = await supabase.storage.from('gallery').upload(fileName, compressed)
      if (stErr) throw stErr
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName)
      await supabase.from('photos').insert([{ url: publicUrl }])
      await fetchPhotos()
    } catch (err) { alert('Upload failed: ' + err.message) }
    setUploading(false)
    e.target.value = ''
  }

  const handleDeletePhoto = async (photo) => {
    setDeleteId(photo.id)
    try {
      const fileName = decodeURIComponent(photo.url.split('/').pop().split('?')[0])
      await supabase.storage.from('gallery').remove([fileName])
      await supabase.from('photos').delete().eq('id', photo.id)
      setPhotos(p => p.filter(ph => ph.id !== photo.id))
    } catch (err) { alert('Delete failed: ' + err.message) }
    setDeleteId(null)
  }

  // ── Services ──
  const fetchServices = async () => {
    setSvcLoading(true)
    const { data } = await supabase.from('services').select('*').order('sort_order')
    setServices(data || [])
    setSvcLoading(false)
  }

  const handleSaveService = async () => {
    if (!editSvc) return
    setSavingSvc(true)
    const { error } = await supabase.from('services').update({
      price: editSvc.price,
      description: editSvc.description,
    }).eq('id', editSvc.id)
    if (!error) {
      setServices(s => s.map(sv => sv.id === editSvc.id
        ? { ...sv, price: editSvc.price, description: editSvc.description } : sv))
      setEditSvc(null)
    } else alert('Save failed: ' + error.message)
    setSavingSvc(false)
  }

  // ── Bookings ──
  const fetchBookings = async () => {
    setBkLoading(true)
    const { data } = await supabase.from('bookings').select('*').order('booking_date', { ascending: true })
    setBookings(data || [])
    setBkLoading(false)
  }

  const handleDeleteBooking = async (id) => {
    setDeleteBkId(id)
    await supabase.from('bookings').delete().eq('id', id)
    setBookings(b => b.filter(bk => bk.id !== id))
    setDeleteBkId(null)
  }

  const filteredBookings = bookings.filter(b => {
    if (bkFilter === 'all') return true
    if (!b.booking_date) return true
    return new Date(b.booking_date) >= new Date()
  })

  if (checkingAuth) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}>

      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#141009] border border-[#c9a46e]/20 overflow-hidden"
        style={{ boxShadow: '0 40px 120px rgba(0,0,0,0.8)' }}>

        {/* Gold bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#c9a46e] via-[#e2c99a] to-transparent"/>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#c9a46e]/10 flex-shrink-0">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#c9a46e] mb-0.5">
              {user ? 'Studio Admin' : 'Admin Access'}
            </p>
            <h2 className="font-serif italic text-xl text-[#f0e4d4]">MJ Nail Art</h2>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <button onClick={() => supabase.auth.signOut()}
                className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#7d6e5f] hover:text-[#c4826e] transition-colors">
                <LogOut size={13}/> Logout
              </button>
            )}
            <button onClick={onClose}
              className="w-8 h-8 border border-[#c9a46e]/20 flex items-center justify-center text-[#7d6e5f] hover:text-[#f0e4d4] hover:border-[#c9a46e]/50 transition-colors">
              <X size={14}/>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {!user ? (
            /* ── Login ── */
            <div className="flex items-center justify-center min-h-[420px] px-8 py-12">
              <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                <p className="text-center text-[#7d6e5f] text-sm mb-6">Sign in to manage your studio</p>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#7a5f3a] mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" required className={inp}/>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#7a5f3a] mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required className={inp + ' pr-10'}/>
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d6e5f] hover:text-[#c9a46e]">
                      {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>
                {authError && <p className="text-[#c4826e] text-xs">{authError}</p>}
                <button type="submit" disabled={authLoading}
                  className="w-full bg-[#c9a46e] text-[#0c0a08] py-3 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#e2c99a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                  {authLoading ? <><Loader2 size={13} className="animate-spin"/>Signing in…</> : <><LogIn size={13}/>Sign In</>}
                </button>
              </form>
            </div>
          ) : (
            /* ── Dashboard ── */
            <>
              {/* Tab bar */}
              <div className="flex border-b border-[#c9a46e]/10 flex-shrink-0">
                {[
                  { id:'gallery',  label:'Gallery',  Icon: ImageIcon },
                  { id:'services', label:'Services', Icon: Settings },
                  { id:'bookings', label:'Bookings', Icon: ClipboardList },
                ].map(({ id, label, Icon }) => (
                  <button key={id} onClick={() => setTab(id)}
                    className={`flex items-center gap-2 px-6 py-4 text-xs uppercase tracking-[0.2em] border-b-2 transition-colors
                      ${tab === id ? 'border-[#c9a46e] text-[#c9a46e]' : 'border-transparent text-[#7d6e5f] hover:text-[#a0917e]'}`}>
                    <Icon size={13}/>{label}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-4 px-6 text-[10px] text-[#7d6e5f]">
                  <span>{photos.length} photos</span>
                  <span className="w-px h-3 bg-[#c9a46e]/20"/>
                  <span>{bookings.length} bookings</span>
                </div>
              </div>

              {/* ── Gallery Tab ── */}
              {tab === 'gallery' && (
                <div className="p-8">
                  <label className="group block border-2 border-dashed border-[#c9a46e]/20 hover:border-[#c9a46e]/50 transition-colors p-8 text-center cursor-pointer mb-8">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={28} className="animate-spin text-[#c9a46e]"/>
                        <p className="text-sm text-[#a0917e]">Compressing & uploading…</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={28} className="text-[#7a5f3a] group-hover:text-[#c9a46e] transition-colors"/>
                        <p className="text-sm text-[#a0917e]">Click to upload a nail photo</p>
                        <p className="text-[10px] text-[#7d6e5f] uppercase tracking-widest">JPG · PNG · WEBP · Auto-compressed to 1MB</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading}/>
                  </label>

                  {photosLoading ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
                      {[...Array(8)].map((_,i) => <div key={i} className="aspect-square bg-[#1c1510]"/>)}
                    </div>
                  ) : photos.length === 0 ? (
                    <p className="text-center text-[#7d6e5f] text-sm py-12">No photos yet. Upload your first creation above!</p>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {photos.map(photo => (
                        <div key={photo.id} className="group relative aspect-square overflow-hidden bg-[#1c1510]">
                          <img src={photo.url} alt="nail art" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => handleDeletePhoto(photo)} disabled={deleteId === photo.id}
                              className="w-9 h-9 bg-[#c4826e] flex items-center justify-center text-white hover:bg-red-500 transition-colors disabled:opacity-50">
                              {deleteId === photo.id ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[9px] text-[#a0917e]">
                              {photo.created_at ? new Date(photo.created_at).toLocaleDateString('en-IN') : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Services Tab ── */}
              {tab === 'services' && (
                <div className="p-8">
                  <p className="text-xs text-[#7d6e5f] mb-6">
                    Edit prices and descriptions. Changes appear on the live website immediately.
                  </p>
                  {svcLoading ? (
                    <div className="space-y-3 animate-pulse">
                      {[...Array(4)].map((_,i) => <div key={i} className="h-20 bg-[#1c1510]"/>)}
                    </div>
                  ) : services.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <p className="text-[#7d6e5f] text-sm">No services found.</p>
                      <p className="text-[10px] text-[#7a5f3a] max-w-sm mx-auto leading-relaxed">
                        Run the SQL from the README in your Supabase dashboard to create and seed the services table.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {services.map(svc => (
                        <div key={svc.id} className="border border-[#c9a46e]/10 bg-[#1c1510] p-5 hover:border-[#c9a46e]/20 transition-colors">
                          {editSvc?.id === svc.id ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="font-serif italic text-[#f0e4d4]">{svc.name}</p>
                                <div className="flex gap-2">
                                  <button onClick={() => setEditSvc(null)}
                                    className="w-7 h-7 border border-[#c9a46e]/20 flex items-center justify-center text-[#7d6e5f] hover:text-[#f0e4d4]">
                                    <XCircle size={13}/>
                                  </button>
                                  <button onClick={handleSaveService} disabled={savingSvc}
                                    className="w-7 h-7 bg-[#c9a46e] flex items-center justify-center text-[#0c0a08] hover:bg-[#e2c99a] disabled:opacity-50">
                                    {savingSvc ? <Loader2 size={13} className="animate-spin"/> : <Save size={13}/>}
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[9px] tracking-[0.2em] uppercase text-[#7a5f3a] mb-1">Price (₹)</label>
                                  <input value={editSvc.price}
                                    onChange={e => setEditSvc(sv => ({ ...sv, price: e.target.value }))}
                                    placeholder="e.g. ₹2,500+" className={inp}/>
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-[9px] tracking-[0.2em] uppercase text-[#7a5f3a] mb-1">Description</label>
                                  <input value={editSvc.description}
                                    onChange={e => setEditSvc(sv => ({ ...sv, description: e.target.value }))}
                                    placeholder="Service description" className={inp}/>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-4">
                                  <p className="font-serif italic text-[#f0e4d4]">{svc.name}</p>
                                  <p className="font-serif text-lg text-[#c9a46e]">{svc.price}</p>
                                </div>
                                <p className="text-xs text-[#7d6e5f] mt-1 truncate">{svc.description}</p>
                              </div>
                              <button
                                onClick={() => setEditSvc({ id: svc.id, price: svc.price, description: svc.description })}
                                className="ml-4 w-8 h-8 border border-[#c9a46e]/20 flex items-center justify-center text-[#7d6e5f] hover:text-[#c9a46e] hover:border-[#c9a46e]/50 transition-colors">
                                <Edit2 size={12}/>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Bookings Tab ── */}
              {tab === 'bookings' && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs text-[#7d6e5f]">Show:</span>
                    {['upcoming', 'all'].map(f => (
                      <button key={f} onClick={() => setBkFilter(f)}
                        className={`text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 border transition-colors
                          ${bkFilter === f
                            ? 'border-[#c9a46e] text-[#c9a46e] bg-[#c9a46e]/5'
                            : 'border-[#c9a46e]/20 text-[#7d6e5f] hover:border-[#c9a46e]/40'}`}>
                        {f}
                      </button>
                    ))}
                    <span className="ml-auto text-[10px] text-[#7a5f3a]">{filteredBookings.length} results</span>
                  </div>

                  {bkLoading ? (
                    <div className="space-y-3 animate-pulse">
                      {[...Array(5)].map((_,i) => <div key={i} className="h-20 bg-[#1c1510]"/>)}
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <p className="text-center text-[#7d6e5f] text-sm py-12">No bookings yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredBookings.map(bk => {
                        const isPast = bk.booking_date && new Date(bk.booking_date) < new Date()
                        return (
                          <div key={bk.id}
                            className={`border p-4 flex items-start gap-4 transition-colors
                              ${isPast ? 'border-[#c9a46e]/8 bg-[#0c0a08] opacity-55' : 'border-[#c9a46e]/15 bg-[#1c1510] hover:border-[#c9a46e]/25'}`}>
                            {/* Date block */}
                            <div className="flex-shrink-0 w-12 text-center border-r border-[#c9a46e]/10 pr-3">
                              {bk.booking_date ? (
                                <>
                                  <p className="text-xl font-serif text-[#c9a46e] leading-none">
                                    {new Date(bk.booking_date).getDate()}
                                  </p>
                                  <p className="text-[9px] uppercase tracking-widest text-[#7a5f3a]">
                                    {new Date(bk.booking_date).toLocaleString('en-IN', { month: 'short' })}
                                  </p>
                                  <p className="text-[9px] text-[#7d6e5f] mt-0.5">
                                    {new Date(bk.booking_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </>
                              ) : <p className="text-[10px] text-[#7d6e5f]">TBD</p>}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm text-[#f0e4d4] font-medium">{bk.client_name}</p>
                                <span className="text-[9px] px-2 py-0.5 bg-[#c9a46e]/10 text-[#c9a46e] uppercase tracking-widest">{bk.service}</span>
                                {isPast && <span className="text-[9px] px-2 py-0.5 bg-[#7d6e5f]/10 text-[#7d6e5f] uppercase tracking-widest">Past</span>}
                              </div>
                              <div className="flex flex-wrap gap-3 mt-1 text-xs text-[#7d6e5f]">
                                <span>{bk.email}</span>
                                {bk.phone && <span>· {bk.phone}</span>}
                              </div>
                              {bk.notes && <p className="text-[11px] text-[#a0917e] mt-1 italic">"{bk.notes}"</p>}
                            </div>

                            {/* Delete */}
                            <button onClick={() => handleDeleteBooking(bk.id)} disabled={deleteBkId === bk.id}
                              className="flex-shrink-0 w-7 h-7 border border-[#c9a46e]/15 flex items-center justify-center text-[#7d6e5f] hover:text-[#c4826e] hover:border-[#c4826e]/40 transition-colors disabled:opacity-50">
                              {deleteBkId === bk.id ? <Loader2 size={11} className="animate-spin"/> : <Trash2 size={11}/>}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {!user && (
          <div className="px-8 py-3 border-t border-[#c9a46e]/8 text-center flex-shrink-0">
            <p className="text-[9px] tracking-[0.15em] text-[#7d6e5f]/40 uppercase">Studio access only</p>
          </div>
        )}
      </div>
    </div>
  )
}
