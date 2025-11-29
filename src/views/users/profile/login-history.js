// ** Reactstrap Imports
import { Card, CardHeader, CardTitle, CardBody, Table } from 'reactstrap'

// ** i18n & Hooks
import { useTranslation } from 'react-i18next'
import { useLoginHistoryMutation } from '../../../redux/rtkQuery/user/logs'
import PagesSpinner from '../../../@core/components/spinner/Fallback-spinner'
import { useEffect } from 'react'
import useHeaders from '@hooks/useHeaders'

const LoginHistory = ({ id }) => {
  const { t } = useTranslation()
  const headers = useHeaders()
  const [getHistory, { data: historyData, isLoading }] = useLoginHistoryMutation()

  useEffect(() => {
    if (id) {
      getHistory({ headers, id })
    }
  }, [id])

  return (
    <Card>
      <CardHeader className='border-bottom d-flex justify-content-between align-items-center'>
        <CardTitle tag='h4'>{t('Login History')}</CardTitle>
      </CardHeader>

      <CardBody className='my-2 py-25'>
        {isLoading ? (
          <PagesSpinner />
        ) : (
          <Table responsive bordered>
            <thead className='table-dark'>
              <tr>
                <th>{t('Device')}</th>
                <th>{t('Location')}</th>
                <th>{t('Country code')}</th>
                <th>{t('IP')}</th>
                <th>{t('Recent Activity')}</th>
              </tr>
            </thead>
            <tbody>
              {historyData?.data.map((item, index) => (
                <tr key={index}>
                  <td>{item.device}</td>
                  <td>{item.location}</td>
                  <td>{item.country_code}</td>
                  <td>{item.ip}</td>
                  <td>{item.created_at}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  )
}

export default LoginHistory