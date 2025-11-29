// ** Custom Components & Plugins
import classnames from 'classnames'
import { Paperclip } from 'react-feather'

// ** Custom Component Import
import Avatar from '@components/avatar'

// ** Utils
import { htmlToString } from '@utils'
import { Badge } from 'reactstrap'
import { Link } from 'react-router-dom'

const MailCard = props => {
  // ** Props
  const {
    mail,
    handleMailClick,
    handleMailReadUpdate
  } = props

  // ** Function to handle read & mail click
  const onMailClick = () => {
    handleMailClick(mail.id)
    handleMailReadUpdate([mail.id], true)
  }
  const handleColor = () => {
    if (mail.status === 'بالانتظار') {
      return 'light-warning'
    } else if (mail.status === 'نشطة') {
      return 'light-primary'
    } else if (mail.status === 'مغلق') {
      return 'light-danger'
    }
  }
  return (
    <li onClick={() => onMailClick(mail.id)} className={classnames('d-flex user-mail', { 'mail-read': mail.isRead })}>
      <div className='mail-left pe-50 mt-2'>
        <Avatar img={mail?.user?.avatar} imgWidth={40} imgHeight={40} />
      </div>
      <div className='mail-body'>
        <div className='mail-details'>
          <div className='mail-items'>
            <Badge style={{margin:'5px'}} color={'light-primary'}> {mail.type} </Badge>
            <p>
              <Link to={`/users/profile/${mail.user.name}`} state={{id:mail.user.id}} style={{fontSize:"14px"}} className='mb-25'>{mail.user.name}</Link>
            </p>
            <h4 className='text-truncate'>{mail.title}</h4>
          </div>
          <div className='mail-meta-item'>
            {mail?.media && mail.media.length ? <Paperclip size={14} /> : null}
            <Badge style={{margin:'5px'}} color={handleColor(mail.status)}>{mail.status}</Badge>
            <span className='mail-date'>{mail.created_at}</span>
          </div>
        </div>
        <div className='mail-message'>
          <p className='text-truncate mb-0'>{htmlToString(mail.description)}</p>
        </div>
      </div>
    </li>
  )
}
export default MailCard