// ** React Imports
import { useState, Fragment } from 'react'

// ** Reactstrap Imports
import { Card, CardHeader, CardTitle, CardBody, Button, ListGroup, ListGroupItem } from 'reactstrap'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import { X, DownloadCloud } from 'react-feather'
import { useTranslation } from 'react-i18next'

const FileUploaderRestrictions = ({files, setFiles, accept, title, multiple = false}) => {
  const {t} = useTranslation()
  // ** State
  const { getRootProps, getInputProps } = useDropzone({
    multiple,
    accept,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length) {
        setFiles([...files, ...acceptedFiles.map(file => Object.assign(file))])
      }
    }
  })
  
  const handleRemoveFile = file => {
    const uploadedFiles = files
    const filtered = uploadedFiles.filter(i => i.name !== file.name)
    setFiles([...filtered])
  }

  const renderFileSize = size => {
    if (Math.round(size / 100) / 10 > 1000) {
      return `${(Math.round(size / 100) / 10000).toFixed(1)} mb`
    } else {
      return `${(Math.round(size / 100) / 10).toFixed(1)} kb`
    }
  }

  const fileList = files.map((file, index) => (
    <ListGroupItem key={`${file.name}-${index}`} className='d-flex align-items-center justify-content-between'>
      <div className='file-details d-flex align-items-center'>
        <div className='file-preview me-1'>
          <img className='rounded' alt={file.name} src={URL.createObjectURL(file)} height='28' width='28' />
        </div>
        <div>
          <p className='file-name mb-0'>{file.name}</p>
          <p className='file-size mb-0'>{renderFileSize(file.size)}</p>
        </div>
      </div>
      <Button color='danger' outline size='sm' className='btn-icon' onClick={() => handleRemoveFile(file)}>
        <X size={14} />
      </Button>
    </ListGroupItem>
  ))

  return (
    <Card>
      <CardHeader>
        <CardTitle tag='h4'>{t(title)}</CardTitle>
      </CardHeader>
      <CardBody>
        {
          files.length > 0 ? null :
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <div className='d-flex align-items-center justify-content-center flex-column'>
            <DownloadCloud size={64} />
            <h5>{t('Drop Files here or click to upload')}</h5>
              <a href='/' onClick={e => e.preventDefault()}>
                {t('browse')}
              </a>
          </div>
        </div>
        }
        {files.length ? (
          <Fragment>
            <ListGroup className='my-2'>{fileList}</ListGroup>
          </Fragment>
        ) : null}
      </CardBody>
    </Card>
  )
}

export default FileUploaderRestrictions
