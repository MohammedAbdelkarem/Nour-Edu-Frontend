// ** React Imports
import { Fragment, useState, useEffect } from 'react'

// ** Email App Component Imports
import Mails from './Mails'
import Sidebar from './Sidebar'

// ** Third Party Components

// ** Styles
import '@styles/react/apps/app-email.scss'
import { useTypesQuery } from '../../redux/rtkQuery/service'
import { useOverviewMutation } from '../../redux/rtkQuery/admin'
import useHeaders from '@hooks/useHeaders'

const CustomerService = () => {
  // ** States
  const [openMail, setOpenMail] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const {data} = useTypesQuery()
  const types = data?.data?.types || []
  const status = data?.data?.status || []
  const headers = useHeaders()
  const [overview] = useOverviewMutation()

  useEffect(() => {
    overview({headers})
  }, [])
  // Filter state
  const [filters, setFilters] = useState({ type: '', status: '' })

  const handleFilterChange = (newFilter) => {
    setFilters(prev => ({ ...prev, ...newFilter }))
  }
  return (
    <Fragment>
      <Sidebar
        types={types}
        status={status}
        setOpenMail={setOpenMail}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <div className='content-right'>
        <div className='content-body'>
          <Mails
            openMail={openMail}
            setOpenMail={setOpenMail}
            setSidebarOpen={setSidebarOpen}
            filters={filters}
          />
        </div>
      </div>
    </Fragment>
  )
}

export default CustomerService
