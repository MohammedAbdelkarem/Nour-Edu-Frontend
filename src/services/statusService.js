// ** Third Party Components
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

// ** Translation
import {t} from 'i18next'

export default class StatusService {
    handleFulfilled(message, button) {
        return MySwal.fire({
            title:`<p style="font-size: 19px">${t('Success')}</p>`,
            customClass: {
            confirmButton: 'btn btn-primary'
            },
            showClass: {
            popup: 'animate__animated animate__fadeIn'
            },
            buttonsStyling: false,
            confirmButtonText: t(button),
            text: message
        })
    }

    handleRejectedArray(message, button, failedMessage) {
        const listItems = message.map(item => `<li style="font-size: 14px; list-style-type: none;">${item}</li>`).join('');

        return MySwal.fire({
            title:`<p style="font-size: 19px">${t(failedMessage)}</p>`,
            customClass: {
                confirmButton: 'btn btn-primary',
              },
            showClass: {
              popup: 'animate__animated animate__tada'
            },
            buttonsStyling: false,
            confirmButtonText: t(button),
            html: `<ul>${listItems}</ul>`
        })
    }

    handleRejected(message, button, failedMessage) {
      return MySwal.fire({
          title:`<p style="font-size: 19px">${t(failedMessage)}</p>`,
          customClass: {
          confirmButton: 'btn btn-primary'
          },
          showClass: {
            popup: 'animate__animated animate__tada'
          },
          buttonsStyling: false,
          confirmButtonText: t(button),
          text: message
      })
    }
  
    handleStatusChange(status, message, button, failedMessage, setShow ) {
      if (status === 'fulfilled') {
        if(setShow!==null && setShow!==undefined){
          setShow(false)
        }
      } 
       if (status === 'rejected') {
        if(Array.isArray(message)){
          this.handleRejectedArray(message, button, failedMessage);
          if(setShow!==null && setShow!==undefined){
            setShow(false)
          }
        }
        else{
          this.handleRejected(message, button, failedMessage);
          if(setShow!==null && setShow!==undefined){
            setShow(false)
          }
        }
      }
    }
  }
