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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap'
import {
  File,
  Plus,
  Upload,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Settings,
  FileText,
  Image,
  Video,
  Archive,
  HelpCircle,
  BookOpen,
  Clock,
  Users
} from 'react-feather'
import {
  useGetMutation,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useChangeStatusMutation
} from '../../../redux/rtkQuery/hierarchical/file'
import ErrorAlert from '../../components/handleStatusCode/error'
import EmptyComponent from '../../components/empty'
import './LessonContent.scss'

const LessonContent = ({ 
  lessonId, 
  lessonName,
  onRefresh 
}) => {
  const { t } = useTranslation()
  
  // State management
  const [files, setFiles] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('files')
  const [createFileModal, setCreateFileModal] = useState(false)
  const [createQuizModal, setCreateQuizModal] = useState(false)
  const [editFileModal, setEditFileModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [statusModal, setStatusModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState({})
  
  // Form data
  const [fileFormData, setFileFormData] = useState({
    title: '',
    file: null
  })
  
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    description: '',
    duration: '',
    questions_count: ''
  })
  
  // API hooks
  const [getFiles] = useGetMutation()
  const [createFile, {isLoading: isCreating}] = useCreateMutation()
  const [updateFile, {isLoading: isUpdating}] = useUpdateMutation()
  const [deleteFile, {isLoading: isDeleting}] = useDeleteMutation()
  const [changeStatus] = useChangeStatusMutation()

  const loadFiles = async () => {
    try {
      setLoading(true)
      const result = await getFiles({
        page: 1,
        per_page: 100,
        context_id: lessonId,
        context_type: 'Lesson'
      }).unwrap()
      
      setFiles(result.data || [])
    } catch (error) {
      console.error('Error loading files:', error)
      ErrorAlert({
        title: t('Error'),
        body: t('Failed to load files'),
        button: t('OK')
      })
    } finally {
      setLoading(false)
    }
  }

  const loadQuizzes = async () => {
    try {
      // Mock quiz data for now - replace with actual API call
      const mockQuizzes = [
        {
          id: 1,
          title: 'Lesson Quiz 1',
          description: 'Basic understanding quiz',
          duration: 30,
          questions_count: 10,
          publish_status: 'published',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          title: 'Advanced Quiz',
          description: 'Advanced concepts quiz',
          duration: 45,
          questions_count: 15,
          publish_status: 'draft',
          created_at: '2024-01-16T14:30:00Z'
        }
      ]
      setQuizzes(mockQuizzes)
    } catch (error) {
      console.error('Error loading quizzes:', error)
      setQuizzes([])
    }
  }

  // Load data when component mounts
  useEffect(() => {
    if (lessonId) {
      loadFiles()
      loadQuizzes()
    }
  }, [lessonId])

  const toggleDropdown = (id) => {
    setDropdownOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // File management functions
  const handleCreateFile = () => {
    setFileFormData({
      title: '',
      file: null
    })
    setCreateFileModal(true)
  }

  const handleEditFile = (file) => {
    setSelectedItem(file)
    setFileFormData({
      title: file.title || '',
      file: null
    })
    setEditFileModal(true)
  }

  const handleDeleteFile = (file) => {
    setSelectedItem(file)
    setDeleteModal(true)
  }

  const handleChangeFileStatus = (file) => {
    setSelectedItem(file)
    setStatusModal(true)
  }

  const handleSubmitCreateFile = async () => {
    try {
      const formDataPayload = new FormData()
      formDataPayload.append('title', fileFormData.title)
      formDataPayload.append('context_id', lessonId)
      formDataPayload.append('context_type', 'Lesson')
      
      if (fileFormData.file) {
        formDataPayload.append('file', fileFormData.file)
      }

      await createFile({ body: formDataPayload }).unwrap()
      setCreateFileModal(false)
      loadFiles()
      onRefresh?.()
    } catch (error) {
      console.error('Error creating file:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to create file')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitEditFile = async () => {
    try {
      const formDataPayload = new URLSearchParams()
      formDataPayload.append('title', fileFormData.title)
      await updateFile({ body: formDataPayload, id: selectedItem.id }).unwrap()
      setEditFileModal(false)
      setSelectedItem(null)
      loadFiles()
      onRefresh?.()
    } catch (error) {
      console.error('Error updating file:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to update file')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitDelete = async () => {
    try {
      await deleteFile({ id: selectedItem.id }).unwrap()
      setDeleteModal(false)
      setSelectedItem(null)
      loadFiles()
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting item:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to delete item')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleConfirmStatusChange = async () => {
    try {
      const newStatus = selectedItem.publish_status === 'published' ? 'draft' : 'published'
      await changeStatus({ id: selectedItem.id, status: newStatus }).unwrap()
      setStatusModal(false)
      setSelectedItem(null)
      loadFiles()
      onRefresh?.()
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

  // Quiz management functions
  const handleCreateQuiz = () => {
    setQuizFormData({
      title: '',
      description: '',
      duration: '',
      questions_count: ''
    })
    setCreateQuizModal(true)
  }

  const handleEditQuiz = (quiz) => {
    setSelectedItem(quiz)
    setQuizFormData({
      title: quiz.title || '',
      description: quiz.description || '',
      duration: quiz.duration || '',
      questions_count: quiz.questions_count || ''
    })
    setEditQuizModal(true)
  }

  const handleDeleteQuiz = (quiz) => {
    setSelectedItem(quiz)
    setDeleteModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFileFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleQuizInputChange = (e) => {
    const { name, value } = e.target
    setQuizFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFileFormData(prev => ({
      ...prev,
      file
    }))
  }

  const getFileIcon = (file) => {
    const fileType = file?.file?.type || file?.type
    const fileUrl = file?.file?.url || file?.url
    
    // Check file type from the type field
    if (fileType === 'image' || fileUrl?.includes('image')) return <Image size={20} />
    if (fileType === 'video' || fileUrl?.includes('video')) return <Video size={20} />
    if (fileType === 'file' || fileUrl?.includes('.pdf') || fileUrl?.includes('document')) return <FileText size={20} />
    if (fileType === 'archive' || fileUrl?.includes('.zip') || fileUrl?.includes('.rar')) return <Archive size={20} />
    return <File size={20} />
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="lesson-content">
      {/* Tabs for Files and Quizzes */}
      <div className="content-tabs mb-4">
        <Nav tabs>
          <NavItem>
            <NavLink
              active={activeTab === 'files'}
              onClick={() => setActiveTab('files')}
              style={{ cursor: 'pointer' }}
            >
              <File size={16} className="me-1" />
              {t('Files')} ({files.length})
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={activeTab === 'quizzes'}
              onClick={() => setActiveTab('quizzes')}
              style={{ cursor: 'pointer' }}
            >
              <HelpCircle size={16} className="me-1" />
              {t('Quizzes')} ({quizzes.length})
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="files">
            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">{t('Lesson Files')}</h6>
                <Button color="primary" onClick={handleCreateFile} size="sm">
                  <Plus size={14} className="me-1" />
                  {t('Add File')}
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('Loading...')}</span>
                  </div>
                </div>
              ) : files.length === 0 ? (
                <EmptyComponent 
                  title={t('No Files Found')}
                  body={t('No files found. Click Add File to upload your first file.')}
                />
              ) : (
                <Row>
                  {files.map((file) => (
                    <Col key={file.id} md="6" lg="4" className="mb-4">
                      <Card className="h-100 file-card modern-card">
                        <CardBody className="p-0">
                          {/* Card Header with Icon and Actions */}
                          <div className="card-header-section">
                            <div className="file-icon-wrapper">
                              <div className="file-icon">
                                {getFileIcon(file)}
                              </div>
                              <div className="file-type-badge">
                                {file.file?.type?.toUpperCase() || 'FILE'}
                              </div>
                            </div>
                            <Dropdown 
                              isOpen={dropdownOpen[file.id] || false} 
                              toggle={() => toggleDropdown(file.id)}
                              className="file-actions"
                            >
                              <DropdownToggle caret color="transparent" size="sm">
                                <Settings size={16} />
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
                                <DropdownItem onClick={() => handleEditFile(file)}>
                                  <Edit size={14} className="me-2" />
                                  {t('Edit title')}
                                </DropdownItem>
                                <DropdownItem onClick={() => handleChangeFileStatus(file)}>
                                  {file.publish_status === 'published' ? (
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
                                <DropdownItem onClick={() => handleDeleteFile(file)} className="text-danger">
                                  <Trash2 size={14} className="me-2" />
                                  {t('Delete')}
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                          
                          {/* Card Content */}
                          <div className="card-content-section">
                            <div className="file-title-section">
                              <h5 className="file-title">{file.title}</h5>
                              <div className="file-meta-info">
                                <div className="meta-item">
                                  <span className="meta-label">{`${t('Priority:')} #${file.priority}`}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="file-details-section">
                              <div className="detail-row">
                                <Clock size={14} className="detail-icon" />
                                <span className="detail-text">
                                  {new Date(file.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="detail-row">
                                <File size={14} className="detail-icon" />
                                <span className="detail-text">
                                  {file.file?.id ? `ID: ${file.file.id}` : 'No ID'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Card Footer */}
                          <div className="card-footer-section">
                            <div className="status-section">
                              {getStatusBadge(file.publish_status)}
                            </div>
                            <div className="action-buttons">
                              <Button 
                                color="primary" 
                                size="sm" 
                                outline
                                onClick={() => window.open(file.file?.url, '_blank')}
                                className="action-btn"
                              >
                                <Download size={12} className="me-1" />
                                {t('Download')}
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </TabPane>
          
          <TabPane tabId="quizzes">
            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">{t('Lesson Quizzes')}</h6>
                <Button onClick={handleCreateQuiz} size="sm" style={{ backgroundColor: '#0568a9', borderColor: '#0568a9' }}>
                  <Plus size={14} className="me-1" />
                  {t('Add Quiz')}
                </Button>
              </div>
              
              {quizzes.length === 0 ? (
                <EmptyComponent 
                  title={t('No Quizzes Found')}
                  body={t('No quizzes found. Click Add Quiz to create your first quiz.')}
                />
              ) : (
                <Row>
                  {quizzes.map((quiz) => (
                    <Col key={quiz.id} md="6" lg="4" className="mb-3">
                      <Card className="h-100 quiz-card">
                        <CardBody className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="quiz-icon text-success">
                              <HelpCircle size={20} />
                            </div>
                            <Dropdown 
                              isOpen={dropdownOpen[quiz.id] || false} 
                              toggle={() => toggleDropdown(quiz.id)}
                            >
                              <DropdownToggle caret color="transparent" size="sm">
                                <Settings size={14} />
                              </DropdownToggle>
                              <DropdownMenu 
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
                                <DropdownItem onClick={() => handleEditQuiz(quiz)}>
                                  <Edit size={14} className="me-2" />
                                  {t('Edit')}
                                </DropdownItem>
                                <DropdownItem onClick={() => handleDeleteQuiz(quiz)} className="text-danger">
                                  <Trash2 size={14} className="me-2" />
                                  {t('Delete')}
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                          
                          <div className="quiz-info flex-grow-1">
                            <h6 className="quiz-title mb-1">{quiz.title}</h6>
                            <p className="quiz-description text-muted small mb-2">
                              {quiz.description}
                            </p>
                            
                            <div className="quiz-meta d-flex justify-content-between align-items-center mb-2">
                              <div className="d-flex align-items-center text-muted small">
                                <Clock size={12} className="me-1" />
                                {quiz.duration} {t('min')}
                              </div>
                              <div className="d-flex align-items-center text-muted small">
                                <BookOpen size={12} className="me-1" />
                                {quiz.questions_count} {t('questions')}
                              </div>
                            </div>
                            
                            <div className="quiz-status">
                              {getStatusBadge(quiz.publish_status)}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </TabPane>
        </TabContent>
      </div>

      {/* Create File Modal */}
      <Modal isOpen={createFileModal} toggle={() => setCreateFileModal(false)} size="lg">
        <ModalHeader toggle={() => setCreateFileModal(false)}>
          {t('Add New File')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="create-file-name">{t('File Name')} <span className="text-danger">*</span></Label>
                  <Input
                    type="text"
                    name="title"
                    id="create-file-name"
                    value={fileFormData.title}
                    onChange={handleInputChange}
                    placeholder={t('Enter file name')}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="create-file">{t('File')} <span className="text-danger">*</span></Label>
                  <Input
                    type="file"
                    name="file"
                    id="create-file"
                    onChange={handleFileChange}
                  />
                </FormGroup>
              </Col>
            </Row>
            {fileFormData.file && (
              <Alert color="info">
                <strong>{t('Selected File')}:</strong> {fileFormData.file.name}
                <br />
                <strong>{t('Size')}:</strong> {formatFileSize(fileFormData.file.size)}
              </Alert>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setCreateFileModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={handleSubmitCreateFile}
            disabled={!fileFormData.title || !fileFormData.file || isCreating}
          >
            <Upload size={14} className="me-1" />
            { isCreating ? t('Uploading...') : t('Upload File')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create Quiz Modal */}
      <Modal isOpen={createQuizModal} toggle={() => setCreateQuizModal(false)} size="lg">
        <ModalHeader toggle={() => setCreateQuizModal(false)}>
          {t('Add New Quiz')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="create-quiz-title">{t('Quiz Title')} <span className="text-danger">*</span></Label>
                  <Input
                    type="text"
                    name="title"
                    id="create-quiz-title"
                    value={quizFormData.title}
                    onChange={handleQuizInputChange}
                    placeholder={t('Enter quiz title')}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="create-quiz-duration">{t('Duration (minutes)')} <span className="text-danger">*</span></Label>
                  <Input
                    type="number"
                    name="duration"
                    id="create-quiz-duration"
                    value={quizFormData.duration}
                    onChange={handleQuizInputChange}
                    placeholder={t('Enter duration')}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="create-quiz-questions">{t('Number of Questions')} <span className="text-danger">*</span></Label>
                  <Input
                    type="number"
                    name="questions_count"
                    id="create-quiz-questions"
                    value={quizFormData.questions_count}
                    onChange={handleQuizInputChange}
                    placeholder={t('Enter number of questions')}
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label for="create-quiz-description">{t('Description')}</Label>
              <Input
                type="textarea"
                name="description"
                id="create-quiz-description"
                value={quizFormData.description}
                onChange={handleQuizInputChange}
                placeholder={t('Enter quiz description')}
                rows="3"
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setCreateQuizModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={() => {
              // Mock quiz creation - replace with actual API call
              const newQuiz = {
                id: Date.now(),
                ...quizFormData,
                publish_status: 'draft',
                created_at: new Date().toISOString()
              }
              setQuizzes(prev => [...prev, newQuiz])
              setCreateQuizModal(false)
            }}
            disabled={!quizFormData.title || !quizFormData.duration || !quizFormData.questions_count}
          >
            <Plus size={14} className="me-1" />
            {t('Create Quiz')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit File Modal */}
      <Modal isOpen={editFileModal} toggle={() => setEditFileModal(false)} size="lg">
        <ModalHeader toggle={() => setEditFileModal(false)}>
          {t('Edit File')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
                <Label for="edit-file-name">{t('File Name')} <span className="text-danger">*</span></Label>
                <Input
                type="text"
                name="title"
                id="edit-file-name"
                value={fileFormData.title}
                onChange={handleInputChange}
                placeholder={t('Enter file name')}
                />
            </FormGroup>
            {fileFormData.file && (
              <Alert color="info">
                <strong>{t('New File')}:</strong> {fileFormData.file.name}
                <br />
                <strong>{t('Size')}:</strong> {formatFileSize(fileFormData.file.size)}
              </Alert>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setEditFileModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={handleSubmitEditFile}
            disabled={!fileFormData.title || isUpdating}
          >
            <Edit size={14} className="me-1" />
            { isUpdating ? t('Updating...') : t('Update File')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>
          {t('Delete Item')}
        </ModalHeader>
        <ModalBody>
          <p>{t('Are you sure you want to delete this item? This action cannot be undone.')}</p>
          {selectedItem && (
            <Alert color="warning">
              <strong>{t('Item')}:</strong> {selectedItem.title || selectedItem.name}
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setDeleteModal(false)}>
            {t('Cancel')}
          </Button>
          <Button color="danger" onClick={handleSubmitDelete}>
            <Trash2 size={14} className="me-1" />
            { isDeleting ? t('Deleting...') : t('Delete Item')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Status Change Confirmation Modal */}
      <Modal isOpen={statusModal} toggle={() => setStatusModal(false)}>
        <ModalHeader toggle={() => setStatusModal(false)}>
          {selectedItem?.publish_status === 'published' ? t('Unpublish Item') : t('Publish Item')}
        </ModalHeader>
        <ModalBody>
          <p>
            {selectedItem?.publish_status === 'published' ? t('Are you sure you want to unpublish this item? It will no longer be visible to students.') : t('Are you sure you want to publish this item? It will become visible to students.')}
          </p>
          {selectedItem && (
            <Alert color="info">
              <strong>{t('Item')}:</strong> {selectedItem.title || selectedItem.name}
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setStatusModal(false)}>
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
    </div>
  )
}

export default LessonContent
