// ** React Imports
import { Fragment, useEffect, useMemo, useState } from 'react'

// ** Reactstrap Imports
import { Card, CardImg, CardTitle, CardBody, CardText, Row, Col, CardHeader, Button, Alert, Spinner, Badge } from 'reactstrap'
import { useDeleteMutation, useGetMutation } from '../../../../redux/rtkQuery/content/story'
import useHeaders from '../../../../utility/hooks/useHeaders'
import PagesSpinner from '../../../../@core/components/spinner/loaders'
import { useTranslation } from 'react-i18next'
import { Edit, Trash2 } from 'react-feather'
import { Link, useNavigate } from 'react-router-dom'
import SystemModal from '../../../components/systemModal'
import SuccessAlert from '../../../components/handleStatusCode/success'
import ErrorAlert from '../../../components/handleStatusCode/error'
import DescriptionCell from '../../../components/DescriptionCell'
import EmptyComponent from '../../../components/empty'

const StoryManagement = ({}) => {
  const headers = useHeaders()
  const navigate = useNavigate()
  const {t} = useTranslation()
  // ** State
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  // ** Method
  const [remove, {data:removeData, isLoading:removing, status:removeStatus, error:removeError}] = useDeleteMutation()
  const [getStories, {data, isLoading}] = useGetMutation()

  useEffect(() => { getStories({headers}) }, [])
  const handleRemove = (item) => {
    setSelected(item)
    setModal(true)
  }
  const handleUpdate = (item) => {
    setSelected(item)
    navigate('/story-management', {state: item}) 
  }
  const handleClose = () => {
    setSelected(null)
    setModal(false)
  }
  useMemo(() => {
    if (removeStatus === 'fulfilled') {
      SuccessAlert({
        title: t('Success'),
        body: removeData?.message,
        position: 'top-left'
      })
      handleClose()
      getStories({headers})
    } else if (removeStatus === 'rejected') {
      ErrorAlert({
        title: t('Failed'),
        body: removeError?.data?.message,
        position: 'top-left', 
        bottun: t('Done')
      })
      handleClose()
    }
  }, [removeStatus])
  return (
    <Fragment>
      <Row>
        <CardHeader style={{display:'flex', justifyContent:'space-between', padding:'10px'}}>
          <CardTitle tag='h4'>{t('Stories list')}</CardTitle>
          {/* <Button color='primary' outline onClick={() => navigate('/story-management') }>
            {t('Add new')}
          </Button> */}
        </CardHeader>
        <div style={{height:'60vh', overflowY:'auto'}}>
          <Row>
        {
            isLoading ? <PagesSpinner/> : data?.data?.length === 0 ? <EmptyComponent title={t('No Data')} body={t('No Stories added')}/> : data?.data?.map((item) => (
                <Col xl='3' md='6'>
                    <Card className='mb-3' style={{
                        height: '350px',
                        boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)", 
                        borderRadius: "5px", 
                        borderTop: "7px solid #0568a9",
                        borderBottom: "7px solid #0568a9"
                    }}>
                        <div style={{ height: '140px', position: 'relative' }}>
                            {!isLoaded && (
                                <div
                                    style={{
                                        height: '100%',
                                        width: '100%',
                                        backgroundColor: '#e0e0e0',
                                        animation: 'pulse 1.5s ease-in-out infinite',
                                        borderRadius: '0.25rem',
                                        position: 'absolute'
                                    }}
                                />
                            )}
                            <CardImg
                                top
                                src={item?.media[0]?.url}
                                alt="card-top"
                                onLoad={() => setIsLoaded(true)}
                                style={{
                                    height: '100%',
                                    objectFit: 'cover',
                                    width: '100%',
                                    visibility: isLoaded ? 'visible' : 'hidden',
                                    borderRadius: '0'
                                }}
                            />
                        </div>
                        <CardBody style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 140px)' }}>
                            <CardTitle
                                tag='h4'
                                title={item?.title}
                                style={{
                                    fontWeight: 'bold',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {item?.title}
                            </CardTitle>

                            <CardText style={{ flex: '1', overflow: 'hidden' }}> 
                                { <DescriptionCell row={item} text={item.description} number={35}/> }
                            </CardText>
                            {
                              item.storiable && (
                                <Badge color='light-primary'>
                                  <Link
                                    to={`/clinics/profile/${item.storiable.clinic_name}`}
                                    state={{ id: item.storiable.id }}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                  >
                                    {item.storiable.clinic_name}
                                  </Link>
                                </Badge>
                              )
                            }
                            <hr/>
                            <CardText style={{display:'flex', justifyContent:'center', gap:'30px'}}>
                                <Edit size={18}
                                      style={{color:'#0568a9', cursor:'pointer'}}
                                      onClick={() => handleUpdate(item)}/>
                                <Trash2 size={18}
                                        style={{color:'#f07522', cursor:'pointer'}} 
                                        onClick={() => handleRemove(item)}/>
                            </CardText>
                        </CardBody>
                    </Card>
                </Col>
            ))
        } 
        </Row>
        </div>
      </Row>
        <SystemModal show={modal}
                     setShow={setModal} 
                     title={`${t('Remove this Story')} (${selected?.title}) !`} 
                     onReomve={() => remove({headers, id:selected?.id})}
                     isRemoving={removing}
                     status={removeStatus}
                     message={removeError?.data?.message}>
                <Alert color='warning'>
                  <h6 className='alert-heading'>{`${t('Warning')}!`}</h6>
                  <div className='alert-body' style={{fontSize:'11px'}}>
                  {t('Are you sure you want to remove this Story? it will not shown to users!!')}
                  </div>
                </Alert>
        </SystemModal>
    </Fragment>
  )
}

export default StoryManagement
