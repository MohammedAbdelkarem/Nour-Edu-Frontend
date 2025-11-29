import { useTranslation } from "react-i18next"

export default function useHeaders() {
    const token = localStorage.getItem('token')    
    const {i18n} = useTranslation()
    return {
        Accept:'application/json',
        Authorization: `Bearer ${token}`,
        'x-lang': i18n.language
    }
}