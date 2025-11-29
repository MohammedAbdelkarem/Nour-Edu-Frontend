// ** React Imports
import { lazy } from 'react'

const CustomerService = lazy(() => import('../../views/service'))

const ServiceRoutes = [
  {
    path: '/customer-service',
    element: <CustomerService />,
     meta: {
      appLayout: true,
      className: 'email-application'
    }
  }
]

export default ServiceRoutes
