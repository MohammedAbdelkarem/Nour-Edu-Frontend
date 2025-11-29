import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Row,
  Col,
  Table,
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
  RefreshCw,
  Eye,
  EyeOff,
  Calendar,
  Hash,
  DollarSign,
  Clock,
  AlertTriangle,
  Plus
} from 'react-feather'
import { useGetCouponsMutation, useExpiredMutation, useCreateStudentMutation } from '../../redux/rtkQuery/transaction'
import useHeaders from '../../utility/hooks/useHeaders'
import SuccessAlert from '../components/handleStatusCode/success'
import ErrorAlert from '../components/handleStatusCode/error'
import { useOverviewMutation } from '../../redux/rtkQuery/admin'

const ManagementCoupon = () => {
  const { t } = useTranslation()
  const headers = useHeaders()
  const [overview] = useOverviewMutation()

  useEffect(() => {
    overview({headers})
  }, [])
  // State
  const [coupons, setCoupons] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: '',
    is_expired: '',
    created_at: '',
    per_page: 10,
    page: 1
  })
  const [expireModal, setExpireModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [createModal, setCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    amount: '',
    number_of_coupons: 1
  })

  // API hooks
  const [getCoupons, { isLoading: isLoadingCoupons }] = useGetCouponsMutation()
  const [expireCoupon, { isLoading: isExpiring }] = useExpiredMutation()
  const [createStudentCoupon, { isLoading: isCreating }] = useCreateStudentMutation()

  // Load coupons
  const loadCoupons = async () => {
    try {
      setLoading(true)
      const filterOptions = new URLSearchParams()
      
      if (filters.type) filterOptions.append('type', filters.type)
      if (filters.is_expired !== '') filterOptions.append('is_expired', filters.is_expired)
      if (filters.created_at) filterOptions.append('created_at', filters.created_at)
      if (filters.per_page) filterOptions.append('per_page', filters.per_page)
      if (filters.page) filterOptions.append('page', filters.page)

      const response = await getCoupons({ 
        filterOptions: filterOptions.toString(),
        headers 
      }).unwrap()

      setCoupons(response.data || [])
      setPagination(response.pagination_data || {})
    } catch (error) {
      console.error('Error loading coupons:', error)
      ErrorAlert({
        title: t('Error'),
        body: t('Failed to load coupons'),
        button: t('OK')
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  // Handle pagination
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  // Handle expire coupon button click
  const handleExpireCouponClick = (coupon) => {
    setSelectedCoupon(coupon)
    setExpireModal(true)
  }

  // Handle expire coupon confirmation
  const handleExpireCoupon = async () => {
    if (!selectedCoupon) return

    try {
      await expireCoupon({ id: selectedCoupon.id, headers }).unwrap()
      SuccessAlert({
        title: t('Success'),
        body: t('Coupon expired successfully'),
        position: 'top-left'
      })
      setExpireModal(false)
      setSelectedCoupon(null)
      loadCoupons() // Reload coupons
    } catch (error) {
      console.error('Error expiring coupon:', error)
      ErrorAlert({
        title: t('Error'),
        body: error?.data?.message || t('Failed to expire coupon'),
        button: t('OK')
      })
    }
  }

  // Handle modal close
  const handleCloseModal = () => {
    setExpireModal(false)
    setSelectedCoupon(null)
  }

  // Handle create coupon modal
  const handleCreateCouponClick = () => {
    setCreateForm({ amount: '', number_of_coupons: 1 })
    setCreateModal(true)
  }

  // Handle create form change
  const handleCreateFormChange = (key, value) => {
    setCreateForm(prev => ({ ...prev, [key]: value }))
  }

  // Format amount input with thousands separators
  const formatAmountInput = (value) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d]/g, '')
    // Add thousands separators
    return new Intl.NumberFormat('en-US').format(numericValue)
  }

  // Handle amount input change
  const handleAmountChange = (e) => {
    const value = e.target.value
    const numericValue = value.replace(/[^\d]/g, '')
    setCreateForm(prev => ({ ...prev, amount: numericValue }))
  }

  // Handle create student coupon
  const handleCreateStudentCoupon = async () => {
    if (!createForm.amount || !createForm.number_of_coupons) {
      ErrorAlert({
        title: t('Error'),
        body: t('Please fill in all required fields'),
        button: t('OK')
      })
      return
    }

    if (parseInt(createForm.number_of_coupons) <= 0) {
      ErrorAlert({
        title: t('Error'),
        body: t('Number of coupons must be greater than 0'),
        button: t('OK')
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append('amount', createForm.amount)
      formData.append('number_of_copons', createForm.number_of_coupons)

      await createStudentCoupon({ body: formData, headers }).unwrap()
      SuccessAlert({
        title: t('Success'),
        body: t('Student coupons created successfully'),
        position: 'top-left'
      })
      setCreateModal(false)
      setCreateForm({ amount: '', number_of_coupons: 1 })
      loadCoupons() // Reload coupons
    } catch (error) {
      console.error('Error creating student coupons:', error)
      ErrorAlert({
        title: t('Error'),
        body: error?.data?.message || t('Failed to create student coupons'),
        button: t('OK')
      })
    }
  }

  // Handle close create modal
  const handleCloseCreateModal = () => {
    setCreateModal(false)
    setCreateForm({ amount: '', number_of_coupons: 1 })
  }

  // Get coupon type badge color
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'student_one_time': return 'light-primary'
      case 'context_one_time': return 'light-success'
      case 'context_many_times': return 'light-warning'
      default: return 'secondary'
    }
  }

  // Get coupon type display name
  const getTypeDisplayName = (type) => {
    switch (type) {
      case 'student_one_time': return t('Student One Time')
      case 'context_one_time': return t('Context One Time')
      case 'context_many_times': return t('Context Many Times')
      default: return type
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return t('No date')
    return new Date(dateString).toLocaleDateString()
  }

  // Format amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  useEffect(() => {
    loadCoupons()
  }, [filters])

  return (
    <Fragment>
      <Row>
        <Col sm="12">
            <Card>
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <CardTitle tag="h4" className="mb-0">{t('Coupon Management')}</CardTitle>
                  <Button
                    color="primary"
                    onClick={handleCreateCouponClick}
                    className="d-flex align-items-center"
                  >
                    <Plus size={14} className="me-1" />
                    {t('Create')}
                  </Button>
                </div>
              </CardHeader>
            <CardBody>
              {/* Filters */}
              <Row className="mb-3">
                <Col md="3">
                  <FormGroup>
                    <Label for="type-filter">{t('Type')}</Label>
                    <Input
                      type="select"
                      id="type-filter"
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                      <option value="">{t('All Types')}</option>
                      <option value="student_one_time">{t('Student One Time')}</option>
                      <option value="context_one_time">{t('Context One Time')}</option>
                      <option value="context_many_times">{t('Context Many Times')}</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <Label for="expired-filter">{t('Status')}</Label>
                    <Input
                      type="select"
                      id="expired-filter"
                      value={filters.is_expired}
                      onChange={(e) => handleFilterChange('is_expired', e.target.value)}
                    >
                      <option value="">{t('All Status')}</option>
                      <option value="0">{t('Active')}</option>
                      <option value="1">{t('Expired')}</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="3"/>
                <Col md="3" className="d-flex align-items-end">
                  <Button
                    color="primary"
                    onClick={loadCoupons}
                    disabled={loading || isLoadingCoupons}
                    className="w-100"
                  >
                    {loading || isLoadingCoupons ? (
                      <Spinner size="sm" className="me-1" />
                    ) : (
                      <RefreshCw size={14} className="me-1" />
                    )}
                    {t('Refresh')}
                  </Button>
                </Col>
              </Row>

              {/* Coupons Table */}
              {loading || isLoadingCoupons ? (
                <div className="text-center py-5">
                  <Spinner size="lg" color="primary" />
                  <p className="mt-3 text-muted">{t('Loading coupons...')}</p>
                </div>
              ) : coupons.length === 0 ? (
                <Alert color="info" className="text-center">
                  <Hash size={24} className="mb-2" />
                  <p className="mb-0">{t('No coupons found')}</p>
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>{t('Coupon Code')}</th>
                        <th>{t('Amount')}</th>
                        <th>{t('Type')}</th>
                        <th>{t('Uses')}</th>
                        <th>{t('Status')}</th>
                        <th>{t('Context')}</th>
                        <th>{t('Expired At')}</th>
                        <th>{t('Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => (
                        <tr key={coupon.id}>
                          <td>
                              {coupon.coupon}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {formatAmount(coupon.amount)}
                            </div>
                          </td>
                          <td>
                            <Badge color={getTypeBadgeColor(coupon.type)}>
                              {getTypeDisplayName(coupon.type)}
                            </Badge>
                          </td>
                          <td>
                            <Badge color="light-info">
                              {coupon.number_of_uses}
                            </Badge>
                          </td>
                          <td>
                            <Badge color={coupon.is_expired ? 'light-danger' : 'light-success'}>
                              {coupon.is_expired ? (
                                <>
                                  <EyeOff size={12} className="me-1" />
                                  {t('Expired')}
                                </>
                              ) : (
                                <>
                                  <Eye size={12} className="me-1" />
                                  {t('Active')}
                                </>
                              )}
                            </Badge>
                          </td>
                          <td>
                            {coupon.context_id && coupon.context_type ? (
                              <Badge color="light-secondary">
                                {coupon.context_type}
                              </Badge>
                            ) : (
                              <span className="text-muted">{t('Global')}</span>
                            )}
                          </td>
                          <td>
                            {coupon.expired_at ? (
                              <div className="d-flex align-items-center">
                                <Calendar size={14} className="me-1 text-muted" />
                                {formatDate(coupon.expired_at)}
                              </div>
                            ) : (
                              <span className="text-muted">{t('No expiry')}</span>
                            )}
                          </td>
                           <td>
                             {!coupon.is_expired && (
                               <Button
                                 color="warning"
                                 size="sm"
                                 outline
                                 onClick={() => handleExpireCouponClick(coupon)}
                                 disabled={isExpiring}
                               >
                                 <Clock size={14} className="me-1" />
                                 {t('Expire')}
                               </Button>
                             )}
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {pagination.total > 0 && (
                <Row className="mt-3">
                  <Col md="6">
                    <p className="text-muted">
                      {t('Showing')} {((pagination.current_page - 1) * pagination.per_page) + 1} {t('to')} {Math.min(pagination.current_page * pagination.per_page, pagination.total)} {t('of')} {pagination.total} {t('results')}
                    </p>
                  </Col>
                  <Col md="6">
                    <div className="d-flex justify-content-end">
                      <div className="btn-group" role="group">
                        <Button
                          color="outline-primary"
                          size="sm"
                          disabled={!pagination.prev_page_url}
                          onClick={() => handlePageChange(pagination.current_page - 1)}
                        >
                          {t('Previous')}
                        </Button>
                        <Button
                          color="outline-primary"
                          size="sm"
                          disabled={!pagination.next_page_url}
                          onClick={() => handlePageChange(pagination.current_page + 1)}
                        >
                          {t('Next')}
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
             </CardBody>
           </Card>
         </Col>
       </Row>

       {/* Create Student Coupon Modal */}
       <Modal isOpen={createModal} toggle={handleCloseCreateModal} centered>
         <ModalHeader toggle={handleCloseCreateModal} className="bg-primary text-white">
           <div className="d-flex align-items-center text-white">
             <Plus size={20} className="me-2" />
             {t('Create Student Coupon')}
           </div>
         </ModalHeader>
         <ModalBody>
           <Row>
             <Col md="6">
               <FormGroup>
                 <Label for="amount">{t('Amount')} *</Label>
                 <Input
                   type="text"
                   id="amount"
                   value={createForm.amount ? formatAmountInput(createForm.amount) : ''}
                   onChange={handleAmountChange}
                   placeholder={t('Enter coupon amount')}
                 />
               </FormGroup>
             </Col>
             <Col md="6">
               <FormGroup>
                 <Label for="number_of_coupons">{t('Number of Coupons')} *</Label>
                 <Input
                   type="number"
                   id="number_of_coupons"
                   value={createForm.number_of_coupons}
                   onChange={(e) => handleCreateFormChange('number_of_coupons', e.target.value)}
                   placeholder={t('Enter number of coupons')}
                   min="1"
                   max="100"
                 />
               </FormGroup>
             </Col>
           </Row>
           <Alert color="info" className="mt-3">
             <strong>{t('Note')}:</strong> {t('This will create student one-time coupons. Each coupon can only be used once by a student.')}
           </Alert>
         </ModalBody>
         <ModalFooter>
           <Button color="secondary" outline onClick={handleCloseCreateModal}>
             {t('Cancel')}
           </Button>
           <Button 
             color="primary" 
             onClick={handleCreateStudentCoupon}
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
                 {t('Create Coupons')}
               </>
             )}
           </Button>
         </ModalFooter>
       </Modal>

       {/* Expire Confirmation Modal */}
       <Modal isOpen={expireModal} toggle={handleCloseModal} centered>
         <ModalHeader toggle={handleCloseModal} className="bg-warning text-white">
           <div className="d-flex align-items-center">
             <AlertTriangle size={20} className="me-2 text-white" />
             {t('Confirm Expire Coupon')}
           </div>
         </ModalHeader>
         <ModalBody>
           <div className="text-center">
             <AlertTriangle size={48} className="text-warning mb-3" />
             <h5 className="mb-3">{t('Are you sure you want to expire this coupon?')}</h5>
             {selectedCoupon && (
               <div className="bg-light p-3 rounded mb-3">
                 <div className="row">
                   <div className="col-6">
                     <strong>{t('Coupon Code')}:</strong>
                     <br />
                     <span>{selectedCoupon.coupon}</span>
                   </div>
                   <div className="col-6">
                     <strong>{t('Amount')}:</strong>
                     <br />
                     <span className="text-success">{formatAmount(selectedCoupon.amount)}</span>
                   </div>
                 </div>
               </div>
             )}
             <p className="text-muted mb-0">
               {t('This action cannot be undone. The coupon will be marked as expired and will no longer be usable.')}
             </p>
           </div>
         </ModalBody>
         <ModalFooter>
           <Button color="secondary" outline onClick={handleCloseModal}>
             {t('Cancel')}
           </Button>
           <Button 
             color="warning" 
             onClick={handleExpireCoupon}
             disabled={isExpiring}
           >
             {isExpiring ? (
               <>
                 <Spinner size="sm" className="me-1" />
                 {t('Expiring...')}
               </>
             ) : (
               <>
                 <Clock size={14} className="me-1" />
                 {t('Confirm')}
               </>
             )}
           </Button>
         </ModalFooter>
       </Modal>
     </Fragment>
   )
 }

export default ManagementCoupon
