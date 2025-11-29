import './spinner.css'
import logo from '@src/assets/images/base/logo-h.png'
const ComponentSpinner = () => {
  return (
   <div className='fallback-spinner app-loader'>
      <img src={logo} style={{width: '600px', height: 'auto'}}/>
      <span class="loader"></span>
   </div>
  )
}
export default ComponentSpinner