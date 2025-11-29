import { useTranslation } from 'react-i18next'
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Book, 
  Layers, 
  FileText, 
  Folder,
  ChevronRight,
  Check,
  Plus,
  Eye,
  EyeOff,
  Clock,
  User
} from 'react-feather'
import { Card, CardBody, Button, Badge } from 'reactstrap'

const WizardLayout = ({ 
  data, 
  selectedPath, 
  onNodeClick
}) => {
  const { t } = useTranslation()

  const getIconForType = (type) => {
    switch (type) {
      case 'e_level':
        return <BookOpen size={20} className="text-primary" />
      case 'c_level':
        return <Users size={20} className="text-info" />
      case 'course':
        return <Calendar size={20} className="text-success" />
      case 'subject':
        return <Book size={20} className="text-warning" />
      case 'unit':
        return <Layers size={20} className="text-secondary" />
      case 'sub_unit':
        return <Folder size={20} className="text-dark" />
      case 'lesson':
        return <FileText size={20} className="text-danger" />
      default:
        return <FileText size={20} />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'e_level':
        return t('Education Level')
      case 'c_level':
        return t('Class Level')
      case 'course':
        return t('Course')
      case 'subject':
        return t('Subject')
      case 'unit':
        return t('Unit')
      case 'sub_unit':
        return t('Sub Unit')
      case 'lesson':
        return t('Lesson')
      default:
        return type
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'e_level':
        return 'primary'
      case 'c_level':
        return 'info'
      case 'course':
        return 'success'
      case 'subject':
        return 'warning'
      case 'unit':
        return 'secondary'
      case 'sub_unit':
        return 'dark'
      case 'lesson':
        return 'danger'
      default:
        return 'light'
    }
  }

  const isNodeSelected = (node) => {
    return selectedPath.length > 0 && 
           selectedPath[selectedPath.length - 1]?.id === node.id
  }

  const hasChildren = (node) => {
    return node.children && node.children.length > 0
  }

  const handleNodeClick = (node) => {
    const newPath = [...selectedPath, { id: node.id, name: node.name, type: node.type }]
    onNodeClick(node, newPath)
  }

  const getChildrenCount = (node) => {
    if (!hasChildren(node)) return 0
    
    let count = 0
    const countChildren = (children) => {
      children.forEach(child => {
        count++
        if (child.children && child.children.length > 0) {
          countChildren(child.children)
        }
      })
    }
    countChildren(node.children)
    return count
  }

  const renderContentCard = (node) => {
    const isSelected = isNodeSelected(node)
    const hasChildNodes = hasChildren(node)
    const childrenCount = getChildrenCount(node)

    return (
      <Card 
        key={node.id} 
        className={`content-card ${isSelected ? 'selected' : ''} ${hasChildNodes ? 'expandable' : ''}`}
        onClick={() => handleNodeClick(node)}
      >
        <CardBody className="p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center flex-grow-1">
              <div className="content-icon me-3">
                {getIconForType(node.type)}
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-1 fw-bold text-dark">{node.name}</h6>
                <Badge 
                  color={getTypeColor(node.type)} 
                  className="mb-2" 
                  size="sm"
                >
                  {getTypeLabel(node.type)}
                </Badge>
                {node.type === 'lesson' && node.stats && (
                  <div className="d-flex align-items-center gap-3 mt-2">
                    <small className="text-muted d-flex align-items-center">
                      <Clock size={12} className="me-1" />
                      {node.stats.duration}m
                    </small>
                    <small className="text-muted d-flex align-items-center">
                      <User size={12} className="me-1" />
                      {node.stats.students}
                    </small>
                    <div>
                      {node.stats.published ? (
                        <Eye size={14} className="text-success" />
                      ) : (
                        <EyeOff size={14} className="text-muted" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="d-flex align-items-center">
              {hasChildNodes && (
                <Badge color="light" className="text-dark me-2">
                  {childrenCount} {t('items')}
                </Badge>
              )}
              <ChevronRight size={16} className="text-muted" />
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="wizard-content">
      {data.map((node) => renderContentCard(node))}
    </div>
  )
}

export default WizardLayout
