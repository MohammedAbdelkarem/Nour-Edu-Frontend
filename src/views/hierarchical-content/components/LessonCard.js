import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
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
  Col
} from 'reactstrap'
import {
  BookOpen,
  Plus,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  List
} from 'react-feather'
import {
  useUpdateMutation,
  useDeleteMutation,
  useChangeStatusMutation,
  useChangePriorityMutation
} from '../../../redux/rtkQuery/hierarchical/lesson'
import ErrorAlert from '../../components/handleStatusCode/error'
import { admin_url } from '../../../constant/url'

const LessonCard = ({ data, selectedPath, onNodeClick, onRefresh }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState({})
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [statusConfirmModal, setStatusConfirmModal] = useState(false)
  const [uploadVideoModal, setUploadVideoModal] = useState(false)
  const [priorityModal, setPriorityModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    duration: '',
    e_level_id: '',
    c_level_id: '',
    course_id: '',
    subject_id: '',
    unit_id: '',
    sub_unit_id: ''
  })
  const [uploadVideoData, setUploadVideoData] = useState({
    video: null,
    quality: '720'
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const lastProgressRef = useRef(0)
  const lastProgressTsRef = useRef(0)
  const [extractedQuality, setExtractedQuality] = useState(null)
  const [priorityList, setPriorityList] = useState([])

  const [updateLesson, { isLoading: isUpdating }] = useUpdateMutation()
  const [deleteLesson, { isLoading: isDeleting }] = useDeleteMutation()
  const [changeStatus] = useChangeStatusMutation()
  // const [uploadVideo] = useUploadVideoMutation()
  const [changePriority, { isLoading: isChangingPriority }] = useChangePriorityMutation()

  const toggleDropdown = (id) => {
    setDropdownOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside dropdown menu
      if (!event.target.closest('.dropdown-custom') && 
          !event.target.closest('[id^="dropdown-"]')) {
        setDropdownOpen({})
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleCreate = () => {
    navigate('/hierarchical-content/create-lesson', {
      state: { selectedPath }
    })
  }

  const handleDelete = (item) => {
    setSelectedItem(item)
    setDeleteModal(true)
  }

  const handleViewProfile = (item) => {
    navigate(`/hierarchical-content/lesson/${item.id}`)
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setFormData({
      name: item.name || '',
      bio: item.bio || '',
      duration: item.duration || '',
      e_level_id: item.e_level_id || '',
      c_level_id: item.c_level_id || '',
      course_id: item.course_id || '',
      subject_id: item.subject_id || '',
      unit_id: item.unit_id || '',
      sub_unit_id: item.sub_unit_id || ''
    })
    setEditModal(true)
  }

  const handleChangeStatus = (item) => {
    setSelectedItem(item)
    setStatusConfirmModal(true)
  }

  const handleConfirmStatusChange = async () => {
    try {
      const newStatus = selectedItem.publish_status === 'published' ? 'draft' : 'published'
      await changeStatus({ id: selectedItem.id, status: newStatus }).unwrap()
      setStatusConfirmModal(false)
      setSelectedItem(null)
      onRefresh?.()
    } catch (error) {
      console.error('Error changing status:', error)
      const errorMessage = error?.data?.message || error?.message || t('An error occurred while changing status')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }


  const handleUploadVideo = (item) => {
    setSelectedItem(item)
    setUploadVideoData({ video: null, quality: '720' })
    setExtractedQuality(null)
    setUploadProgress(0)
    setUploadVideoModal(true)
  }

  const handlePriorityManagement = () => {
    // Sort lessons by priority and create priority list
    const sortedLessons = [...data].sort((a, b) => (a.priority || 0) - (b.priority || 0))
    setPriorityList(sortedLessons)
    setPriorityModal(true)
  }

  const moveLessonUp = (index) => {
    if (index > 0) {
      const newList = [...priorityList]
      const temp = newList[index]
      newList[index] = newList[index - 1]
      newList[index - 1] = temp
      setPriorityList(newList)
    }
  }

  const moveLessonDown = (index) => {
    if (index < priorityList.length - 1) {
      const newList = [...priorityList]
      const temp = newList[index]
      newList[index] = newList[index + 1]
      newList[index + 1] = temp
      setPriorityList(newList)
    }
  }

  const handleSavePriority = async () => {
    try {
      const formData = new FormData()
      priorityList.forEach((lesson, index) => {
        // Set ID in brackets and value as index position
        formData.append(`context[${lesson.id}]`, index + 1)
      })
      
      await changePriority({ body: formData }).unwrap()
      setPriorityModal(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error updating priority:', error)
      const errorMessage = error?.data?.message || error?.message || t('An error occurred while updating priority')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  // Function to extract video quality and duration from video file
  const getVideoInfo = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        const height = video.videoHeight
        const duration = video.duration
        
        let quality = '720' 
        if (height >= 1440) {
          quality = '1440'
        } else if (height >= 1080) {
          quality = '1080'
        } else if (height >= 720) {
          quality = '720'
        } else if (height >= 480) {
          quality = '480'
        } else if (height >= 360) {
          quality = '360'
        } else if (height >= 240) {
          quality = '240'
        } else if (height >= 144) {
          quality = '144'
        }
        
        // Convert duration to minutes (round up, minimum 1 minute)
        let durationInMinutes = Math.ceil(duration / 60)
        if (durationInMinutes < 1) durationInMinutes = 1
        
        resolve({ quality, duration: durationInMinutes })
      }
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src)
        resolve({ quality: '720', duration: 1 })
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  const handleSubmitUploadVideo = async () => {
    try {
      if (uploadVideoData.video) {
        // Extract quality and duration from video file
        const { quality, duration } = await getVideoInfo(uploadVideoData.video)

        const formData = new FormData()
        formData.append('video', uploadVideoData.video)
        formData.append('quality', quality)
        formData.append('duration', duration)

        const token = localStorage.getItem('token')
        setUploadProgress(0)
        await axios.post(
          `${admin_url}/lessons/${selectedItem.id}/upload-videos`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            onUploadProgress: (progressEvent) => {
              if (!progressEvent?.total) return
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              const now = Date.now()
              if (
                percent !== lastProgressRef.current &&
                (now - lastProgressTsRef.current > 150 || percent === 100)
              ) {
                lastProgressRef.current = percent
                lastProgressTsRef.current = now
                setUploadProgress(percent)
              }
            }
          }
        )
        setUploadVideoModal(false)
        setSelectedItem(null)
        setUploadVideoData({ video: null, quality: '720' })
        setUploadProgress(0)
        onRefresh?.()
      }
    } catch (error) {
      console.error('Error uploading video:', error)
      const errorMessage = error?.data?.message || error?.message || t('An error occurred while uploading video')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }


  const handleSubmitEdit = async () => {
    try {
      const formDataPayload = new URLSearchParams()
      
      formDataPayload.append('name', formData.name)
      formDataPayload.append('bio', formData.bio)
      await updateLesson({ body: formDataPayload, id: selectedItem.id }).unwrap()
      setEditModal(false)
      setSelectedItem(null)
      onRefresh?.()
    } catch (error) {
      console.error('Error updating lesson:', error)
      const errorMessage = error?.data?.message || error?.message || t('An error occurred while updating lesson')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitDelete = async () => {
    try {
      await deleteLesson({ id: selectedItem.id }).unwrap()
      setDeleteModal(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting lesson:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <Badge color="light-info">{t('Published')}</Badge>
      case 'draft':
        return <Badge color="light-secondary">{t('Draft')}</Badge>
      default:
        return <Badge color="secondary">{t('Unknown')}</Badge>
    }
  }


  return (
    <div className="hierarchical-content">
      <div className="content-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-1">{t('Lessons')}</h4>
            <p className="text-muted mb-0">
              {t('Manage lessons for')} {selectedPath[5]?.name || t('selected sub-unit')}
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              color="warning" 
              outline
              onClick={handlePriorityManagement} 
              className="d-flex align-items-center"
              disabled={data.length === 0}
            >
              <List size={16} className="me-1" />
              {t('Manage Priority')}
            </Button>
            <Button color="primary" onClick={handleCreate} className="d-flex align-items-center">
              <Plus size={16} className="me-1" />
            </Button>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <Row>
          {data.map((item, index) => (
            <Col key={item.id || index} md="6" lg="6" className="mb-4">
              <Card 
                className="h-100 content-card expandable"
                onClick={() => {
                  // For lessons, show content directly instead of navigating deeper
                  onNodeClick(item, [...selectedPath, item])
                }}
                style={{ 
                  cursor: 'pointer',
                  border: '1px solid #e9ecef',
                  borderLeft: '4px solid #0568a9'
                }}
              >
                <CardBody className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="content-info flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <Badge 
                          color="primary" 
                          style={{ 
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            minWidth: '30px',
                            textAlign: 'center'
                          }}
                        >
                          #{item.priority}
                        </Badge>
                        <h6 className="content-title mb-0">{item.name}</h6>
                      </div>
                      <p className="content-description text-muted small mb-2">
                        {item.bio || t('No description available')}
                      </p>
                    </div>
                    <div 
                      className="dropdown-custom position-relative" 
                      style={{ zIndex: 1000 }}
                      ref={(el) => {
                        if (el && dropdownOpen[item.id]) {
                          const rect = el.getBoundingClientRect()
                          const dropdown = document.getElementById(`dropdown-${item.id}`)
                          if (dropdown) {
                            dropdown.style.top = `${rect.bottom + 4}px`
                            dropdown.style.left = `${rect.right - 200}px`
                          }
                        }
                      }}
                    >
                      <div 
                        className="cursor-pointer p-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDropdown(item.id)
                        }}
                        style={{ 
                          cursor: 'pointer', 
                          zIndex: 10, 
                          position: 'relative',
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          borderRadius: '50%',
                          padding: '0.5rem',
                          color: '#6c757d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <Settings size={14} className="text-muted" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="content-meta mt-auto">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-1">
                        {getStatusBadge(item.publish_status)}
                      </div>
                      {item.duration && (
                        <span className="text-primary fw-bold">
                          {item.duration} {t('min')}
                        </span>
                      )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="d-flex gap-2">
                        {item.media && item.media.length > 0 && (
                          <Badge color="light-info" className="small">
                            {item.media.length} {t('Media')}
                          </Badge>
                        )}
                        {item.video && item.video.length > 0 && (
                          <Badge color="light-success" className="small">
                            {item.video.length} {t('Videos')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <Modal isOpen={editModal} toggle={() => setEditModal(false)} size="lg">
        <ModalHeader toggle={() => setEditModal(false)}>
          {t('Edit Lesson')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="edit-name">{t('Lesson Name')} <span className="text-danger">*</span></Label>
              <Input
                type="text"
                name="name"
                id="edit-name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('Enter lesson name')}
              />
            </FormGroup>
            <FormGroup>
              <Label for="edit-bio">{t('Description')}</Label>
              <Input
                type="textarea"
                name="bio"
                id="edit-bio"
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
          <Button color="primary" onClick={handleSubmitEdit} disabled={isUpdating || !formData.name}>
            <Save size={14} className="me-1" />
            {isUpdating ? t('Updating...') : t('Update Lesson')}
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>
          {t('Delete Lesson')}
        </ModalHeader>
        <ModalBody>
          <p>{t('Are you sure you want to delete this lesson? This action cannot be undone.')}</p>
          {selectedItem && (
            <div className="alert alert-warning">
              <strong>{t('Lesson')}:</strong> {selectedItem.name}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setDeleteModal(false)}>
            <X size={14} className="me-1" />
            {t('Cancel')}
          </Button>
          <Button color="danger" onClick={handleSubmitDelete} disabled={isDeleting}>
            <Trash2 size={14} className="me-1" />
            {isDeleting ? t('Deleting...') : t('Delete Lesson')}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={statusConfirmModal} toggle={() => setStatusConfirmModal(false)}>
        <ModalHeader 
          toggle={() => setStatusConfirmModal(false)}
          className="bg-primary text-white"
        >
          <div className="d-flex align-items-center text-white">
            {selectedItem?.publish_status === 'published' ? (
              <>
                <EyeOff size={20} className="me-2" />
                {t('Unpublish Lesson')}
              </>
            ) : (
              <>
                <Eye size={20} className="me-2" />
                {t('Publish Lesson')}
              </>
            )}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            <p className="mb-3">
              {selectedItem?.publish_status === 'published' ? t('Are you sure you want to unpublish this lesson? It will no longer be visible to students.') : t('Are you sure you want to publish this lesson? It will become visible to students.')}
            </p>
            {selectedItem && (
              <div className="alert alert-info">
                <strong>{t('Lesson')}:</strong> {selectedItem.name}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setStatusConfirmModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color={'primary'}
            onClick={handleConfirmStatusChange}
          >
            {selectedItem?.publish_status === 'published' ? (
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
        </ModalFooter>
      </Modal>

      <Modal isOpen={uploadVideoModal} toggle={() => setUploadVideoModal(false)} size="lg">
        <ModalHeader toggle={() => setUploadVideoModal(false)}>
          {t('Upload Video')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="video-file">{t('Video File')} <span className="text-danger">*</span></Label>
              <Input
                type="file"
                id="video-file"
                accept="video/mp4,.mp4"
                onChange={async (e) => {
                  const file = e.target.files[0]
                  if (file) {
                    setUploadVideoData(prev => ({ ...prev, video: file }))
                    // Extract quality from video file for display
                    const { quality } = await getVideoInfo(file)
                    setExtractedQuality(quality)
                  }
                }}
              />
              <small className="text-muted">
                {t('Only MP4 video files are allowed')}
              </small>
            </FormGroup>
            {uploadVideoData.video && (
              <div className="alert alert-info">
                <strong>{t('Selected File')}:</strong> {uploadVideoData.video.name}
                <br />
                <strong>{t('Size')}:</strong> {(uploadVideoData.video.size / (1024 * 1024)).toFixed(2)} MB
                {extractedQuality && (
                  <>
                    <br />
                    <strong>{t('Quality')}:</strong> {extractedQuality}p
                  </>
                )}
              </div>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          {uploadVideoData.video && (
            <div className="flex-grow-1 me-2 d-flex align-items-center">
              <progress value={uploadProgress} max="100" style={{ width: '100%' }} />
              <span className="ms-2" style={{ minWidth: 40, textAlign: 'right' }}>{uploadProgress}%</span>
            </div>
          )}
          <Button color="secondary" outline onClick={() => setUploadVideoModal(false)}>
            <X size={14} className="me-1" />
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={handleSubmitUploadVideo}
            disabled={!uploadVideoData.video}
          >
            <BookOpen size={14} className="me-1" />
            {t('Upload Video')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Priority Management Modal */}
      <Modal isOpen={priorityModal} toggle={() => setPriorityModal(false)} size="lg">
        <ModalHeader toggle={() => setPriorityModal(false)}>
          <div className="d-flex align-items-center">
            <List size={20} className="me-2" />
            {t('Manage Lesson Priority')}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <p className="text-muted mb-0">
              {t('Drag lessons to reorder or use the up/down buttons. Higher priority lessons appear first.')}
            </p>
          </div>
          <div className="priority-list">
            {priorityList.map((lesson, index) => (
              <div 
                key={lesson.id} 
                className="priority-item d-flex align-items-center justify-content-between p-2 mb-2 border rounded"
                style={{ 
                  backgroundColor: '#f8f9fa',
                  cursor: 'move',
                  transition: 'all 0.2s ease',
                  minHeight: '50px'
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString())
                  e.target.style.opacity = '0.5'
                }}
                onDragEnd={(e) => {
                  e.target.style.opacity = '1'
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.target.style.backgroundColor = '#e9ecef'
                }}
                onDragLeave={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa'
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.target.style.backgroundColor = '#f8f9fa'
                  const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'))
                  const dropIndex = index
                  
                  if (draggedIndex !== dropIndex) {
                    const newList = [...priorityList]
                    const draggedItem = newList[draggedIndex]
                    newList.splice(draggedIndex, 1)
                    newList.splice(dropIndex, 0, draggedItem)
                    setPriorityList(newList)
                  }
                }}
              >
                <div className="d-flex align-items-center">
                  <Badge 
                    color="primary" 
                    className="me-2"
                    style={{ 
                      minWidth: '25px',
                      textAlign: 'center',
                      fontSize: '0.75rem'
                    }}
                  >
                    {index + 1}
                  </Badge>
                  <div>
                    <h6 className="mb-0" style={{ fontSize: '0.9rem' }}>{lesson.name}</h6>
                  </div>
                </div>
                <div className="d-flex gap-1">
                  <Button
                    color="outline-primary"
                    size="sm"
                    onClick={() => moveLessonUp(index)}
                    disabled={index === 0}
                    className="p-1"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <ChevronUp size={14} />
                  </Button>
                  <Button
                    color="outline-primary"
                    size="sm"
                    onClick={() => moveLessonDown(index)}
                    disabled={index === priorityList.length - 1}
                    className="p-1"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <ChevronDown size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setPriorityModal(false)}>
            <X size={14} className="me-1" />
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={handleSavePriority}
            disabled={isChangingPriority}
          >
            <Save size={14} className="me-1" />
            {isChangingPriority ? t('Saving...') : t('Save Priority Order')}
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Portal Dropdowns */}
      {data.map((item) => (
        dropdownOpen[item.id] && (
          <div key={item.id}>
            {/* Dropdown Menu */}
            <div 
              id={`dropdown-${item.id}`}
              style={{
                position: 'fixed',
                zIndex: 999999,
                minWidth: '200px',
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                maxHeight: '300px',
                overflowY: 'auto',
                pointerEvents: 'auto'
              }}
            >
              <div 
                className="dropdown-item"
                onClick={() => {
                  handleViewProfile(item)
                  toggleDropdown(item.id)
                }}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #f8f9fa',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa'
                  e.target.style.color = '#0568a9'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white'
                  e.target.style.color = 'inherit'
                }}
              >
                <Eye size={14} className="me-2" />
                {t('View Profile')}
              </div>
              
              <div 
                className="dropdown-item"
                onClick={() => {
                  handleEdit(item)
                  toggleDropdown(item.id)
                }}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #f8f9fa',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa'
                  e.target.style.color = '#0568a9'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white'
                  e.target.style.color = 'inherit'
                }}
              >
                <Settings size={14} className="me-2" />
                {t('Edit')}
              </div>
              
              <div 
                className="dropdown-item"
                onClick={() => {
                  handleUploadVideo(item)
                  toggleDropdown(item.id)
                }}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #f8f9fa',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa'
                  e.target.style.color = '#0568a9'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white'
                  e.target.style.color = 'inherit'
                }}
              >
                <BookOpen size={14} className="me-2" />
                {t('Upload Video')}
              </div>
              
              <div 
                className="dropdown-item"
                onClick={() => {
                  handleChangeStatus(item)
                  toggleDropdown(item.id)
                }}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #f8f9fa',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa'
                  e.target.style.color = '#0568a9'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white'
                  e.target.style.color = 'inherit'
                }}
              >
                {item.publish_status === 'published' ? (
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
              </div>
              
              <div 
                className="dropdown-item"
                onClick={() => {
                  handleDelete(item)
                  toggleDropdown(item.id)
                }}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#dc3545',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white'
                }}
              >
                <Trash2 size={14} className="me-2" />
                {t('Delete')}
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  )
}

export default LessonCard
