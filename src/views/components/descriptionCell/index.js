import { useState } from "react"
import { Tooltip } from "reactstrap"

const DescriptionCell = ({ row, text, number }) => {
    const [tooltipOpen, setTooltipOpen] = useState(false)
    const toggle = () => setTooltipOpen(!tooltipOpen)
  
    const description = text || ''
    const truncatedDesc = description.length > number ? `${description.slice(0, number)}...` : description
    const hasTooltip = description.length > number
  
    return (
      <>
        <span id={`descTooltip-${row.id}`} style={{ cursor: hasTooltip ? 'pointer' : 'default' }}>
          {truncatedDesc}
        </span>
        {hasTooltip && (
          <Tooltip 
            isOpen={tooltipOpen} 
            toggle={toggle} 
            target={`descTooltip-${row.id}`}
          >
            {description}
          </Tooltip>
        )}
      </>
    )
  }
  
  export default DescriptionCell