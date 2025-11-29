import { lazy } from 'react'

const TeachersList = lazy(() => import('../../views/teachers'))
const TeacherResponsibilities = lazy(() => import('../../views/teachers/Responsibilities'))

const TeachersRoutes = [
  {
    path: '/teachers',
    element: <TeachersList />
  },
  {
    path: '/teachers/:teacherId/responsibilities',
    element: <TeacherResponsibilities />
  }
]

export default TeachersRoutes
