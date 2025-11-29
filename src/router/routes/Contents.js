import { lazy } from 'react'

const ContentPages = lazy(() => import('../../views/content'))
const StoryManagement = lazy(() => import('../../views/content/components/story/management'))
const BannerManagement = lazy(() => import('../../views/content/components/banner/management'))

const ContentRoutes = [
  {
    path: '/content-pages',
    element: <ContentPages />
  },
  {
    path: '/story-management',
    element: <StoryManagement />
  },
  {
    path: '/banner-management',
    element: <BannerManagement />
  }
]

export default ContentRoutes
