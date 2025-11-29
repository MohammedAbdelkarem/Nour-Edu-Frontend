import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Row,
  Col,
  Badge,
  Button,
  Input,
  Label,
  FormGroup,
  Spinner,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap'
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  User,
  Image
} from 'react-feather'
import { useGetMutation, useCreateMutation, useUpdateMutation, useDeleteMutation } from '../../redux/rtkQuery/sell-points'
import useHeaders from '../../utility/hooks/useHeaders'
import SuccessAlert from '../components/handleStatusCode/success'
import ErrorAlert from '../components/handleStatusCode/error'
import { useOverviewMutation } from '../../redux/rtkQuery/admin'

const SellPointsManagement = () => {
  const { t } = useTranslation()  
  // State
  const [sellPoints, setSellPoints] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // Modal states
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const headers = useHeaders()
  const [overview] = useOverviewMutation()

  useEffect(() => {
    overview({headers})
  }, [])
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    image: null
  })
  const [imagePreview, setImagePreview] = useState(null)

  // API hooks
  const [getSellPoints, { isLoading: isLoadingSellPoints }] = useGetMutation()
  const [createSellPoint, { isLoading: isCreating }] = useCreateMutation()
  const [updateSellPoint, { isLoading: isUpdating }] = useUpdateMutation()
  const [deleteSellPoint, { isLoading: isDeleting }] = useDeleteMutation()

  // Load sell points
  const loadSellPoints = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      
      const response = await getSellPoints({ 
        page,
        headers 
      }).unwrap()

      if (append) {
        setSellPoints(prev => [...prev, ...(response.data || [])])
      } else {
        setSellPoints(response.data || [])
      }
      
      setPagination(response.pagination_data || {})
      setHasMore(!!response.pagination_data?.next_page_url)
    } catch (error) {
      console.error('Error loading sell points:', error)
      ErrorAlert({
        title: t('Error'),
        body: t('Failed to load sell points'),
        button: t('OK')
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load more sell points
  const loadMoreSellPoints = async () => {
    if (!hasMore || loadingMore) return
    
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    await loadSellPoints(nextPage, true)
  }

  // Handle scroll
  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
      loadMoreSellPoints()
    }
  }

  // Handle create modal
  const handleCreateClick = () => {
    setFormData({ name: '', address: '', phone: '', image: null })
    setImagePreview(null)
    setCreateModal(true)
  }

  // Handle edit modal
  const handleEditClick = (item) => {
    setSelectedItem(item)
    setFormData({
      name: item.name || '',
      address: item.address || '',
      phone: item.phone || '',
      image: null
    })
    setImagePreview(item.image?.url || null)
    setEditModal(true)
  }

  // Handle delete modal
  const handleDeleteClick = (item) => {
    setSelectedItem(item)
    setDeleteModal(true)
  }

  // Handle form change
  const handleFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Handle create sell point
  const handleCreateSellPoint = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      ErrorAlert({
        title: t('Error'),
        body: t('Please fill in all required fields'),
        button: t('OK')
      })
      return
    }

    try {
      const payload = new FormData()
      payload.append('name', formData.name)
      payload.append('address', formData.address)
      payload.append('phone', formData.phone)
      if (formData.image) {
        payload.append('image', formData.image)
      }

      const response = await createSellPoint({ body: payload, headers }).unwrap()
      SuccessAlert({
        title: t('Success'),
        body: t('Sell point created successfully'),
        position: 'top-left'
      })
      setCreateModal(false)
      
      // Add the new item to local state
      if (response.data) {
        setSellPoints(prev => [response.data, ...prev])
        setPagination(prev => ({
          ...prev,
          total: prev.total + 1
        }))
      } else {
        // Fallback: reload the current page
        loadSellPoints(currentPage)
      }
    } catch (error) {
      console.error('Error creating sell point:', error)
      ErrorAlert({
        title: t('Error'),
        body: error?.data?.message || t('Failed to create sell point'),
        button: t('OK')
      })
    }
  }

  // Handle update sell point
  const handleUpdateSellPoint = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      ErrorAlert({
        title: t('Error'),
        body: t('Please fill in all required fields'),
        button: t('OK')
      })
      return
    }

    try {
      const payload = new URLSearchParams()
      payload.append('name', formData.name)
      payload.append('address', formData.address)
      payload.append('phone', formData.phone)
      if (formData.image) {
        payload.append('image', formData.image)
      }

      const response = await updateSellPoint({ body: payload, id: selectedItem.id, headers }).unwrap()
      SuccessAlert({
        title: t('Success'),
        body: t('Sell point updated successfully'),
        position: 'top-left'
      })
      setEditModal(false)
      setSelectedItem(null)
      
      // Update the item in local state
      if (response.data) {
        setSellPoints(prev => prev.map(item => 
          item.id === selectedItem.id ? response.data : item
        ))
      } else {
        // Fallback: reload the current page
        loadSellPoints(currentPage)
      }
    } catch (error) {
      console.error('Error updating sell point:', error)
      ErrorAlert({
        title: t('Error'),
        body: error?.data?.message || t('Failed to update sell point'),
        button: t('OK')
      })
    }
  }

  // Handle delete sell point
  const handleDeleteSellPoint = async () => {
    try {
      await deleteSellPoint({ id: selectedItem.id, headers }).unwrap()
      SuccessAlert({
        title: t('Success'),
        body: t('Sell point deleted successfully'),
        position: 'top-left'
      })
      setDeleteModal(false)
      setSelectedItem(null)
      
      // Remove the deleted item from local state
      setSellPoints(prev => prev.filter(item => item.id !== selectedItem.id))
      
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }))
    } catch (error) {
      console.error('Error deleting sell point:', error)
      ErrorAlert({
        title: t('Error'),
        body: error?.data?.message || t('Failed to delete sell point'),
        button: t('OK')
      })
    }
  }

  // Close modals
  const handleCloseCreateModal = () => {
    setCreateModal(false)
    setFormData({ name: '', address: '', phone: '', image: null })
    setImagePreview(null)
  }

  const handleCloseEditModal = () => {
    setEditModal(false)
    setSelectedItem(null)
    setFormData({ name: '', address: '', phone: '', image: null })
    setImagePreview(null)
  }

  const handleCloseDeleteModal = () => {
    setDeleteModal(false)
    setSelectedItem(null)
  }

  useEffect(() => {
    loadSellPoints(1)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadingMore, currentPage])

  return (
    <Fragment>
        <div className="d-flex justify-content-between align-items-center">
        <CardTitle tag="h4" className="mb-0">{t('Sell Points Management')}</CardTitle>
        <Button
            color="primary"
            onClick={handleCreateClick}
            className="d-flex align-items-center"
        >
            <Plus size={14} className="me-1" />
            {t('Add Sell Point')}
        </Button>
        </div>
        <CardBody>
            {/* Sell Points Cards */}
            {loading || isLoadingSellPoints ? (
            <div className="text-center py-5">
                <Spinner size="lg" color="primary" />
                <p className="mt-3 text-muted">{t('Loading sell points...')}</p>
            </div>
            ) : sellPoints.length === 0 ? (
            <Alert color="info" className="text-center">
                <MapPin size={24} className="mb-2" />
                <p className="mb-0">{t('No sell points found')}</p>
            </Alert>
            ) : (
            <Row>
                {sellPoints.map((item) => (
                <Col md="3" lg="3" key={item.id}>
                    <Card 
                    className="h-100 shadow-sm"
                    style={{
                        transition: 'all 0.3s ease',
                        borderRadius: '12px',
                        borderRight: '10px solid #0568a9'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'
                    }}
                    >
                    <CardBody>
                        <div className="d-flex align-items-start justify-content-between mb-2">
                        <div className="d-flex align-items-center">
                            {item.image?.url ? (
                            <div 
                                className="me-2 position-relative"
                                style={{ 
                                width: '45px', 
                                height: '45px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                flexShrink: 0
                                }}
                            >
                                <img
                                src={item.image.url}
                                alt={item.name}
                                className="w-100 h-100"
                                style={{ 
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.1)'
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)'
                                }}
                                />
                            </div>
                            ) : (
                            <div 
                                className="me-2 d-flex align-items-center justify-content-center"
                                style={{ 
                                width: '45px', 
                                height: '45px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                flexShrink: 0
                                }}
                            >
                                <User size={18} className="text-white" />
                            </div>
                            )}
                            
                            {/* Title and ID */}
                            <div>
                            <CardTitle 
                                tag="h6" 
                                className="mb-1 fw-bold text-dark"
                                style={{ fontSize: '1rem' }}
                            >
                                {item.name}
                            </CardTitle>
                            </div>
                        </div>
                        <div className="d-flex gap-1">
                            <Button
                            color="primary"
                            size="sm"
                            className="rounded-circle border-0"
                            style={{ 
                                width: '28px', 
                                height: '28px',
                                padding: 0
                            }}
                            onClick={() => handleEditClick(item)}
                            >
                            <Edit size={10} />
                            </Button>
                            <Button
                            color="danger"
                            size="sm"
                            className="rounded-circle border-0"
                            style={{ 
                                width: '28px', 
                                height: '28px',
                                padding: 0
                            }}
                            onClick={() => handleDeleteClick(item)}
                            >
                            <Trash2 size={10} />
                            </Button>
                        </div>
                        </div>
                        
                        {/* Content */}
                        <div className="mb-2">
                        <div className="d-flex align-items-start mb-1">
                            <MapPin size={14} className="me-2 mt-1 text-muted flex-shrink-0" />
                            <div>
                            <small className="text-muted fw-medium d-block mb-1" style={{ fontSize: '0.7rem' }}>{t('Address')}</small>
                            <span className="text-dark" style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                                {item.address}
                            </span>
                            </div>
                        </div>
                        </div>
                        <div className="d-flex align-items-start">
                            <Phone size={14} className="me-2 mt-1 text-muted flex-shrink-0" />
                            <div>
                            <small className="text-muted fw-medium d-block mb-1" style={{ fontSize: '0.7rem' }}>{t('Phone')}</small>
                            <span className="text-dark fw-medium" style={{ fontSize: '0.8rem' }}>
                                {item.phone}
                            </span>
                            </div>
                        </div>
                    </CardBody>
                    </Card>
                </Col>
                ))}
            </Row>
            )}

            {/* Infinite Scroll Loading */}
            {loadingMore && (
            <div className="text-center py-4">
                <Spinner size="md" color="primary" />
                <p className="mt-2 text-muted">{t('Loading more sell points...')}</p>
            </div>
            )}

            {/* Results Counter */}
            {pagination.total > 0 && (
            <div className="text-center mt-4">
                <p className="text-muted mb-0">
                    {t('Showing')} {sellPoints.length} {t('of')} {pagination.total} {t('sell points')}
                </p>
            </div>
            )}

            {/* End of Results */}
            {!hasMore && sellPoints.length > 0 && (
            <div className="text-center mt-4">
                <p className="text-muted">
                    <strong>{t('You have reached the end of the list')}</strong>
                </p>
            </div>
            )}
        </CardBody>
      {/* Create Modal */}
      <Modal isOpen={createModal} toggle={handleCloseCreateModal} centered>
        <ModalHeader toggle={handleCloseCreateModal} className="bg-primary text-white">
          <div className="d-flex align-items-center text-white">
            <Plus size={20} className="me-2" />
            {t('Add Sell Point')}
          </div>
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md="12">
              <FormGroup>
                <Label for="create-name">{t('Name')} *</Label>
                <Input
                  type="text"
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder={t('Enter sell point name')}
                />
              </FormGroup>
            </Col>
            <Col md="12">
              <FormGroup>
                <Label for="create-address">{t('Address')} *</Label>
                <Input
                  type="text"
                  id="create-address"
                  value={formData.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  placeholder={t('Enter address')}
                />
              </FormGroup>
            </Col>
            <Col md="12">
              <FormGroup>
                <Label for="create-phone">{t('Phone')} *</Label>
                <Input
                  type="text"
                  id="create-phone"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  placeholder={t('Enter phone number')}
                />
              </FormGroup>
            </Col>
            <Col md="12">
              <FormGroup>
                <Label for="create-image">{t('Image')}</Label>
                <Input
                  type="file"
                  id="create-image"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      className="rounded"
                    />
                  </div>
                )}
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={handleCloseCreateModal}>
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={handleCreateSellPoint}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Spinner size="sm" className="me-1" />
                {t('Creating...')}
              </>
            ) : (
              <>
                <Plus size={14} className="me-1" />
                {t('Create')}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} toggle={handleCloseEditModal} centered>
        <ModalHeader toggle={handleCloseEditModal} className="bg-primary text-white">
          <div className="d-flex align-items-center text-white">
            <Edit size={20} className="me-2" />
            {t('Edit Sell Point')}
          </div>
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md="12">
              <FormGroup>
                <Label for="edit-name">{t('Name')} *</Label>
                <Input
                  type="text"
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder={t('Enter sell point name')}
                />
              </FormGroup>
            </Col>
            <Col md="12">
              <FormGroup>
                <Label for="edit-address">{t('Address')} *</Label>
                <Input
                  type="text"
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  placeholder={t('Enter address')}
                />
              </FormGroup>
            </Col>
            <Col md="12">
              <FormGroup>
                <Label for="edit-phone">{t('Phone')} *</Label>
                <Input
                  type="text"
                  id="edit-phone"
                  value={formData.phone}
                  maxLength={10}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  placeholder={t('Enter phone number')}
                />
              </FormGroup>
            </Col>
            <Col md="12">
              <FormGroup>
                <Label for="edit-image">{t('Image')}</Label>
                <Input
                  type="file"
                  id="edit-image"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      className="rounded"
                    />
                  </div>
                )}
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={handleCloseEditModal}>
            {t('Cancel')}
          </Button>
          <Button 
            color="primary" 
            onClick={handleUpdateSellPoint}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Spinner size="sm" className="me-1" />
                {t('Updating...')}
              </>
            ) : (
              <>
                <Edit size={14} className="me-1" />
                {t('Update')}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={handleCloseDeleteModal} centered>
        <ModalHeader toggle={handleCloseDeleteModal} className="bg-danger text-white">
          <div className="d-flex align-items-center text-white">
            <Trash2 size={20} className="me-2" />
            {t('Delete Sell Point')}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            <Trash2 size={48} className="text-danger mb-3" />
            <h5 className="mb-3">{t('Are you sure you want to delete this sell point?')}</h5>
            {selectedItem && (
              <div className="bg-light p-3 rounded mb-3">
                <strong>{t('Name')}:</strong> {selectedItem.name}<br />
                <strong>{t('Address')}:</strong> {selectedItem.address}<br />
                <strong>{t('Phone')}:</strong> {selectedItem.phone}
              </div>
            )}
            <p className="text-muted mb-0">
              {t('This action cannot be undone.')}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={handleCloseDeleteModal}>
            {t('Cancel')}
          </Button>
          <Button 
            color="danger" 
            onClick={handleDeleteSellPoint}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" className="me-1" />
                {t('Deleting...')}
              </>
            ) : (
              <>
                <Trash2 size={14} className="me-1" />
                {t('Delete')}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  )
}

export default SellPointsManagement

