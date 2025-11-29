// ** React Imports
import { Fragment, useEffect } from 'react'

// ** Third Party Components
import * as Icon from 'react-feather'

// ** Reactstrap Imports
import { NavItem, NavLink } from 'reactstrap'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { getBookmarks } from '@store/navbar'

const NavbarBookmarks = props => {
  // ** Props
  const { setMenuVisibility } = props

  // ** Store Vars
  const dispatch = useDispatch()

  // ** ComponentDidMount
  useEffect(() => {
    dispatch(getBookmarks())
  }, [])

  return (
    <Fragment>
      <ul className='navbar-nav d-xl-none'>
        <NavItem className='mobile-menu me-auto'>
          <NavLink className='nav-menu-main menu-toggle hidden-xs is-active' onClick={() => setMenuVisibility(true)}>
            <Icon.Menu className='ficon' />
          </NavLink>
        </NavItem>
      </ul>
    </Fragment>
  )
}

export default NavbarBookmarks
