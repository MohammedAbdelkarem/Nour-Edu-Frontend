// ** React Imports
import { useMemo, useState } from 'react'

// ** Third Party Components
import DataTable from 'react-data-table-component'
import { useTranslation } from 'react-i18next'

// ** Reactstrap Imports
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner
} from 'reactstrap'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'

// ** Assets
import defaultImage from '../../assets/images/base/logo.png'

// ** Store & Hooks
import {
  useCitiesMutation,
  useCountriesQuery
} from '../../redux/rtkQuery/admin'
import {
  useUpdateMutation as useUpdateMediaMutation,
  useUploadMutation as useUploadMediaMutation
} from '../../redux/rtkQuery/media'

// ** Custom Components
import EmptyComponent from '../components/empty'
import SuccessAlert from '../components/handleStatusCode/success'
import ErrorAlert from '../components/handleStatusCode/error'

const Countries = () => {
  const { t } = useTranslation()

  const { data, isFetching, refetch } = useCountriesQuery()
  const countries = useMemo(() => data?.data || [], [data])

  const [fetchCities] = useCitiesMutation()
  const [uploadMedia] = useUploadMediaMutation()
  const [updateMedia] = useUpdateMediaMutation()

  const [citiesCache, setCitiesCache] = useState({})
  const [loadingCitiesId, setLoadingCitiesId] = useState(null)
  const [uploadingId, setUploadingId] = useState(null)

  const handleExpand = async (isExpanded, country) => {
    if (!isExpanded || citiesCache[country.id]) return
    setLoadingCitiesId(country.id)
    try {
      const response = await fetchCities({ id: country.id }).unwrap()
      const cityList = response?.data || []
      setCitiesCache(prev => ({
        ...prev,
        [country.id]: cityList
      }))
    } catch (error) {
      ErrorAlert({
        title: t('Failed'),
        body: error?.data?.message || t('Unable to load cities right now'),
        button: t('Done')
      })
    } finally {
      setLoadingCitiesId(null)
    }
  }

  const handleFlagChange = async (country, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingId(country.id)

    try {
      const formData = new FormData()
      formData.append('images[]', file)

      const existingMedia = country?.media || country?.image

      if (existingMedia?.id) {
        formData.append('_method', 'PUT')
        await updateMedia({
          id: existingMedia.id,
          body: formData
        }).unwrap()
      } else {
        formData.append('context_type', 'Country')
        formData.append('context_id', country.id)
        await uploadMedia({
          body: formData
        }).unwrap()
      }

      SuccessAlert({
        title: t('Success'),
        body: t('Country media has been updated'),
        position: 'top-left'
      })
      refetch()
    } catch (error) {
      ErrorAlert({
        title: t('Failed'),
        body: error?.data?.message || t('Unable to update media right now'),
        button: t('Done')
      })
    } finally {
      if (event?.target) {
        event.target.value = ''
      }
      setUploadingId(null)
    }
  }

  const renderCities = ({ data: country }) => {
    if (loadingCitiesId === country.id) {
      return (
        <div className='p-2 d-flex align-items-center gap-1'>
          <Spinner size='sm' />
          <span>{t('Loading cities...')}</span>
        </div>
      )
    }

    const cities = citiesCache[country.id]

    if (!cities) {
      return (
        <div className='p-2 text-muted'>
          {t('Expand the row to load the cities list.')}
        </div>
      )
    }

    if (!cities.length) {
      return (
        <div className='p-2 text-muted'>
          {t('No cities available for this country.')}
        </div>
      )
    }

    return (
      <CardBody className='pt-0'>
        <Row className='g-2'>
          {cities.map(city => (
            <Col lg='4' md='6' sm='6' xs='12' key={city.id}>
              <div className='border rounded p-1 h-100'>
                <h6 className='mb-25'>{city?.name || t('Unnamed city')}</h6>
                {city?.code || city?.zip_code ? (
                  <Badge color='light-primary'>
                    {city?.code || city?.zip_code}
                  </Badge>
                ) : (
                  <small className='text-muted'>{t('No code provided')}</small>
                )}
              </div>
            </Col>
          ))}
        </Row>
      </CardBody>
    )
  }

  const columns = [
    {
      name: t('#'),
      width: '70px',
      cell: (row, index) => <span>{index + 1}</span>
    },
    {
      name: t('Flag'),
      minWidth: '140px',
      cell: row => (
        <img
          src={row?.media?.url || row?.image?.url || defaultImage}
          alt={row?.name || 'country flag'}
          style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
        />
      )
    },
    {
      name: t('Country'),
      minWidth: '240px',
      cell: row => (
        <div className='d-flex flex-column'>
          <span className='fw-bold text-capitalize'>{row?.name || t('Unnamed country')}</span>
          <small className='text-muted'>
            {row?.code || row?.iso_code || row?.country_code || t('No code provided')}
          </small>
        </div>
      )
    },
    {
      name: t('Cities'),
      minWidth: '120px',
      cell: row => {
        const cachedCount = citiesCache[row.id]?.length
        const displayCount = row?.cities_count ?? cachedCount ?? '-'
        return (
          <span className='fw-bold'>
            {displayCount}
          </span>
        )
      }
    },
    {
      name: t('Media'),
      minWidth: '220px',
      cell: row => (
        <div className='d-flex align-items-center gap-1'>
          <Button
            tag='label'
            color='primary'
            outline
            size='sm'
            disabled={uploadingId === row.id}
            className='mb-0'
          >
            {uploadingId === row.id ? (
              <Spinner size='sm' />
            ) : (
              (row?.media?.id || row?.image?.id) ? t('Update image') : t('Upload image')
            )}
            <input
              type='file'
              accept='image/*'
              hidden
              onChange={event => handleFlagChange(row, event)}
            />
          </Button>
        </div>
      )
    }
  ]

  return (
    <Card
      className='overflow-hidden'
      style={{
        width: '100%',
        boxShadow: '0 8px 10px rgb(56, 182, 255, 0.2)',
        borderRadius: '5px',
        padding: '5px',
        borderRight: '10px solid #0568a9'
      }}
    >
      <CardHeader className='pb-0'>
        <CardTitle tag='h4'>{t('Countries')}</CardTitle>
        <p className='text-muted mb-0'>
          {t('Manage countries, their cities, and update their media assets.')}
        </p>
      </CardHeader>
      <CardBody>
        <div className='react-dataTable'>
          <DataTable
            noHeader
            responsive
            columns={columns}
            data={countries}
            progressPending={isFetching}
            highlightOnHover
            pointerOnHover
            expandableRows
            expandableRowsComponent={renderCities}
            onRowExpandToggled={handleExpand}
            noDataComponent={
              <EmptyComponent
                title={t('No countries found')}
                body={t('Once countries are available they will appear here.')}
              />
            }
          />
        </div>
      </CardBody>
    </Card>
  )
}

export default Countries

