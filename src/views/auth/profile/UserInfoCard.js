// ** React Imports
import { Fragment, useState } from 'react'

// ** Reactstrap Imports
import { Card, CardBody, Button, Badge, Alert } from 'reactstrap'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'
import { useTranslation } from 'react-i18next'
import SystemModal from '../../components/systemModal'
import { useRestoreMutation } from '../../../redux/rtkQuery/user/users'
import useHeaders from '../../../utility/hooks/useHeaders'

const UserInfoCard = ({ selectedUser }) => {
  console.log('selectedUser', selectedUser)
  
  const {t} = useTranslation()
  const headers = useHeaders()
  const [enteredPhone, setEnteredPhone] = useState('')
  const [restoreModal, setRestoreModal] = useState(false)
  const [restore, { isLoading, status, error }] = useRestoreMutation()
  // ** render user img
  const renderUserImg = () => {
    if (selectedUser !== null && selectedUser?.avatar) {
      return (
        <img
          height='110'
          width='110'
          alt='user-avatar'
          src={selectedUser?.avatar}
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
          <div className='user-avatar-section'>
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
                  <span className='fw-bolder me-25'>{t('City')}:</span>
                  <span>{selectedUser?.city_name === "" ? t("No entered city") : selectedUser?.city_name }</span>
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
    </Fragment>
  )
}

export default UserInfoCard
