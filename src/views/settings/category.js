// ** React Imports
import { Fragment, useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Card, CardBody, Col, Form, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { useAppsMutation, useDeleteMutation, useGetMutation, useStoreMutation, useUpdateMutation } from '../../redux/rtkQuery/statics-pages/category'
import useHeaders from '../../utility/hooks/useHeaders'
import PagesSpinner from '../../@core/components/spinner/loaders'
import SystemModal from '../components/systemModal'
import SuccessAlert from '../components/handleStatusCode/success'
import ErrorAlert from '../components/handleStatusCode/error'
import classNames from 'classnames'

const FAQCategoies = () => {
  const {t, i18n} = useTranslation()
  const headers = useHeaders()
  
  const [appType, setAppType] = useState('all'),
        [modal, setModal] = useState(false),
        [show, setShow] = useState(false),
        [selected, setSelected] = useState(null),
        [form, setForm] = useState({
            name:'',
            app:appType
        })
        const [refreshKey, setRefreshKey] = useState(0)


  const [get, {data:categoryData, isLoading:categoryLoading}] = useGetMutation()
  const [getApps, {data:appData}] = useAppsMutation()
  const apps = appData?.data || []
  const [remove, {data:removeData, isLoading:removing, error:removeError, status:removeStatus}] = useDeleteMutation()
  const [update, {data:updateData, isLoading:updating, error:updateError, status:updateStatus}] = useUpdateMutation()
  const [store, {data:storeData, isLoading:storing, error:storeError, status:storeStatus}] = useStoreMutation()
 
  useEffect(() => {
        get({headers, type:appType})
        getApps({headers})
    }, [])
    
    const handleRemove = (item) => {
      if (!item?.id) return
      setSelected(item)
      setModal(true)
    }

    const handleAdd = () => {
        setSelected(null)
        setShow(true)
    }
    const handleUpdate = (item) => {
        setSelected(item)
        setShow(true)
        setForm({
            name:item.name,
            app:item.app_key
        })
    }
    const handleAppChange = (value) => {
        setAppType(value)
        get({headers, type:value})
    }
    const handleClose = () => {
      setShow(false)
      setModal(false)
      setSelected(null)
      setForm({
        name: '',
        app: appType
      })
    }


    useEffect(() => {
      if (removeStatus === 'fulfilled') {
        SuccessAlert({
          title: t('Success'),
          body: removeData?.message,
          position: 'top-left'
        })
        setTimeout(() => {
        handleClose()
        setRefreshKey(prev => prev + 1)
          get({ headers, type: appType })
        }, 200)
      } else if (removeStatus === 'rejected') {
        ErrorAlert({
          title: t('Failed'),
          body: removeError?.data?.message,
          position: 'top-left',
          button: t('Done')
        })
        handleClose()
      }
    }, [removeStatus])

    const handleSubmit = () => {
        if (selected === null) {
            const formData = new FormData()

            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value)
            })
            store({ headers, body: formData })
        } else {
            const formData = new URLSearchParams()
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value)
            })
            update({ headers, id: selected?.id, body: formData })
        }
    }

    const renderForm = () => {
    if (selected === null) {
      return (
        <Row>
          <Col xs={12}>
            <Label className='form-label' for='permission-name'>
              {t('Name')}
            </Label>
            <Input placeholder='Arabic Name of category' onChange={e => setForm({...form, name:e.target.value})}/>
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
      )
    } else {
      return (
        <Fragment>
          <Alert color='warning'>
            <h6 className='alert-heading'>{t('Warning')}</h6>
            <div className='alert-body'>
                {t('By updating name of this category you have to notice the faqs under this category')}
            </div>
          </Alert>
        <Row>
          <Col xs={12}>
            <Label className='form-label' for='permission-name'>
              {t('Name')}
            </Label>
            <Input  placeholder='Arabic Name of category' defaultValue={selected?.name} onChange={e => setForm({...form, name:e.target.value})}/>
          </Col>
          <Col xs={12} className='text-center mt-2'>
            <Button className='me-1' color='primary' onClick={handleSubmit} disabled={form.name === '' || updating} >
              {updating ? <Spinner size={'sm'}/> : t('Save changes')} 
            </Button>
            <Button outline type='reset' onClick={handleClose}>
              {t('Discard')}
            </Button>
          </Col>
        </Row>
        </Fragment>
      )
    }
    }
  
    useMemo(() => {
        if (storeStatus === 'fulfilled') {
        SuccessAlert({
            title: t('Success'),
            body: storeData?.message,
            position: 'top-left'
        })
        handleClose()
        get({headers, type:appType})
        } else if (storeStatus === 'rejected') {
        ErrorAlert({
            title: t('Failed'),
            body: storeError?.data?.message,
            position: 'top-left',
            button: t('Done')
        })
        handleClose()
        }
    }, [storeStatus])
    useMemo(() => {
        if (updateStatus === 'fulfilled') {
        SuccessAlert({
            title: t('Success'),
            body: updateData?.message,
            position: 'top-left'
        })
        get({headers, type:appType})
        handleClose()
        } else if (updateStatus === 'rejected') {
        ErrorAlert({
            title: t('Failed'),
            body: updateError?.data?.message,
            position: 'top-left',
            button: t('Done')
        })
        handleClose()
        }
    }, [updateStatus])

  return (
    <Fragment>
    <div className="d-flex justify-content-between align-items-center mb-3" style={{ flexWrap: 'wrap' }}>
        <div className="text-start">
            <h3>{t('FAQ Categories')}</h3>
            <p className="mb-2">
            {t('Management yot FAQ categories from here easily and quickly.')}
            </p>
        </div>
         <div className="d-flex align-items-center gap-2">
            <Input
            value={appType}
            type="select"
            style={{ width: '10rem' }}
            onChange={e => handleAppChange(e.target.value)}
            >
            {apps.map(item => (
                <option key={item} value={item}>
                {item}
                </option>
            ))}
            </Input>
            <Button color="primary" onClick={handleAdd}>
            {t('Add new')}
            </Button>
        </div>
      </div>
      <Row style={{height:'58vh', overflowY:'scroll', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {
            categoryLoading ? <PagesSpinner/> :
            categoryData?.data?.map((item, index) => {
            return (
                <Col  key={`faq-${item.id}-${refreshKey}`} xl={4} md={6}>
                <Card  key={`cat-${item.id}-${item.name}`}  style = {{
                    width: "100%", 
                    boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)", 
                    borderRadius: "5px", 
                    padding: "5px",
                    borderRight: "10px solid #0568a9"}}>
                    <CardBody>
                      <div className='d-flex justify-content-between align-items-end mt-1 pt-25'>
                        <div className='role-heading'>
                          <h6 className='fw-bolder' style={{ cursor: 'pointer' }}>{item.name}</h6>
                          <small
                            onClick={() => handleUpdate(item)}
                            className='fw-bolder'
                            style={{ color: '#0568a9', cursor: 'pointer' }}
                          >
                            {t('Update')}
                          </small>
                        </div>

                        {/* Move this to outer DOM if possible */}
                        <div
                          className='d-flex align-items-center'
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleRemove(item)}
                        >
                          <Trash2 size={20} color="#d87b34" />
                        </div>
                      </div>

                    </CardBody>
                </Card>
                </Col>
            )
            })}
      </Row>
      
      <Modal  isOpen={show}
              toggle={() => setShow(false)}
              onExit={handleClose}
              className='modal-dialog-centered'>
        <ModalHeader className='bg-transparent' toggle={() => setShow(!show)}></ModalHeader>
        <ModalBody
          className={classNames({
            'p-3 pt-0': selected !== null,
            'px-sm-5 pb-5': selected === null
          })}
        >
          <div className='text-center mb-2'>
            <h1 className='mb-1'>{selected !== null ? t('Edit') : t('Add New')} {t('Category')}</h1>
          </div>
          {renderForm()}
        </ModalBody>
      </Modal>
      
      <SystemModal show={modal}
                    setShow={setModal} 
                    title={`${t('Remove this category')} (${selected?.name}) !`} 
                    onReomve={() => remove({headers, id:selected?.id})}
                    isRemoving={removing}
                    status={removeStatus}
                    message={removeError?.data?.message}>
              <Alert color='warning'>
                <h6 className='alert-heading'>{`${t('Warning')}!`}</h6>
                <div className='alert-body' style={{fontSize:'11px'}}>
                {t('Once deleted, you will not be able to restore it and if you have any faqs under this category, the category will not be removed.')}
                </div>
              </Alert>
      </SystemModal>
        
      
    </Fragment>
  )
}

export default FAQCategoies
