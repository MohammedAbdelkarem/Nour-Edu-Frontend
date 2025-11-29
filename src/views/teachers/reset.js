// ** React Imports
import { Link, useLocation, useNavigate } from 'react-router-dom'

// ** Icons Imports
import { ChevronLeft } from 'react-feather'

// ** Custom Components
import InputPassword from '@components/input-password-toggle'

// ** Reactstrap Imports
import { Card, CardBody, CardTitle, Label, Button, Spinner } from 'reactstrap'
import Joi from "joi-browser"

// ** Styles
import '@styles/react/pages/page-authentication.scss'
import { useUpdateMutation } from '../../redux/rtkQuery/teacher'
import ToastLogo from '../components/toast'
import { useMemo, useState } from 'react'
import useHeaders from '../../utility/hooks/useHeaders'

const ResetPassword = () => {
  const navigate = useNavigate()
  const state = useLocation()?.state
  const headers = useHeaders()  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})

  const schema = {
    password: Joi.string().required().label("كلمة المرور"),
    confirmPassword: Joi.any()
      .valid(Joi.ref('password'))
      .required()
      .options({ language: { any: { allowOnly: 'لا يوجد تطابق' } } })
      .label("كلمة المرور")
  }

  const validateProperty = ({ name, value }) => {
    let obj = { [name]: value }
    let schemaField = { [name]: schema[name] }
  
    if (name === "confirmPassword") {
      obj = { ...obj, password }
      schemaField = {
        confirmPassword: schema.confirmPassword,
        password: schema.password,
      }
    }
  
    const { error } = Joi.validate(obj, schemaField)
    return error ? error.details[0].message : null
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    let newErrors = { ...errors }
  
    if (name === "password") setPassword(value)
    if (name === "confirmPassword") setConfirmPassword(value)
  
    const errorMessage = validateProperty(e.target)
    if (errorMessage) newErrors[name] = errorMessage
    else delete newErrors[name]
  
    if (name === "password" && confirmPassword) {
      const confirmError = validateProperty({
        name: "confirmPassword",
        value: confirmPassword
      })
  
      if (confirmError) newErrors.confirmPassword = confirmError
      else delete newErrors.confirmPassword
    }
  
    setErrors(newErrors)
  }
  

  const [update, {data:updateData, isLoading:updating, status:updateStatus}] = useUpdateMutation()
  const handleSubmit = () => {
    const body = new FormData()
    body.append('name', state?.name)
    body.append('phone_number', state?.phone_number)
    body.append('description', state?.description)
    body.append('password', password)
    body.append('_method', 'PUT')
    
    update({headers, body, id:state?.id})
  }
  useMemo(() => {
    if (updateStatus === 'fulfilled') {
      ToastLogo({
        title: ('تم تغيير كلمة المرور بنجاح!'),
        body: updateData?.message,
        position: 'top-left'
      })
      navigate('/teachers') 
    }
  }, [updateStatus])
  
  return (
    <div className='auth-wrapper auth-basic px-2' style={{marginTop: '-110px'}}>
      <div className='auth-inner my-2'>
        <Card className='mb-0'>
          <CardBody>
            <CardTitle tag='h4' className='mb-1'>
              {`إعادة تعيين كلمة المرور من أجل "${state?.name}"`}
            </CardTitle>
              <div className='mb-1'>
                <Label className='form-label' for='new-password'>
                  كلمة المرور الجديدة
                </Label>
                <InputPassword name="password" value={password} onChange={handleChange} autoFocus />
                {errors.password && <div  className="error text-danger">{errors.password}</div>}

              </div>
              <div className='mb-1'>
                <Label className='form-label' for='confirm-password'>
                    تأكيد كلمة المرور
                </Label>
                <InputPassword className='input-group-merge' value={confirmPassword} name="confirmPassword" id='confirm-password'  onChange={handleChange} />
                {errors.confirmPassword && <div className="error text-danger">{errors.confirmPassword}</div>}

              </div>
              <Button color='primary' disabled={password === '' || confirmPassword === '' || updating} block onClick={handleSubmit}> 
                    {updating ? <Spinner size='sm' color='light'/> : 'إعادة تعيين' }
              </Button>
            <p className='text-center mt-2'>
              <Link to='/teachers'>
                <ChevronLeft className='rotate-rtl me-25' size={14} />
                <span className='align-middle'>رجوع إلى قائمة المعلمين</span>
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword
