// ** Reactstrap Imports
import { Nav, NavItem, NavLink } from 'reactstrap'

// ** Icons Imports
import { Bookmark, HelpCircle, Info, Lock, Phone } from 'react-feather'
import { useTranslation } from 'react-i18next'

const Tabs = ({ activeTab, toggleTab }) => {
  const {t} = useTranslation()
  return (
    <Nav pills className='mb-2'>
      <NavItem>
        <NavLink active={activeTab === '1'} onClick={() => toggleTab('1')}>
          <Info size={18} className='me-50' />
          <span className='fw-bold'>{t('About us')}</span>
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink active={activeTab === '2'} onClick={() => toggleTab('2')}>
          <Phone size={18} className='me-50' />
          <span className='fw-bold'>{t('Contact us')}</span>
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink active={activeTab === '3'} onClick={() => toggleTab('3')}>
          <HelpCircle size={18} className='me-50' />
          <span className='fw-bold'>{t('FAQ')}</span>
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink active={activeTab === '4'} onClick={() => toggleTab('4')}>
          <Bookmark size={18} className='me-50' />
          <span className='fw-bold'>{t('Terms of use')}</span>
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink active={activeTab === '5'} onClick={() => toggleTab('5')}>
          <Lock size={18} className='me-50' />
          <span className='fw-bold'>{t('Privacy policies')}</span>
        </NavLink>
      </NavItem>
    </Nav>
  )
}

export default Tabs
