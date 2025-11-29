// ** React Imports
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

// ** Reactstrap Imports
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'

// ** Icons Imports
import { Shield, Slash } from 'react-feather'

// ** User Components
import BanTable from './block-log'
import LoginHistory from './login-history'

const UserTabs = ({ active, toggleTab, id }) => {
  const {t} = useTranslation()
  return (
    <Fragment>
      <Nav pills className='mb-2'>
        <NavItem>
          <NavLink active={active === '1'} onClick={() => toggleTab('1')}>
            <Slash className='font-medium-3 me-50' />
            <span className='fw-bold'>{t('Block log')}</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={active === '2'} onClick={() => toggleTab('2')}>
            <Shield className='font-medium-3 me-50' />
            <span className='fw-bold'>{t('Login History')}</span>
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={active}>
        <TabPane tabId='1'>
          <BanTable id={id}/>
        </TabPane>
        <TabPane tabId='2'>
          <LoginHistory id={id}/>
        </TabPane>
      </TabContent>
    </Fragment>
  )
}
export default UserTabs
