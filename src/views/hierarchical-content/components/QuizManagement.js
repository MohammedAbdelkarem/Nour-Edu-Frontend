import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Alert,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap'
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Clock,
  Target,
  BookOpen
} from 'react-feather'
import {
  useGetMutation,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useGetQuestionsMutation,
  useChangeStatusMutation
} from '../../../redux/rtkQuery/quiz'
import ErrorAlert from '../../components/handleStatusCode/error'
import EmptyComponent from '../../components/empty'
import './QuizManagement.scss'

const QuizManagement = ({ 
  contextId, 
  contextType, 
  contextName,
  selectedPath,
  onRefresh
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [statusModal, setStatusModal] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState({})
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [currentMode, setCurrentMode] = useState('list')
  const [formData, setFormData] = useState({
    title: '',
    period: 20,
    degree: 100,
    pass_degree: 59
  })

  const [getQuizzes] = useGetMutation()
  const [createQuiz, {isLoading: isCreating}] = useCreateMutation()
  const [updateQuiz, {isLoading: isUpdating}] = useUpdateMutation()
  const [deleteQuiz, {isLoading: isDeleting}] = useDeleteMutation()
  const [changeStatus, {isLoading: isChangingStatus}] = useChangeStatusMutation()
  const [getQuestions] = useGetQuestionsMutation()

  const getFirstUnitId = () => {
    if (selectedPath && selectedPath.length >= 4) {
      const unitIndex = selectedPath.findIndex(item => item.type === 'Unit')
      if (unitIndex !== -1) {
        return selectedPath[unitIndex].id
      }
    }
    return null
  }

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      const result = await getQuizzes({
        page: 1,
        per_page: 100,
        context_id: contextId,
        context_type: contextType
      }).unwrap()
      
      setQuizzes(result.data || [])
    } catch (error) {
      console.error('Error loading quizzes:', error)
      ErrorAlert({
        title: t('Error'),
        body: t('Failed to load quizzes'),
        button: t('OK')
      })
    } finally {
      setLoading(false)
    }
  }

  const loadQuestions = async () => {
    const unitId = getFirstUnitId()
    if (!unitId) return

    try {
      setQuestionsLoading(true)
      const result = await getQuestions({
        page: 1,
        per_page: 100,
        unit_id: unitId,
        sub_unit_id: null
      }).unwrap()
      
      setQuestions(result.data || [])
    } catch (error) {
      console.error('Error loading questions:', error)
      ErrorAlert({
        title: t('Error'),
        body: t('Failed to load questions'),
        button: t('OK')
      })
    } finally {
      setQuestionsLoading(false)
    }
  }

  useEffect(() => {
    if (contextId && contextType) {
      loadQuizzes()
    }
  }, [contextId, contextType])

  useEffect(() => {
    loadQuestions()
  }, [selectedPath])

  const toggleDropdown = (id) => {
    setDropdownOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleCreate = () => {
    navigate('/hierarchical-content/create-quiz', {
      state: { selectedPath }
    })
  }

  const handleCancel = () => {
    setCurrentMode('list')
    setSelectedQuiz(null)
    setFormData({
      title: '',
      period: 20,
      degree: 100,
      pass_degree: 59
    })
    setSelectedQuestions([])
  }

  const handleDelete = (quiz) => {
    setSelectedQuiz(quiz)
    setDeleteModal(true)
  }

  const handleStatusChange = (quiz) => {
    setSelectedQuiz(quiz)
    setStatusModal(true)
  }

  const handleViewProfile = (quiz) => {
    navigate(`/hierarchical-content/quiz-profile/${quiz.id}`, {
      state: { 
        quiz,
        selectedPath,
        contextName
      }
    })
  }

  const handleConfirmStatusChange = async () => {
    if (!selectedQuiz) return
    
    try {
      const newStatus = selectedQuiz.publish_status === 'published' ? 'draft' : 'published'
      await changeStatus({
        id: selectedQuiz.id,
        status: newStatus
      }).unwrap()
      setQuizzes(prev => prev.map(q => (q.id === selectedQuiz.id ? { ...q, publish_status: newStatus } : q)))
      setStatusModal(false)
      setSelectedQuiz(null)
      
      ErrorAlert({
        title: t('Success'),
        body: t('Quiz status updated successfully'),
        button: t('OK')
      })
    } catch (error) {
      console.error('Error changing status:', error)
      ErrorAlert({
        title: t('Error'),
        body: t('Failed to update quiz status'),
        button: t('OK')
      })
    }
  }

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions(prev => {
      const existing = prev.find(q => q.id === questionId)
      if (existing) {
        return prev.filter(q => q.id !== questionId)
      }
      return [...prev, { id: questionId, priority: prev.length + 1 }]
    })
  }

  const handlePriorityChange = (questionId, newPriority) => {
    setSelectedQuestions(prev => prev.map(q => (q.id === questionId ? { ...q, priority: parseInt(newPriority) } : q)))
  }

  const moveQuestion = (questionId, direction) => {
    setSelectedQuestions(prev => {
      const newQuestions = [...prev]
      const index = newQuestions.findIndex(q => q.id === questionId)
      
      if (direction === 'up' && index > 0) {
        [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]]
      } else if (direction === 'down' && index < newQuestions.length - 1) {
        [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]]
      }
      
      // Update priorities
      return newQuestions.map((q, idx) => ({ ...q, priority: idx + 1 }))
    })
  }

  const handleSubmitCreate = async () => {
    try {
      const formDataPayload = new FormData()
      formDataPayload.append('title', formData.title)
      formDataPayload.append('context_id', contextId)
      formDataPayload.append('context_type', contextType)
      formDataPayload.append('period', formData.period)
      formDataPayload.append('degree', formData.degree)
      formDataPayload.append('pass_degree', formData.pass_degree)

      selectedQuestions.forEach((question, index) => {
        formDataPayload.append(`questions[${index + 1}][id]`, question.id)
        formDataPayload.append(`questions[${index + 1}][priority]`, question.priority)
      })

      await createQuiz({ body: formDataPayload }).unwrap()
      setCurrentMode('list')
      loadQuizzes()
      onRefresh?.()
    } catch (error) {
      console.error('Error creating quiz:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to create quiz')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitEdit = async () => {
    try {
      const formDataPayload = new FormData()
      formDataPayload.append('title', formData.title)
      formDataPayload.append('period', formData.period)
      formDataPayload.append('degree', formData.degree)
      formDataPayload.append('pass_degree', formData.pass_degree)

      selectedQuestions.forEach((question, index) => {
        formDataPayload.append(`questions[${index + 1}][id]`, question.id)
        formDataPayload.append(`questions[${index + 1}][priority]`, question.priority)
      })

      await updateQuiz({ body: formDataPayload, id: selectedQuiz.id }).unwrap()
      setCurrentMode('list')
      setSelectedQuiz(null)
      loadQuizzes()
      onRefresh?.()
    } catch (error) {
      console.error('Error updating quiz:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to update quiz')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitDelete = async () => {
    try {
      await deleteQuiz({ id: selectedQuiz.id }).unwrap()
      setDeleteModal(false)
      setSelectedQuiz(null)
      loadQuizzes()
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting quiz:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to delete quiz')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }


  const getQuestionTypeBadge = (type) => {
    switch (type) {
      case 'one_select':
        return <Badge color="light-primary">{t('Single Choice')}</Badge>
      case 'multi_select':
        return <Badge color="light-success">{t('Multiple Choice')}</Badge>
      case 'text':
        return <Badge color="light-warning">{t('Text')}</Badge>
      default:
        return <Badge color="light-secondary">{t('Unknown')}</Badge>
    }
  }

  const renderQuizForm = () => {
    return (
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                {currentMode === 'create' ? t('Create New Quiz') : t('Edit Quiz')}
              </h5>
              <small className="text-muted">
                {t('Manage quiz for')} {contextName}
              </small>
            </div>
            <Button color="secondary" outline onClick={handleCancel} size="sm">
              {t('Back to List')}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="quiz-title">{t('Quiz Title')} <span className="text-danger">*</span></Label>
                  <Input
                    type="text"
                    name="title"
                    id="quiz-title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder={t('Enter quiz title')}
                  />
                </FormGroup>
              </Col>
              <Col md="3">
                <FormGroup>
                  <Label for="quiz-period">{t('Duration (minutes)')} <span className="text-danger">*</span></Label>
                  <Input
                    type="number"
                    name="period"
                    id="quiz-period"
                    value={formData.period}
                    onChange={handleInputChange}
                    min="1"
                  />
                </FormGroup>
              </Col>
              <Col md="3">
                <FormGroup>
                  <Label for="quiz-degree">{t('Total Points')} <span className="text-danger">*</span></Label>
                  <Input
                    type="number"
                    name="degree"
                    id="quiz-degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    min="1"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="quiz-pass-degree">{t('Passing Score')} <span className="text-danger">*</span></Label>
                  <Input
                    type="number"
                    name="pass_degree"
                    id="quiz-pass-degree"
                    value={formData.pass_degree}
                    onChange={handleInputChange}
                    min="1"
                    max={formData.degree}
                  />
                </FormGroup>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button color="secondary" outline onClick={handleCancel}>
                {t('Cancel')}
              </Button>
              <Button 
                color="primary" 
                onClick={currentMode === 'create' ? handleSubmitCreate : handleSubmitEdit}
                disabled={!formData.title || selectedQuestions.length === 0 || isCreating || isUpdating}
              >
                {currentMode === 'create' ? (
                  <>
                    <Plus size={14} className="me-1" />
                    {isCreating ? t('Creating...') : t('Create Quiz')}
                  </>
                ) : (
                  <>
                    <Edit size={14} className="me-1" />
                    {isUpdating ? t('Updating...') : t('Update Quiz')}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    )
  }

  const renderQuizList = () => {
    return (
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">{t('Quiz Management')}</h5>
              <small className="text-muted">
                {t('Manage quizzes for')} {contextName}
              </small>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">{t('Quizzes')}</h6>
            <Button color="primary" onClick={handleCreate} size="sm">
              <Plus size={14} className="me-1" />
              {t('Create Quiz')}
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t('Loading...')}</span>
              </div>
            </div>
          ) : quizzes.length === 0 ? (
            <EmptyComponent 
              title={t('No Quizzes Found')}
              body={t('No quizzes found. Click Add Quiz to create your first quiz.')}
            />
          ) : (
            <Row>
              {quizzes.map((quiz) => (
                <Col key={quiz.id} md={6} className="mb-3">
                  <Card 
                    className="content-card"
                    style={{ 
                      overflow: 'visible', 
                      position: 'relative', 
                      zIndex: 1,
                      borderLeft: '4px solid #0568a9',
                      boxShadow: '0 4px 15px rgba(11, 162, 167, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(11, 162, 167, 0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(11, 162, 167, 0.1)'
                    }}
                  >
                    <CardBody className="p-1">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center flex-grow-1">
                          <BookOpen size={18} className="text-primary m-1" />
                          <h6 className="mb-0 fw-bold text-dark">{quiz.title}</h6>
                        </div>
                        <div className="d-flex align-items-center">
                          <Badge 
                            color={quiz.publish_status === 'published' ? 'light-success' : 'light-secondary'} 
                            size="sm"
                            className="me-2"
                          >
                            {quiz.publish_status === "published" ? t('Published') : t('Draft')}
                          </Badge>
                          <Dropdown 
                            isOpen={dropdownOpen[quiz.id] || false} 
                            toggle={() => toggleDropdown(quiz.id)}
                            onClick={(e) => e.stopPropagation()}
                            direction="up"
                          >
                            <DropdownToggle 
                              tag="div" 
                              className="cursor-pointer p-1"
                              style={{ cursor: 'pointer', zIndex: 10, position: 'relative' }}
                            >
                              <Settings size={14} className="text-muted" />
                            </DropdownToggle>
                            <DropdownMenu 
                              end 
                              style={{ 
                                zIndex: 99999,
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                minWidth: '200px',
                                backgroundColor: 'white',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                                maxHeight: 'none',
                                overflow: 'visible',
                                display: 'block'
                              }}
                            >
                              <DropdownItem onClick={() => handleViewProfile(quiz)}>
                                <Eye size={14} className="me-2" />
                                {t('View Profile')}
                              </DropdownItem>
                              <DropdownItem onClick={() => handleStatusChange(quiz)}>
                                {quiz.publish_status === 'published' ? (
                                  <>
                                    <EyeOff size={14} className="me-2" />
                                    {t('Unpublish')}
                                  </>
                                ) : (
                                  <>
                                    <Eye size={14} className="me-2" />
                                    {t('Publish')}
                                  </>
                                )}
                              </DropdownItem>
                              <DropdownItem divider />
                              <DropdownItem onClick={() => handleDelete(quiz)} className="text-danger">
                                <Trash2 size={14} className="me-2" />
                                {t('Delete')}
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </div>
                      
                      {/* Statistics Row */}
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <small className="text-muted">
                            <strong>{quiz.number_of_questions || 0}</strong> {t('Questions')}
                          </small>
                          <small className="text-muted">
                            <strong>{quiz.degree}</strong> {t('pts')}
                          </small>
                        </div>
                        {quiz.period > 0 && (
                          <small className="text-muted">
                            <strong>{quiz.period}</strong> {t('min')}
                          </small>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="quiz-management">
      {currentMode === 'list' ? renderQuizList() : renderQuizForm()}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>
          {t('Delete Quiz')}
        </ModalHeader>
        <ModalBody>
          <p>{t('Are you sure you want to delete this quiz? This action cannot be undone.')}</p>
          {selectedQuiz && (
            <Alert color="warning">
              <strong>{t('Quiz')}:</strong> {selectedQuiz.title}
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setDeleteModal(false)}>
            {t('Cancel')}
          </Button>
          <Button color="danger" onClick={handleSubmitDelete}>
            <Trash2 size={14} className="me-1" />
            {isDeleting ? t('Deleting...') : t('Delete Quiz')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Status Change Confirmation Modal */}
      <Modal isOpen={statusModal} toggle={() => setStatusModal(false)} centered>
        <ModalHeader toggle={() => setStatusModal(false)}>
          {selectedQuiz?.publish_status === 'published' ? t('Move to Draft') : t('Publish Quiz')}
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            <div className="mb-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                   style={{ width: '64px', height: '64px', backgroundColor: '#0568a9', color: 'white' }}>
                {selectedQuiz?.publish_status === 'published' ? (
                  <EyeOff size={24} />
                ) : (
                  <Eye size={24} />
                )}
              </div>
              <h5 className="mb-2">
                {selectedQuiz?.publish_status === 'published' ? t('Move Quiz to Draft?') : t('Publish Quiz?')}
              </h5>
              <p className="text-muted mb-0">
                {selectedQuiz?.publish_status === 'published' ? t('This quiz will be moved to draft status and will not be visible to students.') : t('This quiz will be published and will be visible to students.')}
              </p>
            </div>
            <div className="border rounded-3 p-3 bg-light">
              <h6 className="mb-1">{selectedQuiz?.title}</h6>
              <div className="d-flex justify-content-center gap-4 text-muted small">
                <span>
                  <Clock size={12} className="me-1" />
                  {selectedQuiz?.period} {t('min')}
                </span>
                <span>
                  <Target size={12} className="me-1" />
                  {selectedQuiz?.degree} {t('pts')}
                </span>
                <span>
                  <BookOpen size={12} className="me-1" />
                  {selectedQuiz?.number_of_questions || 0} {t('questions')}
                </span>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setStatusModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color={selectedQuiz?.publish_status === 'published' ? 'warning' : 'success'} 
            onClick={handleConfirmStatusChange}
            disabled={isChangingStatus}
          >
            {isChangingStatus ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">{t('Loading...')}</span>
                </div>
                {t('Processing...')}
              </>
            ) : (
              <>
                {selectedQuiz?.publish_status === 'published' ? (
                  <>
                    <EyeOff size={14} className="me-1" />
                    {t('Move to Draft')}
                  </>
                ) : (
                  <>
                    <Eye size={14} className="me-1" />
                    {t('Publish')}
                  </>
                )}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default QuizManagement

