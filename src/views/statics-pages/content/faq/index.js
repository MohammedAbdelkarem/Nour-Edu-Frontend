// ** Reactstrap Imports
import { Fragment, useState } from 'react'

// ** Demo Components
import Faqs from './Faqs'

// ** Styles
import '@styles/base/pages/page-faq.scss'

const Faq = () => {
  const [selected, setSelected] = useState(null)

  return (
    <Fragment>
      <Faqs setSelected={setSelected} selected={selected} />
    </Fragment>
  )
}

export default Faq
