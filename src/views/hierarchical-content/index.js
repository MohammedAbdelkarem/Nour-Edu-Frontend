import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Nav, NavItem, NavLink, TabContent, TabPane, Spinner } from 'reactstrap'
import { 
  BookOpen,
  Plus,
  File,
  Folder,
  HelpCircle,
  FileText
} from 'react-feather'
import WizardLayout from './components/WizardLayout'
import ELevelCard from './components/ELevelCard'
import CLevelCard from './components/CLevelCard'
import CourseCard from './components/CourseCard'
import SubjectCard from './components/SubjectCard'
import UnitCard from './components/UnitCard'
import SubUnitCard from './components/SubUnitCard'
import LessonCard from './components/LessonCard'
import FileManagement from './components/FileManagement'
import LessonContent from './components/LessonContent'
import QuestionsBank from './components/QuestionsBank'
import QuizManagement from './components/QuizManagement'
import { useGetMutation } from '../../redux/rtkQuery/hierarchical/e-level'
import { useGetMutation as useGetCLevelsMutation } from '../../redux/rtkQuery/hierarchical/c-level'
import { useGetMutation as useGetCoursesMutation } from '../../redux/rtkQuery/hierarchical/course'
import { useGetMutation as useGetSubjectsMutation } from '../../redux/rtkQuery/hierarchical/subject'
import { useGetMutation as useGetUnitsMutation } from '../../redux/rtkQuery/hierarchical/unit'
import { useGetMutation as useGetSubUnitsMutation } from '../../redux/rtkQuery/hierarchical/sub-units'
import { useGetMutation as useGetLessonsMutation } from '../../redux/rtkQuery/hierarchical/lesson'
import './components/WizardLayout.scss'
import { useOverviewMutation } from '../../redux/rtkQuery/admin'
import useHeaders from '@hooks/useHeaders'

