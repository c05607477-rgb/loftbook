import React, { useEffect, useRef, useState } from 'react'

// --------------------------- Formatters ---------------------------
function fmtIHU(r){
  if(/^IHU\d{2}\d{5}$/.test(r)) return `IHU ${r.slice(3,5)} ${r.slice(5)}`
  if(/^IHU20\d{2}\d{5}$/.test(r)) return `IHU ${r.slice(3,7)} ${r.slice(7)}`
  return r
}
function fmtIE(r){
  if(/^IE\d{2}\d{5}$/.test(r)) return `IE ${r.slice(2,4)} ${r.slice(4)}`
  if(/^IE20\d{2}\d{5}$/.test(r)) return `IE ${r.slice(2,6)} ${r.slice(6)}`
  return r
}
function fmtGB(r){
  if(/^GB\d{2}[A-Z]\d{4,6}$/.test(r)) return `GB ${r.slice(2,4)} ${r.slice(4,5)} ${r.slice(5)}`
  if(/^GB20\d{2}[A-Z]\d{4,6}$/.test(r)) return `GB ${r.slice(2,6)} ${r.slice(6,7)} ${r.slice(7)}`
  return r
}
function fmtNL(r){
  if(/^NL\d{2}\d{5,6}$/.test(r)) return `NL ${r.slice(2,4)} ${r.slice(4)}`
  if(/^NL20\d{2}\d{5,6}$/.test(r)) return `NL ${r.slice(2,6)} ${r.slice(6)}`
  return r
}
function fmtAU(r){
  if(/^AU\d{2}\d{4,6}$/.test(r)) return `AU ${r.slice(2,4)} ${r.slice(4)}`
  if(/^AU20\d{2}\d{4,6}$/.test(r)) return `AU ${r.slice(2,6)} ${r.slice(6)}`
  return r
}
function fmtBE(r){
  if(/^BE\d{2}\d{6,7}$/.test(r)) return `BE ${r.slice(2,4)} ${r.slice(4)}`
  if(/^BE20\d{2}\d{6,7}$/.test(r)) return `BE ${r.slice(2,6)} ${r.slice(6)}`
  return r
}
function fmtDV(r){
  if(/^DV\d{5}\d{2}\d{4,5}$/.test(r)) return `DV ${r.slice(2,7)} ${r.slice(7,9)} ${r.slice(9)}`
  const m = r.match(/^DV(\d{5})-(\d{2})-(\d{4,5})$/)
  if(m) return `DV ${m[1]} ${m[2]} ${m[3]}`
  return r
}
const FORMATTERS = { IHU: fmtIHU, IE: fmtIE, GB: fmtGB, NL: fmtNL, AU: fmtAU, BE: fmtBE, DV: fmtDV }

// Prefix-only format wrapper; if no prefix, add IHU (uppercase)
function formatRing(raw){
  if(!raw) return ''
  let r = String(raw).toUpperCase().replace(/[^A-Z0-9]/g,'')
  const prefixes = ['IHU','IE','GB','NL','AU','BE','DV']
  for(const p of prefixes){
    if(r.startsWith(p)){
      const fmt = FORMATTERS[p]
      return fmt ? fmt(r) : r
    }
  }
  // no prefix -> add IHU
  r = 'IHU' + r
  return fmtIHU(r)
}

// --------------------------- Ring Scanner ---------------------------
function RingScanner({ onDetected }){
  const videoRef = useRef(null)
  const detectorRef = useRef(null)
  const [active,setActive] = useState(false)
  const [supported,setSupported] = useState(false)

  useEffect(()=>{
    if('BarcodeDetector' in window){
      detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code','code_128','code_39','ean_13','ean_8','codabar'] })
      setSupported(true)
    }
  },[])

  async function start(){
    if(!supported) return
    setActive(true)
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    if(videoRef.current){
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      requestAnimationFrame(loop)
    }
  }
  async function loop(){
    if(!active || !detectorRef.current || !videoRef.current) return
    try{
      const codes = await detectorRef.current.detect(videoRef.current)
      if(codes.length){
        stop()
        onDetected(formatRing(codes[0].rawValue.trim()))
        return
      }
    }catch{}
    requestAnimationFrame(loop)
  }
  function stop(){
    setActive(false)
    const s = videoRef.current?.srcObject
    if(s) s.getTracks().forEach(t=>t.stop())
    if(videoRef.current) videoRef.current.srcObject = null
  }

  return (
    <div className='space-y-2'>
      {!active && <button onClick={start} className='px-3 py-2 bg-blue-600 text-white rounded-xl'>Scan Ring</button>}
      {active && (
        <div>
          <video ref={videoRef} className='w-full border rounded-xl' />
          <button onClick={stop} className='px-3 py-2 border rounded-xl mt-2'>Stop</button>
        </div>
      )}
    </div>
  )
}

// --------------------------- App ---------------------------
export default function LoftBookApp(){
  const [pigeons,setPigeons] = useState([])
  function upsertPigeon(p){ setPigeons(prev=>[...prev,{ id: (crypto?.randomUUID?.()||Math.random().toString(36).slice(2)), ...p }]) }

  function PigeonForm(){
    const [form,setForm] = useState({ sex: 'U' })
    return (
      <div className='space-y-4'>
        <div>
          <label className='text-sm font-semibold'>Ring *</label>
          <input className='w-full border rounded-xl px-3 py-2' value={form.ring||''} onChange={e=>setForm(f=>({ ...f, ring: formatRing(e.target.value) }))} />
          <RingScanner onDetected={code=>setForm(f=>({ ...f, ring: code }))} />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='text-sm'>Name</label>
            <input className='w-full border rounded-xl px-3 py-2' value={form.name||''} onChange={e=>setForm(f=>({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className='text-sm'>Sex</label>
            <select className='w-full border rounded-xl px-3 py-2' value={form.sex} onChange={e=>setForm(f=>({ ...f, sex: e.target.value }))}>
              <option value='U'>Unknown</option>
              <option value='C'>Cock</option>
              <option value='H'>Hen</option>
            </select>
          </div>
        </div>
        <button className='px-3 py-2 bg-blue-600 text-white rounded-xl' onClick={()=>upsertPigeon(form)}>Add Pigeon</button>
        <div className='mt-4 space-y-2'>
          {pigeons.map(p=> (
            <div key={p.id} className='text-sm border rounded-xl px-3 py-2'>{p.ring} {p.name ? `• ${p.name}` : ''}</div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='p-4 max-w-3xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Loft Book — IHU Default Prefix</h1>
      <PigeonForm />
    </div>
  )
}
``
