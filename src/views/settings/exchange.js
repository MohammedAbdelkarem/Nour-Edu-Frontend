// ** React Imports
import { useEffect, useMemo, useState } from 'react'
// ** Import Icons
import { Calendar, DollarSign, User } from 'react-feather'
// ** Reactstrap Imports
import { Row, Col, Card, CardBody, Button, Label, Spinner } from 'reactstrap'
// ** Import methods
import { useGetMutation, useUpdateMutation } from '../../redux/rtkQuery/settings'
import useHeaders from '../../utility/hooks/useHeaders'
// ** Import components
import FormattingMask from '../components/formatting'
import ErrorAlert from '../components/handleStatusCode/error'
import SuccessAlert from '../components/handleStatusCode/success'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import ComponentSpinner from '../../@core/components/spinner/loaders'
const ExchangeDollar = ({ stepper }) => {
    const headers = useHeaders()
    const [mode, setMode] = useState('view')
    const [value, setValue] = useState(0)

    const [get, {data, isLoading:fetchingSettings}] = useGetMutation()
    const [update, {status, isLoading, error}] = useUpdateMutation()

    const settings = data?.data[0] || []
    useEffect(() => {
        if (stepper) {
            get({headers}) 
        }
    }, [stepper])

    const handleSubmit = () => {
        const body = {
            value: parseInt(value.replace(/,/g, ""), 10)
        }
        update({headers, id: settings?.id, body})
    }
    useMemo(() => {
        if (status === 'fulfilled') {
          SuccessAlert({
            title: '!تم بنجاح',
            body: ("تم تحديث سعر الصرف اليوم"),
            position: 'top-left'
          })
          get({headers})
          setMode('view')
          setValue(0)
        } else if (status === 'rejected') {
          ErrorAlert({
            title: '!حدث خطأ',
            body: error?.data?.message,
            button: "Done"
          })
        }
      }, [status])
    
  return (
    <div>
      <div className='content-header' style={{
        width: "100%", 
        borderRadius: "5px", 
        padding: "10px",
        borderRight: "10px solid #2e7d32"}}>
        <h4 style={{marginBottom:'5px'}}>سعر صرف الدولار الأميركي</h4>
        <p className='text-muted'>تحديث سعر صرف الليرة السوريَّة إلى الدولار الأميركي ( ليرة سوريّة = دولار اميركي )</p>
      </div>
      {
        fetchingSettings ? <ComponentSpinner/> : <Row>
          <Col md='6' className='mb-1'>
            <Col lg='12' sm='6'>
                <StatsHorizontal icon={<User size={21} />} color='primary' stats={settings?.updater?.name} statTitle={` ${settings?.updater?.role_name} - ${settings?.updater?.phone_number}`} />
            </Col>
            <Col lg='12' sm='6'>
               <StatsHorizontal icon={<DollarSign size={21} />} color='success' stats={'قيمة الدولار / ليرة' } statTitle={parseInt(settings?.value)?.toLocaleString()}/>
            </Col>
            <Col lg='12' sm='6'>
                <StatsHorizontal icon={<Calendar size={21} />} color='danger' stats='تاريخ آخر تحديث' statTitle={settings?.last_update_at}/>
            </Col>
          </Col>
          <Col md='6' className='mb-1'>
            <Card className='card-apply-job' style={{ width: "100%", 
                                                      borderRadius: "10px",
                                                      boxShadow: "0 5px 8px rgb(0, 0, 0, 0.1)", 
                                                      borderRight: "7px solid #2e7d32",
                                                      borderTop: "7px solid #2e7d32"}}>
            <CardBody>
                <div className='d-flex justify-content-between align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                    <div>
                        <h3 className='mb-0'>تحديث سعر الصرف</h3>
                    </div>
                </div>
                </div>
                <p> ابقَ على اطلاع بأحدث أسعار الصرف بين الدولار والليرة السورية. </p>
                <p className='mb-2'>
                    قم بالتحديثات في الوقت المُناسب لضمان دقَّة
                    التحويلات للمعاملات المالية الخاصة بك.
                </p>
                {
                    mode === 'view' ? <div className='apply-job-package bg-light-primary rounded d-flex flex-column align-items-center justify-content-center text-center py-2'>
                            <div>
                                <sup className='text-body'>
                                <small style={{fontSize:'14px'}}>ل.س</small>
                                </sup>
                                <h2 className='d-inline me-25'>{parseInt(settings?.value)?.toLocaleString()}</h2>
                                <sub className='text-body'>
                                <small style={{fontSize:'14px'}}>/ 1 دولار أميركي</small>
                                </sub>
                            </div>
                        </div> : <div className='apply-job-package bg-light-primary rounded d-flex flex-column py-2'>
                    <Label className='form-label' style={{fontSize:'18px', position:'relative', top:'-10px'}}>
                      سعر الصرف
                    </Label>
                    <FormattingMask defaultValue={parseInt(settings?.value)?.toLocaleString()} onChange={e => setValue(e.target.value)}/>
                    </div>
                }
                <div className='d-grid'>
                    {
                        mode === 'view' ?  <Button color='primary' onClick={() => setMode('update')}>تحديث</Button> : <div style={{ display: 'flex', gap: '16px' }}>
                          {mode === 'view' ? (
                            <Button color='primary' size="lg" style={{ flex: 1 }} onClick={() => setMode('update')}>
                              تحديث
                            </Button>
                          ) : (
                            <>
                              <Button
                                color='primary'
                                size="lg"
                                style={{ flex: 1 }}
                                disabled={value === 0 || value === '' || isLoading}
                                onClick={handleSubmit}
                              >
                                {isLoading ? <Spinner color='light' /> : 'تأكيد'}
                              </Button>
                              <Button
                                color='secondary'
                                size="lg"
                                outline
                                style={{ flex: 1 }}
                                disabled={isLoading}
                                onClick={() => setMode('view')}
                              >
                                تجاهل
                              </Button>
                            </>
                          )}
                        </div>
                    }
                </div>
            </CardBody>
            </Card>
          </Col>
        </Row>
      }
    </div>
  )
}

export default ExchangeDollar
