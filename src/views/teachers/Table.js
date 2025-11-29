// ** React Imports
import { Fragment, useEffect, useMemo, useState } from 'react'

// ** Invoice List Sidebar
import defaultImage from '../../assets/images/base/logo.png'
// ** Third Party Components
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { Edit3, Loader, Lock, Trash, Eye} from 'react-feather'

// ** Reactstrap Imports
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  CardHeader,
  CardTitle
} from 'reactstrap'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import DateTimeService from '../../services/dateTimeService'
import { useCreateMutation, useGetMutation, useUpdateMutation } from '../../redux/rtkQuery/teacher'
import { useUpdateMutation as useUpdateMediaMutation, useUploadMutation as useUploadMediaMutation } from '../../redux/rtkQuery/media'
import Management from './management'
import ToastLogo from '../components/handleStatusCode/success'
import EmptyComponent from '../components/empty'
import ErrorAlert from '../components/handleStatusCode/error'
import LoadSpinner from '../../@core/components/spinner/loaders'

// ** Table Header
const CustomHeader = ({ t, handleManagement }) => {
  return (
    <div className='invoice-list-table-header w-100 me-1 ms-50 mt-2 mb-75'>
      <Row>
        <Col xl='6' className='d-flex align-items-center p-0'>
            <CardHeader className='pb-0'>
              <CardTitle style={{fontSize:'20px'}}>قائمة المعملين</CardTitle>
            </CardHeader>
        </Col>
        <Col xl='6' className='d-flex align-items-sm-center justify-content-xl-end justify-content-start flex-xl-nowrap flex-wrap flex-sm-row flex-column pe-xl-1 p-0 mt-xl-0 mt-1'>
          <div className='d-flex align-items-center table-header-actions'>
            <Button className='add-new-user' color='primary' onClick={ () => handleManagement()}>
              {t('Add New Teacher')}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  )
}
const Table = () => {
  // ** Hooks
  const {t} = useTranslation()
  const navigate = useNavigate()
  const [image, setImage] = useState([])
  const [form, setForm] = useState({
    name:'',
    phone_number:'',
    email:'',
    bio:'',
    birth_date:'',
    is_male: true
  })
  
  // ** States
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [get, {data, isLoading}] = useGetMutation()
  const teachers = data ? data?.data : []
  const [create, {data:createData, isLoading:creating, status:createStatus}] = useCreateMutation()
  const [update, {isLoading:updating}] = useUpdateMutation()
  const [updateMedia, {isLoading: isUpdatingMedia}] = useUpdateMediaMutation()
  const [uploadMedia, {isLoading: isUploadingMedia}] = useUploadMediaMutation()
  useEffect(() => {
    get()
  }, [])

  useEffect(() => {
    if (selected !== null) {
      setForm({
        name:selected.name || '',
        phone_number:selected.phone_number || '',
        email:selected.email || '',
        bio:selected.bio || '',
        birth_date:selected.birth_date || '',
        is_male: selected.is_male !== undefined ? selected.is_male : true
      })
    }
  }, [selected])

  const handleManagement = (item) => {
    if (item) {
      setSelected(item)
    } else {
      setSelected(null)
    }
    setOpen(true)
  }
  
  const handleClose = () => {
    setSelected(null)
    setOpen(false)
    setImage([])
    setForm({
      name:'',
      phone_number:'',
      email:'',
      bio:'',
      birth_date:'',
      is_male: true
    })
    get()
  }
  const handleSubmit = async () => {
    if (selected) {
      try {
        // Step 1: Update teacher info
        const body = new URLSearchParams()
        body.append('name', form?.name)
        if (form?.email && form.email.trim() !== '') {
          body.append('email', form?.email)
        }
        if (form?.bio && form.bio.trim() !== '') {
          body.append('bio', form?.bio)
        }
        if (form?.birth_date && form.birth_date.trim() !== '') {
          body.append('birth_date', form?.birth_date)
        }
        body.append('is_male', form?.is_male ? '1' : '0')
        
        const updateResult = await update({body, id: selected.id}).unwrap()
        
        // Step 2: Only update image if teacher update was successful
        if (updateResult && image.length > 0) {
          if (selected.image?.id) {
            const mediaFormData = new FormData()
            mediaFormData.append('images[]', image[0])
            mediaFormData.append('_method', 'PUT')
            
            await updateMedia({ 
              body: mediaFormData, 
              id: selected.image.id 
            }).unwrap()
          } else {
            const mediaFormData = new FormData()
            mediaFormData.append('images[]', image[0])
            mediaFormData.append('context_type', 'User')
            mediaFormData.append('context_id', selected.id)
            await uploadMedia({ 
              body: mediaFormData
            }).unwrap()
          }
        }
          ToastLogo({
          title: t('Success'),
          body: t('Teacher updated successfully'),
          position: 'top-left'
        })
        handleClose()
      } catch (error) {
        console.error('Error updating teacher:', error)
        ErrorAlert({
          title: t('Error'),
          body: error?.data?.message || error?.message || t('Failed to update teacher'),
          button: t('OK')
        })
      }
    } else {
      const body = new FormData()
      body.append('name', form?.name)
      body.append('phone_number', form?.phone_number)
      if (form?.email && form.email.trim() !== '') {
        body.append('email', form?.email)
      }
      if (form?.bio && form.bio.trim() !== '') {
        body.append('bio', form?.bio)
      }
      if (form?.birth_date && form.birth_date.trim() !== '') {
        body.append('birth_date', form?.birth_date)
      }
      body.append('is_male', form?.is_male ? '1' : '0')
      
      if (image.length > 0) {
        body.append('image', image[0])
      }      
      create({body})
    }
  }

  useMemo(() => {
    if (createStatus === 'fulfilled') {
      ToastLogo({
        title: t('Success'),
        body: createData?.message,
        position: 'top-left'
      })
      handleClose()
    }
  }, [createStatus])

  const columns = [
    {
      name: t('#'),
      minWidth: '150px',
      cell: (row, index) => <p>{index + 1}</p>
    },
    {
      name: t('Profile picture'),
      minWidth: '150px',
      cell: (row) => <img src={ row?.image === null ? defaultImage : row?.image?.url} style={{width:'40px', height:'40px', borderRadius:"100%"}}/>
    },
    {
      name: t('Teacher info'),
      minWidth: '150px',
      center: true,
      cell: row => {
        const name = row.name
        const email = row.email || ''
        return (
          <div className='d-flex justify-content-center align-items-center'>
            <div className='d-flex flex-column'>
              <h6 className='user-name text-truncate mb-0'>{name}</h6>
              <small className='text-muted' style={{fontSize:'12px'}}>{email}</small>
            </div>
          </div>
        )
      }
    },
    {
      name: t('Phone number'),
      minWidth: '120px',
      cell: row =>  <span style={{textAlign:'center', direction:"ltr"}}>{row?.phone_number}</span>
    },
    {
      name: t('Join Date'),
      minWidth: '120px',
      cell: row =>  <span style={{textAlign:'center'}}>{DateTimeService(row.created_at, false, false)}</span>
    },
    {
      name: t('Actions'),
      minWidth: '120px',
      cell: row => (
        <div className="d-flex gap-2">
          <Edit3 size={14}
               className='text-warning'
               style={{cursor:'pointer'}}
               onClick={() => handleManagement(row)}/>
          {/* <Eye size={14}
               className='text-primary'
               style={{cursor:'pointer'}}
               onClick={() => navigate(`/teachers/${row.id}/responsibilities`)}/> */}
        </div>
      )
    }
  ]

  return (
    <Fragment>
      <Card className='overflow-hidden'
            style={{  width: "100%", 
                      boxShadow: "0 8px 10px rgb(56, 182, 255, 0.2)", 
                      borderRadius: "5px", 
                      padding: "5px",
                      borderRight: "10px solid #0568a9"
                   }}>
        {
          isLoading ? <LoadSpinner/> : <div className='react-dataTable'>
            <DataTable
              noHeader
              subHeader
              sortServer
              responsive
              columns={columns}
              className='react-dataTable'
              data={teachers}
              noDataComponent={<EmptyComponent title={'لا يوجد معلمين'} body={'عذراً، لا يوجد معلمين لاستعراضهم هنا.'}/>}
              subHeaderComponent={
                <CustomHeader
                  handleManagement={handleManagement}
                  t={t}
                />
              }
            />
          </div>
        }
      </Card>
        {
          open &&
          <Management setForm={setForm}
                      form={form}
                      open={open}
                      handleClose={handleClose}
                      selected={selected}
                      handleSubmit={handleSubmit}
                      submitting={creating || updating || isUpdatingMedia || isUploadingMedia}
                      image={image}
                      setImage={setImage}/>
        }
    </Fragment>
  )
}

export default Table
