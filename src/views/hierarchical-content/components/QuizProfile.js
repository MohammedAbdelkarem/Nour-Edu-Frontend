import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Table,
  Row,
  Col,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input
} from 'reactstrap'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  HelpCircle,
  X,
  Settings,
  Plus
} from 'react-feather'
import {
  useGetMutation,
  useDeatachQuestionsMutation,
  useUpdateMutation,
  useAttachQuestionsMutation,
  useGetQuestionsMutation
} from '../../../redux/rtkQuery/quiz'
import ErrorAlert from '../../components/handleStatusCode/error'

const QuizProfile = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [quiz, setQuiz] = useState(location.state?.quiz || null)
  const [loading, setLoading] = useState(false)
  const [detaching, setDetaching] = useState({})
  const [confirmDetachModal, setConfirmDetachModal] = useState(false)
  const [questionToDetach, setQuestionToDetach] = useState(null)
  const [updateModal, setUpdateModal] = useState(false)
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    hours: '',
    minutes: '',
    degree: '',
    pass_degree: ''
  })
  const [attachModal, setAttachModal] = useState(false)
  const [availableQuestions, setAvailableQuestions] = useState([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [getQuiz] = useGetMutation()
  const [detachQuestions] = useDeatachQuestionsMutation()
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateMutation()
  const [attachQuestions, { isLoading: isAttaching }] = useAttachQuestionsMutation()
  const [getQuestions] = useGetQuestionsMutation()

  const getContextType = (quizData) => {
    if (!quizData) return 'Subject'
    
    if (quizData.context_type) {
      return quizData.context_type
    }
    
    if (quizData.lesson_id || quizData.lesson) {
      console.log('QuizProfile - Detected Lesson context')
      return 'Lesson'
    }
    if (quizData.sub_unit_id || quizData.sub_unit) {
      console.log('QuizProfile - Detected Sub_Unit context')
      return 'Sub_Unit'
    }
    if (quizData.unit_id || quizData.unit) {
      console.log('QuizProfile - Detected Unit context')
      return 'Unit'
    }
    if (quizData.subject_id || quizData.subject) {
      console.log('QuizProfile - Detected Subject context')
      return 'Subject'
    }
    
    console.log('QuizProfile - Defaulting to Subject context')
    return 'Subject'
  }

  const loadAvailableQuestions = async () => {
    if (!quiz) return
    
    try {
      setIsLoadingQuestions(true)
      
      let subjectIds = []
      let subUnitIds = []
      let lessonIds = []
      
      const contextType = getContextType(quiz)
      console.log('QuizProfile - Context type:', contextType)
      
      if (contextType === 'Subject') {
        const subjectId = quiz.subject_id || quiz.subject?.id || quiz.context_id
        if (subjectId) {
          subjectIds = [subjectId]
        }
      } else if (contextType === 'Unit') {
        if (quiz.sub_units && quiz.sub_units.length > 0) {
          subUnitIds = quiz.sub_units.map(subUnit => subUnit.id)
        }
      } else if (contextType === 'Sub_Unit') {
        const subUnitId = quiz.sub_unit_id || quiz.sub_unit?.id
        if (subUnitId) {
          subUnitIds = [subUnitId]
        }
      } else if (contextType === 'Lesson') {
        const lessonId = quiz.lesson_id || quiz.lesson?.id
        if (lessonId) {
          lessonIds = [lessonId]
        }
      }
      
      const apiParams = {
        page: 1,
        per_page: 100
      }

      if (contextType === 'Subject') {
        if (subjectIds.length > 0) {
          apiParams.subject_ids = subjectIds
          console.log('QuizProfile - API CALL - SUBJECT: subject_ids =', subjectIds)
        } else {
          console.log('QuizProfile - WARNING: Subject context but no subject_id found!')
          console.log('QuizProfile - Quiz data:', quiz)
        }
      } else if (contextType === 'Unit' && subUnitIds.length > 0) {
        apiParams.sub_unit_ids = subUnitIds
      } else if (contextType === 'Sub_Unit' && subUnitIds.length > 0) {
        apiParams.sub_unit_ids = subUnitIds
      } else if (contextType === 'Lesson' && lessonIds.length > 0) {
        apiParams.lesson_ids = lessonIds
      }

      const response = await getQuestions(apiParams).unwrap()      
      const attachedQuestionIds = quiz.questions?.map(q => q.id) || []
      
      const filteredQuestions = response.data?.filter(q => !attachedQuestionIds.includes(q.id)) || []
      
      setAvailableQuestions(filteredQuestions)
    } catch (error) {
      ErrorAlert({
        title: t('Error'),
        body: t('Failed to load questions'),
        button: t('OK')
      })
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  useEffect(() => {
    const loadQuiz = async () => {
      if (!quiz && id) {
        try {
          setLoading(true)
          const result = await getQuiz({ id }).unwrap()
          setQuiz(result.data)
        } catch (error) {
          console.error('Error loading quiz:', error)
          ErrorAlert({
            title: t('Error'),
            body: t('Failed to load quiz details'),
            button: t('OK')
          })
          navigate(-1)
        } finally {
          setLoading(false)
        }
      }
    }

    loadQuiz()
  }, [quiz, id, getQuiz, navigate, t])

  // Populate form data when update modal opens
  useEffect(() => {
    if (updateModal && quiz) {
      const totalMinutes = quiz.period || 0
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      
      setUpdateFormData({
        title: quiz.title || '',
        hours: hours.toString(),
        minutes: minutes.toString(),
        degree: quiz.degree || '',
        pass_degree: quiz.pass_degree || ''
      })
    }
  }, [updateModal, quiz])

  const handleDetachQuestion = (questionId) => {
    const question = quiz.questions.find(q => q.id === questionId)
    setQuestionToDetach(question)
    setConfirmDetachModal(true)
  }

  const handleConfirmDetach = async () => {
    if (!questionToDetach) return
    
    try {
      setDetaching(prev => ({ ...prev, [questionToDetach.id]: true }))
      await detachQuestions({ id, q_id: questionToDetach.id }).unwrap()
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionToDetach.id)
      }))
      
      ErrorAlert({
        title: t('Success'),
        body: t('Question detached successfully'),
        button: t('OK')
      })
      
      setConfirmDetachModal(false)
      setQuestionToDetach(null)
    } catch (error) {
      console.error('Error detaching question:', error)
      ErrorAlert({
        title: t('Error'),
        body: error.data.message,
        button: t('OK')
      })
    } finally {
      setDetaching(prev => ({ ...prev, [questionToDetach.id]: false }))
    }
  }

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target
    setUpdateFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateSubmit = async () => {
    try {
      const totalMinutes = ((parseInt(updateFormData.hours) || 0) * 60) + (parseInt(updateFormData.minutes) || 0)
      
      const formData = new URLSearchParams()
      formData.append('title', updateFormData.title)
      formData.append('period', totalMinutes.toString())
      formData.append('degree', updateFormData.degree)
      formData.append('pass_degree', updateFormData.pass_degree)

      await updateQuiz({ id, body: formData }).unwrap()
      setQuiz(prev => ({
        ...prev,
        title: updateFormData.title,
        period: totalMinutes,
        degree: parseInt(updateFormData.degree),
        pass_degree: parseInt(updateFormData.pass_degree)
      }))
      
      setUpdateModal(false)
      
      ErrorAlert({
        title: t('Success'),
        body: t('Quiz updated successfully'),
        button: t('OK')
      })
    } catch (error) {
      console.error('Error updating quiz:', error)
      ErrorAlert({
        title: t('Error'),
        body: error?.data?.message || error?.message || t('Failed to update quiz'),
        button: t('OK')
      })
    }
  }

  const handleAttachQuestions = async () => {
    if (selectedQuestions.length === 0) {
      ErrorAlert({
        title: t('Validation Error'),
        body: t('Please select at least one question to attach'),
        button: t('OK')
      })
      return
    }

    try {
      for (const question of selectedQuestions) {
        await attachQuestions({ id, q_id: question.id }).unwrap()
      }
      setQuiz(prev => ({
        ...prev,
        questions: [...(prev.questions || []), ...selectedQuestions]
      }))
      
      setAttachModal(false)
      setSelectedQuestions([])
      
      ErrorAlert({
        title: t('Success'),
        body: t('Questions attached successfully'),
        button: t('OK')
      })
    } catch (error) {
      ErrorAlert({
        title: t('Error'),
        body: error?.data?.message || error?.message || t('Failed to attach questions'),
        button: t('OK')
      })
    }
  }

  const handleQuestionSelect = (question) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.some(q => q.id === question.id)
      if (isSelected) {
        return prev.filter(q => q.id !== question.id)
      } else {
        return [...prev, question]
      }
    })
  }


  const getQuestionTypeBadge = (type) => {
    switch (type) {
      case 'one_select':
        return <Badge color="light-primary">{t('Single Choice')}</Badge>
      case 'multiple_select':
        return <Badge color="light-success">{t('Multiple Choice')}</Badge>
      default:
        return <Badge color="light-secondary">{t('Unknown')}</Badge>
    }
  }

  if (loading || !quiz) {
    return (
      <div className="text-center py-5">
        <Spinner size="lg" color="primary" />
        <p className="mt-3">{t('Loading quiz details...')}</p>
      </div>
    )
  }

  return (
    <div className="quiz-profile">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button
            color="outline-secondary"
            onClick={() => navigate(-1)}
            className="me-3"
          >
            <ArrowLeft size={16} className="me-1" />
            {t('Back')}
          </Button>
          <div>
            <h2 className="mb-1">{t('Quiz Profile')}</h2>
            <p className="text-muted mb-0">{t('View quiz details and manage questions')}</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button
            color="success"
            onClick={() => {
              setAttachModal(true)
              loadAvailableQuestions()
            }}
            className="d-flex align-items-center"
          >
            <Plus size={16} className="me-1" />
            {t('Attach Questions')}
          </Button>
          <Button
            color="primary"
            onClick={() => setUpdateModal(true)}
            className="d-flex align-items-center"
          >
            <Settings size={16} className="me-1" />
            {t('Update Quiz')}
          </Button>
        </div>
      </div>

      <Row>
        {/* Quiz Details Card */}
        <Col md="4">
          <Card className="h-100" style={{ 
            borderRight: '4px solid #0568a9',
            boxShadow: '0 4px 15px rgba(11, 162, 167, 0.1)'
          }}>
            <CardHeader className="bg-light">
              <div className="d-flex align-items-center">
                <BookOpen size={20} className="text-primary me-2" />
                <h5 className="mb-0">{t('Quiz Details')}</h5>
              </div>
            </CardHeader>
            <CardBody className="p-1">
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <Clock size={16} className="text-primary me-2" />
                    <div>
                      <div className="fw-semibold">{quiz.period} {t('minutes')}</div>
                      <small className="text-muted">{t('Duration')}</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <Target size={16} className="text-success me-2" />
                    <div>
                      <div className="fw-semibold">{quiz.degree} {t('points')}</div>
                      <small className="text-muted">{t('Total Points')}</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <CheckCircle size={16} className="text-warning me-2" />
                    <div>
                      <div className="fw-semibold">{quiz.pass_degree} {t('points')}</div>
                      <small className="text-muted">{t('Passing Score')}</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <HelpCircle size={16} className="text-info me-2" />
                    <div>
                      <div className="fw-semibold">{quiz.questions?.length || 0}</div>
                      <small className="text-muted">{t('Questions')}</small>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Questions Table */}
        <Col md="8">
          <Card>
            <CardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('Quiz Questions')}</h5>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {quiz.questions && quiz.questions.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>{t('Priority')}</th>
                      <th>{t('Question')}</th>
                      <th>{t('Type')}</th>
                      <th>{t('Hint')}</th>
                      <th className="text-center">{t('Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quiz.questions
                      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
                      .map((question) => (
                        <tr key={question.id}>
                          <td>
                            <Badge color="light-primary">
                              {question.priority || 1}
                            </Badge>
                          </td>
                          <td>
                            <div className="question-text">
                              {question.text}
                            </div>
                          </td>
                          <td>
                            {getQuestionTypeBadge(question.type)}
                          </td>
                          <td>
                            <small className="text-muted">
                              {question.hint || t('No hint')}
                            </small>
                          </td>
                          <td className="text-center">
                            <Button
                              size="sm"
                              color="danger"
                              outline
                              onClick={() => handleDetachQuestion(question.id)}
                              disabled={detaching[question.id]}
                            >
                              {detaching[question.id] ? (
                                <Spinner size="sm" />
                              ) : (
                                <>
                                  <X size={14} className="me-1" />
                                  {t('Detach')}
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <HelpCircle size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">{t('No Questions')}</h6>
                  <p className="text-muted mb-0">{t('This quiz has no questions attached')}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Detach Confirmation Modal */}
      <Modal isOpen={confirmDetachModal} toggle={() => setConfirmDetachModal(false)}>
        <ModalHeader toggle={() => setConfirmDetachModal(false)} className="bg-danger text-white">
          <div className="d-flex align-items-center text-white">
            <X size={20} className="me-2" />
            {t('Confirm Detach Question')}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            <p className="mb-3">
              {t('Are you sure you want to detach this question from the quiz?')}
            </p>
            {questionToDetach && (
              <div className="bg-light p-3 rounded mb-3">
                <strong>{t('Question:')}</strong>
                <p className="mb-0 mt-2">{questionToDetach.text}</p>
              </div>
            )}
            <p className="text-muted small">
              {t('This action cannot be undone. The question will be removed from this quiz but will remain in the questions bank.')}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setConfirmDetachModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="danger" 
            onClick={handleConfirmDetach}
            disabled={questionToDetach && detaching[questionToDetach.id]}
          >
            {questionToDetach && detaching[questionToDetach.id] ? (
              <>
                <Spinner size="sm" className="me-1" />
                {t('Detaching...')}
              </>
            ) : (
              <>
                <X size={14} className="me-1" />
                {t('Detach Question')}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Update Quiz Modal */}
      <Modal isOpen={updateModal} toggle={() => setUpdateModal(false)} size="lg">
        <ModalHeader toggle={() => setUpdateModal(false)}>
          {t('Update Quiz')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="update-title">{t('Quiz Title')} <span className="text-danger">*</span></Label>
              <Input
                type="text"
                name="title"
                id="update-title"
                value={updateFormData.title}
                onChange={handleUpdateInputChange}
                placeholder={t('Enter quiz title')}
              />
            </FormGroup>
            
            <Row>
              <Col md="4">
                <FormGroup>
                  <Label for="update-hours">{t('Hours')}</Label>
                  <Input
                    type="number"
                    name="hours"
                    id="update-hours"
                    value={updateFormData.hours}
                    onChange={handleUpdateInputChange}
                    placeholder="0"
                    min="0"
                    max="23"
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label for="update-minutes">{t('Minutes')} <span className="text-danger">*</span></Label>
                  <Input
                    type="number"
                    name="minutes"
                    id="update-minutes"
                    value={updateFormData.minutes}
                    onChange={handleUpdateInputChange}
                    placeholder="20"
                    min="0"
                    max="59"
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label for="update-degree">{t('Total Points')} <span className="text-danger">*</span></Label>
                  <Input
                    type="number"
                    name="degree"
                    id="update-degree"
                    value={updateFormData.degree}
                    onChange={handleUpdateInputChange}
                    placeholder="100"
                    min="1"
                  />
                </FormGroup>
              </Col>
            </Row>
            
            <FormGroup>
              <Label for="update-pass-degree">{t('Passing Score')} <span className="text-danger">*</span></Label>
              <Input
                type="number"
                name="pass_degree"
                id="update-pass-degree"
                value={updateFormData.pass_degree}
                onChange={handleUpdateInputChange}
                placeholder="59"
                min="1"
                max={updateFormData.degree}
              />
              <small className="text-muted">
                {t('Passing score cannot be greater than total points')}
              </small>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setUpdateModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={handleUpdateSubmit}
            disabled={isUpdating || !updateFormData.title || !updateFormData.minutes || !updateFormData.degree || !updateFormData.pass_degree}
          >
            {isUpdating ? (
              <>
                <Spinner size="sm" className="me-1" />
                {t('Updating...')}
              </>
            ) : (
              t('Update Quiz')
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Attach Questions Modal */}
      <Modal isOpen={attachModal} toggle={() => setAttachModal(false)} size="lg">
        <ModalHeader toggle={() => setAttachModal(false)}>
          {t('Attach Questions to Quiz')}
        </ModalHeader>
        <ModalBody>
          {isLoadingQuestions ? (
            <div className="text-center py-4">
              <Spinner size="lg" color="primary" />
              <p className="mt-3">{t('Loading available questions...')}</p>
            </div>
          ) : availableQuestions.length === 0 ? (
            <div className="text-center py-4">
              <HelpCircle size={48} className="text-muted mb-3" />
              <h6 className="text-muted">{t('No Questions Available')}</h6>
              <p className="text-muted mb-0">{t('No questions are available to attach to this quiz.')}</p>
            </div>
          ) : (
            <div>
              <p className="mb-3">
                {t('Select questions to attach to this quiz:')}
              </p>
              <div className="question-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {availableQuestions.map((question) => {
                  const isSelected = selectedQuestions.some(q => q.id === question.id)
                  return (
                    <div
                      key={question.id}
                      className={`question-item p-3 mb-2 border rounded cursor-pointer ${
                        isSelected ? 'border-primary bg-light-primary' : 'border-light'
                      }`}
                      onClick={() => handleQuestionSelect(question)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="fw-semibold mb-1">{question.text}</div>
                          <div className="d-flex gap-2 mb-2">
                            {getQuestionTypeBadge(question.type)}
                            {question.hint && (
                              <Badge color="light-info">{t('Has Hint')}</Badge>
                            )}
                          </div>
                          {question.hint && (
                            <small className="text-muted">{question.hint}</small>
                          )}
                        </div>
                        <div className="ms-2">
                          {isSelected ? (
                            <CheckCircle size={20} className="text-primary" />
                          ) : (
                            <div className="border border-2 rounded-circle" style={{ width: '20px', height: '20px' }} />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {selectedQuestions.length > 0 && (
                <div className="mt-3 p-3 bg-light rounded">
                  <h6 className="mb-2">{t('Selected Questions')} ({selectedQuestions.length})</h6>
                  <div className="d-flex flex-wrap gap-1">
                    {selectedQuestions.map((question) => (
                      <Badge key={question.id} color="primary" className="me-1 mb-1">
                        {question.text.length > 30 ? `${question.text.substring(0, 30)}...` : question.text}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setAttachModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="success" 
            onClick={handleAttachQuestions}
            disabled={isAttaching || selectedQuestions.length === 0}
          >
            {isAttaching ? (
              <>
                <Spinner size="sm" className="me-1" />
                {t('Attaching...')}
              </>
            ) : (
              <>
                <Plus size={14} className="me-1" />
                {t('Attach Selected Questions')}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default QuizProfile
