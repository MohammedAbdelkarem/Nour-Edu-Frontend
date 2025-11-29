// ** React Imports
import { Fragment } from 'react'

// ** Third Party Components
import Cleave from 'cleave.js/react'

const FormattingMask = ({defaultValue, onChange, mask}) => {
  const options = { numeral: true, numeralThousandsGroupStyle: 'thousand' }

  return (
    <Fragment>
      <Cleave placeholder={mask} className='form-control' options={options} id='numeral-formatting' value={defaultValue} onChange={onChange} />
    </Fragment>
  )
}

export default FormattingMask
