import { useEffect, useState } from 'react'
import DesignSystem from './page/DesignSystem'
import Experience from './page/Experience'
import Homepage from './page/Homepage'

const DESIGN_HASH = '#design-system'
const EXPERIENCE_HASH = '#experience'

function App() {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (hash === DESIGN_HASH) return <DesignSystem />
  if (hash === EXPERIENCE_HASH) return <Experience />
  return <Homepage />
}

export default App
