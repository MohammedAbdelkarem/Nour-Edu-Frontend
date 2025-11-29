import { lazy } from 'react'

const StaticPages = lazy(() => import('../../views/statics-pages'))

const StaticsRoutes = [
  {
    path: '/statics-pages',
    element: <StaticPages />
  }
]

export default StaticsRoutes
