// ** React Imports
import { useState } from 'react'

// ** Third Party Components
import SwiperCore, { Thumbs } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

// ** Reactstrap Imports
import { Card, CardHeader, CardTitle, CardBody, CardText } from 'reactstrap'

// ** Styles
import '@styles/react/libs/swiper/swiper.scss'
import { useTranslation } from 'react-i18next'
import { Tag } from 'react-feather'

SwiperCore.use([Thumbs])

const SwiperGallery = ({ isRtl, product }) => {
  const {t} = useTranslation()
  const [thumbsSwiper, setThumbsSwiper] = useState(null)

  const params = {
    className: 'swiper-gallery',
    spaceBetween: 10,
    navigation: true,
    pagination: {
      clickable: true
    },
    thumbs: { swiper: thumbsSwiper }
  }

  const paramsThumbs = {
    className: 'gallery-thumbs',
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
    onSwiper: setThumbsSwiper
  }
  
function processPlainText(text, keyOffset = 0) {
  const phoneRegex = /(\+?\d[\d⿣⿠\-.\s]{5,}\d)/g
  const parts = []
  let lastIndex = 0
  let match
  let i = 0

  while ((match = phoneRegex.exec(text)) !== null) {
    const start = match.index
    const end = phoneRegex.lastIndex

    if (start > lastIndex) {
      parts.push(text.substring(lastIndex, start))
    }

    parts.push(
      <button
        key={`plain-${keyOffset + i}`}
        onClick={() => alert(`Call: ${match[1]}`)}
        style={{
          margin: "0 4px",
          padding: "4px 8px",
          borderRadius: "4px",
          background: "#fcd292",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        📞 {match[1]}
      </button>
    )
    lastIndex = end
    i++
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

    return parts
    }

    function parseEncodedDescription(text) {
    if (!text) return null

    const regex = /!!!#@#@!!!(.*?)!!!@#@#!!!/g
    const parts = []
    let lastIndex = 0
    let match
    let keyIndex = 0

    while ((match = regex.exec(text)) !== null) {
        const start = match.index
        const end = regex.lastIndex

        // Handle plain text before encoded part (and scan it for phone numbers)
        if (start > lastIndex) {
        const plainText = text.substring(lastIndex, start)
        parts.push(...processPlainText(plainText, keyIndex))
        }

        try {
        const parsed = JSON.parse(match[1])
        if (parsed.type === "number") {
            parts.push(
            <button
                key={`enc-${keyIndex}`}
                onClick={() => alert(`Call: ${parsed.data}`)}
                style={{
                margin: "0 4px",
                padding: "4px 8px",
                borderRadius: "4px",
                background: "#fcd292",
                color: "white",
                border: "none",
                cursor: "pointer"
                }}
            >
                📞 {parsed.data}
            </button>
            )
        } else if (parsed.type === "link") {
            const url = /^https?:\/\//.test(parsed.data)
            ? parsed.data
            : `https://${parsed.data}`
            parts.push(
            <a
                key={`enc-${keyIndex}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                color: "#4caf50",
                margin: "0 4px",
                textDecoration: "underline",
                }}
            >
                🔗 {parsed.data}
            </a>
            )
        } else {
            parts.push(match[0]) // fallback
        }
        } catch {
        parts.push(match[0]) // fallback
        }

        lastIndex = end
        keyIndex++
    }

    // Process trailing text
    if (lastIndex < text.length) {
        const remaining = text.substring(lastIndex)
        parts.push(...processPlainText(remaining, keyIndex + 100))
    }

    return parts
    }


  return (
    <Card  style = {{  width: "100%", 
                      boxShadow: "0 8px 10px rgb(0, 0, 0, 0.2)", 
                      borderRadius: "5px", 
                      padding: "5px",
                      borderTop: "7px solid #0568a9",
                      borderRight: "7px solid #0568a9"}}>
      <CardHeader>
        <CardTitle tag='h4' style={{color:'#0568a9', fontSize:'20px', fontWeight:'bold'}}>{t('Products media')}</CardTitle>
      </CardHeader>
        <hr/>
      <CardBody>
        <div className='swiper-gallery'>
          <Swiper dir={isRtl ? 'rtl' : 'ltr'} {...params}>
            {
                product?.media?.map((item) => (
                  <SwiperSlide>
                    <img src={item?.url} alt='swiper 1' style={{objectFit:'contain', width:'100%', height:'200px'}} />
                  </SwiperSlide>
                ))
            }
          </Swiper>
          <Swiper {...paramsThumbs} style={{marginTop:"20px"}}>
             {
                product?.media?.map((item) => (
                  <SwiperSlide>
                    <img src={item?.url} alt='swiper 1' style={{objectFit:'contain', width:'100%', height:'100px'}}  />
                  </SwiperSlide>
                ))
            }
          </Swiper>
        </div>
      </CardBody>
      <CardBody>
        <div className='d-flex justify-content-between align-items-center mb-1'>
            <CardTitle tag='h4' style={{ color: '#0568a9', fontSize: '20px', fontWeight: 'bold', marginBottom: 0 }}>
                {product?.name}
            </CardTitle>
            <div className='d-flex align-items-center' style={{ color: '#ff748e', fontSize: '14px', fontWeight:'bold' }}>
                <Tag className='me-1' size={16} />
                {product?.price.toLocaleString()} {product?.price_type}
            </div>
        </div>
        <CardText>
            {
                product?.has_encoded_data ? <pre style={{ whiteSpace: "pre-wrap", backgroundColor: "#eee", padding: 10 }}>
                    {parseEncodedDescription(product?.description_encoded)}
                </pre> : <pre style={{ whiteSpace: "pre-wrap", backgroundColor: "#eee", padding: 10 }}>
                    {product?.description}
                </pre>
            }
        </CardText>
      </CardBody>
    </Card>
  )
}

export default SwiperGallery
