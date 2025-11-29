// ** React Imports
import { useRef, useState, useEffect } from 'react'

// ** Custom Components
import Wizard from '@components/wizard'

// ** Steps

// ** Icons Imports
import { Clock, Command, Globe } from 'react-feather'
import Duration from './duration'
import FAQCategoies from './category'
import Countries from './countries'
import { useOverviewMutation } from '../../redux/rtkQuery/admin'
import useHeaders from '@hooks/useHeaders'

const Settings = () => {
  // ** Ref
  const ref = useRef(null)
  const headers = useHeaders()
  const [overview] = useOverviewMutation()

  useEffect(() => {
    overview({ headers })
  }, [])
  // ** State
  const [stepper, setStepper] = useState(null)

  const steps = [
    {
      id: 'country-details',
      title: 'Countries',
      icon: <Globe size={18} />,
      content: <Countries stepper={stepper}/>
    },
    {
      id: 'duration-details',
      title: 'Duration',
      icon: <Clock size={18} />,
      content: <Duration stepper={stepper}/> 
    },
    {
      id: 'category-details',
      title: 'FAQ categories',
      icon: <Command size={18} />,
      content: <FAQCategoies stepper={stepper}/> 
    }
  ]

  return (
    <div className='modern-vertical-wizard'>
      <Wizard
        type='modern-vertical'
        ref={ref}
        steps={steps}
        options={{
          linear: false
        }}
        instance={el => setStepper(el)}
      />
    </div>
  )
}

export default Settings
