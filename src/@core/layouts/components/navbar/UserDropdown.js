// ** React Imports
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Utils
import { isUserLoggedIn } from '@utils'

// ** Third Party Components
import { User, Settings, Power } from 'react-feather'

// ** Reactstrap Imports
import { UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem, Modal } from 'reactstrap'

// ** Default Avatar Image
import defaultAvatar from '@src/assets/images/base/avatar-blank.png'
import { useTranslation } from 'react-i18next'
import SuccessAlert from '../../../../views/components/handleStatusCode/success'
import ErrorAlert from '../../../../views/components/handleStatusCode/error'
import { useLogoutMutation } from '../../../../redux/rtkQuery/auth'
import useHeaders from '@hooks/useHeaders'
const UserDropdown = () => {
  // ** Store Vars
  const headers = useHeaders()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // ** State
  const [userData, setUserData] = useState(null)

  //** ComponentDidMount
  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('user')))
    }
  }, [])

  //** Vars
  const userAvatar = defaultAvatar
  const [logout, {status, error}] = useLogoutMutation()
  //** ComponentDidMount
  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('user')))
    }
  }, [])

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    setShowLogoutModal(true)
    logout({ headers })
      .finally(() => setShowLogoutModal(false))
  }
  useMemo(() => {
    if (status === 'fulfilled') {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      navigate('/login')
      SuccessAlert({
        title: t('Success'),
        body: t("Logout done successfully"),
        position: 'top-right'
      })
    } else if (status === 'rejected') {
      ErrorAlert({
        title: t('Failed'),
        body: error?.data?.message,
        button: t("Done")
      })
    }
  }, [status])

  return (
    <>
    <UncontrolledDropdown tag='li' className='dropdown-user nav-item'>
      <DropdownToggle href='/' tag='a' className='nav-link dropdown-user-link' onClick={e => e.preventDefault()}>
        <div className='user-nav d-sm-flex d-none'>
          <span className='user-name fw-bold'>{(userData && userData['name'])}</span>
          <span className='user-status'>{(userData && userData.email)}</span>
        </div>
        <Avatar img={userAvatar} imgHeight='40' imgWidth='40' status='online' />
      </DropdownToggle>
      <DropdownMenu end>
        <DropdownItem tag={Link} to={`/admins/profile/${userData?.name}`} state={{ id: userData?.id }}>
          <User size={14} className='me-75' />
          <span className='align-middle'>{t('Profile')}</span>
        </DropdownItem>
        <DropdownItem tag={Link} to='/settings'>
          <Settings size={14} className='me-75' />
          <span className='align-middle'>{t('Settings')}</span>
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem onClick={handleLogout}>
          <Power size={14} className='me-75' />
          <span className='align-middle'>{t('Logout')}</span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
    {/* Logout Modal */}
     <Modal isOpen={showLogoutModal} centered >
      <div className="p-4 text-center">
        <h1  style={{
        width: "100%", 
        borderRadius: "5px", 
        padding: "10px",
        borderRight: "10px solid #0568a9",
        borderLeft: "10px solid #0568a9"}}>{t('Please wait')}</h1>
        <h3 className="mt-2 mb-2">{t('Logging out in progress')}</h3>
        <div className="dots-loading">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <style>
          {`
            .dots-loading {
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .dots-loading span {
              width: 10px;
              height: 10px;
              margin: 0 5px;
              background-color: #0568a9;
              border-radius: 50%;
              display: inline-block;
              animation: bounce 1.4s infinite ease-in-out both;
            }

            .dots-loading span:nth-child(1) {
              animation-delay: -0.32s;
            }
            .dots-loading span:nth-child(2) {
              animation-delay: -0.16s;
            }
            .dots-loading span:nth-child(3) {
              animation-delay: 0;
            }

            @keyframes bounce {
              0%, 80%, 100% {
                transform: scale(0);
              } 
              40% {
                transform: scale(1);
              }
            }
          `}
        </style>
      </div>
    </Modal>
    </>
  )
}

export default UserDropdown
