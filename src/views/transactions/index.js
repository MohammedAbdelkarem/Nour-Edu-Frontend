import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Row,
  Col,
  Table,
  Badge,
  Spinner,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupText,
  Pagination,
  PaginationItem,
  PaginationLink
} from 'reactstrap'
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  DollarSign,
  User,
  CreditCard
} from 'react-feather'
import { useGetMutation } from '../../redux/rtkQuery/transaction'
import ErrorAlert from '../components/handleStatusCode/error'
import './Transactions.scss'
import { useOverviewMutation } from '../../redux/rtkQuery/admin'
import useHeaders from '@hooks/useHeaders'

const Transactions = () => {
  const { t } = useTranslation()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1
  })
  const headers = useHeaders()
  const [overview] = useOverviewMutation()

  useEffect(() => {
    overview({headers})
  }, [])

  // Filter states
  const [filters, setFilters] = useState({
    per_page: 10,
    transaction_type: '',
    start_amount: '',
    end_amount: '',
    start_date: '',
    end_date: '',
    student_ids: []
  })

  const [showFilters, setShowFilters] = useState(false)

  // API hooks
  const [getTransactions, { isLoading: isLoadingTransactions }] = useGetMutation()

  // Load transactions when component mounts or filters change
  useEffect(() => {
    loadTransactions()
  }, [filters.per_page, filters.transaction_type, filters.start_amount, filters.end_amount, filters.start_date, filters.end_date, filters.student_ids])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      
      if (filters.per_page) params.append('per_page', filters.per_page)
      if (filters.transaction_type) params.append('transaction_type', filters.transaction_type)
      if (filters.start_amount) params.append('start_amount', filters.start_amount)
      if (filters.end_amount) params.append('end_amount', filters.end_amount)
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      
      if (pagination.current_page > 1) params.append('page', pagination.current_page)

      const response = await getTransactions({ filterOptions: params.toString() }).unwrap()
      
      setTransactions(response.data || [])
      setPagination(response.pagination_data || {
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1
      })
    } catch (error) {
      console.error('Error loading transactions:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to load transactions')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      current_page: 1
    }))
  }

  const clearFilters = () => {
    setFilters({
      per_page: 10,
      transaction_type: '',
      start_amount: '',
      end_amount: '',
      start_date: '',
      end_date: '',
      student_ids: []
    })
    setPagination(prev => ({
      ...prev,
      current_page: 1
    }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      current_page: page
    }))
  }

  const getTransactionTypeBadge = (type) => {
    const typeMap = {
      'coupon_charge': { color: 'light-success', text: t('Coupon Charge') },
      'coupon_purchase': { color: 'light-warning', text: t('Coupon Purchase') },
      'direct_purchase': { color: 'light-primary', text: t('Direct Purchase') }
    }
    
    const config = typeMap[type] || { color: 'secondary', text: type }
    return <Badge color={config.color}>{config.text}</Badge>
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const renderPagination = () => {
    const { current_page, last_page } = pagination
    const pages = []
    
    // Calculate page range
    const startPage = Math.max(1, current_page - 2)
    const endPage = Math.min(last_page, current_page + 2)
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <Pagination className="d-flex justify-content-center">
        <PaginationItem disabled={current_page === 1}>
          <PaginationLink previous onClick={() => handlePageChange(current_page - 1)} />
        </PaginationItem>
        
        {pages.map(page => (
          <PaginationItem key={page} active={page === current_page}>
            <PaginationLink onClick={() => handlePageChange(page)}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        <PaginationItem disabled={current_page === last_page}>
          <PaginationLink next onClick={() => handlePageChange(current_page + 1)} />
        </PaginationItem>
      </Pagination>
    )
  }

  return (
    <div className="transactions-page">
      {/* Header */}
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-1 text-primary">{t('Transactions')}</h2>
            <p className="text-muted mb-0">{t('Manage and view all transaction records')}</p>
          </div>
          <div className="d-flex gap-2">
            <Button
              color="secondary"
              outline
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="me-1" />
              {t('البحث المتقدم')}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-4">
          <CardHeader>
            <h5 className="mb-0">
              <Filter size={18} className="me-2" />
              {t('البحث المتقدم')}
            </h5>
          </CardHeader>
          <CardBody>
            <Row>
              <Col md="4">
                <FormGroup>
                  <Label for="transaction_type">{t('Transaction Type')}</Label>
                  <Input
                    type="select"
                    id="transaction_type"
                    value={filters.transaction_type}
                    onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
                  >
                    <option value="">{t('All Types')}</option>
                    <option value="coupon_charge">{t('شحن رصيد')}</option>
                    <option value="coupon_purchase">{t('شراء عن طريق كوبون')}</option>
                    <option value="direct_purchase">{t('شراء مباشر')}</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label for="start_amount">{t('Start Amount')}</Label>
                  <Input
                    type="number"
                    id="start_amount"
                    value={filters.start_amount}
                    onChange={(e) => handleFilterChange('start_amount', e.target.value)}
                    placeholder={t('Min amount')}
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label for="end_amount">{t('End Amount')}</Label>
                  <Input
                    type="number"
                    id="end_amount"
                    value={filters.end_amount}
                    onChange={(e) => handleFilterChange('end_amount', e.target.value)}
                    placeholder={t('Max amount')}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="start_date">{t('Start Date')}</Label>
                  <Input
                    type="date"
                    id="start_date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="end_date">{t('End Date')}</Label>
                  <Input
                    type="date"
                    id="end_date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button color="secondary" outline onClick={clearFilters}>
                {t('Clear')}
              </Button>
              <Button color="primary" onClick={loadTransactions}>
                <Search size={16} className="me-1" />
                {t('Apply')}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <CreditCard size={18} className="me-2" />
              {t('Transaction Records')}
            </h5>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-5">
              <Spinner size="lg" color="primary" />
              <p className="mt-3">{t('Loading transactions...')}</p>
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>{t('User')}</th>
                      <th>{t('Amount')}</th>
                      <th>{t('Type')}</th>
                      <th>{t('Coupon')}</th>
                      <th>{t('Date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {transaction.user?.image?.url ? (
                              <img
                                src={transaction.user.image.url}
                                alt={transaction.user.name}
                                className="rounded-circle me-2"
                                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="rounded-circle me-2 d-flex align-items-center justify-content-center bg-primary text-white"
                                   style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                {transaction.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <div>
                              <div className="fw-bold">{transaction.user?.name || t('Unknown User')}</div>
                              <small className="text-muted">{transaction.user?.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold text-success">
                            {formatAmount(transaction.amount)}
                          </span>
                        </td>
                        <td>
                          {getTransactionTypeBadge(transaction.transaction_type)}
                        </td>
                        <td>
                          {transaction.cupon ? (
                            <div>
                              <Badge color="light-info" className="mb-1">
                                {transaction.cupon.coupon}
                              </Badge>
                              <div className="small text-muted">
                                {formatAmount(transaction.cupon.amount)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Calendar size={14} className="me-1 text-muted" />
                            {formatDate(transaction.created_at)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="mt-4">
                  {renderPagination()}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <CreditCard size={48} className="text-muted mb-3" />
              <h5>{t('No Transactions Found')}</h5>
              <p className="text-muted">{t('No transactions match your current filters.')}</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default Transactions
