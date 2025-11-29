// ** React Imports
import { Fragment, useMemo, useState } from 'react'

// ** Reactstrap Imports
import { Card, CardBody, Button, Badge, Alert, Label, Input } from 'reactstrap'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'
import { useTranslation } from 'react-i18next'
import SystemModal from '../../components/systemModal'
import { useRestoreMutation } from '../../../redux/rtkQuery/user/users'
import useHeaders from '../../../utility/hooks/useHeaders'
import { Bell } from 'react-feather'
import { useSendCustomMutation } from '../../../redux/rtkQuery/notification'
import SuccessAlert from '../../components/handleStatusCode/success'
import { Link } from 'react-router-dom'

const UserInfoCard = ({ selectedUser }) => {
  console.log('selectedUser', selectedUser)
  
  const {t} = useTranslation()
  const headers = useHeaders()
  const [enteredPhone, setEnteredPhone] = useState('')
  const [restoreModal, setRestoreModal] = useState(false)
  const [notifyModal, setNotifyModal] = useState(false)
  const [sendCustom, {isLoading:sending, status:sendStatus, error:sendError }] = useSendCustomMutation()
  const [restore, { isLoading, status, error }] = useRestoreMutation()
  const [form, setForm] = useState({
      title:'',
      body:''
    })
    const handleSend = () => {
      const body = {
        title:form.title,
        body:form.body,
        type:"account",
        ids_list: [selectedUser?.id],
        target_users: []
      }
      sendCustom({body})
    }
    const handleClose = () => {
      setNotifyModal(false)
       setForm({
        title:'',
        body:''
      })
    }
  
    useMemo(() => {
      if (sendStatus === 'fulfilled') {
        handleClose()
        SuccessAlert({
          title: t('Success'),
          body: t('Notification sent successfully'),
          position: 'top-end'
        })
      }
    }, [sendStatus])

  // ** render user img
  const renderUserImg = () => {
    if (selectedUser !== null && selectedUser?.avatar) {
      return (
        <img
          height='110'
          width='110'
          alt='user-avatar'
          src={selectedUser?.avatar?.url}
          className='img-fluid rounded mt-3 mb-2'
        />
      )
    } 
  }
  const handleRestore = () => {
    const body = new FormData()
    body.append('user_id', selectedUser?.id)
    restore({headers, body})
  }

  return (
    <Fragment>
      <Card>
        <CardBody>
          <div className='user-avatar-section position-relative'>
              {/* Bell icon in top-left */}
              <div style={{ position: 'absolute', top: 10, left: 10 }}>
                <Bell size={20} color='#d87b34' style={{cursor:'pointer'}} onClick={() => setNotifyModal(true)}/>
              </div>
            <div className='d-flex align-items-center flex-column'>
              {renderUserImg()}
              <div className='d-flex flex-column align-items-center text-center'>
                <div className='user-info'>
                  <h4>{selectedUser?.name}</h4>
                  {selectedUser?.is_me ? (
                    <Badge color={'light-primary'} className='text-capitalize'>
                      {t('Your profile')}
                    </Badge>
                  ) : null}
                  {
                    selectedUser?.is_active ? (
                      <Badge color={selectedUser?.is_active && 'light-info'} className='text-capitalize'>
                        {selectedUser?.is_active && t('Active Account')}
                      </Badge>
                    ) : null
                  }
                  {
                    selectedUser?.ban?.is_banned ? (
                      <Badge color={selectedUser?.ban?.is_banned && 'light-danger'} className='text-capitalize'>
                        {selectedUser?.ban?.is_banned && t('Banned Account')}
                      </Badge>
                    ) : null
                  }
                  {
                    selectedUser?.in_trash ? (
                      <Badge color={selectedUser?.in_trash && 'light-secondary'} className='text-capitalize'>
                        {selectedUser?.in_trash  && t('Deleted Account')}
                      </Badge>
                    ) : null
                  }
                </div>
              </div>
            </div>
          </div>
          <h4 className='fw-bolder border-bottom pb-50 mb-1'>{t('Details')}</h4>
          <div className='info-container'>
            {selectedUser !== null && (
              <ul className='list-unstyled'>
                <li className='mb-75'>
                  <span className='fw-bolder me-25'>{t('Email')}:</span>
                  <span>{selectedUser?.email === "" ? t("No entered email") : selectedUser?.email }</span>
                </li>
                <li className='mb-75'>
                  <span className='fw-bolder me-25'>{t('Phone number')}:</span>
                  <span dir='ltr'>{selectedUser?.phone_number}</span>
                </li>

                <li className='mb-75'>
                  <span className='fw-bolder me-25'>{t('Birth date')}:</span>
                  <span>{selectedUser?.birth_date === "" ? t("No entered birth date") : selectedUser?.birth_date }</span>
                </li>

                <li className='mb-75'>
                  <span className='fw-bolder me-25'>{t('Gender')}:</span>
                  <span>{selectedUser?.is_male ? t('Male') : t('Female')}</span>
                </li>

                <li className='mb-75'>
                  <span className='fw-bolder me-25'>{t('Join Date')}:</span>
                  <span>{selectedUser?.created_at?.slice(0, 10)}</span>
                </li>
                {
                  selectedUser.role_id === 4 && (
                    <li className='mb-75'>
                      <Link to={`/patients/profile/${selectedUser.name}`} state={selectedUser?.id}> {t(' ● الانتقال للملف الطبي')} </Link>
                    </li>
                  )
                }
              </ul>
            )}
          </div>
          <div className='d-flex justify-content-center pt-2'>
            {
              selectedUser?.in_trash && 
                <Button className='ms-1' color='danger' outline onClick={() => setRestoreModal(true)}>
                  {t('Restore Account')}
                </Button>
            }
          </div>
        </CardBody>
      </Card>
      {
        restoreModal && (
          <SystemModal
            show={restoreModal}
            setShow={setRestoreModal}
            title={`${t('Restore Account')} (${selectedUser?.name})`}
            onReomve={() => handleRestore()}
            isRemoving={isLoading}
            status={status}
            message={error?.data?.message} 
            disabled={enteredPhone.trim() !== selectedUser?.phone_number.trim()}
          >
            <Alert color='danger'>
              <h6 className='alert-heading'>{`${t('Warning')}!`}</h6>
              <div className='alert-body' style={{ fontSize: '11px' }}>
                {t('To confirm restoring account enter phone number for this account..')}
              </div>
            </Alert>
            <div className="mt-2">
              <input
                type="text"
                className="form-control"
                value={enteredPhone}
                onChange={(e) => setEnteredPhone(e.target.value.trim())}
                placeholder={`${t('e.g.')  } +9639XXXXXXX`}
              />
              {enteredPhone && enteredPhone !== selectedUser?.phone_number.trim() && (
                <small className="text-danger">{t('Phone number does not match')}</small>
              )}
            </div>
          </SystemModal>
      )}
      {
        notifyModal && (
        <SystemModal show={notifyModal}
                      setShow={handleClose} 
                      title={`${t('Send Notification')}!`} 
                      onReomve={() => handleSend()}
                      isRemoving={sending}
                      status={sendStatus}
                      message={sendError?.data?.message}
                      disabled={form.title === '' || form.body === ''}>
                <Alert color='warning'>
                  <h6 className='alert-heading'>{`${t('Warning')}!`}</h6>
                  <div className='alert-body' style={{fontSize:'11px'}}>
                  {t(`You're going to send a notification to this user (${selectedUser?.name})`)}
                  </div>
                </Alert>
                  <Label className='form-label' for='card-name'>
                    {t('Notification Title')}
                  </Label>
                  <Input id='card-name' placeholder='Notification Title' onChange={(e) => setForm({...form, title:e.target.value})}/>
                  <Label className='form-label mt-2' for='card-name'>
                    {t('Body')}
                  </Label>
                  <Input id='card-name' type='textarea' rows={3} placeholder='Notification Body' onChange={(e) => setForm({...form, body:e.target.value})}/>
        </SystemModal>
        )
      }
      
    </Fragment>
  )
}

export default UserInfoCard
