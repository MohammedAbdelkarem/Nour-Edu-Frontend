import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Row,
  Col,
  Badge,
  Button
} from 'reactstrap'
import {
  ArrowLeft,
  Users,
  BookOpen,
  Bookmark,
  Target,
  Layers,
  FileText,
  Book
} from 'react-feather'
import { useDetailsMutation } from '../../redux/rtkQuery/teacher'
import EmptyComponent from '../components/empty'
import LoadSpinner from '../../@core/components/spinner/loaders'
import ErrorAlert from '../components/handleStatusCode/error'

const Responsibilities = () => {
  const { t } = useTranslation()
  const { teacherId } = useParams()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('E_Level')
  const [responsibilities, setResponsibilities] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  
  const [getDetails] = useDetailsMutation()

  const contextTypes = [
    { key: 'E_Level', label: t('Education Levels'), icon: Bookmark, color: 'primary' },
    { key: 'C_Level', label: t('Class Levels'), icon: BookOpen, color: 'info' },
    { key: 'Course', label: t('Courses'), icon: Book, color: 'success' },
    { key: 'Subject', label: t('Subjects'), icon: Target, color: 'warning' },
    { key: 'Unit', label: t('Units'), icon: Layers, color: 'secondary' },
    { key: 'Sub_Unit', label: t('Sub Units'), icon: FileText, color: 'danger' },
    { key: 'Lesson', label: t('Lessons'), icon: Users, color: 'dark' }
  ]

  const loadResponsibilities = async (contextType) => {
    try {
      setIsLoading(true)
      const response = await getDetails({ id: teacherId, type: contextType }).unwrap()
      setResponsibilities(prev => ({
        ...prev,
        [contextType]: response.data || []
      }))
    } catch (error) {
      console.error(`Error loading ${contextType} responsibilities:`, error)
      ErrorAlert({
        title: t('Error'),
        body: t('Failed to load responsibilities'),
        button: t('OK')
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (teacherId) {
      loadResponsibilities(activeTab)
    }
  }, [teacherId, activeTab])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (!responsibilities[tab]) {
      loadResponsibilities(tab)
    }
  }

  const getContextName = (item, contextType) => {
    switch (contextType) {
      case 'E_Level':
        return item.e_level?.name || 'N/A'
      case 'C_Level':
        return item.c_level?.name || 'N/A'
      case 'Course':
        return item.course?.name || 'N/A'
      case 'Subject':
        return item.subject?.name || 'N/A'
      case 'Unit':
        return item.unit?.name || 'N/A'
      case 'Sub_Unit':
        return item.sub_unit?.name || 'N/A'
      case 'Lesson':
        return item.lesson?.name || 'N/A'
      default:
        return 'N/A'
    }
  }

  const getContextDetails = (item, contextType) => {
    switch (contextType) {
      case 'E_Level':
        return {
          bio: item.e_level?.bio,
          publish_status: item.e_level?.publish_status,
          duration: item.e_level?.duration,
          number_of_contents: item.e_level?.number_of_contents,
          number_of_published_contents: item.e_level?.number_of_published_contents,
          number_of_lessons: item.e_level?.number_of_lessons,
          number_of_students: item.e_level?.number_of_students,
          number_of_teachers: item.e_level?.number_of_teachers
        }
      case 'C_Level':
        return {
          bio: item.c_level?.bio,
          publish_status: item.c_level?.publish_status,
          duration: item.c_level?.duration,
          number_of_contents: item.c_level?.number_of_contents,
          number_of_published_contents: item.c_level?.number_of_published_contents,
          number_of_lessons: item.c_level?.number_of_lessons,
          number_of_students: item.c_level?.number_of_students,
          number_of_teachers: item.c_level?.number_of_teachers
        }
      case 'Course':
        return {
          bio: item.course?.bio,
          publish_status: item.course?.publish_status,
          duration: item.course?.duration,
          number_of_contents: item.course?.number_of_contents,
          number_of_published_contents: item.course?.number_of_published_contents,
          number_of_lessons: item.course?.number_of_lessons,
          number_of_students: item.course?.number_of_students,
          number_of_teachers: item.course?.number_of_teachers
        }
      case 'Subject':
        return {
          bio: item.subject?.bio,
          publish_status: item.subject?.publish_status,
          duration: item.subject?.duration,
          number_of_contents: item.subject?.number_of_contents,
          number_of_published_contents: item.subject?.number_of_published_contents,
          number_of_lessons: item.subject?.number_of_lessons,
          number_of_students: item.subject?.number_of_students,
          number_of_teachers: item.subject?.number_of_teachers
        }
      case 'Unit':
        return {
          bio: item.unit?.bio,
          publish_status: item.unit?.publish_status,
          duration: item.unit?.duration,
          number_of_contents: item.unit?.number_of_contents,
          number_of_published_contents: item.unit?.number_of_published_contents,
          number_of_lessons: item.unit?.number_of_lessons,
          number_of_students: item.unit?.number_of_students,
          number_of_teachers: item.unit?.number_of_teachers
        }
      case 'Sub_Unit':
        return {
          bio: item.sub_unit?.bio,
          publish_status: item.sub_unit?.publish_status,
          duration: item.sub_unit?.duration,
          number_of_contents: item.sub_unit?.number_of_contents,
          number_of_published_contents: item.sub_unit?.number_of_published_contents,
          number_of_lessons: item.sub_unit?.number_of_lessons,
          number_of_students: item.sub_unit?.number_of_students,
          number_of_teachers: item.sub_unit?.number_of_teachers
        }
      case 'Lesson':
        return {
          bio: item.lesson?.bio,
          publish_status: item.lesson?.publish_status,
          duration: item.lesson?.duration,
          number_of_contents: item.lesson?.number_of_contents,
          number_of_published_contents: item.lesson?.number_of_published_contents,
          number_of_lessons: item.lesson?.number_of_lessons,
          number_of_students: item.lesson?.number_of_students,
          number_of_teachers: item.lesson?.number_of_teachers
        }
      default:
        return {}
    }
  }

  const renderResponsibilities = (contextType) => {
    const items = responsibilities[contextType] || []
    
    if (isLoading) {
      return <LoadSpinner />
    }
    
    if (items.length === 0) {
      return (
        <EmptyComponent 
          title={t('No Responsibilities')}
          body={t('This teacher has no responsibilities in this context')}
        />
      )
    }

     return (
       <div className="row g-3">
         {items.map((item) => {
           const details = getContextDetails(item, contextType)
           return (
             <div key={item.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
               <Card className="h-100 shadow-sm border-0" style={{ 
                 borderRight: '4px solid #0568a9',
                 borderRadius: '8px',
                 transition: 'all 0.3s ease',
                 cursor: 'pointer'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.transform = 'translateY(-2px)'
                 e.currentTarget.style.boxShadow = '0 8px 25px rgba(11, 162, 167, 0.15)'
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.transform = 'translateY(0)'
                 e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'
               }}>
                 <CardBody className="p-3">
                   <div className="d-flex align-items-start mb-3">
                     <div className="rounded-circle p-2 me-3 flex-shrink-0" style={{ 
                       backgroundColor: '#0568a9', 
                       opacity: 0.9,
                       width: '40px',
                       height: '40px',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center'
                     }}>
                       {React.createElement(contextTypes.find(ct => ct.key === contextType)?.icon, { 
                         size: 18, 
                         style: { color: '#fff' } 
                       })}
                     </div>
                     <div className="flex-grow-1 min-width-0">
                       <h6 className="mb-1 text-dark text-truncate" style={{ fontSize: '14px', fontWeight: '600' }}>
                         {getContextName(item, contextType)}
                       </h6>
                       <Badge 
                         color={details.publish_status === 'published' ? 'success' : 'secondary'}
                         size="sm"
                         className="px-2 py-1"
                         style={{ fontSize: '11px' }}
                       >
                         {details.publish_status === 'published' ? t('Published') : t('Draft')}
                       </Badge>
                     </div>
                   </div>
                   
                   {details.bio && (
                     <p className="text-muted small mb-3" style={{ 
                       fontSize: '12px', 
                       lineHeight: '1.4',
                       display: '-webkit-box',
                       WebkitLineClamp: 2,
                       WebkitBoxOrient: 'vertical',
                       overflow: 'hidden'
                     }}>
                       {details.bio}
                     </p>
                   )}
                   
                   <div className="row g-2">
                     {details.duration > 0 && (
                       <div className="col-6">
                         <small className="text-muted d-block" style={{ fontSize: '10px' }}>{t('Duration')}</small>
                         <strong style={{ fontSize: '12px' }}>{details.duration} {t('min')}</strong>
                       </div>
                     )}
                     {details.number_of_contents > 0 && (
                       <div className="col-6">
                         <small className="text-muted d-block" style={{ fontSize: '10px' }}>{t('Contents')}</small>
                         <strong style={{ fontSize: '12px' }}>{details.number_of_contents}</strong>
                       </div>
                     )}
                     {details.number_of_lessons > 0 && (
                       <div className="col-6">
                         <small className="text-muted d-block" style={{ fontSize: '10px' }}>{t('Lessons')}</small>
                         <strong style={{ fontSize: '12px' }}>{details.number_of_lessons}</strong>
                       </div>
                     )}
                     {details.number_of_students > 0 && (
                       <div className="col-6">
                         <small className="text-muted d-block" style={{ fontSize: '10px' }}>{t('Students')}</small>
                         <strong style={{ fontSize: '12px' }}>{details.number_of_students}</strong>
                       </div>
                     )}
                   </div>
                 </CardBody>
               </Card>
             </div>
           )
         })}
       </div>
     )
  }

  return (
    <div className="teacher-responsibilities">
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="page-title mb-1">
              <Users size={24} className="me-2 text-primary" />
              {t('Teacher Responsibilities')}
            </h2>
            <p className="page-subtitle text-muted mb-0">
              {t('View teacher responsibilities across different contexts')}
            </p>
          </div>
          <Button 
            color="outline-secondary" 
            onClick={() => navigate('/teachers')}
            className="d-flex align-items-center"
          >
            <ArrowLeft size={16} className="me-1" />
            {t('Back to Teachers')}
          </Button>
        </div>
      </div>

       <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
         <CardHeader className="pb-0 bg-light" style={{ borderRadius: '12px 12px 0 0' }}>
           <Nav tabs className="nav-tabs-custom border-0">
             {contextTypes.map((context) => {
               const Icon = context.icon
               const items = responsibilities[context.key] || []
               const count = items.length
               
               return (
                 <NavItem key={context.key}>
                   <NavLink
                     active={activeTab === context.key}
                     onClick={() => handleTabChange(context.key)}
                     style={{ 
                       cursor: 'pointer',
                       border: 'none',
                       borderRadius: '8px',
                       margin: '0 4px',
                       padding: '12px 16px',
                       fontWeight: activeTab === context.key ? '600' : '500',
                       color: activeTab === context.key ? '#0568a9' : '#6c757d',
                       backgroundColor: activeTab === context.key ? '#e8f8f9' : 'transparent',
                       transition: 'all 0.3s ease'
                     }}
                     className="d-flex align-items-center"
                   >
                     <Icon size={16} className="me-2" />
                     <span style={{ fontSize: '14px' }}>{context.label}</span>
                     {count > 0 && (
                       <Badge 
                         color={context.color} 
                         className="ms-2" 
                         size="sm"
                         style={{ 
                           fontSize: '10px',
                           padding: '4px 8px',
                           borderRadius: '12px'
                         }}
                       >
                         {count}
                       </Badge>
                     )}
                   </NavLink>
                 </NavItem>
               )
             })}
           </Nav>
         </CardHeader>
         
         <CardBody className="p-4" style={{ minHeight: '400px' }}>
           <TabContent activeTab={activeTab}>
             {contextTypes.map((context) => (
               <TabPane key={context.key} tabId={context.key}>
                 <div className="mt-2">
                   {renderResponsibilities(context.key)}
                 </div>
               </TabPane>
             ))}
           </TabContent>
         </CardBody>
       </Card>
    </div>
  )
}

export default Responsibilities
