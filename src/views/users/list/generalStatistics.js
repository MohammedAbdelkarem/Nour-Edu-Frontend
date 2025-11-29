// ** Third Party Components
import classnames from 'classnames'
import { TrendingUp, Box, DollarSign, Users, Star, Smile, Trash2 } from 'react-feather'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Reactstrap Imports
import { Card, CardHeader, CardTitle, CardBody, CardText, Row, Col } from 'reactstrap'
import { useTranslation } from 'react-i18next'

const GeneralStatisticsCard = ({ cols }) => {
  const {t} = useTranslation()
  const data = [
    {
      title: '230k',
      subtitle: t('Total Users'),
      color: 'light-primary',
      icon: <Users size={20} />
    },
    {
      title: '8.549k',
      subtitle: t('Service providers'),
      color: 'light-info',
      icon: <Star size={20} />
    },
    {
      title: '1.423k',
      subtitle: t('Service beneficiaries'),
      color: 'light-warning',
      icon: <Smile size={20} />
    },
    {
      title: '1.423k',
      subtitle: t('Deleted accounts'),
      color: 'light-danger',
      icon: <Trash2 size={20} />
    }
  ]

  const renderData = () => {
    return data.map((item, index) => {
      const colMargin = Object.keys(cols)
      const margin = index === 2 ? 'sm' : colMargin[0]
      return (
        <Col
          key={index}
          {...cols}
          className={classnames({
            [`mb-2 mb-${margin}-0`]: index !== data.length - 1
          })}
        >
          <div className='d-flex align-items-center'>
            <Avatar color={item.color} icon={item.icon} className='me-2' />
            <div className='my-auto'>
              <h4 className='fw-bolder mb-0'>{item.title}</h4>
              <CardText className='font-small-3 mb-0'>{item.subtitle}</CardText>
            </div>
          </div>
        </Col>
      )
    })
  }

  return (
    <Card className='card-statistics'>
      <CardHeader>
        <CardTitle tag='h4'>{t('General Statistics')}</CardTitle>
      </CardHeader>
      <CardBody className='statistics-body'>
        <Row>{renderData()}</Row>
      </CardBody>
    </Card>
  )
}

export default GeneralStatisticsCard
