// ** Reactstrap Imports
import { Card, Button, CardHeader, CardTitle, CardBody, Alert, Input, Label, Spinner } from 'reactstrap'

// ** Styles
import '@styles/base/plugins/extensions/ext-component-sweet-alerts.scss'
import { useMemo, useState } from 'react'
import { useDeactivateMutation } from '../../../redux/rtkQuery/admin'
import SuccessAlert from '../../components/handleStatusCode/success'
import ErrorAlert from '../../components/handleStatusCode/error'
import useHeaders from '../../../utility/hooks/useHeaders'
import { t } from 'i18next'
const UnactivateAccount = ({id}) => {
  const headers = useHeaders()
  const [reset, {isLoading, error, status}] = useDeactivateMutation()
  const [confirm, setConfirm] = useState(false)
  const submit = () => {
    reset({headers, id})
  }
  
  useMemo(() => {
    if (status === 'fulfilled') {
      SuccessAlert({
        title: 'عملية ناجحة',
        body: ("تم إعادة تعيين معلومات تعريف الجهاز بنجاح"),
        position: 'top-left'
      })
      setConfirm(false)
    } else if (status === 'rejected') {
      ErrorAlert({
        title: 'فشل',
        body: error.data.message,
        button: "تم"
      })
    }
  }, [status])

  return (
    <Card>
      <CardHeader className='border-bottom'>
        <CardTitle tag='h4'>{t('Deactivate Account')}</CardTitle>
      </CardHeader>
      <CardBody className='py-2 my-25'>
        <Alert color='danger'>
          <h4 className='alert-heading'>هل أنت متأكد من إعادة تعيين معلومات تعريف الجهاز؟</h4>
          <div className='alert-body fw-normal'>
            بمجرد تأكيد عملية إعادة التعيين لن تتمكن من الرجوع للمعلومات السابقة.
          </div>
        </Alert>
          <div className='form-check'>
                <Input
                  type='checkbox'
                  id='confirmCheckbox'
                  checked={confirm}
                  onClick={() => setConfirm(!confirm)}
                />
            <Label for='confirmCheckbox'>
             أجل، أؤكد عملية إعادة التعيين
            </Label>
          </div>
          <div className='mt-1'>
            <Button color='primary' disabled={!confirm} onClick={ () => submit()}>
              {isLoading ? <Spinner size={'sm'}/> : 'إعادة تعيين'}</Button>
          </div>
      </CardBody>
    </Card>
  )
}

export default UnactivateAccount
