// ** React Imports
import { useState } from 'react'

// ** Third Party Components
import classnames from 'classnames'
import { Settings, X } from 'react-feather'
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Reactstrap Imports
import { Input, Label } from 'reactstrap'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'
import { useTranslation } from 'react-i18next'

const Customizer = props => {
  // ** Props
  const {
    layout,
    isHidden,
    setLayout,
    navbarType,
    footerType,
    setIsHidden,
    menuCollapsed,
    setLastLayout,
    setNavbarType,
    setFooterType,
    setMenuCollapsed
  } = props

  // ** State
  const [openCustomizer, setOpenCustomizer] = useState(false)
  const { t } = useTranslation()
  // ** Toggles Customizer
  const handleToggle = e => {
    e.preventDefault()
    setOpenCustomizer(!openCustomizer)
  }

  // ** Render Navbar Type Options
  const renderNavbarTypeRadio = () => {
    const navbarTypeArr = [
      {
        name: 'floating',
        label: t('floating'),
        checked: navbarType === 'floating'
      },
      {
        name: 'sticky',
        label: t('sticky'),
        checked: navbarType === 'sticky'
      },
      {
        name: 'static',
        label: t('static'),
        checked: navbarType === 'static'
      },
      {
        name: 'hidden',
        label: t('hidden'),
        checked: navbarType === 'hidden'
      }
    ]

    return navbarTypeArr.map((radio, index) => {
      const marginCondition = index !== navbarTypeArr.length - 1

      if (layout === 'horizontal' && radio.name === 'hidden') {
        return null
      }

      return (
        <div key={index} className={classnames('form-check', { 'mb-2 me-1': marginCondition })}>
          <Input type='radio' id={radio.name} checked={radio.checked} onChange={() => setNavbarType(radio.name)} />
          <Label className='form-check-label' for={radio.name}>
            {radio.label}
          </Label>
        </div>
      )
    })
  }

  // ** Render Footer Type Options
  const renderFooterTypeRadio = () => {
    const footerTypeArr = [
      {
        name: 'sticky',
        label: t('sticky'),
        checked: footerType === 'sticky'
      },
      {
        name: 'static',
        label: t('static'),
        checked: footerType === 'static'
      },
      {
        name: 'hidden',
        label: t('hidden'),
        checked: footerType === 'hidden'
      }
    ]

    return footerTypeArr.map((radio, index) => {
      const marginCondition = index !== footerTypeArr.length - 1

      return (
        <div key={index} className={classnames('form-check', { 'mb-2 me-1': marginCondition })}>
          <Input
            type='radio'
            checked={radio.checked}
            id={`footer-${radio.name}`}
            onChange={() => setFooterType(radio.name)}
          />
          <Label className='form-check-label' for={`footer-${radio.name}`}>
            {radio.label}
          </Label>
        </div>
      )
    })
  }

  return (
    <div
      className={classnames('customizer d-none d-md-block', {
        open: openCustomizer
      })}
    >
      <a href='/' className='customizer-toggle d-flex align-items-center justify-content-center' onClick={handleToggle}>
        <Settings size={14} className='spinner' />
      </a>
      <PerfectScrollbar className='customizer-content' options={{ wheelPropagation: false }}>
        <div className='customizer-header px-2 pt-1 pb-0 position-relative'>
          <h4 className='mb-0'>{t('themeCustomizer')}</h4>
          <p className='m-0'>{t('customizePreview')}</p>
          <a href='/' className='customizer-close' onClick={handleToggle}>
            <X />
          </a>
        </div>
        <hr />

        <div className='px-2'>
          <p className='fw-bold'>{t('menuLayout')}</p>
          <div className='mb-2'>
            <div className='d-flex align-items-center'>
              <div className='form-check me-1'>
                <Input
                  type='radio'
                  id='vertical-layout'
                  checked={layout === 'vertical'}
                  onChange={() => {
                    setLayout('vertical')
                    setLastLayout('vertical')
                  }}
                />
                <Label className='form-check-label' for='vertical-layout'>
                  {t('vertical')}
                </Label>
              </div>
              <div className='form-check'>
                <Input
                  type='radio'
                  id='horizontal-layout'
                  checked={layout === 'horizontal'}
                  onChange={() => {
                    setLayout('horizontal')
                    setLastLayout('horizontal')
                  }}
                />
                <Label className='form-check-label' for='horizontal-layout'>
                  {t('horizontal')}
                </Label>
              </div>
            </div>
          </div>
          <hr />
          {layout !== 'horizontal' ? (
            <div className='form-switch mb-2 ps-0'>
              <div className='d-flex align-items-center'>
                <p className='fw-bold me-auto mb-0'>{t('menuCollapsed')}</p>
                <Input
                  type='switch'
                  id='menu-collapsed'
                  name='menu-collapsed'
                  checked={menuCollapsed}
                  onChange={() => setMenuCollapsed(!menuCollapsed)}
                />
              </div>
            </div>
          ) : null}

          <div className='form-switch mb-2 ps-0'>
            <div className='d-flex align-items-center'>
              <p className='fw-bold me-auto mb-0'>{t('menuHidden')}</p>
              <Input
                type='switch'
                id='menu-hidden'
                name='menu-hidden'
                checked={isHidden}
                onChange={() => {
                  setIsHidden(!isHidden)
                  localStorage.setItem('menu-hidden', isHidden ? 0 : 1)
                }}
              />
            </div>
          </div>
        </div>

        <hr />

        <div className='px-2'>

          <div className='mb-2'>
            <p className='fw-bold'>{t('navbarType')}</p>
            <div className='d-flex'>{renderNavbarTypeRadio()}</div>
          </div>
        </div>

        <hr />

        <div className='px-2'>
          <div className='mb-2'>
            <p className='fw-bold'>{t('footerType')}</p>
            <div className='d-flex'>{renderFooterTypeRadio()}</div>
          </div>
        </div>
      </PerfectScrollbar>
    </div>
  )
}

export default Customizer
