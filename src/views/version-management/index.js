import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Row,
  Col,
  Badge,
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
  Plus,
  Download,
  Trash2,
  AlertTriangle,
  Smartphone,
  Users,
  User,
  BookOpen
} from 'react-feather'
import {
  useGetMutation,
  useCreateMutation,
  useDeleteMutation
} from '../../redux/rtkQuery/version'
import ErrorAlert from '../components/handleStatusCode/error'

const VersionManagement = () => {
  const { t } = useTranslation()
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [formData, setFormData] = useState({
    version: '',
    url: '',
    file: null,
    is_force_update: 0,
    app_type: 'student',
    description: '',
    download_type: 'url' // 'url' or 'file'
  })
  const [filePreview, setFilePreview] = useState(null)
  const [getVersions] = useGetMutation()
  const [createVersion, { isLoading: isCreating }] = useCreateMutation()
  const [deleteVersion, { isLoading: isDeleting }] = useDeleteMutation()

  const loadVersions = async () => {
    try {
      setLoading(true)
      const response = await getVersions().unwrap()
      setVersions(response.data || [])
    } catch (error) {
      console.error('Error loading versions:', error)
      ErrorAlert({
        title: t('Error'),
        body: t('Failed to load versions'),
        button: t('OK')
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVersions()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDownloadTypeChange = (e) => {
    const downloadType = e.target.value
    setFormData(prev => ({
      ...prev,
      download_type: downloadType,
      url: downloadType === 'url' ? prev.url : '',
      file: downloadType === 'file' ? prev.file : null
    }))
    
    // Clear file preview if switching to URL
    if (downloadType === 'url') {
      setFilePreview(null)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.apk')) {
        ErrorAlert({
          title: t('Invalid File'),
          body: t('Please select a valid APK file'),
          button: t('OK')
        })
        return
      }
      
      setFormData(prev => ({
        ...prev,
        file,
        url: ''
      }))
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      file: null
    }))
    setFilePreview(null)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    
    try {
      const formDataPayload = new FormData()
      
      formDataPayload.append('version', formData.version)
      formDataPayload.append('is_force_update', formData.is_force_update)
      formDataPayload.append('app_type', formData.app_type)
      formDataPayload.append('description', formData.description)
      
      if (formData.url) {
        formDataPayload.append('url', formData.url)
      }
      
      if (formData.file) {
        // Create a new File object to ensure proper extension handling
        const fileWithExtension = new File([formData.file], formData.file.name, {
          type: 'application/vnd.android.package-archive'
        })
        formDataPayload.append('file', fileWithExtension)
      }

      console.log('FormData contents:')
      for (const [key, value] of formDataPayload.entries()) {
        if (key === 'file') {
          console.log(key, 'File object:', value)
          console.log('File name:', value.name)
          console.log('File type:', value.type)
          console.log('File size:', value.size)
          console.log('File extension:', value.name.split('.').pop())
        } else {
          console.log(key, value)
        }
      }

      await createVersion({ body: formDataPayload }).unwrap()
      
      setCreateModal(false)
      setFormData({
        version: '',
        url: '',
        file: null,
        is_force_update: 0,
        app_type: 'student',
        description: '',
        download_type: 'url'
      })
      setFilePreview(null)
      
      // Reset file input
      const fileInput = document.getElementById('file')
      if (fileInput) {
        fileInput.value = ''
      }
      
      loadVersions()
    } catch (error) {
      console.error('Error creating version:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to create version')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleDelete = (version) => {
    setSelectedVersion(version)
    setDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteVersion({ id: selectedVersion.id }).unwrap()
      setDeleteModal(false)
      setSelectedVersion(null)
      loadVersions()
    } catch (error) {
      console.error('Error deleting version:', error)
      ErrorAlert({
        title: t('Error'),
        body: t('Failed to delete version'),
        button: t('OK')
      })
    }
  }

  const getAppTypeIcon = (appType) => {
    switch (appType) {
      case 'student':
        return <BookOpen size={20} className="text-primary" />
      case 'teacher':
        return <Users size={20} className="text-success" />
      case 'parent':
        return <Smartphone size={20} className="text-info" />
      default:
        return <Smartphone size={20} className="text-muted" />
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('Loading...')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="version-management">
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="page-title">{t('Version Management')}</h2>
            <p className="page-subtitle text-muted">
              {t('Manage app versions and updates')}
            </p>
          </div>
          <Button 
            color="primary" 
            onClick={() => setCreateModal(true)}
            className="d-flex align-items-center"
          >
            <Plus size={16} className="me-1" />
            {t('Add Version')}
          </Button>
        </div>
      </div>

      <Row>
        {versions.map((version) => (
          <Col key={version.id} md="6" lg="4" className="mb-4">
            <Card className="h-100 version-card">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  {getAppTypeIcon(version.app_type)}
                  <div className="ms-2">
                    <h6 className="mb-0">{t('Version')} {version.version}</h6>
                    <small className="text-muted">{version.app_type}</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {version.is_force_update === 1 && (
                    <Badge color="danger" size="sm">
                      <AlertTriangle size={12} className="me-1" />
                      {t('Force Update')}
                    </Badge>
                  )}
                  <Button
                    color="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(version)}
                    disabled={isDeleting}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div>
                  <h6 className="text-muted mb-2">{t('Description')}</h6>
                  <p className="mb-0">{version.description || t('No description')}</p>
                </div>
                
                <div>
                  <h6 className="text-muted mb-2"/>
                  {version.url ? (
                    <div className="d-flex align-items-center">
                      <Badge color="light-info" className="me-2">
                        {t('URL')}
                      </Badge>
                      <a 
                        href={version.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        <Download size={16} className="me-1" />
                        {t('Download')}
                      </a>
                    </div>
                  ) : version.file ? (
                    <div className="d-flex align-items-center">
                      <Badge color="light-success" className="me-2">
                        {t('File')}
                      </Badge>
                      <span className="text-muted">
                        <Download size={16} className="me-1" />
                        {t('File Available')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted">{t('No download available')}</span>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {versions.length === 0 && (
        <Card>
          <CardBody className="text-center py-5">
            <Smartphone size={48} className="text-muted mb-3" />
            <h5>{t('No Versions Found')}</h5>
            <p className="text-muted">{t('No app versions have been created yet')}</p>
            <Button 
              color="primary" 
              onClick={() => setCreateModal(true)}
              className="d-flex align-items-center mx-auto"
            >
              <Plus size={16} className="me-1" />
              {t('Add First Version')}
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Create Version Modal */}
      <Modal isOpen={createModal} toggle={() => setCreateModal(false)} size="lg">
        <ModalHeader toggle={() => setCreateModal(false)}>
          {t('Add New Version')}
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="version" className="form-label">
                    {t('Version')} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="version"
                    id="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    placeholder="1.0.1"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="app_type" className="form-label">
                    {t('App Type')} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    name="app_type"
                    id="app_type"
                    value={formData.app_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="student">{t('Student')}</option>
                    <option value="teacher">{t('Teacher')}</option>
                    <option value="parent">{t('Parent')}</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="is_force_update" className="form-label">
                    {t('Force Update')}
                  </Label>
                  <Input
                    type="select"
                    name="is_force_update"
                    id="is_force_update"
                    value={formData.is_force_update}
                    onChange={handleInputChange}
                  >
                    <option value={0}>{t('No')}</option>
                    <option value={1}>{t('Yes')}</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="description" className="form-label">
                    {t('Description')}
                  </Label>
                  <Input
                    type="text"
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={t('Version description')}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md="12">
                <FormGroup>
                  <Label className="form-label">
                    {t('Download Method')} <span className="text-danger">*</span>
                  </Label>
                  <div className="d-flex gap-4">
                    <div className="form-check">
                      <Input
                        type="radio"
                        name="download_type"
                        id="download_type_url"
                        value="url"
                        checked={formData.download_type === 'url'}
                        onChange={handleDownloadTypeChange}
                        className="form-check-input"
                      />
                      <Label for="download_type_url" className="form-check-label">
                        {t('Download URL')}
                      </Label>
                    </div>
                    <div className="form-check">
                      <Input
                        type="radio"
                        name="download_type"
                        id="download_type_file"
                        value="file"
                        checked={formData.download_type === 'file'}
                        onChange={handleDownloadTypeChange}
                        className="form-check-input"
                      />
                      <Label for="download_type_file" className="form-check-label">
                        {t('Upload APK File')}
                      </Label>
                    </div>
                  </div>
                </FormGroup>
              </Col>
            </Row>

            {formData.download_type === 'url' && (
              <Row>
                <Col md="12">
                  <FormGroup>
                    <Label for="url" className="form-label">
                      {t('Download URL')} <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="url"
                      name="url"
                      id="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/app.apk"
                      required
                    />
                    <small className="text-muted">
                      {t('Provide a direct download link to the APK file')}
                    </small>
                  </FormGroup>
                </Col>
              </Row>
            )}

            {formData.download_type === 'file' && (
              <Row>
                <Col md="12">
                  <FormGroup>
                    <Label for="file" className="form-label">
                      {t('APK File')} <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="file"
                      accept=".apk,application/vnd.android.package-archive"
                      name="file"
                      id="file"
                      onChange={handleFileChange}
                      required
                    />
                    <small className="text-muted">
                      {t('Upload APK file directly to the server')}
                    </small>
                  </FormGroup>
                </Col>
              </Row>
            )}

            {formData.download_type === 'file' && filePreview && (
              <Alert color="info">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <Download size={20} className="me-2" />
                    <div>
                      <strong>{formData.file?.name}</strong>
                      <br />
                      <small className="text-muted">
                        {formData.file ? `${(formData.file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                      </small>
                    </div>
                  </div>
                  <Button 
                    color="outline-danger" 
                    size="sm" 
                    onClick={removeFile}
                  >
                    {t('Remove')}
                  </Button>
                </div>
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              type="button" 
              color="secondary" 
              outline
              onClick={() => setCreateModal(false)}
            >
              {t('Cancel')}
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              disabled={isCreating}
            >
              {isCreating ? t('Creating...') : t('Create Version')}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>
          {t('Confirm Delete')}
        </ModalHeader>
        <ModalBody>
          <Alert color="warning">
            <AlertTriangle size={20} className="me-2" />
            {t('Are you sure you want to delete this version?')}
          </Alert>
          {selectedVersion && (
            <div className="mt-3">
              <h6>{t('Version Details')}</h6>
              <p><strong>{t('Version')}:</strong> {selectedVersion.version}</p>
              <p><strong>{t('App Type')}:</strong> {selectedVersion.app_type}</p>
              <p><strong>{t('Description')}:</strong> {selectedVersion.description || t('No description')}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button 
            color="secondary" 
            outline
            onClick={() => setDeleteModal(false)}
          >
            {t('Cancel')}
          </Button>
          <Button 
            color="danger" 
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? t('Deleting...') : t('Delete')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default VersionManagement
