import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Row,
  Col,
  Table,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Alert
} from 'reactstrap'
import {
  ArrowLeft,
  Play,
  Image,
  FileText,
  Clock,
  Calendar,
  User,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Plus,
  Upload
} from 'react-feather'
import FileUploaderRestrictions from '../../components/uplaoder/FileUploaderRestrictions'
import LessonComments from './LessonComments'
import {
  useUpdateMutation,
  useDeleteMutation,
  useChangeStatusMutation,
  useUploadVideoMutation,
  useDetailsMutation
} from '../../../redux/rtkQuery/hierarchical/lesson'
import { useUploadMutation as useUploadMediaMutation, useDeleteMutation as useDeleteMediaMutation } from '../../../redux/rtkQuery/media'
import ErrorAlert from '../../components/handleStatusCode/error'
import EmptyComponent from '../../components/empty'
import './LessonProfile.scss'

const LessonProfile = ({ lessonId, onBack, onRefresh }) => {
  const { t } = useTranslation()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [videoModal, setVideoModal] = useState(false)
  const [mediaModal, setMediaModal] = useState(false)
  const [deleteVideoModal, setDeleteVideoModal] = useState(false)
  const [deleteMediaModal, setDeleteMediaModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    duration: '',
    priority: 0
  })
  const [videoFile, setVideoFile] = useState(null)
  const [extractedQuality, setExtractedQuality] = useState(null)
  const [extractedDuration, setExtractedDuration] = useState(null)
  const [mediaFiles, setMediaFiles] = useState([])

  // API hooks
  const [getDetails, { isLoading: isLoadingDetails }] = useDetailsMutation()
  const [updateLesson, { isLoading: isUpdating }] = useUpdateMutation()
  const [deleteLesson, { isLoading: isDeleting }] = useDeleteMutation()
  const [changeStatus, { isLoading: isChangingStatus }] = useChangeStatusMutation()
  const [uploadVideo, { isLoading: isUploadingVideo }] = useUploadVideoMutation()
  const [uploadMedia, { isLoading: isUploadingMedia }] = useUploadMediaMutation()
  const [deleteMedia, { isLoading: isDeletingMedia }] = useDeleteMediaMutation()

  // Load lesson details when component mounts
  useEffect(() => {
    const loadLessonDetails = async () => {
      if (!lessonId) return
      
      try {
        setLoading(true)
        setError(null)
        const response = await getDetails({ id: lessonId }).unwrap()
        setLesson(response.data)
        
        // Update form data with lesson details
        setFormData({
          name: response.data.name || '',
          bio: response.data.bio || '',
          duration: response.data.duration || '',
          priority: response.data.priority || 0
        })
      } catch (err) {
        console.error('Error loading lesson details:', err)
        setError(err?.data?.message || err?.message || t('Failed to load lesson details'))
      } finally {
        setLoading(false)
      }
    }

    loadLessonDetails()
  }, [lessonId, getDetails, t])

  // Function to refresh lesson data
  const refreshLessonData = async () => {
    if (!lessonId) return
    
    try {
      const response = await getDetails({ id: lessonId }).unwrap()
      setLesson(response.data)
      
      // Update form data with lesson details
      setFormData({
        name: response.data.name || '',
        bio: response.data.bio || '',
        duration: response.data.duration || '',
        priority: response.data.priority || 0
      })
    } catch (err) {
      console.error('Error refreshing lesson details:', err)
      // Don't show error alert for refresh, just log it
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getVideoInfo = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        const height = video.videoHeight
        const duration = video.duration
        
        let quality = 'Unknown'
        if (height >= 2160) quality = '4K'
        else if (height >= 1080) quality = '1080'
        else if (height >= 720) quality = '720'
        else if (height >= 480) quality = '480'
        else if (height >= 360) quality = '360'
        else if (height >= 240) quality = '240'
        
        // Convert duration to minutes
        let durationInMinutes = Math.ceil(duration / 60) // Round up to next minute
        if (durationInMinutes < 1) durationInMinutes = 1 // Minimum 1 minute
        
        resolve({ quality, duration: durationInMinutes })
      }
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src)
        resolve({ quality: 'Unknown', duration: 1 })
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  const handleSubmitEdit = async () => {
    try {
      const updateData = new FormData()
      updateData.append('name', formData.name)
      updateData.append('bio', formData.bio)
      updateData.append('duration', formData.duration)
      updateData.append('priority', formData.priority)

      await updateLesson({ id: lesson.id, body: updateData }).unwrap()
      setEditModal(false)
      
      // Refresh lesson data using the same API
      await refreshLessonData()
      
      ErrorAlert({
        title: t('Success'),
        body: t('Lesson updated successfully'),
        button: t('OK')
      })
    } catch (error) {
      console.error('Error updating lesson:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to update lesson')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteLesson({ id: lesson.id }).unwrap()
      setDeleteModal(false)
      onBack?.()
      onRefresh?.()
      
      ErrorAlert({
        title: t('Success'),
        body: t('Lesson deleted successfully'),
        button: t('OK')
      })
    } catch (error) {
      console.error('Error deleting lesson:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to delete lesson')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleChangeStatus = async () => {
    try {
      const newStatus = lesson.publish_status === 'published' ? 'draft' : 'published'
      await changeStatus({ id: lesson.id, status: newStatus }).unwrap()
      
      // Refresh lesson data using the same API
      await refreshLessonData()
      
      ErrorAlert({
        title: t('Success'),
        body: newStatus === 'published' ? t('Lesson published successfully') : t('Lesson unpublished successfully'),
        button: t('OK')
      })
    } catch (error) {
      console.error('Error changing status:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to change status')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleVideoUpload = async () => {
    if (!videoFile || !extractedQuality || !extractedDuration) return

    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('quality', extractedQuality)
      formData.append('duration', extractedDuration)
      
      await uploadVideo({ id: lesson.id, body: formData }).unwrap()
      setVideoModal(false)
      setVideoFile(null)
      setExtractedQuality(null)
      setExtractedDuration(null)
      
      // Refresh lesson data using the same API
      await refreshLessonData()
      
      ErrorAlert({
        title: t('Success'),
        body: t('Video uploaded successfully'),
        button: t('OK')
      })
    } catch (error) {
      console.error('Error uploading video:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to upload video')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleMediaUpload = async () => {
    if (!mediaFiles || mediaFiles.length === 0) return

    try {
      const formData = new FormData()
      formData.append('context_id', lesson.id)
      formData.append('context_type', 'Lesson')
      
      // Add all media files to images[] array
      mediaFiles.forEach((file) => {
        formData.append('images[]', file)
      })
      
      await uploadMedia({ body: formData }).unwrap()
      setMediaModal(false)
      setMediaFiles([])
      
      // Refresh lesson data using the same API
      await refreshLessonData()
      
      ErrorAlert({
        title: t('Success'),
        body: t('Media uploaded successfully'),
        button: t('OK')
      })
    } catch (error) {
      console.error('Error uploading media:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to upload media')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return

    try {
      await deleteMedia({ id: selectedVideo.id }).unwrap()
      setDeleteVideoModal(false)
      setSelectedVideo(null)
      
      // Refresh lesson data using the same API
      await refreshLessonData()
      
      ErrorAlert({
        title: t('Success'),
        body: t('Video deleted successfully'),
        button: t('OK')
      })
    } catch (error) {
      console.error('Error deleting video:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to delete video')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleDeleteMedia = async () => {
    if (!selectedMedia) return

    try {
      await deleteMedia({ id: selectedMedia.id }).unwrap()
      setDeleteMediaModal(false)
      setSelectedMedia(null)
      
      // Refresh lesson data using the same API
      await refreshLessonData()
      
      ErrorAlert({
        title: t('Success'),
        body: t('Media deleted successfully'),
        button: t('OK')
      })
    } catch (error) {
      console.error('Error deleting media:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to delete media')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || isLoadingDetails) {
    return (
      <div className="lesson-profile">
        <div className="text-center py-5">
          <Spinner size="lg" color="primary" />
          <p className="mt-3">{t('Loading lesson...')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lesson-profile">
        <div className="text-center py-5">
          <Alert color="danger">
            <h5>{t('Error')}</h5>
            <p>{error}</p>
            <Button color="primary" onClick={onBack}>
              <ArrowLeft size={16} className="me-1" />
              {t('Go Back')}
            </Button>
          </Alert>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="lesson-profile">
        <div className="text-center py-5">
          <Alert color="warning">
            <h5>{t('No Lesson Found')}</h5>
            <p>{t('The requested lesson could not be found.')}</p>
            <Button color="primary" onClick={onBack}>
              <ArrowLeft size={16} className="me-1" />
              {t('Go Back')}
            </Button>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="lesson-profile">
      {/* Header */}
      <div className="profile-header">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <Button
              color="secondary"
              outline
              onClick={onBack}
              className="me-3"
            >
              <ArrowLeft size={16} color="light" className="me-1" />
              {t('Back')}
            </Button>
            <div>
              <h2 className="mb-1 text-white">{lesson.name}</h2>
              <Badge 
                color={lesson.publish_status === 'published' ? 'light-success' : 'light-secondary'}
                className="me-2"
              >
                {lesson.publish_status === 'published' ? t('Published') : t('Draft')}
              </Badge>
              <Badge color="light-info">
                {lesson.duration} {t('minutes')}
              </Badge>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              color={'primary'}
              onClick={handleChangeStatus}
              disabled={isChangingStatus}
            >
              {lesson.publish_status === 'published' ? (
                <>
                  <EyeOff size={14} className="me-1" />
                  {t('Unpublish')}
                </>
              ) : (
                <>
                  <Eye size={14} className="me-1" />
                  {t('Publish')}
                </>
              )}
            </Button>
            <Button
              color="danger"
              outline
              onClick={() => setDeleteModal(true)}
            >
              <Trash2 size={14} className="me-1" />
              {t('Delete')}
            </Button>
          </div>
        </div>
      </div>

      <Row>
        {/* Basic Information */}
        <Col md="6" className="mb-4">
          <Card>
            <CardHeader>
              <h5 className="mb-0">
                <FileText size={18} className="me-2" />
                {t('Basic Information')}
              </h5>
            </CardHeader>
            <CardBody>
              <Table borderless>
                <tbody>
                  <tr>
                    <td><strong>{t('Name')}:</strong></td>
                    <td>{lesson.name}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('Description')}:</strong></td>
                    <td>{lesson.bio || t('No description')}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('Duration')}:</strong></td>
                    <td>{lesson.duration} {t('minutes')}</td>
                  </tr>
                  <tr>
                    <td><strong>{t('Created')}:</strong></td>
                    <td>{formatDate(lesson.created_at)}</td>
                  </tr>
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>

        {/* Statistics */}
        <Col md="6" className="mb-4">
          <Card>
            <CardHeader>
              <h5 className="mb-0">
                <Clock size={18} className="me-2" />
                {t('Statistics')}
              </h5>
            </CardHeader>
            <CardBody>
              <Row>
                <Col sm="6" className="mb-3">
                  <div className="stat-item">
                    <div className="stat-number">{lesson.number_of_quizzes || 0}</div>
                    <div className="stat-label">{t('Total Quizzes')}</div>
                  </div>
                </Col>
                <Col sm="6" className="mb-3">
                  <div className="stat-item">
                    <div className="stat-number">{lesson.number_of_files || 0}</div>
                    <div className="stat-label">{t('Total Files')}</div>
                  </div>
                </Col>
                <Col sm="6" className="mb-3">
                  <div className="stat-item">
                    <div className="stat-number">{lesson.video ? lesson.video.length : 0}</div>
                    <div className="stat-label">{t('Total Videos')}</div>
                  </div>
                </Col>
                <Col sm="6" className="mb-3">
                  <div className="stat-item">
                    <div className="stat-number">{lesson.media ? lesson.media.length : 0}</div>
                    <div className="stat-label">{t('Total Media')}</div>
                  </div>
                </Col>
                <Col sm="6" className="mb-3">
                  <div className="stat-item">
                    <div className="stat-number">{lesson.number_of_published_quizzes || 0}</div>
                    <div className="stat-label">{t('Published Quizzes')}</div>
                  </div>
                </Col>
                <Col sm="6" className="mb-3">
                  <div className="stat-item">
                    <div className="stat-number">{lesson.number_of_published_files || 0}</div>
                    <div className="stat-label">{t('Published Files')}</div>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>

        {/* Video Section */}
        <Col md="12" className="mb-4">
          <Card>
            <CardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <Play size={18} className="me-2" />
                  {t('Video Content')}
                </h5>
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => setVideoModal(true)}
                >
                  <Upload size={14} className="me-1" />
                  {t('Upload Video')}
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {lesson.video && lesson.video.length > 0 ? (
                <div className="video-section">
                  <Row>
                    {lesson.video.map((videoItem, index) => (
                      <Col md="4" sm="6" xs="12" key={videoItem.id || index} className="mb-4">
                        <div className="video-item">
                          <div className="video-preview">
                            <video
                              controls
                              width="100%"
                              height="200"
                              poster={videoItem.url}
                            >
                              <source src={videoItem.url} type="video/mp4" />
                              {t('Your browser does not support the video tag.')}
                            </video>
                          </div>
                          <div className="video-actions mt-2 text-center">
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedVideo(videoItem)
                                setDeleteVideoModal(true)
                              }}
                            >
                              <Trash2 size={12} className="me-1" />
                              {t('Delete')}
                            </Button>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              ) : (
                <EmptyComponent 
                  title={t('No Videos Uploaded')}
                  body={t('No videos uploaded for this lesson.')}
                />
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Media Section */}
        <Col md="12" className="mb-4">
          <Card>
            <CardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <Image size={18} className="me-2" />
                  {t('Media Files')} ({lesson.media?.length || 0})
                </h5>
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => setMediaModal(true)}
                >
                  <Plus size={14} className="me-1" />
                  {t('Add Media')}
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {lesson.media && lesson.media.length > 0 ? (
                <Row>
                  {lesson.media.map((media, index) => (
                    <Col md="4" key={media.id} className="mb-3">
                      <div className="media-item">
                        {media.type === 'image' ? (
                          <img
                            src={media.url}
                            alt={media.title || `Media ${index + 1}`}
                            className="img-fluid rounded"
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="media-placeholder">
                            <FileText size={48} />
                            <p>{media.type}</p>
                          </div>
                        )}
                        <div className="media-actions mt-2 text-center">
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedMedia(media)
                              setDeleteMediaModal(true)
                            }}
                          >
                            <Trash2 size={12} className="me-1" />
                            {t('Delete')}
                          </Button>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <EmptyComponent 
                  title={t('No Media Files Uploaded')}
                  body={t('No media files uploaded for this lesson.')}
                />
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Quizzes Section */}
        {lesson.quizzes && lesson.quizzes.length > 0 && (
          <Col md="12" className="mb-4">
            <Card>
              <CardHeader>
                <h5 className="mb-0">
                  <FileText size={18} className="me-2" />
                  {t('Quizzes')} ({lesson.quizzes.length})
                </h5>
              </CardHeader>
              <CardBody>
                <Row>
                  {lesson.quizzes.map((quiz) => (
                    <Col md="6" key={quiz.id} className="mb-3">
                      <div className="quiz-item p-3 border rounded">
                        <h6 className="mb-2">{quiz.title}</h6>
                        <div className="quiz-details">
                          <small className="text-muted d-block">
                            <strong>{t('Period')}:</strong> {quiz.period} {t('minutes')}
                          </small>
                          <small className="text-muted d-block">
                            <strong>{t('Degree')}:</strong> {quiz.degree}
                          </small>
                          <small className="text-muted d-block">
                            <strong>{t('Pass Degree')}:</strong> {quiz.pass_degree}
                          </small>
                          <small className="text-muted d-block">
                            <strong>{t('Questions')}:</strong> {quiz.number_of_questions}
                          </small>
                          <small className="text-muted d-block">
                            <strong>{t('Priority')}:</strong> {quiz.priority}
                          </small>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>
          </Col>
        )}

        {/* Files Section */}
        {lesson.files && lesson.files.length > 0 && (
          <Col md="12" className="mb-4">
            <Card>
              <CardHeader>
                <h5 className="mb-0">
                  <FileText size={18} className="me-2" />
                  {t('Files')} ({lesson.files.length})
                </h5>
              </CardHeader>
              <CardBody>
                <Row>
                  {lesson.files.map((file, index) => (
                    <Col md="4" key={file.id || index} className="mb-3">
                      <div className="file-item p-3 border rounded text-center">
                        <FileText size={32} className="mb-2" />
                        <h6 className="mb-1">{file.name || file.title || `File ${index + 1}`}</h6>
                        <small className="text-muted">
                          {file.type || 'Unknown Type'}
                        </small>
                      </div>
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>
          </Col>
        )}

        {/* Comments Section */}
        <Col md="12" className="mb-4">
          <LessonComments 
            comments={lesson.comments || []} 
            onRefresh={refreshLessonData}
          />
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal isOpen={editModal} toggle={() => setEditModal(false)} size="lg">
        <ModalHeader toggle={() => setEditModal(false)}>
          <Edit size={20} className="me-2" />
          {t('Edit Lesson')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="name">{t('Name')} <span className="text-danger">*</span></Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('Enter lesson name')}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="duration">{t('Duration')} (minutes)</Label>
                  <Input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder={t('Enter duration')}
                    min="1"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="priority">{t('Priority')}</Label>
                  <Input
                    type="number"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    placeholder={t('Enter priority')}
                    min="0"
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label for="bio">{t('Description')}</Label>
              <Input
                type="textarea"
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder={t('Enter lesson description')}
                rows="4"
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setEditModal(false)}>
            <X size={14} className="me-1" />
            {t('Cancel')}
          </Button>
          <Button
            color="primary"
            onClick={handleSubmitEdit}
            disabled={isUpdating || !formData.name}
          >
            <Save size={14} className="me-1" />
            {isUpdating ? t('Updating...') : t('Update')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)} className="bg-danger text-white">
          <Trash2 size={20} className="me-2" />
          {t('Confirm Delete')}
        </ModalHeader>
        <ModalBody>
          <p>{t('Are you sure you want to delete this lesson?')}</p>
          <p className="text-muted">{t('This action cannot be undone.')}</p>
          <div className="alert alert-warning">
            <strong>{t('Lesson')}:</strong> {lesson.name}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setDeleteModal(false)}>
            {t('Cancel')}
          </Button>
          <Button
            color="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? t('Deleting...') : t('Delete')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Video Upload Modal */}
      <Modal isOpen={videoModal} toggle={() => {
        setVideoModal(false)
        setVideoFile(null)
        setExtractedQuality(null)
        setExtractedDuration(null)
      }}>
        <ModalHeader toggle={() => setVideoModal(false)}>
          <Upload size={20} className="me-2" />
          {t('Upload Video')}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="video">{t('Video File')} <span className="text-danger">*</span></Label>
            <Input
              type="file"
              id="video"
              accept="video/mp4"
              onChange={async (e) => {
                const file = e.target.files[0]
                if (file) {
                  setVideoFile(file)
                  // Extract quality and duration from video file
                  const { quality, duration } = await getVideoInfo(file)
                  setExtractedQuality(quality)
                  setExtractedDuration(duration)
                }
              }}
            />
            <small className="text-muted">{t('Only MP4 video files are allowed')}</small>
          </FormGroup>

          {videoFile && (
            <Alert color="info">
              <div>
                <strong>{t('Selected File')}:</strong> {videoFile.name}
              </div>
              <div>
                <strong>{t('Size')}:</strong> {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </div>
              {extractedQuality && (
                <div>
                  <strong>{t('Quality')}:</strong> {extractedQuality}
                </div>
              )}
              {extractedDuration && (
                <div>
                  <strong>{t('Duration')}:</strong> {extractedDuration} {t('minutes')}
                </div>
              )}
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => {
            setVideoModal(false)
            setVideoFile(null)
            setExtractedQuality(null)
            setExtractedDuration(null)
          }}>
            {t('Cancel')}
          </Button>
          <Button
            color="primary"
            onClick={handleVideoUpload}
            disabled={!videoFile || !extractedQuality || !extractedDuration || isUploadingVideo}
          >
            {isUploadingVideo ? t('Uploading...') : t('Upload')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Media Upload Modal */}
      <Modal isOpen={mediaModal} toggle={() => {
        setMediaModal(false)
        setMediaFiles([])
      }}>
        <ModalHeader toggle={() => setMediaModal(false)}>
          <Plus size={20} className="me-2" />
          {t('Add Media')}
        </ModalHeader>
        <ModalBody>
          <FileUploaderRestrictions
            files={mediaFiles}
            setFiles={setMediaFiles}
            maxSize={10}
            accept=".svg"
            multiple
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => {
            setMediaModal(false)
            setMediaFiles([])
          }}>
            {t('Cancel')}
          </Button>
          <Button
            color="primary"
            onClick={handleMediaUpload}
            disabled={!mediaFiles || mediaFiles.length === 0 || isUploadingMedia}
          >
            {isUploadingMedia ? t('Uploading...') : t('Upload Media')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Video Confirmation Modal */}
      <Modal isOpen={deleteVideoModal} toggle={() => setDeleteVideoModal(false)}>
        <ModalHeader toggle={() => setDeleteVideoModal(false)} className="bg-danger text-white">
          <Trash2 size={20} className="me-2" />
          {t('Confirm Delete Video')}
        </ModalHeader>
        <ModalBody>
          <p>{t('Are you sure you want to delete this video?')}</p>
          <p className="text-muted">{t('This action cannot be undone.')}</p>
          {selectedVideo && (
            <div className="alert alert-warning">
              <strong>{t('Video ID')}:</strong> {selectedVideo.id}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setDeleteVideoModal(false)}>
            {t('Cancel')}
          </Button>
          <Button
            color="danger"
            onClick={handleDeleteVideo}
            disabled={isDeletingMedia}
          >
            {isDeletingMedia ? t('Deleting...') : t('Delete Video')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Media Confirmation Modal */}
      <Modal isOpen={deleteMediaModal} toggle={() => setDeleteMediaModal(false)}>
        <ModalHeader toggle={() => setDeleteMediaModal(false)} className="bg-danger text-white">
          <Trash2 size={20} className="me-2" />
          {t('Confirm Delete Media')}
        </ModalHeader>
        <ModalBody>
          <p>{t('Are you sure you want to delete this media?')}</p>
          <p className="text-muted">{t('This action cannot be undone.')}</p>
          {selectedMedia && (
            <div className="alert alert-warning">
              <strong>{t('Media ID')}:</strong> {selectedMedia.id}
              {selectedMedia.title && (
                <>
                  <br />
                  <strong>{t('Title')}:</strong> {selectedMedia.title}
                </>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setDeleteMediaModal(false)}>
            {t('Cancel')}
          </Button>
          <Button
            color="danger"
            onClick={handleDeleteMedia}
            disabled={isDeletingMedia}
          >
            {isDeletingMedia ? t('Deleting...') : t('Delete Media')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default LessonProfile
