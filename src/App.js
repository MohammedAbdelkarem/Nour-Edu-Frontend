import { Suspense, useEffect } from 'react'

// ** Router Import
import Router from './router/Router'
import { useOverviewMutation } from './redux/rtkQuery/admin'
import useHeaders from '@hooks/useHeaders'

const App = () => {
  const headers = useHeaders()
  const [overview] = useOverviewMutation()

  useEffect(() => {
    overview({headers})
  }, [])

  return (
    <Suspense fallback={null}>
      <Router />
    </Suspense>
  )
}

export default App
