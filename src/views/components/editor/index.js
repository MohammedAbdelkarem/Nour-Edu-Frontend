import { useEffect, useState } from 'react'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, ContentState } from 'draft-js'
import htmlToDraft from 'html-to-draftjs'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

const EditorStatic = ({ defaultState, isEdit, onChange }) => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty())
  const [isDirty, setIsDirty] = useState(false) 

  useEffect(() => {
    if (defaultState && !isDirty) {
      try {
        const blocksFromHtml = htmlToDraft(defaultState)
        if (blocksFromHtml && blocksFromHtml.contentBlocks && Array.isArray(blocksFromHtml.contentBlocks)) {
          const contentState = ContentState.createFromBlockArray(
            blocksFromHtml.contentBlocks,
            blocksFromHtml.entityMap || {}
          )
          setEditorState(EditorState.createWithContent(contentState))
        } else {
          console.warn('Invalid content blocks from HTML')
          setEditorState(EditorState.createEmpty())
        }
      } catch (error) {
        console.error('Error parsing HTML to Draft:', error)
        setEditorState(EditorState.createEmpty())
      }
    }
  }, [defaultState, isDirty])

  const onEditorStateChange = (newEditorState) => {
    try {
      if (!newEditorState) return
      if (!isDirty) setIsDirty(true) 
      setEditorState(newEditorState)
      if (onChange) onChange(newEditorState)
    } catch (error) {
      console.error('Error updating editor state:', error)
    }
  }

  return (
    <Editor
      editorState={editorState}
      onEditorStateChange={onEditorStateChange}
      readOnly={!isEdit}
      toolbarHidden={!isEdit}
    />
  )
}

export default EditorStatic
