// ** React Imports
import { useEffect, useMemo, useState } from 'react'


// ** Custom Components
import Breadcrumbs from '@components/breadcrumbs'

// ** Reactstrap Imports
import { Row, Col, Card, CardBody, Form, Label, Input, Button, CardHeader, CardTitle, Spinner } from 'reactstrap'

// ** Styles
import '@styles/react/libs/editor/editor.scss'
import '@styles/base/plugins/forms/form-quill-editor.scss'
import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/base/pages/page-blog.scss'
import { useTranslation } from 'react-i18next'
import { useStoreMutation, useUpdateMutation } from '../../../../redux/rtkQuery/content/banner'
import { useUpdateMutation as updateMedia } from '../../../../redux/rtkQuery/media'

import useHeaders from '@hooks/useHeaders'
import SuccessAlert from '../../../components/handleStatusCode/success'
import { useLocation, useNavigate } from 'react-router-dom'
import ErrorAlert from '../../../components/handleStatusCode/error'
const BannerManagement = () => {
  const headers = useHeaders()
  const navigate = useNavigate()
  const {t} = useTranslation()
  const state = useLocation()?.state
  const isClinic = !!state?.clinic
console.log('state', state)

  const [store, { isLoading: storing, status: storeStatus, error: storeError }] = useStoreMutation()
  const [update, {isLoading:updating, status:updateStatus, error:updateError}] = useUpdateMutation()
  const [updateImage, { isLoading: updatingImage }] = updateMedia()
  
  const [formData, setFormData] = useState({
    title: '',
    external_link: '',
    description: '',
    image: null
  })
  // ** States
  const [featuredImg, setFeaturedImg] = useState(null),
        [imgPath, setImgPath] = useState('banner.jpg')
  const handleImageChange = e => {
      const file = e.target.files[0]
      if (file) {
        const imageUrl = URL.createObjectURL(file)
        setFeaturedImg(imageUrl)
        setImgPath(file)
        setFormData(prev => ({ ...prev, image: file }))
      }
    }

  const handleChange = e => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    useEffect(() => {
      if (state) {
        const imageMedia = state?.media?.find(m => m.type === 'image')

        setFormData({
            title:state.title,
            external_link:state.external_link,
            description:state.description,
            image: null
          })
        setFeaturedImg(imageMedia?.url || null)

      }
    }, [state])
    const handleSubmit = async () => {
  // Check if this is a new banner creation (from C_Level) or editing existing banner
  const isNewBanner = state?.bannerable_id && state?.bannerable_type && !state?.id
  const isEdit = !!state && !isClinic && !isNewBanner
  const payload = new FormData()

  if (isEdit) payload.append('_method', 'PUT')

  payload.append('title', formData.title)
  payload.append('description', formData.description)
  
  if (isNewBanner) {
    // Create new banner for C_Level
    payload.append('bannerable_id', state.bannerable_id)
    payload.append('bannerable_type', state.bannerable_type)
  } else if (isEdit) {
    payload.append('bannerable_id', isClinic || state.bannerable_id ? state?.bannerable_id : '')
    payload.append('bannerable_type', isClinic || state.bannerable_id ? 'C_Level' : '')
  } else if (!isEdit) {
    payload.append('bannerable_id', isClinic || state?.bannerable_id ? state?.clinic?.id : '')
    payload.append('bannerable_type', isClinic || state?.bannerable_id ? 'C_Level' : '')
  }
  payload.append('external_link', formData.external_link ?? '')

  try {
    if (isNewBanner) {
      // Creating a new banner for C_Level
      if (formData.image) {
        payload.append('image', formData.image)
      }
      store({ headers, body: payload })
    } else if (isEdit) {
      if (formData.image && state?.media?.[0]?.id) {
        const imagePayload = new FormData()
        imagePayload.append('_method', 'PUT')
        imagePayload.append('images[]', formData.image)
        await updateImage({ id: state.media[0].id, headers, body: imagePayload }).unwrap()
      }

      update({ headers, body: payload, id: state.id })
    } else {
      if (formData.image) {
        payload.append('image', formData.image)
      }
      store({ headers, body: payload })
    }
  } catch (error) {
    console.error('Error updating image:', error)
    ErrorAlert({
      title: 'Image Upload Failed',
      body: t('Could not upload image. Please try again.'),
      button: t('Done')
    })
  }
}

  useMemo(() => {
    if (storeStatus === 'fulfilled') {
      SuccessAlert({
        title: 'Success',
        body: 'Banner saved successfully',
        position: 'top-left'
      }) 
      navigate(-1)
    }
    if (storeStatus === 'rejected') {
      ErrorAlert({
        title: 'Error',
        body: storeError?.data?.message,
        button: t('Done')
      })
    }
  }, [storeStatus])
  useMemo(() => {
    if (updateStatus === 'fulfilled') {
      SuccessAlert({
        title: 'Success',
        body: 'Banner updated successfully',
        position: 'top-left'
      }) 
      navigate(-1)
    }
    if (updateStatus === 'rejected') {
      ErrorAlert({
        title: 'Error',
        body: updateError?.data?.message,
        button: t('Done')
      })
    }
  }, [updateStatus])

  return (
    <div className='blog-edit-wrapper'>
      <Breadcrumbs title={t('Manging Content')} data={[{ title: t('Content list'), link: '/content-pages' }, {title: t('Manging Banner')}]} />
        <Row>
          <Col sm='12'>
            <Card style = {{ width: "100%", 
                             boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)", 
                             borderRadius: "5px", 
                             padding: "5px",
                             borderRight: "10px solid #0568a9"}}>
              <CardHeader>
                <CardTitle className="text-capitalize border-bottom" style={{ fontSize:'20px' }}>{t('Manging Banner')}</CardTitle>
              </CardHeader>
              <CardBody>
                <Form className='mt-2' onSubmit={e => e.preventDefault()}>
                  <Row>
                    <Col md='6' className='mb-2'>
                      <Label className='form-label' for='blog-edit-title'>
                        {t('Title')}
                      </Label>
                      <Input
                          id='blog-edit-title'
                          name='title'
                          value={formData.title}
                          onChange={handleChange}
                        />
                    </Col>
                    <Col md='6' className='mb-2'>
                      <Label className='form-label' for='blog-edit-slug'>
                        {t('External Link')}
                      </Label>
                        <Input
                          id='blog-edit-title'
                          name='external_link'
                          value={formData.external_link}
                          onChange={handleChange}
                        />
                    </Col>
                    
                    <Col sm='12' className='mb-2'>
                      <Label className='form-label'>{t('Description')}</Label>
                      <Input id='blog-edit-slug' type='textarea' name='description' rows={5} value={formData.description} onChange={handleChange}/>
                    </Col>
                    <Col className='mb-2' sm='12'>
                      <div className='border rounded p-2'>
                        <h4 className='mb-1'>{t('Image')}</h4>
                        <div className='d-flex flex-column flex-md-row'>
                          { 
                            featuredImg !== null &&
                              <img
                                className='rounded me-2 mb-1 mb-md-0'
                                src={featuredImg}
                                alt='featured img'
                                width='170'
                                height='110'
                              />
                              }
                          <div>
                            <small className='text-muted'>Required image resolution 800x400, image size 10mb.</small>
                              <p className='my-50'>
                              {featuredImg ? `C:/fakepath/${imgPath.name}` : t('No image selected')}
                            </p>
                            <div className='d-inline-block'>
                              <div className='mb-0'>
                                <Input
                                  type='file'
                                  id='exampleCustomFileBrowser'
                                  name='customFile'
                                  onChange={handleImageChange}
                                  accept='.jpg, .png, .jpeg'
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col className='mt-50 d-flex justify-content-end'>
                      <Button color='primary' className='me-1' disabled={storing || updating || updatingImage} onClick={() => handleSubmit()}>
                        {storing || updating || updatingImage ? <Spinner size={'sm'}/> : t('Submit')}
                      </Button>
                      <Button color='secondary' outline  onClick={() => navigate('/content-pages')} >
                        {t('Discard')}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
    </div>
  )
}

export default BannerManagement
