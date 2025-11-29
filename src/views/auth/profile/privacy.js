// ** React Imports
import { Fragment, useMemo, useState } from 'react'

// ** Reactstrap Imports
import { Row, Col, Card, Button, CardBody, CardTitle, CardHeader, Spinner, Alert } from 'reactstrap'

// ** Custom Components
import InputPasswordToggle from '@components/input-password-toggle'
import { useUpdateMutation } from '../../../redux/rtkQuery/admin'
import SuccessAlert from '../../components/handleStatusCode/success'
import ErrorAlert from '../../components/handleStatusCode/error'
import PagesSpinner from '../../../@core/components/spinner/Fallback-spinner'
import useHeaders from '../../../utility/hooks/useHeaders'
import UnactivateAccount from './DeleteAccount'
import { AlertCircle } from 'react-feather'

const PrivacyTab = ({ id, userData }) => {
  console.log('userData',userData);
  
  const headers = useHeaders()
  const [change, { isLoading, status, error }] = useUpdateMutation()
  const [data, setData] = useState({
    new_password:"",
    new_password_confirmation:""
  })
  const validatePassword = (password, confirm) => {
    if (password.length < 8) return "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    if (!/[a-z]/.test(password)) return "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل";
    if (!/[\d\s\W]/.test(password)) return "يجب أن تحتوي كلمة المرور على رقم، رمز أو مسافة بيضاء واحدة على الأقل";
    if (password !== confirm) return "كلمة المرور وتأكيدها غير متطابقين";
    return null; // valid
  }
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = () => {
    const err = validatePassword(data.new_password, data.new_password_confirmation);
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg(null);

    const body = new FormData()
    body.append('_method', 'PUT')
    body.append('role_id', userData?.role_id)
    body.append('name', userData.name)
    body.append('password', data.new_password)
    body.append('is_male', 1)
    body.append('delete_image', 0)
    body.append('phone_number', userData?.phone_number)
    body.append('email', userData?.email)
    body.append('birth_date', userData.birth_date)
    body.append('city_id', '')
    change({ headers, body, id })
  }

  const [reset, setReset] = useState(false)

  const handlePasswordChange = (e) => {
    const new_password = e.target.value
    setData({ ...data, new_password })
  }

  const handlePasswordConfirmationChange = (e) => {
    const new_password_confirmation = e.target.value
    setData({ ...data, new_password_confirmation })
  }
  useMemo(() => {
    if (status === 'fulfilled') {
      SuccessAlert({
        title: 'عملية ناجحة',
        body: ("تم تغيير كلمة المرةر بنجاح"),
        position: 'top-left'
      })
      setReset(true)
      setTimeout(() => {
        setReset(false)
      }, 1000)
    } else if (status === 'rejected') {
      ErrorAlert({
        title: 'فشل',
        body: error.data.message,
        button: "تم"
      })
    }
  }, [status])
 
  return (
    <Fragment>
      <Card>
        <CardHeader className='border-bottom'>
          <CardTitle tag='h4'>{'تغيير (تحديث) كلمة المرور'}</CardTitle>
        </CardHeader>
        <CardBody className='pt-1'>
          {
            reset ? <PagesSpinner/> : <> <Row>
              <Col sm='6' className='mb-1'>
                <InputPasswordToggle
                  label='كلمة المرور الجديدة'
                  htmlFor='newPassword'
                  className='input-group-merge'
                  onPaste={(e) => e.preventDefault()}
                  onChange={handlePasswordChange}/>
              </Col>
              <Col sm='6' className='mb-1'>
                    <InputPasswordToggle
                      label='تأكيد كلمة المرور'
                      htmlFor='retypeNewPassword'
                      className='input-group-merge'
                      onPaste={(e) => e.preventDefault()}
                      onChange={handlePasswordConfirmationChange}
                    />
              </Col>
              {errorMsg && (
                  <Alert color='danger'>
                    <div className='alert-body'>
                      <AlertCircle size={15} />{' '}
                      <span className='ms-1'>
                        {errorMsg}
                      </span>
                    </div>
                  </Alert>
                )}
              <Col xs={12}>
                <p className='fw-bolder'>متطلبات كلمة المرور</p>
                <ul className='ps-1 ms-25'>
                  <li className='mb-50'>يجب أن تكون مكونة من 8 أحرف على الأقل - كلما كانت أطول، كان ذلك أفضل</li>
                  <li className='mb-50'>يجب أن تحتوي على حرف صغير واحد على الأقل</li>
                  <li>يجب أن تحتوي على رقم أو رمز أو مسافة بيضاء واحدة على الأقل</li>
                </ul>
              </Col>
              <Col className='mt-1' sm='12'>
                <Button type='submit' className='me-1' color='primary' onClick={() => handleSubmit()}>
                  {isLoading ? <Spinner size={'sm'} type={'grow'}/> : 'حفظ التغييرات'}
                </Button>
              </Col>
            </Row>
            </>
          }
        </CardBody>
      </Card>
      <UnactivateAccount id={id}/>
    </Fragment>
  )
}

export default PrivacyTab
