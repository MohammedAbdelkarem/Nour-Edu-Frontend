import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Badge,
  Progress,
  Modal,
  ModalBody,
  ModalHeader
} from 'reactstrap'
import {
  ArrowLeft,
  Save,
  X
} from 'react-feather'
import FileUploaderRestrictions from '../../components/uplaoder/FileUploaderRestrictions'
import {
  useCreateMutation
} from '../../../redux/rtkQuery/hierarchical/lesson'
import ErrorAlert from '../../components/handleStatusCode/error'

const CreateLesson = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const selectedPath = location.state?.selectedPath || []
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    duration: '',
    e_level_id: selectedPath[0]?.id || '',
    c_level_id: selectedPath[1]?.id || '',
    course_id: selectedPath[2]?.id || '',
    subject_id: selectedPath[3]?.id || '',
    unit_id: selectedPath[4]?.id || '',
    sub_unit_id: selectedPath[5]?.id || ''
  })
  // const [files, setFiles] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [lessonImage, setLessonImage] = useState(null)
  const [lessonImagePreview, setLessonImagePreview] = useState(null)
  const [videoFiles, setVideoFiles] = useState([])
  const [videoQualities, setVideoQualities] = useState([])
  const [videoDurations, setVideoDurations] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedSize, setUploadedSize] = useState(0)
  const [totalSize, setTotalSize] = useState(0)
  const [createLesson, { isLoading: isCreating }] = useCreateMutation()

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const calculateFileSize = (files) => {
    return files.reduce((total, file) => total + file.size, 0)
  }

  const getVideoInfo = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      console.log('file', file)
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        const height = video.videoHeight
        console.log('height', height)
        const durationInMinutes = Math.ceil(video.duration / 60)
        
        let quality = '720'
        if (height >= 1440) {
          quality = '1440'
        } else if (height >= 1080) {
          quality = '1080'
        } else if (height >= 720) {
          quality = '720'
        } else if (height >= 480) {
          quality = '480'
        } else if (height >= 360) {
          quality = '360'
        } else if (height >= 240) {
          quality = '240'
        } else if (height >= 144) {
          quality = '144'
        }
        
        console.log('Video metadata:', { height, quality, duration: video.duration, durationInMinutes })
        resolve({
          quality,
          duration: durationInMinutes.toString()
        })
      }
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src)
        resolve({
          quality: '720',
          duration: '0'
        })
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // const handleFileChange = (files) => {
  //   setFiles(files)
  // }

  const handleImageFileChange = (files) => {
    setImageFiles(files)
  }

  const handleLessonImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLessonImage(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setLessonImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLessonImage = () => {
    setLessonImage(null)
    setLessonImagePreview(null)
  }
  console.log('videoFiles', videoFiles)

  const handleVideoFileChange = async (files) => {
    setVideoFiles(files)
    
    // Calculate total file size
    const totalFileSize = calculateFileSize(files)
    setTotalSize(totalFileSize)
    setUploadedSize(0)
    setUploadProgress(0)
    
    const videoInfos = await Promise.all(
      files.map(file => getVideoInfo(file))
    )
    
    const qualities = videoInfos.map(info => info.quality)
    const durations = videoInfos.map(info => info.duration)
    
    console.log('Extracted video info:', { videoInfos, qualities, durations })
    
    setVideoQualities(qualities)
    setVideoDurations(durations)
    
    const totalDuration = durations.reduce((sum, duration) => sum + parseInt(duration), 0)
    setFormData(prev => ({
      ...prev,
      duration: totalDuration.toString()
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadedSize(0)
      
      const formDataPayload = new FormData()
      
      formDataPayload.append('name', formData.name)
      formDataPayload.append('bio', formData.bio)
      formDataPayload.append('duration', formData.duration)
      formDataPayload.append('e_level_id', formData.e_level_id)
      formDataPayload.append('c_level_id', formData.c_level_id)
      formDataPayload.append('course_id', formData.course_id)
      formDataPayload.append('subject_id', formData.subject_id)
      formDataPayload.append('unit_id', formData.unit_id)
      formDataPayload.append('sub_unit_id', formData.sub_unit_id)
      
      videoFiles.forEach((video, index) => {
        formDataPayload.append(`videos[${index + 1}][video]`, video)
        const quality = videoQualities[index] || '720'
        console.log(`Video ${index + 1} quality:`, quality)
        formDataPayload.append(`videos[${index + 1}][quality]`, parseInt(quality))
      })
      
      imageFiles.forEach((image) => {
        formDataPayload.append('images[]', image)
      })

      // Add lesson image if any
      if (lessonImage) {
        formDataPayload.append('lesson_image', lessonImage)
      }

      console.log('FormData contents:')
      for (const [key, value] of formDataPayload.entries()) {
        console.log(key, value)
      }

      // Simulate upload progress with more realistic timing
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return prev
          }
          // More realistic progress: slower at the beginning, faster in the middle
          const increment = prev < 30 ? 2 : prev < 70 ? 5 : 3
          const newProgress = Math.min(prev + increment + (Math.random() * 2), 95)
          
          // Update uploaded size based on the new progress percentage
          setUploadedSize(Math.floor((newProgress / 100) * totalSize))
          
          return newProgress
        })
      }, 300)

      await createLesson({ body: formDataPayload }).unwrap()
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadedSize(totalSize)
      
      console.log('Lesson created successfully, navigating back with selectedPath:', selectedPath)
      // Navigate back to the hierarchical content with the full path to maintain the current level
      navigate('/hierarchical-content', { 
        state: { 
          selectedPath,
          preserveHierarchy: true 
        } 
      })
    } catch (error) {
      console.error('Error creating lesson:', error)
      const errorMessage = error?.data?.message || error?.message || t('Failed to create lesson')
      ErrorAlert({
        title: t('Error'),
        body: errorMessage,
        button: t('OK')
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    navigate('/hierarchical-content', { 
      state: { 
        selectedPath,
        preserveHierarchy: true 
      } 
    })
  }

  return (
    <div className="create-lesson-page">
      <style jsx>{`
        .upload-modal-backdrop {
          backdrop-filter: blur(15px);
          background-color: rgba(0, 0, 0, 0.5);
        }
        .upload-modal .modal-content {
          border: none;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .upload-modal .modal-header {
          background: linear-gradient(135deg, #0568a9 0%, #0a8a8f 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }
        .upload-modal .modal-body {
          background: #f8f9fa;
          border-radius: 0 0 12px 12px;
        }
      `}</style>
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="page-title">{t('Create New Lesson')}</h2>
            <p className="page-subtitle text-muted">
              {t('Add a new lesson to')} {selectedPath[5]?.name || t('selected sub-unit')}
            </p>
          </div>
          <Button 
            color="outline-secondary" 
            onClick={handleCancel}
            className="d-flex align-items-center"
          >
            <ArrowLeft size={16} className="me-1" />
            {t('Back to Lessons')}
          </Button>
        </div>
      </div>

      <Card style={{ borderRight: '10px solid #0568a9'}}>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="name" className="form-label">
                    {t('Lesson Name')} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('Enter lesson name')}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="bio" className="form-label">
                    {t('Description')}
                  </Label>
                  <Input
                    type="textarea"
                    name="bio"
                    id="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder={t('Enter lesson description')}
                    rows="4"
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md="12">
                <FormGroup>
                  <Label className="form-label">
                    {t('Lesson Image')} <small className="text-muted">({t('Optional')})</small>
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLessonImageChange}
                    className="form-control"
                  />
                  <small className="text-muted">
                    {t('Upload a cover image for the lesson (optional)')}
                  </small>
                  
                  {/* Lesson Image Preview */}
                  {lessonImagePreview && (
                    <div className="mt-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <img 
                            src={lessonImagePreview} 
                            alt="Preview" 
                            style={{ 
                              width: '100px', 
                              height: '100px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              border: '2px solid #e9ecef'
                            }}
                          />
                          <div className="ms-3">
                            <p className="mb-1 fw-bold">{lessonImage?.name}</p>
                            <small className="text-muted">
                              {lessonImage ? `${(lessonImage.size / 1024 / 1024).toFixed(2)} MB` : ''}
                            </small>
                          </div>
                        </div>
                        <Button 
                          color="outline-danger" 
                          size="sm" 
                          onClick={removeLessonImage}
                          type="button"
                        >
                          <X size={14} className="me-1" />
                          {t('Remove')}
                        </Button>
                      </div>
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">
                    {t('Video Files')} <span className="text-danger">*</span>
                  </Label>
                  <FileUploaderRestrictions
                    files={videoFiles}
                    setFiles={handleVideoFileChange}
                    accept="video/mp4,.mp4"
                  />
                  <small className="text-muted">
                    {t('Upload video files for this lesson. Maximum 1 file.')}
                  </small>
                  
                  {/* File Size Information */}
                  {videoFiles.length > 0 && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          <strong>{t('Total Size')}:</strong> {formatFileSize(totalSize)}
                        </small>
                        <small className="text-muted">
                          <strong>{t('Files')}:</strong> {videoFiles.length}
                        </small>
                      </div>
                      
                    </div>
                  )}
                  
                  {videoFiles.length > 0 && videoQualities.length > 0 && (
                    <div className="mt-2">
                      <small className="text-info">
                        {t('Detected video information')}:
                      </small>
                      <div className="mt-1">
                        {videoFiles.map((file, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                            <span className="text-muted small">{file.name}</span>
                            <div className="d-flex gap-1">
                              <Badge color="light-info"> 
                                {videoQualities[index] || '720'}p
                              </Badge>
                              <Badge color="light-success">
                                {videoDurations[index] ? formatDuration(parseInt(videoDurations[index])) : '0m'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {videoFiles.length > 1 && (
                          <div className="mt-2 pt-2 border-top">
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-primary fw-bold">
                                {t('Total Duration')}:
                              </small>
                              <span className="badge bg-primary light-primary">
                                {formatDuration(videoDurations.reduce((sum, duration) => sum + parseInt(duration), 0))}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label className="form-label">
                    {t('Images')}
                  </Label>
                  <FileUploaderRestrictions
                    multiple={true}
                    files={imageFiles}
                    setFiles={handleImageFileChange}
                    accept={{
                      'image/png': ['.png'],
                      'image/jpg': ['.jpg'],
                      'image/jpeg': ['.jpeg']
                    }}
                  />
                  <small className="text-muted">
                    {t('Upload lesson\'s images')}
                  </small>
                </FormGroup>
              </Col>
            </Row>
            <input type="hidden" name="e_level_id" value={formData.e_level_id} />
            <input type="hidden" name="c_level_id" value={formData.c_level_id} />
            <input type="hidden" name="course_id" value={formData.course_id} />
            <input type="hidden" name="subject_id" value={formData.subject_id} />
            <input type="hidden" name="unit_id" value={formData.unit_id} />
            <input type="hidden" name="sub_unit_id" value={formData.sub_unit_id} />

            <div className="form-actions mt-4">
              <div className="d-flex justify-content-end gap-2">
                <Button 
                  type="button" 
                  color="secondary" 
                  outline
                  onClick={handleCancel}
                  className="d-flex align-items-center"
                >
                  <X size={16} className="me-1" />
                  {t('Cancel')}
                </Button>
                <Button 
                  type="submit" 
                  color="primary" 
                  disabled={isCreating || isUploading || !formData.name || !formData.duration || videoFiles.length === 0}
                  className="d-flex align-items-center"
                >
                  <Save size={16} className="me-1" />
                  {isUploading ? t('Uploading...') : isCreating ? t('Creating...') : t('Create Lesson')}
                </Button>
              </div>
            </div>
          </Form>
        </CardBody>
      </Card>

      {/* Upload Progress Modal */}
      <Modal 
        isOpen={isUploading} 
        toggle={() => {}} 
        centered 
        backdrop="static"
        keyboard={false}
        size="md"
        className="upload-modal"
        backdropClassName="upload-modal-backdrop"
      >
        <ModalHeader className="text-center border-0 pb-0">
         
        </ModalHeader>
        <ModalBody className="text-center pt-0">
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-primary fw-bold">
                {Math.round(uploadProgress)}%
              </span>
              <span className="text-muted small">
                {formatFileSize(uploadedSize)} / {formatFileSize(totalSize)}
              </span>
            </div>
            <Progress 
              value={uploadProgress} 
              color="primary" 
              className="mb-3"
              style={{ height: '12px', borderRadius: '6px' }}
            />
            <div className="d-flex justify-content-between">
              <div className="text-center">
                <div className="text-success fw-bold">
                  {formatFileSize(uploadedSize)}
                </div>
                <small className="text-muted">{t('Uploaded')}</small>
              </div>
              <div className="text-center">
                <div className="text-warning fw-bold">
                  {formatFileSize(totalSize - uploadedSize)}
                </div>
                <small className="text-muted">{t('Remaining')}</small>
              </div>
              <div className="text-center">
                <div className="text-info fw-bold">
                  {formatFileSize(totalSize)}
                </div>
                <small className="text-muted">{t('Total Size')}</small>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  )
}

export default CreateLesson
