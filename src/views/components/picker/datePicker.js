// ** React Imports
import { Fragment } from 'react'

// ** Reactstrap Imports
import { Label } from 'reactstrap'

// ** Third Party Components
import Flatpickr from 'react-flatpickr'

// ** Arabic file
import {Arabic} from  'flatpickr/dist/l10n/ar.js'

const DatePicker = ({label, value, setValue, setChangeDate}) => {
    return (
    <Fragment>
      <Label className='form-label' for='default-picker'>{label}</Label>
      <Flatpickr id='default-picker'
                 className='form-control'
                 value={value}
                 options={{
                  locale:{
                    ...Arabic
                  }}}
                 onChange={date => {
setValue(date)
                  if (setChangeDate !== undefined) {
                    setChangeDate(true)
                  }
}}
                />
    </Fragment>
  )
}

export default DatePicker
