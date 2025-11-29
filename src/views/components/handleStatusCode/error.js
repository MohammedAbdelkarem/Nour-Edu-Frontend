// ** Translation import
import { t } from "i18next"

// ** Third Party Components
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

const ErrorAlert = ({title, body, button}) => {
    return MySwal.fire({
        title: t(title),
        customClass: {
            confirmButton: 'btn btn-primary'
        },
        showClass: {
            popup: 'animate__animated animate__flipInX'
        },
        buttonsStyling: false,
        confirmButtonText: t(button),
        text: t(body)
    })
}

export default ErrorAlert