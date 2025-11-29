// ** User List Component
import { useEffect, useState } from 'react'
import { useListMutation } from '../../../redux/rtkQuery/user/users'
import Table from './Table'
// ** Custom Components
import Statistics from './statistics'

// ** Styles
import '@styles/react/apps/app-users.scss'
import UserFilter from './filters'
import LoadSpinner from '../../../@core/components/spinner/loaders'
import { useTranslation } from 'react-i18next'
import useHeaders from '@hooks/useHeaders'
import { useOverviewMutation } from '../../../redux/rtkQuery/admin'
const UsersList = () => {
  const {t} = useTranslation()
  const headers = useHeaders()
  const [date, setDate] = useState(new Date())  
  const [role_id, setRole_id] = useState(null)
  const [filtersArr, setFiltersArr] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [getUsers, {data, isLoading}] = useListMutation()  
  const [overview] = useOverviewMutation()

  useEffect(() => {
    overview({headers})
  }, [])
  const fetchUsers = (page = 1, perPageValue = perPage, searchValue = '') => {
    const pageFilter = `&page=${page}`
    const perPageFilter = `&per_page=${perPageValue}`
    
    const updatedFilters = [...filtersArr.filter(f => f.key !== 'page' && f.key !== 'per_page' && f.key !== 'search')]
    
    updatedFilters.push({ key: 'page', value: pageFilter, label: null })
    updatedFilters.push({ key: 'per_page', value: perPageFilter, label: null })
    
    if (searchValue) {
      updatedFilters.push({ key: 'search', value: `&search=${searchValue}`, label: searchValue })
    }
    
    setFiltersArr(updatedFilters)
    setCurrentPage(page)
    setPerPage(perPageValue)
  }
  useEffect(() => {
    if (role_id !== null) {
      const filteredArr = filtersArr.filter(filter => !['role_id', 'page', 'per_page'].includes(filter.key))

      const newFilters = [
        ...filteredArr,
        {
          value: `&role_id=${role_id}`,
          label: `${role_id === 4 ? t('مريض') : role_id === 3 ? t('عيادة') : role_id === 1 ? t('الكل') : ''}`,
          key: 'role_id'
        },
        { key: 'page', value: `&page=1`, label: null },
        { key: 'per_page', value: `&per_page=${perPage}`, label: null }
      ]

      setFiltersArr(newFilters)
      setCurrentPage(1) 
    }
  }, [role_id])

  useEffect(() => {
    if (filtersArr.length > 0) {
      const responseFilterArr = filtersArr.map(filter => filter.value).join('')
      
      getUsers({
        headers,
        filterOptions: responseFilterArr
      }).then(response => {
        if (response?.data?.pagination_data) {
          setTotalPages(Math.ceil(response.data.pagination_data.total / perPage))
          setCurrentPage(response.data.pagination_data.current_page || 1)
        }
      })
    }
  }, [filtersArr])

  useEffect(() => {
    if (!filtersArr.some(f => f.key === 'page') && !filtersArr.some(f => f.key === 'per_page')) {
      fetchUsers(1)
    }
  }, [])

  return (
    <div className='app-user-list'>
      <Statistics/>
      <UserFilter
        theFinction={getUsers}
        trader={role_id}
        date={date}
        setTrader={setRole_id}
        setDate={setDate}
        filtersArr={filtersArr}
        setFiltersArr={setFiltersArr}
        setCurrentPage={setCurrentPage}
      />
      {
        isLoading ? <LoadSpinner/> : <Table
          users={data}
          setRole_id={setRole_id}
          role_id={role_id}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={fetchUsers}
        />
      }
    </div>
  )
}

export default UsersList
