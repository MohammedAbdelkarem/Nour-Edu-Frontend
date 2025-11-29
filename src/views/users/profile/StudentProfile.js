// ** Import React
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'

// ** Reactstrap Imports
import { 
  Row, 
  Col, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardBody, 
  Badge, 
  Button,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Progress
} from 'reactstrap'
import Avatar from '@components/avatar'
// ** Icons
import { ArrowLeft, BookOpen, Clock, Award, TrendingUp, Calendar, Users, Star, Bookmark } from 'react-feather'

// ** Styles
import '@styles/react/apps/app-users.scss'

// ** RTK Query
import { useStudentProfileMutation, useStudentProgressMutation } from '../../../redux/rtkQuery/user/users'

const StudentProfile = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  // ** States
  const [activeTab, setActiveTab] = useState('transactions')
  const [profileData, setProfileData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
console.log('profileData', profileData)
console.log('progressData', progressData)

  // ** RTK Query hooks
  const [getStudentProfile, { isLoading: profileLoading }] = useStudentProfileMutation()
  const [getStudentProgress, { isLoading: progressLoading }] = useStudentProgressMutation()

  // ** Load student data
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true)
                
        if (!id || isNaN(parseInt(id))) {
          throw new Error('Invalid student ID')
        }
        
        const profileResponse = await getStudentProfile({
          id
        }).unwrap()
        
        const progressResponse = await getStudentProgress({
          id
        }).unwrap()
        
        setProfileData(profileResponse.data)
        setProgressData(progressResponse.data)
        
      } catch (error) {
        console.error('Error loading student data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id && !isNaN(parseInt(id))) {
      loadStudentData()
    }
  }, [id])

  // ** Tab toggle
  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!id || isNaN(parseInt(id))) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <h4>{t('Invalid Student ID')}</h4>
          <p className="text-muted">ID: {id}</p>
          <Button color="primary" onClick={() => navigate('/users')}>
            {t('Back to Users')}
          </Button>
        </div>
      </div>
    )
  }

  if (!profileData || !progressData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <h4>{t('Student not found')}</h4>
          <Button color="primary" onClick={() => navigate('/users')}>
            {t('Back to Users')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Fragment>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <Button
            color="flat-secondary"
            className="me-2"
            onClick={() => navigate('/users')}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h3 className="mb-0">{t('Student Profile')}</h3>
            <p className="text-muted mb-0">{profileData.name}</p>
          </div>
        </div>
      </div>

      <Row>
        <Col md={4}>
          <Card className="mb-3">
            <CardHeader className="text-center">
              <div className="d-flex justify-content-center mb-3">
                <Avatar
                  img={progressData?.profile?.image?.url}
                  imgHeight="100"
                  imgWidth="100"
                  className="border border-10 border-primary"
                  style={{ borderRadius: '50%' }}
                />
              </div>
              <CardTitle tag="h5" className="mb-2">
                <Link 
                  to={`/users/profile/${profileData.name}`} 
                  state={{ id: profileData.id }}
                  className="text-decoration-none"
                  style={{ color: 'inherit' }}
                >
                  {profileData.name}
                </Link>
              </CardTitle>
              
              {/* Student Data - Like in the image */}
              <div className="d-flex flex-column align-items-center gap-2">
                <div className="d-flex align-items-center">
                  <BookOpen size={16} className="text-primary me-2" />
                  <span className="text-muted small">{profileData?.e_level?.name || t('Education Level')}</span>
                </div>
                
                <div className="d-flex align-items-center">
                  <Bookmark size={16} className="text-warning me-2" />
                  <span className="text-muted small">{profileData?.c_level?.name || t('Class Level')}</span>
                </div>
                
                <div className="d-flex align-items-center">
                  <Calendar size={16} className="text-success me-2" />
                  <span className="text-muted small">{new Date(profileData.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="d-flex align-items-center">
                  <Star size={16} className="text-info me-2" />
                  <span className="text-muted small">{t('Balance')}: {profileData?.balance?.toLocaleString() || 0} {t('Points')}</span>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="text-center mb-3">
                <div className="position-relative d-inline-block">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '120px',
                      height: '120px',
                      background: `conic-gradient(from 0deg, #0568a9 0deg, #0568a9 ${  progressData.progress * 3.6  }deg, #e9ecef ${  progressData.progress * 3.6  }deg, #e9ecef 360deg)`,
                      margin: '0 auto'
                    }}
                  >
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '100px',
                        height: '100px',
                        backgroundColor: 'white'
                      }}
                    >
                      <div className="text-center">
                        <h3 className="mb-0 text-primary">{progressData.progress}%</h3>
                        <small className="text-muted">{t('Progress')}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <Row className="g-2">
                <Col xs={6}>
                  <Card className="text-center border-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <CardBody className="p-2">
                      <Clock size={20} className="text-primary mb-1" />
                      <h6 className="mb-0">{(progressData.studyHours)?.toFixed(1)}</h6>
                      <small className="text-muted">{t('Study Hours')}</small>
                    </CardBody>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="text-center border-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <CardBody className="p-2">
                      <Award size={20} className="text-warning mb-1" />
                      <h6 className="mb-0">{progressData.quizzesResult}%</h6>
                      <small className="text-muted">{t('Quiz Results')}</small>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              {/* Subject Progress */}
              <div className="mt-3">
                <h6 className="mb-3">{t('Subject Progress')}</h6>
                {Object.entries(progressData.subjectProgress || {}).map(([subject, progress]) => (
                  <div key={subject} className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-muted">{subject}</span>
                      <span className="text-muted">{progress}%</span>
                    </div>
                    <Progress value={progress} color="primary" className="mb-0" />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <CardHeader>
              <Nav tabs className="card-header-tabs">
                <NavItem>
                  <NavLink
                    active={activeTab === 'transactions'}
                    onClick={() => toggle('transactions')}
                    style={{ cursor: 'pointer' }}
                  >
                    <BookOpen size={16} className="me-1" />
                    {t('Transactions')}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    active={activeTab === 'parent'}
                    onClick={() => toggle('parent')}
                    style={{ cursor: 'pointer' }}
                  >
                    <Users size={16} className="me-1" />
                    {t('Parent')}
                  </NavLink>
                </NavItem>
              </Nav>
            </CardHeader>
            <CardBody>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="transactions">
                  <div className="py-4">
                    <h5 className="mb-3">{t('Student Transactions')}</h5>
                    {profileData?.transactions && profileData.transactions.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-striped table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>{t('Amount')}</th>
                              <th>{t('Type')}</th>
                              <th>{t('Coupon')}</th>
                              <th>{t('Date')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileData.transactions.map((transaction) => (
                              <tr key={transaction.id}>
                                <td>
                                  <Badge color="light-primary">
                                    {transaction.amount === null ? 'لا يوجد' : transaction.amount?.toLocaleString()} {t('Points')}
                                  </Badge>
                                </td>
                                <td>
                                    <Badge color={transaction.transaction_type === 'coupon_charge' ? "light-info" : "light-primary"}>
                                    {transaction.transaction_type === 'coupon_charge' ? t('Coupon Charge') : transaction.transaction_type === 'direct_purchase' ? t('Direct Purchase') : transaction.transaction_type === 'coupon_purchase' ? t('Coupon Purchase') : transaction.transaction_type}
                                  </Badge>
                                </td>
                                <td>
                                  {transaction.coupon_id ? (
                                    <Badge color="light-info">
                                      {t('Coupon')} #{transaction.coupon_id}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted">{('لا يوجد')}</span>
                                  )}
                                </td>
                                <td>
                                  <small className="text-muted">
                                    {new Date(transaction.created_at).toLocaleDateString()}
                                  </small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <BookOpen size={48} className="text-muted mb-3" />
                        <h6>{t('No Transactions')}</h6>
                        <p className="text-muted">{t('This student has no transactions yet')}</p>
                      </div>
                    )}
                  </div>
                </TabPane>

                <TabPane tabId="parent">
                  <div className="py-4">
                    <h5 className="mb-3">{t('Parent Information')}</h5>
                    {profileData?.parent ? (
                      <Card className="border">
                        <CardBody>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <h6 className="text-muted mb-1">{t('Parent Name')}</h6>
                                <p className="mb-0">{profileData.parent.name}</p>
                              </div>
                              <div className="mb-3">
                                <h6 className="text-muted mb-1">{t('Phone Number')}</h6>
                                <p className="mb-0" dir="ltr">{profileData.parent.phone_number || t('Not Provided')}</p>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <h6 className="text-muted mb-1">{t('Email')}</h6>
                                <p className="mb-0">{profileData.parent.email || t('Not Provided')}</p>
                              </div>
                              <div className="mb-3">
                                <h6 className="text-muted mb-1">{t('Bio')}</h6>
                                <p className="mb-0">{profileData.parent.bio || t('Not Provided')}</p>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ) : (
                      <div className="text-center py-4">
                        <Users size={48} className="text-muted mb-3" />
                        <h6>{t('No Parent Information')}</h6>
                        <p className="text-muted">{t('No parent information available for this student')}</p>
                      </div>
                    )}
                  </div>
                </TabPane>

                <TabPane tabId="education">
                  <div className="py-4">
                    <h5 className="mb-3">{t('Education Information')}</h5>
                    <div className="row g-3">
                      {/* Education Level */}
                      <div className="col-md-6">
                        <Card className="border">
                          <CardBody>
                            <h6 className="text-primary mb-3">
                              <BookOpen size={20} className="me-2" />
                              {t('Education Level')}
                            </h6>
                            {profileData?.e_level ? (
                              <div>
                                <h5 className="mb-1">{profileData.e_level.name}</h5>
                                <p className="text-muted mb-2">{profileData.e_level.bio}</p>
                                <div className="d-flex justify-content-between">
                                  <small className="text-muted">
                                    <strong>{t('ID')}:</strong> {profileData.e_level.id}
                                  </small>
                                  <Badge color={profileData.e_level.publish_status === 'published' ? 'success' : 'warning'}>
                                    {profileData.e_level.publish_status}
                                  </Badge>
                                </div>
                                <div className="mt-2">
                                  <small className="text-muted">
                                    {t('Contents')}: {profileData.e_level.number_of_contents} | 
                                    {t('Published')}: {profileData.e_level.number_of_published_contents}
                                  </small>
                                </div>
                              </div>
                            ) : (
                              <p className="text-muted">{t('No education level set')}</p>
                            )}
                          </CardBody>
                        </Card>
                      </div>

                      {/* Class Level */}
                      <div className="col-md-6">
                        <Card className="border">
                          <CardBody>
                            <h6 className="text-warning mb-3">
                              <Award size={20} className="me-2" />
                              {t('Class Level')}
                            </h6>
                            {profileData?.c_level ? (
                              <div>
                                <h5 className="mb-1">{profileData.c_level.name}</h5>
                                <p className="text-muted mb-2">{profileData.c_level.bio}</p>
                                <div className="d-flex justify-content-between">
                                  <small className="text-muted">
                                    <strong>{t('ID')}:</strong> {profileData.c_level.id}
                                  </small>
                                  <Badge color={profileData.c_level.publish_status === 'published' ? 'success' : 'warning'}>
                                    {profileData.c_level.publish_status}
                                  </Badge>
                                </div>
                                <div className="mt-2">
                                  <small className="text-muted">
                                    {t('Contents')}: {profileData.c_level.number_of_contents} | 
                                    {t('Published')}: {profileData.c_level.number_of_published_contents}
                                  </small>
                                </div>
                              </div>
                            ) : (
                              <p className="text-muted">{t('No class level set')}</p>
                            )}
                          </CardBody>
                        </Card>
                      </div>
                    </div>
                  </div>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default StudentProfile
