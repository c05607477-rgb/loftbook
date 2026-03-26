import React, { useState, useEffect } from 'react'

// ---------- STORAGE ----------
function loadBirds(){
  return JSON.parse(localStorage.getItem('birds') || '[]')
}

function saveBirds(birds){
  localStorage.setItem('birds', JSON.stringify(birds))
}

// ---------- APP ----------
export default function LoftBookApp(){
  const [birds, setBirds] = useState([])
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('scan')
  const [search, setSearch] = useState('')

  useEffect(()=>{
    setBirds(loadBirds())
  },[])

  useEffect(()=>{
    saveBirds(birds)
  },[birds])

  function formatRing(raw){
    if(!raw) return ''
    let r = raw.toUpperCase().replace(/[^A-Z0-9]/g,'')
    if(!r.startsWith('IHU')) r = 'IHU' + r
    return r
  }

  function addBird(){
    const ring = formatRing(input)
    if(!ring) return

    const newBird = {
      id: Date.now(),
      ring,
      father: null,
      mother: null
    }

    setBirds([...birds, newBird])
    setInput('')
  }

  function setParent(childId, parentType, parentRing){
    setBirds(birds.map(b=>{
      if(b.id === childId){
        return {...b, [parentType]: parentRing}
      }
      return b
    }))
  }

  const filtered = birds.filter(b =>
    b.ring.toLowerCase().includes(search.toLowerCase())
  )

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* HEADER */}
      <div className="p-4 text-center border-b border-gray-800">
        <h1 className="text-xl font-bold">🕊️ LoftBook Pro</h1>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-4 space-y-4">

        {/* SCAN TAB */}
        {tab === 'scan' && (
          <>
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              placeholder="Enter ring..."
              className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700"
            />

            <button onClick={addBird}
              className="w-full bg-blue-600 p-3 rounded-xl">
              ➕ Save Bird
            </button>
          </>
        )}

        {/* BIRDS TAB */}
        {tab === 'birds' && (
          <>
            <input
              placeholder="Search..."
              value={search}
              onChange={e=>setSearch(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800"
            />

            {filtered.map(b=>(
              <div key={b.id}
                onClick={()=>setSelected(b)}
                className="p-3 bg-gray-800 rounded-xl mb-2 cursor-pointer">

                <div className="font-bold">{b.ring}</div>
                <div className="text-sm text-gray-400">
                  Father: {b.father || '-'} | Mother: {b.mother || '-'}
                </div>

              </div>
            ))}
          </>
        )}

        {/* PEDIGREE TAB */}
        {tab === 'pedigree' && selected && (
          <div className="space-y-3">

            <h2 className="text-lg font-semibold text-center">
              🧬 Pedigree
            </h2>

            {/* TREE */}
            <div className="bg-gray-900 p-4 rounded-xl text-center">
              <div className="text-blue-400 font-bold">
                {selected.ring}
              </div>

              <div className="flex justify-between mt-4">
                <div>
                  <div className="text-sm text-gray-400">Father</div>
                  <div>{selected.father || '-'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Mother</div>
                  <div>{selected.mother || '-'}</div>
                </div>
              </div>
            </div>

            {/* SET PARENTS */}
            <input
              placeholder="Set Father Ring"
              onBlur={e=>setParent(selected.id,'father', formatRing(e.target.value))}
              className="w-full p-2 bg-gray-800 rounded"
            />

            <input
              placeholder="Set Mother Ring"
              onBlur={e=>setParent(selected.id,'mother', formatRing(e.target.value))}
              className="w-full p-2 bg-gray-800 rounded"
            />

          </div>
        )}

      </div>

      {/* NAV */}
      <div className="flex justify-around p-2 border-t border-gray-800">
        <button onClick={()=>setTab('scan')}>📷</button>
        <button onClick={()=>setTab('birds')}>🕊️</button>
        <button onClick={()=>setTab('pedigree')}>🧬</button>
      </div>

    </div>
  )
}
