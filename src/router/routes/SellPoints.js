// ** React Imports
import { lazy } from 'react'

const SellPointsManagement = lazy(() => import('../../views/sell-points'))

export const SellPointsRoutes = [
  {
    path: '/sell-points',
    element: <SellPointsManagement />,
    meta: {
      layout: 'vertical',
      publicRoute: false,
      restricted: false
    }
  }
]
