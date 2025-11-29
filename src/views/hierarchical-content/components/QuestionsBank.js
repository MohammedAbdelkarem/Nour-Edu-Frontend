import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Table,
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
  Plus,
  Edit,
  Trash2,
  Settings,
  HelpCircle,
  CheckCircle,
  XCircle
} from 'react-feather'
import {
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation
} from '../../../redux/rtkQuery/question'
import ErrorAlert from '../../components/handleStatusCode/error'
import { useGetQuestionsMutation } from '../../../redux/rtkQuery/quiz'
import EmptyComponent from '../../components/empty'

const QuestionsBank = ({ 
  contextId, 
  contextType, 
  contextName, 
  selectedPath,
  onRefresh 
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // Helper function to get unit_id and sub_unit_id from selectedPath
  const getUnitAndSubUnitIds = () => {
    let unitId = null
    let subUnitId = null
    
    console.log('selectedPath for unit/subunit extraction:', selectedPath)
    
    // Find Unit and Sub_Unit in the selectedPath
    selectedPath.forEach(item => {
      if (item.type === 'Unit') {
        unitId = item.id
      } else if (item.type === 'Sub_Unit') {
        subUnitId = item.id
      }
    })
    
    console.log('Extracted unitId:', unitId, 'subUnitId:', subUnitId)
    return { unitId, subUnitId }
  }
  
  // State
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState({})
  const [formData, setFormData] = useState({
    text: '',
    hint: '',
    type: 'one_select',
    answers: [
      { text: '', is_correct: 1, priority: 1 },
      { text: '', is_correct: 0, priority: 2 }
    ]
  })
  console.log('contextType', contextType)
  console.log('Current questions state:', questions)
  console.log('Loading state:', loading)
  
  // API hooks
  const [getQuestions] = useGetQuestionsMutation()
  const [createQuestion, {isLoading: isCreating}] = useCreateMutation()
  const [updateQuestion, {isLoading: isUpdating}] = useUpdateMutation()
  const [deleteQuestion, {isLoading: isDeleting}] = useDeleteMutation()

  const loadQuestions = async () => {
    try {
      setLoading(true)
      console.log('Loading questions for contextId:', contextId, 'contextType:', contextType)
      let subjectIds = []
      let unitIds = []
      let subUnitIds = []
      let lessonIds = []
      
      if (contextType === 'Subject') {
        subjectIds = [contextId]
        console.log('QUESTIONS BANK - SUBJECT: subject_ids =', subjectIds)
      } else if (contextType === 'Unit') {
        const selectedUnit = selectedPath[selectedPath.length - 1]
        if (selectedUnit && selectedUnit.sub_units && selectedUnit.sub_units.length > 0) {
          subUnitIds = selectedUnit.sub_units.map(subUnit => subUnit.id)
          console.log('QUESTIONS BANK - UNIT: sub_unit_ids =', subUnitIds)
        }
      } else if (contextType === 'Sub_Unit') {
        subUnitIds = [contextId]
        console.log('QUESTIONS BANK - SUB_UNIT: sub_unit_ids =', subUnitIds)
      } else if (contextType === 'Lesson') {
        lessonIds = [contextId]
        console.log('QUESTIONS BANK - LESSON: lesson_ids =', lessonIds)
      }

      // Prepare API parameters based on context type
      const apiParams = {
        page: 1,
        per_page: 50
      }

      if (contextType === 'Subject') {
        apiParams.subject_ids = subjectIds
        console.log('QUESTIONS BANK API CALL - SUBJECT: subject_ids =', subjectIds)
      } else if (contextType === 'Unit') {
        apiParams.unit_ids = unitIds
        console.log('QUESTIONS BANK API CALL - UNIT: unit_ids =', unitIds)
      } else if (contextType === 'Sub_Unit') {
        apiParams.sub_unit_ids = subUnitIds
        console.log('QUESTIONS BANK API CALL - SUB_UNIT: sub_unit_ids =', subUnitIds)
      } else if (contextType === 'Lesson') {
        apiParams.lesson_ids = lessonIds
        console.log('QUESTIONS BANK API CALL - LESSON: lesson_ids =', lessonIds)
      }

      console.log('QUESTIONS BANK - API parameters:', apiParams)
      const result = await getQuestions(apiParams).unwrap()
      console.log('Questions API response:', result)
      console.log('Setting questions to:', result.data || [])
      setQuestions(result.data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (contextId && contextType) {
      loadQuestions()
    }
  }, [contextId, contextType])

  const handleCreate = () => {
    navigate('/hierarchical-content/create-question', {
      state: { selectedPath }
    })
  }

  const handleEdit = (question) => {
    navigate(`/hierarchical-content/update-question/${question.id}`, {
      state: { selectedPath }
    })
  }

  const handleDelete = (question) => {
    setSelectedQuestion(question)
    setDeleteModal(true)
  }

  const handleSubmitCreate = async () => {
    try {
      const { unitId, subUnitId } = getUnitAndSubUnitIds()
      console.log('Creating question with unitId:', unitId, 'subUnitId:', subUnitId)
      
      const formDataPayload = new URLSearchParams()
      formDataPayload.append('text', formData.text)
      formDataPayload.append('hint', formData.hint)
      formDataPayload.append('type', formData.type)
      
      // Always add unit_id and sub_unit_id
      if (unitId) {
        formDataPayload.append('unit_id', unitId)
      }
      if (subUnitId) {
        formDataPayload.append('sub_unit_ids[]', subUnitId)
      }

      // Add answers
      formData.answers.forEach((answer, index) => {
        if (answer.text.trim()) {
          formDataPayload.append(`answers[${index + 1}][text]`, answer.text)
          formDataPayload.append(`answers[${index + 1}][is_correct]`, answer.is_correct)
          formDataPayload.append(`answers[${index + 1}][priority]`, answer.priority)
        }
      })

      await createQuestion({ body: formDataPayload }).unwrap()
      setCreateModal(false)
      loadQuestions()
      onRefresh?.()
    } catch (error) {
      console.error('Error creating question:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to create question')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitEdit = async () => {
    try {
      const { unitId, subUnitId } = getUnitAndSubUnitIds()
      
      const formDataPayload = new URLSearchParams()
      formDataPayload.append('text', formData.text)
      formDataPayload.append('hint', formData.hint)
      formDataPayload.append('type', formData.type)
      
      // Always add unit_id and sub_unit_id
      if (unitId) {
        formDataPayload.append('unit_id', unitId)
      }
      if (subUnitId) {
        formDataPayload.append('sub_unit_ids[]', subUnitId)
      }

      // Add answers
      formData.answers.forEach((answer, index) => {
        if (answer.text.trim()) {
          formDataPayload.append(`answers[${index + 1}][text]`, answer.text)
          formDataPayload.append(`answers[${index + 1}][is_correct]`, answer.is_correct)
          formDataPayload.append(`answers[${index + 1}][priority]`, answer.priority)
        }
      })

      await updateQuestion({ body: formDataPayload, id: selectedQuestion.id }).unwrap()
      setEditModal(false)
      setSelectedQuestion(null)
      loadQuestions()
      onRefresh?.()
    } catch (error) {
      console.error('Error updating question:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to update question')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitDelete = async () => {
    try {
      await deleteQuestion({ id: selectedQuestion.id }).unwrap()
      setDeleteModal(false)
      setSelectedQuestion(null)
      loadQuestions()
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting question:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to delete question')
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

  const handleAnswerChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.map((answer, i) => (i === index ? { ...answer, [field]: value } : answer))
    }))
  }

  const addAnswer = () => {
    if (formData.answers.length < 5) {
      setFormData(prev => ({
        ...prev,
        answers: [
          ...prev.answers, 
          { 
            text: '', 
            is_correct: 0, 
            priority: prev.answers.length + 1 
          }
        ]
      }))
    }
  }

  const removeAnswer = (index) => {
    if (formData.answers.length > 2) {
      setFormData(prev => ({
        ...prev,
        answers: prev.answers.filter((_, i) => i !== index).map((answer, i) => ({
          ...answer,
          priority: i + 1
        }))
      }))
    }
  }

  const toggleDropdown = (questionId) => {
    setDropdownOpen(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
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

  return (
    <div className="questions-bank">
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">{t('Questions Bank')}</h5>
            <small className="text-muted">{contextName}</small>
          </div>
          <Button color="primary" onClick={handleCreate} className="d-flex align-items-center">
            <Plus size={16} className="me-1" />
            {t('Add Question')}
          </Button>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t('Loading...')}</span>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <EmptyComponent 
              title={t('No Questions Found')}
              body={t('No questions found. Click Add Question to create your first question.')}
            />
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>{t('Question')}</th>
                    <th>{t('Type')}</th>
                    <th width="100">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question) => (
                    <tr key={question.id}>
                      <td>
                        <div>
                          <div className="fw-bold">{question.text}</div>
                        </div>
                      </td>
                      <td>{getQuestionTypeBadge(question.type)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            color="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(question)}
                            className="d-flex align-items-center"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            color="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(question)}
                            className="d-flex align-items-center"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create Question Modal */}
      <Modal isOpen={createModal} toggle={() => setCreateModal(false)} size="lg">
        <ModalHeader toggle={() => setCreateModal(false)}>
          {t('Add New Question')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="create-text">{t('Question Text')} <span className="text-danger">*</span></Label>
              <Input
                type="textarea"
                name="text"
                id="create-text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder={t('Enter your question')}
                rows="3"
              />
            </FormGroup>
            <FormGroup>
              <Label for="create-hint">{t('Hint')}</Label>
              <Input
                type="text"
                name="hint"
                id="create-hint"
                value={formData.hint}
                onChange={handleInputChange}
                placeholder={t('Enter hint for the question')}
              />
            </FormGroup>
            <FormGroup>
              <Label for="create-type">{t('Question Type')} <span className="text-danger">*</span></Label>
              <Input
                type="select"
                name="type"
                id="create-type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="one_select">{t('Single Choice')}</option>
                <option value="multiple_select">{t('Multiple Choice')}</option>
              </Input>
            </FormGroup>
            
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Label className="mb-0">{t('Answers')} <span className="text-danger">*</span></Label>
                {formData.answers.length < 5 && (
                  <Button color="outline-primary" size="sm" onClick={addAnswer}>
                    <Plus size={14} className="me-1" />
                    {t('Add Answer')}
                  </Button>
                )}
              </div>
              {formData.answers.map((answer, index) => (
                <div key={index} className="border rounded p-3 mb-2">
                  <Row>
                    <Col md="8">
                      <FormGroup>
                        <Label for={`answer-${index}`}>{t('Answer')} {index + 1}</Label>
                        <Input
                          type="text"
                          id={`answer-${index}`}
                          value={answer.text}
                          onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                          placeholder={t('Enter answer text')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label>{t('Correct')}</Label>
                        <Dropdown 
                          isOpen={dropdownOpen[`correct-${index}`]} 
                          toggle={() => toggleDropdown(`correct-${index}`)}
                          className="w-100"
                        >
                          <DropdownToggle 
                            caret 
                            color={answer.is_correct ? 'success' : 'secondary'}
                            className="w-100 d-flex justify-content-between align-items-center"
                          >
                            {answer.is_correct ? (
                              <>
                                <CheckCircle size={16} className="me-2" />
                                {t('Correct')}
                              </>
                            ) : (
                              <>
                                <XCircle size={16} className="me-2" />
                                {t('Incorrect')}
                              </>
                            )}
                          </DropdownToggle>
                          <DropdownMenu 
                            className="w-100"
                            style={{ 
                              zIndex: 99999,
                              position: 'absolute',
                              top: '100%',
                              left: 0,
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
                            <DropdownItem 
                              onClick={() => handleAnswerChange(index, 'is_correct', 1)}
                              className={answer.is_correct === 1 ? 'active' : ''}
                            >
                              <CheckCircle size={16} className="me-2 text-success" />
                              {t('Correct')}
                            </DropdownItem>
                            <DropdownItem 
                              onClick={() => handleAnswerChange(index, 'is_correct', 0)}
                              className={answer.is_correct === 0 ? 'active' : ''}
                            >
                              <XCircle size={16} className="me-2 text-muted" />
                              {t('Incorrect')}
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </FormGroup>
                    </Col>
                    <Col md="1" className="d-flex align-items-end">
                      {formData.answers.length > 2 && (
                        <Button 
                          color="outline-danger" 
                          size="sm" 
                          onClick={() => removeAnswer(index)}
                          className="mb-3"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setCreateModal(false)}>
            {t('Cancel')}
          </Button>
          <Button color="primary" onClick={handleSubmitCreate} disabled={isCreating}>
            {isCreating ? t('Creating...') : t('Create Question')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Question Modal */}
      <Modal isOpen={editModal} toggle={() => setEditModal(false)} size="lg">
        <ModalHeader toggle={() => setEditModal(false)}>
          {t('Edit Question')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="edit-text">{t('Question Text')} <span className="text-danger">*</span></Label>
              <Input
                type="textarea"
                name="text"
                id="edit-text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder={t('Enter your question')}
                rows="3"
              />
            </FormGroup>
            <FormGroup>
              <Label for="edit-hint">{t('Hint')}</Label>
              <Input
                type="text"
                name="hint"
                id="edit-hint"
                value={formData.hint}
                onChange={handleInputChange}
                placeholder={t('Enter hint for the question')}
              />
            </FormGroup>
            <FormGroup>
              <Label for="edit-type">{t('Question Type')} <span className="text-danger">*</span></Label>
              <Input
                type="select"
                name="type"
                id="edit-type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="one_select">{t('Single Choice')}</option>
                <option value="multiple_select">{t('Multiple Choice')}</option>
              </Input>
            </FormGroup>
            
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Label className="mb-0">{t('Answers')} <span className="text-danger">*</span></Label>
                {formData.answers.length < 5 && (
                  <Button color="outline-primary" size="sm" onClick={addAnswer}>
                    <Plus size={14} className="me-1" />
                    {t('Add Answer')}
                  </Button>
                )}
              </div>
              {formData.answers.map((answer, index) => (
                <div key={index} className="border rounded p-3 mb-2">
                  <Row>
                    <Col md="8">
                      <FormGroup>
                        <Label for={`edit-answer-${index}`}>{t('Answer')} {index + 1}</Label>
                        <Input
                          type="text"
                          id={`edit-answer-${index}`}
                          value={answer.text}
                          onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                          placeholder={t('Enter answer text')}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label>{t('Correct')}</Label>
                        <Dropdown 
                          isOpen={dropdownOpen[`edit-correct-${index}`]} 
                          toggle={() => toggleDropdown(`edit-correct-${index}`)}
                          className="w-100"
                        >
                          <DropdownToggle 
                            caret 
                            color={answer.is_correct ? 'success' : 'secondary'}
                            className="w-100 d-flex justify-content-between align-items-center"
                          >
                            {answer.is_correct ? (
                              <>
                                <CheckCircle size={16} className="me-2" />
                                {t('Correct')}
                              </>
                            ) : (
                              <>
                                <XCircle size={16} className="me-2" />
                                {t('Incorrect')}
                              </>
                            )}
                          </DropdownToggle>
                          <DropdownMenu 
                            className="w-100"
                            style={{ 
                              zIndex: 99999,
                              position: 'absolute',
                              top: '100%',
                              left: 0,
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
                            <DropdownItem 
                              onClick={() => handleAnswerChange(index, 'is_correct', 1)}
                              className={answer.is_correct === 1 ? 'active' : ''}
                            >
                              <CheckCircle size={16} className="me-2 text-success" />
                              {t('Correct')}
                            </DropdownItem>
                            <DropdownItem 
                              onClick={() => handleAnswerChange(index, 'is_correct', 0)}
                              className={answer.is_correct === 0 ? 'active' : ''}
                            >
                              <XCircle size={16} className="me-2 text-muted" />
                              {t('Incorrect')}
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </FormGroup>
                    </Col>
                    <Col md="1" className="d-flex align-items-end">
                      {formData.answers.length > 2 && (
                        <Button 
                          color="outline-danger" 
                          size="sm" 
                          onClick={() => removeAnswer(index)}
                          className="mb-3"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setEditModal(false)}>
            {t('Cancel')}
          </Button>
          <Button color="primary" onClick={handleSubmitEdit} disabled={isUpdating}>
            {isUpdating ? t('Updating...') : t('Update Question')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Question Modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>
          {t('Delete Question')}
        </ModalHeader>
        <ModalBody>
          <p>{t('Are you sure you want to delete this question? This action cannot be undone.')}</p>
          {selectedQuestion && (
            <Alert color="info">
              <strong>{t('Question')}:</strong> {selectedQuestion.text}
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setDeleteModal(false)}>
            {t('Cancel')}
          </Button>
          <Button color="danger" onClick={handleSubmitDelete} disabled={isDeleting}>
            {isDeleting ? t('Deleting...') : t('Delete')}
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  )
}

export default QuestionsBank
