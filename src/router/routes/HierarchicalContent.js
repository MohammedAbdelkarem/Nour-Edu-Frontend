// ** React Imports
import { lazy } from 'react'

// ** Hierarchical Content Routes
const HierarchicalContent = lazy(() => import('../../views/hierarchical-content'))
const CreateLesson = lazy(() => import('../../views/hierarchical-content/components/CreateLesson'))
const CreateQuiz = lazy(() => import('../../views/hierarchical-content/components/CreateQuiz'))
const QuizProfile = lazy(() => import('../../views/hierarchical-content/components/QuizProfile'))
const CreateQuestion = lazy(() => import('../../views/hierarchical-content/components/CreateQuestion'))
const UpdateQuestion = lazy(() => import('../../views/hierarchical-content/components/UpdateQuestion'))
const LessonProfilePage = lazy(() => import('../../views/hierarchical-content/LessonProfilePage'))

const HierarchicalContentRoutes = [
  {
    path: '/hierarchical-content/create-lesson',
    element: <CreateLesson />,
    meta: {
      action: 'create',
      resource: 'hierarchical-content'
    }
  },
  {
    path: '/hierarchical-content/create-quiz',
    element: <CreateQuiz />,
    meta: {
      action: 'create',
      resource: 'hierarchical-content'
    }
  },
  {
    path: '/hierarchical-content/quiz-profile/:id',
    element: <QuizProfile />,
    meta: {
      action: 'read',
      resource: 'hierarchical-content'
    }
  },
  {
    path: '/hierarchical-content/create-question',
    element: <CreateQuestion />,
    meta: {
      action: 'create',
      resource: 'hierarchical-content'
    }
  },
  {
    path: '/hierarchical-content/update-question/:id',
    element: <UpdateQuestion />,
    meta: {
      action: 'update',
      resource: 'hierarchical-content'
    }
  },
  {
    path: '/hierarchical-content/lesson/:lessonId',
    element: <LessonProfilePage />,
    meta: {
      action: 'read',
      resource: 'hierarchical-content'
    }
  },
  {
    path: '/hierarchical-content',
    element: <HierarchicalContent />,
    meta: {
      action: 'read',
      resource: 'hierarchical-content'
    }
  },
  {
    path: '/hierarchical-content/*',
    element: <HierarchicalContent />,
    meta: {
      action: 'read',
      resource: 'hierarchical-content'
    }
  }
]

export default HierarchicalContentRoutes
