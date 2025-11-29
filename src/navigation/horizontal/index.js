// ** Navigation imports
import content from './content'
import dashboards from './dashboards'
import service from './service'
import statics from './statics'
import teachers from './teachers'
import users from './users'
import sellPoints from './sell-points'

// ** Merge & Export
export default [...dashboards, ...statics, ...content, ...users, ...service, ...teachers, ...sellPoints]
