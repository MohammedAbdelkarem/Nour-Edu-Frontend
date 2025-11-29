import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Alert,
  Badge
} from 'reactstrap'
import {
  Gift,
  Copy,
  Check,
  Calendar,
  Tag
} from 'react-feather'
import { useCreateContextMutation } from '../../../redux/rtkQuery/transaction'
import ErrorAlert from '../../components/handleStatusCode/error'
import './ContextCoupon.scss'

const ContextCoupon = ({ 
  isOpen, 
  toggle, 
  contextId, 
  contextType, 
  contextName 
}) => {
  const { t } = useTranslation()
  const [expiredAt, setExpiredAt] = useState('')
  const [createdCoupon, setCreatedCoupon] = useState(null)
  const [copied, setCopied] = useState(false)
  const [createContextCoupon, { isLoading: isCreating }] = useCreateContextMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!expiredAt) return

    try {
      const formData = new FormData()
      formData.append('context_id', contextId)
      formData.append('context_type', contextType)
      formData.append('expired_at', expiredAt)

      const response = await createContextCoupon({ body: formData }).unwrap()
      setCreatedCoupon(response.data)
      setExpiredAt('')
    } catch (error) {
      console.error('Error creating context coupon:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to create coupon')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    }
  }

  const handleCopyCoupon = async () => {
    if (createdCoupon?.coupon) {
      try {
        await navigator.clipboard.writeText(createdCoupon.coupon)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy coupon:', error)
      }
    }
  }

  const handleClose = () => {
    setCreatedCoupon(null)
    setExpiredAt('')
    setCopied(false)
    toggle()
  }


  const getContextTypeLabel = (type) => {
    switch (type) {
      case 'E_Level': return t('Education Level')
      case 'C_Level': return t('Class Level')
      case 'Course': return t('Course')
      case 'Subject': return t('Subject')
      case 'Unit': return t('Unit')
      default: return type
    }
  }

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg">
      <ModalHeader toggle={handleClose}>
        <div className="d-flex align-items-center">
          <Gift size={20} className="me-2" />
          {t('Create Context Coupon')} - {contextName}
        </div>
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md="6">
              <FormGroup>
                <Label for="context-info">{t('Context')}</Label>
                <Input
                  type="text"
                  id="context-info"
                  value={`${getContextTypeLabel(contextType)}: ${contextName}`}
                  disabled
                  className="bg-light"
                />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label for="expired-at">{t('Expiration Date')} <span className="text-danger">*</span></Label>
                <Input
                  type="date"
                  id="expired-at"
                  value={expiredAt}
                  onChange={(e) => setExpiredAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  required
                />
              </FormGroup>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button 
              color="primary" 
              type="submit"
              disabled={!expiredAt || isCreating}
            >
              <Gift size={14} className="me-1" />
              {isCreating ? t('Creating...') : t('Create Coupon')}
            </Button>
          </div>
        </Form>

        {createdCoupon && (
          <Alert color="primary" className="mt-4 p-2">
            <div className="d-flex align-items-center mb-3">
              <Check size={16} className="me-2" />
              <strong>{t('Context Coupon Created Successfully!')}</strong>
            </div>
            
            <div className="coupon-details">
              <Row>
                <Col md="6">
                  <div className="detail-item">
                    <Label className="detail-label">
                      <Tag size={14} className="me-1" />
                      {t('Coupon Code')}:
                    </Label>
                    <div className="coupon-code">
                      <code className="coupon-text">{createdCoupon.coupon}</code>
                      <Button
                        color="outline-primary"
                        size="sm"
                        onClick={handleCopyCoupon}
                        className="ms-2"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                      </Button>
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <div className="detail-item">
                    <Label className="detail-label">
                      <Calendar size={14} className="me-1" />
                      {t('Expires At')}:
                    </Label>
                    <div className="expiry-display">
                      <span className="expiry-value">
                        {new Date(createdCoupon.expired_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={handleClose}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ContextCoupon
