// ** User List Component
import Table from './Table'

// ** Reactstrap Imports
import { Row, Col } from 'reactstrap'

// ** Custom Components
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'

// ** Icons Imports
import { User, Users, UserCheck, UserX, Clock, Trash2, StopCircle, Slash, Activity, TrendingUp } from 'react-feather'

// ** Styles
import '@styles/react/apps/app-users.scss'
import { useTranslation } from 'react-i18next'
import GeneralStatisticsCard from './generalStatistics'

const Statistics = () => {
  const {t} = useTranslation()
  return (
    <div className='app-user-list'>
      <Row className={'match-height'}>
        <Col md={7}>
            <GeneralStatisticsCard cols={{ md: '3', sm: '6', xs: '12' }} />
        </Col>
        <Col md={5}>
            <Row>
                <Col md={6}>
                  <StatsHorizontal
                        color='primary'
                        statTitle={t('Effective accounts')}
                        icon={<Activity size={20} />}
                        renderStats={<h3 className='fw-bolder mb-75'>21,459</h3>}
                    />
                </Col>
                <Col md={6}>
                  <StatsHorizontal
                        color='danger'
                        statTitle={t('Banned accounts')}
                        icon={<Slash size={20} />}
                        renderStats={<h3 className='fw-bolder mb-75'>21,459</h3>}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                  <StatsHorizontal
                        color='warning'
                        statTitle={t('Requests to join')}
                        icon={<Clock size={20} />}
                        renderStats={<h3 className='fw-bolder mb-75'>21,459</h3>}
                    />
                </Col>
                <Col md={6}>
                  <StatsHorizontal
                        color='info'
                        statTitle={t('Last 7 days')}
                        icon={<TrendingUp size={20} />}
                        renderStats={<h3 className='fw-bolder mb-75'>21,459</h3>}
                    />
                </Col>
            </Row>
        </Col>
      </Row>
    </div>
  )
}

export default Statistics
