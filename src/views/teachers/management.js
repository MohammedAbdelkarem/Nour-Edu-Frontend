// ** Custom Components
import { useTranslation } from 'react-i18next'
// ** Reactstrap Imports
import { Button, Col, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import FileUploaderRestrictions from '../components/uplaoder/FileUploaderRestrictions'
import Avatar from '@components/avatar'
import { Edit2 } from 'react-feather'
import { useState, useEffect } from 'react'

const Management = ({ open, setForm, form, submitting, handleClose, selected, handleSubmit, image, setImage }) => {
  const {t} = useTranslation()
  const [updateImage, setUpdateImage] = useState(false)

  useEffect(() => {
    if (open) {
      setUpdateImage(false)
    }
  }, [open, selected])

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value
    value = value.replace(/\D/g, '')
    if (value.startsWith('0')) {
      value = value.substring(1)
    }
    if (value.length > 9) {
      value = value.substring(0, 9)
    }
    const formattedPhoneNumber = value.length === 9 ? `+963${value}` : value
    setForm({...form, phone_number: formattedPhoneNumber})
  }
  return (
    <Modal isOpen={open} className='modal-lg modal-dialog-centered' onClosed={() => handleClose()}>
    <ModalHeader className='bg-transparent' toggle={() => handleClose()}></ModalHeader>
    <ModalBody className='px-sm-5 mx-50 pb-5'>
      <h1 className='text-center mb-1'>{selected !== null ? t('update teacher details') : t('Add New Teacher')}</h1>
      <p className='text-center'>{ selected !== null ? t('update information of this teacher') : t('Add new teacher for your teachers list')}</p>
      <Row className='gy-1 gx-2 mt-75'>
        <Col md={6}>
          <Label className='form-label' for='teacher-name'>
            {t('Full name')} <span className="text-danger">*</span>
          </Label>
          <Input type='text' value={form.name} placeholder={t('Type name of teacher')} onChange={(e) => setForm({...form, name:e.target.value})}/>
        </Col>
        <Col md={6}>
          <Label className='form-label' for='teacher-email'>
            {t('Email')}
          </Label>
          <Input type='email' value={form.email} placeholder={t('teacher@example.com')} onChange={(e) => setForm({...form, email:e.target.value})}/>
        </Col>
          <Col md={6}>
            <Label className='form-label' for='teacher-phone'>
              {t('Phone number')} <span className="text-danger">*</span>
            </Label>
            <Input type='text' maxLength={10} value={form.phone_number} placeholder={t('09xxxxxxxx')} onChange={handlePhoneNumberChange} />
          </Col>
        <Col md={6}>
          <Label className='form-label' for='teacher-birthdate'>
            {t('Birth Date')}
          </Label>
          <Input type='date' value={form.birth_date} onChange={(e) => setForm({...form, birth_date:e.target.value})} />
        </Col>
        <Col md={6}>
          <Label className='form-label' for='teacher-gender'>
            {t('Gender')}
          </Label>
          <Input type='select' value={form.is_male ? 'male' : 'female'} onChange={(e) => setForm({...form, is_male: e.target.value === 'male'})}>
            <option value='male'>{t('Male')}</option>
            <option value='female'>{t('Female')}</option>
          </Input>
        </Col>
        <Col md={12}>
          <Label className='form-label' for='teacher-bio'>
            {t("Teacher's bio")}
          </Label>
          <Input type='textarea' name='text' id='floating-textarea' style={{ minHeight: '100px' }} value={form.bio} placeholder={t("أضف وصف من أجل الاستاذ")} onChange={(e) => setForm({...form, bio:e.target.value})} />
        </Col>
        {
          selected && !updateImage && 
          <>
          <Label> {t('Profile picture')} <Edit2 style={{stroke:'#38b6ff', cursor:'pointer'}} size={12} onClick={() => setUpdateImage(true)}/> </Label> 
          </>
        }
        <Col md={ selected && !updateImage ? 4 : 1}/>
        <Col md={selected && !updateImage ? 8 : 10}>
          {
            selected && !updateImage  ? <Avatar img={selected?.image?.url} imgHeight={160} imgWidth={160}/>  : <FileUploaderRestrictions title={'Upload teacher image'} files={image} setFiles={setImage} accept={{'image/*': ['.png', '.jpg', '.jpeg']}}/> 
          }
        </Col>
        <Col md={1}/>
        <Col className='text-center mt-1' xs={12}>
          <Button type='submit' disabled={form.name === '' || (!selected && form?.phone_number === '')} className='me-1' color='primary' onClick={handleSubmit}>
            { submitting ? <Spinner type='grow' size='sm'/> : (selected ? t('Update') : t('Submit'))} 
          </Button>
          <Button color='secondary' outline onClick={handleClose}>
            {t('Discard')}
          </Button>
        </Col>
      </Row>
    </ModalBody>
  </Modal>
  )
}

export default Management
