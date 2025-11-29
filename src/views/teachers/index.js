// ** Components
import Table from './Table'
import { useEffect } from 'react'
// ** Styles
import '@styles/react/apps/app-users.scss'
import { useOverviewMutation } from '../../redux/rtkQuery/admin'
import useHeaders from '@hooks/useHeaders'

const TeachersList = () => {
  const headers = useHeaders()
  const [overview] = useOverviewMutation()

  useEffect(() => {
    overview({headers})
  }, [])
  return (
    <div className='app-user-list'>
      <Table />
    </div>
  )
}

export default TeachersList
