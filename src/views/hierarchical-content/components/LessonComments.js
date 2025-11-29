import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Spinner,
  Badge
} from 'reactstrap'
import {
  MessageCircle,
  Trash2,
  User,
  Clock,
  AlertTriangle
} from 'react-feather'
import { useDeleteCommentMutation } from '../../../redux/rtkQuery/hierarchical/lesson'
import ErrorAlert from '../../components/handleStatusCode/error'
import SuccessAlert from '../../components/handleStatusCode/success'

const LessonComments = ({ comments = [], onRefresh }) => {
  const { t } = useTranslation()
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedComment, setSelectedComment] = useState(null)
  
  // API hooks
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation()

  // Handle delete comment click
  const handleDeleteClick = (comment) => {
    setSelectedComment(comment)
    setDeleteModal(true)
  }

  // Handle delete comment
  const handleDeleteComment = async () => {
    if (!selectedComment) return

    try {
      await deleteComment({ id: selectedComment.id }).unwrap()
      SuccessAlert({
        title: t('Success'),
        body: t('Comment deleted successfully'),
        position: 'top-left'
      })
      setDeleteModal(false)
      setSelectedComment(null)
      onRefresh?.() // Refresh the lesson data
    } catch (error) {
      console.error('Error deleting comment:', error)
      ErrorAlert({
        title: t('Error'),
        body: error?.data?.message || t('Failed to delete comment'),
        button: t('OK')
      })
    }
  }

  // Close delete modal
  const handleCloseDeleteModal = () => {
    setDeleteModal(false)
    setSelectedComment(null)
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return t('Just now')
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return t('{{minutes}} minutes ago', { minutes })
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return t('{{hours}} hours ago', { hours })
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return t('{{days}} days ago', { days })
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <>
      <Card className="comments-card border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <CardHeader className="bg-primary text-white" style={{ 
          background: 'linear-gradient(135deg, #004d7a 30%, #0568a9 80%)',
          border: 'none',
          padding: '1.5rem'
        }}>
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0 text-white">
              <MessageCircle size={20} className="me-2" />
              {t('Comments')} 
              <Badge color="light" className="ms-2" style={{ 
                color: '#0568a9',
                fontSize: '0.8rem',
                padding: '0.3rem 0.8rem'
              }}>
                {comments.length}
              </Badge>
            </h5>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {comments.length === 0 ? (
            <div className="text-center py-5" style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)' }}>
              <div className="empty-comments">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ 
                    width: '80px', 
                    height: '80px',
                    background: 'linear-gradient(135deg, #004d7a 50%, #0568a9 50%)',
                    color: 'white'
                  }}
                >
                  <MessageCircle size={32} />
                </div>
                <h6 className="text-muted mb-2">{t('No comments yet')}</h6>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  {t('Be the first to share your thoughts!')}
                </p>
              </div>
            </div>
          ) : (
            <div className="comments-list" style={{ background: '#fff' }}>
              {comments.map((comment, index) => {
                const isDeleted = comment.status === 'deleted_by_student'
                return (
                <div 
                  key={comment.id} 
                  className="comment-item"
                  style={{
                    padding: '1.5rem',
                    borderBottom: index < comments.length - 1 ? '1px solid #f1f3f4' : 'none',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    opacity: isDeleted ? 0.6 : 1,
                    backgroundColor: isDeleted ? '#f8f9fa' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleted) {
                      e.currentTarget.style.backgroundColor = '#f8f9ff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDeleted ? '#f8f9fa' : 'transparent'
                  }}
                >
                  <div className="d-flex">
                    {/* User Avatar */}
                    <div className="comment-avatar me-3 position-relative">
                      {comment.user?.image?.url && !isDeleted ? (
                        <div className="position-relative">
                          <img
                            src={comment.user.image.url}
                            alt={comment.user.name}
                            className="rounded-circle shadow-sm"
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              objectFit: 'cover',
                              border: '3px solid #fff',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          />
                          <div 
                            className="position-absolute bottom-0 end-0 rounded-circle"
                            style={{ 
                              width: '16px', 
                              height: '16px', 
                              backgroundColor: '#28c76f',
                              border: '2px solid #fff'
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm position-relative"
                          style={{ 
                            width: '50px', 
                            height: '50px',
                            background: isDeleted 
                              ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)' 
                              : 'linear-gradient(135deg, #0568a9 0%, #004d7a 100%)',
                            border: '3px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <User size={24} />
                          {!isDeleted && (
                            <div 
                              className="position-absolute bottom-0 end-0 rounded-circle"
                              style={{ 
                                width: '16px', 
                                height: '16px', 
                                backgroundColor: '#28c76f',
                                border: '2px solid #fff'
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div className="comment-content flex-grow-1">
                      <div className="comment-header mb-3">
                        <div className="d-flex align-items-start justify-content-between">
                          <div>
                            <div className="d-flex align-items-center mb-1">
                              <strong 
                                className="comment-author me-2"
                                style={{ 
                                  color: '#0568a9',
                                  fontSize: '0.95rem',
                                  fontWeight: '600'
                                }}
                              >
                                {comment.user?.name || t('Unknown User')}
                              </strong>
                              {comment.is_pinned ? (
                                <Badge 
                                  color="warning" 
                                  className="rounded-pill"
                                  style={{ 
                                    fontSize: '0.7rem',
                                    padding: '0.2rem 0.6rem',
                                    backgroundColor: '#ffc107',
                                    color: '#000'
                                  }}
                                >
                                  📌 {t('Pinned')}
                                </Badge>
                              ) : null}
                            </div>
                            <div className="comment-meta">
                              <small 
                                className="text-muted d-flex align-items-center"
                                style={{ fontSize: '0.8rem' }}
                              >
                                <Clock size={12} className="me-1" />
                                {formatDate(comment.created_at)}
                              </small>
                            </div>
                          </div>
                          <div className="comment-actions">
                            {isDeleted ? (
                              <Badge 
                                color="secondary" 
                                className="rounded-pill"
                                style={{ 
                                  fontSize: '0.7rem',
                                  padding: '0.3rem 0.8rem',
                                  backgroundColor: '#6c757d',
                                  color: 'white'
                                }}
                              >
                                🗑️ {t('Deleted')}
                              </Badge>
                            ) : (
                              <Button
                                color="danger"
                                size="sm"
                                outline
                                onClick={() => handleDeleteClick(comment)}
                                className="rounded-circle"
                                style={{ 
                                  width: '32px', 
                                  height: '32px',
                                  padding: '0',
                                  border: 'none',
                                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                  color: '#dc3545',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#dc3545'
                                  e.target.style.color = 'white'
                                  e.target.style.transform = 'scale(1.1)'
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'
                                  e.target.style.color = '#dc3545'
                                  e.target.style.transform = 'scale(1)'
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Comment Text */}
                      <div className="comment-text mb-3">
                        <div 
                          className="comment-bubble"
                          style={{
                            background: isDeleted 
                              ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' 
                              : 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
                            padding: '1rem 1.25rem',
                            borderRadius: '18px',
                            border: isDeleted ? '1px solid #dee2e6' : '1px solid #e9ecef',
                            position: 'relative',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}
                        >
                          <p 
                            className="mb-0" 
                            style={{ 
                              lineHeight: '1.6',
                              color: isDeleted ? '#6c757d' : '#2c3e50',
                              fontSize: '0.9rem',
                              wordWrap: 'break-word',
                              textDecoration: isDeleted ? 'line-through' : 'none'
                            }}
                          >
                            {comment.text}
                          </p>
                        </div>
                      </div>

                      {/* Comment Footer */}
                      <div className="comment-footer">
                        {comment.is_replayed && (
                          <Badge 
                            color="info" 
                            className="rounded-pill"
                            style={{ 
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.6rem',
                              backgroundColor: '#17a2b8',
                              color: 'white'
                            }}
                          >
                            💬 {t('Replied')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Comment Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={handleCloseDeleteModal} centered>
        <ModalHeader toggle={handleCloseDeleteModal} className="bg-danger text-white">
          <div className="d-flex align-items-center">
            <AlertTriangle size={20} className="me-2" />
            {t('Delete Comment')}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            <AlertTriangle size={48} className="text-danger mb-3" />
            <h5 className="mb-3">{t('Are you sure you want to delete this comment?')}</h5>
            {selectedComment && (
              <div className="bg-light p-3 rounded mb-3">
                <div className="d-flex align-items-center mb-2">
                  {selectedComment.user?.image?.url ? (
                    <img
                      src={selectedComment.user.image.url}
                      alt={selectedComment.user.name}
                      className="rounded-circle me-2"
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white me-2"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <User size={16} />
                    </div>
                  )}
                  <div>
                    <strong>{selectedComment.user?.name || t('Unknown User')}</strong>
                    <br />
                    <small className="text-muted">
                      <Clock size={10} className="me-1" />
                      {formatDate(selectedComment.created_at)}
                    </small>
                  </div>
                </div>
                <p className="mb-0 text-start" style={{ fontSize: '0.9rem' }}>
                  "{selectedComment.text}"
                </p>
              </div>
            )}
            <p className="text-muted mb-0">
              {t('This action cannot be undone.')}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={handleCloseDeleteModal}>
            {t('Cancel')}
          </Button>
          <Button 
            color="danger" 
            onClick={handleDeleteComment}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" className="me-1" />
                {t('Deleting...')}
              </>
            ) : (
              <>
                <Trash2 size={14} className="me-1" />
                {t('Delete')}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default LessonComments
