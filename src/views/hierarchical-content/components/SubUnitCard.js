import { useState, useEffect } from 'react'
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
  Plus,
  Settings,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  CreditCard,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  List
} from 'react-feather'
import FileUploaderRestrictions from '../../components/uplaoder/FileUploaderRestrictions'
import {
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useChangeStatusMutation,
  useChangeTypeMutation,
  useChangePriorityMutation
} from '../../../redux/rtkQuery/hierarchical/sub-units'
import { useUpdateMutation as useUpdateMediaMutation } from '../../../redux/rtkQuery/media'
import ErrorAlert from '../../components/handleStatusCode/error'

const SubUnitCard = ({ data, selectedPath, onNodeClick, onRefresh }) => {
  const { t } = useTranslation()
  const [dropdownOpen, setDropdownOpen] = useState({})
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [priceModal, setPriceModal] = useState(false)
  const [statusConfirmModal, setStatusConfirmModal] = useState(false)
  const [priorityModal, setPriorityModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [priceInput, setPriceInput] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    image: null,
    currentMediaUrl: null,
    currentVideoUrl: null
  })
  const [files, setFiles] = useState([])
  const [videoFiles, setVideoFiles] = useState([])
  const [priorityList, setPriorityList] = useState([])

  // API hooks
  const [createSubUnit, { isLoading: isCreating }] = useCreateMutation()
  const [updateSubUnit, { isLoading: isUpdating }] = useUpdateMutation()
  const [deleteSubUnit, { isLoading: isDeleting }] = useDeleteMutation()
  const [changeStatus, { isLoading: isChangingStatus }] = useChangeStatusMutation()
  const [changeType, { isLoading: isChangingType }] = useChangeTypeMutation()
  const [changePriority, { isLoading: isChangingPriority }] = useChangePriorityMutation()
  const [updateMedia, { isLoading: isLoadingMediaUpdate }] = useUpdateMediaMutation()

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

  const formatPrice = (value) => {
    if (!value) return ''
    const numericValue = value.toString().replace(/,/g, '')
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const parsePrice = (value) => {
    if (!value) return ''
    return value.replace(/,/g, '')
  }

  const handlePriceInputChange = (e) => {
    const rawValue = e.target.value
    if (rawValue === '' || /^[\d,.]*$/.test(rawValue)) {
      const formattedValue = formatPrice(rawValue)
      setPriceInput(formattedValue)
    }
  }


  const handleCreate = () => {
    setFormData({ name: '', bio: '', image: null, currentMediaUrl: null, currentVideoUrl: null })
    setFiles([])
    setVideoFiles([])
    setCreateModal(true)
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setFormData({
      name: item.name || '',
      bio: item.bio || '',
      image: null,
      currentMediaUrl: item.media?.url,
      currentVideoUrl: item.video?.url
    })
    setFiles([])
    setVideoFiles([])
    setEditModal(true)
  }

  const handleDelete = (item) => {
    setSelectedItem(item)
    setDeleteModal(true)
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
        body: newStatus === 'published' ? t('Sub Unit published successfully') : t('Sub Unit unpublished successfully'),
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

  const handlePriorityManagement = () => {
    if (!Array.isArray(data) || data.length === 0) return

    const subUnitsWithIndex = data.map((subUnit, index) => ({
      subUnit,
      originalIndex: index
    }))

    const sortedSubUnits = subUnitsWithIndex
      .slice()
      .sort((a, b) => {
        const priorityA = typeof a.subUnit?.priority === 'number' ? a.subUnit.priority : Number.MAX_SAFE_INTEGER
        const priorityB = typeof b.subUnit?.priority === 'number' ? b.subUnit.priority : Number.MAX_SAFE_INTEGER

        if (priorityA === priorityB) {
          return a.originalIndex - b.originalIndex
        }

        return priorityA - priorityB
      })
      .map(({ subUnit }) => subUnit)

    setPriorityList(sortedSubUnits)
    setPriorityModal(true)
  }

  const handlePriorityModalClose = () => {
    setPriorityModal(false)
    setPriorityList([])
  }

  const moveSubUnitUp = (index) => {
    if (index <= 0) return

    setPriorityList(prev => {
      const newList = [...prev]
      const temp = newList[index]
      newList[index] = newList[index - 1]
      newList[index - 1] = temp
      return newList
    })
  }

  const moveSubUnitDown = (index) => {
    setPriorityList(prev => {
      if (index < 0 || index >= prev.length - 1) return prev
      const newList = [...prev]
      const temp = newList[index]
      newList[index] = newList[index + 1]
      newList[index + 1] = temp
      return newList
    })
  }

  const handleSavePriority = async () => {
    try {
      if (!priorityList.length) {
        handlePriorityModalClose()
        return
      }

      const formDataPayload = new FormData()
      priorityList.forEach((subUnit, index) => {
        if (!subUnit?.id) return
        formDataPayload.append(`context[${subUnit.id}]`, index + 1)
      })

      await changePriority({ body: formDataPayload }).unwrap()
      handlePriorityModalClose()
      onRefresh?.()
    } catch (error) {
      console.error('Error updating sub unit priority:', error)
      const errorMessage = error?.data?.message || error?.message || t('An error occurred while updating priority')
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

  const handleSubmitCreate = async () => {
    try {
      const unitId = selectedPath[4]?.id
      if (!unitId) {
        console.error('No unit selected')
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('e_level_id', selectedPath[0]?.id)
      formDataToSend.append('c_level_id', selectedPath[1]?.id)
      formDataToSend.append('course_id', selectedPath[2]?.id)
      formDataToSend.append('subject_id', selectedPath[3]?.id)
      formDataToSend.append('unit_id', unitId)
      
      if (formData.bio && formData.bio.trim() !== '') {
        formDataToSend.append('bio', formData.bio)
      }
      
      if (files.length > 0) {
        formDataToSend.append('image', files[0])
      }

      await createSubUnit({ body: formDataToSend }).unwrap()
      setCreateModal(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error creating sub-unit:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to create sub unit')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitEdit = async () => {
    try {
      const formDataToSend = new URLSearchParams()
      formDataToSend.append('name', formData.name)
      
      if (formData.bio && formData.bio.trim() !== '') {
        formDataToSend.append('bio', formData.bio)
      }
      
      await updateSubUnit({ body: formDataToSend, id: selectedItem.id }).unwrap()

      if (files.length > 0 && selectedItem.media?.id) {
        const mediaFormData = new FormData()
        mediaFormData.append('images[]', files[0])
        mediaFormData.append('_method', 'PUT')
        
        await updateMedia({ 
          body: mediaFormData, 
          id: selectedItem.media.id 
        }).unwrap()
      }

      if (videoFiles.length > 0) {
        const videoFormData = new FormData()
        videoFormData.append('_method', 'PUT')
        videoFormData.append('context_id', selectedItem.id)
        videoFormData.append('context_type', 'Sub_Unit')
        
        videoFiles.forEach((file) => {
          videoFormData.append('videos[]', file)
        })
        
        await updateMedia({ body: videoFormData, id: selectedItem.media.id }).unwrap()
      }

      setEditModal(false)
      setSelectedItem(null)
      setFormData({ name: '', bio: '', image: null, currentMediaUrl: null, currentVideoUrl: null })
      setFiles([])
      setVideoFiles([])
      onRefresh?.()

      ErrorAlert({
        title: t('Success'),
        body: t('Sub unit updated successfully'),
        button: t('OK')
      })
    } catch (error) {
      console.error('Error updating sub-unit:', error)
      const errorMessage = error?.data?.message || error?.message || t('An error occurred while updating sub unit')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleSubmitDelete = async () => {
    try {
      await deleteSubUnit({ id: selectedItem.id }).unwrap()
      setDeleteModal(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting sub-unit:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to delete sub unit')
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

  const handleFileChange = (files) => {
    setFiles(files)
  }

  return (
    <div className="hierarchical-content">
      <div className="content-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-1">{t('Sub Units')}</h4>
            <p className="text-muted mb-0">
              {t('Manage sub units for')} {selectedPath[4]?.name || t('selected unit')}
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button
              color="warning"
              outline
              onClick={handlePriorityManagement}
              className="d-flex align-items-center"
              disabled={!data?.length}
            >
              <List size={16} className="me-1" />
              {t('Manage Priority')}
            </Button>
            <Button color="primary" onClick={handleCreate} className="d-flex align-items-center">
              <Plus size={16} />
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
                onClick={() => onNodeClick(item, [...selectedPath, item])}
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
                        {item?.priority !== undefined && item?.priority !== null && (
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
                        )}
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
                    {item.children && item.children.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">
                          {item.children.length} {t('lessons')}
                        </small>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModal} toggle={() => setCreateModal(false)} size="md">
        <ModalHeader 
          toggle={() => setCreateModal(false)}
          className="bg-primary text-white"
        >
          <div className="d-flex align-items-center text-white">
            <Plus size={20} className="me-2" />
            {t('Create New Sub Unit')}
          </div>
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label for="name">{t('Sub Unit Name')}</Label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('Enter sub unit name')}
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label for="bio">{t('Description')}</Label>
              <Input
                type="textarea"
                name="bio"
                id="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder={t('Enter sub unit description')}
                rows="3"
              />
            </FormGroup>
            <FormGroup>
              <Label>{t('Image')}</Label>
              <FileUploaderRestrictions
                files={files}
                setFiles={handleFileChange}
                accept={{
                  'image/png': ['.png'],
                  'image/jpg': ['.jpg'],
                  'image/jpeg': ['.jpeg']
                }}
                maxFiles={1}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setCreateModal(false)}>
            <X size={14} className="me-1" />
            {t('Cancel')}
          </Button>
          <Button color="primary" onClick={handleSubmitCreate} disabled={isCreating}>
            <Save size={14} className="me-1" />
            {isCreating ? t('Creating...') : t('Create Sub Unit')}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={editModal} toggle={() => setEditModal(false)} size="lg">
        <ModalHeader 
          toggle={() => setEditModal(false)}
          className="bg-primary text-white"
        >
          <div className="d-flex align-items-center text-white">
            <Edit size={20} className="me-2" />
            {t('Edit Sub Unit')}
          </div>
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="edit-name">{t('Sub Unit Name')}</Label>
                  <Input
                    type="text"
                    name="name"
                    id="edit-name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('Enter sub unit name')}
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label for="edit-bio">{t('Description')}</Label>
              <Input
                type="textarea"
                name="bio"
                id="edit-bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder={t('Enter sub unit description')}
                rows="3"
              />
            </FormGroup>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>{t('Current Icon')}</Label>
                  {formData.currentMediaUrl && (
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
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>{t('Update Icon')}</Label>
                  <FileUploaderRestrictions
                    files={files}
                    setFiles={handleFileChange}
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
            <X size={14} className="me-1" />
            {t('Cancel')}
          </Button>
          <Button color="primary" onClick={handleSubmitEdit} disabled={isUpdating || isLoadingMediaUpdate}>
            <Save size={14} className="me-1" />
            {isUpdating || isLoadingMediaUpdate ? t('Updating...') : t('Update Sub Unit')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>
          {t('Delete Sub Unit')}
        </ModalHeader>
        <ModalBody>
          <p>{t('Are you sure you want to delete this sub unit? This action cannot be undone.')}</p>
          {selectedItem && (
            <div className="alert alert-warning">
              <strong>{t('Sub Unit')}:</strong> {selectedItem.name}
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
            {isDeleting ? t('Deleting...') : t('Delete Sub Unit')}
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
            {selectedItem?.publish_status === 'published' ? t('Are you sure you want to unpublish this sub unit?') : t('Are you sure you want to publish this sub unit?')}
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

      {/* Priority Management Modal */}
      <Modal isOpen={priorityModal} toggle={handlePriorityModalClose} size="lg">
        <ModalHeader toggle={handlePriorityModalClose}>
          <div className="d-flex align-items-center">
            <List size={20} className="me-2" />
            {t('Manage Sub Unit Priority')}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <p className="text-muted mb-0">
              {t('Drag sub units to reorder or use the up/down buttons. Higher priority sub units appear first.')}
            </p>
          </div>
          <div className="priority-list">
            {priorityList.map((subUnit, index) => (
              <div
                key={subUnit.id}
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
                  e.currentTarget.style.opacity = '0.5'
                }}
                onDragEnd={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.style.backgroundColor = '#e9ecef'
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa'
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.style.backgroundColor = '#f8f9fa'
                  const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
                  const dropIndex = index

                  if (Number.isNaN(draggedIndex) || draggedIndex === dropIndex) return

                  setPriorityList(prev => {
                    const newList = [...prev]
                    const [draggedItem] = newList.splice(draggedIndex, 1)
                    newList.splice(dropIndex, 0, draggedItem)
                    return newList
                  })
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
                    <h6 className="mb-0" style={{ fontSize: '0.9rem' }}>{subUnit.name}</h6>
                    {subUnit.priority !== undefined && subUnit.priority !== null && (
                      <small className="text-muted">
                        {t('Current priority')}: {subUnit.priority}
                      </small>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-1">
                  <Button
                    color="outline-primary"
                    size="sm"
                    onClick={() => moveSubUnitUp(index)}
                    disabled={index === 0}
                    className="p-1"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <ChevronUp size={14} />
                  </Button>
                  <Button
                    color="outline-primary"
                    size="sm"
                    onClick={() => moveSubUnitDown(index)}
                    disabled={index === priorityList.length - 1}
                    className="p-1"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <ChevronDown size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {!priorityList.length && (
              <div className="text-center text-muted py-4 border rounded">
                {t('No sub units available to reorder.')}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={handlePriorityModalClose}>
            <X size={14} className="me-1" />
            {t('Cancel')}
          </Button>
          <Button
            color="primary"
            onClick={handleSavePriority}
            disabled={isChangingPriority || !priorityList.length}
          >
            <Save size={14} className="me-1" />
            {isChangingPriority ? t('Saving...') : t('Save Priority Order')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Price Input Modal */}
      <Modal isOpen={priceModal} toggle={() => setPriceModal(false)}>
        <ModalHeader 
          toggle={() => setPriceModal(false)}
          className="bg-primary text-white"
        >
          <div className="d-flex align-items-center text-white">
            <CreditCard size={20} className="me-2" />
            {t('Set Sub Unit Price')}
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
                placeholder={t('Enter sub unit price')}
                className="text-center"
                style={{ fontSize: '18px', fontWeight: 'bold' }}
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

export default SubUnitCard
