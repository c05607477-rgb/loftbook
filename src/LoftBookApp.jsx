import React, { useEffect, useRef, useState } from 'react'

/* LoftBook — prefix-only ring formatting + camera scanning
   - If a ring has a known prefix (IHU, IE, GB, NL, AU, BE, DV), format using that country’s rules
   - If NO prefix is present, automatically add **IHU** (uppercase) as default and format
*/

// --------------------------- Country Formatters ---------------------------
function fmtIHU(r){
  // IHU 26 12345
  if(/^IHU\d{2}\d{5}$/.test(r)) return `IHU ${r.slice(3,5)} ${r.slice(5)}`
  // IHU 2026 12345
  if(/^IHU20\d{2}\d{5}$/.test(r)) return `IHU ${r.slice(3,7)} ${r.slice(7)}`
  return r
}
function fmtIE(r){
  if(/^IE\d{2}\d{5}$/.test(r)) return `IE ${r.slice(2,4)} ${r.slice(4)}`
  if(/^IE20\d{2}\d{5}$/.test(r)) return `IE ${r.slice(2,6)} ${r.slice(6)}`
  return r
}
function fmtGB(r){
  // GB 24 A 12345  /  GB 2024 A 12345
  if(/^GB\d{2}[A-Z]\d{4,6}$/.test(r)) return `GB ${r.slice(2,4)} ${r.slice(4,5)} ${r.slice(5)}`
  if(/^GB20\d{2}[A-Z]\d{4,6}$/.test(r)) return `GB ${r.slice(2,6)} ${r.slice(6,7)} ${r.slice(7)}`
  return r
}
function fmtNL(r){
  // NL 24 123456 / NL 2024 123456
  if(/^NL\d{2}\d{5,6}$/.test(r)) return `NL ${r.slice(2,4)} ${r.slice(4)}`
  if(/^NL20\d{2}\d{5,6}$/.test(r)) return `NL ${r.slice(2,6)} ${r.slice(6)}`
  return r
}
function fmtAU(r){
  // AU 24 12345 / AU 2024 123456
  if(/^AU\d{2}\d{4,6}$/.test(r)) return `AU ${r.slice(2,4)} ${r.slice(4)}`
  if(/^AU20\d{2}\d{4,6}$/.test(r)) return `AU ${r.slice(2,6)} ${r.slice(6)}`
  return r
}
function fmtBE(r){
  // BE 24 1234567 / BE 2024 1234567
  if(/^BE\d{2}\d{6,7}$/.test(r)) return `BE ${r.slice(2,4)} ${r.slice(4)}`
  if(/^BE20\d{2}\d{6,7}$/.test(r)) return `BE ${r.slice(2,6)} ${r.slice(6)}`
  return r
}
function fmtDV(r){
  // DV 01234 24 1234 / DV 01234-24-12345
  if(/^DV\d{5}\d{2}\d{4,5}$/.test(r)) return `DV ${r.slice(2,7)} ${r.slice(7,9)} ${r.slice(9)}`
  const m = r.match(/^DV(\d{5})-(\d{2})-(\d{4,5})$/)
  if(m) return `DV ${m[1]} ${m[2]} ${m[3]}`
  return r
}

const FORMATTERS = { IHU: fmtIHU, IE: fmtIE, GB: fmtGB, NL: fmtNL, AU: fmtAU, BE: fmtBE, DV: fmtDV }

// --------------------------- Prefix-only Wrapper ---------------------------
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
  // No prefix → add default IHU
  r = 'IHU' + r
  return fmtIHU(r)
}

// --------------------------- Camera Ring Scanner ---------------------------
function RingScanner({ onDetected }){
  const videoRef = useRef(null)
  const detectorRef = useRef(null)
  const [active,setActive] = useState(false)
  const [supported,setSupported] = useState(false)

  useEffect(()=>{
    if('BarcodeDetector' in window){
      detectorRef.current = new window.BarcodeDetector({
        formats: ['qr_code','code_128','code_39','ean_13','ean_8','codabar']
      })
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
   const [ring, setRing] = useState('')
  const [formatted, setFormatted] = useState('')

  function handleChange(e){
    const value = e.target.value
    setRing(value)
    setFormatted(formatRing(value))
  }

  function handleDetected(value){
    setRing(value)
    setFormatted(value)
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">LoftBook</h1>

      <input
        value={ring}
        onChange={handleChange}
        placeholder="Enter ring number"
        className="w-full border p-2 rounded-xl"
      />

      <div className="p-2 bg-gray-100 rounded-xl">
        <strong>Formatted:</strong> {formatted}
      </div>

      <RingScanner onDetected={handleDetected} />
    </div>
  )
}
 
