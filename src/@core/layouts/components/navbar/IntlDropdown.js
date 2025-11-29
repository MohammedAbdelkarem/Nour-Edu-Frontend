// ** Third Party Components
import { ChevronDown } from 'react-feather'
import { useTranslation } from 'react-i18next'

// ** Reactstrap Imports
import { UncontrolledDropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap'

const IntlDropdown = () => {
  // ** Hooks
  const { t, i18n } = useTranslation()

  // ** Vars
  const langObj = {
    en: 'English',
    ar: 'Arabic'
  }

  // ** Function to switch Language
  const handleLangUpdate = (e, lang) => {
    e.preventDefault()
    i18n.changeLanguage(lang)
  }

  return (
      <UncontrolledDropdown tag="li" className="d-flex align-items-center justify-content-center nav-item">
          <DropdownToggle
            tag="a"
            className="nav-link"
            onClick={(e) => e.preventDefault()}>
            <ChevronDown size={20} style={{ color: '#0568a9' }} />
            <span className="selected-language ms-50" style={{ color: '#0568a9' }}>
              {t(langObj[i18n.language])}
            </span>
          </DropdownToggle>

          <DropdownMenu className="mt-0" end>
            {
              i18n.language === 'ar' && (
                <DropdownItem href="/" tag="a" onClick={(e) => handleLangUpdate(e, 'en')}>
                  <span style={{ color: '#0568a9' }}>{t('English')}</span>
                </DropdownItem>
              ) 
            }
            {
              i18n.language === 'en' && (
                <DropdownItem href="/" tag="a" onClick={(e) => handleLangUpdate(e, 'ar')}>
                  <span style={{ color: '#0568a9' }}>{t('Arabic')}</span>
                </DropdownItem>
              ) 
            }
          </DropdownMenu>
        </UncontrolledDropdown>
  )
}
export default IntlDropdown