const HierarchicalContent = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedPath, setSelectedPath] = useState([])
  const [expandedNodes, setExpandedNodes] = useState(new Set())
  const [persistentSelections, setPersistentSelections] = useState({
    eLevel: null,
    cLevel: null,
    course: null,
    subject: null,
    unit: null,
    subUnit: null,
    lesson: null
  })
  const [eLevels, setELevels] = useState([])
  const [isLoadingELevels, setIsLoadingELevels] = useState(false)
  const [cLevels, setCLevels] = useState([])
  const [isLoadingCLevels, setIsLoadingCLevels] = useState(false)
  const [courses, setCourses] = useState([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)
  const [units, setUnits] = useState([])
  const [isLoadingUnits, setIsLoadingUnits] = useState(false)
  const [subUnits, setSubUnits] = useState([])
  const [isLoadingSubUnits, setIsLoadingSubUnits] = useState(false)
  const [lessons, setLessons] = useState([])
  const [isLoadingLessons, setIsLoadingLessons] = useState(false)

  const [getELevels] = useGetMutation()
  const [getCLevels] = useGetCLevelsMutation()
  const [getCourses] = useGetCoursesMutation()
  const [getSubjects] = useGetSubjectsMutation()
  const [getUnits] = useGetUnitsMutation()
  const [getSubUnits] = useGetSubUnitsMutation()
  const [getLessons] = useGetLessonsMutation()
  const headers = useHeaders()
  const [overview] = useOverviewMutation()

  useEffect(() => {
    overview({headers})
  }, [])

  const fetchELevels = async () => {
    try {
      setIsLoadingELevels(true)
      const response = await getELevels().unwrap()
      
      setELevels(response.data || [])
    } catch (error) {
      console.error('Error fetching e-levels:', error)
      setELevels([])
    } finally {
      setIsLoadingELevels(false)
    }
  }

  const fetchCLevels = async (eLevelId) => {
    try {
      setIsLoadingCLevels(true)
      const response = await getCLevels({ id: eLevelId }).unwrap()
      setCLevels(response.data || [])
    } catch (error) {
      console.error('Error fetching c-levels:', error)
      setCLevels([])
    } finally {
      setIsLoadingCLevels(false)
    }
  }

  const handleRefreshELevels = () => {
    fetchELevels()
  }

  const fetchCourses = async (cLevelId) => {
    try {
      setIsLoadingCourses(true)
      const response = await getCourses({ id: cLevelId }).unwrap()
      setCourses(response.data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([])
    } finally {
      setIsLoadingCourses(false)
    }
  }

  const handleRefreshCLevels = () => {
    if (selectedPath.length > 0) {
      const selectedELevel = selectedPath[0]
      fetchCLevels(selectedELevel.id)
    }
  }

  const fetchSubjects = async (courseId) => {
    try {
      setIsLoadingSubjects(true)
      const response = await getSubjects({ id: courseId }).unwrap()
      setSubjects(response.data || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
      setSubjects([])
    } finally {
      setIsLoadingSubjects(false)
    }
  }

  const handleRefreshCourses = () => {
    if (selectedPath.length > 1) {
      const selectedCLevel = selectedPath[1]
      fetchCourses(selectedCLevel.id)
    }
  }

  const handleRefreshSubjects = () => {
    if (selectedPath.length > 2) {
      const selectedCourse = selectedPath[2]
      fetchSubjects(selectedCourse.id)
    }
  }

  const fetchUnits = async (subjectId) => {
    try {
      setIsLoadingUnits(true)
      const response = await getUnits({ id: subjectId }).unwrap()
      setUnits(response.data || [])
    } catch (error) {
      console.error('Error fetching units:', error)
      setUnits([])
    } finally {
      setIsLoadingUnits(false)
    }
  }

  const handleRefreshUnits = () => {
    if (selectedPath.length > 3) {
      const selectedSubject = selectedPath[3]
      fetchUnits(selectedSubject.id)
    }
  }

  const fetchSubUnits = async (unitId) => {
    try {
      setIsLoadingSubUnits(true)
      const response = await getSubUnits({ id: unitId }).unwrap()
      setSubUnits(response.data || [])
    } catch (error) {
      console.error('Error fetching sub-units:', error)
      setSubUnits([])
    } finally {
      setIsLoadingSubUnits(false)
    }
  }

  const handleRefreshSubUnits = () => {
    if (selectedPath.length > 4) {
      const selectedUnit = selectedPath[4]
      fetchSubUnits(selectedUnit.id)
    }
  }

  const fetchLessons = async (subUnitId) => {
    try {
      setIsLoadingLessons(true)
      const response = await getLessons({ id: subUnitId }).unwrap()
      setLessons(response.data || [])
    } catch (error) {
      console.error('Error fetching lessons:', error)
      setLessons([])
    } finally {
      setIsLoadingLessons(false)
    }
  }

  const handleRefreshLessons = () => {
    if (selectedPath.length > 5) {
      const selectedSubUnit = selectedPath[5]
      fetchLessons(selectedSubUnit.id)
    }
  }

  // Parse URL path and build selectedPath from URL parameters
  useEffect(() => {
    const pathname = location.pathname
    const pathSegments = pathname.split('/').filter(Boolean)
    
    // Remove 'hierarchical-content' from segments
    const contentIndex = pathSegments.indexOf('hierarchical-content')
    if (contentIndex === -1) return
    
    const hierarchySegments = pathSegments.slice(contentIndex + 1)
    
    if (hierarchySegments.length === 0) {
      setSelectedPath([])
      setPersistentSelections({
        eLevel: null,
        cLevel: null,
        course: null,
        subject: null,
        unit: null,
        subUnit: null,
        lesson: null
      })
      return
    }
    
    // Parse segments like "e_level=1", "c_level=2", etc.
    const parseSegment = (segment) => {
      const parts = segment.split('=')
      if (parts.length !== 2) return null
      return { type: parts[0], id: parseInt(parts[1]) }
    }
    
    const parsedSegments = hierarchySegments.map(parseSegment).filter(Boolean)
    
    // Build selectedPath by fetching data for each level
    const buildPathFromUrl = async () => {
      const path = []
      
      for (let i = 0; i < parsedSegments.length; i++) {
        const segment = parsedSegments[i]
        
        // Normalize type to match what the app expects
        let normalizedType = segment.type
        if (segment.type === 'subject') normalizedType = 'Subject'
        if (segment.type === 'unit') normalizedType = 'Unit'
        if (segment.type === 'sub_unit') normalizedType = 'Sub_Unit'
        if (segment.type === 'lesson') normalizedType = 'Lesson'
        
        path.push({
          id: segment.id,
          type: normalizedType,
          name: ''
        })
      }
      
      setSelectedPath(path)
      
      // Trigger data fetching based on path
      if (path.length >= 1) {
        const eLevelId = path[0].id
        fetchCLevels(eLevelId)
      }
      if (path.length >= 2) {
        const cLevelId = path[1].id
        fetchCourses(cLevelId)
      }
      if (path.length >= 3) {
        const courseId = path[2].id
        fetchSubjects(courseId)
      }
      if (path.length >= 4) {
        const subjectId = path[3].id
        fetchUnits(subjectId)
      }
      if (path.length >= 5) {
        const unitId = path[4].id
        fetchSubUnits(unitId)
      }
      if (path.length >= 6) {
        const subUnitId = path[5].id
        fetchLessons(subUnitId)
      }
    }
    
    buildPathFromUrl()
  }, [location.pathname])
  
  // Update persistent selections when selectedPath changes
  useEffect(() => {
    if (selectedPath.length === 0) {
      setPersistentSelections({
        eLevel: null,
        cLevel: null,
        course: null,
        subject: null,
        unit: null,
        subUnit: null,
        lesson: null
      })
    } else {
      setPersistentSelections({
        eLevel: selectedPath.length >= 1 ? selectedPath[0] : null,
        cLevel: selectedPath.length >= 2 ? selectedPath[1] : null,
        course: selectedPath.length >= 3 ? selectedPath[2] : null,
        subject: selectedPath.length >= 4 ? selectedPath[3] : null,
        unit: selectedPath.length >= 5 ? selectedPath[4] : null,
        subUnit: selectedPath.length >= 6 ? selectedPath[5] : null,
        lesson: selectedPath.length >= 7 ? selectedPath[6] : null
      })
    }
  }, [selectedPath])

  useEffect(() => {
    fetchELevels()
  }, [])

  // Handle navigation state from CreateLesson
  useEffect(() => {
    if (location.state?.selectedPath && location.state?.preserveHierarchy) {
      console.log('Restoring selectedPath from navigation state:', location.state.selectedPath)
      setSelectedPath(location.state.selectedPath)
      
      // Trigger the appropriate data fetching based on the path length
      const path = location.state.selectedPath
      if (path.length >= 1) {
        fetchCLevels(path[0].id)
      }
      if (path.length >= 2) {
        fetchCourses(path[1].id)
      }
      if (path.length >= 3) {
        fetchSubjects(path[2].id)
      }
      if (path.length >= 4) {
        fetchUnits(path[3].id)
      }
      if (path.length >= 5) {
        fetchSubUnits(path[4].id)
      }
      if (path.length >= 6) {
        fetchLessons(path[5].id)
      }
    }
  }, [location.state])

  const buildUrlFromPath = (path) => {
    if (path.length === 0) {
      return '/hierarchical-content'
    }
    
    const segments = path.map(item => {
      let type = item.type
      // Normalize type names to lowercase with underscore
      if (type === 'Subject') type = 'subject'
      if (type === 'Unit') type = 'unit'
      if (type === 'Sub_Unit') type = 'sub_unit'
      if (type === 'Lesson') type = 'lesson'
      
      return `${type}=${item.id}`
    })
    
    return `/hierarchical-content/${segments.join('/')}`
  }

  const handleNodeClick = (node, path) => {
    console.log('handleNodeClick:', {
      node: { id: node.id, name: node.name, type: node.type },
      pathLength: path.length,
      path: path.map(item => ({ id: item.id, name: item.name, type: item.type }))
    })
    
    // Navigate to new URL
    const newUrl = buildUrlFromPath(path)
    navigate(newUrl)
    
    // Save persistent selections based on path length
    setPersistentSelections(prev => {
      const newSelections = { ...prev }
      if (path.length >= 1) newSelections.eLevel = path[0]
      if (path.length >= 2) newSelections.cLevel = path[1]
      if (path.length >= 3) newSelections.course = path[2]
      if (path.length >= 4) newSelections.subject = path[3]
      if (path.length >= 5) newSelections.unit = path[4]
      if (path.length >= 6) newSelections.subUnit = path[5]
      if (path.length >= 7) newSelections.lesson = path[6]
      return newSelections
    })
    
    const nodeId = node.id.toString()
    const newExpandedNodes = new Set(expandedNodes)
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId)
    } else {
      newExpandedNodes.add(nodeId)
    }
    setExpandedNodes(newExpandedNodes)
  }

  const handleShowAll = () => {
    navigate('/hierarchical-content')
    setExpandedNodes(new Set())
  }

  const clearPersistentSelections = () => {
    setPersistentSelections({
      eLevel: null,
      cLevel: null,
      course: null,
      subject: null,
      unit: null,
      subUnit: null,
      lesson: null
    })
  }

  const handleStepClick = (stepNumber) => {
    if (stepNumber === 1) {
      navigate('/hierarchical-content')
      setExpandedNodes(new Set())
    } else {
      const newPath = []
      if (stepNumber >= 2 && persistentSelections.eLevel) newPath.push(persistentSelections.eLevel)
      if (stepNumber >= 3 && persistentSelections.cLevel) newPath.push(persistentSelections.cLevel)
      if (stepNumber >= 4 && persistentSelections.course) newPath.push(persistentSelections.course)
      if (stepNumber >= 5 && persistentSelections.subject) newPath.push(persistentSelections.subject)
      if (stepNumber >= 6 && persistentSelections.unit) newPath.push(persistentSelections.unit)
      if (stepNumber >= 7 && persistentSelections.subUnit) newPath.push(persistentSelections.subUnit)
      if (stepNumber >= 8 && persistentSelections.lesson) newPath.push(persistentSelections.lesson)
      
      const newUrl = buildUrlFromPath(newPath.slice(0, stepNumber - 1))
      navigate(newUrl)
      setExpandedNodes(new Set())
    }
  }

  const getCurrentStep = () => {
    if (selectedPath.length === 0) return 1
    if (selectedPath.length === 6 && selectedPath[5]?.type === 'Lesson') {
      return 6
    }
    return Math.min(selectedPath.length + 1, 7)
  }

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return t('Education Levels')
      case 2: return t('Class Levels')
      case 3: return t('Courses')
      case 4: return t('Subjects')
      case 5: return t('Units')
      case 6: return selectedPath.length === 6 && selectedPath[5]?.type === 'Lesson' ? t('Lesson') : t('Sub Units')
      case 7: return t('Lessons')
      default: return t('Content')
    }
  }

  const getSelectedLevelName = (step) => {
    switch (step) {
      case 1: {
        if (persistentSelections.eLevel?.name) return persistentSelections.eLevel.name
        if (persistentSelections.eLevel?.id) {
          const item = eLevels.find(e => e.id === persistentSelections.eLevel.id)
          return item?.name || ''
        }
        return ''
      }
      case 2: {
        if (persistentSelections.cLevel?.name) return persistentSelections.cLevel.name
        if (persistentSelections.cLevel?.id) {
          const item = cLevels.find(c => c.id === persistentSelections.cLevel.id)
          return item?.name || ''
        }
        return ''
      }
      case 3: {
        if (persistentSelections.course?.name) return persistentSelections.course.name
        if (persistentSelections.course?.id) {
          const item = courses.find(c => c.id === persistentSelections.course.id)
          return item?.name || ''
        }
        return ''
      }
      case 4: {
        if (persistentSelections.subject?.name) return persistentSelections.subject.name
        if (persistentSelections.subject?.id) {
          const item = subjects.find(s => s.id === persistentSelections.subject.id)
          return item?.name || ''
        }
        return ''
      }
      case 5: {
        if (persistentSelections.unit?.name) return persistentSelections.unit.name
        if (persistentSelections.unit?.id) {
          const item = units.find(u => u.id === persistentSelections.unit.id)
          return item?.name || ''
        }
        return ''
      }
      case 6: {
        if (persistentSelections.subUnit?.name) return persistentSelections.subUnit.name
        if (persistentSelections.subUnit?.id) {
          const item = subUnits.find(s => s.id === persistentSelections.subUnit.id)
          return item?.name || ''
        }
        return ''
      }
      case 7: {
        if (persistentSelections.lesson?.name) return persistentSelections.lesson.name
        if (persistentSelections.lesson?.id) {
          const item = lessons.find(l => l.id === persistentSelections.lesson.id)
          return item?.name || ''
        }
        return ''
      }
      default: return ''
    }
  }

  const getCurrentData = () => {
    if (selectedPath.length === 0) {
      const mappedData = eLevels.map(level => ({
        ...level,
        type: 'e_level',
        children: level.c_levels || []
      }))
      return mappedData
    }
    
    if (selectedPath.length === 1) {
      const mappedData = cLevels.map(level => ({
        ...level,
        type: 'c_level',
        children: level.courses || []
      }))
      return mappedData
    }
    
    if (selectedPath.length === 2) {
      const mappedData = courses.map(course => ({
        ...course,
        type: 'course',
        children: course.subjects || []
      }))
      return mappedData
    }
    
    if (selectedPath.length === 3) {
      const mappedData = subjects.map(subject => ({
        ...subject,
        type: 'Subject',
        children: subject.units || []
      }))
      return mappedData
    }
    
    if (selectedPath.length === 4) {
      const mappedData = units.map(unit => ({
        ...unit,
        type: 'Unit',
        children: unit.sub_units || []
      }))
      return mappedData
    }
    
    if (selectedPath.length === 5) {
      const mappedData = subUnits.map(subUnit => ({
        ...subUnit,
        type: 'Sub_Unit',
        children: subUnit.lessons || []
      }))
      return mappedData
    }
    
    if (selectedPath.length === 6) {
      const mappedData = lessons.map(lesson => ({
        ...lesson,
        type: 'Lesson',
        children: []
      }))
      return mappedData
    }
    
    return []
  }

  const getCurrentContext = () => {
    if (selectedPath.length >= 3) {
      const currentItem = selectedPath[selectedPath.length - 1]
      return {
        contextId: currentItem.id,
        contextType: currentItem.type,
        contextName: currentItem.name
      }
    }
    return null
  }
  const [activeTab, setActiveTab] = useState('content')

  useEffect(() => {
    if (getCurrentContext()?.contextType === 'Lesson') {
      setActiveTab('files')
    } else {
      setActiveTab('content')
    }
  }, [selectedPath])

  const shouldShowFileManagement = () => {
    return selectedPath.length >= 4 && selectedPath.length <= 6
  }
  
  const getItemDisplayName = (item, index) => {
    if (item.name) return item.name
    
    // Look up name from loaded data based on index
    if (index === 0) {
      const found = eLevels.find(e => e.id === item.id)
      return found?.name || `ID: ${item.id}`
    } else if (index === 1) {
      const found = cLevels.find(c => c.id === item.id)
      return found?.name || `ID: ${item.id}`
    } else if (index === 2) {
      const found = courses.find(c => c.id === item.id)
      return found?.name || `ID: ${item.id}`
    } else if (index === 3) {
      const found = subjects.find(s => s.id === item.id)
      return found?.name || `ID: ${item.id}`
    } else if (index === 4) {
      const found = units.find(u => u.id === item.id)
      return found?.name || `ID: ${item.id}`
    } else if (index === 5) {
      const found = subUnits.find(s => s.id === item.id)
      return found?.name || `ID: ${item.id}`
    } else if (index === 6) {
      const found = lessons.find(l => l.id === item.id)
      return found?.name || `ID: ${item.id}`
    }
    return `ID: ${item.id}`
  }
  
  console.log('selectedPath', selectedPath)
  

  const shouldShowLessonContent = () => {
    const shouldShow = selectedPath.length === 7
    console.log('shouldShowLessonContent:', {
      pathLength: selectedPath.length,
      lastItemType: selectedPath[5]?.type,
      shouldShow,
      selectedPath: selectedPath.map(item => ({ id: item.id, name: item.name, type: item.type }))
    })
    return shouldShow
  }

  return (
    <div className="wizard-container">
      <div className="wizard-body">
        <div className="wizard-sidebar">
          <h3 className="progress-title">{t('Content Structure')}</h3>
          <p className="progress-subtitle">{t('Build your educational content')}</p>
          
          <div className="progress-steps">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => {
              const isLessonSelected = selectedPath.length === 6 && selectedPath[5]?.type === 'Lesson'
              const hasPersistentSelection = (step === 1 && persistentSelections.eLevel) ||
                                           (step === 2 && persistentSelections.cLevel) ||
                                           (step === 3 && persistentSelections.course) ||
                                           (step === 4 && persistentSelections.subject) ||
                                           (step === 5 && persistentSelections.unit) ||
                                           (step === 6 && persistentSelections.subUnit) ||
                                           (step === 7 && persistentSelections.lesson)
              const isSelected = isLessonSelected ? step <= 6 : hasPersistentSelection
              const isActive = step === getCurrentStep()
              const isClickable = isLessonSelected ? step <= 6 : hasPersistentSelection || step <= selectedPath.length + 1
              return (
                <div 
                  key={step} 
                  className={`progress-step ${isClickable ? 'clickable' : ''}`}
                  onClick={() => isClickable && handleStepClick(step)}
                  style={{ cursor: isClickable ? 'pointer' : 'default' }}
                >
                  <div className={`step-circle ${isSelected ? 'selected' : 'not-selected'}`}>
                    {step}
                  </div>
                  <div className="step-content">
                    <h6 className="step-title">{getStepTitle(step)}</h6>
                    <p className="step-description">
                      {isSelected ? (isActive ? t('Current Level') : (isLessonSelected && step === 6) ? selectedPath[5]?.name || '' : getSelectedLevelName(step)) : t('Not Selected')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="wizard-main">
          <div className="wizard-content-area">
            {selectedPath.length > 0 && (
              <div className="breadcrumb-navigation">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">
                      {t('Current Path')}: {selectedPath.map((item, index) => getItemDisplayName(item, index)).join(' → ')}
                    </small>
                  </div>
                  <Button 
                    color="outline-secondary" 
                    size="sm"
                    onClick={() => {
                      handleShowAll()
                      clearPersistentSelections()
                    }}
                    className="d-flex align-items-center"
                  >
                    <Plus size={14} className="me-1" />
                    {t('Reset levels!')}
                  </Button>
                </div>
              </div>
            )}
            <div className="content-section">
              <h4 className="section-title">
                <BookOpen className="section-icon" />
                {getStepTitle(getCurrentStep())}
              </h4>
              <p className="section-description">
                {selectedPath.length === 0 ? t('Select an education level to begin building your content structure') : (selectedPath.length === 6 && selectedPath[5]?.type === 'Lesson') ? t('Manage files and quizzes for this lesson') : t('Choose from the available options to continue building your content')}
              </p>
            </div>
            {(shouldShowFileManagement() || getCurrentContext()?.contextType === 'Lesson') && (
              <div className="content-tabs mb-4">
                <Nav tabs>
                  {getCurrentContext()?.contextType !== 'Lesson' && (
                    <NavItem>
                      <NavLink
                        active={activeTab === 'content'}
                        onClick={() => setActiveTab('content')}
                        style={{ cursor: 'pointer' }}
                      >
                        <Folder size={16} className="me-1" />
                        {t('Content')}
                      </NavLink>
                    </NavItem>
                  )}
                  <NavItem>
                    <NavLink
                      active={activeTab === 'files'}
                      onClick={() => setActiveTab('files')}
                      style={{ cursor: 'pointer' }}
                    >
                      <File size={16} className="me-1" />
                      {t('Files')}
                    </NavLink>
                  </NavItem>
                  {(getCurrentContext()?.contextType === 'Unit' || 
                    getCurrentContext()?.contextType === 'Sub_Unit' ||
                    getCurrentContext()?.contextType === 'Lesson') && (
                    <NavItem>
                      <NavLink
                        active={activeTab === 'quizzes'}
                        onClick={() => setActiveTab('quizzes')}
                        style={{ cursor: 'pointer' }}
                      >
                        <FileText size={16} className="me-1" />
                        {t('Quizzes')}
                      </NavLink>
                    </NavItem>
                  )}
                  {getCurrentContext()?.contextType === 'Lesson' && (
                    <NavItem>
                      <NavLink
                        active={activeTab === 'questions'}
                        onClick={() => setActiveTab('questions')}
                        style={{ cursor: 'pointer' }}
                      >
                        <HelpCircle size={16} className="me-1" />
                        {t('Questions Bank')}
                      </NavLink>
                    </NavItem>
                  )}
                </Nav>
                <TabContent activeTab={activeTab}>
                  <TabPane tabId="content">
                    <div className="mt-3">
                    </div>
                  </TabPane>
                  <TabPane tabId="files">
                    <div className="mt-3">
                      <FileManagement
                        {...getCurrentContext()}
                        onRefresh={() => {
                          if (selectedPath.length === 3) handleRefreshSubjects()
                          else if (selectedPath.length === 4) handleRefreshUnits()
                          else if (selectedPath.length === 5) handleRefreshSubUnits()
                          else if (selectedPath.length === 6) handleRefreshLessons()
                        }}
                      />
                    </div>
                  </TabPane>
                  <TabPane tabId="quizzes">
                    <div className="mt-3">
                      <QuizManagement
                        {...getCurrentContext()}
                        selectedPath={selectedPath}
                        onRefresh={() => {
                          if (selectedPath.length === 3) handleRefreshSubjects()
                          else if (selectedPath.length === 4) handleRefreshUnits()
                          else if (selectedPath.length === 5) handleRefreshSubUnits()
                          else if (selectedPath.length === 6) handleRefreshLessons()
                        }}
                      />
                    </div>
                  </TabPane>
                  {getCurrentContext()?.contextType === 'Lesson' && (
                    <TabPane tabId="questions">
                      <div className="mt-3">
                        <QuestionsBank
                          {...getCurrentContext()}
                          selectedPath={selectedPath}
                          onRefresh={() => {
                            if (selectedPath.length === 3) handleRefreshSubjects()
                            else if (selectedPath.length === 4) handleRefreshUnits()
                            else if (selectedPath.length === 5) handleRefreshSubUnits()
                            else if (selectedPath.length === 6) handleRefreshLessons()
                          }}
                        />
                      </div>
                    </TabPane>
                  )}
                </TabContent>
              </div>
            )}
            {shouldShowLessonContent() && !(shouldShowFileManagement() || getCurrentContext()?.contextType === 'Lesson') ? (
              <div>
                <LessonContent
                  lessonId={selectedPath[5]?.id}
                  lessonName={selectedPath[5]?.name}
                  onRefresh={() => {
                    if (selectedPath.length === 6) handleRefreshLessons()
                  }}
                />
              </div>
            ) : (() => {
              const showFileManagement = shouldShowFileManagement()
              const showContent = !showFileManagement || activeTab === 'content'
              console.log('Content rendering conditions:', {
                shouldShowLessonContent: shouldShowLessonContent(),
                shouldShowFileManagement: showFileManagement,
                activeTab,
                showContent,
                selectedPathLength: selectedPath.length
              })
              return showContent
            })() ? (
              selectedPath.length === 0 ? (
                isLoadingELevels ? (
                  <div className="text-center py-5">
                    <Spinner size="lg" color="primary" />
                    <p className="mt-3 text-muted">{t('Loading education levels...')}</p>
                  </div>
                ) : (
                  <ELevelCard
                    data={getCurrentData()}
                    selectedPath={selectedPath}
                    onNodeClick={handleNodeClick}
                    onRefresh={handleRefreshELevels}
                  />
                )
              ) : selectedPath.length === 1 ? (
                isLoadingCLevels ? (
                  <div className="text-center py-5">
                    <Spinner size="lg" color="primary" />
                    <p className="mt-3 text-muted">{t('Loading class levels...')}</p>
                  </div>
                ) : (
                  <CLevelCard
                    data={getCurrentData()}
                    selectedPath={selectedPath}
                    onNodeClick={handleNodeClick}
                    onRefresh={handleRefreshCLevels}
                  />
                )
              ) : selectedPath.length === 2 ? (
                isLoadingCourses ? (
                  <div className="text-center py-5">
                    <Spinner size="lg" color="primary" />
                    <p className="mt-3 text-muted">{t('Loading courses...')}</p>
                  </div>
                ) : (
                  <CourseCard
                    data={getCurrentData()}
                    selectedPath={selectedPath}
                    onNodeClick={handleNodeClick}
                    onRefresh={handleRefreshCourses}
                  />
                )
              ) : selectedPath.length === 3 ? (
                isLoadingSubjects ? (
                  <div className="text-center py-5">
                    <Spinner size="lg" color="primary" />
                    <p className="mt-3 text-muted">{t('Loading subjects...')}</p>
                  </div>
                ) : (
                  <SubjectCard
                    data={getCurrentData()}
                    selectedPath={selectedPath}
                    onNodeClick={handleNodeClick}
                    onRefresh={handleRefreshSubjects}
                  />
                )
              ) : selectedPath.length === 4 ? (
                isLoadingUnits ? (
                  <div className="text-center py-5">
                    <Spinner size="lg" color="primary" />
                    <p className="mt-3 text-muted">{t('Loading units...')}</p>
                  </div>
                ) : (
                  <UnitCard
                    data={getCurrentData()}
                    selectedPath={selectedPath}
                    onNodeClick={handleNodeClick}
                    onRefresh={handleRefreshUnits}
                  />
                )
              ) : selectedPath.length === 5 ? (
                isLoadingSubUnits ? (
                  <div className="text-center py-5">
                    <Spinner size="lg" color="primary" />
                    <p className="mt-3 text-muted">{t('Loading sub units...')}</p>
                  </div>
                ) : (
                  <SubUnitCard
                    data={getCurrentData()}
                    selectedPath={selectedPath}
                    onNodeClick={handleNodeClick}
                    onRefresh={handleRefreshSubUnits}
                  />
                )
              ) : selectedPath.length === 6 ? (
                isLoadingLessons ? (
                  <div className="text-center py-5">
                    <Spinner size="lg" color="primary" />
                    <p className="mt-3 text-muted">{t('Loading lessons...')}</p>
                  </div>
                ) : (
                  <LessonCard
                    data={getCurrentData()}
                    selectedPath={selectedPath}
                    onNodeClick={handleNodeClick}
                    onRefresh={handleRefreshLessons}
                  />
                )
              ) : (
                <WizardLayout
                  data={getCurrentData()}
                  selectedPath={selectedPath}
                  onNodeClick={handleNodeClick}
                  onRefresh={null}
                />
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HierarchicalContent
