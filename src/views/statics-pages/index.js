// ** React Imports
import { Fragment, useEffect, useMemo, useState } from 'react'

// ** Reactstrap Imports
import { Row, Col, TabContent, TabPane } from 'reactstrap'

// ** Components
import Tabs from './tabs'
import Breadcrumbs from '@components/breadcrumbs'
import AboutUs from './content/About-us'

// ** Styles
import '@styles/react/libs/editor/editor.scss'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import '@styles/react/pages/page-account-settings.scss'
import { useGetMutation as useGetAbout } from '../../redux/rtkQuery/statics-pages/about'
import { useGetMutation as useGetPrivacy } from '../../redux/rtkQuery/statics-pages/privacy'
import { useGetMutation as useGetTOS } from '../../redux/rtkQuery/statics-pages/tos'

import useHeaders from '../../utility/hooks/useHeaders'
import ContactUs from './content/contact-us'
import PrivacyPolices from './content/privacy'
import Faq from './content/faq'
import TOS from './content/tos'
import LoadSpinner from '../../@core/components/spinner/loaders'
import { useOverviewMutation } from '../../redux/rtkQuery/admin'

const StaticPages = () => {
  const headers = useHeaders()
  // ** States
  const [isUpdate, setIsUpdate] = useState(false)  
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeStaticTab') || '1'
  })
  // Methods
  const [getAbout, {data:aboutData, isLoading:aboutLoading}] = useGetAbout()
  const [getPrivacy, {data:privacyData, isLoading:privacyLoading}] = useGetPrivacy()
  const [getTOS, {data:tosData, isLoading:tosLoading}] = useGetTOS()

  const toggleTab = tab => {
    setActiveTab(tab)
    localStorage.setItem('activeStaticTab', tab)
  }
  const [overview] = useOverviewMutation()

  useEffect(() => {
    overview({headers})
  }, [])
  useEffect(() => {
    switch (activeTab) {
      case '1':
        getAbout({headers})
        break
      case '4':
        getTOS({headers})
        break
      case '5':
        getPrivacy({headers})
        break
    }
  }, [activeTab, isUpdate]) 

  return (
    <Fragment>
      <Breadcrumbs title='Managing static pages' data={[{ title: 'Managing static pages' }]} />
        <Row>
          <Col xs={12}>
            <Tabs className='mb-2' activeTab={activeTab} toggleTab={toggleTab} />
            {
              aboutLoading || privacyLoading || tosLoading ? <LoadSpinner/> : <>
              <TabContent activeTab={activeTab}>
                <TabPane tabId='1'>
                  <AboutUs data={aboutData} setIsUpdate={setIsUpdate}/>
                </TabPane>
              </TabContent>
              <TabContent activeTab={activeTab}>
                <TabPane tabId='2'>
                  <ContactUs activeTab={activeTab}/>
                </TabPane>
              </TabContent>
              <TabContent activeTab={activeTab}>
                <TabPane tabId='3'>
                  <Faq/>
                </TabPane>
              </TabContent>
              <TabContent activeTab={activeTab}>
                <TabPane tabId='4'>
                  <TOS data={tosData} setIsUpdate={setIsUpdate}/>
                </TabPane>
              </TabContent>
              <TabContent activeTab={activeTab}>
                <TabPane tabId='5'>
                  <PrivacyPolices data={privacyData} setIsUpdate={setIsUpdate}/>
                </TabPane>
              </TabContent>
              </>
            }
          </Col>
        </Row>
    </Fragment>
  )
}

export default StaticPages
