import { useEffect, useState } from 'react'
import About from './page/About'
import DesignSystem from './page/DesignSystem'
import Homepage from './page/Homepage'

const DESIGN_HASH = '#design-system'
// '#experience' was the page's first address; keep it working.
const ABOUT_HASHES = ['#about', '#experience']

function App() {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (hash === DESIGN_HASH) return <DesignSystem />
  if (ABOUT_HASHES.includes(hash)) return <About />
  return <Homepage />
}

export default App
