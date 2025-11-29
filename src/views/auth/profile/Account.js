// ** Reactstrap Imports
import { Row } from 'reactstrap'

// ** User View Components
import AccountUpdate from './AccountTabContent'
// ** Styles
import '@styles/react/apps/app-users.scss'
const AccountTab = ({data, setIsChanged}) => {
  return (
    <div className='app-user-view'>
      <Row>
        <AccountUpdate data={data} setIsChanged={setIsChanged}/>
      </Row>
    </div>
  )
}
export default AccountTab
