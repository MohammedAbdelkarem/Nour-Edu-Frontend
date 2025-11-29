import {
  Container,
  Row,
  Col,
  Progress,
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle
} from "reactstrap"

const StarIcons = ({ count }) => {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= count ? "#f7c948" : "#ccc" }}>
        ★
      </span>
    );
  }
  return <span>{stars}</span>;
};


const RatingsComponent = ({ratingsData, reviewsData, isStore}) => {
  return (
    <Card className="profile-header mb-2 p-2"
          style={{
                width: "100%",
                boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)",
                borderRadius: "5px",
                padding: "5px",
                borderRight: "10px solid #0568a9"
            }}
            >
     <CardBody>
        <CardTitle
            tag="h5"
            className="fw-bold mb-2"
            style={{ color: "#000", fontSize: "19px" }}
            >
            {("استعراض التقييمات والمراجعات")}
        </CardTitle>
        <hr />
      <div className="mb-3">
        <span>{` التقييمات ${reviewsData?.length} `}</span>
      </div>
        

      {/* Progress Bars */}
      {isStore && ratingsData
        ?.slice()
        ?.reverse()
        ?.map((item) => (
          <Row className="align-items-center mb-2" key={item?.rate}>
            <Col xs="2">{item?.rate} نجوم</Col>
            <Col xs="8">
              <Progress value={item?.percentage} color="warning" />
            </Col>
            <Col xs="2" className="text-muted">
              {item?.count}
            </Col>
          </Row>
        ))}

      {/* Reviews */}
      {reviewsData?.map((review) => (
        <Card className="my-3" key={review?.id}>
          <CardBody>
            <Row>
              <Col xs="2">
                <img
                  src={review?.craeted_by_img}
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px" }}
                />
              </Col>
              <Col xs="10">
                <CardTitle tag="h6">{review?.craeted_by_name}</CardTitle>
                <StarIcons count={review?.rate} />
                <CardText className="text-muted small">{review?.created_at}</CardText>
                <CardText>{review?.text}</CardText>

                {review?.media.length > 0 && (
                  <Row>
                    {review?.media.map((img, index) => (
                      <Col xs="4" key={index} className="mb-2">
                        <CardImg
                          top
                          width="100%"
                          src={`http://127.0.0.1:8000/${img.media_url}`}
                          alt={`review-${index}`}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </Col>
            </Row>
          </CardBody>
        </Card>
      ))}
      </CardBody>
    </Card>
  )
}

export default RatingsComponent
