import { lazy } from 'react'

const UsersList = lazy(() => import('../../views/users/list'))
const UserProfile = lazy(() => import('../../views/users/profile'))
const StudentProfile = lazy(() => import('../../views/users/profile/StudentProfile'))
const AdminProfile = lazy(() => import('../../views/auth/profile'))

const UsersRoutes = [
  {
    path: '/users',
    element: <UsersList />
  },
  {
    path: '/users/profile/:name',
    element: <UserProfile />
  },
  {
    path: '/users/student/:id',
    element: <StudentProfile />
  },
  {
    path: '/admins/profile/:name',
    element: <AdminProfile />
  }
]

export default UsersRoutes
