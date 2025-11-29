// ** React Imports
import { useEffect, useMemo, useState } from 'react'
import { Edit, MoreVertical, PlusCircle, Trash } from 'react-feather'

// ** Icons Imports
import { useTranslation } from 'react-i18next'

// ** Reactstrap Imports
import {
  Nav,
  Row,
  Col,
  NavItem,
  NavLink,
  TabContent,
  AccordionBody,
  AccordionItem,
  AccordionHeader,
  UncontrolledAccordion,
  TabPane,
  Card,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Label,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Placeholder,
  Alert,
  CardTitle
} from 'reactstrap'
import { useAppsMutation, useGetMutation as useGetCategory, useStoreMutation } from '../../../../redux/rtkQuery/statics-pages/category'
import { useDeleteMutation, useGetMutation } from '../../../../redux/rtkQuery/statics-pages/faq'
import classNames from 'classnames'
// ** Third Party Components
import Select from 'react-select'
import useHeaders from '@hooks/useHeaders'
// ** Utils
import { selectThemeColors } from '@utils'
import SidebarFAQ from './Sidebar'
import SystemModal from '../../../components/systemModal'
import SuccessAlert from '../../../components/handleStatusCode/success'
import ErrorAlert from '../../../components/handleStatusCode/error'
import EmptyComponent from '../../../components/empty'
import LoadSpinner from '../../../../@core/components/spinner/loaders'

