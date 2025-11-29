// ** Navigation imports
import content from '../horizontal/content'
import dashboards from '../horizontal/dashboards'
import service from '../horizontal/service'
import statics from '../horizontal/statics'
import users from '../horizontal/users'
import teachers from '../horizontal/teachers'
import hierarchicalContent from '../horizontal/hierarchical-content'
import transactions from '../horizontal/transactions'
import sellPoints from '../horizontal/sell-points'
import versionManagement from '../horizontal/version-management'
    
// ** Merge & Export
export default [...dashboards, ...statics, ...content, ...users, ...service, ...teachers, ...hierarchicalContent, ...transactions, ...sellPoints, ...versionManagement]
