// ** Import React
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// ** Reactstrap Imports
import { Row, Col, Card, CardHeader, CardTitle, Label, CardBody, Input, Badge, Button } from 'reactstrap'

// ** Styles
import '@styles/react/apps/app-users.scss'
import '@styles/react/libs/flatpickr/flatpickr.scss'

// ** Import Custom component
import Select from 'react-select'
// ** Utils
import { selectThemeColors } from '@utils'
import DatePicker from '../../components/picker/datePicker'
import RangePicker from '../../components/picker/rangePicker'
import useHeaders from '@hooks/useHeaders'
import DateTimeService from '../../../services/dateTimeService'
import { XCircle } from 'react-feather'

const UserFilter = ({ theFinction, date, setDate, filtersArr, setFiltersArr, trader,setCurrentPage }) => {
  const headers = useHeaders()
  const {t} = useTranslation()  
  
  // ** States
  const [currentMain, setCurrentMain] = useState({value: 'between_date', label: t('Between date')})
  const [changeDate, setChangeDate] = useState(false)
  const [activeStatus, setActiveStatus] = useState(null)
  const [bannedStatus, setBannedStatus] = useState(null)
  const [deletedStatus, setDeletedStatus] = useState(null)
  const [roleId, setRoleId] = useState(null)
  const updateFilter = (key, value, label) => {
    setFiltersArr(prev => [...prev.filter(filter => filter.key !== key), { value, label, key }]
    )
  }

  const handleDelete = (filterToDelete) => () => {
    setFiltersArr((filters) => filters.filter((filter) => filter.value !== filterToDelete.value))
  }

  const handleResetFilters = () => {
    setFiltersArr([])
    setActiveStatus(null)
    setBannedStatus(null)
    setDeletedStatus(null)
    setRoleId(null)
    setDate(new Date())
    setChangeDate(false)
  }

  // Function to remove filter by Key
  const removeFilterByKey = (keyToRemove) => {
    setFiltersArr(prevFiltersArr => prevFiltersArr.filter(filter => filter.key !== keyToRemove))
  } 
  useEffect(() => {
    if (trader) {
        removeFilterByKey('trader')
      }
  }, [trader])
  useEffect(() => {
    if (changeDate) {
      removeFilterByKey('date')
      removeFilterByKey('range')
      setFiltersArr(prevFiltersArr => [
        ...prevFiltersArr,
        {
          value: `&start_date=${DateTimeService(date)}&end_date=${DateTimeService(date)}`,
          label: DateTimeService(date),
          key: 'date'
        }
      ])
    } else if (Array.isArray(date)) {
      removeFilterByKey('date')
      removeFilterByKey('range')
      setFiltersArr(prevFiltersArr => [
        ...prevFiltersArr,
        {
          value: `&start_date=${DateTimeService(date[0], false)}&end_date=${DateTimeService(date[1], false)}`,
          label: `${DateTimeService(date[0], false)} to ${DateTimeService(date[1], false)}`,
          key: 'range'
        }
      ])
    }
  }, [date])

  useEffect(() => {
    const responseFilterArr = filtersArr.map(filter => filter.value).join('')
    setCurrentPage(1)
    // Make sure we're not overriding pagination settings
    let filterOptions = responseFilterArr
    
    // If no page is specified in filters, add page=1
    if (!filtersArr.some(f => f.key === 'page')) {
      filterOptions += '&page=1'
    }
    
    // If no per_page is specified in filters, add per_page=15
    if (!filtersArr.some(f => f.key === 'per_page')) {
      filterOptions += '&per_page=15'
    }
    
    theFinction({
      headers,
      filterOptions
    })
  }, [filtersArr])


  // ** filter options
  const mainOptions = [{ value: 'between_date', label: t('Between date') }]

  const displayFileds = () => {
    switch (currentMain.value) {
      case 'between_date':
        return (
          <>
          <Col md='4'>
            <RangePicker label={`${t('Select range')}:`} value={date} setValue={setDate}/>
          </Col>
          </>
        )
        default:
          return null
    }
  }

  const handleChangeMain = () => {
    setChangeDate(false)
    setDate(new Date())
  }


  return (
    <Fragment>
    <Card style={{ width: "100%",
                   boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)",
                   borderRadius: "5px",
                   padding: "5px",
                   borderRight: "10px solid #0568a9"}}>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle tag='h4'>{t('Advanced search')}</CardTitle>
          <Button
            color="secondary"
            size="sm"
            outline
            onClick={handleResetFilters}
          >
            {t('Reset Filters')}
          </Button>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md='4'>
              <Label for='role-select'>{`${t('Search by')}:`}</Label>
              <Select
                isClearable={false}
                value={currentMain}
                options={mainOptions}
                className='react-select'
                classNamePrefix='select'
                theme={selectThemeColors}
                placeholder={`${t('Select')}...`}
                onChange={data => {
 setCurrentMain(data)
                                   handleChangeMain()
}}
              />
            </Col>
            {displayFileds()}
          </Row>
          <Row style={{direction:'ltr', display: 'flex', justifyContent: 'flex-end', marginTop:'20px',  marginRight: '-8px' }}>
            {
              filtersArr.map((el, index) => {
                if (el.label === null) return
                else return (
                  <Col md='auto' key={index} style={{ marginRight: '5px' }}>
                    <Badge
                      color="light"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid #0568a9',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '16px',
                        backgroundColor: 'white',
                        fontWeight: 500,
                        color:'#5e5873'
                      }}
                    >
                      {el.label}
                      <XCircle
                        size={18}
                        style={{ color: '#0568a9', marginLeft: '8px', cursor: 'pointer' }}
                        onClick={() => handleDelete(el)()}
                      />
                    </Badge>
                  </Col>
                )
              })
            }
          </Row>
        </CardBody>
      </Card>
        <Row>
          <Col md={4}>
          <Card style={{
                  width: "100%",
                  boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)",
                  borderRadius: "5px",
                  padding: "5px",
                  borderRight: "10px solid #0568a9"
                }}>
            <CardHeader>
              <CardTitle tag='h4'>{t('Active account?')}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className='demo-inline-spacing'>
                <Input
                  type='radio'
                  id='radio-active-all'
                  checked={activeStatus === 1}
                  onChange={() => {
                    setActiveStatus(1)
                    updateFilter('active_status', '&active_status=1', t('All'))
                  }}
                />
                <Label for='radio-active-all'>{t('All')}</Label>

                <Input
                  type='radio'
                  id='radio-active-active'
                  checked={activeStatus === 2}
                  onChange={() => {
                    setActiveStatus(2)
                    updateFilter('active_status', '&active_status=2', t('Active'))
                  }}
                />
                <Label for='radio-active-active'>{t('Active')}</Label>

                <Input
                  type='radio'
                  id='radio-active-inactive'
                  checked={activeStatus === 3}
                  onChange={() => {
                    setActiveStatus(3)
                    updateFilter('active_status', '&active_status=3', t('Inactive'))
                  }}
                />
                <Label for='radio-active-inactive'>{t('Deactivate')}</Label>
              </div>
            </CardBody>
          </Card>
          </Col>
          <Col md={4}>
          <Card style={{
                  width: "100%",
                  boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)",
                  borderRadius: "5px",
                  padding: "5px",
                  borderRight: "10px solid #0568a9"
                }}>
            <CardHeader>
              <CardTitle tag='h4'>{t('Banned account?')}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className='demo-inline-spacing'>
                <Input
                  type='radio'
                  id='radio-banned-all'
                  checked={bannedStatus === 1}
                  onChange={() => {
                    setBannedStatus(1)
                    updateFilter('banned_status', '&banned_status=1', t('All'))
                  }}
                />
                <Label for='radio-banned-all'>{t('All')}</Label>

                <Input
                  type='radio'
                  id='radio-banned-banned'
                  checked={bannedStatus === 2}
                  onChange={() => {
                    setBannedStatus(2)
                    updateFilter('banned_status', '&banned_status=3', t('Banned'))
                  }}
                />
                <Label for='radio-banned-banned'>{t('Banned')}</Label>

                <Input
                  type='radio'
                  id='radio-banned-inactive'
                  checked={bannedStatus === 3}
                  onChange={() => {
                    setBannedStatus(3)
                    updateFilter('banned_status', '&banned_status=2', t('Un Banned'))
                  }}
                />
                <Label for='radio-banned-inactive'>{t('Un Banned')}</Label>
              </div>
            </CardBody>     
          </Card>
          </Col>

          <Col md={4}>
          <Card style={{
                  width: "100%",
                  boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)",
                  borderRadius: "5px",
                  padding: "5px",
                  borderRight: "10px solid #0568a9"
                }}>
            <CardHeader>
              <CardTitle tag='h4'>{t('Deleted account?')}</CardTitle>
            </CardHeader>
            <CardBody>                
              <div className='demo-inline-spacing'>
                <Input
                  type='radio'
                  id='radio-banned-all'
                  checked={deletedStatus === 1}
                  onChange={() => {
                    setDeletedStatus(1)
                    updateFilter('deleted_status', '&deleted_status=1', t('All'))
                  }}
                />
                <Label for='radio-banned-all'>{t('All')}</Label>

                <Input
                  type='radio'
                  id='radio-banned-banned'
                  checked={deletedStatus === 2}
                  onChange={() => {
                    setDeletedStatus(2)
                    updateFilter('deleted_status', '&deleted_status=2', t('Deleted'))
                  }}
                />
                <Label for='radio-deleted'>{t('Deleted')}</Label>

                <Input
                  type='radio'
                  id='radio-deleted-inactive'
                  checked={deletedStatus === 3}
                  onChange={() => {
                    setDeletedStatus(3)
                    updateFilter('deleted_status', '&deleted_status=3', t('Undeleted'))
                  }}
                />
                <Label for='radio-deleted-inactive'>{t('Undeleted')}</Label>
              </div>
            </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
          <Card style={{
                  width: "100%",
                  boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)",
                  borderRadius: "5px",
                  padding: "5px",
                  borderRight: "10px solid #0568a9"
                }}>
            <CardHeader>
              <CardTitle tag='h4'>{t('User Role')}</CardTitle>
            </CardHeader>
            <CardBody>                
              <div className='demo-inline-spacing'>
                <Input
                  type='radio'
                  id='radio-role-all'
                  checked={roleId === 1}
                  onChange={() => {
                    setRoleId(1)
                    removeFilterByKey('role_id')
                  }}
                />
                <Label for='radio-role-all'>{t('All')}</Label>

                <Input
                  type='radio'
                  id='radio-role-teacher'
                  checked={roleId === 2}
                  onChange={() => {
                    setRoleId(2)
                    updateFilter('role_id', '&role_id=3', t('Teacher'))
                  }}
                />
                <Label for='radio-role-teacher'>{t('Teacher')}</Label>

                <Input
                  type='radio'
                  id='radio-role-student'
                  checked={roleId === 3}
                  onChange={() => {
                    setRoleId(3)
                    updateFilter('role_id', '&role_id=5', t('Student'))
                  }}
                />
                <Label for='radio-role-student'>{t('Student')}</Label>

                <Input
                  type='radio'
                  id='radio-role-parent'
                  checked={roleId === 4}
                  onChange={() => {
                    setRoleId(4)
                    updateFilter('role_id', '&role_id=4', t('Parent'))
                  }}
                />
                <Label for='radio-role-parent'>{t('Parent')}</Label>
              </div>
            </CardBody>
            </Card>
          </Col>
        </Row>
        </Fragment>
  )
}

export default UserFilter
