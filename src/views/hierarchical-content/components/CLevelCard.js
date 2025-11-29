import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Users,
  FileText,
  Trello
} from 'react-feather'
import FileUploaderRestrictions from '../../components/uplaoder/FileUploaderRestrictions'
import TeacherAttachment from './TeacherAttachment'
import {
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useChangeStatusMutation
} from '../../../redux/rtkQuery/hierarchical/c-level'
import { useUpdateMutation as useUpdateMediaMutation, useUploadMutation } from '../../../redux/rtkQuery/media'
import ErrorAlert from '../../components/handleStatusCode/error'
import { useNavigate } from 'react-router-dom'

const CLevelCard = ({ data, selectedPath, onNodeClick, onRefresh }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState({})
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [statusConfirmModal, setStatusConfirmModal] = useState(false)
  const [teacherModal, setTeacherModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    image: null,
    currentMediaUrl: null
  })
  const [files, setFiles] = useState([])

  // API hooks
  const [createCLevel, { isLoading: isCreating }] = useCreateMutation()
  const [updateCLevel, { isLoading: isUpdating }] = useUpdateMutation()
  const [deleteCLevel, { isLoading: isDeleting }] = useDeleteMutation()
  const [changeStatus, { isLoading: isLoadingStatusChange }] = useChangeStatusMutation()
  const [updateMedia, { isLoading: isLoadingMediaUpdate }] = useUpdateMediaMutation()
  const [uploadMedia, { isLoading: isLoadingMediaUpload }] = useUploadMutation()

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
    setFormData({ name: '', bio: '', image: null })
    setFiles([])
    setCreateModal(true)
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setFormData({
      name: item.name || '',
      bio: item.bio || '',
      image: null,
      currentMediaUrl: item.media?.url || null
    })
    setFiles([])
    setEditModal(true)
  }

  const handleDelete = (item) => {
    setSelectedItem(item)
    setDeleteModal(true)
  }

  const handleTeacherAttachment = (item) => {
    if (teacherModal && selectedItem?.id === item.id) return
    setSelectedItem(item)
    setTeacherModal(true)
  }

  // Memoize eLevelContext to prevent unnecessary re-renders
  const eLevelContext = useMemo(() => {
    if (selectedPath && selectedPath.length > 0 && selectedPath[0]?.id) {
      return {
        contextId: selectedPath[0].id,
        contextType: 'E_Level'
      }
    }
    return null
  }, [selectedPath])

  const handleChangeStatus = (item) => {
    setSelectedItem(item)
    setStatusConfirmModal(true)
  }

  const handleAddStory = (item) => {
    navigate('/story-management', {
      state: {
        storiable_id: item.id,
        storiable_type: 'C_Level'
      }
    })
  }

  const handleAddBanner = (item) => {
    navigate('/banner-management', {
      state: {
        bannerable_id: item.id,
        bannerable_type: 'C_Level'
      }
    })
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

  const handleSubmitCreate = async () => {
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('e_level_id', selectedPath[0].id)
      
      if (formData.bio && formData.bio.trim() !== '') {
        formDataToSend.append('bio', formData.bio)
      }
      
      if (files.length > 0) {
        formDataToSend.append('image', files[0])
      }

      await createCLevel({ body: formDataToSend }).unwrap()
      setCreateModal(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error creating c-level:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to create class level')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitUpdate = async () => {
    try {
      // Update C-Level data (name and bio)
      const formDataToSend = new URLSearchParams()
      formDataToSend.append('name', formData.name)
      
      if (formData.bio && formData.bio.trim() !== '') {
        formDataToSend.append('bio', formData.bio)
      }

      await updateCLevel({ body: formDataToSend, id: selectedItem.id }).unwrap()

      // Update or upload media separately if new image is selected
      if (files.length > 0) {
        const mediaFormData = new FormData()
        mediaFormData.append('images[]', files[0])
        
        if (selectedItem.media?.id) {
          // Update existing media
          mediaFormData.append('_method', 'PUT')
          await updateMedia({ 
            body: mediaFormData, 
            id: selectedItem.media.id 
          }).unwrap()
        } else {
          // Upload new media
          mediaFormData.append('context_type', 'C_Level')
          mediaFormData.append('context_id', selectedItem.id)
          await uploadMedia({ 
            body: mediaFormData
          }).unwrap()
        }
      }

      setEditModal(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error updating c-level:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to update class level')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitDelete = async () => {
    try {
      await deleteCLevel({ id: selectedItem.id }).unwrap()
      setDeleteModal(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting c-level:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to delete class level')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const renderCLevelCard = (item) => {
    const isSelected = selectedPath.length > 1 && 
                       selectedPath[selectedPath.length - 1]?.id === item.id
    return (
      <Card 
        key={item.id} 
        className={`content-card ${isSelected ? 'selected' : ''} expandable`}
        onClick={() => onNodeClick(item, [...selectedPath, item])}
        style={{
          border: '1px solid #e9ecef',
          borderLeft: '4px solid #0568a9',
          ...(isSelected && {
            borderColor: '#0568a9',
            boxShadow: '0 4px 16px rgba(5, 60, 149, 0.2)',
            background: 'linear-gradient(135deg, rgba(32, 201, 151, 0.05) 0%, rgba(32, 201, 151, 0.02) 100%)'
          })
        }}
      >
        <CardBody className="p-1">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center flex-grow-1">
              {item.media?.url ? (
                <img 
                  src={item.media.url} 
                  alt={item.name}
                  className="m-1"
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                />
              ) : (
                <BookOpen size={18} className="text-primary m-1" />
              )}
              <h6 className="mb-0 fw-bold text-dark">{item.name}</h6>
            </div>
            <div className="d-flex align-items-center">
              <Badge 
                color={item.publish_status === 'published' ? 'light-success' : 'light-secondary'} 
                size="sm"
                className="me-2"
              >
                {item.publish_status === "published" ? t('فعَّال') : t('مسودة')}
              </Badge>
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
          </div>
          
          {/* Statistics Row */}
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              {item.courses && item.courses.length > 0 && (
                <small className="text-muted">
                  <strong>{item.courses.length}</strong> {t('Courses')}
                </small>
              )}
            </div>
            {item.duration > 0 && (
              <small className="text-muted">
                <strong>{item.duration}</strong> {t('min')}
              </small>
            )}
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="wizard-content">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">{t('Class Levels')}</h4>
          <p className="text-muted mb-0">{t('Manage your class levels')}</p>
        </div>
        <Button 
          color="primary"
          onClick={handleCreate}
          className="d-flex align-items-center"
        >
            <Plus size={15} />
        </Button>
      </div>
      {data.length > 0 ? (
        <Row>
          {data.map((item) => (
            <Col md={6} key={item.id} className="mb-3">
              {renderCLevelCard(item)}
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">
            {t('No class levels available. Click the + button above to create your first class level.')}
          </p>
        </div>
      )}

        <Modal isOpen={createModal} toggle={() => setCreateModal(false)}>
          <ModalHeader 
            toggle={() => setCreateModal(false)}
            className="bg-primary text-white"
          >
            <div className="d-flex align-items-center text-white">
              <BookOpen size={20} className="me-2" />
              {t('Create New Class Level')}
            </div>
          </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="createName">{t('Name')} <span className="text-danger">*</span></Label>
                  <Input
                    id="createName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('Enter class level name')}
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label for="createBio">{t('Bio')}</Label>
                  <Input
                    id="createBio"
                    type="textarea"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder={t('Enter class level description')}
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <FileUploaderRestrictions
                    files={files}
                    setFiles={setFiles}
                    accept={{
                      'image/png': ['.png'],
                      'image/jpg': ['.jpg'],
                      'image/jpeg': ['.jpeg']
                    }}
                    title="Upload Image Icon"
                  />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setCreateModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={handleSubmitCreate}
            disabled={!formData.name || isCreating}
          >
            {isCreating ? t('Creating...') : t('Create')}
          </Button>
        </ModalFooter>
      </Modal>

        <Modal isOpen={editModal} toggle={() => setEditModal(false)}>
          <ModalHeader 
            toggle={() => setEditModal(false)}
            className="bg-primary text-white"
          >
            <div className="d-flex align-items-center text-white">
              <Edit size={20} className="me-2" />
              {t('Edit Class Level')}
            </div>
          </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="editName">{t('Name')} *</Label>
                  <Input
                    id="editName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('Enter class level name')}
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label for="editBio">{t('Bio')}</Label>
                  <Input
                    id="editBio"
                    type="textarea"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder={t('Enter class level description')}
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>{t('Current Icon')}</Label>
                  {formData.currentMediaUrl ? (
                    <div className="mb-3">
                      <img 
                        src={formData.currentMediaUrl} 
                        alt="Current icon" 
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          border: '2px solid #e9ecef'
                        }} 
                      />
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p className="text-muted">{t('No icon uploaded')}</p>
                    </div>
                  )}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>{t('Update Icon')}</Label>
                  <FileUploaderRestrictions
                    files={files}
                    setFiles={setFiles}
                    accept={{
                      'image/png': ['.png'],
                      'image/jpg': ['.jpg'],
                      'image/jpeg': ['.jpeg']
                    }}
                    title="Upload New Image Icon"
                  />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setEditModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={handleSubmitUpdate}
            disabled={!formData.name || isUpdating || isLoadingMediaUpdate || isLoadingMediaUpload}
          >
            {isUpdating || isLoadingMediaUpdate || isLoadingMediaUpload ? t('Updating...') : t('Update')}
          </Button>
        </ModalFooter>
      </Modal>

        <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
          <ModalHeader 
            toggle={() => setDeleteModal(false)}
            className="bg-danger text-white"
          >
            <div className="d-flex align-items-center text-white">
              <Trash2 size={20} className="me-2" />
              {t('Confirm Delete')}
            </div>
          </ModalHeader>
        <ModalBody>
          <p>{t('Are you sure you want to delete this class level?')}</p>
          <p className="text-muted">{t('This action cannot be undone.')}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setDeleteModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="danger" 
            onClick={handleSubmitDelete}
            disabled={isDeleting}
          >
            {isDeleting ? t('Deleting...') : t('Delete')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Status Confirmation Modal */}
      <Modal isOpen={statusConfirmModal} toggle={() => setStatusConfirmModal(false)}>
        <ModalHeader 
          toggle={() => setStatusConfirmModal(false)}
          className="bg-primary text-white"
        >
          <div className="d-flex align-items-center text-white">
            {selectedItem?.publish_status === 'published' ? (
              <EyeOff size={20} className="me-2" />
            ) : (
              <Eye size={20} className="me-2" />
            )}
            {selectedItem?.publish_status === 'published' ? t('Unpublish Class Level') : t('Publish Class Level')}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            <p className="mb-3">
              {selectedItem?.publish_status === 'published' ? t('Are you sure you want to unpublish this class level?') : t('Are you sure you want to publish this class level?')}
            </p>
            <p className="text-muted small">
              {selectedItem?.publish_status === 'published' ? t('This will make the class level unavailable to users.') : t('This will make the class level available to users.')}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setStatusConfirmModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color='primary'
            onClick={handleConfirmStatusChange}
            disabled={isLoadingStatusChange}
          >
            {isLoadingStatusChange ? t('Updating...') : (
              selectedItem?.publish_status === 'published' ? t('إلغاء النشر') : t('نشر')
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Teacher Attachment Modal */}
      <TeacherAttachment
        isOpen={teacherModal}
        toggle={() => setTeacherModal(false)}
        contextId={selectedItem?.id}
        contextType="C_Level"
        contextName={selectedItem?.name}
        levelTeachers={selectedItem?.teachers}
        eLevelContext={eLevelContext}
        onRefresh={onRefresh}
      />
      
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
                <Edit size={14} className="me-2" />
                {t('Edit')}
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
                  handleTeacherAttachment(item)
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
                <Users size={14} className="me-2" />
                {t('Manage Teachers')}
              </div>
              
              <div 
                className="dropdown-item"
                onClick={() => {
                  handleAddStory(item)
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
                <FileText size={14} className="me-2" />
                {t('Add Story')}
              </div>
              
              <div 
                className="dropdown-item"
                onClick={() => {
                  handleAddBanner(item)
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
                <Trello size={14} className="me-2" />
                {t('Add Banner')}
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

export default CLevelCard
