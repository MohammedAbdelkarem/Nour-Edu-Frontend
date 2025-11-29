// ** React Imports
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// ** Reactstrap Imports
import { Row, Col } from 'reactstrap'

// ** User View Components
import UserTabs from './Tabs'
import UserInfoCard from './UserInfoCard'
import PageSpinner from '../../../@core/components/spinner/loaders'
// ** Styles
import '@styles/react/apps/app-users.scss'
import { useProfileMutation } from '../../../redux/rtkQuery/user/users'
import useHeaders from '@hooks/useHeaders'
const UserProfile = () => {
  const headers = useHeaders()
  const [getProfile, {data, isLoading}] = useProfileMutation()

  const profile = data?.data || null

  // ** Hooks
  const id  = useLocation()?.state?.id
  useEffect(() => {
    if (id) { 
      getProfile({headers, id})
    }
  }, [id])  

  const [active, setActive] = useState('1')

  const toggleTab = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }

  return (
    <div className='app-user-view'>
      <Row>
      {
        isLoading ? <PageSpinner/> : <>
          <Col xl='4' lg='5' xs={{ order: 1 }} md={{ order: 0, size: 5 }}>
            <UserInfoCard selectedUser={profile}/>
          </Col>
          <Col xl='8' lg='7' xs={{ order: 0 }} md={{ order: 1, size: 7 }}>
            <UserTabs active={active} toggleTab={toggleTab} id={id} />
          </Col>
          </>
        }
      </Row>
    </div>
  )
}
export default UserProfile
