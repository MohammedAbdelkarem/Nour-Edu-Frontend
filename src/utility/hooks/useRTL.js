//** React Imports
import { useEffect } from 'react'

// ** Store & Actions
import { handleRTL } from '@store/layout'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'

export const useRTL = () => {
  // ** Store Vars
  const { i18n } = useTranslation()
  
  const dispatch = useDispatch()
  const isRtl = i18n.language === 'ar'
  console.log('isRtl',isRtl);
  

  // ** Return a wrapped version of useState's setter function
  const setValue = value => {
    dispatch(handleRTL(value))
  }

  useEffect(() => {
    // ** Get HTML Tag
    const element = document.getElementsByTagName('html')[0]

    // ** If isRTL then add attr dir='rtl' with HTML else attr dir='ltr'
    if (isRtl) {
      element.setAttribute('dir', 'rtl')
    } else {
      element.setAttribute('dir', 'ltr')
    }
  }, [isRtl])

  return [isRtl, setValue]
}
