import React, { useState } from 'react'

export default function LoftBookApp(){
  const [input, setInput] = useState('')
  const [formatted, setFormatted] = useState('')
  const [tab, setTab] = useState('scan')

  function formatRing(raw){
    if(!raw) return ''
    let r = raw.toUpperCase().replace(/[^A-Z0-9]/g,'')
    if(!r.startsWith('IHU')) r = 'IHU' + r
    return r
  }

  function handleChange(e){
    const val = e.target.value
    setInput(val)
    setFormatted(formatRing(val))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex flex-col">

      {/* HEADER */}
      <div className="p-4 text-center border-b border-gray-800 backdrop-blur">
        <h1 className="text-2xl font-bold tracking-wide">
          🕊️ LoftBook Pro
        </h1>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-4 space-y-4">

        {tab === 'scan' && (
          <div className="space-y-4">

            {/* INPUT CARD */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-xl">
              <p className="text-sm text-gray-400 mb-2">Ring Input</p>

              <input
                value={input}
                onChange={handleChange}
                placeholder="Enter ring number..."
                className="w-full p-3 rounded-xl bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>

            {/* RESULT CARD */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-sm text-gray-400">Formatted Ring</p>
              <div className="text-2xl font-bold text-blue-400 mt-1">
                {formatted || '—'}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold">
                📷 Scan
              </button>
              <button className="bg-green-600 hover:bg-green-700 p-3 rounded-xl font-semibold">
                ➕ Save
              </button>
            </div>

          </div>
        )}

        {tab === 'birds' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Your Birds</h2>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              🕊️ IHU 26 12345
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              🕊️ NL 24 987654
            </div>
          </div>
        )}

        {tab === 'races' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Races</h2>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              🏁 120km Training
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              🏁 300km Regional
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM NAV */}
      <div className="flex justify-around border-t border-gray-800 bg-black/70 backdrop-blur p-2">
        <button onClick={()=>setTab('scan')} className={tab==='scan' ? 'text-blue-400' : 'text-gray-400'}>
          📷
        </button>
        <button onClick={()=>setTab('birds')} className={tab==='birds' ? 'text-blue-400' : 'text-gray-400'}>
          🕊️
        </button>
        <button onClick={()=>setTab('races')} className={tab==='races' ? 'text-blue-400' : 'text-gray-400'}>
          🏁
        </button>
      </div>

    </div>
  )
}
