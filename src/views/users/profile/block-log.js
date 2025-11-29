import { Table, Badge, Card, CardHeader, CardTitle, CardBody, Row, Col, Input, Button, Spinner, Alert } from 'reactstrap'
import {  Edit,  CheckSquare, UserCheck } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Fragment, useEffect, useMemo, useState } from 'react'
import Flatpickr from 'react-flatpickr'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import useHeaders from '../../../utility/hooks/useHeaders'
import { useBanMutation, useUnbanMutation } from '../../../redux/rtkQuery/user/users'
import SystemModal from '../../components/systemModal'
import DescriptionCell from '../../components/descriptionCell'
import SuccessAlert from '../../components/handleStatusCode/success'
import { useUserMutation } from '../../../redux/rtkQuery/user/logs'
import PagesSpinner from '../../../@core/components/spinner/Fallback-spinner'
import ErrorAlert from '../../components/handleStatusCode/error'

const BanTable = ({ id }) => {
  const { t } = useTranslation()  
  const headers = useHeaders()
  const [unbanModal, setUnbanModal] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)
  const [unbanReason, setUnbanReason] = useState('')
  const [getLogs, {data, isLoading:logLoading}] = useUserMutation()
  const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
  useEffect(() => {
    if (id) { 
      getLogs({headers, id})
    }
  }, [id]) 
  const [ban, { isLoading, status, error }] = useBanMutation()
  const [unban, { isLoading:unbanLoading, status:unbanStatus, error:unbanError }] = useUnbanMutation()

  const [form, setForm] = useState({
    reason:'',
    banned_until: tomorrow
  })
  console.log('form',form);
  
  const hadleUpdate = (item) => {
    setIsUpdated(true)
    setForm({
        reason: item?.reason,
        banned_until:item.banned_until
    })
  }
  
    const formatDateTo24Hour = (date) => {
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')

        return `${day}-${month}-${year}`
    }
  const handleBan = () => {
    const body = new FormData()
    body.append('user_id', id)
    body.append('banned_until', formatDateTo24Hour(form.banned_until))
    body.append('reason', form.reason)
    ban({headers, body})
  }
  const handleUnban = () => {
    const body = new FormData()
    body.append('user_id', id)
    body.append('unban_reason', unbanReason)
    unban({headers, body})
  }
  useMemo(() => {
    if (unbanStatus === 'fulfilled') {
        SuccessAlert({
            title: t('Success'),
            body: t('User unblocked successfully'),
            position: 'top-left'
        })
        setIsUpdated(false)
        setUnbanModal(false)
        setForm({
            reason:'',
            banned_until:tomorrow
        })
        getLogs({headers, id})
    } else if (unbanStatus === 'rejected') {
        ErrorAlert({
            title: t("Failed"),
            body: unbanError.data.message,
            button: t('Done')
        })
    }
  }, [unbanStatus])

  useMemo(() => {
    if (status === 'fulfilled') {
        SuccessAlert({
            title: t('Success'),
            body: t('User banned successfully'),
            position: 'top-left'
        })
        setIsUpdated(false)
        setUnbanModal(false)
        setForm({
            reason:'',
            banned_until:tomorrow
        })
      getLogs({headers, id})
    } else if (status === 'rejected') {
        ErrorAlert({
            title: t("Failed"),
            body: error.data.message,
            button: t('Done')
        })
    }
    
  }, [status])
  return (
    <Fragment>
        <Card>
            <CardHeader className='border-bottom'>
                <CardTitle tag='h4'>{isUpdated ? t('Update ban form') : t('User ban form')}</CardTitle>
                <Button.Ripple color="flat-primary" disabled={form.reason === ''} onClick={() => handleBan()}>
                    {
                        isLoading ? <Spinner color='primary' size='sm' /> : <>
                            <CheckSquare size={14} />
                            <span className="align-middle ms-25">{isUpdated ? t('Save changes') : t('Submit')}</span>
                        </>
                    }
                </Button.Ripple>
            </CardHeader>
            {
                isLoading || unbanLoading ? <PagesSpinner/> : <CardBody className='pt-1'>
                    <Row>
                        <Col md={12}>
                            <span className='title'>{t('Banned until:')}</span>
                            <Flatpickr
                                value={form?.banned_until ? new Date(form.banned_until) : null}
                                options={{ minDate: 'today', dateFormat: "Y-m-d" }}
                                onChange={(date) => setForm({ ...form, banned_until: date[0] })}
                                className='form-control invoice-edit-input due-date-picker'
                                />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12} className={'mt-2'}>
                            <span className='title'>{t('Ban reason:')} </span>
                            <Input type='textarea'
                                rows={4}
                                id='textarea'
                                name='textarea'
                                defaultValue={form?.reason}
                                onChange={(e) => setForm({...form, reason : e.target.value})}
                                placeholder={t('Ban reason')} />
                        </Col>
                    </Row>
                </CardBody>
            }
        </Card>
        {
            data?.data?.length > 0 &&
            <Card>
            <CardHeader>
                <CardTitle tag='h4'>{t('Ban Log list')}</CardTitle>
            </CardHeader>
            <CardBody>
                {
                    logLoading ? <PagesSpinner/> : data?.data?.length === 0 ? null : <Table responsive>
                            <thead className='table-dark'>
                                <tr>
                                    <th>{t('Ban Date')}</th>
                                    <th>{t('Reason')}</th>
                                    <th>{t('Banned Until')}</th>
                                    <th>{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data?.data?.map((item) => (
                                        <tr key={item?.id}>
                                        <td>{item?.created_at?.slice(0, 10)}</td>
                                        <td>{<DescriptionCell row={item} text={item?.reason} number={20} />}</td>
                                        <td>
                                            <Badge pill color='light-danger'>
                                            {item?.banned_until?.slice(0, 10)}
                                            </Badge>
                                        </td>
                                        <td>
                                            {
                                                item?.unbanned_by_id === null ? <>
                                                    <Edit className='me-50' size={15}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => { hadleUpdate(item)                                                                
                                                                             window.scrollTo({ top: 0, behavior: 'smooth' })
                                                            }}/>
                                                    <UserCheck className='me-50'
                                                            size={15}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => setUnbanModal(true)}/>
                                                </> : <Badge pill color='light-info'>
                                                    {<DescriptionCell row={item} text={item?.unban_reason} number={20} />}
                                                  </Badge>
                                            }
                                        </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </Table>
                }
            </CardBody>
            </Card>
        }
        { 
            unbanModal && (
            <SystemModal
                show={unbanModal}
                setShow={setUnbanModal}
                title={`${t('Unban account')}`}
                onReomve={() => handleUnban()}
                isRemoving={unbanLoading}
                status={unbanStatus}
                message={unbanError?.data?.message} 
            >
                <Alert color='danger'>
                <h6 className='alert-heading'>{`${t('Note')}!`}</h6>
                <div className='alert-body' style={{ fontSize: '11px' }}>
                    {t('To confirm unban account enter a reason ..')}
                </div>
                </Alert>
                <div className="mt-2">
                <p>{t('Reason')}</p>
                <input
                    type="text"
                    className="form-control"
                    value={unbanReason}
                    onChange={(e) => setUnbanReason(e.target.value)}
                />
                </div>
            </SystemModal>
        )}
        
    </Fragment>
  )
}

export default BanTable