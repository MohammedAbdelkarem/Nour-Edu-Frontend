import { Moon, Sun } from "react-feather";
export default function DateTimeService(dateString, withTime, withIcon) {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    let period = "ص";
    let icon = <Sun style={{width:"11px", height:'11px', color:'#f7d55d'}}/>
    if (hours >= 12) {
        period = "م";
        icon = <Moon style={{width:"11px", height:'11px', color:'#324184'}}/>
        if (hours > 12) {
            hours -= 12;
        }
    } else if (hours === 0) {
        hours = 12;
    }

    hours = String(hours).padStart(2, '0');
    if (withTime) {
        return (
            <span>
                {`${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${period}`}
                {withIcon? icon : ''}
            </span>
        );
    }else {
        return `${year}-${month}-${day}`;
    }
}
