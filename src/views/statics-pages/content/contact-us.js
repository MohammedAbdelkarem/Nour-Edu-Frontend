// ** Reactstrap Imports
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, CheckSquare, PlusCircle, RotateCw, Trash2 } from 'react-feather'
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'reactstrap'
import { useDeleteMutation, useGetMutation, useStoreMutation, useTypesQuery } from '../../../redux/rtkQuery/statics-pages/contact'
import useHeaders from '../../../utility/hooks/useHeaders'
import SuccessAlert from '../../components/handleStatusCode/success'
import ErrorAlert from '../../components/handleStatusCode/error'
import { useTranslation } from 'react-i18next'
import LoadSpinner from '../../../@core/components/spinner/loaders'
const ContactUs = ({activeTab}) => {
  const headers = useHeaders()
  const {t} = useTranslation()
  const {data} = useTypesQuery({headers})
  const allTypes = data?.data || []
  const [getContact, {data:contactData, isLoading:contactLoading}] = useGetMutation()
  const [remove, {data:removeData, isLoading:removing, status:removeStatus, error:removeError}] = useDeleteMutation()
  const [store, {data:storeData, isLoading:storing, status:storeStatus, error:storeError}] = useStoreMutation()

  useEffect(() => {
    switch (activeTab) {
      case '2':
        getContact({headers})
        break
    }
  }, [activeTab]) 
  
  const initialGroupedData = contactData?.data?.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = []
    }
    acc[item.type].push(item)
    return acc
  }, {})

  const [groupedData, setGroupedData] = useState(initialGroupedData || {})
  useEffect(() => {
    if (contactData?.data) {
      const updated = contactData.data.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = []
        acc[item.type].push(item)
        return acc
      }, {})
      setGroupedData(updated)
    }
  }, [contactData])
  const handleAddInput = (type) => {
  const newInput = { id: `new-${Date.now()}`, link: '', type }
  const updated = {
    ...groupedData,
    [type]: [...(groupedData[type] || []), newInput]
  }
  setGroupedData(updated)
}

  const [isDelete, setIsDelete] = useState(false) 
  const [selected, setSelected] = useState(null)

  const handleDelete = (item) => {
    setIsDelete(true)
    setSelected(item)
  }
  const handleClose = () => {
    setIsDelete(false)
    setSelected(null)
  }
  const handleSubmit = async (item) => {
    const formData = new FormData()
    formData.append('type', item.type)
    formData.append('link', item.link)

    try {
      await store({ headers, body: formData }).unwrap()
      SuccessAlert({
        title: 'Success',
        body: 'Link saved successfully',
        position: 'top-left'
      })
      
      getContact({headers})
    } catch (error) {
      ErrorAlert({
        title: 'Failed',
        body: error?.data?.message || 'Something went wrong',
        position: 'top-left',
        button: t("Done")
      })
    }
  }

  useMemo(() => {
    if (removeStatus === 'fulfilled') {
      SuccessAlert({
        title: t('Success'),
        body: removeData?.message,
        position: 'top-left'
      })
      getContact({headers})
    } else if (removeStatus === 'rejected') {
      ErrorAlert({
        title: t('Failed'),
        body: removeError?.data?.message,
        position: 'top-left', 
        button: t('Done')
      })
    }
  }, [removeStatus])
  const handleUndoNewItem = (type, idx) => {
    const updatedItems = groupedData[type].filter((_, i) => i !== idx)
    setGroupedData({ ...groupedData, [type]: updatedItems })
  }
  const typesWithData = Object.keys(groupedData || {})
const missingTypes = allTypes.filter(type => !typesWithData.includes(type))
console.log('missingTypes',missingTypes);


  return (
      <Row className='match-height'>
        {contactLoading ? <LoadSpinner/> : groupedData && Object.entries(groupedData).map(([type, items], index) => (
          <Col xl="4" lg="12" key={index}>
            <Card style = {{ width: "100%", 
                             boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)", 
                             borderRadius: "5px", 
                             padding: "5px",
                             borderRight: "10px solid #0568a9"}}>
              <CardHeader>
                <CardTitle className="text-capitalize" style={{ color: "#0568a9" }}>{`● ${type.replace('-', ' ')}`}</CardTitle>
                <PlusCircle
                  size={18}
                  style={{ color: "#0568a9", cursor: "pointer" }}
                  onClick={() => handleAddInput(type)}
                />
              </CardHeader>
              <CardBody>
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="mb-2 d-flex align-items-center gap-1">
                    <input
                      dir="ltr"
                      type="text"
                      className="form-control"
                      value={item.link}
                      readOnly={!item.id?.toString().startsWith("new-")}
                      onChange={(e) => {
                        const updatedItems = groupedData[type].map((el, i) => (i === idx ? { ...el, link: e.target.value } : el)
                        )
                        setGroupedData({ ...groupedData, [type]: updatedItems })
                      }}
                    />

                    {!item.id?.toString().startsWith("new-") ? (
                      isDelete && item?.id === selected?.id ? (
                        <>
                          {removing ? (
                            <Spinner size={'sm'} />
                          ) : (
                            <CheckSquare
                              size={16}
                              style={{ cursor: 'pointer', color: '#0568a9' }}
                              onClick={() => remove({ headers, id: selected?.id })}
                            />
                          )}
                          <RotateCw onClick={() => handleClose()} size={16} style={{ cursor: 'pointer', color: '#999' }} />
                        </>
                      ) : (
                        <Trash2
                          size={16}
                          style={{ cursor: 'pointer', color: '#999' }}
                          onClick={() => handleDelete(item)}
                        />
                      )
                    ) : (
                      <>
                        {storing ? (
                          <Spinner size={'sm'} />
                        ) : (
                          <CheckCircle
                            size={16}
                            style={{ cursor: 'pointer', color: '#0568a9' }}
                            onClick={() => handleSubmit(item)}
                          />
                        )}
                        <RotateCw
                          size={16}
                          style={{ cursor: 'pointer', color: '#999' }}
                          onClick={() => handleUndoNewItem(type, idx)}
                        />
                      </>
                    )}
                  </div>
                ))}

              </CardBody>
            </Card>
          </Col>
        ))}
        {missingTypes.map((type, index) => (
          <Col xl="4" lg="12" key={`missing-${index}`}>
            <Card style={{
              width: "100%",
              boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)",
              borderRadius: "5px",
              padding: "5px",
              borderRight: "10px solid #999",
            }}>
              <CardHeader>
                <CardTitle className="text-capitalize" style={{ color: "#999" }}>
                  {`● ${type.replace('-', ' ')}`}
                </CardTitle>
                <PlusCircle
                  size={18}
                  style={{ color: "#999", cursor: "pointer" }}
                  onClick={() => handleAddInput(type)}
                />
              </CardHeader>
              <CardBody>
                <p style={{ color: '#999', fontStyle: 'italic' }}>{t('No links added yet')}</p>
              </CardBody>
            </Card>
          </Col>
        ))}

      </Row>
    )
}

export default ContactUs
