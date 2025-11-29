// ** React Imports
import { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AbilityContext } from '../../utility/context/Can'
import { useTranslation } from 'react-i18next'
import { browserName, osName, osVersion } from 'react-device-detect';

// ** Reactstrap Imports
import { Card, CardBody, CardTitle, CardText, Label, Input, Button, Spinner, FormFeedback } from 'reactstrap'

// ** Custom Components
import SuccessAlert from '../components/handleStatusCode/success'
import ErrorAlert from '../components/handleStatusCode/error'
import InputPasswordToggle from '@components/input-password-toggle'

// ** Hooks
import { getHomeRouteForLoggedInUser } from '../../utility/Utils'

// ** Styles
import '@styles/react/pages/page-authentication.scss'

// ** Images
import Base from '../../assets/images/base/logo.png'

// ** RTK Methods
import { useLoginMutation } from '../../redux/rtkQuery/auth'

// ** Validations
import Joi from 'joi-browser'
import Validation from '../../services/validationService'
import { LoginSchema } from '../../schema/auth/login'

const Login = () => {
  const navigate = useNavigate()
  const {t} = useTranslation()

  const ability = useContext(AbilityContext)
  const [submitted, setSubmitted] = useState(false)
  const [authData, setAuthData] = useState(null)
  const [errors, setErrors] = useState([])
  const [formData, setFormData] = useState({
    email:"",
    password:"",
    full_name:null,
    notification_token :"123456789",
    device_name: `${browserName}, ${osName} ${osVersion}`
  })
  
  // ** import method
  const [login, {data, status, isLoading, error}] = useLoginMutation()

  const validateField = (name, value) => {
    const fieldSchema = { [name]: LoginSchema[name] }
    const fieldData = { [name]: value }
    const result = Joi.validate(fieldData, fieldSchema)
    if (result.error) {
      setErrors({ ...errors, [name]: result.error.details[0].message })
    } else {
      setErrors({ ...errors, [name]: '' })
    }
  }
  const handleChange = (e) => {
    setSubmitted(true)
    const {name, value} = e.target
    setFormData({...formData, [name]:value})
    if (submitted) {
      validateField(name, value)
    }
  }
  // ** login method by enter email and password
  const handleSubmit = () => {
    const vlidationErrors = Validation.validation(LoginSchema, {
        email: formData.email,
        password: formData.password
      })
      if (vlidationErrors) {
        setErrors(vlidationErrors)
      } else {
        setSubmitted(false)
        login({ body: formData })
      }
  }

  // ** submit login by enter key method
  const handleKeyPress = (event) => {    
    if (event.key === 'Enter') {
      handleSubmit()
    }
  }

  // ** handling after login
  useEffect(() => {
    if (status === 'fulfilled') {
      localStorage.setItem('userData', JSON.stringify(authData))
      localStorage.setItem('token', data.data.tokens.access_token)
      localStorage.setItem('refresh', data.data.tokens.refresh_token) 
      localStorage.setItem('access_expire_in', data.data.tokens.access_expire_in.toString())
      localStorage.setItem('refresh_expire_in', data.data.tokens.refresh_expire_in.toString())       
      localStorage.setItem('user', JSON.stringify(data.data.user))
      ability.update(authData.ability)
      localStorage.setItem('Role', authData.role)
      SuccessAlert({
        title: data.data.user?.name,
        body: t("Welcome back. We wish you a good day's work"),
        position: 'top-left'
      })
      navigate(getHomeRouteForLoggedInUser(authData.role))
    }
    
    if (status === 'rejected') {
          ErrorAlert({
            title: 'Login Failed!',
            body: error?.data?.message,
            button: t("Done")
          })
    }
  }, [status, authData])

  useMemo(() => {
    if (data && data !== undefined) {      
        setAuthData({
          user: data?.data?.name,
          email: data?.data?.email,
          role: 'admin',
          ability: [
            {
              action: 'manage',
              subject: 'all'
            }
          ],
          extras: {
            eCommerceCartItemsCount: 5
          }
        })
      }
  }, [data])

  return (
    <div className='auth-wrapper auth-basic'>
      <div className='auth-inner my-2'>
        <Card className='mb-0'>
          <CardBody style={{ textAlign: 'center' }}>
            <img src={Base} width={200}/>
            <CardTitle tag='h4' className='mb-1 mt-2'>
              {t("أهلاً بك في لوحة تحكم منصة نور التعليمية  ")}
            </CardTitle>
            <CardText className='mb-2'>{t('Login to your account by Enter your email and password')}</CardText>
              <div className='mb-1'>
                <Label className='form-label' for='login-email' style={{justifyContent:'right', display:'flex'}}>
                  {t('Email')}
                </Label>
                <Input type='text'
                       name='email'
                       autoFocus
                       invalid={errors['email']}
                       onChange={handleChange}
                       placeholder={t('e.g. example@domain.com')}
                       onKeyPress={handleKeyPress}/>
              {errors['email'] && <FormFeedback style={{justifyContent:'right', display:'flex'}}>{errors['email']}</FormFeedback>}
              </div>
              <div className='mb-1'>
                <div className='d-flex' style={{justifyContent:'right', display:'flex'}}>
                  <Label className='form-label' for='login-password' >
                    {t('Password')}
                  </Label>
                </div>
                <InputPasswordToggle className='input-group-merge'
                                     name='password'
                                     invalid={errors['password']}
                                     onChange={handleChange}
                                     onKeyPress={handleKeyPress} />
              {errors['password'] && <FormFeedback style={{justifyContent:'right', display:'flex'}}>{errors['password']}</FormFeedback>}
              </div>
              <Button color='primary' block onClick={handleSubmit}>
                {isLoading ? <Spinner color='white' size='sm' type='grow' /> : t('Login') }
              </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
export default Login