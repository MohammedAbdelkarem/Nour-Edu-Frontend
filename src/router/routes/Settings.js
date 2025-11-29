// ** React Imports
import { lazy } from 'react'

const Settings = lazy(() => import('../../views/settings'))

const SettingsRoutes = [
  {
    path: '/settings',
    element: <Settings />
  }
]

export default SettingsRoutes
