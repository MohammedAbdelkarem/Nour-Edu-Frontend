import { useState, useEffect, useCallback } from 'react'
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
  Card,
  CardBody,
  Badge,
  Spinner
} from 'reactstrap'
import {
  Users,
  UserPlus,
  UserMinus,
  Check,
  X
} from 'react-feather'
import {
  useGetMutation,
  useGetByContextMutation,
  useAttachMutation,
  useDeatachMutation,
  useDetailsMutation
} from '../../../redux/rtkQuery/teacher'
import ErrorAlert from '../../components/handleStatusCode/error'
import EmptyComponent from '../../components/empty'
import './TeacherAttachment.scss'

const TeacherAttachment = ({ 
  isOpen, 
  toggle, 
  contextId, 
  contextType, 
  contextName,
  levelTeachers = [], 
  eLevelContext = null,
  onRefresh
}) => {
  const { t } = useTranslation()
  const [allTeachers, setAllTeachers] = useState([])
  const [attachedTeachers, setAttachedTeachers] = useState([])
  const [selectedTeachers, setSelectedTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [attachedLoading, setAttachedLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [getTeachers] = useGetMutation()
  const [getTeachersByContext] = useGetByContextMutation()
  const [attachTeachers] = useAttachMutation()
  const [detachTeachers] = useDeatachMutation()
  const [getAttachedTeachers] = useDetailsMutation()

  const loadAllTeachers = useCallback(async () => {
    try {
      setLoading(true)
      let response
      
      if (eLevelContext && eLevelContext.contextId && eLevelContext.contextType) {
        response = await getTeachersByContext({
          context_id: eLevelContext.contextId,
          context_type: eLevelContext.contextType
        }).unwrap()
      } else {
        response = await getTeachers().unwrap()
      }
      
      setAllTeachers(response.data || [])
    } catch (error) {
      console.error('Error loading teachers:', error)
      ErrorAlert({
        title: t('Error'),
        body: t('Failed to load teachers'),
        button: t('OK')
      })
    } finally {
      setLoading(false)
    }
  }, [eLevelContext, getTeachersByContext, getTeachers, t])

  const normalizeTeachers = (input) => {
    if (!input) return []

    if (Array.isArray(input)) {
      return input.filter(Boolean)
    }

    return [input].filter(Boolean)
  }

  const loadAttachedTeachers = useCallback(async () => {
    try {
      setAttachedLoading(true)
      // Use the levelTeachers prop if available, otherwise fetch from API
      if (levelTeachers.length > 0) {
        setAttachedTeachers(normalizeTeachers(levelTeachers))
      } else {
        const response = await getAttachedTeachers({ 
          id: contextId, 
          type: contextType 
        }).unwrap()
        setAttachedTeachers(normalizeTeachers(response.data))
      }
    } catch (error) {
      console.error('Error loading attached teachers:', error)
      setAttachedTeachers([])
    } finally {
      setAttachedLoading(false)
    }
  }, [levelTeachers, contextId, contextType, getAttachedTeachers])

  useEffect(() => {
    if (isOpen && contextId && contextType) {
      loadAllTeachers()
      loadAttachedTeachers()
    } else if (!isOpen) {
      // Reset state when modal closes
      setSelectedTeachers([])
      setAllTeachers([])
      setAttachedTeachers([])
    }
  }, [isOpen, contextId, contextType, loadAllTeachers, loadAttachedTeachers])

  const handleTeacherToggle = (teacherId) => {
    setSelectedTeachers(prev => {
      if (prev.includes(teacherId)) {
        return prev.filter(id => id !== teacherId)
      } else {
        return [...prev, teacherId]
      }
    })
  }

  const handleAttach = async () => {
    if (selectedTeachers.length === 0) return

    try {
      setActionLoading(true)
      const formData = new FormData()
      formData.append('context_id', contextId)
      formData.append('context_type', contextType)
      
      selectedTeachers.forEach(teacherId => {
        formData.append('teacher_ids[]', teacherId)
      })

      await attachTeachers({ body: formData }).unwrap()
      setSelectedTeachers([])
      
      if (onRefresh) {
        onRefresh()
      }
      
      toggle()
      
      ErrorAlert({
        title: t('Success'),
        body: t('Teachers attached successfully'),
        button: t('OK')
      })
    } catch (error) {
      console.error('Error attaching teachers:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to attach teachers')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDetach = async (teacherId) => {
    try {
      setActionLoading(true)
      const formData = new FormData()
      formData.append('context_id', contextId)
      formData.append('context_type', contextType)
      formData.append('teacher_ids[]', teacherId)

      await detachTeachers({ body: formData }).unwrap()
      
      if (onRefresh) {
        onRefresh()
      }
      
      toggle()
      
      ErrorAlert({
        title: t('Success'),
        body: t('Teacher detached successfully'),
        button: t('OK')
      })
    } catch (error) {
      console.error('Error detaching teacher:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to detach teacher')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getAvailableTeachers = () => {
    const attachedIds = attachedTeachers.map(t => t.id)
    return allTeachers.filter(teacher => teacher?.id && !attachedIds.includes(teacher.id))
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl">
      <ModalHeader toggle={toggle} className="bg-primary text-white">
        <div className="d-flex align-items-center text-white">
          <Users size={20} className="me-2 text-white"/>
          {contextName ? `${t('Teacher Management')} - ${contextName}` : t('Teacher Management')}
        </div>
      </ModalHeader>
      <ModalBody>
        {!contextId || !contextType ? (
          <div className="text-center py-5">
            <Spinner size="sm" color="primary" />
            <p className="mt-2 mb-0">{t('Loading context...')}</p>
          </div>
        ) : (
          <Row className="g-4">
            {/* Attached Teachers Section */}
            <Col md="6">
            <Card className="h-100" style={{ borderRight: '4px solid #0568a9' }}>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <UserMinus size={16} className="me-1" />
                    {t('Attached Teachers')}
                  </h6>
                  <Badge color="success">
                    {attachedTeachers.length}
                  </Badge>
                </div>

                {attachedLoading ? (
                  <div className="text-center py-4">
                    <Spinner size="sm" color="primary" />
                    <p className="mt-2 mb-0">{t('Loading attached teachers...')}</p>
                  </div>
                ) : attachedTeachers.length === 0 ? (
                  <EmptyComponent 
                    title={t('No Teachers Attached')}
                    body={t('No teachers attached to this context.')}
                  />
                ) : (
                  <div className="attached-teachers-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {attachedTeachers.map((teacher) => (
                      <div key={teacher.id} className="teacher-item attached mb-2 p-2" style={{ 
                        border: '1px solid #e9ecef', 
                        borderRadius: '6px',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div>
                              <div className="teacher-name fw-semibold">{teacher.name || 'Unknown Teacher'}</div>
                            </div>
                          </div>
                          <Button
                            color="danger"
                            size="sm"
                            outline
                            onClick={() => handleDetach(teacher.id)}
                            disabled={actionLoading}
                          >
                            <UserMinus size={14} className="me-1" />
                            {t('Detach')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Available Teachers Section */}
          <Col md="6">
            <Card className="h-100" style={{ borderRight: '4px solid #0568a9' }}>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <UserPlus size={16} className="me-1" />
                    {eLevelContext ? t('Available Teachers from E Level') : t('Available Teachers')}
                  </h6>
                  <Badge color="primary">
                    {getAvailableTeachers().length}
                  </Badge>
                </div>

                {loading ? (
                  <div className="text-center py-4">
                    <Spinner size="sm" color="primary" />
                    <p className="mt-2 mb-0">{t('Loading teachers...')}</p>
                  </div>
                ) : getAvailableTeachers().length === 0 ? (
                  <EmptyComponent 
                    title={t('All Teachers Attached')}
                    body={t('All teachers are already attached to this context.')}
                  />
                ) : (
                  <div className="available-teachers-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {getAvailableTeachers().map((teacher) => (
                      <div key={teacher.id} className="teacher-item mb-2 p-2" style={{ 
                        border: '1px solid #e9ecef', 
                        borderRadius: '6px',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <div className="d-flex align-items-center">
                          <Input
                            type="checkbox"
                            checked={selectedTeachers.includes(teacher.id)}
                            onChange={() => handleTeacherToggle(teacher.id)}
                            className="me-3"
                          />
                          <div className="flex-grow-1">
                            <div className="teacher-name fw-semibold">{teacher.name}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTeachers.length > 0 && (
                  <div className="mt-3">
                    <Button 
                      color="primary" 
                      size="sm" 
                      onClick={handleAttach}
                      disabled={actionLoading}
                      className="w-100"
                    >
                      <UserPlus size={14} className="me-1" />
                      {actionLoading ? t('Attaching...') : t('Attach Selected')} ({selectedTeachers.length})
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={toggle}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default TeacherAttachment
