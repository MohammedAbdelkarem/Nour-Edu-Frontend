// ** React Imports
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

// ** Reactstrap Imports
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'

// ** Icons Imports
import { Lock, Shield, User } from 'react-feather'

// ** User Components
import LoginHistory from './login-history'
import AccountTab from './Account'
import PrivacyTab from './privacy'

const UserTabs = ({ active, toggleTab, id, data, setIsChanged }) => {
  const {t} = useTranslation()
  return (
    <Fragment>
      <Nav pills className='mb-2'>
        <NavItem>
          <NavLink active={active === '1'} onClick={() => toggleTab('1')}>
            <User className='font-medium-3 me-50' />
            <span className='fw-bold'>{t('Account')}</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={active === '2'} onClick={() => toggleTab('2')}>
            <Lock className='font-medium-3 me-50' />
            <span className='fw-bold'>{t('Privacy')}</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={active === '3'} onClick={() => toggleTab('3')}>
            <Shield className='font-medium-3 me-50' />
            <span className='fw-bold'>{t('Login history')}</span>
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={active}>
        <TabPane tabId='1'>
          <AccountTab data={data} setIsChanged={setIsChanged}/>
        </TabPane>
        <TabPane tabId='2'>
          <PrivacyTab id={id} userData={data}/>
        </TabPane>
        <TabPane tabId='3'>
          <LoginHistory id={id}/>
        </TabPane>
      </TabContent>
    </Fragment>
  )
}
export default UserTabs
