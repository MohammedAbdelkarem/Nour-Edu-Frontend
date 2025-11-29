// ** Reactstrap Imports
import { Card, CardBody, CardText, Button } from 'reactstrap'

const CardMedal = () => {
  return (
    <Card className='card-congratulations-medal'>
      <CardBody>
        <h5>Congratulations 🎉 John!</h5>
        <CardText className='font-small-3'>You have won gold medal</CardText>
        <h3 className='mb-75 mt-2 pt-50'>
          <a href='/' onClick={e => e.preventDefault()}>
            $48.9k
          </a>
        </h3>
        <Button color='primary'>View Sales</Button>
      </CardBody>
    </Card>
  )
}

export default CardMedal
