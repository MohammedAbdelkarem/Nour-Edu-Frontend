// ** React Imports
import { Fragment, useMemo, useRef, useState } from 'react'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import classnames from 'classnames'

import {
  Trash,
  Paperclip,
  ChevronLeft,
  Send
} from 'react-feather'
import PerfectScrollbar from 'react-perfect-scrollbar'
import SuccessAlert from '../components/handleStatusCode/success'
import ErrorAlert from '../components/handleStatusCode/error'
// ** Reactstrap Imports
import {
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Badge,
  Input,
  Button,
  CardText,
  Spinner,
  Alert
} from 'reactstrap'
import '@styles/react/pages/page-profile.scss'

import { useCloseMutation, useDeleteMutation, useShowMutation } from '../../redux/rtkQuery/service'
import LoaderSpinner from '../../@core/components/spinner/loaders'
import SystemModal from '../components/systemModal'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
const MailDetails = props => {
  // ** Props
  const {
    mail,
    openMail,
    setOpenMail,
    setIsChanged
  } = props
  const {t} = useTranslation()

  const [show, {data, isLoading}] = useShowMutation()
  const details = data?.data 
  const admin = JSON.parse(localStorage.getItem('user'))
  const [close, {status:closeStatus, isLoading:closing}] = useCloseMutation()
  const [remove, {status:removeStatus, isLoading:removing, error}] = useDeleteMutation()

  const [replay, setReplay] = useState('')
  const [replaied, setReplaied] = useState(false)
  const [trash, setTrash] = useState(false)

  const handleSendReplay = () => {
    const body = new FormData()
    body.append('card_id', details?.id)
    body.append('answer', replay)
    close({body})
  }
  useMemo(() => {
    if (closeStatus === 'fulfilled') {
      SuccessAlert({
        title: 'Success',
        body: 'Replay sent successfully',
        position:'top-left'
      })
      setReplaied(true)
      setIsChanged(true)
      setTimeout(() => {
        setIsChanged(false)
      },100)
    } if (closeStatus === 'rejected') {
        ErrorAlert({
          title: 'failed',
          body: 'Something went wrong',
          button:'done'
        })
    }
  }, [closeStatus])

  useMemo(() => {
    if (mail) {
      show({id:mail})      
    }
  }, [mail])
  
  useMemo(() => {
    if (details) {
      setReplay(details?.admin_answer)
    }
  }, [details])
 
  useMemo(() => {
    if (removeStatus === 'fulfilled') {
      SuccessAlert({
        title: 'Success',
        body: 'Message deleted successfully',
        position:'top-left'
      })
      setIsChanged(true)
      setTimeout(() => {
        setIsChanged(false)
      }, 100)
      setOpenMail(null)
    }
  }, [removeStatus])
  const imageRef = useRef(null)
 
  const renderPhotos = (data) => {
    const handleImageClick = (e, imageRef) => {
      e.preventDefault()
      if (imageRef.current.requestFullscreen) {
        imageRef.current.requestFullscreen()
      } else if (imageRef.current.webkitRequestFullscreen) {
        imageRef.current.webkitRequestFullscreen()
      } else if (imageRef.current.mozRequestFullScreen) {
        imageRef.current.mozRequestFullScreen()
      } else if (imageRef.current.msRequestFullscreen) {
        imageRef.current.msRequestFullscreen()
      }
    }

    return data.map((item, index) => {

      return (
        <Col key={index} md='3' xs='6' className='profile-latest-img'>
          <a href='/' onClick={(e) => handleImageClick(e, imageRef)}>
            <img
              ref={imageRef}
              className='img-fluid rounded'
              style={{ width: '100%', height: '130px', objectFit: 'contain' }}
              src={item?.media_url}
              alt='latest-photo'
            />
          </a>
        </Col>
      )
    })
  }
  // ** Renders Messages
  const renderMessage = obj => {
    return (
      <Card style={{ boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)", 
                      borderRadius: "5px", 
                      padding: "5px",
                      borderRight: "10px solid #0568a9"
                    }}>
        <CardHeader className='email-detail-head'>
          <div className='user-details d-flex justify-content-between align-items-center flex-wrap'>
            <Avatar img={obj.user.avatar} className='me-75' imgHeight='48' imgWidth='48' />
            <div className='mail-items'>
              <Link to={`/users/profile/${obj.user.name}`} state={{id:obj.user.id}} style={{fontSize:"14px"}} className='mb-25'>{obj.user.name}
                <Badge color='light-warning'>{obj?.user?.is_trader ? 'تاجر' : 'مستخدم'} </Badge>
              </Link>
              
              <p className='me-25' dir='ltr'>{obj.user.phone_number}</p>
            </div>
          </div>
          <div className='mail-meta-item d-flex align-items-center'>
            <small className='mail-date-time text-muted'>{obj.created_at}</small>
          </div>
        </CardHeader>
        <CardBody className='mail-message-wrapper pt-2'>
          <div className='mail-message'>{obj.description}</div>
        </CardBody>
        {obj.media && obj.media.length ? (
          <CardFooter>
            <div className='mail-attachments'>
              <div className='d-flex align-items-center mb-1'>
                <Paperclip size={16} />
                <h5 className='fw-bolder text-body mb-0 ms-50'>{obj.media.length} Attachments</h5>
              </div>
              <Row>{renderPhotos(obj.media)}</Row>
            </div>
          </CardFooter>
        ) : null}
      </Card>
    )
  }

  const handleGoBack = () => {
    setOpenMail(false)
  }

  return (
    <div
      className={classnames('email-app-details', {
        show: openMail
      })}
    >
      {isLoading ? <LoaderSpinner/>  : details !== null && details !== undefined ? (
        <Fragment>
          <div className='email-detail-header'>
            <div className='email-header-left d-flex align-items-center'>
              <span className='go-back me-1' onClick={handleGoBack}>
                <ChevronLeft size={20} />
              </span>
              <h4 className='email-subject mb-0'>{details?.title}</h4>
            </div>
            <div className='email-header-right ms-2 ps-1'>
              <ul className='list-inline m-0'>
                
                <li className='list-inline-item me-1'>
                  <span
                    className='action-icon'
                    onClick={() => setTrash(true)}
                  >
                    <Trash size={18} />
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <PerfectScrollbar className='email-scroll-area' options={{ wheelPropagation: false }}>
            <Row>
              <Col sm='12'>
                <Badge className='email-label' color={'light-primary'}>{details?.type}</Badge>
              </Col>
            </Row>
            <Row>
              <Col sm='12'>{renderMessage(details)}</Col>
            </Row>
            <Row> 
              {
                replaied || details.status === 'مغلق' ?  <Card className='mb-3' style={{
                          width: "100%", 
                          boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)", 
                          borderRadius: "5px", 
                          padding: "5px",
                          borderLeft: "10px solid #0568a9",
                          cursor: 'pointer',
                          direction:'ltr'
                        }}>
                  <CardBody>
                    <div className='d-flex'>
                      <div>
                        <Avatar className='me-75' img={admin.avatar} imgHeight='38' imgWidth='38' />
                      </div>
                      <div>
                        <h6 className='fw-bolder mb-25 m-1'>{admin.name}</h6>
                        <CardText style={{padding:'10px'}}>{replay}</CardText>                      
                      </div>
                    </div>
                  </CardBody>
                </Card> : <Col sm='12'>
                  <h6 className='section-label'>{t('Your Replay')}</h6>
                  <Card>
                    <CardBody>
                        <Row>
                          <Col sm='12'>
                            <div className='mb-2'>
                              <Input className='mb-2' type='textarea' rows='3' onChange={(e) => setReplay(e.target.value)}/>
                            </div>
                          </Col>
                          <Col sm='12'>
                          {
                            closing ? <span> <Spinner size='sm' type='grow'/>{t('Replay sending...')}</span> : <Button color='primary' onClick={() => handleSendReplay()}>{t('Send')} <Send size={15}/></Button>
                          }
                          </Col>
                        </Row>
                    </CardBody>
                  </Card>
                </Col> 
              }               
            </Row>
          </PerfectScrollbar>
        </Fragment>
      ) : null}
      {
          trash && (
              <SystemModal
                  show={trash}
                  setShow={setTrash}
                  title={`${t('Delete Card')} (${details?.title})`}
                  onReomve={() => remove({id:mail})}
                  isRemoving={removing}
                  status={removeStatus}
                  message={error?.data?.message}     
              >
                  <Alert color='danger'>
                  <h6 className='alert-heading'>{`${t('Warning')}!`}</h6>
                  <div className='alert-body' style={{ fontSize: '11px' }}>
                      {t('Are you sure about removing this card?')}
                  </div>
                  </Alert>
              </SystemModal>
          )
      }
    </div>
  )
}

export default MailDetails
