import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Alert } from 'reactstrap'
import { ArrowLeft } from 'react-feather'
import LessonProfile from './components/LessonProfile'

const LessonProfilePage = () => {
  const { t } = useTranslation()
  const { lessonId } = useParams()
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/hierarchical-content')
  }

  const handleRefresh = () => {
    // For now, just go back to the lesson list to refresh
    // The parent component will handle the refresh
    navigate('/hierarchical-content')
  }

  if (!lessonId) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Alert color="warning">
            <h5>{t('Invalid Lesson ID')}</h5>
            <p>{t('No lesson ID provided in the URL.')}</p>
            <button 
              className="btn btn-primary"
              onClick={handleBack}
            >
              <ArrowLeft size={16} className="me-1" />
              {t('Go Back')}
            </button>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <LessonProfile
      lessonId={lessonId}
      onBack={handleBack}
      onRefresh={handleRefresh}
    />
  )
}

export default LessonProfilePage
