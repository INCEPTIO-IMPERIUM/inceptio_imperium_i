import { useEffect, useState } from 'react'
import DesignSystem from './page/DesignSystem'
import Homepage from './page/Homepage'

const DESIGN_HASH = '#design-system'

function App() {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return hash === DESIGN_HASH ? <DesignSystem /> : <Homepage />
}

export default App
