// ** Dropdowns Imports
import IntlDropdown from './IntlDropdown'
import UserDropdown from './UserDropdown'

// ** Reactstrap Imports
import { NavItem } from 'reactstrap'

const NavbarUser = () => {
  return (
    <ul className='nav navbar-nav align-items-center ms-auto'>
      <IntlDropdown />
      <NavItem className='d-none d-lg-block'>
      </NavItem>
      <UserDropdown />
    </ul>
  )
}

export default NavbarUser
