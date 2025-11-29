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
  DollarSign,
  CreditCard,
  Users,
  Gift
} from 'react-feather'
import FileUploaderRestrictions from '../../components/uplaoder/FileUploaderRestrictions'
import TeacherAttachment from './TeacherAttachment'
import ContextCoupon from './ContextCoupon'
import {
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useChangeStatusMutation,
  useChangeTypeMutation
} from '../../../redux/rtkQuery/hierarchical/course'
import { useUpdateMutation as useUpdateMediaMutation, useUploadMutation as useUploadMediaMutation } from '../../../redux/rtkQuery/media'
import ErrorAlert from '../../components/handleStatusCode/error'

const CourseCard = ({ data, selectedPath, onNodeClick, onRefresh }) => {
  const { t } = useTranslation()
  const [dropdownOpen, setDropdownOpen] = useState({})
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [priceModal, setPriceModal] = useState(false)
  const [teacherModal, setTeacherModal] = useState(false)
  const [couponModal, setCouponModal] = useState(false)
  const [statusConfirmModal, setStatusConfirmModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [priceInput, setPriceInput] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    image: null,
    icon: null,
    access_type: 'free',
    price: '',
    currentMediaUrl: null,
    currentIconUrl: null
  })
  const [files, setFiles] = useState([])
  const [iconFiles, setIconFiles] = useState([])
  const [createCourse, { isLoading: isCreating }] = useCreateMutation()
  const [updateCourse, { isLoading: isUpdating }] = useUpdateMutation()
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteMutation()
  const [changeStatus, { isLoading: isChangingStatus }] = useChangeStatusMutation()
  const [changeType, {isLoading: isChangingType}] = useChangeTypeMutation()
  const [updateMedia, { isLoading: isLoadingMediaUpdate }] = useUpdateMediaMutation()
  const [uploadMedia, { isLoading: isUploadingMedia }] = useUploadMediaMutation()

  const toggleDropdown = (id) => {
    setDropdownOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
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
  const formatPrice = (value) => {
    if (!value) return ''
    let numericValue = value.replace(/[^\d.]/g, '')
        const decimalIndex = numericValue.indexOf('.')
    if (decimalIndex !== -1) {
      numericValue = numericValue.substring(0, decimalIndex + 1) + 
                    numericValue.substring(decimalIndex + 1).replace(/\./g, '')
    }
        const parts = numericValue.split('.')
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    return parts.join('.')
  }

  const parsePrice = (value) => {
    if (!value) return ''
    return value.replace(/,/g, '')
  }

  const handlePriceChange = (e) => {
    const rawValue = e.target.value
    if (rawValue === '' || /^[\d,.]*$/.test(rawValue)) {
      const formattedValue = formatPrice(rawValue)
      setFormData(prev => ({ ...prev, price: formattedValue }))
    }
  }

  const handlePriceInputChange = (e) => {
    const rawValue = e.target.value
    if (rawValue === '' || /^[\d,.]*$/.test(rawValue)) {
      const formattedValue = formatPrice(rawValue)
      setPriceInput(formattedValue)
    }
  }

  const handleCreate = () => {
    setFormData({ name: '', bio: '', image: null, icon: null, access_type: 'free', price: '', currentMediaUrl: null, currentIconUrl: null })
    setFiles([])
    setIconFiles([])
    setCreateModal(true)
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setFormData({
      name: item.name || '',
      bio: item.bio || '',
      image: null,
      icon: null,
      access_type: item.access_type || 'free',
      price: item.price ? formatPrice(item.price.toString()) : '',
      currentMediaUrl: item.media?.url,
      currentIconUrl: item.icon?.url
    })
    setFiles([])
    setIconFiles([])
    setEditModal(true)
  }

  const handleDelete = (item) => {
    setSelectedItem(item)
    setDeleteModal(true)
  }

  const handleTeacherAttachment = (item) => {
    // Avoid reopening the modal for the same item to prevent repeated fetching
    if (teacherModal && selectedItem?.id === item.id) return
    setSelectedItem(item)
    setTeacherModal(true)
  }

  // Memoize eLevelContext to prevent unnecessary re-renders
  const eLevelContext = useMemo(() => {
    if (selectedPath && selectedPath.length > 1 && selectedPath[1]?.id) {
      return {
        contextId: selectedPath[1].id,
        contextType: 'C_Level'
      }
    }
    return null
  }, [selectedPath])

  const handleCreateCoupon = (item) => {
    setSelectedItem(item)
    setCouponModal(true)
  }

  const handleChangeStatus = (item) => {
    setSelectedItem(item)
    setStatusConfirmModal(true)
  }

  const handleConfirmStatusChange = async () => {
    if (!selectedItem) return
    
    try {
      const newStatus = selectedItem.publish_status === 'published' ? 'draft' : 'published'
      await changeStatus({ id: selectedItem.id, status: newStatus }).unwrap()
      onRefresh?.()
      setStatusConfirmModal(false)
      setSelectedItem(null)
      
      ErrorAlert({
        title: t('Success'),
        body: newStatus === 'published' ? t('Course published successfully') : t('Course unpublished successfully'),
        button: t('OK')
      })
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

  const handleConfirmChangeType = async (item, price) => {
    try {
      await changeType({ id: item.id, price }).unwrap()
      setPriceModal(false)
      setSelectedItem(null)
      setPriceInput('')
      onRefresh?.()
    } catch (error) {
      console.error('Error changing access type:', error)
      const errorMessage = error?.data?.message || error?.message || t('An error occurred while changing access type')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleChangeAccessType = (item) => {
    setSelectedItem(item)
    if (item.access_type === 'free') {
      setPriceInput('')
      setPriceModal(true)
    } else {
      handleConfirmChangeType(item, null)
    }
  }

  const handleSubmitCreate = async () => {
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('e_level_id', selectedPath[0].id)
      formDataToSend.append('c_level_id', selectedPath[1].id)
      
      if (formData.bio && formData.bio.trim() !== '') {
        formDataToSend.append('bio', formData.bio)
      }
      
      if (files.length > 0) {
        formDataToSend.append('image', files[0])
      }
      
      if (iconFiles.length > 0) {
        formDataToSend.append('icon', iconFiles[0])
      }
      
      formDataToSend.append('access_type', formData.access_type)
      
      if (formData.access_type === 'paid' && formData.price) {
        formDataToSend.append('price', parsePrice(formData.price))
      }

      await createCourse({ body: formDataToSend }).unwrap()
      setCreateModal(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error creating course:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to create course')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitUpdate = async () => {
    try {
      const formDataToSend = new URLSearchParams()
      formDataToSend.append('name', formData.name)
      
      if (formData.bio && formData.bio.trim() !== '') {
        formDataToSend.append('bio', formData.bio)
      }
      
      await updateCourse({ body: formDataToSend, id: selectedItem.id }).unwrap()
      if (files.length > 0) {
        if (selectedItem.media?.id) {
          // Update existing image
          const mediaFormData = new FormData()
          mediaFormData.append('images[]', files[0])
          mediaFormData.append('_method', 'PUT')
          
          await updateMedia({ 
            body: mediaFormData, 
            id: selectedItem.media.id 
          }).unwrap()
        } else {
          // Upload new image with Course context
          const mediaFormData = new FormData()
          mediaFormData.append('images[]', files[0])
          mediaFormData.append('context_type', 'Course')
          mediaFormData.append('context_id', selectedItem.id)
          
          await uploadMedia({ 
            body: mediaFormData
          }).unwrap()
        }
      }
      
      if (iconFiles.length > 0) {
        if (selectedItem.icon?.id) {
          // Update existing icon
          const iconFormData = new FormData()
          iconFormData.append('images[]', iconFiles[0])
          iconFormData.append('_method', 'PUT')
          
          await updateMedia({ 
            body: iconFormData, 
            id: selectedItem.icon.id 
          }).unwrap()
        } else {
          // Upload new icon with Course_Icon context
          const iconFormData = new FormData()
          iconFormData.append('images[]', iconFiles[0])
          iconFormData.append('context_type', 'Course_Icon')
          iconFormData.append('context_id', selectedItem.id)
          
          await uploadMedia({ 
            body: iconFormData
          }).unwrap()
        }
      }

      setEditModal(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error updating course:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to update course')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitDelete = async () => {
    try {
      await deleteCourse({ id: selectedItem.id }).unwrap()
      setDeleteModal(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting course:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to delete course')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const renderCourseCard = (item) => {
    const isSelected = selectedPath.length > 2 && 
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
              {item.icon?.url ? (
                <img 
                  src={item.icon.url} 
                  alt={item.name}
                  className="m-1"
                  style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                />
              ) : item.media?.url ? (
                <img 
                  src={item.media.url} 
                  alt={item.name}
                  className="m-1"
                  style={{ width: '18px', height: '18px', objectFit: 'cover', borderRadius: '4px' }}
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
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              {item.subjects && item.subjects.length > 0 && (
                <small className="text-muted">
                  <strong>{item.subjects.length}</strong> {t('Subjects')}
                </small>
              )}
              <small className="text-muted">
                {item.access_type === 'paid' ? (
                  <span className="text-warning">
                    <strong>{t('Paid')}</strong> {item.price && `- ${formatPrice(item.price.toString())}`}
                  </span>
                ) : (
                  <span className="text-success">
                    <strong>{t('Free')}</strong>
                  </span>
                )}
              </small>
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
          <h4 className="mb-1">{t('Courses')}</h4>
          <p className="text-muted mb-0">{t('Manage your courses')}</p>
        </div>
        <Button 
          color="primary"
          onClick={handleCreate}
          className="d-flex align-items-center"
        >
            <Plus size={15} />
        </Button>
      </div>
      <Row>
        {data.map((item) => (
          <Col md={6} key={item.id} className="mb-3">
            {renderCourseCard(item)}
          </Col>
        ))}
      </Row>

      <Modal isOpen={createModal} toggle={() => setCreateModal(false)}>
          <ModalHeader 
            toggle={() => setCreateModal(false)}
            className="bg-primary text-white"
          >
            <div className="d-flex align-items-center text-white">
              <BookOpen size={20} className="me-2" />
              {t('Create New Course')}
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
                    placeholder={t('Enter course name')}
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
                    placeholder={t('Enter course description')}
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label for="createAccessType">{t('Access Type')} <span className="text-danger">*</span></Label>
                  <Input
                    id="createAccessType"
                    type="select"
                    value={formData.access_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, access_type: e.target.value }))}
                  >
                    <option value="free">{t('Free')}</option>
                    <option value="paid">{t('Paid')}</option>
                  </Input>
                </FormGroup>
              </Col>
              {formData.access_type === 'paid' && (
                <Col md={12}>
                  <FormGroup>
                    <Label for="createPrice">{t('Price')} <span className="text-danger">*</span></Label>
                    <Input
                      id="createPrice"
                      type="text"
                      value={formData.price}
                      onChange={handlePriceChange}
                      placeholder={t('Enter course price')}
                    />
                  </FormGroup>
                </Col>
              )}
              <Col md={12}>
                <FormGroup>
                  <Label>{t('Course Image')}</Label>
                  <FileUploaderRestrictions
                    files={files}
                    setFiles={setFiles}
                    accept={{
                      'image/png': ['.png'],
                      'image/jpg': ['.jpg'],
                      'image/jpeg': ['.jpeg']
                    }}
                    title="Upload Course Image"
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>{t('Course Icon (SVG)')}</Label>
                  <FileUploaderRestrictions
                    files={iconFiles}
                    setFiles={setIconFiles}
                    accept={{
                      'image/svg+xml': ['.svg']
                    }}
                    title="Upload SVG Icon"
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
              {t('Edit Course')}
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
                    placeholder={t('Enter course name')}
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
                    placeholder={t('Enter course description')}
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>{t('Current Image')}</Label>
                  {formData.currentMediaUrl && (
                    <div className="mb-3">
                      <img 
                        src={formData.currentMediaUrl} 
                        alt="Current image" 
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #e9ecef'
                        }} 
                      />
                    </div>
                  )}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>{t('Update Image')}</Label>
                  <FileUploaderRestrictions
                    files={files}
                    setFiles={setFiles}
                    accept={{
                      'image/png': ['.png'],
                      'image/jpg': ['.jpg'],
                      'image/jpeg': ['.jpeg']
                    }}
                    title="Upload New Course Image"
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>{t('Current SVG Icon')}</Label>
                  {formData.currentIconUrl && (
                    <div className="mb-3">
                      <img 
                        src={formData.currentIconUrl} 
                        alt="Current SVG Icon" 
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '2px solid #e9ecef',
                          backgroundColor: '#f8f9fa'
                        }} 
                      />
                    </div>
                  )}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>{t('Update SVG Icon')}</Label>
                  <FileUploaderRestrictions
                    files={iconFiles}
                    setFiles={setIconFiles}
                    accept={{
                      'image/svg+xml': ['.svg']
                    }}
                    title="Upload New SVG Icon"
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
            disabled={!formData.name || isUpdating || isLoadingMediaUpdate || isUploadingMedia}
          >
            {isUpdating || isLoadingMediaUpdate || isUploadingMedia ? t('Updating...') : t('Update')}
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
          <p>{t('Are you sure you want to delete this course?')}</p>
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

      <Modal isOpen={priceModal} toggle={() => setPriceModal(false)}>
        <ModalHeader 
          toggle={() => setPriceModal(false)}
          className="bg-primary text-white"
        >
          <div className="d-flex align-items-center text-white">
            <CreditCard size={20} className="me-2" />
            {t('Set Course Price')}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            <FormGroup>
              <Label for="priceInput">{t('Price')} <span className="text-danger">*</span></Label>
              <Input
                id="priceInput"
                type="text"
                value={priceInput}
                onChange={handlePriceInputChange}
              />
            </FormGroup>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setPriceModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={() => handleConfirmChangeType(selectedItem, parsePrice(priceInput))}
            disabled={!priceInput || parsePrice(priceInput) === '' || isChangingType}
          >
            {isChangingType ? t('Setting...') : t('Set Price')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Status Confirmation Modal */}
      <Modal isOpen={statusConfirmModal} toggle={() => setStatusConfirmModal(false)}>
        <ModalHeader 
          toggle={() => setStatusConfirmModal(false)}
          className={selectedItem?.publish_status === 'published' ? 'bg-primary text-white' : 'bg-primary text-white'}
        >
          <div className="d-flex align-items-center text-white">
            {selectedItem?.publish_status === 'published' ? (
              <EyeOff size={20} className="me-2" />
            ) : (
              <Eye size={20} className="me-2" />
            )}
            {selectedItem?.publish_status === 'published' ? t('Confirm Unpublish') : t('Confirm Publish')}
          </div>
        </ModalHeader>
        <ModalBody>
          <p>
            {selectedItem?.publish_status === 'published' ? t('Are you sure you want to unpublish this course?') : t('Are you sure you want to publish this course?')}
          </p>
          <p className="text-muted">
            <strong>{selectedItem?.name}</strong>
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setStatusConfirmModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color={'primary'}
            onClick={handleConfirmStatusChange}
            disabled={isChangingStatus}
          >
            {isChangingStatus ? t('Processing...') : selectedItem?.publish_status === 'published' ? t('Unpublish') : t('Publish')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Teacher Attachment Modal */}
      <TeacherAttachment
        isOpen={teacherModal}
        toggle={() => setTeacherModal(false)}
        contextId={selectedItem?.id}
        contextType="Course"
        contextName={selectedItem?.name}
        levelTeachers={selectedItem?.teachers}
        eLevelContext={eLevelContext}
        onRefresh={onRefresh}
      />

      {/* Context Coupon Modal */}
      <ContextCoupon
        isOpen={couponModal}
        toggle={() => setCouponModal(false)}
        contextId={selectedItem?.id}
        contextType="Course"
        contextName={selectedItem?.name}
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
                  handleChangeAccessType(item)
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
                {item.access_type === 'paid' ? (
                  <>
                    <DollarSign size={14} className="me-2" />
                    {t('Make Free')}
                  </>
                ) : (
                  <>
                    <CreditCard size={14} className="me-2" />
                    {t('Make Paid')}
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
                  handleCreateCoupon(item)
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
                <Gift size={14} className="me-2" />
                {t('Create Coupon')}
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

export default CourseCard
