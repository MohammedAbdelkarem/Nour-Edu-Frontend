// ** React Imports
import * as React from 'react'
import { useTranslation } from 'react-i18next'

// ** Reactstrap Imports
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Row, Col, Spinner } from 'reactstrap'

// ** services
import StatusService from '../../../services/statusService'

export default function SystemModal({ show, setShow, title, onReomve, children, isRemoving, status, message, disabled }) {
  const {t} = useTranslation()
  // ** Call status service
  React.useMemo(() => {
    if (status) {
      const statusService = new StatusService()
      statusService.handleStatusChange(status, message, t('Done'), t('Failed'), setShow)
    }
  }, [status])

  return (
    <div className={`theme-${'modal-primary'}`}>
        <Modal
          isOpen={show}
          toggle={() => setShow(!show)}
          className='modal-dialog-centered'
          modalClassName={'modal-dark'}>
          <ModalHeader toggle={() => setShow(!show)}>{t(title)}</ModalHeader>
          <ModalBody>{children}</ModalBody>
          <ModalFooter style={{justifyContent:'center'}}>
            <Row>
                <Col md={7}>
                    <Button size='sm' color={'primary'} onClick={onReomve} style={{marginLeft:'50px'}} disabled={isRemoving || disabled}>
                      {isRemoving ? <Spinner size='sm' color='light'/> : t('Submit')}
                    </Button>
                </Col>
                <Col md={5}>
                    <Button size='sm' color='secondary' outline onClick={() => setShow(!show)}>
                    {t('Discard')}
                    </Button>
                </Col>
            </Row>
          </ModalFooter>
        </Modal>
      </div>
  )
}