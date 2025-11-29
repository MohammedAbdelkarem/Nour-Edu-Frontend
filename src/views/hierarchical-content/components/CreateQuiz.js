import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Badge
} from 'reactstrap'
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  HelpCircle,
  Target,
  BookOpen
} from 'react-feather'
import {
  useCreateMutation,
  useGetQuestionsMutation
} from '../../../redux/rtkQuery/quiz'
import ErrorAlert from '../../components/handleStatusCode/error'

const CreateQuiz = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const selectedPath = location.state?.selectedPath || []
  
  function getContextType(path) {
    console.log('path', path)
    
    if (path.length === 4) return 'Subject'
    if (path.length === 5) return 'Unit'
    if (path.length === 6) return 'Sub_Unit'
    if (path.length === 7) return 'Lesson'
    return 'Subject'
  }
  
  const [formData, setFormData] = useState({
    title: '',
    period: '',
    degree: '',
    pass_degree: '',
    context_id: selectedPath[selectedPath.length - 1]?.id || '',
    context_type: getContextType(selectedPath)
  })
  console.log('formData', formData)
  
  
  const [timerData, setTimerData] = useState({
    hours: 0,
    minutes: 30
  })
  
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [availableQuestions, setAvailableQuestions] = useState([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [createQuiz, { isLoading: isCreating }] = useCreateMutation()
  const [getQuestions] = useGetQuestionsMutation()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: value
      }
      
      // If updating pass_degree, ensure it's not greater than degree
      if (name === 'pass_degree' && newFormData.degree && parseInt(value) > parseInt(newFormData.degree)) {
        ErrorAlert({
          title: t('Validation Error'),
          body: t('Passing score cannot be greater than total score'),
          button: t('OK')
        })
        return prev // Don't update if validation fails
      }
      
      return newFormData
    })
  }

  const handleTimerChange = (field, value) => {
    const newTimerData = {
      ...timerData,
      [field]: parseInt(value) || 0
    }
    setTimerData(newTimerData)
    
    const totalMinutes = (newTimerData.hours * 60) + newTimerData.minutes
    setFormData(prev => ({
      ...prev,
      period: totalMinutes
    }))
  }

  const loadQuestions = async () => {
    try {
      setIsLoadingQuestions(true)
      
      let subjectIds = []
      let subUnitIds = []
      let lessonIds = []
      
      if (formData.context_type === 'Subject') {
        subjectIds = [formData.context_id]
        console.log('SUBJECT QUIZ - Subject ID:', formData.context_id)
        console.log('SUBJECT QUIZ - Extracted subject IDs:', subjectIds)
      } else if (formData.context_type === 'Unit') {
        const selectedUnit = selectedPath[selectedPath.length - 1]
        console.log('selectedUnit', selectedUnit)
        
        if (selectedUnit && selectedUnit.sub_units && selectedUnit.sub_units.length > 0) {
          subUnitIds = selectedUnit.sub_units.map(subUnit => subUnit.id)
          console.log('UNIT QUIZ - Unit sub_units:', selectedUnit.sub_units)
          console.log('UNIT QUIZ - Extracted sub_unit IDs:', subUnitIds)
        } else {
          console.log('No sub_units found for unit:', selectedUnit)
        }
      } else if (formData.context_type === 'Sub_Unit') {
        subUnitIds = [formData.context_id]
        console.log('SUB_UNIT QUIZ - Sub_unit ID:', formData.context_id)
        console.log('SUB_UNIT QUIZ - Extracted sub_unit IDs:', subUnitIds)
      } else if (formData.context_type === 'Lesson') {
        lessonIds = [formData.context_id]
        console.log('LESSON QUIZ - Lesson ID:', formData.context_id)
        console.log('LESSON QUIZ - Extracted lesson IDs:', lessonIds)
      }
      
      const apiParams = {
        page: 1,
        per_page: 100
      }

      if (formData.context_type === 'Subject') {
        apiParams.subject_ids = subjectIds
        console.log('API CALL - SUBJECT: subject_ids =', subjectIds)
      } else if (formData.context_type === 'Unit') {
        apiParams.sub_unit_ids = subUnitIds
        console.log('API CALL - UNIT: sub_unit_ids =', subUnitIds)
      } else if (formData.context_type === 'Sub_Unit') {
        apiParams.sub_unit_ids = subUnitIds
        console.log('API CALL - SUB_UNIT: sub_unit_ids =', subUnitIds)
      } else if (formData.context_type === 'Lesson') {
        apiParams.lesson_ids = lessonIds
        console.log('API CALL - LESSON: lesson_ids =', lessonIds)
      }

      const response = await getQuestions(apiParams).unwrap()

      console.log('Questions response:', response)
      setAvailableQuestions(response.data || [])
    } catch (error) {
      console.error('Error loading questions:', error)
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
    loadQuestions()
  }, [formData.context_type])

  // Initialize timer data and period
  useEffect(() => {
    const totalMinutes = (timerData.hours * 60) + timerData.minutes
    setFormData(prev => ({
      ...prev,
      period: totalMinutes
    }))
  }, [])

  const handleAddQuestion = (question) => {
    const priority = selectedQuestions.length + 1
    setSelectedQuestions(prev => [...prev, { ...question, priority }])
  }

  const handleRemoveQuestion = (questionId) => {
    setSelectedQuestions(prev => {
      const filtered = prev.filter(q => q.id !== questionId)
      return filtered.map((q, index) => ({ ...q, priority: index + 1 }))
    })
  }

  const handlePriorityChange = (questionId, newPriority) => {
    setSelectedQuestions(prev => {
      const updated = prev.map(q => {
        if (q.id === questionId) {
          return { ...q, priority: parseInt(newPriority) }
        }
        return q
      })
      return updated.sort((a, b) => a.priority - b.priority)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (selectedQuestions.length === 0) {
      ErrorAlert({
        title: t('Error'),
        body: t('Please select at least one question'),
        button: t('OK')
      })
      return
    }
    
    // Validate that passing score is not greater than total score
    if (parseInt(formData.pass_degree) > parseInt(formData.degree)) {
      ErrorAlert({
        title: t('Validation Error'),
        body: t('Passing score cannot be greater than total score'),
        button: t('OK')
      })
      return
    }
    
    try {
      const formDataPayload = new FormData()
      
      formDataPayload.append('title', formData.title)
      formDataPayload.append('context_id', formData.context_id)
      formDataPayload.append('context_type', formData.context_type)
      formDataPayload.append('period', formData.period)
      formDataPayload.append('degree', formData.degree)
      formDataPayload.append('pass_degree', formData.pass_degree)
      
      selectedQuestions.forEach((question, index) => {
        formDataPayload.append(`questions[${index + 1}][id]`, question.id)
        formDataPayload.append(`questions[${index + 1}][priority]`, question.priority)
      })

      console.log('Quiz FormData contents:')
      for (const [key, value] of formDataPayload.entries()) {
        console.log(key, value)
      }

      await createQuiz({ body: formDataPayload }).unwrap()
      
      console.log('Quiz created successfully, navigating back with selectedPath:', selectedPath)
      navigate('/hierarchical-content', { 
        state: { 
          selectedPath,
          preserveHierarchy: true 
        } 
      })
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

  const handleCancel = () => {
    navigate('/hierarchical-content', { 
      state: { 
        selectedPath,
        preserveHierarchy: true 
      } 
    })
  }

  return (
    <div className="create-quiz-page">
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="page-title mb-1">
              <HelpCircle size={24} className="me-2 text-primary" />
              {t('Create New Quiz')}
            </h2>
            <p className="page-subtitle text-muted mb-0">
              {t('Add a new quiz to')} <strong>{selectedPath[selectedPath.length - 1]?.name || t('selected context')}</strong>
            </p>
          </div>
          <Button 
            color="outline-secondary" 
            onClick={handleCancel}
            className="d-flex align-items-center"
          >
            <ArrowLeft size={16} className="me-1" />
            {t('Back to Content')}
          </Button>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <Card className="mb-4 shadow-sm"  style={{
          borderRight:'10px solid #0568a9'
        }}>
          <CardBody className="p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="rounded-circle p-1 me-3" style={{ backgroundColor: '#0568a9', opacity: 0.8 }}>
                <HelpCircle size={20} style={{ color: '#000' }} />
              </div>
              <div>
                <h5 className="mb-0">{t('Quiz Information')}</h5>
                <small className="text-muted">{t('Basic details about your quiz')}</small>
              </div>
            </div>
            
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="title" className="form-label fw-semibold">
                    {t('Quiz Title')} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder={t('Enter an engaging quiz title')}
                    className="form-control-lg"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label fw-semibold">
                    {t('Quiz Duration')} <span className="text-danger">*</span>
                  </Label>
                  <div className="d-flex gap-2 align-items-end">
                    <div className="flex-grow-1">
                      <Label for="hours" className="form-label small text-muted">
                        {t('Hours')}
                      </Label>
                      <Input
                        type="number"
                        id="hours"
                        value={timerData.hours}
                        onChange={(e) => handleTimerChange('hours', e.target.value)}
                        min="0"
                        max="23"
                        className="text-center"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <Label for="minutes" className="form-label small text-muted">
                        {t('Minutes')}
                      </Label>
                      <Input
                        type="number"
                        id="minutes"
                        value={timerData.minutes}
                        onChange={(e) => handleTimerChange('minutes', e.target.value)}
                        min="0"
                        max="59"
                        className="text-center"
                      />
                    </div>
                    <div className="ms-2">
                      <Badge className="px-3 py-2 fs-6" color={'light-primary'}>
                        {formData.period} {t('min')}
                      </Badge>
                    </div>
                  </div>
                </FormGroup>
              </Col>
            </Row>
          </CardBody>
        </Card>
        <Card className="mb-4 shadow-sm"  style={{
          borderRight:'10px solid #0568a9'
        }}>
          <CardBody className="p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="rounded-circle p-1 me-3" style={{ backgroundColor: '#0568a9', opacity: 0.8 }}>
                <Target size={20} style={{ color: '#000' }} />
              </div>
              <div>
                <h5 className="mb-0">{t('Quiz Settings')}</h5>
                <small className="text-muted">{t('Configure scoring and passing criteria')}</small>
              </div>
            </div>
            
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="degree" className="form-label fw-semibold">
                    {t('Total scores')} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="degree"
                    id="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    placeholder={t('Enter total points')}
                    min="1"
                    className="form-control-lg"
                    required
                  />
                  <small className="text-muted">{t('Maximum points students can earn')}</small>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="pass_degree" className="form-label fw-semibold">
                    {t('Passing Score')} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="pass_degree"
                    id="pass_degree"
                    value={formData.pass_degree}
                    onChange={handleInputChange}
                    placeholder={t('Enter passing score')}
                    min="1"
                    max={formData.degree || 999}
                    className={`form-control-lg ${formData.pass_degree && formData.degree && parseInt(formData.pass_degree) > parseInt(formData.degree) ? 'is-invalid' : ''}`}
                    required
                  />
                  {formData.pass_degree && formData.degree && parseInt(formData.pass_degree) > parseInt(formData.degree) && (
                    <div className="invalid-feedback">
                      {t('Passing score cannot be greater than total score')}
                    </div>
                  )}
                  <small className="text-muted">{t('Minimum points required to pass')}</small>
                </FormGroup>
              </Col>
            </Row>
          </CardBody>
        </Card>
        {(() => {
          const filteredQuestions = availableQuestions.filter(question => !selectedQuestions.some(selected => selected.id === question.id))
          return filteredQuestions.length > 0
        })() && (
          <Card className="mb-4 shadow-sm"  style={{
            borderRight:'10px solid #0568a9'
          }}>
            <CardBody className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div  className="rounded-circle p-1 me-3" style={{ backgroundColor: '#0568a9', opacity: 0.8 }}>
                  <BookOpen size={20} style={{ color: '#000' }} />
                </div>
                <div>
                  <h5 className="mb-0">{t('Available Questions')}</h5>
                  <small className="text-muted">{t('Select questions for your quiz')}</small>
                </div>
              </div>
              
              {isLoadingQuestions ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: '#0568a9' }}>
                    <span className="visually-hidden">{t('Loading...')}</span>
                  </div>
                  <p className="mt-3 text-muted">{t('Loading questions...')}</p>
                </div>
              ) : (
                <div className="border rounded-3 p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <div className="row g-3">
                    {availableQuestions
                      .filter(question => !selectedQuestions.some(selected => selected.id === question.id))
                      .map((question) => (
                        <div key={question.id} className="col-lg-6">
                          <div className="border rounded-3 p-3 h-100 bg-light bg-opacity-50">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <Badge color="light-info" size="sm" className="px-2">
                                    {question.type}
                                  </Badge>
                                </div>
                                <h6 className="mb-2 text-dark">{question.text}</h6>
                                {question.hint && (
                                  <div className="mb-2">
                                    <small className="text-muted">
                                      <strong>{t('Hint')}:</strong> {question.hint}
                                    </small>
                                  </div>
                                )}
                                <div className="d-flex align-items-center gap-3 mb-2">
                                  <small className="text-muted">
                                    <strong>{t('Unit')}:</strong> {question.unit?.name || 'N/A'}
                                  </small>
                                  <small className="text-muted">
                                    <strong>{t('Sub-Unit')}:</strong> {question.sub_unit?.name || 'N/A'}
                                  </small>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                color="primary"
                                onClick={() => handleAddQuestion(question)}
                                className="ms-2"
                                style={{ minWidth: '40px' }}
                              >
                                <Plus size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )}
        {selectedQuestions.length > 0 && (
          <Card className="mb-4 shadow-sm"  style={{
            borderRight:'10px solid #0568a9'
          }}>
            <CardBody className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div  className="rounded-circle p-1 me-3" style={{ backgroundColor: '#0568a9', opacity: 0.8 }}>
                  <Target size={20} style={{ color: '#000' }} />
                </div>
                <div>
                  <h5 className="mb-0">{t('Selected Questions')}</h5>
                  <small className="text-muted">
                    {selectedQuestions.length} {t('questions selected')}
                  </small>
                </div>
              </div>
              
              <div className="row g-3">
                {selectedQuestions.map((question) => (
                  <div key={question.id} className="col-12">
                    <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa', borderColor: '#0568a9' }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="text-white rounded-circle d-flex align-items-center justify-content-center" 
                             style={{ width: '32px', height: '32px', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#0568a9' }}>
                          {question.priority}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <Badge color="light-info" size="sm" className="px-2">
                              {question.type}
                            </Badge>
                          </div>
                          <h6 className="mb-1 text-dark">{question.text}</h6>
                          {question.hint && (
                            <small className="text-muted">
                              <strong>{t('Hint')}:</strong> {question.hint}
                            </small>
                          )}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <div className="d-flex flex-column align-items-center">
                            <Label className="form-label small text-muted mb-1">
                              {t('Priority')}
                            </Label>
                            <Input
                              type="number"
                              value={question.priority}
                              onChange={(e) => handlePriorityChange(question.id, e.target.value)}
                              style={{ width: '60px' }}
                              min="1"
                              className="text-center"
                            />
                          </div>
                          <Button
                            size="sm"
                            color="danger"
                            outline
                            onClick={() => handleRemoveQuestion(question.id)}
                            className="ms-2"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
        <Card className="shadow-sm" style={{
          borderRight:'10px solid #0568a9'
        }}>
          <CardBody className="p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle p-1 me-3" style={{ backgroundColor: '#0568a9', opacity: 0.8 }}>
                  <Save size={20} style={{ color: '#000' }} />
                </div>
                <div>
                  <h6 className="mb-0">{t('Ready to Create Quiz?')}</h6>
                  <small className="text-muted">
                    {selectedQuestions.length} {t('questions')} • {formData.period} {t('minutes')} • {formData.degree} {t('points')}
                  </small>
                </div>
              </div>
              <div className="d-flex gap-3">
                <Button 
                  type="submit" 
                  disabled={isCreating || !formData.title || !formData.period || !formData.degree || !formData.pass_degree || selectedQuestions.length === 0 || (formData.pass_degree && formData.degree && parseInt(formData.pass_degree) > parseInt(formData.degree))}
                  className="d-flex align-items-center px-4"
                  size="md"
                  color="primary"
                >
                  {isCreating ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">{t('Loading...')}</span>
                      </div>
                      {t('Creating...')}
                    </>
                  ) : (
                    <>
                      <Save size={18} className="me-2" />
                      {t('Create Quiz')}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  color="secondary" 
                  outline
                  onClick={handleCancel}
                  className="d-flex align-items-center px-4"
                  size="md"
                >
                  <X size={18} className="me-2" />
                  {t('Cancel')}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </Form>
    </div>
  )
}

export default CreateQuiz
