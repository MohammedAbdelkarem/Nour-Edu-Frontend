// ** React Imports
import { Fragment } from 'react'

// ** Third Party Components
import Cleave from 'cleave.js/react'

const DateMask = ({ value, onChange }) => {
  const options = { date: true, delimiter: '-', datePattern: ['Y', 'm', 'd'] }
  return (
    <Fragment>
      <Cleave className='form-control' value={value} placeholder='2001-01-01' options={options} id='date' onChange={onChange} />
    </Fragment>
  )
}

export default DateMask
