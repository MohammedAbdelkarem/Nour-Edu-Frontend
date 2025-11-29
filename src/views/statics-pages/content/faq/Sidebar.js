// ** Custom Components
import Sidebar from '@components/sidebar'

// ** Reactstrap Imports
import { Label, Input, Button, Spinner } from 'reactstrap'

// ** Store & Actions\
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import { useStoreMutation, useUpdateMutation } from '../../../../redux/rtkQuery/statics-pages/faq'
import SuccessAlert from '../../../components/handleStatusCode/success'
import ErrorAlert from '../../../components/handleStatusCode/error'
import useHeaders from '../../../../utility/hooks/useHeaders'

const SidebarFAQ = ({ open, toggleSidebar, title, id, setHasChanged, mode = 'create', defaultValues = {} }) => {
  // ** States
  const headers = useHeaders()
  const [store, {isLoading, status, data, error}] = useStoreMutation()
  const [update, {isLoading:updating, data:updateData, status:updateStatus, error:updateError}] = useUpdateMutation()
  const {t} = useTranslation()

  const [form, setForm] = useState({
    question:'',
    answer:'',
    is_draft:0
  })

   useEffect(() => {
    if (mode === 'edit' && defaultValues) {
      setForm({
        question: defaultValues?.question || '',
        answer: defaultValues?.answer || '',
        is_draft: defaultValues?.is_draft ?? 0
      })
    }
  }, [mode, defaultValues])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  const handleSubmit = () => {
  const formData = mode === 'create' ? new FormData() : new URLSearchParams()
  Object.entries(form).forEach(([key, value]) => {
    formData.append(key, value)
  })
  formData.append('category_id', id)

  if (mode === 'edit') {
    update({ id: defaultValues.id, body: formData, headers })
  } else {
    store({ body: formData, headers })
  }
  }
  useMemo(() => {
    if (status === 'fulfilled') {
      SuccessAlert({
        title: t('Success'),
        body: data?.data?.message,
        position: 'top-left'
      })
      setHasChanged(true)
      setTimeout(() => (
       setHasChanged(false)
      ), 500)
      toggleSidebar()
    } if (status === 'rejected') {
      ErrorAlert({
        title: t('Failed'),
        body: error.data.message,
        button : t('Done')
      })
    }
  }, [status])
   useMemo(() => {
    if (updateStatus === 'fulfilled') {
      SuccessAlert({
        title: t('Success'),
        body: updateData?.data?.message,
        position: 'top-left'
      })
      setHasChanged(true)
      setTimeout(() => (
       setHasChanged(false)
      ), 500)
      toggleSidebar()
    } if (updateStatus === 'rejected') {
      ErrorAlert({
        title: t('Failed'),
        body: updateError.message,
        button : t('Done')
      })
    }
  }, [updateStatus])

  return (
    <Sidebar
      size='lg'
      open={open}
      title={t(title)}
      headerClassName='mb-1'
      contentClassName='pt-0'
      toggleSidebar={toggleSidebar}
    >
      <div className='mb-1'>
        <Label className='form-label' for='question_ar'>
          {t('Question')} <span className='text-danger'>*</span>
        </Label>
        <Input
          id='question'
          name='question'
          value={form['question']}
          onChange={handleChange}
          placeholder={t('Enter question')}
        />
      </div>

      <div className='mb-1'>
        <Label className='form-label' for='answer_ar'>
          {t('Answer')} <span className='text-danger'>*</span>
        </Label>
        <Input
          id='answer'
          name='answer'
          type='textarea'
          rows={5}
          value={form['answer']}
          onChange={handleChange}
          placeholder={t('Enter answer')}
        />
      </div>
      <Button type='submit' className='me-1' color='primary' disabled={form.question === '' || form.answer === '' || isLoading || updating} onClick={handleSubmit}>
        {isLoading || updating ? <Spinner size={'sm'}/> : t('Submit')}
      </Button>
      <Button type='reset' color='secondary' outline onClick={toggleSidebar}>
        {t('Discard')}
      </Button>
    </Sidebar>
  )
}

export default SidebarFAQ
