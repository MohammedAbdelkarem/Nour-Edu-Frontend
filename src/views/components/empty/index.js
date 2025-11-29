import { Search } from "react-feather"

const EmptyComponent = ({title, body, button}) => (
  <div className="no-data-message text-center mt-5">
      <Search size={35} style={{color:'#0568a9'}}/>
      <h1 className='mt-1' style={{ color:"#0568a9",
                                    fontSize:'30px',
                                    backgroundSize: '15% 8px', 
                                    backgroundImage: 'linear-gradient(to left, transparent 0%, rgb(38, 132, 87) 200%)',
                                    backgroundPosition: 'bottom',
                                    backgroundRepeat: 'no-repeat'}}>{title}</h1>
      <p className='mb-3 mt-2' style={{fontSize:'20px'}}>{body}</p>
      {button}
  </div>
)

export default EmptyComponent