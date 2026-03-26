import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Tree from 'react-d3-tree'

// ---------- STORAGE ----------
function loadBirds() {
  try {
    return JSON.parse(localStorage.getItem('birds') || '[]')
  } catch {
    return []
  }
}

function saveBirds(birds) {
  try {
    localStorage.setItem('birds', JSON.stringify(birds))
  } catch (e) {
    console.warn('Could not save birds', e)
  }
}

// ---------- TREE BUILDER ----------
function buildTree(selectedBird, birds) {
  if (!selectedBird) return null

  const getNode = (bird) => ({
    name: bird.ring,
    children: [
      bird.father ? getNode(birds.find(b => b.ring === bird.father)) : null,
      bird.mother ? getNode(birds.find(b => b.ring === bird.mother)) : null
    ].filter(Boolean)
  })

  return getNode(selectedBird)
}

// ---------- APP ----------
export default function LoftBookApp() {
  const [birds, setBirds] = useState([])
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    setBirds(loadBirds())
  }, [])

  useEffect(() => {
    saveBirds(birds)
  }, [birds])

  // ---------- HELPERS ----------
  function formatRing(raw) {
    if (!raw) return ''
    let r = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!r.startsWith('IHU')) r = 'IHU' + r
    return r
  }

  function addBird() {
    const ring = formatRing(input)
    if (!ring) return

    const newBird = { id: Date.now(), ring, father: null, mother: null }
    setBirds([...birds, newBird])
    setInput('')
    setNotification(`${ring} added!`)
    setTimeout(() => setNotification(null), 2000)
  }

  function setParent(childId, parentType, parentRing) {
    setBirds(birds.map(b => {
      if (b.id === childId) return { ...b, [parentType]: parentRing }
      return b
    }))
  }

  const filtered = birds.filter(b =>
    b.ring.toLowerCase().includes(search.toLowerCase())
  )

  // ---------- UI ----------
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        {/* HEADER */}
        <div className="p-4 text-center border-b border-gray-800">
          <h1 className="text-xl font-bold">🕊️ LoftBook Pro</h1>
        </div>

        {/* NOTIFICATIONS */}
        <AnimatePresence>
          {notification && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-2 rounded z-50"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTENT */}
        <div className="flex-1 p-4 space-y-4 overflow-auto">
          <Routes>
            {/* SCAN TAB */}
            <Route path="/" element={
              <>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addBird() }}
                  placeholder="Enter ring..."
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 mb-2"
                />
                <button
                  type="button"
                  onClick={addBird}
                  className="w-full bg-blue-600 p-3 rounded-xl mb-4">
                  ➕ Save Bird
                </button>

                {/* Instant feedback */}
                <div className="space-y-2">
                  {birds.map(b => (
                    <div key={b.id} className="p-2 bg-gray-800 rounded">{b.ring}</div>
                  ))}
                </div>
              </>
            } />

            {/* BIRDS TAB */}
            <Route path="/birds" element={
              <>
                <input
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-800 mb-2"
                />
                {filtered.map(b => (
                  <div key={b.id}
                    onClick={() => setSelected(b)}
                    className="p-3 bg-gray-800 rounded-xl mb-2 cursor-pointer">
                    <div className="font-bold">{b.ring}</div>
                    <div className="text-sm text-gray-400">
                      Father: {b.father || '-'} | Mother: {b.mother || '-'}
                    </div>
                  </div>
                ))}
              </>
            } />

            {/* PEDIGREE TAB */}
            <Route path="/pedigree" element={
              selected ? (
                <div className="w-full h-96 overflow-auto">
                  <Tree
                    data={buildTree(selected, birds)}
                    orientation="vertical"
                    translate={{ x: 200, y: 50 }}
                    nodeSize={{ x: 150, y: 80 }}
                    pathFunc="elbow"
                    collapsible={false}
                    zoomable={true}
                    separation={{ siblings: 1, nonSiblings: 2 }}
                    onNodeClick={(node) =>
                      setSelected(birds.find(b => b.ring === node.data.name))
                    }
                  />
                </div>
              ) : <div className="text-center text-gray-400">Select a bird in Birds tab</div>
            } />
          </Routes>
        </div>

        {/* NAV */}
        <div className="flex justify-around p-2 border-t border-gray-800">
          <Link to="/" className="text-xl">📷</Link>
          <Link to="/birds" className="text-xl">🕊️</Link>
          <Link to="/pedigree" className="text-xl">🧬</Link>
        </div>
      </div>
    </Router>
  )
}
