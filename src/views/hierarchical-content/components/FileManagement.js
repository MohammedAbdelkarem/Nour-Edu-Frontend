import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  DropdownItem,
  Alert
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
    Clock,
    ChevronUp,
    ChevronDown,
    List,
    Save,
    X
} from 'react-feather'
import {
  useGetMutation,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useChangeStatusMutation,
  useChangePriorityMutation
} from '../../../redux/rtkQuery/hierarchical/file'
import ErrorAlert from '../../components/handleStatusCode/error'
import EmptyComponent from '../../components/empty'
import './FileManagement.scss'

const FileManagement = ({ 
  contextId, 
  contextType, 
  contextName,
  onRefresh
}) => {
  const { t } = useTranslation()
  console.log('FileManagement - contextType:', contextType, 'contextId:', contextId)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [statusModal, setStatusModal] = useState(false)
  const [priorityModal, setPriorityModal] = useState(false)
  const [priorityListModal, setPriorityListModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState({})
  const [priorityList, setPriorityList] = useState([])  
  const [formData, setFormData] = useState({
    title: '',
    file: null
  })
  const [priorityData, setPriorityData] = useState({
    priority: 1
  })
  console.log('contextType', contextType)
  
  const [getFiles] = useGetMutation()
  const [createFile, {isLoading: isCreating}] = useCreateMutation()
  const [updateFile, {isLoading: isUpdating}] = useUpdateMutation()
  const [deleteFile, {isLoading: isDeleting}] = useDeleteMutation()
  const [changeStatus] = useChangeStatusMutation()
  const [changePriority, {isLoading: isChangingPriority}] = useChangePriorityMutation()

  const loadFiles = async () => {
    try {
      setLoading(true)
      const result = await getFiles({
        page: 1,
        per_page: 100,
        context_id: contextId,
        context_type: contextType
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

  // Load files when component mounts or context changes
  useEffect(() => {
    if (contextId && contextType) {
      loadFiles()
    }
  }, [contextId, contextType])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-custom')) {
        setDropdownOpen({})
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  const toggleDropdown = (id) => {
    setDropdownOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleCreate = () => {
    setFormData({
      title: '',
      file: null
    })
    setCreateModal(true)
  }

  const handleEdit = (file) => {
    setSelectedFile(file)
    setFormData({
      title: file.title || '',
      file: null
    })
    setEditModal(true)
  }

  const handleDelete = (file) => {
    setSelectedFile(file)
    setDeleteModal(true)
  }

  const handleChangeStatus = (file) => {
    setSelectedFile(file)
    setStatusModal(true)
  }


  const handlePriorityManagement = () => {
    // Sort files by priority and create priority list
    const sortedFiles = [...files].sort((a, b) => (a.priority || 0) - (b.priority || 0))
    setPriorityList(sortedFiles)
    setPriorityListModal(true)
  }

  const moveFileUp = (index) => {
    if (index > 0) {
      const newList = [...priorityList]
      const temp = newList[index]
      newList[index] = newList[index - 1]
      newList[index - 1] = temp
      setPriorityList(newList)
    }
  }

  const moveFileDown = (index) => {
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
      priorityList.forEach((file, index) => {
        // Set index as ID and value as index position
        formData.append(`context[${file.id}]`, index + 1)
      })
      
      await changePriority({ body: formData }).unwrap()
      setPriorityListModal(false)
      loadFiles()
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

  const handleSubmitCreate = async () => {
    try {
      const formDataPayload = new FormData()
      formDataPayload.append('title', formData.title)
      formDataPayload.append('context_id', contextId)
      formDataPayload.append('context_type', contextType)
      
      if (formData.file) {
        formDataPayload.append('file', formData.file)
      }

      await createFile({ body: formDataPayload }).unwrap()
      setCreateModal(false)
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

  const handleSubmitEdit = async () => {
    try {
      const formDataPayload = new URLSearchParams()
      formDataPayload.append('title', formData.title)

      await updateFile({ body: formDataPayload, id: selectedFile.id }).unwrap()
      setEditModal(false)
      setSelectedFile(null)
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
      await deleteFile({ id: selectedFile.id }).unwrap()
      setDeleteModal(false)
      setSelectedFile(null)
      loadFiles()
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting file:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to delete file')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleConfirmStatusChange = async () => {
    try {
      const newStatus = selectedFile.publish_status === 'published' ? 'draft' : 'published'
      await changeStatus({ id: selectedFile.id, status: newStatus }).unwrap()
      setStatusModal(false)
      setSelectedFile(null)
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

  const handleSubmitPriorityChange = async () => {
    try {
      const body = {
        file_id: selectedFile.id,
        priority: parseInt(priorityData.priority)
      }
      await changePriority({ body }).unwrap()
      setPriorityModal(false)
      setSelectedFile(null)
      loadFiles()
      onRefresh?.()
    } catch (error) {
      console.error('Error changing priority:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to change priority')
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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    
    if (file) {
      // Validate file type - only PDF
      const allowedTypes = ['application/pdf']
      const fileExtension = file.name.split('.').pop().toLowerCase()
      const allowedExtensions = ['pdf']
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        ErrorAlert({
          title: t('Invalid File Type'),
          body: t('Please select only PDF files'),
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
    }
    
    setFormData(prev => ({
      ...prev,
      file
    }))
  }

  const handlePriorityChange = (e) => {
    const { name, value } = e.target
    setPriorityData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) return <Image size={16} />
    if (fileType?.includes('video')) return <Video size={16} />
    if (fileType?.includes('pdf') || fileType?.includes('document')) return <FileText size={16} />
    if (fileType?.includes('zip') || fileType?.includes('rar')) return <Archive size={16} />
    return <File size={16} />
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
    <div className="file-management">
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">{t('Content Management')}</h5>
              <small className="text-muted">
                {t('Manage content for')} {contextName}
              </small>
            </div>
          </div>
          
        </CardHeader>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">{t('File Management')}</h6>
            <div className="d-flex gap-2">
              <Button 
                color="warning" 
                outline
                onClick={handlePriorityManagement} 
                className="d-flex align-items-center"
                size="sm"
                disabled={files.length === 0}
              >
                <List size={14} className="me-1" />
                {t('Manage Priority')}
              </Button>
              <Button color="primary" onClick={handleCreate} size="sm">
                <Plus size={14} className="me-1" />
                {t('Add File')}
              </Button>
            </div>
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
            <Row style={{ overflow: 'visible' }}>
              {files.map((file) => (
                <Col key={file.id} md="6" lg="4" className="mb-4" style={{ overflow: 'visible' }}>
                  <Card className="h-100 file-card modern-card" style={{ overflow: 'visible' }}>
                    <CardBody className="p-0" style={{ overflow: 'visible' }}>
                      {/* Card Header with Icon and Actions */}
                      <div className="card-header-section position-relative">
                        {/* Settings Dropdown - Top Right Corner */}
                        <div className="file-actions position-absolute" style={{ top: '12px', right: '12px', zIndex: 1000 }}>
                          <div className="dropdown-custom position-relative">
                            <div 
                              className="settings-toggle"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDropdown(file.id)
                              }}
                              style={{ 
                                zIndex: 1001,
                                cursor: 'pointer',
                                background: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                borderRadius: '50%',
                                padding: '0.5rem',
                                color: '#6c757d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              <Settings size={16} />
                            </div>
                            
                            {dropdownOpen[file.id] && (
                              <div 
                                className="custom-dropdown-menu"
                                style={{
                                  position: 'fixed',
                                  zIndex: 999999,
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  minWidth: '200px',
                                  backgroundColor: 'white',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '8px',
                                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                                  maxHeight: '300px',
                                  overflowY: 'auto'
                                }}
                              >
                                <div 
                                  className="dropdown-item"
                                  onClick={() => {
                                    handleEdit(file)
                                    toggleDropdown(file.id)
                                  }}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #f8f9fa'
                                  }}
                                >
                                  <Edit size={14} className="me-2" />
                                  {t('Edit title')}
                                </div>
                                
                                <div 
                                  className="dropdown-item"
                                  onClick={() => {
                                    handleChangeStatus(file)
                                    toggleDropdown(file.id)
                                  }}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #f8f9fa'
                                  }}
                                >
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
                                </div>
                                
                                <div 
                                  className="dropdown-item"
                                  onClick={() => {
                                    handleDelete(file)
                                    toggleDropdown(file.id)
                                  }}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#dc3545'
                                  }}
                                >
                                  <Trash2 size={14} className="me-2" />
                                  {t('Delete')}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* File Icon and Badge */}
                        <div className="file-icon-wrapper">
                          <div className="file-icon">
                            {getFileIcon(file.file_type)}
                          </div>
                          <div className="file-type-badge">
                            {file.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Card Content */}
                      <div className="card-content-section">
                        <div className="file-title-section">
                          <h5 className="file-title">{file.title || file.name}</h5>
                          <div className="file-meta-info">
                            <div className="meta-item">
                              <span className="meta-label">{`${t('Priority:')} #${file.priority || 1}`}</span>
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
                              {file.file_id ? `ID: ${file.file_id}` : 'No ID'}
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
                            onClick={() => window.open(file.file_url, '_blank')}
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
        </CardBody>
      </Card>

      {/* Create File Modal */}
      <Modal isOpen={createModal} toggle={() => setCreateModal(false)} size="lg">
        <ModalHeader toggle={() => setCreateModal(false)}>
          {t('Add New File')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="create-name">{t('File Name')} <span className="text-danger">*</span></Label>
                  <Input
                    type="text"
                    name="title"
                    id="create-name"
                    value={formData.title}
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
                    accept=".pdf,.PDF"
                    onChange={handleFileChange}
                  />
                  <small className="text-muted">
                    {t('Allowed formats: PDF (Max size: 10MB)')}
                  </small>
                </FormGroup>
              </Col>
            </Row>
            {formData.file && (
              <Alert color="info">
                <strong>{t('Selected File')}:</strong> {formData.file.name}
                <br />
                <strong>{t('Size')}:</strong> {formatFileSize(formData.file.size)}
              </Alert>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setCreateModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={handleSubmitCreate}
            disabled={!formData.title || !formData.file || isCreating}
          >
            <Upload size={14} className="me-1" />
            { isCreating ? t('Uploading...') : t('Upload File')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit File Modal */}
      <Modal isOpen={editModal} toggle={() => setEditModal(false)} size="sm">
        <ModalHeader toggle={() => setEditModal(false)}>
          {t('Edit File')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="edit-name">{t('File title')} <span className="text-danger">*</span></Label>
              <Input
                type="text"
                name="title"
                id="edit-name"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('Enter file title')}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setEditModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={handleSubmitEdit}
            disabled={!formData.title || isUpdating}
          >
            <Edit size={14} className="me-1" />
            { isUpdating ? t('Updating...') : t('Update File')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>
          {t('Delete File')}
        </ModalHeader>
        <ModalBody>
          <p>{t('Are you sure you want to delete this file? This action cannot be undone.')}</p>
           {selectedFile && (
             <Alert color="warning">
               <strong>{t('File')}:</strong> {selectedFile.title || selectedFile.name}
             </Alert>
           )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setDeleteModal(false)}>
            {t('Cancel')}
          </Button>
          <Button color="danger" onClick={handleSubmitDelete}>
            <Trash2 size={14} className="me-1" />
            { isDeleting ? t('Deleting...') : t('Delete File')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Status Change Confirmation Modal */}
      <Modal isOpen={statusModal} toggle={() => setStatusModal(false)}>
        <ModalHeader toggle={() => setStatusModal(false)}>
          {selectedFile?.publish_status === 'published' ? t('Unpublish File') : t('Publish File')}
        </ModalHeader>
        <ModalBody>
           <p>
             {selectedFile?.publish_status === 'published' ? t('Are you sure you want to unpublish this file? It will no longer be visible to students.') : t('Are you sure you want to publish this file? It will become visible to students.')}
           </p>
           {selectedFile && (
             <Alert color="info">
               <strong>{t('File')}:</strong> {selectedFile.title || selectedFile.name}
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
            {selectedFile?.publish_status === 'published' ? (
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

      {/* Priority Change Modal */}
      <Modal isOpen={priorityModal} toggle={() => setPriorityModal(false)}>
        <ModalHeader toggle={() => setPriorityModal(false)}>
          {t('Change File Priority')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="priority-input">{t('Priority')} <span className="text-danger">*</span></Label>
              <Input
                type="number"
                name="priority"
                id="priority-input"
                value={priorityData.priority}
                onChange={handlePriorityChange}
                min="1"
                max="100"
                placeholder={t('Enter priority (1-100)')}
              />
              <small className="text-muted">
                {t('Lower numbers have higher priority (1 is highest priority)')}
              </small>
            </FormGroup>
            {selectedFile && (
              <Alert color="info">
                <strong>{t('File')}:</strong> {selectedFile.title || selectedFile.name}
                <br />
                <strong>{t('Current Priority')}:</strong> #{selectedFile.priority || 1}
              </Alert>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setPriorityModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={handleSubmitPriorityChange}
            disabled={!priorityData.priority || isChangingPriority}
          >
            <Settings size={14} className="me-1" />
            { isChangingPriority ? t('Updating...') : t('Update Priority')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Priority Management Modal */}
      <Modal isOpen={priorityListModal} toggle={() => setPriorityListModal(false)} size="lg">
        <ModalHeader toggle={() => setPriorityListModal(false)}>
          {t('Manage File Priority')}
        </ModalHeader>
        <ModalBody>
          <p className="text-muted mb-3">
            {t('Drag files to reorder or use the up/down buttons. Higher priority files appear first.')}
          </p>
          
          <div className="priority-list-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {priorityList.map((file, index) => (
              <div 
                key={file.id} 
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
                    <h6 className="mb-0" style={{ fontSize: '0.9rem' }}>{file.title || file.name}</h6>
                  </div>
                </div>
                
                <div className="d-flex gap-1">
                  <Button
                    color="outline-primary"
                    size="sm"
                    onClick={() => moveFileUp(index)}
                    disabled={index === 0}
                    className="p-1"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <ChevronUp size={14} />
                  </Button>
                  <Button
                    color="outline-primary"
                    size="sm"
                    onClick={() => moveFileDown(index)}
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
          <Button color="secondary" outline onClick={() => setPriorityListModal(false)}>
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
    </div>
  )
}

export default FileManagement
