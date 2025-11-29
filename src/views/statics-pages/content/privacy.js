// ** Reactstrap Imports
import { Button, Card, CardBody, CardHeader, Nav, NavItem, NavLink, Row, Spinner } from 'reactstrap'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

// ** Components
import EditorStatic from '../../components/editor'

// ** Third Party Components
import { convertToRaw } from 'draft-js'
import { Check, Edit, RotateCw } from 'react-feather'
import { useManagementMutation } from '../../../redux/rtkQuery/statics-pages/privacy'
import useHeaders from '../../../utility/hooks/useHeaders'
import draftToHtml from 'draftjs-to-html'
import SuccessAlert from '../../components/handleStatusCode/success'
import ErrorAlert from '../../components/handleStatusCode/error'
const PrivacyPolices = ({data, setIsUpdate}) => {
  const headers = useHeaders()
  const {t} = useTranslation()
  const [update, {isLoading, status, error}] = useManagementMutation()
  const [isEdit, setIsEdit] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  
  useEffect(() => {
    if (data?.data?.length > 0) {
      const item = data.data[0]
      const content = item?.text || ''
      console.log('Setting HTML content:', content) // Debug log
      setHtmlContent(content)
    }
  }, [data])

  const handleEditorChange = useCallback((editorState) => {
    try {
      if (!editorState || !editorState.getCurrentContent) {
        console.warn('Invalid editor state received')
        return
      }
      const rawContent = convertToRaw(editorState.getCurrentContent())
      const html = draftToHtml(rawContent)
      setHtmlContent(html)
    } catch (error) {
      console.error('Error converting editor content:', error)
      setHtmlContent('')
    }
  }, [])

  const handleSubmit = () => {
    const body = {
      text: htmlContent,
      lang: 'ar'
    }
    update({ body, headers })
  }
  useMemo(() => {
    if (status === 'fulfilled') {
      SuccessAlert({ title: 'تم الحفظ بنجاح' })
      setIsEdit(false)
      setIsUpdate(true)
      setTimeout(() => {
        setIsUpdate(false)
      }, 500)
    } else if (status === 'rejected') {
      ErrorAlert({ title: 'فشل الحفظ', body: error?.message || 'حدث خطأ ما', button:t('Done') })
    }
  }, [status])
  return (
       <Row>
      <Card>
        <CardHeader>
          <Nav className="d-flex justify-content-center" tabs>
            <h3>{t('Privacy policies')}</h3>
{/* 
            <NavItem>
              <NavLink active={active === '1'} onClick={() => setActive('1')}>
                {t('Arabic')}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink active={active === '2'} onClick={() => setActive('2')}>
                {t('English')}
              </NavLink>
            </NavItem> */}
          </Nav>
          {isEdit ? (
            <div className="d-flex gap-1">
              <Button.Ripple color="flat-primary" onClick={handleSubmit}>
              {
                isLoading ? <Spinner size={'sm'}/> : <>
                <Check size={14} />
                <span className="align-middle ms-25">{t('Save changes')}</span>
                </>
              }
              </Button.Ripple>
              <Button.Ripple
                color="flat-danger"
                onClick={() => {
                  setIsEdit(false)
                }}
              >
                <RotateCw size={14} />
                <span className="align-middle ms-25">{t('Undo')}</span>
              </Button.Ripple>
            </div>
          ) : (
            <Button.Ripple color="flat-primary" onClick={() => setIsEdit(true)}>
              <Edit size={14} />
              <span className="align-middle ms-25">{t('Edit')}</span>
            </Button.Ripple>
          )}
        </CardHeader>
        <CardBody>
          
          <div>
            <EditorStatic 
              defaultState={htmlContent} 
              isEdit={isEdit} 
              onChange={handleEditorChange} 
            />
          </div>
        </CardBody>
      </Card>
    </Row>
  )
}

export default PrivacyPolices
