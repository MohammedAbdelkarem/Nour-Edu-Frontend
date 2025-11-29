import { useState, useEffect, useMemo } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Row
} from 'reactstrap'
import { CheckCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useGetMutation, useUpdateMutation } from '../../redux/rtkQuery/settings'
import useHeaders from '../../utility/hooks/useHeaders'
import SuccessAlert from '../components/handleStatusCode/success'
import ErrorAlert from '../components/handleStatusCode/error'

const Duration = () => {
  const headers = useHeaders()
  const { t } = useTranslation()

  const [get, { data, isLoading: fetchingSettings }] = useGetMutation()
  const [update, { status, isLoading, error }] = useUpdateMutation()

  const [inputs, setInputs] = useState({})

  const filteredData = data?.data.filter(item => item.id !== 1)

  useEffect(() => {
    get({ headers })
  }, [])

useEffect(() => {
  if (filteredData && Object.keys(inputs).length === 0) {
    const initialInputs = {}
    filteredData.forEach(item => {
      initialInputs[item.id] = {
        original: item.value,
        current: item.value,
        isUpdating: false
      }
    })
    setInputs(initialInputs)
  }
}, [filteredData])

  useEffect(() => {
    if (status === 'fulfilled') {
      SuccessAlert({
        title: '!تم بنجاح',
        body: 'تم تحديث القيمة',
        position: 'top-left'
      })
      get({ headers })
    } else if (status === 'rejected') {
      ErrorAlert({
        title: '!حدث خطأ',
        body: error?.data?.message,
        button: 'Done'
      })
    }
  }, [status])

  const handleInputChange = (id, value) => {
    setInputs(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        current: value
      }
    }))
  }

  const handleSubmit = async (id) => {
    const value = inputs[id].current
    if (value === inputs[id].original) return

    setInputs(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isUpdating: true
      }
    }))

   await update({
        headers,
        id,
        body: {
            value: parseInt(value.replace(/,/g, ""), 10)
        }
        })

        // Don't set input immediately — wait for the updated data to arrive and re-render via `get`
        setInputs(prev => ({
        ...prev,
        [id]: {
            ...prev[id],
            isUpdating: false
        }
        }))
  }

  return (
    <Row className='match-height'>
      {filteredData?.map(item => {
        const input = inputs[item.id]
        return (
          <Col xl="6" lg="12" key={item.id}>
            <Card style={{
              width: "100%",
              boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)",
              borderRadius: "5px",
              padding: "5px",
              borderRight: "10px solid #0568a9"
            }}>
              <CardHeader>
                <CardTitle className="text-capitalize" style={{ color: "#0568a9" }}>
                  {`● ${item?.key} :`}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="mb-2">
                  <input
                    dir='ltr'
                    type="text"
                    className="form-control"
                    defaultValue={input?.current || ''}
                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                  />
                </div>
              </CardBody>
              <CardFooter className='d-flex justify-content-between align-items-center'>
                <small className='text-muted'>
                  {t('Last updated at')} {item?.last_update_at}
                </small>
                <Button
                  className='send'
                  color='primary'
                  disabled={
                    input?.isUpdating ||
                    input?.current === input?.original ||
                    input?.current === ''
                  }
                  onClick={() => handleSubmit(item.id)}
                >
                  <span className='d-none d-lg-block'>
                    {t('Save changes')}
                  </span>
                </Button>
              </CardFooter>
            </Card>
          </Col>
        )
      })}
    </Row>
  )
}

export default Duration