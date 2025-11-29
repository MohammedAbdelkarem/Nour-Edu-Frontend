
import { Card, CardHeader, CardTitle, CardBody, Table, Button, Input, Modal, ModalBody, ModalHeader } from 'reactstrap'


import { useTranslation } from 'react-i18next'
import { useLoginHistoryMutation } from '../../../redux/rtkQuery/user/logs'
import PagesSpinner from '../../../@core/components/spinner/Fallback-spinner'
import { Fragment, useEffect, useState } from 'react'

import useHeaders from '@hooks/useHeaders'
import { useActiveSessionsQuery, useLogoutAllMutation, useLogoutSessionsMutation } from '../../../redux/rtkQuery/auth'
import { useNavigate } from 'react-router-dom'
const LoginHistory = ({ id }) => {
  const { t } = useTranslation()
  const headers = useHeaders()
  const navigate = useNavigate()

  const [getHistory, { data: historyData, isLoading }] = useLoginHistoryMutation()
  const {data:activeData} = useActiveSessionsQuery({headers})
  const [logoutAll] = useLogoutAllMutation()
  const [logoutById] = useLogoutSessionsMutation()
  const [selectedSessionIds, setSelectedSessionIds] = useState([])
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (id) {
      getHistory({ headers, id })
    }
  }, [id])

  const handleLogoutAll = async () => {
    try {
      await logoutAll({ headers }).unwrap()
      localStorage.clear()  
      navigate('/login')    
    } catch (error) {
      console.error('Logout all sessions failed:', error)
    }
  }

  const handleLogoutById = async () => {
    if (selectedSessionIds.length === 0) return

    try {
      
      await Promise.all(
        selectedSessionIds.map(sessionId => logoutById({ headers, body:sessionId }).unwrap()
        )
      )
      setSelectedSessionIds([]) 
      getHistory({ headers, id }) 
    } catch (error) {
      console.error('Failed to logout selected sessions:', error)
    }
  }

  const handleRowSelect = (sessionId) => {
    console.log('sessionId', sessionId)
    
    setSelectedSessionIds(prev => (prev.includes(sessionId) ? prev.filter(id => id !== sessionId) : [...prev, sessionId])
    )
  }
  return (
    <Fragment>
      <Card>
        <CardHeader className='border-bottom d-flex justify-content-between align-items-center'>
          <CardTitle tag='h4'>{t('Login History')}</CardTitle>
          <Button color='primary' outline className='me-1' onClick={() => setShow(true)}>
            {t('View active sessions')}
          </Button>
        </CardHeader>
        <CardBody className='my-2 py-25'>
          {isLoading ? (
            <PagesSpinner />
          ) : (
            <div style={{ height: '50vh', overflowY: 'auto' }}>
              <Table responsive bordered>
                <thead className='table-dark'>
                  <tr>
                    {/* {<th></th>} */}
                    <th>{t('Device')}</th>
                    <th>{t('Location')}</th>
                    <th>{t('Country code')}</th>
                    <th>{t('IP')}</th>
                    <th>{t('Recent Activity')}</th>
                  </tr>
                </thead>
                  <tbody>
                    {historyData?.data.map((item, index) => {
                      const sessionId = item.id
                      const isSelected = selectedSessionIds.includes(sessionId)
                      return (
                        <tr key={index} className={isSelected ? 'table-active' : ''}>
                          {/* <td>
                            <Input
                              type='checkbox'
                              checked={isSelected}
                              onChange={() => handleRowSelect(sessionId)}
                            />
                          </td> */}
                          <td>{item.device}</td>
                          <td>{item.location}</td>
                          <td>{item.country_code}</td>
                          <td>{item.ip}</td>
                          <td>{item.created_at}</td>
                        </tr>
                      )
                    })}
                  </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
      
       {
          show && (
            <Modal isOpen={show} centered className='modal-lg' toggle={() => setShow(false)}>
              {/* ModalHeader with Close (X) Button */}
              <ModalHeader toggle={() => setShow(false)} />

              {/* Modal Title */}
              <div className="px-4 text-center">
                <h1
                  style={{
                    width: "100%",
                    borderRadius: "5px",
                    padding: "10px",
                    borderRight: "10px solid #0568a9",
                    borderLeft: "10px solid #0568a9"
                  }}
                >
                  {t('Active Sessions')}
                </h1>
              </div>

              {/* Action Buttons */}
              <ModalHeader className='d-flex justify-content-end border-0'>
                {selectedSessionIds.length === 0 ? (
                  <Button
                    color='secondary'
                    outline
                    onClick={handleLogoutAll}
                  >
                    {t('Logout All Sessions')}
                  </Button>
                ) : (
                  <Button
                    color='secondary'
                    outline
                    onClick={handleLogoutById}
                  >
                    {t('Logout Selected')}
                  </Button>
                )}
              </ModalHeader>

              {/* Modal Body with Table */}
              <ModalBody>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <Table responsive>
                    <thead className='table-dark'>
                      <tr>
                        <th></th>
                        <th>{t('Device')}</th>
                        <th>{t('Location')}</th>
                        <th>{t('Country code')}</th>
                        <th>{t('IP')}</th>
                        <th>{t('Recent Activity')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeData?.data.map((item, index) => {
                        const sessionId = item.id
                        const isSelected = selectedSessionIds.includes(sessionId)
                        return (
                          <tr key={index} className={isSelected ? 'table-active' : ''}>
                            <td>
                              <Input
                                type='checkbox'
                                checked={isSelected}
                                onChange={() => handleRowSelect(sessionId)}
                              />
                            </td>
                            <td>{item.device}</td>
                            <td>{item.location}</td>
                            <td>{item.country_code}</td>
                            <td>{item.ip}</td>
                            <td>{item.created_at}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>
                </div>
              </ModalBody>
            </Modal>
          )
        }


    </Fragment>
  )
}
export default LoginHistory