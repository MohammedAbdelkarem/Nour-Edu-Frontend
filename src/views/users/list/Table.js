
import { Fragment, useMemo, useState, useEffect } from 'react'
import Avatar from '@components/avatar'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { useTranslation } from 'react-i18next'

import {
  Row,
  Col,
  Card,
  Input,
  Badge,
  Alert,
  Label,
  Button, Pagination, PaginationItem, PaginationLink
} from 'reactstrap'


import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import { Link } from 'react-router-dom'
import SystemModal from '../../components/systemModal'
import { useSendAllMutation } from '../../../redux/rtkQuery/notification'
import { Bell } from 'react-feather'
import SuccessAlert from '../../components/handleStatusCode/success'

const CustomHeader = ({ handlePerPage, rowsPerPage, handleFilter, searchTerm, setModal, setRole_id, role_id = null }) => {
  const {t} = useTranslation()
  return (
    <div className='invoice-list-table-header w-100 me-1 ms-50 mt-2 mb-75'>
      <Row>
        <Col xl='6' className='d-flex align-items-center p-0'>
          <div className='d-flex align-items-center mb-sm-0 mb-1 me-1'>
            <label className='mb-0' htmlFor='search-invoice'>
              {t('Search')}:
            </label>
            <Input
              id='search-invoice'
              className='ms-50 w-100'
              type='text'
              placeholder={t('Type to search...')}
              value={searchTerm}
              onChange={e => handleFilter(e.target.value)}
            />
          </div>
          <div className='d-flex align-items-center w-100'>
            <label htmlFor='rows-per-page'>{t('Show')}</label>
            <Input
              className='mx-50'
              type='select'
              id='rows-per-page'
              value={rowsPerPage}
              onChange={handlePerPage}
              style={{ width: '5rem' }}
            >
              <option value='15'>15</option>
              <option value='25'>25</option>
              <option value='50'>50</option>
              <option value='100'>100</option>
            </Input>
            <label htmlFor='rows-per-page'>{t('entries')}</label>
          </div>
        </Col>
      </Row>
    </div>
  )
}
const Table = ({ users, setRole_id, role_id, currentPage, totalPages, onPageChange }) => {
  const { t } = useTranslation()
  const [sendAll, { isLoading, status, error }] = useSendAllMutation()
  const [rowsPerPage, setRowsPerPage] = useState(15) // Changed default to 15
  const [searchTerm, setSearchTerm] = useState(null)
  console.log('searchTerm', searchTerm)
  
  const [modal, setModal] = useState(false) 
  const [form, setForm] = useState({
    title:'',
    body:''
  })
  
  // Add this useEffect for debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only search if term is at least 2 characters or empty
      if (searchTerm !== null) {
        onPageChange(1, rowsPerPage, searchTerm)
      }
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const handleSend = () => {
    const body = new FormData()
    body.append('title', form.title)
    body.append('body', form.body)
    sendAll({ body })
  }
  
  const handleClose = () => {
    setModal(false)
    setForm({
      title:'',
      body:''
    })
  }

  const handlePerPage = e => {
    const newPerPage = parseInt(e.target.value)
    setRowsPerPage(newPerPage)
    
    // Update per_page in parent component and reset to first page
    onPageChange(1, newPerPage, searchTerm) 
  }

  const handleFilter = val => {
    setSearchTerm(val)
    // The actual search will be triggered by the useEffect with debounce
  }

  // Only filter locally if we're not doing server-side filtering
  const filteredData = searchTerm && users?.data ? users.data.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone_number && user.phone_number.includes(searchTerm))
      ) : users?.data
  const renderPagination = () => {
    if (!users?.data?.length || totalPages <= 1) return null
    
    return (
      <div className='d-flex justify-content-center mt-2'>
        <Pagination className='d-flex'>
          <PaginationItem disabled={currentPage <= 1}>
            <PaginationLink
              previous
              href='/'
              onClick={e => {
                e.preventDefault()
                onPageChange(currentPage - 1)
              }}
            />
          </PaginationItem>
          
          {[...Array(totalPages).keys()].map(page => {
            const pageNumber = page + 1
            // Show limited page numbers to avoid cluttering
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <PaginationItem key={pageNumber} active={currentPage === pageNumber}>
                  <PaginationLink
                    href='/'
                    onClick={e => {
                      e.preventDefault()
                      onPageChange(pageNumber)
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            } else if (
              (pageNumber === currentPage - 2 && currentPage > 3) ||
              (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
            ) {
              return (
                <PaginationItem key={`ellipsis-${pageNumber}`} disabled>
                  <PaginationLink href='/' onClick={e => e.preventDefault()}>
                    ...
                  </PaginationLink>
                </PaginationItem>
              )
            }
            return null
          })}
          
          <PaginationItem disabled={currentPage >= totalPages}>
            <PaginationLink
              next
              href='/'
              onClick={e => {
                e.preventDefault()
                onPageChange(currentPage + 1)
              }}
            />
          </PaginationItem>
        </Pagination>
      </div>
    )
  }
  useMemo(() => {
    if (status === 'fulfilled') {
      handleClose()
      SuccessAlert({
        title: t('Success'),
        body: t('Notification sent successfully'),
        position: 'top-end'
      })
    }
  }, [status])

  const columns = [
    {
      name: t('Full name'),
      minWidth: '250px',
      cell: row => (
        <div className='d-flex align-items-center'>
          {
            row?.avatar === null ? (
              <Avatar content={row.name} initials />
            ) : (
              <Avatar img={row.avatar?.url} content={row.name} />
            )
          }
          <div className='user-info text-truncate ms-1'>
            {row.role === 'Student' ? (
              <Link to={`/users/student/${row.id}`} className='d-block fw-bold text-truncate'>{row.name}</Link>
            ) : (
              <Link to={`/users/profile/${row.name}`} state={{ id: row.id }} className='d-block fw-bold text-truncate'>{row.name}</Link>
            )}
          </div>
        </div>
      )
    },
    {
      name: t('Phone number'),
      center: true,
      minWidth: '150px',
      selector: row => <span dir='ltr'>{row.phone_number}</span>
    },
    {
      name: t('Join Date'),
      center: true,
      minWidth: '100px',
      selector: row => row.created_at?.slice(0, 10)
    },
    {
      name: t('الجنس'),
      center: true,
      minWidth: '150px',
      cell: row => (
        <div className="d-flex flex-wrap gap-1">
          {row.is_male && <Badge color="light-info">{t('ذكر')}</Badge>}
          {!row.is_male && row.is_male !== null && <Badge color="light-danger">{t('أنثى')}</Badge>}
          {row.is_male === null && <Badge color="light-secondary">{t('-')}</Badge>}
        </div>
      )
    }
  ]
  

  return (
    <Fragment>
      <Card className='overflow-hidden'>
        <div className='react-dataTable'>
          <DataTable
            noHeader
            subHeader
            pagination
            responsive
            paginationServer
            columns={columns}
            data={filteredData}
            paginationComponent={renderPagination}
            subHeaderComponent={
              <CustomHeader
                handlePerPage={handlePerPage}
                rowsPerPage={rowsPerPage}
                handleFilter={handleFilter}
                searchTerm={searchTerm}
                setModal={setModal}
                setRole_id={setRole_id}
                role_id={role_id}
              />
            }
          />
        </div>
      </Card>
        <SystemModal show={modal}
                      setShow={handleClose} 
                      title={`${t('Notify all users')}!`} 
                      onReomve={() => handleSend()}
                      isRemoving={isLoading}
                      status={status}
                      message={error?.data?.message}
                      disabled={form.title === '' || form.body === ''}>
                <Alert color='warning'>
                  <h6 className='alert-heading'>{`${t('Warning')}!`}</h6>
                  <div className='alert-body' style={{fontSize:'11px'}}>
                  {t(`You're going to send a notification to all (${users?.pagination_data?.total}) users of the system.`)}
                  </div>
                </Alert>
                  <Label className='form-label' for='card-name'>
                    {t('Notification Title')}
                  </Label>
                  <Input id='card-name' placeholder='Notification Title' onChange={(e) => setForm({...form, title:e.target.value})}/>
                  <Label className='form-label mt-2' for='card-name'>
                    {t('Body')}
                  </Label>
                  <Input id='card-name' type='textarea' rows={3} placeholder='Notification Body' onChange={(e) => setForm({...form, body:e.target.value})}/>
        </SystemModal>
    </Fragment>
  )
}

export default Table
