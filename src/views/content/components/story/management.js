// ** React Imports
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
// ** Custom Components
import Breadcrumbs from '@components/breadcrumbs'
// ** Reactstrap Imports
import { Row, Col, Card, CardBody, Form, Label, Input, Button, CardHeader, CardTitle, Spinner } from 'reactstrap'
// ** Styles
import '@styles/react/libs/editor/editor.scss'
import '@styles/base/plugins/forms/form-quill-editor.scss'
import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/base/pages/page-blog.scss'

import DateMask from '../../../components/dateMask'
import { useStoreMutation, useUpdateMutation } from '../../../../redux/rtkQuery/content/story'
import useHeaders from '@hooks/useHeaders'
import SuccessAlert from '../../../components/handleStatusCode/success'
import ErrorAlert from '../../../components/handleStatusCode/error'
import { useUpdateMutation as updateMedia } from '../../../../redux/rtkQuery/media'
import { useLocation, useNavigate } from 'react-router-dom'

const StoryManagement = () => {
  const { t } = useTranslation()
  const headers = useHeaders()
  const navigate = useNavigate()
  const state = useLocation()?.state
console.log('state', state)

  const isClinic = !!state?.clinic
  const selectedItem = state // renamed for clarity

  const [store, { isLoading: storing, status: storeStatus, error: storeError }] = useStoreMutation()
  const [update, { isLoading: updating, status: updateStatus, error: updateError }] = useUpdateMutation()
  const [updateImage, { isLoading: updatingImage }] = updateMedia()

  const [formData, setFormData] = useState({
    title: '',
    link: '',
    endDate: '',
    description: '',
    image: null
  })

  const [featuredImg, setFeaturedImg] = useState(null)
  const [imgPath, setImgPath] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)

  useEffect(() => {
    if (state) {
      const imageMedia = state.media?.find(m => m.type === 'image')
      const videoMedia = state.media?.find(m => m.type === 'video')

      setFormData({
        title: state.title || '',
        link: state.link || '',
        endDate: state.ended_at?.slice(0, 10) || '',
        description: state.description || '',
        image: null
      })

      setFeaturedImg(imageMedia?.url || null)
      setVideoPreview(videoMedia?.url || null)
    }
  }, [state])


  const onVideoChange = e => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file) {
      setImgPath(file)
      setFeaturedImg(URL.createObjectURL(file))
      setFormData(prev => ({ ...prev, image: file }))
    }
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
console.log('formData', formData)

  const handleSubmit = async () => {
    // Check if this is a new story creation (from C_Level) or editing existing story
    const isNewStory = state?.storiable_id && state?.storiable_type && !state?.id

    if (isNewStory) {
      // Create new story for C_Level
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('end_at', formData.endDate || '')
      payload.append('description', formData.description)
      payload.append('storiable_id', state.storiable_id)
      payload.append('storiable_type', state.storiable_type)
      payload.append('external_link', formData.link || '')
      if (formData.image) payload.append('image', formData.image)
      if (videoFile) payload.append('video', videoFile)

      store({ headers, body: payload })
    } else if (state && !isClinic) {
      // Update existing story
      const payload = new URLSearchParams()
      payload.append('_method', 'PUT')
      payload.append('title', formData.title)
      payload.append('end_at', formData.endDate || '')
      payload.append('description', formData.description)
      payload.append('storiable_id', state?.storiable_id ? state?.storiable_id : '')
      payload.append('storiable_type', state?.storiable_type || '')
      payload.append('delete_video', 0)
      payload.append('external_link', formData.link || '')

      const imageMedia = selectedItem?.media?.find(m => m.type === 'image')
      const videoMedia = selectedItem?.media?.find(m => m.type === 'video')

      const uploadPromises = []

      if (formData.image && imageMedia?.id) {      
        const imageForm = new FormData()
        imageForm.append('_method', 'PUT')
        imageForm.append('images[]', formData.image)
        uploadPromises.push(updateImage({ id: imageMedia.id, headers, body: imageForm }).unwrap())
      }

      if (videoFile && videoMedia?.id) {
        const videoForm = new FormData()
        videoForm.append('_method', 'PUT')
        videoForm.append('videos[]', videoFile)
        uploadPromises.push(updateImage({ id: videoMedia.id, headers, body: videoForm }).unwrap())
      }

      try {
        // Wait until all media updates complete successfully
        if (uploadPromises.length > 0) {
          await Promise.all(uploadPromises)
        }

        // After successful media updates, update the story
        update({ headers, body: payload, id: state.id })

      } catch (err) {
        console.error('Media update failed:', err)
        ErrorAlert({
          title: 'Error',
          body: t('Failed to upload image or video'),
          button: t('Done')
        })
      }
    }
  }

  useEffect(() => {
    if (storeStatus === 'fulfilled') {
      SuccessAlert({ title: 'Success', body: 'Story created successfully', position: 'top-left' })
      navigate(-1)
    } else if (storeStatus === 'rejected') {
      ErrorAlert({ title: 'Error', body: storeError?.data?.message, button: t('Done') })
    }
  }, [storeStatus])

  useEffect(() => {
    if (updateStatus === 'fulfilled') {
      SuccessAlert({ title: 'Success', body: 'Story updated successfully', position: 'top-left' })
      navigate(-1)
    } else if (updateStatus === 'rejected') {
      ErrorAlert({ title: 'Error', body: updateError?.data?.message, button: t('Done') })
    }
  }, [updateStatus])

  return (
    <div className='blog-edit-wrapper'>
      <Breadcrumbs title={t('Managing content')} data={[{ title: t('Managing content'), link: '/content-pages' }, { title: t('Managing Story') }]} />
      <Row>
        <Col sm='12'>
          <Card style={{ width: "100%", boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)", borderRadius: "5px", padding: "5px", borderRight: "10px solid #0568a9" }}>
            <CardHeader>
              <CardTitle className="text-capitalize border-bottom" style={{ fontSize: '20px' }}>{t('Managing Story')}</CardTitle>
            </CardHeader>
            <CardBody>
              <Form className='mt-2' onSubmit={e => e.preventDefault()}>
                <Row>
                  <Col md='4' className='mb-2'>
                    <Label className='form-label'>{t('Title')}</Label>
                    <Input name='title' value={formData.title} onChange={handleChange} />
                  </Col>
                  <Col md='4' className='mb-2'>
                    <Label className='form-label'>{t('External link')}</Label>
                    <Input name='link' value={formData.link} onChange={handleChange} />
                  </Col>
                  <Col md='4' className='mb-2'>
                    <Label className='form-label'>{t('End Date')}</Label>
                    <DateMask onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} value={formData.endDate} />
                  </Col>
                  <Col sm='12' className='mb-2'>
                    <Label className='form-label'>{t('Description')}</Label>
                    <Input type='textarea' name='description' rows={5} value={formData.description} onChange={handleChange} />
                  </Col>
                  <Col sm='12' className='mb-2'>
                    <div className='border rounded p-2'>
                      <h4 className='mb-1'>{t('Image')}</h4>
                      <div className='d-flex flex-column flex-md-row'>
                        {featuredImg &&
                          <img src={featuredImg} alt='featured img' className='rounded me-2 mb-1 mb-md-0' style={{ maxHeight: '200px', width: '200px', objectFit: 'cover' }} />
                        }
                        <div>
                          <small className='text-muted'>Required image resolution 800x400, image size 10mb.</small>
                          <p className='my-50'>{imgPath ? `C:/fakepath/${imgPath.name}` : t('No image selected')}</p>
                          <Input type='file' accept='.jpg,.png,.jpeg' onChange={handleImageChange} />
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col sm='12' className='mb-2'>
                    <div className='border rounded p-2'>
                      <h4 className='mb-1'>{t('Video')}</h4>
                      <div className='d-flex flex-column flex-md-row'>
                        {videoPreview && (
                          <video className='rounded me-2 mb-1 mb-md-0' width='170' height='110' controls src={videoPreview} />
                        )}
                        <div>
                          <small className='text-muted'>{t('Allowed formats')}: .mp4, .webm, .ogg — {t('Max size')}: 50MB</small>
                          <p className='my-50'>{videoFile ? `C:/fakepath/${videoFile.name}` : t('No video selected')}</p>
                          <Input type='file' accept='video/mp4,video/webm,video/ogg' onChange={onVideoChange} />
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col className='mt-50 d-flex justify-content-end'>
                    <Button color='primary' disabled={storing || updating || updatingImage} onClick={handleSubmit}>
                      {storing || updating || updatingImage ? <Spinner size='sm' /> : t('Submit')}
                    </Button>
                    <Button color='secondary' outline onClick={() => navigate('/content-pages')} className='ms-1'>
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

export default StoryManagement