const Faqs = ({ setSelected, selected }) => {
  const {t, i18n} = useTranslation()
  const headers = useHeaders()
  // ** States
  const [categoriesData, setCategoriesData] = useState([])
  const [hasChanged, setHasChanged] = useState(false)
  const [getCategory, {data:categoryData, isLoading:categoryLoading, status:categoryStatus}] = useGetCategory()
  const [getFaq, {data:faqData, isLoading:faqLoading}] = useGetMutation()
  const [remove, {isLoading:removing, status:removeStatus, error:removeError, data:removeData}] = useDeleteMutation()

  useEffect(() => {
    getCategory({headers, type:'all'})
  }, [])
  useMemo(() => {
    if (categoryStatus === 'fulfilled') {
      setCategoriesData(categoryData?.data)
      setSelected(categoryData?.data[0])
    }
  }, [categoryStatus])
  
  useMemo(() => {
    if (selected) {
      getFaq({headers, id:selected?.id})
    }
  }, [selected, hasChanged])
  
  const [sidebar, setSidebar] = useState(false)
  const [removeModal, setRemoveModal] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState(null)
  const [mode, setMode] = useState('create')
  const [activeTab, setActiveTab] = useState(null)
  const [getApps, {data:appData, isLoading:loadingApp}] = useAppsMutation()
  const apps = appData?.data.map((item) => ({
    value: item,
    label: item
  }))
  const [store, {data:storeData, isLoading:storing, status:storeStatus}] = useStoreMutation()
  const [show, setShow] = useState(false),
        [form, setForm] = useState({
            name:'',
            app:''
        })
  const handleAdd = () => {
      setShow(true)
      getApps({headers})
  }
  const renderTabs = () => {
    return (
      <Nav vertical pills>
        <NavItem>
          <Button
            color='primary'
            outline
            className='w-100 mb-1'
            onClick={handleAdd}>
            + {t('Add new')}
          </Button>
        </NavItem>

        {/* Existing Categories */}
        {categoriesData?.map((item, index) => (
          <NavItem key={item.id}>
            <NavLink
              active={item?.id === selected?.id}
              onClick={() => {
                setActiveTab(item.id)
                setSelected(item)
              }}
            >
              {`${index + 1}_ ${item?.name}`}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
    )
  }
  const renderSkeletonTabs = () => {
    return (
      <Nav vertical pills>
        <NavItem className="mb-2">
          <Placeholder className="w-100" style={{ height: '100px', borderRadius: '5px', color:'#eee' }} />
        </NavItem>
        {[...Array(9)].map((_, idx) => (
          <NavItem key={idx} className="mb-2">
            <Placeholder className="w-100" style={{ height: '100px', borderRadius: '5px', color:'#eee' }} />
          </NavItem>
        ))}
      </Nav>
    )
  }

  useMemo(() => {
    if (removeStatus === 'fulfilled') {
      SuccessAlert({
        title: t('Success'),
        body: removeData?.message,
        position: 'top-left'
      })
      getFaq({headers, id:selected?.id})
    } else if (removeStatus === 'rejected') {
      ErrorAlert({
        title: t('Failed'),
        body: removeError?.data?.message,
        position: 'top-left', 
        button: t('Done')
      })
    }
  }, [removeStatus])

  const handleClose = () => {
      setShow(false)
      setSidebar(false)
      setMode('create')
      setForm({
        name:'',
        app:'all'
      })
  }
  const handleDelete = (item) => {
    setRemoveModal(true)
    setSelectedFAQ(item)
  }
  const handleEdit = (item) => {
    setMode('edit')
    setSidebar(true)
    getApps({headers})
    setSelectedFAQ(item)
  }
  
  const renderTabContent = () => {
    return faqData?.data?.faqs?.length === 0 ? <EmptyComponent title={t('No Data')} body={t('No FAQ added')}/> : faqData?.data?.faqs?.map((item) => (
      <TabPane key={item.id} tabId={activeTab}>
        <UncontrolledAccordion className='accordion-margin mt-2'>
          <AccordionItem key={item.id}>
            <AccordionHeader tag='h2' targetId={item.id} className='d-flex justify-content-between align-items-center'>
              <UncontrolledDropdown>
                <DropdownToggle tag='span' className='dropdown-toggle'>
                  <MoreVertical size={18} />
                </DropdownToggle>
                <DropdownMenu end>
                  <DropdownItem onClick={() => handleEdit(item)}>
                    <Edit size={14} className='me-50' />
                    <span className='align-middle'>{t('Edit')}</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => handleDelete(item)}>
                    <Trash size={14} className='me-50' />
                    <span className='align-middle'>{t('Remove')}</span>
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown><div style={{ flex: 1, overflow: 'hidden' }}>
                
                <CardTitle
                  tag='h6'
                  title={item.question}
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: 0
                  }}
                >
                  {item.question}
                </CardTitle>
              </div>
            </AccordionHeader>
            <AccordionBody accordionId={item.id}>
              {item.answer}
            </AccordionBody>
          </AccordionItem>
        </UncontrolledAccordion>
      </TabPane>
    ))
  }

  const handleSubmit = () => {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
          formData.append(key, value)
      })
      store({ headers, body: formData })
  }
  useMemo(() => {
    if (storeStatus === 'fulfilled') {
      setCategoriesData(prev => [storeData?.data, ...prev])
      setActiveTab(storeData?.data?.id)
      setSelected(storeData?.data)
      handleClose()
    }
  }, [storeStatus])  
    
  return (
    <div id='faq-tabs'>
      <Row style={{marginTop:'30px'}}>
        <Col lg='3' md='4' sm='12'>
          <div className='faq-navigation d-flex flex-column mb-2 mb-md-0' style={{  maxHeight: '60vh', overflowY: 'scroll', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <Nav tag='ul' className='nav-left' pills vertical>
              { categoryLoading ? renderSkeletonTabs() : renderTabs()}
            </Nav>
          </div>
        </Col>
        <Col lg='9' md='8' sm='12'>
        <Card style={{padding:'30px', background:'#ECF5EF'}}>
          <div className='d-flex align-items-center'>
            <div className='d-flex align-items-center justify-content-between w-100'>
              <h4 className='mb-0'>{t('Frequently Asked Questions list')}</h4>
              <PlusCircle size={20} style={{color:'#0568a9', cursor:'pointer'}} onClick={() => setSidebar(true)}/>
            </div>
          </div>
          {
            faqLoading ? <LoadSpinner/> : <TabContent activeTab={activeTab}>{renderTabContent()}</TabContent>
          }
        </Card>
        </Col>
      </Row>
      <Modal isOpen={show} onClosed={handleClose} toggle={() => setShow(!show)} className='modal-dialog-centered'>
          <ModalHeader className='bg-transparent' toggle={() => setShow(!show)}></ModalHeader>
          <ModalBody
            className={classNames({
              'p-3 pt-0': selected !== null,
              'px-sm-5 pb-5': selected === null
            })}
          >
            <div className='text-center mb-2'>
              <h1 className='mb-1'>{t('Add new category')}</h1>
            </div>
            <Row>
              <Col xs={12} className={'m-1'}>
                <Label className='form-label' for='permission-name'>
                  {t('Name')}
                </Label>
                <Input placeholder='Name of your category' onChange={e => setForm({...form, name:e.target.value})}/>
              </Col>
              <Col className='m-1' md='12' sm='12'>
                <Label className='form-label'>{t('Type')}</Label>
                <Select
                  theme={selectThemeColors}
                  className='react-select'
                  classNamePrefix='select'
                  options={apps}
                  isClearable={false}
                  isLoading={loadingApp}
                  onChange={e => setForm({...form, app : e.value})}
                />
              </Col>
              <Col xs={12} className='text-center mt-2'>
                <Button className='me-1' color='primary' onClick={handleSubmit} disabled={form.name === '' || storing }>
                  {storing ? <Spinner size={'sm'}/> : t('Submit')} 
                </Button>
                <Button outline type='reset' onClick={handleClose}>
                  {t('Discard')}
                </Button>
              </Col>
            </Row>
          </ModalBody>
      </Modal>
        {
          sidebar && <SidebarFAQ
                open={sidebar}
                toggleSidebar={handleClose}
                title={mode === 'edit' ? "Edit FAQ Details" : 'Add new FAQ'}
                id={selected?.id}
                mode={mode}
                setHasChanged={setHasChanged}
                defaultValues={{
                  id: selectedFAQ?.id,
                  question: selectedFAQ?.question,
                  answer: selectedFAQ?.answer,
                is_draft:selectedFAQ?.is_draft ? 1 : 0
              }}
            />
        }
        {
          removeModal && (
          <SystemModal show={removeModal}
                        setShow={setRemoveModal} 
                        title={`${t('Remove this FAQ')} (${selectedFAQ?.question}) !`} 
                        onReomve={() => remove({headers, id:selectedFAQ?.id})}
                        isRemoving={removing}
                        status={removeStatus}
                        message={removeError?.data?.message}>
                  <Alert color='warning'>
                    <h6 className='alert-heading'>{`${t('Warning')}!`}</h6>
                    <div className='alert-body' style={{fontSize:'11px'}}>
                    {t('Are you sure you want to remove this question? it will not shown to users!!')}
                    </div>
                  </Alert>
          </SystemModal>
          )
        }
    </div>
  )
}

export default Faqs
