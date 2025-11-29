import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  Card,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col
} from 'reactstrap'
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle,
  XCircle
} from 'react-feather'
import {
  useUpdateMutation,
  useGetSingleMutation
} from '../../../redux/rtkQuery/question'
import { useUploadMutation, useUpdateMutation as useUpdateMediaMutation } from '../../../redux/rtkQuery/media'
import ErrorAlert from '../../components/handleStatusCode/error'

const UpdateQuestion = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { id: questionId } = useParams()
  const selectedPath = location.state?.selectedPath || []
  
  const [formData, setFormData] = useState({
    text: '',
    hint: '',
    type: 'one_select',
    answers: []
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImage, setExistingImage] = useState(null)
  const [existingMediaId, setExistingMediaId] = useState(null)
  const [updateQuestion, { isLoading: isUpdating }] = useUpdateMutation()
  const [getQuestion, { isLoading: isLoadingQuestion }] = useGetSingleMutation()
  const [uploadMedia, { isLoading: isUploadingMedia }] = useUploadMutation()
  const [updateMedia, { isLoading: isUpdatingMedia }] = useUpdateMediaMutation()

  const loadQuestion = async () => {
    try {
      const response = await getQuestion({ id: questionId }).unwrap()
      const question = response.data
      
      setFormData({
        text: question.text || '',
        hint: question.hint || '',
        type: question.type || 'one_select',
        answers: question.answers || []
      })
      
      // Set existing image if available
      if (question.media?.url) {
        setExistingImage(question.media.url)
        setExistingMediaId(question.media.id)
      }
    } catch (error) {
      console.error('Error loading question:', error)
      ErrorAlert({
        title: t('Error'),
        body: t('Failed to load question details'),
        button: t('OK')
      })
    }
  }

  useEffect(() => {
    if (questionId) {
      loadQuestion()
    }
  }, [questionId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']
      const fileExtension = file.name.split('.').pop().toLowerCase()
      const allowedExtensions = ['png', 'jpg', 'jpeg']
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        ErrorAlert({
          title: t('Invalid File Type'),
          body: t('Please select only PNG, JPG, or JPEG image files'),
          button: t('OK')
        })
        e.target.value = '' // Clear the input
        return
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        ErrorAlert({
          title: t('File Too Large'),
          body: t('File size must be less than 10MB'),
          button: t('OK')
        })
        e.target.value = '' // Clear the input
        return
      }
      
      setImageFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }


  const handleAnswerChange = (index, field, value) => {
    setFormData(prev => {
      // If setting as correct for single choice, unset all other correct answers first
      if (field === 'is_correct' && value === 1 && prev.type === 'one_select') {
        return {
          ...prev,
          answers: prev.answers.map((answer, i) => {
            if (i === index) {
              return { ...answer, [field]: value }
            } else {
              return { ...answer, is_correct: 0 }
            }
          })
        }
      }
      
      // For other cases, just update the specific answer
      return {
        ...prev,
        answers: prev.answers.map((answer, i) => {
          if (i === index) {
            return { ...answer, [field]: value }
          }
          return answer
        })
      }
    })
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

  const validateForm = () => {
    // Check if question text is provided
    if (!formData.text.trim()) {
      ErrorAlert({
        title: t('Validation Error'),
        body: t('Question text is required'),
        button: t('OK')
      })
      return false
    }

    // Check if at least 2 answers are provided
    if (formData.answers.length < 2) {
      ErrorAlert({
        title: t('Validation Error'),
        body: t('At least 2 answers are required'),
        button: t('OK')
      })
      return false
    }

    // Check if all answers have text
    const emptyAnswers = formData.answers.some(answer => !answer.text.trim())
    if (emptyAnswers) {
      ErrorAlert({
        title: t('Validation Error'),
        body: t('All answers must have text'),
        button: t('OK')
      })
      return false
    }

    // Check if at least one answer is marked as correct
    const hasCorrectAnswer = formData.answers.some(answer => answer.is_correct === 1)
    if (!hasCorrectAnswer) {
      ErrorAlert({
        title: t('Validation Error'),
        body: t('At least one answer must be marked as correct'),
        button: t('OK')
      })
      return false
    }

    // For single choice, ensure only one answer is correct
    if (formData.type === 'one_select') {
      const correctAnswers = formData.answers.filter(answer => answer.is_correct === 1)
      if (correctAnswers.length > 1) {
        ErrorAlert({
          title: t('Validation Error'),
          body: t('Single choice questions can only have one correct answer'),
          button: t('OK')
        })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      let mediaId = existingMediaId
      
      // Handle media upload/update
      if (imageFile) {
        if (existingMediaId) {
          // Update existing media
          const mediaFormData = new FormData()
          mediaFormData.append('images[]', imageFile)
          mediaFormData.append('context_id', questionId)
          mediaFormData.append('context_type', 'Question')
          mediaFormData.append('_method', 'PUT')
          
          await updateMedia({ id: existingMediaId, body: mediaFormData }).unwrap()
          mediaId = existingMediaId
        } else {
          // Upload new media
          const mediaFormData = new FormData()
          mediaFormData.append('images[]', imageFile)
          mediaFormData.append('context_id', questionId)
          mediaFormData.append('context_type', 'Question')
          mediaFormData.append('_method', 'PUT')
          
          const mediaResponse = await uploadMedia({ body: mediaFormData }).unwrap()
          mediaId = mediaResponse.data.id
        }
      }
      
      // Prepare question update payload
      const formDataPayload = new FormData()
      
      formDataPayload.append('text', formData.text)
      formDataPayload.append('hint', formData.hint)
      formDataPayload.append('type', formData.type)
      
      // Add context information
      if (selectedPath.length >= 4) {
        formDataPayload.append('unit_id', selectedPath[3].id)
      }
      if (selectedPath.length >= 5) {
        formDataPayload.append('sub_unit_id', selectedPath[4].id)
      }
      
      // Add media ID if we have one
      if (mediaId) {
        formDataPayload.append('media_id', mediaId)
      }
      
      // Add answers
      formData.answers.forEach((answer, index) => {
        formDataPayload.append(`answers[${index}][text]`, answer.text)
        formDataPayload.append(`answers[${index}][is_correct]`, answer.is_correct)
        formDataPayload.append(`answers[${index}][priority]`, answer.priority)
      })

      await updateQuestion({ id: questionId, body: formDataPayload }).unwrap()
      
      // Navigate back to the hierarchical content
      navigate('/hierarchical-content', { 
        state: { 
          selectedPath,
          preserveHierarchy: true 
        } 
      })
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

  const handleCancel = () => {
    navigate('/hierarchical-content', { 
      state: { 
        selectedPath,
        preserveHierarchy: true 
      } 
    })
  }

  if (isLoadingQuestion) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('Loading...')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="update-question-page">
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="page-title">{t('Update Question')}</h2>
            <p className="page-subtitle text-muted">
              {t('Edit question in')} {selectedPath[4]?.name || t('selected sub-unit')}
            </p>
          </div>
          <Button 
            color="outline-secondary" 
            onClick={handleCancel}
            className="d-flex align-items-center"
          >
            <ArrowLeft size={16} className="me-1" />
            {t('Back to Questions')}
          </Button>
        </div>
      </div>

      <Card style={{ borderRight: '10px solid #0568a9'}}>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label for="text" className="form-label">
                    {t('Question Text')} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="textarea"
                    name="text"
                    id="text"
                    value={formData.text}
                    onChange={handleInputChange}
                    placeholder={t('Enter your question')}
                    rows="3"
                    required
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="hint" className="form-label">
                    {t('Hint')}
                  </Label>
                  <Input
                    type="text"
                    name="hint"
                    id="hint"
                    value={formData.hint}
                    onChange={handleInputChange}
                    placeholder={t('Enter hint for the question')}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="type" className="form-label">
                    {t('Question Type')} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    name="type"
                    id="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="one_select">{t('Single Choice')}</option>
                    <option value="multiple_select">{t('Multiple Choice')}</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md="12">
                <FormGroup>
                  <Label className="form-label">
                    {t('Question Image')} <small className="text-muted">({t('Optional')})</small>
                  </Label>
                  
                  {/* Current Image Display */}
                  {existingImage && !imagePreview && (
                    <div className="mb-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <img 
                            src={existingImage} 
                            alt="Current" 
                            style={{ 
                              width: '120px', 
                              height: '120px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              border: '2px solid #e9ecef'
                            }}
                          />
                          <div className="ms-3">
                            <p className="mb-1 fw-bold">{t('Current Image')}</p>
                            <small className="text-muted">{t('Upload a new image to replace this one')}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* File Input */}
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg,.PNG,.JPG,.JPEG"
                    onChange={handleImageFileChange}
                    className="form-control"
                  />
                  <small className="text-muted">
                    {existingImage ? t('Upload a new image to replace the current one') : t('Upload an image to accompany the question (optional)')}
                    <br />
                    {t('Allowed formats: PNG, JPG, JPEG (Max size: 10MB)')}
                  </small>
                  
                  {/* New Image Preview */}
                  {imagePreview && (
                    <div className="mt-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            style={{ 
                              width: '120px', 
                              height: '120px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              border: '2px solid #28a745'
                            }}
                          />
                          <div className="ms-3">
                            <p className="mb-1 fw-bold text-success">{t('New Image Preview')}</p>
                            <p className="mb-1">{imageFile?.name}</p>
                            <small className="text-muted">
                              {imageFile ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                            </small>
                          </div>
                        </div>
                        <Button 
                          color="outline-danger" 
                          size="sm" 
                          onClick={removeImage}
                          type="button"
                        >
                          <X size={14} className="me-1" />
                          {t('Remove')}
                        </Button>
                      </div>
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Label className="mb-0 form-label">
                  {t('Answers')} <span className="text-danger">*</span>
                </Label>
                {formData.answers.length < 5 && (
                  <Button 
                    color="outline-primary" 
                    size="sm" 
                    onClick={addAnswer}
                    type="button"
                  >
                    <Plus size={14} className="me-1" />
                    {t('Add Answer')}
                  </Button>
                )}
              </div>
              
              {formData.answers.map((answer, index) => (
                <div key={index} className="border rounded p-3 mb-3">
                  <Row>
                    <Col md="8">
                      <FormGroup>
                        <Label for={`answer-${index}`} className="form-label">
                          {t('Answer')} {index + 1}
                        </Label>
                        <Input
                          type="text"
                          id={`answer-${index}`}
                          value={answer.text}
                          onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                          placeholder={t('Enter answer text')}
                          required
                        />
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <Input
                              type="radio"
                              name={`correct-${index}`}
                              id={`correct-${index}`}
                              checked={answer.is_correct === 1}
                              onChange={() => handleAnswerChange(index, 'is_correct', 1)}
                              className="form-check-input"
                            />
                            <Label 
                              htmlFor={`correct-${index}`} 
                              className="form-check-label d-flex align-items-center"
                            >
                              <CheckCircle size={16} className="me-2 text-success" />
                              {t('Correct')}
                            </Label>
                          </div>
                          <div className="form-check">
                            <Input
                              type="radio"
                              name={`correct-${index}`}
                              id={`incorrect-${index}`}
                              checked={answer.is_correct === 0}
                              onChange={() => handleAnswerChange(index, 'is_correct', 0)}
                              className="form-check-input"
                            />
                            <Label 
                              htmlFor={`incorrect-${index}`} 
                              className="form-check-label d-flex align-items-center"
                            >
                              <XCircle size={16} className="me-2 text-muted" />
                              {t('Incorrect')}
                            </Label>
                          </div>
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="1" className="d-flex align-items-end">
                      {formData.answers.length > 2 && (
                        <Button 
                          color="outline-danger" 
                          size="sm" 
                          onClick={() => removeAnswer(index)}
                          className="mb-3"
                          type="button"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </Col>
                  </Row>
                </div>
              ))}
            </div>

            <div className="form-actions mt-4">
              <div className="d-flex justify-content-end gap-2">
                <Button 
                  type="button" 
                  color="secondary" 
                  outline
                  onClick={handleCancel}
                  className="d-flex align-items-center"
                >
                  <X size={16} className="me-1" />
                  {t('Cancel')}
                </Button>
                <Button 
                  type="submit" 
                  color="primary" 
                  disabled={isUpdating || isUploadingMedia || isUpdatingMedia}
                  className="d-flex align-items-center"
                >
                  <Save size={16} className="me-1" />
                  {isUpdating || isUploadingMedia || isUpdatingMedia ? t('Updating...') : t('Update Question')}
                </Button>
              </div>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}

export default UpdateQuestion