import { Fragment, useState, useMemo } from 'react'
import { Row, Col, Card, Input, Label, Button, CardBody, CardTitle, CardHeader, Spinner } from 'reactstrap'
import { useUpdateMutation } from '../../../redux/rtkQuery/admin'
import useHeaders from '../../../utility/hooks/useHeaders'
import SuccessAlert from '../../components/handleStatusCode/success'
import ErrorAlert from '../../components/handleStatusCode/error'
import { useTranslation } from 'react-i18next'
const AccountUpdate = ({ data, setIsChanged }) => {  
  const {t} = useTranslation()
  const headers = useHeaders()
  const [update, {isLoading, status, error}] = useUpdateMutation()
  const [avatar, setAvatar] = useState(data?.avatar)
  const [formData, setFormData] = useState({
    name: data?.name || '',
    email: data?.email || '',
    phone_number: data?.phone_number || '',
    birth_date: data?.birth_date || ''
  })
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }
  const handleSubmit = () => {
    const body = new FormData()
    body.append('_method', 'PUT')
    body.append('role_id', data?.role_id)
    body.append('name', formData.name)
    if (avatar instanceof File) {
      body.append('avatar', avatar)
    }
    body.append('delete_image', 0)
    body.append('phone_number', formData?.phone_number)
    body.append('email', formData?.email)
    body.append('password', '')
    body.append('birth_date', formData.birth_date)
    body.append('is_male', 1)
    body.append('city_id', '')
    update({ headers, body, id:data?.id })
  }
  useMemo(() => {
      if (status === 'fulfilled') {
        SuccessAlert({
          title: 'عملية ناجحة',
          body: ("تم التحديث بنجاح"),
          position: 'top-left'
        })
        setIsChanged(true)
        setTimeout(() => (
          setIsChanged(false)
        ), 100)
      } else if (status === 'rejected') {
        ErrorAlert({
          title: 'فشل',
          body: error.data.message,
          button: "تم"
        })
      }
    }, [status])

    const onChange = e => {
      const file = e.target.files[0]
      setAvatar(file)  
    }
    const avatarPreview = useMemo(() => {
      if (!avatar) return ''  
      if (typeof avatar === 'string') return avatar 
      return URL.createObjectURL(avatar) 
    }, [avatar])


  return (
    <Fragment>
      <Card>
        <CardHeader className='border-bottom'>
          <CardTitle tag='h4'>{t('Profile Details')}</CardTitle>
        </CardHeader>
        <CardBody className='py-2 my-25'>
          <div className='d-flex'>
            <div className='me-25'>
              <img className='rounded me-50' src={avatarPreview} alt='Avatar' height='100' width='100' />
            </div>
            <div className='d-flex align-items-end mt-75 ms-1'>
              <div>
                <Button tag={Label} className='mb-75 me-75' size='sm' color='primary'>
                  {t('Upload')}
                  <Input type='file' onChange={onChange} hidden accept='image/*' />
                </Button>
                <p className='mb-0'>Allowed JPG, GIF or PNG. Max size of 800kB</p>
              </div>
            </div>
          </div>
            <Row>
              <Col sm='6' className='mb-1'>
                <Label className='form-label' for='firstName'>
                  {t('Name')}
                </Label>
                <Input id='firstName' name={'name'} defaultValue={data?.name} onChange={handleChange}/>
              </Col>
              <Col sm='6' className='mb-1'>
                <Label className='form-label' for='emailInput'>
                  {t('E-mail')}
                </Label>
                <Input id='emailInput' type='email' name='email' defaultValue={data?.email} onChange={handleChange}/>
              </Col>
              <Col sm='6' className='mb-1'>
                <Label className='form-label' for='phNumber'>
                  {t('Phone Number')}
                </Label>
                <Input
                  dir='ltr'
                  id='phNumber'
                  name='phone_number'
                  className='form-control'
                  defaultValue={data?.phone_number}
                  onChange={handleChange}
                />
              </Col>
              <Col sm='6' className='mb-1'>
                <Label className='form-label' for='address'>
                  {t('Date of Birth')}
                </Label>
                <Input id='address' name='birth_date' defaultValue={data?.birth_date} onChange={handleChange} />
              </Col>
              <Col className='mt-2' sm='12'>
                <Button type='submit' className='me-1' color='primary' onClick={handleSubmit}>
                  {isLoading ? <Spinner size='sm' color='light'/> : t('Save changes')}
                </Button>
                <Button color='secondary' outline>
                  {t('Discard')}
                </Button>
              </Col>
            </Row>
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default AccountUpdate
