
import logo from '@src/assets/images/base/logo.png'

// ** Third Party Components
import toast from 'react-hot-toast'

// ** Translation import
import { t } from "i18next"

const SuccessAlert = ({title, body, position}) => {
    return toast(
        (
          <div className='w-100 d-flex align-items-center justify-content-between'>
            <div className='d-flex align-items-center'>
              <img src={logo} width={40} height={40} style={{marginLeft:'20px'}}/>
              <div>
                <p className='mb-0'>{t(title)}</p>
                <small style={{fontSize:'13px'}}>{`${t(body)}`}</small>
              </div>
            </div>
          </div>
        ),
        { position },
        { style: { width: '600px' }}
      )
    }

export default SuccessAlert