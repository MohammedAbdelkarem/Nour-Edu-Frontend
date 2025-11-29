// ** React Imports
import { Fragment } from 'react'

// ** Reactstrap Imports
import { Label } from 'reactstrap'

// ** Third Party Components
import Flatpickr from 'react-flatpickr'

// ** Arabic file
import {Arabic} from  'flatpickr/dist/l10n/ar.js';

const RangePicker = ({value, setValue, label}) => {
  return (
    <Fragment>
      <Label className='form-label' for='range-picker'>{label}</Label>
      <Flatpickr
        value={value}
        id='range-picker'
        className='form-control'
        onChange={date => setValue(date)}
        options={{
          mode: 'range',
          locale:{
            ...Arabic
          }
        }}
      />
    </Fragment>
  )
}

export default RangePicker
