import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  BookOpen, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Settings,
  Plus,
  Users
} from 'react-feather'
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
import { useCreateMutation, useUpdateMutation, useDeleteMutation, useChangeStatusMutation } from '../../../redux/rtkQuery/hierarchical/e-level'
import { useUpdateMutation as useUpdateMediaMutation, useUploadMutation } from '../../../redux/rtkQuery/media'
import { useCountriesQuery } from '../../../redux/rtkQuery/admin'
import Select from 'react-select'
import '@styles/react/libs/react-select/_react-select.scss'
import ErrorAlert from '../../components/handleStatusCode/error'
import FileUploaderRestrictions from '../../components/uplaoder/FileUploaderRestrictions'
import TeacherAttachment from './TeacherAttachment'
import defaultImage from '../../../assets/images/base/logo.png'

const ELevelCard = ({ 
  data, 
  selectedPath, 
  onNodeClick,
  onRefresh
}) => {
  const { t } = useTranslation()
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
    contry_id: '',
    image: null,
    currentMediaUrl: null
  })
  const [files, setFiles] = useState([])
  const { data: countriesData, isLoading: isLoadingCountries } = useCountriesQuery()
  const countries = countriesData?.data || []
  const countryOptions = [
    { value: null, label: t('مشترك'), flag: null },
    ...countries.map(country => ({
      value: country.id,
      label: country.name,
      flag: country?.media?.url || country?.image?.url || null
    }))
  ]
  
  // Helper function to get country by id
  const getCountryById = (countryId) => {
    return countries.find(country => country.id === countryId)
  }
  
  // Custom Option component for react-select with flag
  const CustomOption = ({ innerProps, label, data }) => (
    <div
      {...innerProps}
      style={{
        padding: '8px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {data.flag ? (
        <img
          src={data.flag}
          alt={label}
          style={{
            width: '20px',
            height: '20px',
            objectFit: 'cover',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}
          onError={(e) => {
            e.target.src = defaultImage
          }}
        />
      ) : null}
      <span>{label}</span>
    </div>
  )
  
  // Custom SingleValue component for react-select with flag
  const CustomSingleValue = ({ data }) => {
    if (!data || data.value === null) {
      return <span>{t('مشترك')}</span>
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {data.flag ? (
          <img
            src={data.flag}
            alt={data.label}
            style={{
              width: '20px',
              height: '20px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}
            onError={(e) => {
              e.target.src = defaultImage
            }}
          />
        ) : null}
        <span>{data.label}</span>
      </div>
    )
  }

  // API hooks
  const [createELevel, { isLoading: isLoadingCreate }] = useCreateMutation()
  const [updateELevel, { isLoading: isLoadingUpdate }] = useUpdateMutation()
  const [deleteELevel, { isLoading: isLoadingDelete }] = useDeleteMutation()
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
    setFormData({ name: '', bio: '', contry_id: '', image: null })
    setFiles([])
    setCreateModal(true)
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setFormData({
      name: item.name || '',
      bio: item.bio || '',
      contry_id: item.contry_id || '',
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

  const handleSubmitCreate = async () => {
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      if (formData.bio && formData.bio.trim() !== '') {
        formDataToSend.append('bio', formData.bio)
      }
      if (formData.contry_id) {
        formDataToSend.append('contry_id', formData.contry_id)
      }
      if (files.length > 0) {
        formDataToSend.append('image', files[0])
      }
      
      await createELevel({ body: formDataToSend }).unwrap()
      setCreateModal(false)
      setFormData({ name: '', bio: '', contry_id: '', image: null })
      setFiles([])
      onRefresh?.()
    } catch (error) {
      console.error('Error creating e-level:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to create education level')
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
      if (formData.contry_id) {
        formDataToSend.append('contry_id', formData.contry_id)
      }
      
      await updateELevel({ body: formDataToSend, id: selectedItem.id }).unwrap()
      if (files.length > 0) {
        const mediaFormData = new FormData()
        mediaFormData.append('images[]', files[0])
        
        if (selectedItem.media?.id) {
          mediaFormData.append('_method', 'PUT')
          await updateMedia({ 
            body: mediaFormData, 
            id: selectedItem.media.id 
          }).unwrap()
        } else {
          mediaFormData.append('context_type', 'E_Level')
          mediaFormData.append('context_id', selectedItem.id)
          await uploadMedia({ 
            body: mediaFormData
          }).unwrap()
        }
      }
      
      setEditModal(false)
      setSelectedItem(null)
      setFormData({ name: '', bio: '', contry_id: '', image: null, currentMediaUrl: null })
      setFiles([])
      onRefresh?.()
    } catch (error) {
      console.error('Error updating e-level:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to update education level')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteELevel({ id: selectedItem.id }).unwrap()
      setDeleteModal(false)
      setSelectedItem(null)
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting e-level:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to delete education level')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
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

  const handleNodeClick = (node) => {
    const newPath = [...selectedPath, { id: node.id, name: node.name, type: node.type }]
    onNodeClick(node, newPath)
  }


  const renderELevelCard = (item) => {
    const isSelected = selectedPath.length > 0 && 
                       selectedPath[selectedPath.length - 1]?.id === item.id
    return (
      <Card 
        key={item.id} 
        className={`content-card ${isSelected ? 'selected' : ''} expandable`}
        onClick={() => handleNodeClick(item)}
        style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}
      >
        <CardBody className="p-1">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center flex-grow-1">
              {item.media?.url ? (
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
                {item.publish_status === "published" ? t('فعَّال') : t('مسودة')}
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
                    padding: '0.6rem',
                    color: '#6c757d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Settings size={18} className="text-muted" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Statistics Row */}
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              {item.c_levels && item.c_levels.length > 0 && (
                <small className="text-muted">
                  <strong>{item.c_levels.length}</strong> {t('Classes')}
                </small>
              )}
              {item.contry_id ? (
                (() => {
                  const country = getCountryById(item.contry_id)
                  return country ? (
                    <div className="d-flex align-items-center gap-1">
                      {country?.media?.url || country?.image?.url ? (
                        <img
                          src={country.media?.url || country.image?.url}
                          alt={country.name}
                          style={{
                            width: '16px',
                            height: '16px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #e9ecef'
                          }}
                          onError={(e) => {
                            e.target.src = defaultImage
                          }}
                        />
                      ) : null}
                      <small className="text-muted">{country.name}</small>
                    </div>
                  ) : null
                })()
              ) : (
                <small className="text-muted">{t('مشترك')}</small>
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
    <div className="wizard-content" style={{ overflow: 'visible', position: 'relative' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-1">{t('Education Levels')}</h4>
          <p className="text-muted mb-0">{t('Manage your education levels')}</p>
        </div>
        <Button 
          color="primary"
          onClick={handleCreate}
          className="d-flex align-items-center"
        >
            <Plus size={15} />
        </Button>
      </div>
      {
        data.length > 0 ? (
        <Row style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}>
          {data.map((item) => (
            <Col md={4} key={item.id} className="mb-3" style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}>
              {renderELevelCard(item)}
            </Col>
          ))}
        </Row>
        ) : (
          <div className="text-center py-5">
            <p className="text-muted">{t('No education levels available')}</p>
          </div>
        )
      }
      <Modal isOpen={createModal} toggle={() => setCreateModal(false)}>
          <ModalHeader 
            toggle={() => setCreateModal(false)}
            className="bg-primary text-white"
          >
            <div className="d-flex align-items-center text-white">
              <BookOpen size={20} className="me-2" />
              {t('Create New Education Level')}
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
                    placeholder={t('Enter education level name')}
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label for="createCountry">{t('Country')}</Label>
                  <Select
                    inputId="createCountry"
                    classNamePrefix="select"
                    isClearable
                    isLoading={isLoadingCountries}
                    isDisabled={isLoadingCountries}
                    options={countryOptions}
                    value={countryOptions.find(option => option.value === (formData.contry_id || null)) || countryOptions[0]}
                    placeholder={t('Select a country (optional)')}
                    onChange={option => setFormData(prev => ({ ...prev, contry_id: option?.value || '' }))}
                    components={{
                      Option: CustomOption,
                      SingleValue: CustomSingleValue
                    }}
                  />
                  {!formData.contry_id && (
                    <small className="text-muted d-block mt-1">
                      {t('مشترك')} - {t('This education level will be shared across all countries')}
                    </small>
                  )}
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
                    placeholder={t('Enter education level description')}
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
            disabled={!formData.name || isLoadingCreate}
          >
            {isLoadingCreate ? t('Creating...') : t('Create')}
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
              {t('Edit Education Level')}
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
                    placeholder={t('Enter education level name')}
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label for="editCountry">{t('Country')}</Label>
                  <Select
                    inputId="editCountry"
                    classNamePrefix="select"
                    isClearable
                    isLoading={isLoadingCountries}
                    isDisabled={isLoadingCountries}
                    options={countryOptions}
                    value={countryOptions.find(option => option.value === (formData.contry_id || null)) || countryOptions[0]}
                    placeholder={t('Select a country (optional)')}
                    onChange={option => setFormData(prev => ({ ...prev, contry_id: option?.value || '' }))}
                    components={{
                      Option: CustomOption,
                      SingleValue: CustomSingleValue
                    }}
                  />
                  {!formData.contry_id && (
                    <small className="text-muted d-block mt-1">
                      {t('مشترك')} - {t('This education level will be shared across all countries')}
                    </small>
                  )}
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
                    placeholder={t('Enter education level description')}
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
                          width: '100px', 
                          height: '100px', 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef'
                        }}
                      />
                      <p className="text-muted small mt-2">
                        {t('Current icon')}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p className="text-muted">
                        {t('No icon currently set')}
                      </p>
                    </div>
                  )}
                  
                  <Label>{formData.currentMediaUrl ? t('Update Icon') : t('Upload Icon')}</Label>
                  <FileUploaderRestrictions
                    files={files}
                    setFiles={setFiles}
                    accept={{
                      'image/png': ['.png'],
                      'image/jpg': ['.jpg'],
                      'image/jpeg': ['.jpeg']
                    }}
                    title={t('Upload New Image Icon')}
                  />
                  <small className="text-muted">
                    {t('Select a new image to update the icon')}
                  </small>
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
            disabled={!formData.name || isLoadingUpdate || isLoadingMediaUpdate || isLoadingMediaUpload}
          >
            {(isLoadingUpdate || isLoadingMediaUpdate || isLoadingMediaUpload) ? t('Updating...') : t('Update')}
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
          <p>{t('Are you sure you want to delete this education level?')}</p>
          <p className="text-muted">{t('This action cannot be undone.')}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setDeleteModal(false)}>
            {t('Cancel')}
          </Button>
          <Button 
            color="danger" 
            onClick={handleConfirmDelete}
            disabled={isLoadingDelete}
          >
            {isLoadingDelete ? t('Deleting...') : t('Delete')}
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
              <EyeOff size={20} className="me-2" />
            ) : (
              <Eye size={20} className="me-2" />
            )}
            {selectedItem?.publish_status === 'published' ? t('Unpublish Education Level') : t('Publish Education Level')}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            <p className="mb-3">
              {selectedItem?.publish_status === 'published' ? t('Are you sure you want to unpublish this education level?') : t('Are you sure you want to publish this education level?')}
              <span className="text-muted small">
                {`(${selectedItem?.name})`}
              </span>
            </p>

            <p className="text-muted small">
              {selectedItem?.publish_status === 'published' ? t('This will make the education level unavailable to users.') : t('This will make the education level available to users.')}
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
      <TeacherAttachment
        isOpen={teacherModal}
        toggle={() => setTeacherModal(false)}
        contextId={selectedItem?.id}
        contextType="E_Level"
        contextName={selectedItem?.name}
        levelTeachers={selectedItem?.teachers}
        onRefresh={onRefresh}
      />
      
      {data.map((item) => (
        dropdownOpen[item.id] && (
          <div key={item.id}>
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

export default ELevelCard
