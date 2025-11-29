// ** Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Reactstrap Imports
import { Badge, Button, Input, Label } from 'reactstrap'
import { useTranslation } from 'react-i18next'

const Sidebar = props => {
  // ** Props
  const { sidebarOpen, types, status, onFilterChange, filters } = props
  const {t} = useTranslation()
  console.log('filters',filters);
  
  return (
    <div className={classnames('sidebar-left', { show: sidebarOpen })}>
      <div className='sidebar'>
        <div className='sidebar-content email-app-sidebar'>
          <div className='email-app-menu'>
            <PerfectScrollbar className='sidebar-menu-list' options={{ wheelPropagation: false }}>
              <h6 className='section-label mt-3 mb-1 px-2'>{t('Types')}</h6>
              <ul className='list-unstyled categories-list'>
                  {types.map(item => {
                    return (
                      <li key={item.key} style={{margin:'10px', padding:'10px'}}>
                        <div className='form-check'>
                          <Input
                            type='radio'
                            id={item.key}
                            name='item-radio'
                            checked={filters.type === item.key}
                            onChange={() => onFilterChange({ type: item.key })}
                          />
                          <Label className='form-check-label'
                                 style={{fontSize:'15px'}}
                                 for={item.key}>
                            {item.value}
                          </Label>
                        </div>
                      </li>
                    )
                  })}
                </ul>
               <h6 className='section-label mt-3 mb-1 px-2'>{t('Status')}</h6>
               <ul className='list-unstyled categories-list'>
                  {status.map(item => {
                    return (
                      <li key={item.key} style={{margin:'10px', padding:'10px'}}>
                        <div className='form-check'>
                          <Input
                            type='radio'
                            id={item.key}
                            name='item-radio'
                            checked={filters.status === item.key}
                            onChange={() => onFilterChange({ status: item.key })}
                          />
                          <Badge color={item.key === 'pending' ? 'light-warning' : 'light-danger' }
                                 className='form-check-label'
                                 style={{fontSize:'13px'}}
                                 for={item.key}>
                            {item.value}
                          </Badge>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div id='clear-filters'  className='p-1'>
                  <Button color='primary' block onClick={() => onFilterChange({ type: '', status: '' })}>
                    {t('Clear All Filters')}
                  </Button>
                </div>
            </PerfectScrollbar>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar