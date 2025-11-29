// ** React Imports
import { lazy } from 'react'

// ** Version Management Routes
const VersionManagement = lazy(() => import('../../views/version-management'))

const VersionManagementRoutes = [
  {
    path: '/version-management',
    element: <VersionManagement />,
    meta: {
      action: 'read',
      resource: 'version-management'
    }
  }
]

export default VersionManagementRoutes

